import { Canvas } from "@react-three/fiber";

// Placeholder scene. GH-7 replaces it with the House.
export default function Diorama() {
  return (
    <Canvas frameloop="demand" dpr={[1, 2]} camera={{ position: [0, 3, 4], fov: 30 }}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2, 2.8]} />
        <meshBasicMaterial color="#f7f9fa" />
      </mesh>
    </Canvas>
  );
}
