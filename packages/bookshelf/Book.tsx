import React, { useRef, useState } from "react";
import { useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface BookProps {
  position: [number, number, number];
  coverUrl: string;
  width?: number;
  height?: number;
  depth?: number;
  onClick?: () => void; // <-- Add this for your future routing
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

  // 1. Create a reference to directly manipulate the mesh in the render loop
  const meshRef = useRef<THREE.Mesh>(null);

  // 2. Track whether the mouse is over this specific book
  const [hovered, setHovered] = useState(false);

  const tiltAngle: [number, number, number] = [-0.15, 0, 0];

  // 3. Define the target Z position.
  // If hovered, we pull the book forward by 0.2 units. Otherwise, it stays at its original position.
  const targetZ = hovered ? position[2] + 0.90 : position[2];

  // 4. useFrame runs on every single frame (like 60fps)
  useFrame(() => {
    if (meshRef.current) {
      // Smoothly animate the current Z position towards the targetZ
      meshRef.current.position.z = THREE.MathUtils.lerp(
        meshRef.current.position.z,
        targetZ,
        0.1, // This number controls the speed of the animation. Lower is slower.
      );
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      rotation={tiltAngle}
      // --- Interaction Events ---
      onPointerOver={(e) => {
        e.stopPropagation(); // Prevents triggering hover on objects behind the book
        setHovered(true);
        document.body.style.cursor = "pointer"; // Change to hand cursor
      }}
      onPointerOut={(e) => {
        setHovered(false);
        document.body.style.cursor = "auto"; // Revert cursor
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
      <meshStandardMaterial
        attach="material-4"
        map={coverTexture}
        roughness={0.4}
      />
      <meshStandardMaterial
        attach="material-5"
        color="#2b2b2b"
        roughness={0.7}
      />
    </mesh>
  );
}
