import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

// Curved, tiled roof surfaces. The height of a roof depends only on how far in from the eave a point is,
// which gives a hipped roof its ridge and hips without any special cases.

export type RoofShape = { rise: number; lift: number; power: number };

const RIB = 0.36; // one row of tiles, eave to ridge
const RIB_HEIGHT = 0.075;

/** Height of the roof `t` in from the eave, at `x` along an eave of length `len`. */
function heightAt(s: RoofShape, len: number, run: number, x: number, t: number): number {
  const across = len > 0 ? x / len : 0.5;
  return s.rise * Math.pow(t / run, s.power) + s.lift * Math.pow(Math.abs(across * 2 - 1), 2.6) * Math.pow(1 - t / run, 2);
}

/**
 * One slope of a hipped roof: `len` along the eave, `run` in from the eave to the ridge.
 * The surface is corrugated into rows of round tiles, so it catches light and shade as tiles do.
 */
export function slope(len: number, run: number, s: RoofShape, rows = 14): THREE.BufferGeometry {
  const perRib = 5;
  const cols = Math.max(8, Math.round(len / RIB) * perRib);
  const pos: number[] = [], uv: number[] = [], idx: number[] = [];
  for (let j = 0; j <= rows; j++) {
    const t = (j / rows) * run;
    for (let i = 0; i <= cols; i++) {
      // Columns run straight up the slope; past the hip they are folded back onto it.
      const x = Math.min(len - t, Math.max(t, (i / cols) * len));
      const rib = Math.pow(Math.abs(Math.sin((Math.PI * x) / RIB)), 0.75) * RIB_HEIGHT;
      // Each course of tiles laps the one below: a small step down the slope.
      const lap = (1 - ((t / 0.55) % 1)) * 0.035;
      pos.push(x - len / 2, heightAt(s, len, run, x, t) + rib + lap, -t);
      uv.push(x, t * 1.15);
    }
  }
  for (let j = 0; j < rows; j++)
    for (let i = 0; i < cols; i++) {
      const a = j * (cols + 1) + i, b = a + 1, c = a + cols + 1, d = c + 1;
      idx.push(a, b, d, a, d, c);
    }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

export type Placed = { geometry: THREE.BufferGeometry; position: [number, number, number]; yaw: number };

/** The four slopes of a hipped roof over a w by d rectangle (eave to eave), as placed geometries. */
export function hipped(w: number, d: number, s: RoofShape): Placed[] {
  const run = Math.min(w, d) / 2;
  const long = slope(w, run, s), short = slope(d, run, s);
  return [
    { geometry: long, position: [0, 0, d / 2], yaw: 0 },
    { geometry: long, position: [0, 0, -d / 2], yaw: Math.PI },
    { geometry: short, position: [w / 2, 0, 0], yaw: Math.PI / 2 },
    { geometry: short, position: [-w / 2, 0, 0], yaw: -Math.PI / 2 },
  ];
}

/** The line of a hip, from an eave corner up to the end of the ridge, for laying a ridge of tiles along it. */
export function hipLine(w: number, d: number, s: RoofShape, sx: 1 | -1, sz: 1 | -1, steps = 10): THREE.Vector3[] {
  const run = Math.min(w, d) / 2;
  const pts: THREE.Vector3[] = [];
  for (let k = 0; k <= steps; k++) {
    const t = (k / steps) * run;
    const y = s.rise * Math.pow(t / run, s.power) + s.lift * Math.pow(1 - t / run, 2);
    pts.push(new THREE.Vector3(sx * (w / 2 - t), y + RIB_HEIGHT + 0.04, sz * (d / 2 - t)));
  }
  return pts;
}

/**
 * The trim of a hipped roof in one geometry: a rounded edge along all four eaves, following their lift,
 * and a ridge of tiles down each hip, each ending in a turned-up tip.
 */
export function trim(w: number, d: number, s: RoofShape, radius = 0.11): THREE.BufferGeometry {
  const run = Math.min(w, d) / 2;
  const parts: THREE.BufferGeometry[] = [];
  const eave = (len: number, place: (x: number, y: number) => THREE.Vector3) => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 24; i++) {
      const x = (i / 24) * len;
      pts.push(place(x - len / 2, heightAt(s, len, run, x, 0) + 0.02));
    }
    parts.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 48, radius, 6));
  };
  eave(w, (x, y) => new THREE.Vector3(x, y, d / 2));
  eave(w, (x, y) => new THREE.Vector3(x, y, -d / 2));
  eave(d, (x, y) => new THREE.Vector3(w / 2, y, x));
  eave(d, (x, y) => new THREE.Vector3(-w / 2, y, x));
  for (const sx of [1, -1] as const)
    for (const sz of [1, -1] as const) {
      const pts = hipLine(w, d, s, sx, sz, 12);
      // The tip turns up and out past the corner.
      pts.unshift(new THREE.Vector3(sx * (w / 2 + 0.28), pts[0].y + 0.2, sz * (d / 2 + 0.28)));
      parts.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 28, radius * 1.25, 7));
    }
  return mergeGeometries(parts.map((g) => g.toNonIndexed()))!;
}

/** Rafter ends: a row of small blocks under each eave, set back a little from the edge. */
export function rafters(w: number, d: number, s: RoofShape, spacing = 0.42): THREE.BufferGeometry {
  const run = Math.min(w, d) / 2;
  const parts: THREE.BufferGeometry[] = [];
  const row = (len: number, place: (g: THREE.BufferGeometry, x: number, y: number) => void) => {
    const n = Math.floor((len - 1) / spacing);
    for (let i = 0; i <= n; i++) {
      const x = 0.5 + i * spacing;
      const y = heightAt(s, len, run, x, 0.45) - 0.14;
      const g = new THREE.BoxGeometry(0.14, 0.16, 0.7);
      place(g, x - len / 2, y);
      parts.push(g);
    }
  };
  row(w, (g, x, y) => g.translate(x, y, d / 2 - 0.5));
  row(w, (g, x, y) => g.translate(x, y, -d / 2 + 0.5));
  row(d, (g, x, y) => g.rotateY(Math.PI / 2).translate(w / 2 - 0.5, y, x));
  row(d, (g, x, y) => g.rotateY(Math.PI / 2).translate(-w / 2 + 0.5, y, x));
  return mergeGeometries(parts)!;
}
