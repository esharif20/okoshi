// The fold-up mechanism: how far each paper panel has lifted from the Sheet at
// a point t in the Fold Beat. Pure maths, no three.js, so it runs under Vitest.
import type { RoomId } from "../../content";

export type Vec3 = [number, number, number];
export type PanelSpec = {
  id: string;
  parent?: string;
  hinge: { origin: Vec3; axis: Vec3 }; // axis need not be unit length; see hingeAxis
  flat: number; // radians
  raised: number; // radians
  order: number; // wave index, 0 first
  room?: RoomId;
};
export type FoldPlan = { panels: PanelSpec[] };

type Slot = { id: string; start: number; length: number; flat: number; raised: number; parent?: string };

/** Throws an Error naming the panel on a duplicate id, a missing parent, a cycle or a bad hinge. */
export function validatePlan(plan: FoldPlan): void {
  const byId = new Map<string, PanelSpec>();
  for (const p of plan.panels) {
    if (byId.has(p.id)) throw new Error(`Fold plan: duplicate panel id "${p.id}"`);
    byId.set(p.id, p);
  }
  for (const p of plan.panels) {
    if (p.parent !== undefined && !byId.has(p.parent))
      throw new Error(`Fold plan: panel "${p.id}" has missing parent "${p.parent}"`);
    if (!Number.isFinite(p.order) || p.order < 0) throw new Error(`Fold plan: panel "${p.id}" has a bad order`);
    if (!Number.isFinite(p.flat) || !Number.isFinite(p.raised))
      throw new Error(`Fold plan: panel "${p.id}" has a non-finite angle`);
    if (![...p.hinge.origin, ...p.hinge.axis].every(Number.isFinite))
      throw new Error(`Fold plan: panel "${p.id}" has a non-finite hinge`);
    if (Math.hypot(...p.hinge.axis) === 0) throw new Error(`Fold plan: panel "${p.id}" has a zero hinge axis`);
  }
  for (const p of plan.panels) {
    const seen = new Set<string>([p.id]);
    for (let q = p.parent; q !== undefined; q = byId.get(q)!.parent) {
      if (seen.has(q)) throw new Error(`Fold plan: panel "${p.id}" is in a parent cycle`);
      seen.add(q);
    }
  }
}

/** The hinge axis as a unit vector. */
export function hingeAxis(panel: PanelSpec): Vec3 {
  const [x, y, z] = panel.hinge.axis;
  const n = Math.hypot(x, y, z);
  return [x / n, y / n, z / n];
}

// Keyed by plan identity, so a plan is checked and scheduled once, not on
// every frame. A plan must therefore not be changed in place after its first
// poseAt: build a new FoldPlan object instead (freezing plans is a good guard).
const schedules = new WeakMap<FoldPlan, Slot[]>();

// Waves are ranked by distinct order. Each takes a slice of length 2/(W+1) and
// starts half a slice after the one before, so neighbours overlap by half and
// the last ends exactly at 1. A panel rises no earlier than its parent's wave:
// it inherits the later of the two, which keeps the rule without clipping a
// smooth curve.
function schedule(plan: FoldPlan): Slot[] {
  const cached = schedules.get(plan);
  if (cached) return cached;
  validatePlan(plan);

  const byId = new Map(plan.panels.map((p) => [p.id, p]));
  const wave = new Map<string, number>();
  const waveOf = (p: PanelSpec): number => {
    let w = wave.get(p.id);
    if (w === undefined) {
      w = p.parent === undefined ? p.order : Math.max(p.order, waveOf(byId.get(p.parent)!));
      wave.set(p.id, w);
    }
    return w;
  };
  const ranks = [...new Set(plan.panels.map(waveOf))].sort((a, b) => a - b);
  const length = 2 / (ranks.length + 1);
  const slots = plan.panels.map((p) => ({
    id: p.id,
    start: (ranks.indexOf(waveOf(p)) * length) / 2,
    length,
    flat: p.flat,
    raised: p.raised,
    parent: p.parent,
  }));
  schedules.set(plan, slots);
  return slots;
}

// Smoothstep: zero slope at both ends, so a panel eases off the table and
// settles without a jolt, and the curve is C1 everywhere.
const ease = (u: number) => u * u * (3 - 2 * u);
const clamp01 = (x: number) => (x > 0 ? (x < 1 ? x : 1) : 0);

/** Eased progress 0..1 of every panel at t. */
export function progressAt(plan: FoldPlan, t: number): Map<string, number> {
  const tt = clamp01(Number.isNaN(t) ? 0 : t);
  const out = new Map<string, number>();
  for (const s of schedule(plan)) out.set(s.id, ease(clamp01((tt - s.start) / s.length)));
  return out;
}

/** Hinge angle in radians of every panel at t; t is clamped to 0..1. Treat the plan as frozen once passed in. */
export function poseAt(plan: FoldPlan, t: number): Map<string, number> {
  const progress = progressAt(plan, t);
  const angles = new Map<string, number>();
  for (const s of schedule(plan)) {
    const e = progress.get(s.id)!;
    angles.set(s.id, e === 1 ? s.raised : s.flat + (s.raised - s.flat) * e);
  }
  return angles;
}
