import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { stage } from "~/stage";
import { FOV, orbitAt, orbitPose, type Key, type Orbit } from "./camera";
import { Compound } from "./build/Compound";
import { groundHeight, inFrame, Land, landState, SITE, toFrame, VIEW_AZIMUTH } from "./world/Land";

const DEG = Math.PI / 180;

// The camera's standpoints through the Opening sequence, aimed at points given in the picture's own frame.
// Arrival: far back on the path at head height, the whole landscape ahead.
const ARRIVAL: Orbit = { target: inFrame(0, 5.2, 0), polar: 89.6 * DEG, azimuth: VIEW_AZIMUTH, distance: 150 };
// Approach: low along the path and through the gate, then up and over the site.
const NEARING: Orbit = { target: inFrame(0.5, 4.2, 0), polar: 87 * DEG, azimuth: VIEW_AZIMUTH + 2 * DEG, distance: 92 };
// Over the sheet: high enough to read the plan and look down into the rooms as they fold up.
const OVER: Orbit = { target: inFrame(1.8, 1.6, 0.4), polar: 50 * DEG, azimuth: VIEW_AZIMUTH + 12 * DEG, distance: 78 };
// Through Ink and Paint the view drifts round a little and comes down.
const PAINTED: Orbit = { target: inFrame(2.0, 3.0, 0.2), polar: 62 * DEG, azimuth: VIEW_AZIMUTH + 3 * DEG, distance: 80 };
// The Plate: level with the buildings, the ranges behind them.
const PLATE: Orbit = { target: inFrame(2.4, 6.6, 0), polar: 85.5 * DEG, azimuth: VIEW_AZIMUTH, distance: 84 };

const KEYS: Key[] = [
  { at: 0.04, orbit: ARRIVAL },
  { at: 0.2, orbit: NEARING },
  { at: 0.36, orbit: OVER },
  { at: 0.88, orbit: PAINTED },
  { at: 0.985, orbit: PLATE },
];

// The visitor can look around: the view leans a little towards the pointer, and a drag turns it.
const look = { leanX: 0, leanY: 0, towardsX: 0, towardsY: 0, turn: 0, towardsTurn: 0, dragging: false, lastX: 0 };
const MAX_TURN = 0.6;

function Rig() {
  const { camera, invalidate, gl, size } = useThree();
  const stageEl = useMemo(() => gl.domElement.closest<HTMLElement>("[data-stage]"), [gl]);

  useEffect(() => stage.subscribe(() => invalidate()), [invalidate]);

  // The picture is composed for a wide screen. On a tall one the lens opens up so the same width is in view.
  useEffect(() => {
    const lens = camera as THREE.PerspectiveCamera;
    lens.fov = FOV * Math.min(2.4, Math.max(1, 1.45 / (size.width / size.height)));
    lens.updateProjectionMatrix();
    invalidate();
  }, [camera, size.width, size.height, invalidate]);

  useEffect(() => {
    const el = gl.domElement;
    const move = (e: PointerEvent) => {
      look.towardsX = e.clientX / innerWidth - 0.5;
      look.towardsY = e.clientY / innerHeight - 0.5;
      if (look.dragging) {
        look.towardsTurn = Math.max(-MAX_TURN, Math.min(MAX_TURN, look.towardsTurn - (e.clientX - look.lastX) * 0.0035));
        look.lastX = e.clientX;
      }
      invalidate();
    };
    const down = (e: PointerEvent) => {
      look.dragging = true;
      look.lastX = e.clientX;
      el.style.cursor = "grabbing";
    };
    const up = () => {
      look.dragging = false;
      el.style.cursor = "grab";
    };
    el.style.cursor = "grab";
    el.style.touchAction = "pan-y";
    el.addEventListener("pointerdown", down);
    addEventListener("pointermove", move);
    addEventListener("pointerup", up);
    return () => {
      el.removeEventListener("pointerdown", down);
      removeEventListener("pointermove", move);
      removeEventListener("pointerup", up);
    };
  }, [gl, invalidate]);

  useFrame(() => {
    const { progress, ready } = stage.getState();
    // Ease towards where the pointer asks, and keep drawing until the view has settled.
    look.leanX += (look.towardsX - look.leanX) * 0.07;
    look.leanY += (look.towardsY - look.leanY) * 0.07;
    look.turn += (look.towardsTurn - look.turn) * 0.09;
    const unsettled = Math.abs(look.towardsX - look.leanX) + Math.abs(look.towardsY - look.leanY) + Math.abs(look.towardsTurn - look.turn);
    if (unsettled > 0.0006) invalidate();

    const orbit = orbitAt(KEYS, progress);
    // Far from the site a small turn is a long walk, so the turn is held back until the camera is close.
    const near = 1 - Math.min(1, Math.max(0, (orbit.distance - 90) / 60));
    const pose = orbitPose({
      ...orbit,
      azimuth: orbit.azimuth + look.turn * (0.25 + 0.75 * near) + look.leanX * 0.05,
      polar: Math.min(89.8 * DEG, orbit.polar - look.leanY * 0.012),
    });
    // The camera stays above the ground wherever it is taken.
    const [fx, fz] = toFrame(pose.position[0], pose.position[2]);
    pose.position[1] = Math.max(pose.position[1], groundHeight(fx, fz) + 2.4);
    camera.position.set(...pose.position);
    camera.up.set(...pose.up);
    camera.lookAt(...pose.target);
    camera.updateMatrixWorld();
    stageEl?.style.setProperty("--progress", progress.toFixed(4));
    if (!ready) stage.setState({ ready: true });
  });
  return null;
}

const DAY = { sky: new THREE.Color("#fff3ea"), ground: new THREE.Color("#cdbfb4"), sun: new THREE.Color("#fff0df") };
const NIGHT = { sky: new THREE.Color("#7f93b8"), ground: new THREE.Color("#2c3440"), sun: new THREE.Color("#a9bfe6") };

// Dawn: a warm, low key light from the left and a pale sky to fill the shadows. At Night both sink and cool, as moonlight.
function Lights() {
  const hemi = useRef<THREE.HemisphereLight>(null);
  const sun = useRef<THREE.DirectionalLight>(null);
  useFrame(() => {
    const n = landState.uNight.value;
    if (hemi.current) {
      hemi.current.color.copy(DAY.sky).lerp(NIGHT.sky, n);
      hemi.current.groundColor.copy(DAY.ground).lerp(NIGHT.ground, n);
      hemi.current.intensity = 1.0 - 0.45 * n;
    }
    if (sun.current) {
      sun.current.color.copy(DAY.sun).lerp(NIGHT.sun, n);
      sun.current.intensity = 2.7 - 2.1 * n;
    }
  });
  return (
    <>
      <hemisphereLight ref={hemi} args={["#fff3ea", "#cdbfb4", 1.0]} />
      <directionalLight
        ref={sun}
        position={inFrame(-70, 46, 52)}
        target-position={SITE}
        color="#fff0df"
        intensity={2.7}
        castShadow
        shadow-mapSize={[3072, 3072]}
        shadow-camera-left={-36}
        shadow-camera-right={40}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
        shadow-camera-near={10}
        shadow-camera-far={220}
        shadow-bias={-0.0006}
        shadow-normalBias={0.03}
      />
    </>
  );
}

export default function Diorama() {
  return (
    <Canvas
      frameloop="demand"
      flat
      dpr={[1, 2]}
      shadows={{ type: THREE.PCFSoftShadowMap }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      camera={{ fov: FOV, near: 2, far: 1400 }}
      onCreated={({ gl }) => {
        gl.localClippingEnabled = true;
      }}
    >
      <Rig />
      <Lights />
      <Land />
      <Compound />
    </Canvas>
  );
}
