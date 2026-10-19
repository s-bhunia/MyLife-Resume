import { useEffect, useRef } from "react";
import { useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useHoverable } from "@mylife/core-engine";

interface BookProps {
  position: [number, number, number];
  coverUrl: string;
  title: string;
  onClick: () => void;
}

const SIZE: [number, number, number] = [0.6, 0.85, 0.15];
const PAGES = new THREE.MeshStandardMaterial({ color: "#efe7d6", roughness: 0.9 });
const SPINE = new THREE.MeshStandardMaterial({ color: "#2b2b2b", roughness: 0.7 });
const GEOMETRY = new THREE.BoxGeometry(...SIZE);

export default function Book({ position, coverUrl, title, onClick }: BookProps) {
  const cover = useTexture(coverUrl);
  const mesh = useRef<THREE.Mesh>(null);
  const hovered = useRef(false);
  const hover = useHoverable(title, "Book · click to read", (value) => {
    hovered.current = value;
  });

  useEffect(() => {
    cover.colorSpace = THREE.SRGBColorSpace;
    cover.anisotropy = 8;
  }, [cover]);

  useFrame((_, delta) => {
    const node = mesh.current;
    if (!node) return;
    const target = position[2] + (hovered.current ? 0.9 : 0);
    if (Math.abs(node.position.z - target) < 0.001) return;
    node.position.z = THREE.MathUtils.damp(node.position.z, target, 9, delta);
  });

  return (
    <mesh
      ref={mesh}
      geometry={GEOMETRY}
      position={position}
      rotation={[-0.15, 0, 0]}
      {...hover}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
    >
      <primitive object={PAGES} attach="material-0" />
      <primitive object={SPINE} attach="material-1" />
      <primitive object={PAGES} attach="material-2" />
      <primitive object={PAGES} attach="material-3" />
      <meshStandardMaterial attach="material-4" map={cover} roughness={0.55} />
      <primitive object={SPINE} attach="material-5" />
    </mesh>
  );
}
