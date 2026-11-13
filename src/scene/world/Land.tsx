import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { stage } from "~/stage";

// The painted world: a dawn sky, mountain ranges thinning into mist, rolling ground under grass,
// and the path the visitor travels. It is there from the first screen.

const linear = (hex: string) => new THREE.Color(hex);

/** The compass heading the picture is composed for: the ranges and the ground are squared to this view. */
export const VIEW_AZIMUTH = (26 * Math.PI) / 180;
export const SITE: [number, number, number] = [4.6, 0, 3.5];
const MIST = "#f6e3d6";

/** A point given in the picture's own frame (x across the view, z towards the viewer), in world coordinates. */
export function inFrame(x: number, y: number, z: number): [number, number, number] {
  const c = Math.cos(VIEW_AZIMUTH), s = Math.sin(VIEW_AZIMUTH);
  return [SITE[0] + x * c + z * s, y, SITE[2] - x * s + z * c];
}

export const landState = {
  uNight: { value: 0 },
};

const NOISE = /* glsl */ `
float lHash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float lNoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(lHash(i), lHash(i + vec2(1, 0)), f.x), mix(lHash(i + vec2(0, 1)), lHash(i + vec2(1, 1)), f.x), f.y);
}
float lFbm(vec2 p) {
  float a = 0.5, s = 0.0;
  for (int i = 0; i < 5; i++) { s += a * lNoise(p); p = p * 2.03 + 17.1; a *= 0.5; }
  return s;
}
`;

// The same noise on the CPU, for shaping the ground and placing what grows on it.
const hash = (x: number, y: number) => {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
};
const noise = (x: number, y: number) => {
  const ix = Math.floor(x), iy = Math.floor(y);
  let fx = x - ix, fy = y - iy;
  fx = fx * fx * (3 - 2 * fx);
  fy = fy * fy * (3 - 2 * fy);
  const a = hash(ix, iy), b = hash(ix + 1, iy), c = hash(ix, iy + 1), d = hash(ix + 1, iy + 1);
  return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
};
const fbm = (x: number, y: number, octaves = 4) => {
  let a = 0.5, s = 0;
  for (let i = 0; i < octaves; i++) {
    s += a * noise(x, y);
    x = x * 2.03 + 17.1;
    y = y * 2.03 + 17.1;
    a *= 0.5;
  }
  return s;
};
const smooth = (a: number, b: number, x: number) => {
  const u = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return u * u * (3 - 2 * u);
};

// ------------------------------------------------------------------------------------------- ground

/** How the buildings and their sheet of paper are turned within the picture. */
export const TURN = -0.5;
export const SHEET = { x: 1.5, z: 0.4, w: 31, d: 20 };
/** 1 well inside the sheet the buildings stand on, 0 outside, soft at the edge. */
export function onSheet(x: number, z: number, margin = 0): number {
  const c = Math.cos(TURN), s = Math.sin(TURN);
  const lx = x * c - z * s - SHEET.x, lz = x * s + z * c - SHEET.z;
  const d = Math.max(Math.abs(lx) - SHEET.w / 2, Math.abs(lz) - SHEET.d / 2) - margin;
  return 1 - smooth(-1.2, 0.2, d);
}
// In the picture's own frame: x runs across the view, z towards the viewer; the site is at the origin.

/** The path's x at a given z: from the viewer's feet (z 150) to the site's front (z 9). */
export function pathX(z: number): number {
  const t = Math.min(1, Math.max(0, (150 - z) / 141));
  return 3.2 - 5.4 * t + Math.sin(t * 8.5) * 2.6 * Math.sin(t * Math.PI);
}

/** Height of the ground. Flat where the buildings stand and along the path; hills rise to the sides and behind. */
export function groundHeight(x: number, z: number): number {
  const toPath = Math.abs(x - pathX(z));
  const corridor = z > 9 ? smooth(7, 46, toPath) : 1;
  const site = smooth(17, 52, Math.hypot(x, z * 1.15));
  const lift = Math.min(corridor, site);
  const rolling = Math.pow(fbm(x * 0.017 + 4.2, z * 0.017 + 9.1), 1.25) * 12;
  const back = smooth(-22, -80, z) * 5; // the land climbs a little towards the foot of the ranges
  const swell = (fbm(x * 0.09, z * 0.09, 2) - 0.5) * 0.5 * smooth(4, 16, toPath) * site;
  return lift * rolling + back * site + swell;
}

const GROUND = { width: 760, depth: 300, centreZ: 62, cols: 300, rows: 130 };

function ground(): THREE.BufferGeometry {
  const g = new THREE.PlaneGeometry(GROUND.width, GROUND.depth, GROUND.cols, GROUND.rows);
  g.rotateX(-Math.PI / 2);
  g.translate(0, 0, GROUND.centreZ);
  const pos = g.attributes.position as THREE.BufferAttribute;
  const colour = new Float32Array(pos.count * 3);
  const sward = linear("#a8b287"), scrub = linear("#95a179"), dry = linear("#cdc59a"), soil = linear("#dcc4a8"), gravel = linear("#e6dccd"), c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i);
    const h = groundHeight(x, z);
    pos.setY(i, h);
    c.copy(sward).lerp(scrub, smooth(0.35, 0.7, fbm(x * 0.03 + 3, z * 0.03 + 8, 3)));
    c.lerp(dry, smooth(3, 13, h) * 0.75 + Math.max(0, fbm(x * 0.07, z * 0.07, 2) - 0.5) * 0.5);
    const toPath = Math.abs(x - pathX(z));
    if (z > 8.5) c.lerp(soil, (1 - smooth(1.1, 2.6, toPath + (noise(x * 0.6, z * 0.6) - 0.5) * 1.4)) * 0.92);
    c.lerp(gravel, onSheet(x, z, 1.5)); // a raked court where the buildings stand
    colour.set([c.r, c.g, c.b], i * 3);
  }
  g.setAttribute("color", new THREE.BufferAttribute(colour, 3));
  g.computeVertexNormals();
  return g;
}

// -------------------------------------------------------------------------------------------- grass

const BLADES = 96000;

/** A field of blades: one ribbon, instanced, shaped and coloured in the vertex shader. */
function grass(): THREE.InstancedMesh {
  const SEG = 3;
  const pos: number[] = [], idx: number[] = [];
  for (let s = 0; s < SEG; s++) pos.push(-0.5, s / SEG, 0, 0.5, s / SEG, 0);
  pos.push(0, 1, 0);
  for (let s = 0; s < SEG - 1; s++) idx.push(s * 2, s * 2 + 1, s * 2 + 2, s * 2 + 1, s * 2 + 3, s * 2 + 2);
  idx.push((SEG - 1) * 2, (SEG - 1) * 2 + 1, SEG * 2);
  const blade = new THREE.BufferGeometry();
  blade.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  blade.setIndex(idx);

  const material = new THREE.MeshLambertMaterial({ color: "#ffffff", side: THREE.DoubleSide });
  material.onBeforeCompile = (shader) => {
    shader.vertexShader = `attribute vec4 aBlade;\nvarying float vAlong;\nvarying float vTint;\n${shader.vertexShader}`
      .replace(
        "#include <beginnormal_vertex>",
        /* glsl */ `
        // aBlade: height, heading, lean, tint. Blades lean their own way; the normal mostly faces the sky so a field shades evenly.
        float bT = position.y;
        float bCos = cos(aBlade.y), bSin = sin(aBlade.y);
        vec3 objectNormal = normalize(vec3(-bSin * 0.35, 1.0, bCos * 0.35));`,
      )
      .replace(
        "#include <begin_vertex>",
        /* glsl */ `
        float bWide = 0.05 * (1.0 - bT * 0.9);
        vec3 transformed = vec3(position.x * bWide * bCos, bT * aBlade.x, position.x * bWide * bSin);
        float bBend = aBlade.z * pow(bT, 1.6) * aBlade.x;
        transformed.xz += vec2(bSin, -bCos) * bBend;
        transformed.y -= abs(bBend) * 0.35 * bT;
        vAlong = bT; vTint = aBlade.w;`,
      );
    shader.fragmentShader = `varying float vAlong;\nvarying float vTint;\n${shader.fragmentShader}`.replace(
      "#include <color_fragment>",
      /* glsl */ `#include <color_fragment>
      vec3 bRoot = vec3(0.16, 0.2, 0.1) * (0.8 + vTint * 0.5);
      vec3 bTip = vec3(0.6, 0.66, 0.4) * (0.8 + vTint * 0.45);
      diffuseColor.rgb *= mix(bRoot, bTip, pow(vAlong, 0.8)) * 1.25;`,
    );
  };
  material.customProgramCacheKey = () => "okoshi-grass";

  const mesh = new THREE.InstancedMesh(blade, material, BLADES);
  const params = new Float32Array(BLADES * 4);
  const m = new THREE.Matrix4();
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  let n = 0;
  while (n < BLADES) {
    // Thick where the camera travels and around the site; thinner out to the sides.
    const z = -34 + Math.pow(rand(), 0.85) * 182;
    const spread = 20 + (z > 20 ? (150 - z) * 0.14 : 34);
    const x = pathX(Math.max(z, 9)) + (rand() + rand() + rand() - 1.5) * spread;
    const toPath = Math.abs(x - pathX(z));
    if (z > 8.5 && toPath < 1.5 + noise(x * 0.6, z * 0.6) * 0.9) continue; // the path is trodden bare
    if (onSheet(x, z, 0.6) > 0.02) continue; // and nothing grows in the court the buildings stand in
    const clump = fbm(x * 0.35, z * 0.35, 2);
    if (rand() > 0.35 + clump) continue;
    m.setPosition(x, groundHeight(x, z), z);
    mesh.setMatrixAt(n, m);
    params.set([0.22 + rand() * 0.3 + clump * 0.18, rand() * Math.PI * 2, 0.25 + rand() * 0.55, rand()], n * 4);
    n++;
  }
  blade.setAttribute("aBlade", new THREE.InstancedBufferAttribute(params, 4));
  mesh.instanceMatrix.needsUpdate = true;
  mesh.frustumCulled = false;
  mesh.receiveShadow = true;
  return mesh;
}

/** Field stones, half sunk. */
function stones(count: number): THREE.InstancedMesh {
  const geometry = new THREE.IcosahedronGeometry(1, 1);
  const mesh = new THREE.InstancedMesh(geometry, new THREE.MeshLambertMaterial({ color: "#d9cdbf", flatShading: true }), count);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
  let seed = 31;
  const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  for (let i = 0; i < count; i++) {
    const z = -40 + rand() * 185;
    const x = pathX(Math.max(z, 9)) + (rand() - 0.5) * 120;
    const s = 0.12 + Math.pow(rand(), 3) * 0.6;
    const onSite = onSheet(x, z, 1) > 0.02;
    q.setFromEuler(e.set(rand(), rand() * 6, rand()));
    m.compose(new THREE.Vector3(x, groundHeight(x, z) + s * 0.12, z), q, new THREE.Vector3(s * 1.5, onSite ? 0 : s * 0.7, s * 1.2));
    mesh.setMatrixAt(i, m);
  }
  mesh.instanceMatrix.needsUpdate = true;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

// ---------------------------------------------------------------------------------------------- sky

function skyMaterial() {
  return new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    uniforms: {
      ...landState,
      uZenith: { value: linear("#e6bfc8") },
      uMid: { value: linear("#f3d6cb") },
      uHorizon: { value: linear("#f9e8d6") },
      uSun: { value: linear("#fffaf2") },
      uSunDir: { value: new THREE.Vector3(-0.3, 0.1, -0.95).normalize() },
      uNightZenith: { value: linear("#141f29") },
      uNightHorizon: { value: linear("#3a4759") },
    },
    vertexShader: "varying vec3 vDir; void main() { vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
    fragmentShader: /* glsl */ `
      uniform vec3 uZenith, uMid, uHorizon, uSun, uSunDir, uNightZenith, uNightHorizon; uniform float uNight; varying vec3 vDir;
      ${NOISE}
      void main() {
        vec3 d = normalize(vDir);
        float up = clamp(d.y, 0.0, 1.0);
        // Three washes, strongest overhead and wiped away towards the horizon.
        vec3 day = mix(mix(uHorizon, uMid, smoothstep(0.0, 0.1, up)), uZenith, smoothstep(0.08, 0.36, up));
        vec3 night = mix(uNightHorizon, uNightZenith, smoothstep(0.0, 0.3, up));
        vec3 col = mix(day, night, uNight);
        // Long, thin cloud bands, lighter than the sky behind them.
        float around = atan(d.x, -d.z);
        float cloud = lFbm(vec2(around * 5.0, up * 52.0));
        cloud = smoothstep(0.5, 0.76, cloud) * smoothstep(0.03, 0.09, up) * (1.0 - smoothstep(0.2, 0.4, up));
        col = mix(col, mix(uSun, uNightHorizon * 1.3, uNight), cloud * 0.6);
        // The sun at dawn, or the moon: a clean disc with a soft ring of light around it.
        float a = acos(clamp(dot(d, uSunDir), -1.0, 1.0));
        float disc = 1.0 - smoothstep(0.03, 0.033, a);
        col = mix(col, uSun, clamp(disc + exp(-a * 8.0) * 0.55, 0.0, 1.0));
        vec2 sp = vec2(around * 60.0, d.y * 90.0);
        col += vec3(step(0.9965, lHash(floor(sp))) * smoothstep(0.12, 0.3, up)) * uNight * 0.8;
        gl_FragColor = vec4(col, 1.0);
        #include <colorspace_fragment>
      }`,
  });
}

// ------------------------------------------------------------------------------------------- ranges

type Range = { z: number; width: number; height: number; seed: number; crest: string; body: string; snow: number; freq: number };

// Farthest first, so nearer washes are laid over farther ones.
const RANGES: Range[] = [
  { z: -262, width: 1300, height: 46, seed: 7.7, crest: "#c9a3b0", body: "#ead2cc", snow: 1, freq: 0.0058 },
  { z: -205, width: 1100, height: 33, seed: 4.1, crest: "#b48d9f", body: "#d9bcba", snow: 0.4, freq: 0.0082 },
  { z: -150, width: 900, height: 22, seed: 2.6, crest: "#977a8f", body: "#c2a4a9", snow: 0, freq: 0.0115 },
];

function rangeMaterial(r: Range) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    fog: false,
    uniforms: {
      ...landState,
      uSeed: { value: r.seed },
      uHeight: { value: r.height },
      uWidth: { value: r.width },
      uFreq: { value: r.freq },
      uSnow: { value: r.snow },
      uCrest: { value: linear(r.crest) },
      uBody: { value: linear(r.body) },
      uMist: { value: linear(MIST) },
      uNightMist: { value: linear("#33414f") },
    },
    vertexShader: "varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
    fragmentShader: /* glsl */ `
      uniform float uSeed, uHeight, uWidth, uFreq, uSnow, uNight; uniform vec3 uCrest, uBody, uMist, uNightMist; varying vec2 vUv;
      ${NOISE}
      // The skyline: folded noise gives sharp crests and scooped saddles; raising it to a power makes peaks stand clear.
      float skyline(float x) {
        float a = 0.5, f = 1.0, s = 0.0, total = 0.0;
        for (int i = 0; i < 6; i++) {
          s += a * (1.0 - abs(lNoise(vec2(x * f, uSeed * 13.7 + float(i) * 3.1)) * 2.0 - 1.0));
          total += a; f *= 2.07; a *= 0.5;
        }
        float massif = 0.55 + 0.45 * lNoise(vec2(x * 0.22, uSeed));
        return uHeight * (0.16 + 0.84 * pow(s / total, 1.7) * massif * 1.25);
      }
      void main() {
        float u = (vUv.x - 0.5) * uWidth;
        float y = vUv.y * uHeight * 1.18;
        float crest = skyline(u * uFreq);
        float aa = fwidth(y) * 1.3;
        float alpha = 1.0 - smoothstep(crest - aa, crest + aa, y);
        if (alpha < 0.002) discard;

        float below = crest - y;
        float depth = below / uHeight; // 0 on the skyline
        // Faces: sample the skyline a little to one side, further over the lower down the slope we are,
        // so that lit and shaded faces fan out from each peak instead of dropping straight down.
        float lean = below * 0.55;
        float span = 5.0 + below * 0.25;
        float left = skyline((u - lean - span) * uFreq), right = skyline((u - lean + span) * uFreq);
        float slope = (right - left) / (2.0 * span);
        float rough = lFbm(vec2(u * 0.05, y * 0.11 + uSeed)) - 0.5;
        float lit = smoothstep(-0.18, 0.18, -slope + rough * 0.3); // light from the left: faces that fall to the right are lit
        vec3 col = mix(uCrest, uBody, lit * 0.85 + 0.05);
        // Granulation, as pigment settles in the grain of the paper.
        col *= 0.96 + 0.08 * lFbm(vec2(u * 0.04, y * 0.1));
        // Snow lies on the highest crests and runs down the lit faces.
        float high = smoothstep(0.5, 0.75, crest / uHeight);
        float snow = uSnow * high * (1.0 - smoothstep(0.02, 0.12 + 0.14 * (rough + 0.5), depth));
        col = mix(col, vec3(1.0, 0.985, 0.97), snow * mix(0.35, 0.95, lit));
        // The skyline carries a darker edge, like the key block of a print.
        col = mix(col, uCrest * 0.86, (1.0 - smoothstep(0.0, 0.016, depth)) * 0.5);
        // Every range thins into mist towards its foot.
        float foot = pow(1.0 - smoothstep(0.0, uHeight * 0.42, y), 1.5);
        col = mix(col, uMist, foot);
        col = mix(col, mix(col * vec3(0.22, 0.3, 0.4), uNightMist, foot * 0.8), uNight);
        gl_FragColor = vec4(col, alpha);
        #include <colorspace_fragment>
      }`,
  });
}

// ---------------------------------------------------------------------------------------------- land

export function Land() {
  const { scene } = useThree();
  const sky = useMemo(skyMaterial, []);
  const ranges = useMemo(() => RANGES.map((r) => ({ ...r, material: rangeMaterial(r) })), []);
  const earth = useMemo(ground, []);
  const earthMaterial = useMemo(() => new THREE.MeshLambertMaterial({ vertexColors: true }), []);
  const field = useMemo(grass, []);
  const rocks = useMemo(() => stones(900), []);
  const fogDay = useMemo(() => linear(MIST), []);
  const fogNight = useMemo(() => linear("#2f3d4b"), []);

  useEffect(() => {
    // Distance takes colour away: the far ground and the buildings sink a little into the mist.
    scene.fog = new THREE.Fog(MIST, 70, 330);
    return () => {
      scene.fog = null;
    };
  }, [scene]);

  useFrame(({ invalidate }) => {
    // Day and Night cross-fade; the canvas only draws on demand, so keep asking until the fade settles.
    const target = stage.getState().night ? 1 : 0;
    const gap = target - landState.uNight.value;
    landState.uNight.value = Math.abs(gap) < 0.004 ? target : landState.uNight.value + gap * 0.1;
    if (landState.uNight.value !== target) invalidate();
    (scene.fog as THREE.Fog | null)?.color.copy(fogDay).lerp(fogNight, landState.uNight.value);
  });

  return (
    <group>
      <mesh material={sky} renderOrder={-10}>
        <sphereGeometry args={[900, 32, 16]} />
      </mesh>
      {/* Everything below is squared to the composed view, so the ranges run level across the picture. */}
      <group position={SITE} rotation={[0, VIEW_AZIMUTH, 0]}>
        {ranges.map((r, i) => (
          <mesh key={r.z} material={r.material} position={[0, (r.height * 1.18) / 2 + 2, r.z]} renderOrder={-8 + i}>
            <planeGeometry args={[r.width, r.height * 1.18]} />
          </mesh>
        ))}
        <mesh geometry={earth} material={earthMaterial} receiveShadow />
        <primitive object={field} />
        <primitive object={rocks} />
      </group>
    </group>
  );
}
