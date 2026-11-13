import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { stage } from "~/stage";
import { FOV, orbitAt, orbitPose, type Key, type Orbit } from "./camera";
import { Compound } from "./build/Compound";
import { inFrame, Land, landState, SITE, VIEW_AZIMUTH } from "./world/Land";

const DEG = Math.PI / 180;

// The camera's standpoints through the Opening sequence, aimed at points given in the picture's own frame.
// Arrival: far back on the path at head height, the whole landscape ahead.
const ARRIVAL: Orbit = { target: inFrame(0, 3.6, 0), polar: 89.75 * DEG, azimuth: VIEW_AZIMUTH, distance: 150 };
// Approach: low along the path and through the gate, then up and over the site.
const NEARING: Orbit = { target: inFrame(0.5, 4.2, 0), polar: 87 * DEG, azimuth: VIEW_AZIMUTH + 2 * DEG, distance: 92 };
const OVER: Orbit = { target: inFrame(1.6, 2.8, 0.5), polar: 60 * DEG, azimuth: VIEW_AZIMUTH + 9 * DEG, distance: 82 };
// The build is watched from one settled view, as a print would show it.
const BUILD: Orbit = { target: inFrame(2.2, 5.6, 0), polar: 80 * DEG, azimuth: VIEW_AZIMUTH + 6 * DEG, distance: 80 };
const PLATE: Orbit = { target: inFrame(2.4, 6.6, 0), polar: 85.5 * DEG, azimuth: VIEW_AZIMUTH, distance: 84 };

const KEYS: Key[] = [
  { at: 0.04, orbit: ARRIVAL },
  { at: 0.2, orbit: NEARING },
  { at: 0.34, orbit: OVER },
  { at: 0.48, orbit: BUILD },
  { at: 0.86, orbit: BUILD },
  { at: 0.98, orbit: PLATE },
];

// The visitor can look around: the view leans a little towards the pointer, and a drag turns it.
const look = { leanX: 0, leanY: 0, towardsX: 0, towardsY: 0, turn: 0, towardsTurn: 0, dragging: false, lastX: 0 };
const MAX_TURN = 0.7;

function Rig() {
  const { camera, invalidate, gl } = useThree();
  const stageEl = useMemo(() => gl.domElement.closest<HTMLElement>("[data-stage]"), [gl]);

  useEffect(() => stage.subscribe(() => invalidate()), [invalidate]);

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
    const pose = orbitPose({
      ...orbit,
      azimuth: orbit.azimuth + look.turn + look.leanX * 0.05,
      polar: Math.min(89.8 * DEG, orbit.polar - look.leanY * 0.012),
    });
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
      hemi.current.intensity = 1.25 - 0.62 * n;
    }
    if (sun.current) {
      sun.current.color.copy(DAY.sun).lerp(NIGHT.sun, n);
      sun.current.intensity = 2.3 - 1.75 * n;
    }
  });
  return (
    <>
      <hemisphereLight ref={hemi} args={["#fff3ea", "#cdbfb4", 1.25]} />
      <directionalLight
        ref={sun}
        position={[SITE[0] - 42, 30, SITE[2] + 22]}
        target-position={SITE}
        color="#fff0df"
        intensity={2.3}
        castShadow
        shadow-mapSize={[3072, 3072]}
        shadow-camera-left={-42}
        shadow-camera-right={46}
        shadow-camera-top={34}
        shadow-camera-bottom={-34}
        shadow-camera-near={2}
        shadow-camera-far={140}
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
