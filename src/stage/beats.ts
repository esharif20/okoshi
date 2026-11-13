export type Beat = "arrival" | "approach" | "fold" | "ink" | "paint" | "plate" | "enter";

// Where each Beat sits in the Opening sequence's progress (0..1). See docs/ARCHITECTURE.md.
export const BEATS: readonly { beat: Beat; from: number; to: number }[] = [
  { beat: "arrival", from: 0, to: 0.06 },
  { beat: "approach", from: 0.06, to: 0.28 },
  { beat: "fold", from: 0.28, to: 0.48 },
  { beat: "ink", from: 0.48, to: 0.58 },
  { beat: "paint", from: 0.58, to: 0.72 },
  { beat: "plate", from: 0.72, to: 0.84 },
  { beat: "enter", from: 0.84, to: 1 },
];

const clamp01 = (x: number) => (Number.isFinite(x) ? Math.min(1, Math.max(0, x)) : 0);

export function beatAt(progress: number): Beat {
  const p = clamp01(progress);
  for (const b of BEATS) if (p < b.to) return b.beat;
  return "enter";
}

export function beatProgress(progress: number, beat: Beat): number {
  const b = BEATS.find((x) => x.beat === beat)!;
  return clamp01((clamp01(progress) - b.from) / (b.to - b.from));
}
