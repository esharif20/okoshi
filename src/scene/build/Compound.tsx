import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { beatProgress, stage } from "~/stage";
import { landState, SHEET, SITE, TURN, VIEW_AZIMUTH } from "../world/Land";
import { Garden } from "./Garden";
import { Hall } from "./Hall";
import { Pagoda } from "./Pagoda";
import { glowing, paintState } from "./painted";
import { planSheet } from "./textures";

// Everything that is built: the hall and the Pagoda on their sheet of paper, and the garden around them.
// This is where the scroll position becomes fold, ink and paint.

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (a: number, b: number, x: number) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};

export function Compound() {
  const { gl } = useThree();
  const sheet = useRef<THREE.MeshLambertMaterial>(null);
  const paper = useMemo(planSheet, []);

  useFrame(() => {
    const { progress } = stage.getState();
    paintState.uInk.value = beatProgress(progress, "ink");
    paintState.uPaint.value = beatProgress(progress, "paint");
    paintState.uDotScale.value = 4 * gl.getPixelRatio();
    // Once painted, the paper the buildings stood on is gone and they stand on the ground.
    if (sheet.current) {
      sheet.current.opacity = 1 - smooth(0.25, 0.9, paintState.uPaint.value);
      sheet.current.visible = sheet.current.opacity > 0.01;
    }
    for (const m of glowing) m.emissiveIntensity = landState.uNight.value * 0.75;
  });

  const fold = () => beatProgress(stage.getState().progress, "fold");

  return (
    <group position={SITE} rotation={[0, VIEW_AZIMUTH, 0]}>
      <Garden />
      <group rotation={[0, TURN, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[SHEET.x, 0.05, SHEET.z]} receiveShadow>
          <planeGeometry args={[SHEET.w - 1, SHEET.d - 1]} />
          <meshLambertMaterial ref={sheet} map={paper} transparent />
        </mesh>
        <group position={[-3.4, 0.06, 0.4]}>
          <Hall build={() => clamp01(fold() / 0.85)} />
        </group>
        <group position={[9.6, 0.06, -1.2]}>
          <Pagoda build={() => clamp01((fold() - 0.3) / 0.7)} />
        </group>
      </group>
    </group>
  );
}
