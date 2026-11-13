import type { Edition } from "~/stage";

export type DeviceFacts = {
  reducedMotion: boolean;
  coarsePointer: boolean;
  width: number;
  webgl: boolean;
  gpuTier?: number; // 0..3 from detect-gpu; undefined while unknown
};

// Decided once at load. Pure, so it is tested without a browser.
export function chooseEdition(d: DeviceFacts): { edition: Edition; quality: "high" | "low" } {
  if (d.reducedMotion) return { edition: "still", quality: "low" };
  if (d.coarsePointer && d.width < 900) return { edition: "phone", quality: "low" };
  if (!d.webgl) return { edition: "still", quality: "low" };
  return { edition: "desktop", quality: d.gpuTier !== undefined && d.gpuTier < 2 ? "low" : "high" };
}
