import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { poseAt, progressAt, type FoldPlan } from "~/scene/fold";
import { beatProgress, stage } from "~/stage";
import { elevation } from "./elevation";
import { Flap, rectangle } from "./Flap";
import { painted, paintState, setShown, slab } from "./painted";
import type { RoomId } from "~/content";
import { hipped, rafters, trim } from "./roof";
import { floorPlan, plaster, stone, tiles, wood, type PlanRoom } from "./textures";

// The House: a stone footing, four rooms under one roof, a veranda. It is printed flat as a plan, with every
// room named, and folds up in waves: footing, outer walls, the walls between rooms. The front wall and the
// roof wait until the Plate, so the visitor can look down into the rooms while they are inked and painted.

const W = 10, D = 6; // the rooms together
const PLINTH = 0.7, WALL = 3.0, INNER = 2.3;
const DECK = { hx: W / 2 + 1.25, hz: D / 2 + 1.25 };
const ROOF = { w: W + 5, d: D + 5, shape: { rise: 3.5, lift: 0.55, power: 1.55 } };
const QUARTER = Math.PI / 2;

/** The plan, measured from the back-left corner of the floor. The front is the side with the steps. */
export const ROOMS: (PlanRoom & { id: string })[] = [
  { id: "workshop", name: "", x: 0, z: 0, w: 5, d: 3 },
  { id: "study", name: "", x: 5, z: 0, w: 5, d: 3 },
  { id: "hall", name: "", x: 0, z: 3, w: 7, d: 3 },
  { id: "entrance", name: "", x: 7, z: 3, w: 3, d: 3 },
];

// Walls between rooms, in the House's own frame (centre at the origin).
const INNER_WALLS: { id: string; from: [number, number]; to: [number, number]; lies: 1 | -1 }[] = [
  { id: "back-left", from: [-5, 0], to: [0, 0], lies: 1 },
  { id: "back-right", from: [0, 0], to: [5, 0], lies: 1 },
  { id: "between-back", from: [0, 0], to: [0, -3], lies: 1 },
  { id: "between-front", from: [2, 3], to: [2, 0], lies: -1 },
];

const hinge = { origin: [0, 0, 0] as [number, number, number], axis: [1, 0, 0] as [number, number, number] };
const PLAN: FoldPlan = {
  panels: [
    ...["front", "right", "back", "left"].map((s) => ({ id: `footing-${s}`, hinge, flat: QUARTER, raised: 0, order: 0 })),
    ...["right", "back", "left"].map((s) => ({ id: `wall-${s}`, hinge, flat: QUARTER, raised: 0, order: 1 })),
    ...INNER_WALLS.map((w) => ({ id: `inner-${w.id}`, hinge, flat: w.lies * QUARTER, raised: 0, order: 2 })),
  ],
};

const smooth = (a: number, b: number, x: number) => {
  const u = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return u * u * (3 - 2 * u);
};

/** Where each Room's name is pinned, in the House's own frame, a little above its floor. */
const PINS: Record<string, [number, number, number]> = {
  workshop: [-2.5, 1.2, -1.5],
  study: [2.5, 1.2, -1.5],
  hall: [-1.5, 1.2, 1.5],
  entrance: [3.5, 1.2, 1.5],
  lookout: [-1.5, 0.9, 3.8],
};

/** The volume a pointer must be over to be "in" a Room. */
const PICK: Partial<Record<RoomId, { at: [number, number, number]; size: [number, number, number] }>> = {
  workshop: { at: [-2.5, 1.3, -1.5], size: [5, 2.6, 3] },
  study: { at: [2.5, 1.3, -1.5], size: [5, 2.6, 3] },
  hall: { at: [-1.5, 1.3, 1.5], size: [7, 2.6, 3] },
  entrance: { at: [3.5, 1.3, 1.5], size: [3, 2.6, 3] },
  lookout: { at: [-1.5, 0.5, 3.7], size: [7, 1, 1.2] },
};
/** Rooms answer the pointer once they stand, and while the visitor is still in the Opening sequence. */
const pickable = () => stage.getState().progress > 0.5;

export function Hall({ build }: { build: () => number }) {
  const hinges = useRef(new Map<string, THREE.Group>());
  const root = useRef<THREE.Group>(null);
  const pin = useMemo(() => new THREE.Vector3(), []);
  const storey = useRef<THREE.Group>(null);
  const posts = useRef<THREE.Group>(null);
  const roof = useRef<THREE.Group>(null);
  const steps = useRef<THREE.Group>(null);
  const front = useRef<THREE.Group | null>(null);

  const m = useMemo(() => {
    const stoneM = painted(stone(), { bump: 1.4 });
    const timber = painted(wood("#5d463a"));
    const boards = painted(wood("#b59a84", 8));
    const tile = painted(tiles("#5b6d76"), { side: THREE.DoubleSide, bump: 0.5, roughness: 0.85 });
    const pale = painted(plaster("#efe3c8", 41), { bump: 0.3 });
    const glow = { emissive: "#ffd9a0", side: THREE.DoubleSide } as const;
    return {
      stoneM,
      timber,
      boards,
      tile,
      pale,
      back: painted(elevation({ width: W, height: WALL, bays: 6, screens: [1, 2, 3, 4], windows: [0, 5] }), glow),
      front: painted(elevation({ width: W, height: WALL, bays: 6, screens: [1, 2, 3, 4], windows: [0, 5], seed: 5 }), glow),
      short: painted(elevation({ width: D, height: WALL, bays: 4, screens: [1, 2], windows: [0, 3], seed: 9 }), glow),
      inner5: painted(elevation({ width: 5, height: INNER, bays: 3, screens: [0, 1, 2], seed: 14 }), glow),
      inner3: painted(elevation({ width: 3, height: INNER, bays: 2, screens: [0, 1], seed: 17 }), glow),
      floor: painted(floorPlan(W, D, ROOMS), { bump: 0.25, printed: true }),
    };
  }, []);

  const geo = useMemo(() => {
    const slopes = hipped(ROOF.w, ROOF.d, ROOF.shape);
    return {
      slopes,
      trim: trim(ROOF.w, ROOF.d, ROOF.shape),
      rafters: rafters(ROOF.w, ROOF.d, ROOF.shape),
      ridge: slab(ROOF.w - ROOF.d + 0.7, 0.42, 0.5),
      finial: slab(0.36, 0.5, 0.58),
      soffit: slab(ROOF.w - 0.5, 0.12, ROOF.d - 0.5),
      deck: slab(DECK.hx * 2, 0.16, DECK.hz * 2),
      floor: new THREE.PlaneGeometry(W, D).rotateX(-Math.PI / 2),
      post: slab(0.22, WALL, 0.22),
      corner: slab(0.3, WALL, 0.3),
      beamLong: slab(DECK.hx * 2 - 0.3, 0.26, 0.24),
      beamShort: slab(0.24, 0.26, DECK.hz * 2 - 0.3),
      step: slab(2.6, 0.24, 0.5),
    };
  }, []);

  const verandaPosts = useMemo(() => {
    const out: [number, number][] = [];
    const px = DECK.hx - 0.22, pz = DECK.hz - 0.22;
    for (let i = 0; i <= 5; i++) {
      const x = -px + (2 * px * i) / 5;
      out.push([x, pz], [x, -pz]);
    }
    for (let i = 1; i <= 2; i++) {
      const z = -pz + (2 * pz * i) / 3;
      out.push([px, z], [-px, z]);
    }
    return out;
  }, []);

  useFrame(({ camera, gl, size, invalidate }) => {
    // Tell the page where each Room is on screen, so its name can be set there as real text.
    const stageEl = gl.domElement.closest<HTMLElement>("[data-stage]");
    if (stageEl && root.current) {
      for (const [id, at] of Object.entries(PINS)) {
        pin.set(at[0], at[1] + PLINTH, at[2]);
        root.current.localToWorld(pin).project(camera);
        stageEl.style.setProperty(`--pin-${id}-x`, `${(((pin.x + 1) / 2) * size.width).toFixed(1)}px`);
        stageEl.style.setProperty(`--pin-${id}-y`, `${(((1 - pin.y) / 2) * size.height).toFixed(1)}px`);
      }
    }
    // Lift: ease the paint back to ink around whichever Room is pointed at.
    const { hoveredRoom, hoveredLayer } = stage.getState();
    if (hoveredRoom && PINS[hoveredRoom] && root.current) {
      pin.set(PINS[hoveredRoom][0], PLINTH + 1.2, PINS[hoveredRoom][2]);
      paintState.uLiftAt.value.copy(root.current.localToWorld(pin));
      paintState.uLiftRadius.value = 3.4;
    }
    if (!hoveredLayer) {
      const want = hoveredRoom ? 1 : 0;
      const gap = want - paintState.uLift.value;
      paintState.uLift.value = Math.abs(gap) < 0.004 ? want : paintState.uLift.value + gap * 0.12;
      if (paintState.uLift.value !== want) invalidate();
    }
    const t = build();
    const pose = poseAt(PLAN, t);
    const done = progressAt(PLAN, t);
    hinges.current.forEach((g, id) => {
      g.rotation.x = pose.get(id) ?? 0;
    });
    const up = done.get("footing-front") ?? 0;
    if (storey.current) storey.current.position.y = PLINTH * up;
    if (steps.current) {
      steps.current.visible = up > 0;
      steps.current.scale.y = Math.max(up, 0.001);
    }
    // Each wave of walls prints onto the plan just as it begins to lift, so the plan is clear until then.
    const outer = smooth(0, 0.12, done.get("wall-back") ?? 0);
    setShown(m.back, outer);
    setShown(m.short, outer);
    const inner = smooth(0, 0.12, done.get("inner-back-left") ?? 0);
    setShown(m.inner5, inner);
    setShown(m.inner3, inner);
    // The Plate closes the House: the front wall folds up, the veranda posts rise, the roof is lowered on.
    const plate = beatProgress(stage.getState().progress, "plate");
    setShown(m.front, smooth(0, 0.06, plate));
    if (front.current) front.current.rotation.x = QUARTER * (1 - smooth(0, 0.34, plate));
    const p = smooth(0.18, 0.5, plate);
    if (posts.current) {
      posts.current.scale.y = Math.max(p, 0.001);
      posts.current.visible = p > 0;
    }
    const r = smooth(0.42, 0.95, plate);
    if (roof.current) {
      roof.current.visible = r > 0;
      roof.current.scale.set(0.92 + 0.08 * r, Math.max(r, 0.001), 0.92 + 0.08 * r);
      roof.current.position.y = WALL + 0.12 + (1 - r) * 3.2;
    }
  });

  const keep = (id: string) => (g: THREE.Group | null) => {
    if (g) hinges.current.set(id, g);
  };

  return (
    <group ref={root}>
      {/* Footing: four stone flaps and the steps up to the Entrance. */}
      {rectangle(DECK.hx, DECK.hz).map((s) => (
        <Flap key={s.id} from={s.from} to={s.to} height={PLINTH} face={m.stoneM} edge={m.stoneM} thickness={0.3} hinge={keep(`footing-${s.id}`)} />
      ))}
      <group ref={steps} position={[3.5, 0, DECK.hz + 0.25]} visible={false}>
        <mesh geometry={geo.step} material={m.stoneM} position={[0, 0.12, 0.5]} castShadow receiveShadow />
        <mesh geometry={geo.step} material={m.stoneM} position={[0, 0.36, 0.05]} castShadow receiveShadow />
      </group>

      {/* Everything above the footing rides up on it. */}
      <group ref={storey}>
        <mesh geometry={geo.deck} material={m.boards} position={[0, -0.08, 0]} castShadow receiveShadow />
        <mesh geometry={geo.floor} material={m.floor} position={[0, 0.012, 0]} receiveShadow />
        {rectangle(W / 2, D / 2).map((s) => (
          <Flap
            key={s.id}
            from={s.from}
            to={s.to}
            height={WALL}
            face={s.id === "front" ? m.front : s.id === "back" ? m.back : m.short}
            edge={m.timber}
            hinge={s.id === "front" ? (g) => { front.current = g; } : keep(`wall-${s.id}`)}
          />
        ))}
        {INNER_WALLS.map((w) => (
          <Flap
            key={w.id}
            from={w.from}
            to={w.to}
            height={INNER}
            face={Math.hypot(w.to[0] - w.from[0], w.to[1] - w.from[1]) > 4 ? m.inner5 : m.inner3}
            edge={m.timber}
            thickness={0.1}
            hinge={keep(`inner-${w.id}`)}
          />
        ))}
        {/* What the pointer finds: one unseen volume per Room. */}
        {(Object.keys(PINS) as RoomId[]).filter((id) => id in PICK).map((id) => (
          <mesh
            key={id}
            position={PICK[id]!.at}
            onPointerOver={(e) => { e.stopPropagation(); if (pickable()) stage.setState({ hoveredRoom: id, hoveredLayer: null }); }}
            onPointerOut={() => { if (stage.getState().hoveredRoom === id) stage.setState({ hoveredRoom: null }); }}
          >
            <boxGeometry args={PICK[id]!.size} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>
        ))}
        <group ref={posts} visible={false}>
          {([[1, 1], [1, -1], [-1, 1], [-1, -1]] as const).map(([sx, sz]) => (
            <mesh key={`${sx}${sz}`} geometry={geo.corner} material={m.timber} position={[(sx * W) / 2, WALL / 2, (sz * D) / 2]} castShadow />
          ))}
          {verandaPosts.map(([x, z]) => (
            <mesh key={`${x},${z}`} geometry={geo.post} material={m.timber} position={[x, WALL / 2, z]} castShadow />
          ))}
          <mesh geometry={geo.beamLong} material={m.timber} position={[0, WALL - 0.13, DECK.hz - 0.22]} castShadow />
          <mesh geometry={geo.beamLong} material={m.timber} position={[0, WALL - 0.13, -DECK.hz + 0.22]} castShadow />
          <mesh geometry={geo.beamShort} material={m.timber} position={[DECK.hx - 0.22, WALL - 0.13, 0]} castShadow />
          <mesh geometry={geo.beamShort} material={m.timber} position={[-DECK.hx + 0.22, WALL - 0.13, 0]} castShadow />
        </group>
        <group ref={roof} visible={false} position={[0, WALL + 0.12, 0]}>
          <mesh geometry={geo.soffit} material={m.timber} position={[0, 0.02, 0]} castShadow />
          {geo.slopes.map((s, i) => (
            <mesh key={i} geometry={s.geometry} material={m.tile} position={s.position} rotation={[0, s.yaw, 0]} castShadow receiveShadow />
          ))}
          <mesh geometry={geo.trim} material={m.pale} castShadow />
          <mesh geometry={geo.rafters} material={m.timber} castShadow />
          <mesh geometry={geo.ridge} material={m.pale} position={[0, ROOF.shape.rise + 0.2, 0]} castShadow />
          {[1, -1].map((s) => (
            <mesh key={s} geometry={geo.finial} material={m.pale} position={[(s * (ROOF.w - ROOF.d + 0.7)) / 2, ROOF.shape.rise + 0.4, 0]} castShadow />
          ))}
        </group>
      </group>
    </group>
  );
}
