import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { layers } from "~/content";
import { progressAt, type FoldPlan } from "~/scene/fold";
import { elevation } from "./elevation";
import { painted, paintState, slab } from "./painted";
import { stage } from "~/stage";
import type { LayerId } from "~/content";
import { hipped, rafters, trim } from "./roof";
import { plaster, stone, tiles, wood } from "./textures";

// The Pagoda: five storeys, each a Layer of the work, on a stone footing and under a gilded spire.
// It rises storey by storey, each one opening out of the one below.

const STOREYS = 5;
const BASE = 0.6, BODY = 1.6, PITCH = 2.2;
const widthOf = (i: number) => 4.4 - i * 0.56;
const ROOF_SHAPE = { rise: 1.0, lift: 0.5, power: 1.3 };

const hinge = { origin: [0, 0, 0] as [number, number, number], axis: [1, 0, 0] as [number, number, number] };
const PLAN: FoldPlan = {
  panels: [
    ...Array.from({ length: STOREYS }, (_, i) => ({ id: `storey-${i}`, hinge, flat: 0, raised: 1, order: i })),
    { id: "spire", hinge, flat: 0, raised: 1, order: STOREYS },
  ],
};

export function Pagoda({ build }: { build: () => number }) {
  const groups = useRef<(THREE.Group | null)[]>([]);
  const spire = useRef<THREE.Group>(null);
  const footing = useRef<THREE.Mesh>(null);

  const m = useMemo(
    () => ({
      stoneM: painted(stone(21), { bump: 1.4 }),
      timber: painted(wood("#5d463a", 11)),
      boards: painted(wood("#b59a84", 12)),
      tile: painted(tiles("#5b6d76", 15), { side: THREE.DoubleSide, bump: 0.5, roughness: 0.85 }),
      pale: painted(plaster("#efe3c8", 43), { bump: 0.3 }),
      gold: new THREE.MeshStandardMaterial({ color: "#d2ab62", metalness: 0.55, roughness: 0.42 }),
    }),
    [],
  );

  const storeys = useMemo(
    () =>
      Array.from({ length: STOREYS }, (_, i) => {
        const w = widthOf(i);
        const eave = w + 3.1 - i * 0.12;
        const wall = painted(elevation({ width: w, height: BODY, bays: 3, screens: [1], windows: i % 2 ? [0, 2] : [], seed: 31 + i }), { emissive: "#ffd9a0" });
        return {
          w,
          layer: layers[i]?.id ?? `layer-${i}`,
          body: new THREE.BoxGeometry(w, BODY, w),
          bodyMaterials: [wall, wall, m.timber, m.timber, wall, wall],
          deck: slab(w + 1.5, 0.12, w + 1.5),
          rail: slab(w + 1.3, 0.1, 0.08),
          bracket: slab(w + 0.6, 0.24, w + 0.6),
          slopes: hipped(eave, eave, ROOF_SHAPE),
          trim: trim(eave, eave, ROOF_SHAPE, 0.085),
          rafters: rafters(eave, eave, ROOF_SHAPE, 0.4),
        };
      }),
    [m.timber],
  );

  const top = BASE + STOREYS * PITCH;
  const root = useRef<THREE.Group>(null);
  const pin = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ camera, gl, size, invalidate }) => {
    const { hoveredLayer } = stage.getState();
    if (hoveredLayer && root.current) {
      const i = storeys.findIndex((s) => s.layer === hoveredLayer);
      pin.set(0, BASE + i * PITCH + 1, 0);
      paintState.uLiftAt.value.copy(root.current.localToWorld(pin));
      paintState.uLiftRadius.value = 3.3;
      const gap = 1 - paintState.uLift.value;
      paintState.uLift.value = gap < 0.004 ? 1 : paintState.uLift.value + gap * 0.12;
      if (paintState.uLift.value !== 1) invalidate();
    }
    const stageEl = gl.domElement.closest<HTMLElement>("[data-stage]");
    if (stageEl && root.current) {
      pin.set(0, 1.0, 4.6);
      root.current.localToWorld(pin).project(camera);
      stageEl.style.setProperty("--pin-garden-x", `${(((pin.x + 1) / 2) * size.width).toFixed(1)}px`);
      stageEl.style.setProperty("--pin-garden-y", `${(((1 - pin.y) / 2) * size.height).toFixed(1)}px`);
    }
    const done = progressAt(PLAN, build());
    groups.current.forEach((g, i) => {
      if (!g) return;
      const e = done.get(`storey-${i}`) ?? 0;
      g.visible = e > 0;
      g.position.y = (BASE + i * PITCH) * e;
      g.scale.set(0.86 + 0.14 * e, Math.max(e, 0.001), 0.86 + 0.14 * e);
    });
    const first = done.get("storey-0") ?? 0;
    if (footing.current) {
      footing.current.visible = first > 0;
      footing.current.scale.y = Math.max(Math.min(1, first * 3), 0.001);
    }
    const s = done.get("spire") ?? 0;
    if (spire.current) {
      spire.current.visible = s > 0;
      spire.current.position.y = top - 0.5 + (1 - s) * -1.5;
      spire.current.scale.setScalar(Math.max(s, 0.001));
    }
  });

  return (
    <group ref={root}>
      <mesh ref={footing} geometry={useMemo(() => slab(6, BASE, 6).translate(0, BASE / 2, 0), [])} material={m.stoneM} castShadow receiveShadow />
      {storeys.map((s, i) => (
        <group key={s.layer} ref={(g) => { groups.current[i] = g; }} visible={false} userData={{ layer: s.layer }}>
          <mesh
            position={[0, 1, 0]}
            onPointerOver={(e) => { e.stopPropagation(); if (stage.getState().progress > 0.5) stage.setState({ hoveredLayer: s.layer as LayerId, hoveredRoom: null }); }}
            onPointerOut={() => { if (stage.getState().hoveredLayer === s.layer) stage.setState({ hoveredLayer: null }); }}
          >
            <boxGeometry args={[s.w + 2.6, PITCH, s.w + 2.6]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>
          <mesh geometry={s.deck} material={m.boards} position={[0, 0.06, 0]} castShadow receiveShadow />
          <mesh geometry={s.body} material={s.bodyMaterials} position={[0, 0.12 + BODY / 2, 0]} castShadow receiveShadow />
          {[0, 1, 2, 3].map((k) => (
            <mesh
              key={k}
              geometry={s.rail}
              material={m.timber}
              position={[k % 2 ? ((k - 2) * (s.w + 1.3)) / 2 : 0, 0.6, k % 2 ? 0 : ((k - 1) * (s.w + 1.3)) / 2]}
              rotation={[0, k % 2 ? Math.PI / 2 : 0, 0]}
              castShadow
            />
          ))}
          <mesh geometry={s.bracket} material={m.timber} position={[0, 0.12 + BODY + 0.1, 0]} castShadow />
          <group position={[0, 0.12 + BODY + 0.2, 0]}>
            {s.slopes.map((sl, k) => (
              <mesh key={k} geometry={sl.geometry} material={m.tile} position={sl.position} rotation={[0, sl.yaw, 0]} castShadow receiveShadow />
            ))}
            <mesh geometry={s.trim} material={m.pale} castShadow />
            <mesh geometry={s.rafters} material={m.timber} castShadow />
          </group>
        </group>
      ))}
      <group ref={spire} visible={false}>
        <mesh material={m.gold} position={[0, 1.5, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.09, 3, 8]} />
        </mesh>
        {[0, 1, 2, 3, 4, 5, 6].map((k) => (
          <mesh key={k} material={m.gold} position={[0, 0.7 + k * 0.26, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <torusGeometry args={[0.3 - k * 0.028, 0.045, 6, 16]} />
          </mesh>
        ))}
        <mesh material={m.gold} position={[0, 3.05, 0]} castShadow>
          <sphereGeometry args={[0.14, 10, 8]} />
        </mesh>
      </group>
    </group>
  );
}
