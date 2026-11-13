import type { CSSProperties } from "react";
import "./ui.css";

// Advance widths of the display face, in ems, for the characters a Figure is written in.
const WIDTHS: Record<string, number> = { "%": 1.02, "→": 1, "−": 0.79, "<": 0.76, "+": 0.62, ".": 0.29, ",": 0.22, " ": 0.25 };
const width = (char: string) => WIDTHS[char] ?? (/[A-Z]/.test(char) ? 0.71 : /[a-z]/.test(char) ? 0.57 : 0.65);

/** How wide a value sets, in ems of the display face. */
export const ems = (value: string) => [...value].reduce((sum, char) => sum + width(char), 0);

// A Figure lettered in the manner of manga sound effects: the display face, sized so that any value
// fills the measure of the nearest `.sfx-box` above it.
export function Sfx({ value }: { value: string }) {
  return (
    <strong className="sfx" style={{ "--ems": ems(value).toFixed(2) } as CSSProperties}>
      {value}
    </strong>
  );
}
