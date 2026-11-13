import { describe, expect, it } from "vitest";
import { poseAt, validatePlan } from "~/scene/fold";
import { HOUSE } from "./walls";

describe("house fold plan", () => {
  it("is a valid plan with a shape for every panel", () => {
    expect(() => validatePlan(HOUSE.plan)).not.toThrow();
    expect(HOUSE.shapes.map((s) => s.id).sort()).toEqual(HOUSE.plan.panels.map((p) => p.id).sort());
  });
  it("lies flat at 0 and stands at 1", () => {
    const flat = poseAt(HOUSE.plan, 0);
    const up = poseAt(HOUSE.plan, 1);
    for (const p of HOUSE.plan.panels) {
      expect(flat.get(p.id)).toBeCloseTo(p.flat);
      expect(up.get(p.id)).toBeCloseTo(p.raised);
    }
  });
  it("gives every room at least one panel", () => {
    const rooms = new Set(HOUSE.plan.panels.map((p) => p.room));
    for (const r of ["entrance", "workshop", "study", "lookout", "hall"]) expect(rooms.has(r as never)).toBe(true);
  });
});
