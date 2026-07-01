import { useRef, useState } from "react";
import { useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface BookProps {
  position: [number, number, number];
  coverUrl: string;
  width?: number;
  height?: number;
  depth?: number;
  onClick?: () => void;
}

const EPS = 0.001; // Epsilon threshold for early return

export default function Book({
  position,
  coverUrl,
  width = 0.6,
  height = 0.85,
  depth = 0.15,
  onClick,
}: BookProps) {
  const coverTexture = useTexture(coverUrl);
  coverTexture.colorSpace = THREE.SRGBColorSpace;

  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const tiltAngle: [number, number, number] = [-0.15, 0, 0];
  const targetZ = hovered ? position[2] + 0.9 : position[2];

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    const currentZ = meshRef.current.position.z;
    const zDiff = Math.abs(currentZ - targetZ);

    // Stop calculating if the book has reached its destination
    if (zDiff < EPS) return;

    // Use damp instead of lerp for framerate-independent smoothing
    meshRef.current.position.z = THREE.MathUtils.damp(
      currentZ,
      targetZ,
      6,
      delta,
    );
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      rotation={tiltAngle}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "auto";
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (onClick) {
          onClick();
        } else {
          console.log(
            `Clicked book with cover: ${coverUrl}. Ready to load 3D viewer!`,
          );
        }
      }}
    >
      <boxGeometry args={[width, height, depth]} />
      <meshStandardMaterial
        attach="material-0"
        color="#f5f5dc"
        roughness={0.9}
      />
      <meshStandardMaterial
        attach="material-1"
        color="#2b2b2b"
        roughness={0.7}
      />
      <meshStandardMaterial
        attach="material-2"
        color="#f5f5dc"
        roughness={0.9}
      />
      <meshStandardMaterial
        attach="material-3"
        color="#f5f5dc"
        roughness={0.9}
      />
      <meshBasicMaterial
        attach="material-4"
        map={coverTexture}
        toneMapped={false}
        color="#ffffff"
      />
      <meshStandardMaterial
        attach="material-5"
        color="#2b2b2b"
        roughness={0.7}
      />
    </mesh>
  );
}
