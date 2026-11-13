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
/** Where the House and the Pagoda stand on the sheet. */
export const HOUSE_AT: [number, number, number] = [-3.4, 0.06, 0.4];
export const PAGODA_AT: [number, number, number] = [9.6, 0.06, -1.2];
/** A point given in the House's own frame (x along its front, z out of its front door), in world coordinates. */
export function inHouse(x: number, y: number, z: number): [number, number, number] {
  const X = x + HOUSE_AT[0], Z = z + HOUSE_AT[2];
  const c = Math.cos(TURN), s = Math.sin(TURN);
  return inFrame(X * c + Z * s, y + HOUSE_AT[1], -X * s + Z * c);
}
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

const GROUND = { width: 900, depth: 350, centreZ: 38, cols: 320, rows: 150 };

function ground(): THREE.BufferGeometry {
  const g = new THREE.PlaneGeometry(GROUND.width, GROUND.depth, GROUND.cols, GROUND.rows);
  g.rotateX(-Math.PI / 2);
  g.translate(0, 0, GROUND.centreZ);
  const pos = g.attributes.position as THREE.BufferAttribute;
  const colour = new Float32Array(pos.count * 3);
  const sward = linear("#b2bb93"), scrub = linear("#9faa84"), dry = linear("#d5cca6"), soil = linear("#dcc4a8"), gravel = linear("#e6dccd"), c = new THREE.Color();
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

const BLADES = 170000;

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
        float bWide = 0.034 * (1.0 - bT * 0.9);
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
    params.set([0.11 + rand() * 0.2 + clump * 0.14, rand() * Math.PI * 2, 0.25 + rand() * 0.55, rand()], n * 4);
    n++;
  }
  blade.setAttribute("aBlade", new THREE.InstancedBufferAttribute(params, 4));
  mesh.instanceMatrix.needsUpdate = true;
  mesh.frustumCulled = false;
  mesh.receiveShadow = true;
  return mesh;
}

/** Field stones: small, smooth and pale, half sunk in the grass. */
function stones(count: number): THREE.InstancedMesh {
  const geometry = new THREE.SphereGeometry(1, 12, 8);
  const mesh = new THREE.InstancedMesh(geometry, new THREE.MeshLambertMaterial({ color: "#e2d6c4" }), count);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
  let seed = 31;
  const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  for (let i = 0; i < count; i++) {
    const z = -40 + rand() * 185;
    const x = pathX(Math.max(z, 9)) + (rand() - 0.5) * 110;
    const s = 0.07 + Math.pow(rand(), 4) * 0.34;
    const hidden = onSheet(x, z, 1) > 0.02 || Math.abs(x - pathX(z)) < 1.2;
    q.setFromEuler(e.set(0, rand() * 6, 0));
    m.compose(new THREE.Vector3(x, groundHeight(x, z) + s * 0.1, z), q, new THREE.Vector3(s * 1.6, hidden ? 0 : s * 0.55, s * 1.2));
    mesh.setMatrixAt(i, m);
  }
  mesh.instanceMatrix.needsUpdate = true;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

/** The point in the picture's frame that a world position stands over. */
export function toFrame(x: number, z: number): [number, number] {
  const c = Math.cos(VIEW_AZIMUTH), s = Math.sin(VIEW_AZIMUTH);
  const dx = x - SITE[0], dz = z - SITE[2];
  return [dx * c - dz * s, dx * s + dz * c];
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
      uSunDir: { value: new THREE.Vector3(-0.33, 0.1, -0.944).normalize() },
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

type Range = { z: number; width: number; depth: number; height: number; seed: number; rock: string; haze: string; snow: number; fade: number };

// Real ground, raised into ranges and lit by the same sun as everything else, so each has a lit side and a
// shaded side. Distance is painted in: the farther a range, the paler and pinker it is.
const RANGES: Range[] = [
  { z: -330, width: 1700, depth: 160, height: 62, seed: 7.7, rock: "#b98fa2", haze: "#f3ddd6", snow: 1, fade: 0.38 },
  { z: -240, width: 1300, depth: 120, height: 38, seed: 4.1, rock: "#a07c92", haze: "#efd5d0", snow: 0.55, fade: 0.2 },
  { z: -170, width: 1000, depth: 84, height: 20, seed: 2.6, rock: "#836a82", haze: "#e6c9c8", snow: 0, fade: 0.06 },
];

function mountains(r: Range): THREE.BufferGeometry {
  const cols = 640, rows = 90;
  const g = new THREE.PlaneGeometry(r.width, r.depth, cols, rows);
  g.rotateX(-Math.PI / 2);
  const pos = g.attributes.position as THREE.BufferAttribute;
  const colour = new Float32Array(pos.count * 3);
  const rock = linear(r.rock), haze = linear(r.haze), c = new THREE.Color();
  const F = 2.3 / r.depth;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i);
    // Folded noise, with detail gathering on the crests: sharp ridges, scooped valleys, spurs running down.
    let a = 0.5, f = 1, sum = 0, w = 1;
    for (let o = 0; o < 6; o++) {
      let n = 1 - Math.abs(noise(x * F * f + r.seed * 13.7, z * F * f * 1.35 + o * 3.1) * 2 - 1);
      n *= n;
      sum += a * n * w;
      w = Math.min(1, n * 1.6);
      f *= 2.03;
      a *= 0.5;
    }
    // Separate peaks along the range, each a pointed mass, so the skyline rises and falls instead of running level.
    const massif = Math.pow(noise(x * F * 0.33 + r.seed, r.seed * 2.3), 1.6) * 1.9;
    const across = (z + r.depth / 2) / r.depth; // 0 at the back, 1 at the front edge, where it meets the plain
    const bell = Math.pow(Math.sin(Math.PI * Math.min(1, across * 1.04)), 1.5);
    const h = r.height * bell * Math.min(1.15, 0.1 + Math.pow(sum, 1.25) * 1.5 * (0.25 + massif));
    pos.setY(i, h);
    const t = h / r.height;
    c.copy(haze).lerp(rock, smooth(0.06, 0.4, t));
    c.multiplyScalar(0.96 + 0.08 * noise(x * 0.05, z * 0.05));
    c.lerp(haze, r.fade);
    colour.set([c.r, c.g, c.b], i * 3);
  }
  g.setAttribute("color", new THREE.BufferAttribute(colour, 3));
  g.computeVertexNormals();
  return g;
}

/**
 * The surface of a range. The mesh gives the big forms and the sun gives them a lit and a shaded side;
 * this adds what a painter would: bands of strata, gullies running downhill, scree, and snow that lies
 * only where the slope is gentle enough to hold it. No fog: at this distance it would erase the ranges,
 * so their haze is in their colours.
 */
function rockMaterial(r: Range): THREE.MeshLambertMaterial {
  const m = new THREE.MeshLambertMaterial({ vertexColors: true, fog: false });
  const own = { uHeight: { value: r.height }, uSnow: { value: r.snow }, uKeep: { value: 1 - r.fade }, uHaze: { value: linear(r.haze) } };
  m.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, own, landState);
    shader.vertexShader = shader.vertexShader
      .replace("void main() {", "varying vec3 vRock;\nvarying vec3 vRockN;\nvoid main() {")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvRock = position;\nvRockN = normal;");
    shader.fragmentShader = shader.fragmentShader
      .replace("void main() {", `uniform float uHeight, uSnow, uKeep, uNight;\nuniform vec3 uHaze;\nvarying vec3 vRock;\nvarying vec3 vRockN;\n${NOISE}\nvoid main() {`)
      .replace(
        "#include <color_fragment>",
        /* glsl */ `#include <color_fragment>
        {
          vec3 n = normalize(vRockN);
          float steep = 1.0 - n.y;
          float t = vRock.y / uHeight;
          vec3 rock = diffuseColor.rgb;
          // Strata: thin bands that tilt and wander, strongest on steep faces where rock is bare.
          float tilt = vRock.y * 1.5 + vRock.x * 0.07 + lFbm(vRock.xz * 0.03) * 16.0 + lFbm(vRock.xz * 0.2) * 3.0;
          float strata = smoothstep(0.3, 0.7, sin(tilt) * 0.5 + 0.5);
          rock *= mix(1.0, mix(0.9, 1.05, strata), smoothstep(0.25, 0.65, steep) * 0.7);
          // Gullies: narrow dark lines following the fall of the slope.
          vec2 fall = normalize(n.xz + 0.0001);
          float across = dot(vRock.xz, vec2(-fall.y, fall.x));
          float gully = smoothstep(0.62, 0.9, lNoise(vec2(across * 0.42, vRock.y * 0.05)));
          rock *= 1.0 - gully * 0.24 * smoothstep(0.15, 0.5, steep);
          // Scree and scrub: the gentle lower ground is paler and mottled.
          float lower = (1.0 - smoothstep(0.1, 0.4, t)) * (1.0 - smoothstep(0.1, 0.4, steep));
          rock = mix(rock, rock * vec3(1.06, 1.05, 0.98), lower * (0.5 + 0.5 * lFbm(vRock.xz * 0.2)));
          rock *= 0.94 + 0.12 * lFbm(vRock.xz * 0.5 + vRock.y * 0.3);
          // Snow holds on gentle slopes high up and lies in streaks on the steep ones.
          float line = t + (lFbm(vRock.xz * 0.06) - 0.5) * 0.3;
          float snow = uSnow * smoothstep(0.42, 0.6, line) * (1.0 - smoothstep(0.28, 0.62, steep - lFbm(vRock.xz * 0.25) * 0.25));
          rock = mix(rock, vec3(1.0, 0.985, 0.975), snow * 0.94);
          // What distance takes away: detail fades towards the haze the range was given.
          diffuseColor.rgb = mix(uHaze, rock, uKeep + (1.0 - uKeep) * 0.35 * smoothstep(0.0, 0.5, t));
          diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * vec3(0.3, 0.36, 0.48), uNight);
        }`,
      );
  };
  m.customProgramCacheKey = () => "okoshi-rock";
  return m;
}

// ---------------------------------------------------------------------------------------------- land

export function Land() {
  const { scene } = useThree();
  const sky = useMemo(skyMaterial, []);
  const ranges = useMemo(() => RANGES.map((r) => ({ ...r, geometry: mountains(r), material: rockMaterial(r) })), []);
  const earth = useMemo(ground, []);
  const earthMaterial = useMemo(() => new THREE.MeshLambertMaterial({ vertexColors: true }), []);
  const field = useMemo(grass, []);
  const rocks = useMemo(() => stones(520), []);
  const fogDay = useMemo(() => linear(MIST), []);
  const fogNight = useMemo(() => linear("#2f3d4b"), []);

  useEffect(() => {
    // Distance takes colour away: the far ground and the buildings sink a little into the mist.
    scene.fog = new THREE.Fog(MIST, 55, 300);
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
        {ranges.map((r) => (
          <mesh key={r.z} geometry={r.geometry} material={r.material} position={[0, 0.5, r.z]} />
        ))}
        <mesh geometry={earth} material={earthMaterial} receiveShadow />
        <primitive object={field} />
        <primitive object={rocks} />
      </group>
    </group>
  );
}
