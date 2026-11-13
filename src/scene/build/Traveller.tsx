import { useMemo } from "react";
import * as THREE from "three";
import { groundHeight, pathX } from "../world/Land";

// The Traveller: seen from behind on the first screen, a paper cut-out in ink, with a straw hat hanging on his back.
// The hat is a plain straw hat with a red band.

function body(): THREE.Shape {
  const s = new THREE.Shape();
  // Feet to shoulders, one outline: a long coat over trousers, arms at the sides.
  s.moveTo(-0.2, 0);
  s.lineTo(-0.05, 0);
  s.lineTo(-0.02, 0.78);
  s.lineTo(0.02, 0.78);
  s.lineTo(0.05, 0);
  s.lineTo(0.2, 0);
  s.lineTo(0.24, 0.8);
  s.lineTo(0.3, 0.86);
  s.lineTo(0.36, 0.82);
  s.lineTo(0.33, 1.34);
  s.quadraticCurveTo(0.32, 1.47, 0.16, 1.5);
  s.lineTo(0.07, 1.52);
  s.lineTo(-0.07, 1.52);
  s.lineTo(-0.16, 1.5);
  s.quadraticCurveTo(-0.32, 1.47, -0.33, 1.34);
  s.lineTo(-0.36, 0.82);
  s.lineTo(-0.3, 0.86);
  s.lineTo(-0.24, 0.8);
  s.closePath();
  return s;
}

const disc = (r: number, rx = 1) => {
  const s = new THREE.Shape();
  s.absellipse(0, 0, r * rx, r, 0, Math.PI * 2, false, 0);
  return s;
};

export function Traveller() {
  const g = useMemo(
    () => ({
      body: new THREE.ShapeGeometry(body()),
      head: new THREE.ShapeGeometry(disc(0.125, 0.92), 24),
      pack: new THREE.ShapeGeometry(disc(0.2, 0.8), 20),
      brim: new THREE.ShapeGeometry(disc(0.31), 32),
      band: new THREE.ShapeGeometry(disc(0.165), 28),
      crown: new THREE.ShapeGeometry(disc(0.135), 28),
      shadow: new THREE.CircleGeometry(0.5, 24),
    }),
    [],
  );
  const ink = "#2b2a33";
  const z = 101, x = pathX(z) - 3.4;
  return (
    <group position={[x, groundHeight(x, z), z]} rotation={[0, 0.16, 0]} scale={1.35}>
      <mesh geometry={g.shadow} rotation={[-Math.PI / 2, 0, 0]} position={[0.35, 0.03, -0.1]} scale={[1.7, 0.6, 1]}>
        <meshBasicMaterial color="#5d6348" transparent opacity={0.45} />
      </mesh>
      <mesh geometry={g.body} castShadow><meshBasicMaterial color={ink} side={THREE.DoubleSide} /></mesh>
      <mesh geometry={g.head} position={[0, 1.66, 0.004]}><meshBasicMaterial color={ink} /></mesh>
      <mesh geometry={g.pack} position={[0, 1.06, 0.008]}><meshBasicMaterial color="#44434f" /></mesh>
      {/* The hat hangs from its cord between the shoulders. */}
      <group position={[0.02, 1.2, 0.02]} rotation={[0, 0, -0.08]}>
        <mesh geometry={g.brim}><meshBasicMaterial color="#e9d49c" /></mesh>
        <mesh geometry={g.band} position={[0, 0, 0.004]}><meshBasicMaterial color="#c8202f" /></mesh>
        <mesh geometry={g.crown} position={[0, 0, 0.008]}><meshBasicMaterial color="#f3e5bb" /></mesh>
      </group>
    </group>
  );
}
