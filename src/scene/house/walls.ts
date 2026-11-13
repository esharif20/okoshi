import type { RoomId } from "~/content";
import type { FoldPlan, PanelSpec } from "~/scene/fold";

// The House's paper panels. Every wall is hinged along its foot on the Sheet; an eave is hinged
// along the top of the wall that carries it. Lengths are plan units.

export type PanelLook = "plaster" | "screen" | "eave";

export type PanelShape = {
  id: string;
  length: number;
  height: number;
  look: PanelLook;
  /** Hinge in the parent's frame (the world, for walls). */
  origin: [number, number, number];
  /** Heading of the hinge in the ground plane, radians about +y, for walls. Eaves inherit their wall's. */
  yaw: number;
  parent?: string;
  room?: RoomId;
};

const TALL = 1.6; // high enough to read as a wall, low enough to see over from the camera
const LOW = 0.45; // the garden and veranda sides stay open, as sliding screens would be
const EAVE = 0.9;
const HALF = Math.PI / 2;

type Wall = {
  id: string;
  from: [number, number];
  to: [number, number];
  height: number;
  look: PanelLook;
  /** Which side the wall lies on when flat: +1 is the side its own z axis points to (x cross up), -1 the other. */
  lies: 1 | -1;
  order: number;
  room: RoomId;
  eave?: boolean;
};

const WALLS: Wall[] = [
  // Outer walls at the back and left, each lying inwards on its room's floor, each carrying an eave.
  { id: "workshop-back", from: [0, 0], to: [4, 0], height: TALL, look: "plaster", lies: 1, order: 0, room: "workshop", eave: true },
  { id: "study-back", from: [4, 0], to: [7, 0], height: TALL, look: "plaster", lies: 1, order: 0, room: "study", eave: true },
  { id: "workshop-left", from: [0, 3], to: [0, 0], height: TALL, look: "plaster", lies: 1, order: 0, room: "workshop", eave: true },
  { id: "hall-left", from: [0, 6], to: [0, 3], height: TALL, look: "plaster", lies: 1, order: 0, room: "hall", eave: true },
  { id: "entrance-left", from: [0, 8], to: [0, 6], height: TALL, look: "plaster", lies: 1, order: 0, room: "entrance", eave: true },
  // Inner walls.
  { id: "workshop-study", from: [4, 3], to: [4, 0], height: TALL, look: "plaster", lies: -1, order: 1, room: "study" },
  { id: "workshop-hall", from: [0, 3], to: [4, 3], height: TALL, look: "screen", lies: 1, order: 1, room: "hall" },
  { id: "study-hall", from: [4, 3], to: [7, 3], height: TALL, look: "screen", lies: 1, order: 1, room: "hall" },
  { id: "hall-entrance", from: [0, 6], to: [2.5, 6], height: TALL, look: "plaster", lies: 1, order: 1, room: "entrance" },
  // The open sides, facing the garden and the plain.
  { id: "study-garden", from: [7, 0], to: [7, 3], height: LOW, look: "screen", lies: -1, order: 2, room: "study" },
  { id: "hall-garden", from: [7, 3], to: [7, 6], height: LOW, look: "screen", lies: -1, order: 2, room: "hall" },
  { id: "hall-lookout", from: [2.5, 6], to: [7, 6], height: LOW, look: "screen", lies: 1, order: 2, room: "lookout" },
  { id: "entrance-right", from: [2.5, 6], to: [2.5, 8], height: LOW, look: "plaster", lies: -1, order: 2, room: "entrance" },
  { id: "entrance-front", from: [0, 8], to: [2.5, 8], height: LOW, look: "plaster", lies: 1, order: 2, room: "entrance" },
];

function build(): { shapes: PanelShape[]; plan: FoldPlan } {
  const shapes: PanelShape[] = [];
  const panels: PanelSpec[] = [];
  for (const w of WALLS) {
    const dx = w.to[0] - w.from[0];
    const dz = w.to[1] - w.from[1];
    const length = Math.hypot(dx, dz);
    // A rotation about +y by `yaw` turns the panel's own x axis onto the wall's direction.
    const yaw = Math.atan2(-dz, dx);
    shapes.push({ id: w.id, length, height: w.height, look: w.look, origin: [w.from[0], 0, w.from[1]], yaw, room: w.room });
    // About the panel's own x axis: 0 stands the wall up; a quarter turn lays it on the Sheet.
    panels.push({
      id: w.id,
      hinge: { origin: [w.from[0], 0, w.from[1]], axis: [dx, 0, dz] },
      flat: w.lies * HALF,
      raised: 0,
      order: w.order,
      room: w.room,
    });
    if (w.eave) {
      const id = `${w.id}-eave`;
      shapes.push({ id, length, height: EAVE, look: "eave", origin: [0, w.height, 0], yaw: 0, parent: w.id, room: w.room });
      // In line with its wall when flat; when raised it tips outwards and down over the wall's outer face.
      panels.push({
        id,
        parent: w.id,
        hinge: { origin: [0, w.height, 0], axis: [1, 0, 0] },
        flat: 0,
        raised: -w.lies * (HALF + 0.4),
        order: w.order + 1,
        room: w.room,
      });
    }
  }
  return { shapes, plan: { panels } };
}

export const HOUSE = build();
