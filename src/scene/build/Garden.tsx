import { useMemo } from "react";
import * as THREE from "three";
import { groundHeight, pathX } from "../world/Land";
import { Traveller } from "./Traveller";

// What stands in the landscape before anything is built: the red gate on the path, the pines, a stone lantern.

function Gate({ z }: { z: number }) {
  const x = pathX(z);
  const red = useMemo(() => new THREE.MeshStandardMaterial({ color: "#c8202f", roughness: 0.7 }), []);
  const dark = useMemo(() => new THREE.MeshStandardMaterial({ color: "#2b2a33", roughness: 0.8 }), []);
  return (
    <group position={[x, groundHeight(x, z), z]}>
      {[-1, 1].map((s) => (
        <mesh key={s} material={red} position={[s * 2.3, 2.5, 0]} rotation={[0, 0, s * -0.035]} castShadow>
          <cylinderGeometry args={[0.2, 0.25, 5, 12]} />
        </mesh>
      ))}
      <mesh material={red} position={[0, 4.05, 0]} castShadow>
        <boxGeometry args={[5.6, 0.34, 0.3]} />
      </mesh>
      <mesh material={red} position={[0, 4.95, 0]} castShadow>
        <boxGeometry args={[6.6, 0.36, 0.42]} />
      </mesh>
      <mesh material={dark} position={[0, 5.24, 0]} castShadow>
        <boxGeometry args={[7.1, 0.24, 0.6]} />
      </mesh>
    </group>
  );
}

function Lantern({ at }: { at: [number, number] }) {
  const stoneM = useMemo(() => new THREE.MeshLambertMaterial({ color: "#d8cdbd" }), []);
  return (
    <group position={[at[0], groundHeight(at[0], at[1]), at[1]]}>
      <mesh material={stoneM} position={[0, 0.12, 0]} castShadow><cylinderGeometry args={[0.36, 0.42, 0.24, 16]} /></mesh>
      <mesh material={stoneM} position={[0, 0.62, 0]} castShadow><cylinderGeometry args={[0.12, 0.15, 0.8, 14]} /></mesh>
      <mesh material={stoneM} position={[0, 1.1, 0]} castShadow><cylinderGeometry args={[0.32, 0.2, 0.16, 16]} /></mesh>
      <mesh position={[0, 1.36, 0]} castShadow><boxGeometry args={[0.36, 0.36, 0.36]} /><meshStandardMaterial color="#fff3dc" emissive="#ffcf8a" emissiveIntensity={0.25} /></mesh>
      <mesh material={stoneM} position={[0, 1.7, 0]} castShadow><coneGeometry args={[0.44, 0.3, 4]} /></mesh>
    </group>
  );
}

export function Garden() {
  return (
    <group>
      <Gate z={74} />
      <Traveller />
      <Lantern at={[5.2, 12]} />
      <Lantern at={[-1.8, 12.4]} />
    </group>
  );
}
