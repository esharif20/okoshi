import type { RoomId } from "~/content";

// The House as a floor plan, in plan units (about one metre). x runs right, y runs towards the viewer.
// The printed plan on the Sheet and the fold-up House are both drawn from this.
export type RoomRect = { id: RoomId; x: number; y: number; w: number; h: number; open?: boolean };

export const PLAN = { w: 10, h: 8 } as const;

export const ROOM_RECTS: readonly RoomRect[] = [
  { id: "workshop", x: 0, y: 0, w: 4, h: 3 },
  { id: "study", x: 4, y: 0, w: 3, h: 3 },
  { id: "hall", x: 0, y: 3, w: 7, h: 3 },
  { id: "entrance", x: 0, y: 6, w: 2.5, h: 2 },
  { id: "lookout", x: 2.5, y: 6, w: 4.5, h: 1.2, open: true },
  { id: "garden", x: 7, y: 0, w: 3, h: 8, open: true },
];

export const ROOM_LABELS: Record<RoomId, string> = {
  entrance: "Entrance",
  workshop: "Workshop",
  study: "Study",
  lookout: "Lookout",
  hall: "Great hall",
  garden: "Garden",
};
