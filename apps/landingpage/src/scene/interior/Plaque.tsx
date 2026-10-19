import { memo } from "react";
import { Text } from "@react-three/drei";
import * as THREE from "three";

const MAT_BORDER = new THREE.MeshStandardMaterial({
  color: "#e6bb11",
  emissive: "#cc8f00",
  emissiveIntensity: 0.9,
  metalness: 0.2,
  roughness: 0.2,
});
const MAT_WOOD = new THREE.MeshStandardMaterial({ color: "#5c3a21", roughness: 0.9 });
const MAT_GRAIN = new THREE.MeshStandardMaterial({ color: "#4a2f1a", roughness: 0.95 });

interface PlaqueProps {
  text: string;
  symbol: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}

export const Plaque = memo(function Plaque({ text, symbol, position, rotation, scale = 0.7 }: PlaqueProps) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh material={MAT_BORDER} position={[0, 0, -0.02]}>
        <boxGeometry args={[1.8, 0.6, 0.02]} />
      </mesh>
      <mesh material={MAT_WOOD} receiveShadow>
        <boxGeometry args={[1.7, 0.5, 0.04]} />
      </mesh>
      {[0.1, -0.15].map((y) => (
        <mesh key={y} material={MAT_GRAIN} position={[0, y, 0.02]}>
          <boxGeometry args={[1.7, 0.02, 0.01]} />
        </mesh>
      ))}
      <Text position={[-0.62, 0, 0.03]} fontSize={0.25} color="#ffffff" anchorX="center" anchorY="middle">
        {symbol}
      </Text>
      <Text position={[0.1, 0, 0.03]} fontSize={0.2} color="#ffffff" anchorX="center" anchorY="middle" letterSpacing={0.1}>
        {text}
      </Text>
    </group>
  );
});
