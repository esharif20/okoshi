import { useMemo } from "react";
import * as THREE from "three";
import { worldTime } from "./Land";

// Blossom on the wind: a few hundred petals drifting across the picture, so the landscape is never quite still.
const COUNT = 700;
const BOX = { x: 150, y: 30, z: 190 };

export function Petals() {
  const mesh = useMemo(() => {
    const petal = new THREE.CircleGeometry(0.13, 5);
    petal.scale(1, 0.62, 1);
    const seeds = new Float32Array(COUNT * 4);
    let s = 97;
    const r = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
    for (let i = 0; i < COUNT; i++) seeds.set([r(), r(), r(), r()], i * 4);
    petal.setAttribute("aSeed", new THREE.InstancedBufferAttribute(seeds, 4));
    const material = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      uniforms: { uTime: worldTime, uBox: { value: new THREE.Vector3(BOX.x, BOX.y, BOX.z) } },
      vertexShader: /* glsl */ `
        attribute vec4 aSeed; uniform float uTime; uniform vec3 uBox; varying float vShade;
        void main() {
          float t = uTime * (0.5 + aSeed.w * 0.6);
          // Each petal falls, is carried sideways by the wind, and starts again at the top.
          vec3 at = vec3(
            mod(aSeed.x * uBox.x + t * 2.2 + sin(t * 0.9 + aSeed.z * 6.28) * 1.6, uBox.x) - uBox.x * 0.5,
            uBox.y - mod(aSeed.y * uBox.y + t * 1.1, uBox.y),
            mod(aSeed.z * uBox.z + sin(t * 0.6 + aSeed.x * 6.28) * 1.2, uBox.z) - 40.0);
          // It tumbles as it goes.
          float a = t * 2.4 + aSeed.x * 40.0, b = t * 1.7 + aSeed.y * 40.0;
          vec3 p = position;
          p = vec3(p.x * cos(a) - p.y * sin(a), p.x * sin(a) + p.y * cos(a), p.z);
          p = vec3(p.x, p.y * cos(b), p.y * sin(b));
          vShade = 0.86 + 0.14 * cos(b);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(at + p, 1.0);
        }`,
      fragmentShader: /* glsl */ `
        varying float vShade;
        void main() {
          gl_FragColor = vec4(vec3(0.98, 0.8, 0.82) * vShade, 1.0);
          #include <colorspace_fragment>
        }`,
    });
    const m = new THREE.InstancedMesh(petal, material, COUNT);
    m.frustumCulled = false;
    return m;
  }, []);
  return <primitive object={mesh} />;
}
