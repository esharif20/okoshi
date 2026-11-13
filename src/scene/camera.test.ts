import { describe, expect, it } from "vitest";
import { orbitAt, orbitPose } from "./camera";

describe("camera", () => {
  it("looks straight down with screen-up pointing away from the viewer at polar 0", () => {
    const p = orbitPose({ target: [2, 0, 3], polar: 0, azimuth: 0, distance: 10 });
    expect(p.position).toEqual([2, 10, 3]);
    expect(p.up[0]).toBeCloseTo(0);
    expect(p.up[1]).toBeCloseTo(0);
    expect(p.up[2]).toBeCloseTo(-1);
  });
  it("holds at the ends and moves monotonically between keys", () => {
    const a = { target: [0, 0, 0] as [number, number, number], polar: 0, azimuth: 0, distance: 10 };
    const b = { ...a, polar: 1, distance: 30 };
    const keys = [{ at: 0.1, orbit: a }, { at: 0.5, orbit: b }];
    expect(orbitAt(keys, 0).polar).toBe(0);
    expect(orbitAt(keys, 0.9).polar).toBe(1);
    let last = -1;
    for (let p = 0.1; p <= 0.5; p += 0.02) {
      const v = orbitAt(keys, p).polar;
      expect(v).toBeGreaterThanOrEqual(last);
      last = v;
    }
  });
});
