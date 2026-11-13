import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { stage } from "~/stage";
import { groundHeight, HOUSE_AT, pathX, TURN } from "../world/Land";

// The Traveller: the visitor's guide. A paper cut-out in ink, seen from behind, with a straw hat hanging on
// his back (a plain straw hat with a red band). He walks the path as the visitor scrolls in, stands at the edge
// of the court while the House is built, then climbs the steps and goes in through the door ahead of the camera.

/** A point in the House's own frame, in the frame the Traveller lives in (the picture's frame). */
function fromHouse(x: number, z: number): [number, number] {
  const X = x + HOUSE_AT[0], Z = z + HOUSE_AT[2];
  const c = Math.cos(TURN), s = Math.sin(TURN);
  return [X * c + Z * s, -X * s + Z * c];
}

type Stop = { at: number; x: number; z: number; lift?: number };
// Where he is at each point of the Opening sequence. Between stops he walks in a straight line.
const WATCH_Z = 14.5;
const STOPS: Stop[] = [
  { at: 0.03, x: pathX(101) - 0.7, z: 101 },
  { at: 0.1, x: pathX(74) - 0.5, z: 74 },
  { at: 0.17, x: pathX(46) - 0.5, z: 46 },
  { at: 0.25, x: pathX(WATCH_Z) - 0.4, z: WATCH_Z },
  { at: 0.845, x: pathX(WATCH_Z) - 0.4, z: WATCH_Z },
  { at: 0.895, x: fromHouse(2.5, 6.6)[0], z: fromHouse(2.5, 6.6)[1] },
  { at: 0.92, x: fromHouse(2.5, 4.4)[0], z: fromHouse(2.5, 4.4)[1], lift: 0.78 },
  { at: 0.95, x: fromHouse(2.7, 2.2)[0], z: fromHouse(2.7, 2.2)[1], lift: 0.78 },
];

const leg = (side: 1 | -1) => {
  const s = new THREE.Shape();
  s.moveTo(side * 0.03, 0.8);
  s.lineTo(side * 0.23, 0.8);
  s.lineTo(side * 0.2, 0);
  s.lineTo(side * 0.05, 0);
  s.closePath();
  return s;
};

function coat(): THREE.Shape {
  const s = new THREE.Shape();
  s.moveTo(-0.25, 0.72);
  s.lineTo(0.25, 0.72);
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
  s.closePath();
  return s;
}

const disc = (r: number, rx = 1) => {
  const s = new THREE.Shape();
  s.absellipse(0, 0, r * rx, r, 0, Math.PI * 2, false, 0);
  return s;
};

const smooth = (u: number) => u * u * (3 - 2 * u);

export function Traveller() {
  const root = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const legs = useRef<(THREE.Mesh | null)[]>([]);
  const hat = useRef<THREE.Group>(null);
  const g = useMemo(
    () => ({
      coat: new THREE.ShapeGeometry(coat()),
      legs: [new THREE.ShapeGeometry(leg(-1)), new THREE.ShapeGeometry(leg(1))],
      head: new THREE.ShapeGeometry(disc(0.125, 0.92), 24),
      pack: new THREE.ShapeGeometry(disc(0.2, 0.8), 20),
      brim: new THREE.ShapeGeometry(disc(0.31), 32),
      band: new THREE.ShapeGeometry(disc(0.165), 28),
      crown: new THREE.ShapeGeometry(disc(0.135), 28),
      shadow: new THREE.CircleGeometry(0.5, 24),
    }),
    [],
  );
  const walked = useRef(0);
  const last = useRef<[number, number] | null>(null);

  useFrame(({ camera }) => {
    const p = stage.getState().progress;
    let i = STOPS.findIndex((s) => p < s.at);
    if (i === -1) i = STOPS.length;
    const a = STOPS[Math.max(0, i - 1)], b = STOPS[Math.min(STOPS.length - 1, i)];
    const u = a === b ? 0 : smooth(Math.min(1, Math.max(0, (p - a.at) / (b.at - a.at))));
    const x = a.x + (b.x - a.x) * u, z = a.z + (b.z - a.z) * u;
    const lift = (a.lift ?? 0) + ((b.lift ?? 0) - (a.lift ?? 0)) * u;
    if (!root.current || !body.current) return;

    // How far he has walked drives his step, so he walks only when the scroll moves him, in either direction.
    if (last.current) walked.current += Math.hypot(x - last.current[0], z - last.current[1]);
    last.current = [x, z];
    const stride = walked.current * 2.4;
    body.current.position.y = Math.abs(Math.sin(stride)) * 0.07;
    body.current.rotation.z = Math.sin(stride) * 0.035;
    legs.current[0]?.scale.set(1, 0.9 + 0.1 * Math.sin(stride), 1);
    legs.current[1]?.scale.set(1, 0.9 - 0.1 * Math.sin(stride), 1);
    if (hat.current) hat.current.rotation.z = -0.08 + Math.sin(stride) * 0.09;

    root.current.position.set(x, groundHeight(x, z) * (1 - Math.min(1, lift * 4)) + lift, z);
    // Smaller as the view comes down among the buildings, where he must be the size of a man; gone once he is indoors.
    const size = 1.35 - 0.3 * smooth(Math.min(1, Math.max(0, (p - 0.1) / 0.16)));
    const indoors = smooth(Math.min(1, Math.max(0, (p - 0.95) / 0.012)));
    root.current.scale.setScalar(size * (1 - indoors));
    root.current.visible = indoors < 1;
    // A cut-out always shows its face to the viewer: here, his back.
    const parent = root.current.parent!;
    const local = parent.worldToLocal(camera.position.clone());
    root.current.rotation.y = Math.atan2(local.x - x, local.z - z);
  });

  const ink = "#2b2a33";
  return (
    <group ref={root}>
      <mesh geometry={g.shadow} rotation={[-Math.PI / 2, 0, 0]} position={[0.35, 0.03, -0.1]} scale={[1.7, 0.6, 1]}>
        <meshBasicMaterial color="#5d6348" transparent opacity={0.45} />
      </mesh>
      <group ref={body}>
        {g.legs.map((geometry, i) => (
          <mesh key={i} geometry={geometry} ref={(m) => { legs.current[i] = m; }}>
            <meshBasicMaterial color={ink} side={THREE.DoubleSide} />
          </mesh>
        ))}
        <mesh geometry={g.coat} position={[0, 0, 0.004]}><meshBasicMaterial color={ink} side={THREE.DoubleSide} /></mesh>
        <mesh geometry={g.head} position={[0, 1.66, 0.006]}><meshBasicMaterial color={ink} /></mesh>
        <mesh geometry={g.pack} position={[0, 1.06, 0.01]}><meshBasicMaterial color="#44434f" /></mesh>
        {/* The hat hangs from its cord between the shoulders, and swings a little as he walks. */}
        <group ref={hat} position={[0.02, 1.2, 0.02]}>
          <mesh geometry={g.brim}><meshBasicMaterial color="#e9d49c" /></mesh>
          <mesh geometry={g.band} position={[0, 0, 0.004]}><meshBasicMaterial color="#c8202f" /></mesh>
          <mesh geometry={g.crown} position={[0, 0, 0.008]}><meshBasicMaterial color="#f3e5bb" /></mesh>
        </group>
      </group>
    </group>
  );
}
