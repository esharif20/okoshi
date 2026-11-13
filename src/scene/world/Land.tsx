import { useFrame } from "@react-three/fiber";
import { useMemo } from "react";
import * as THREE from "three";
import { beatProgress, stage } from "~/stage";

// The painted world the Sheet turns into: a plain that spreads out from the House, mist, three ranges of
// mountains and the sky. All of it arrives in the Paint beat.

const linear = (hex: string) => new THREE.Color(hex);

export const landState = {
  uPaint: { value: 0 },
  uNight: { value: 0 },
  uCentre: { value: new THREE.Vector2(4.5, 3.5) },
};

const NOISE = /* glsl */ `
float lHash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float lNoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(lHash(i), lHash(i + vec2(1, 0)), f.x), mix(lHash(i + vec2(0, 1)), lHash(i + vec2(1, 1)), f.x), f.y);
}
`;

function plainMaterial(): THREE.MeshLambertMaterial {
  const m = new THREE.MeshLambertMaterial({ color: "#ffffff", transparent: true });
  const own = {
    uNear: { value: linear("#d5dfd6") }, // the plain underfoot: a pale, cool green
    uFar: { value: linear("#e6ecef") }, // and where it runs into mist
    uNightTint: { value: new THREE.Vector3(0.24, 0.32, 0.4) },
  };
  m.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, landState, own);
    shader.vertexShader = shader.vertexShader
      .replace("void main() {", "varying vec3 vLandWorld;\nvoid main() {")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvLandWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;");
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "void main() {",
        `uniform float uPaint, uNight;\nuniform vec2 uCentre;\nuniform vec3 uNear, uFar, uNightTint;\nvarying vec3 vLandWorld;\n${NOISE}\nvoid main() {`,
      )
      .replace(
        "#include <opaque_fragment>",
        /* glsl */ `{
          vec2 q = vLandWorld.xz;
          float dist = length(q - uCentre);
          // The wash creeps outwards from the House with a ragged, wet edge.
          float reach = uPaint * 150.0 - dist + (lNoise(q * 0.35) - 0.5) * 9.0 + (lNoise(q * 1.7) - 0.5) * 2.0;
          float painted = smoothstep(0.0, 2.2, reach);
          float wet = painted * (1.0 - smoothstep(0.0, 4.0, reach));
          float mist = smoothstep(18.0, 120.0, dist);
          float mottle = lNoise(q * 0.22) * 0.5 + lNoise(q * 0.9) * 0.5;
          vec3 colour = mix(uNear * mix(0.94, 1.03, mottle), uFar, mist);
          float light = dot(outgoingLight, vec3(0.3333));
          colour *= mix(0.86, 1.0, smoothstep(0.5, 0.66, light));
          colour = mix(colour, colour * 0.86, wet * 0.7);
          colour = mix(colour, colour * uNightTint, uNight);
          outgoingLight = colour;
          diffuseColor.a = painted;
        }\n#include <opaque_fragment>`,
      );
  };
  return m;
}

/** A mountain range as a flat cut-out with a ragged top, like a wash laid over the last one. */
function ridge(width: number, height: number, seed: number, peaks: number): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  const rand = (i: number) => {
    const x = Math.sin(i * 127.1 + seed * 311.7) * 43758.5453;
    return x - Math.floor(x);
  };
  const N = 90;
  shape.moveTo(-width / 2, 0);
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    const big = Math.pow(Math.abs(Math.sin(u * Math.PI * peaks + seed)), 0.8);
    const y = height * (0.34 + 0.5 * big + 0.16 * rand(i)) * (0.7 + 0.3 * Math.sin(u * Math.PI));
    shape.lineTo(-width / 2 + u * width, y);
  }
  shape.lineTo(width / 2, 0);
  return new THREE.ShapeGeometry(shape);
}

// A range is one flat wash that thins into mist towards its foot, so it sits on the plain instead of standing on it.
function ridgeMaterial(height: number, colour: THREE.Color): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    transparent: true,
    uniforms: { uColour: { value: colour.clone() }, uMist: { value: new THREE.Color() }, uOpacity: { value: 0 }, uHeight: { value: height } },
    vertexShader: "varying float vY; void main() { vY = position.y; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
    fragmentShader: /* glsl */ `
      uniform vec3 uColour, uMist; uniform float uOpacity, uHeight; varying float vY;
      void main() {
        float body = smoothstep(0.0, uHeight * 0.5, vY);
        gl_FragColor = vec4(mix(uMist, uColour, body), uOpacity);
        #include <colorspace_fragment>
      }`,
  });
}

const RANGES = [
  { z: -70, w: 300, h: 5.5, seed: 1.3, peaks: 3.1, day: "#9db1bc", night: "#13212a" },
  { z: -110, w: 420, h: 9.5, seed: 4.1, peaks: 2.2, day: "#b7c6cf", night: "#182932" },
  { z: -160, w: 560, h: 15, seed: 7.7, peaks: 1.6, day: "#d0dbe1", night: "#1e313b" },
];
const SKY = { day: "#eef2f4", night: "#263c47" };

export function Land() {
  const plain = useMemo(plainMaterial, []);
  const ranges = useMemo(
    () =>
      RANGES.map((r) => ({
        ...r,
        geometry: ridge(r.w, r.h, r.seed, r.peaks),
        material: ridgeMaterial(r.h, linear(r.day)),
        dayC: linear(r.day),
        nightC: linear(r.night),
      })),
    [],
  );
  const sky = useMemo(() => new THREE.MeshBasicMaterial({ color: SKY.day, transparent: true, opacity: 0, depthWrite: false, side: THREE.BackSide }), []);
  const skyDay = useMemo(() => linear(SKY.day), []);
  const mistDay = useMemo(() => linear("#e6ecef"), []);
  const mistNight = useMemo(() => linear("#2c444f"), []);
  const skyNight = useMemo(() => linear(SKY.night), []);

  useFrame(({ invalidate }) => {
    const { progress, night } = stage.getState();
    const paint = beatProgress(progress, "paint");
    landState.uPaint.value = paint;
    // Day and Night cross-fade; the canvas only draws on demand, so keep asking until the fade settles.
    const target = night ? 1 : 0;
    const gap = target - landState.uNight.value;
    landState.uNight.value = Math.abs(gap) < 0.004 ? target : landState.uNight.value + gap * 0.1;
    if (landState.uNight.value !== target) invalidate();
    const n = landState.uNight.value;
    // The far washes go down last: sky, then the ranges from the farthest forwards.
    sky.opacity = Math.min(1, Math.max(0, (paint - 0.55) / 0.3));
    sky.color.copy(skyDay).lerp(skyNight, n);
    ranges.forEach((r, i) => {
      const opacity = Math.min(1, Math.max(0, (paint - 0.6 - (2 - i) * 0.06) / 0.25));
      r.material.uniforms.uOpacity.value = opacity;
      r.material.visible = opacity > 0;
      r.material.uniforms.uColour.value.copy(r.dayC).lerp(r.nightC, n);
      r.material.uniforms.uMist.value.copy(mistDay).lerp(mistNight, n);
    });
  });

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[4.5, 0.003, 3.5]} material={plain} receiveShadow renderOrder={1}>
        <circleGeometry args={[330, 72]} />
      </mesh>
      <mesh material={sky} renderOrder={-3}>
        <sphereGeometry args={[400, 24, 12]} />
      </mesh>
      {/* Turned to face the Plate's camera, so the ranges run level across the picture. */}
      <group position={[5.6, 0, 3.2]} rotation={[0, (26 * Math.PI) / 180, 0]}>
        {ranges.map((r, i) => (
          <mesh key={r.z} geometry={r.geometry} material={r.material} position={[14 - i * 26, -0.2, r.z]} renderOrder={-2 + i * 0.1} />
        ))}
      </group>
    </group>
  );
}
