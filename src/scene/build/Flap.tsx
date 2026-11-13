import { useMemo } from "react";
import * as THREE from "three";

// A paper flap: a thin board hinged along its foot. It lies flat on the far side of the hinge and folds up to stand.

export type FlapProps = {
  from: [number, number];
  to: [number, number];
  height: number;
  face: THREE.Material;
  edge: THREE.Material;
  thickness?: number;
  /** Receives the inner group, whose rotation.x is the hinge angle (0 standing, a quarter turn lying outwards). */
  hinge: (g: THREE.Group | null) => void;
};

export function Flap({ from, to, height, face, edge, thickness = 0.14, hinge }: FlapProps) {
  const dx = to[0] - from[0], dz = to[1] - from[1];
  const length = Math.hypot(dx, dz);
  const geometry = useMemo(() => {
    const g = new THREE.BoxGeometry(length, height, thickness);
    g.translate(length / 2, height / 2, 0);
    return g;
  }, [length, height, thickness]);
  const materials = useMemo(() => [edge, edge, edge, edge, face, face], [face, edge]);
  return (
    <group position={[from[0], 0, from[1]]} rotation={[0, Math.atan2(-dz, dx), 0]}>
      <group ref={hinge}>
        <mesh geometry={geometry} material={materials} castShadow receiveShadow />
      </group>
    </group>
  );
}

/** The four sides of a rectangle, walked so that every flap's outer face points away from the centre. */
export function rectangle(hx: number, hz: number): { id: string; from: [number, number]; to: [number, number] }[] {
  return [
    { id: "front", from: [-hx, hz], to: [hx, hz] },
    { id: "right", from: [hx, hz], to: [hx, -hz] },
    { id: "back", from: [hx, -hz], to: [-hx, -hz] },
    { id: "left", from: [-hx, -hz], to: [-hx, hz] },
  ];
}
