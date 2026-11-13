import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { poseAt } from "~/scene/fold";
import { beatProgress, stage } from "~/stage";
import { FOV, orbitAt, orbitPose, overheadOrbit, type Key } from "./camera";
import { matrix3d, type Pt } from "./homography";
import { PLAN, ROOM_RECTS } from "./house/layout";
import { Roof } from "./house/Roof";
import { HOUSE, type PanelShape } from "./house/walls";
import { measureSheet, type SheetMeasure } from "./measure";
import { makePaper, paperState } from "./paper/material";
import { Land, landState } from "./world/Land";
import { Pagoda } from "./world/Pagoda";

export const PLAN_PAD = 0.4;
const DEG = Math.PI / 180;

// Where the camera rests once the House stands, and once the whole Plate is in view.
const HOUSE_VIEW = { target: [4.4, 0.5, 4.3] as [number, number, number], polar: 42 * DEG, azimuth: 30 * DEG, distance: 40 };
const PAINT_VIEW = { target: [4.6, 0.7, 4.0] as [number, number, number], polar: 50 * DEG, azimuth: 20 * DEG, distance: 44 };
const PLATE_VIEW = { target: [5.6, 2.9, 3.2] as [number, number, number], polar: 82 * DEG, azimuth: 26 * DEG, distance: 47 };

const SHADOW = new THREE.ShadowMaterial({ transparent: true, opacity: 0, color: "#1f3038" });
const smooth01 = (a: number, b: number, x: number) => {
  const u = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return u * u * (3 - 2 * u);
};

function Panel({ shape, children, register, layer = 0 }: { shape: PanelShape; children?: React.ReactNode; register: (id: string, g: THREE.Group) => void; layer?: number }) {
  const geometry = useMemo(() => {
    const g = new THREE.PlaneGeometry(shape.length, shape.height);
    g.translate(shape.length / 2, shape.height / 2, 0); // the hinge runs along the bottom edge
    return g;
  }, [shape.length, shape.height]);
  const material = useMemo(() => makePaper(shape.look, [shape.length, shape.height]), [shape.look, shape.length, shape.height]);
  return (
    <group position={[shape.origin[0], shape.origin[1] + (shape.parent ? 0 : 0.02 + layer * 0.006), shape.origin[2]]} rotation={[0, shape.yaw, 0]}>
      <group ref={(g) => { if (g) register(shape.id, g); }}>
        <mesh geometry={geometry} material={material} castShadow receiveShadow />
        {children}
      </group>
    </group>
  );
}

function Floor({ x, z, w, d, look }: { x: number; z: number; w: number; d: number; look: "floor" | "boards" }) {
  const material = useMemo(() => makePaper(look, [w, d]), [look, w, d]);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[x + w / 2, 0.012, z + d / 2]} material={material} receiveShadow renderOrder={2}>
      <planeGeometry args={[w, d]} />
    </mesh>
  );
}

function House() {
  const hinges = useRef(new Map<string, THREE.Group>());
  const register = (id: string, g: THREE.Group) => hinges.current.set(id, g);
  const roots = HOUSE.shapes.filter((s) => !s.parent);
  const kids = (id: string) => HOUSE.shapes.filter((s) => s.parent === id);

  useFrame(() => {
    const progress = stage.getState().progress;
    // At rest the page is the printed Sheet alone; the flaps print in as the scroll begins.
    const shown = smooth01(0.015, 0.09, progress);
    paperState.uShown.value = shown;
    paperState.uInk.value = beatProgress(progress, "ink");
    paperState.uPaint.value = beatProgress(progress, "paint");
    paperState.uNight.value = landState.uNight.value; // Land owns the Day and Night cross-fade
    SHADOW.opacity = 0.22 * shown;
    const pose = poseAt(HOUSE.plan, beatProgress(progress, "fold"));
    hinges.current.forEach((g, id) => {
      g.rotation.x = pose.get(id) ?? 0;
    });
  });

  return (
    <group>
      {ROOM_RECTS.filter((r) => r.id !== "garden").map((r) => (
        <Floor key={r.id} x={r.x} z={r.y} w={r.w} d={r.h} look={r.id === "lookout" ? "boards" : "floor"} />
      ))}
      <Roof x={0} z={0} w={7} d={6} wallHeight={1.6} />
      {roots.map((s, i) => (
        <Panel key={s.id} shape={s} register={register} layer={i}>
          {kids(s.id).map((k) => (
            <Panel key={k.id} shape={k} register={register} />
          ))}
        </Panel>
      ))}
    </group>
  );
}

function Rig({ stageEl }: { stageEl: HTMLElement }) {
  const { camera, invalidate, size } = useThree();
  const measure = useRef<SheetMeasure | null>(null);
  const keys = useRef<Key[]>([]);
  const sheetEl = useMemo(() => stageEl.querySelector<HTMLElement>("[data-sheet]"), [stageEl]);
  const corner = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    const m = measureSheet(stageEl, PLAN.w + PLAN_PAD * 2, PLAN_PAD);
    measure.current = m;
    if (m) {
      const centre: [number, number] = [(m.viewport.w / 2 - m.origin[0]) / m.pxPerUnit, (m.viewport.h / 2 - m.origin[1]) / m.pxPerUnit];
      keys.current = [
        { at: 0.04, orbit: overheadOrbit(centre, m.pxPerUnit, m.viewport.h) },
        { at: 0.45, orbit: HOUSE_VIEW },
        { at: 0.86, orbit: PAINT_VIEW },
        { at: 0.98, orbit: PLATE_VIEW },
      ];
    }
    invalidate();
  }, [stageEl, size.width, size.height, invalidate]);

  useEffect(() => stage.subscribe(() => invalidate()), [invalidate]);

  useFrame(() => {
    const m = measure.current;
    if (!m || !keys.current.length) return;
    const progress = stage.getState().progress;
    const pose = orbitPose(orbitAt(keys.current, progress));
    camera.position.set(...pose.position);
    camera.up.set(...pose.up);
    camera.lookAt(...pose.target);
    camera.updateMatrixWorld();

    stageEl.style.setProperty("--progress", progress.toFixed(4));
    // What the top row sits on: the slate table at rest, the moving Sheet, or the painted plain.
    const phase = progress < 0.03 ? "rest" : beatProgress(progress, "paint") > 0.75 ? "plate" : "moving";
    if (stageEl.dataset.phase !== phase) stageEl.dataset.phase = phase;
    if (!sheetEl) return;
    // Once the plain has covered it, the Sheet has done its work.
    sheetEl.style.visibility = beatProgress(progress, "paint") >= 0.6 ? "hidden" : "";
    if (progress <= keys.current[0].at) {
      sheetEl.style.transform = "";
      return;
    }
    // Project the Sheet's corners and bend the DOM Sheet onto them.
    const s = m.sheet;
    const quad = (
      [
        [s.x, s.y],
        [s.x + s.w, s.y],
        [s.x + s.w, s.y + s.h],
        [s.x, s.y + s.h],
      ] as Pt[]
    ).map(([px, py]) => {
      corner.set((px - m.origin[0]) / m.pxPerUnit, 0, (py - m.origin[1]) / m.pxPerUnit).project(camera);
      return [((corner.x + 1) / 2) * m.viewport.w - s.x, ((1 - corner.y) / 2) * m.viewport.h - s.y] as Pt;
    }) as [Pt, Pt, Pt, Pt];
    const css = matrix3d(s.w, s.h, quad);
    if (css) sheetEl.style.transform = css;
  });
  return null;
}

export default function Diorama({ stageEl }: { stageEl: HTMLElement }) {
  return (
    <Canvas
      frameloop="demand"
      flat
      dpr={[1, 2]}
      shadows
      gl={{ alpha: true, antialias: true }}
      onCreated={({ gl }) => { gl.setClearAlpha(0); paperState.uDotScale.value = 4 * gl.getPixelRatio(); }}
      camera={{ fov: FOV, near: 1, far: 600 }}
    >
      <Rig stageEl={stageEl} />
      <hemisphereLight args={["#ffffff", "#c9d3d8", 1.6]} />
      <directionalLight
        position={[-9, 16, 7]}
        intensity={1.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-14}
        shadow-camera-right={18}
        shadow-camera-top={16}
        shadow-camera-bottom={-16}
        shadow-bias={-0.0006}
        shadow-normalBias={0.06}
      />
      <Land />
      <House />
      <Pagoda position={[8.5, 0, 1.55]} scale={0.72} />
      {/* Catches shadows only, so they fall on the DOM Sheet beneath the canvas. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[5, 0, 2]} material={SHADOW} receiveShadow>
        <planeGeometry args={[60, 60]} />
      </mesh>
    </Canvas>
  );
}
