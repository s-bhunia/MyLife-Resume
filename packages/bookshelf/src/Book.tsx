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

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.z = THREE.MathUtils.lerp(
        meshRef.current.position.z,
        targetZ,
        0.1,
      );
    }
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
      onPointerOut={(e) => {
        setHovered(false);
        // CRITICAL: Empty string returns control to the House Div's custom default cursor
        document.body.style.cursor = "";
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
