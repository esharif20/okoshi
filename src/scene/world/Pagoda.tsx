import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { layers } from "~/content";
import { beatProgress, stage } from "~/stage";

// The five-storey Pagoda behind the House. Each storey is a Layer; it rises storey by storey
// in the second half of the Fold, each one growing out of the one below like a paper pop-up.

const STOREYS = 5;
const BODY_H = 1.05;
const DROP = 0.38; // how far each roof skirt falls from the storey's top to its eave
const OVERHANG = 0.75;

const smooth = (u: number) => u * u * (3 - 2 * u);
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

/** A four-sided roof skirt: narrow at the top (half-width a), wide at the eave (half-width b), with lifted corners. */
function skirt(a: number, b: number, drop: number, lift: number): THREE.BufferGeometry {
  const g = new THREE.BufferGeometry();
  const v: number[] = [];
  const SEG = 6;
  for (let side = 0; side < 4; side++) {
    const rot = (side * Math.PI) / 2;
    const c = Math.cos(rot), s = Math.sin(rot);
    const at = (x: number, y: number, z: number) => [x * c + z * s, y, -x * s + z * c];
    for (let i = 0; i < SEG; i++) {
      const u0 = i / SEG, u1 = (i + 1) / SEG;
      // The eave rises towards each corner, as on a real pagoda.
      const rise = (u: number) => lift * Math.pow(Math.abs(u * 2 - 1), 2.2);
      const p0 = at(-a + 2 * a * u0, 0, a), p1 = at(-a + 2 * a * u1, 0, a);
      const q0 = at(-b + 2 * b * u0, -drop + rise(u0), b), q1 = at(-b + 2 * b * u1, -drop + rise(u1), b);
      v.push(...p0, ...q0, ...q1, ...p0, ...q1, ...p1);
    }
  }
  g.setAttribute("position", new THREE.Float32BufferAttribute(v, 3));
  g.computeVertexNormals();
  return g;
}

export function Pagoda({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const groups = useRef<(THREE.Group | null)[]>([]);
  const storeys = useMemo(
    () =>
      Array.from({ length: STOREYS }, (_, i) => {
        const half = 1.25 - i * 0.17;
        return {
          half,
          y: i * (BODY_H + 0.1),
          roof: skirt(half * 0.92, half + OVERHANG - i * 0.06, DROP, 0.16),
          layer: layers[i]?.id ?? `layer-${i}`,
        };
      }),
    [],
  );

  useFrame(() => {
    const t = beatProgress(stage.getState().progress, "fold");
    const local = clamp01((t - 0.45) / 0.55);
    groups.current.forEach((g, i) => {
      if (!g) return;
      const e = smooth(clamp01((local - i * 0.14) / 0.42));
      g.position.y = storeys[i].y * e;
      g.scale.set(1, Math.max(e, 0.0001), 1);
      g.visible = e > 0;
    });
  });

  return (
    <group position={position} scale={scale}>
      {storeys.map((s, i) => (
        <group key={s.layer} ref={(g) => { groups.current[i] = g; }} userData={{ layer: s.layer }}>
          <mesh position={[0, BODY_H / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[s.half * 2, BODY_H, s.half * 2]} />
            <meshLambertMaterial color="#f7f9fa" />
          </mesh>
          <mesh geometry={s.roof} position={[0, BODY_H + DROP * 0.55, 0]} castShadow>
            <meshLambertMaterial color="#1f3038" side={THREE.DoubleSide} />
          </mesh>
          {i === STOREYS - 1 && (
            <mesh position={[0, BODY_H + 0.95, 0]} castShadow>
              <coneGeometry args={[0.09, 1.5, 8]} />
              <meshLambertMaterial color="#1f3038" />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
}
