export type Beat = "arrival" | "approach" | "fold" | "ink" | "paint" | "plate";

// Where each Beat sits in the Opening sequence's progress (0..1). See docs/ARCHITECTURE.md.
export const BEATS: readonly { beat: Beat; from: number; to: number }[] = [
  { beat: "arrival", from: 0, to: 0.08 },
  { beat: "approach", from: 0.08, to: 0.36 },
  { beat: "fold", from: 0.36, to: 0.6 },
  { beat: "ink", from: 0.6, to: 0.72 },
  { beat: "paint", from: 0.72, to: 0.88 },
  { beat: "plate", from: 0.88, to: 1 },
];

const clamp01 = (x: number) => (Number.isFinite(x) ? Math.min(1, Math.max(0, x)) : 0);

export function beatAt(progress: number): Beat {
  const p = clamp01(progress);
  for (const b of BEATS) if (p < b.to) return b.beat;
  return "plate";
}

export function beatProgress(progress: number, beat: Beat): number {
  const b = BEATS.find((x) => x.beat === beat)!;
  return clamp01((clamp01(progress) - b.from) / (b.to - b.from));
}
