import { describe, expect, it } from "vitest";
import { hingeAxis, poseAt, progressAt, validatePlan } from "./index";
import type { FoldPlan, PanelSpec } from "./index";

const H = { origin: [0, 0, 0] as [number, number, number], axis: [2, 0, 0] as [number, number, number] };
const panel = (id: string, order: number, parent?: string, raised = Math.PI / 2): PanelSpec => ({
  id,
  parent,
  hinge: H,
  flat: 0,
  raised,
  order,
});

// A small House: two walls, a roof flap on one, a screen on the flap, a late
// Pagoda, and a child listed with an earlier order than its parent.
const plan: FoldPlan = {
  panels: [
    panel("north", 0),
    panel("south", 0, undefined, -Math.PI / 2),
    panel("flap", 1, "north"),
    panel("screen", 2, "flap", Math.PI / 3),
    panel("pagoda", 3),
    panel("eager", 0, "pagoda"),
  ],
};
const ids = plan.panels.map((p) => p.id);
const steps = (n: number) => Array.from({ length: n + 1 }, (_, i) => i / n);

describe("poseAt", () => {
  it("returns an angle for every panel", () => {
    for (const t of steps(20)) expect([...poseAt(plan, t).keys()]).toEqual(ids);
  });

  it("lies flat at 0 and stands at 1", () => {
    const at0 = poseAt(plan, 0);
    const at1 = poseAt(plan, 1);
    for (const p of plan.panels) {
      expect(at0.get(p.id)).toBe(p.flat);
      expect(at1.get(p.id)).toBe(p.raised);
    }
  });

  it("clamps t outside 0..1", () => {
    expect(poseAt(plan, -3)).toEqual(poseAt(plan, 0));
    expect(poseAt(plan, 7)).toEqual(poseAt(plan, 1));
    expect(poseAt(plan, Number.NaN)).toEqual(poseAt(plan, 0));
  });

  it("never moves a panel ahead of its parent", () => {
    for (const t of steps(1000)) {
      const p = progressAt(plan, t);
      for (const s of plan.panels) if (s.parent) expect(p.get(s.id)!).toBeLessThanOrEqual(p.get(s.parent)!);
    }
  });

  it("does not start a child before its parent, even when its order is earlier", () => {
    const started = (id: string) => steps(1000).find((t) => progressAt(plan, t).get(id)! > 0)!;
    expect(started("eager")).toBeGreaterThanOrEqual(started("pagoda"));
  });

  it("starts later waves later, with neighbouring waves overlapping", () => {
    const started = (id: string) => steps(1000).find((t) => progressAt(plan, t).get(id)! > 0)!;
    const done = (id: string) => steps(1000).find((t) => progressAt(plan, t).get(id)! === 1)!;
    const order = ["north", "flap", "screen", "pagoda"];
    for (let i = 1; i < order.length; i++) {
      expect(started(order[i])).toBeGreaterThan(started(order[i - 1]));
      expect(started(order[i])).toBeLessThan(done(order[i - 1]));
    }
    expect(started("south")).toBe(started("north"));
    expect(done("pagoda")).toBe(1);
  });

  it("gives each wave an equal slice", () => {
    const span = (id: string) => {
      const moving = steps(1000).filter((t) => {
        const v = progressAt(plan, t).get(id)!;
        return v > 0 && v < 1;
      });
      return moving[moving.length - 1] - moving[0];
    };
    for (const id of ["flap", "screen", "pagoda"]) expect(span(id)).toBeCloseTo(span("north"), 2);
  });

  it("changes angles smoothly, with no jumps and no kinks", () => {
    const n = 4000;
    const dt = 1 / n;
    const series = steps(n).map((t) => poseAt(plan, t));
    for (const p of plan.panels) {
      const a = series.map((m) => m.get(p.id)!);
      const d = a.slice(1).map((v, i) => (v - a[i]) / dt);
      // Slope bounded: smoothstep peaks at 1.5 over a slice of 2/(W+1) = 0.4.
      const maxSlope = (1.5 / 0.4) * Math.abs(p.raised - p.flat);
      for (const s of d) expect(Math.abs(s)).toBeLessThanOrEqual(maxSlope + 1e-6);
      // C1: the slope itself never jumps between neighbouring steps.
      for (let i = 1; i < d.length; i++) expect(Math.abs(d[i] - d[i - 1])).toBeLessThan(0.05);
    }
  });

  it("is monotone for every panel", () => {
    const series = steps(500).map((t) => progressAt(plan, t));
    for (const id of ids)
      for (let i = 1; i < series.length; i++) expect(series[i].get(id)!).toBeGreaterThanOrEqual(series[i - 1].get(id)!);
  });

  it("uses the whole range for a single wave", () => {
    const one: FoldPlan = { panels: [panel("a", 4)] };
    expect(poseAt(one, 0.5).get("a")).toBeCloseTo(Math.PI / 4);
  });
});

describe("validatePlan", () => {
  it("accepts a sound plan", () => {
    expect(() => validatePlan(plan)).not.toThrow();
  });

  it("rejects a missing parent, naming the panel", () => {
    expect(() => validatePlan({ panels: [panel("roof", 1, "ghost")] })).toThrow(/"roof".*missing parent "ghost"/);
  });

  it("rejects a cycle, naming the panel", () => {
    const cyc = { panels: [panel("a", 0, "c"), panel("b", 0, "a"), panel("c", 0, "b")] };
    expect(() => validatePlan(cyc)).toThrow(/"a" is in a parent cycle/);
    expect(() => validatePlan({ panels: [panel("self", 0, "self")] })).toThrow(/"self"/);
  });

  it("rejects a duplicate id", () => {
    expect(() => validatePlan({ panels: [panel("a", 0), panel("a", 1)] })).toThrow(/duplicate panel id "a"/);
  });

  it("rejects a zero hinge axis", () => {
    const p = { ...panel("z", 0), hinge: { origin: [0, 0, 0] as [number, number, number], axis: [0, 0, 0] as [number, number, number] } };
    expect(() => validatePlan({ panels: [p] })).toThrow(/"z" has a zero hinge axis/);
  });

  it("is enforced by poseAt", () => {
    expect(() => poseAt({ panels: [panel("x", 0, "y")] }, 0.5)).toThrow(/missing parent/);
  });
});

describe("hingeAxis", () => {
  it("normalises the axis", () => {
    expect(hingeAxis(panel("a", 0))).toEqual([1, 0, 0]);
  });
});
