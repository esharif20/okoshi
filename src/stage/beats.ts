export type Beat = "sheet" | "fold" | "ink" | "paint" | "plate";

// Where each Beat sits in the Opening sequence's progress (0..1). See docs/ARCHITECTURE.md.
export const BEATS: readonly { beat: Beat; from: number; to: number }[] = [
  { beat: "sheet", from: 0, to: 0.1 },
  { beat: "fold", from: 0.1, to: 0.45 },
  { beat: "ink", from: 0.45, to: 0.65 },
  { beat: "paint", from: 0.65, to: 0.9 },
  { beat: "plate", from: 0.9, to: 1 },
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
