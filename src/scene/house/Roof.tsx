import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { beatProgress, stage } from "~/stage";
import { makePaper } from "../paper/material";

// The House's great roof. It is left off while the visitor looks into the Rooms and is lowered on for the Plate.
// A hipped roof whose height depends only on the distance in from the eave, which gives the ridge and hips for free.

const OVER = 0.9; // overhang beyond the walls
const RISE = 2.3;
const SEG = 14;

const smooth = (u: number) => u * u * (3 - 2 * u);
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

/** One slope: `len` along the eave, `run` in from the eave to the ridge or hip point. `tri` slopes end in a point. */
function slope(len: number, run: number): THREE.BufferGeometry {
  const pos: number[] = [], uv: number[] = [], idx: number[] = [];
  // The classic sweep: nearly flat at the eave, steep at the ridge, with the eave lifting a little towards each corner.
  const height = (t: number, across: number) => RISE * Math.pow(t / run, 1.45) + 0.22 * Math.pow(Math.abs(across * 2 - 1), 3) * (1 - t / run);
  for (let j = 0; j <= SEG; j++) {
    const t = (j / SEG) * run;
    for (let i = 0; i <= SEG; i++) {
      const a = i / SEG;
      const x = t + a * (len - 2 * t); // each row is shorter by the run on both sides: the hips
      pos.push(x - len / 2, height(t, a), -t);
      uv.push(x / len, t / run);
    }
  }
  for (let j = 0; j < SEG; j++)
    for (let i = 0; i < SEG; i++) {
      const a = j * (SEG + 1) + i, b = a + 1, c = a + SEG + 1, d = c + 1;
      idx.push(a, b, d, a, d, c);
    }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

export function Roof({ x, z, w, d, wallHeight }: { x: number; z: number; w: number; d: number; wallHeight: number }) {
  const group = useRef<THREE.Group>(null);
  const W = w + OVER * 2, D = d + OVER * 2;
  const run = D / 2;
  const parts = useMemo(() => {
    const long = slope(W, run);
    const short = slope(D, run);
    const slopeLen = Math.hypot(run, RISE);
    return {
      long,
      short,
      longPaper: [makePaper("eave", [W, slopeLen]), makePaper("eave", [W, slopeLen])],
      shortPaper: [makePaper("eave", [D, slopeLen]), makePaper("eave", [D, slopeLen])],
    };
  }, [W, D, run]);

  useFrame(() => {
    const g = group.current;
    if (!g) return;
    const e = smooth(clamp01(beatProgress(stage.getState().progress, "plate") / 0.7));
    g.visible = e > 0;
    g.position.y = wallHeight + (1 - e) * 7;
    g.scale.setScalar(0.92 + 0.08 * e);
  });

  return (
    <group ref={group} position={[x + w / 2, wallHeight, z + d / 2]} visible={false}>
      <mesh geometry={parts.long} material={parts.longPaper[0]} position={[0, 0, D / 2]} castShadow />
      <mesh geometry={parts.long} material={parts.longPaper[1]} position={[0, 0, -D / 2]} rotation={[0, Math.PI, 0]} castShadow />
      <mesh geometry={parts.short} material={parts.shortPaper[0]} position={[W / 2, 0, 0]} rotation={[0, Math.PI / 2, 0]} castShadow />
      <mesh geometry={parts.short} material={parts.shortPaper[1]} position={[-W / 2, 0, 0]} rotation={[0, -Math.PI / 2, 0]} castShadow />
    </group>
  );
}
