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

/** Seconds since the Diorama started, for everything that moves on its own: wind, petals. */
export const worldTime = { value: 0 };

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
    shader.uniforms.uTime = worldTime;
    shader.vertexShader = `attribute vec4 aBlade;\nuniform float uTime;\nvarying float vAlong;\nvarying float vTint;\n${shader.vertexShader}`
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
        // Wind: gusts cross the field as slow waves, and every blade answers a little differently.
        vec2 bRoot = vec2(instanceMatrix[3][0], instanceMatrix[3][2]);
        float bGust = sin(uTime * 1.3 + bRoot.x * 0.12 + bRoot.y * 0.09) * (0.6 + 0.4 * sin(uTime * 0.31 + bRoot.x * 0.02));
        transformed.xz += vec2(0.84, 0.54) * bGust * 0.11 * pow(bT, 1.5) * aBlade.x * 3.0;
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
      uSunDir: { value: new THREE.Vector3(-0.2, 0.15, -0.97).normalize() },
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

// The mountains are painted, not modelled: six washes laid one over another, the farthest palest, each
// darkest along its crest and thinning to mist at its foot, the way distance is shown in an ink painting
// or a woodblock print. One great snow-capped cone stands behind them all.
type Range = { z: number; width: number; height: number; seed: number; freq: number; crest: string; trees: number; cone?: [number, number] };

const RANGES: Range[] = [
  { z: -430, width: 2000, height: 86, seed: 9.3, freq: 0.0016, crest: "#e3c3c6", trees: 0, cone: [55, 300] },
  { z: -370, width: 1700, height: 50, seed: 7.7, freq: 0.0028, crest: "#d9b4bd", trees: 0 },
  { z: -310, width: 1500, height: 42, seed: 4.1, freq: 0.0036, crest: "#c79fb1", trees: 0 },
  { z: -255, width: 1300, height: 34, seed: 2.6, freq: 0.0046, crest: "#ad8da6", trees: 0.25 },
  { z: -205, width: 1100, height: 26, seed: 5.9, freq: 0.006, crest: "#8f7e9b", trees: 0.6 },
  { z: -165, width: 950, height: 18, seed: 1.3, freq: 0.0085, crest: "#76748c", trees: 1 },
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
      uTrees: { value: r.trees },
      uCone: { value: new THREE.Vector2(r.cone?.[0] ?? 0, r.cone?.[1] ?? 0) },
      uCrest: { value: linear(r.crest) },
      uMist: { value: linear(MIST) },
      uNightMist: { value: linear("#3a475a") },
    },
    vertexShader: "varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
    fragmentShader: /* glsl */ `
      uniform float uSeed, uHeight, uWidth, uFreq, uTrees, uNight; uniform vec2 uCone; uniform vec3 uCrest, uMist, uNightMist; varying vec2 vUv;
      ${NOISE}
      // The skyline: long, soft swells with smaller ones riding on them. No sharp folds: these are brushed in.
      float skyline(float x) {
        float n = lNoise(vec2(x * uFreq, uSeed)) * 0.55 + lNoise(vec2(x * uFreq * 2.3, uSeed + 9.0)) * 0.28
                + lNoise(vec2(x * uFreq * 5.1, uSeed + 21.0)) * 0.12 + lNoise(vec2(x * uFreq * 11.0, uSeed + 40.0)) * 0.05;
        float h = 0.18 + 0.82 * pow(n, 1.5) * 1.35;
        if (uCone.y > 0.0) {
          // The great cone: concave flanks, a slightly notched summit.
          float d = abs(x - uCone.x) / uCone.y;
          float cone = pow(max(0.0, 1.0 - d), 1.9) * (1.0 - 0.035 * lNoise(vec2(x * 0.09, 3.0)) * step(d, 0.12));
          h = max(h * 0.42, cone);
        }
        return uHeight * min(h, 1.0);
      }
      void main() {
        float u = (vUv.x - 0.5) * uWidth;
        float y = vUv.y * uHeight * 1.1;
        float crest = skyline(u);
        // Near ranges carry a wood along the crest: the small, uneven tufts of a brush dabbed on its side.
        crest += uTrees * (lNoise(vec2(u * 0.9, uSeed)) * 0.55 + lNoise(vec2(u * 2.6, uSeed + 3.0)) * 0.35);
        // The edge of a wash on paper is never clean.
        float ragged = (lNoise(vec2(u * 0.6, y * 0.6 + uSeed)) - 0.5) * 0.35;
        float aa = fwidth(y) * 1.2 + 0.04;
        float alpha = 1.0 - smoothstep(crest - aa, crest + aa, y + ragged);
        if (alpha < 0.003) discard;

        float below = crest - y;
        // Darkest at the crest, wiped away to mist below.
        float body = exp(-below / (uHeight * 0.42));
        vec3 col = mix(uMist, uCrest, 0.18 + 0.82 * body);
        // Two tones: the side away from the light is laid in with a second, cooler wash.
        float e = 14.0;
        float lean = (skyline(u + e) - skyline(u - e)) / (2.0 * e);
        float shade = smoothstep(0.02, 0.22, lean + (lFbm(vec2(u * 0.02, y * 0.06 + uSeed)) - 0.5) * 0.25);
        col = mix(col, col * vec3(0.86, 0.84, 0.92), shade * body * 0.9);
        // Granulation and blooms: pigment settles unevenly as a wash dries.
        col *= 0.955 + 0.09 * lFbm(vec2(u * 0.03 + uSeed, y * 0.07));
        col = mix(col, uCrest * 0.9, smoothstep(0.62, 0.8, lFbm(vec2(u * 0.011 + uSeed * 3.0, y * 0.03))) * 0.22 * body);
        // A darker line where the wet edge dried, along the skyline.
        col = mix(col, uCrest * 0.8, (1.0 - smoothstep(0.0, 0.5 + uHeight * 0.012, below)) * 0.45);
        // Snow on the great cone: white from the summit down, ending in long ragged fingers.
        if (uCone.y > 0.0) {
          float d = abs(u - uCone.x) / uCone.y;
          float line = uHeight * (0.6 + 0.16 * lNoise(vec2(u * 0.05, 7.0)) + 0.1 * lNoise(vec2(u * 0.21, 11.0)));
          float snow = smoothstep(line - 1.5, line + 1.5, y) * step(d, 0.5);
          col = mix(col, vec3(1.0, 0.985, 0.975), snow * 0.96);
          col = mix(col, vec3(0.86, 0.84, 0.92), snow * shade * 0.5);
        }
        col = mix(col, mix(col * vec3(0.3, 0.37, 0.5), uNightMist, (1.0 - body) * 0.7), uNight);
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
        {ranges.map((r, i) => (
          <mesh key={r.z} material={r.material} position={[0, (r.height * 1.1) / 2 + 3, r.z]} renderOrder={-9 + i}>
            <planeGeometry args={[r.width, r.height * 1.1]} />
          </mesh>
        ))}
        <mesh geometry={earth} material={earthMaterial} receiveShadow />
        <primitive object={field} />
        <primitive object={rocks} />
      </group>
    </group>
  );
}
