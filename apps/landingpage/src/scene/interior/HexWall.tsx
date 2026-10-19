import { memo, useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import { useHoverable } from "@mylife/core-engine";

export type HexVariant = "work" | "project" | "skill";

export interface HexItem {
  id: string;
  title: string;
  tagline: string;
  symbol: string;
  variant: HexVariant;
}

const RADIUS = 0.7;
const ACCENT: Record<HexVariant, string> = { work: "#e8642a", project: "#d48337", skill: "#b8862b" };
const HINT: Record<HexVariant, string> = {
  work: "Current work · click to unroll",
  project: "Project · click to unroll",
  skill: "Skill · click to unroll",
};

const ROTATION = new THREE.Euler(Math.PI / 2, 0, 0);
const BODY_GEO = new THREE.CylinderGeometry(RADIUS, RADIUS, 0.06, 6);
const GLOW_GEO = new THREE.CylinderGeometry(RADIUS + 0.08, RADIUS + 0.08, 0.02, 6);
const SHADOW_GEO = new THREE.CylinderGeometry(RADIUS, RADIUS, 0.04, 6);
const BODY_MAT = new THREE.MeshStandardMaterial({ color: "#ddd0b5", roughness: 0.6 });
const SHADOW_MAT = new THREE.MeshBasicMaterial({ color: "#000000", transparent: true, opacity: 0.15 });
const RING_ANGLES = [120, 60, 0, 300, 240, 180].map((deg) => THREE.MathUtils.degToRad(deg));

interface HexCardProps {
  item: HexItem;
  position: [number, number, number];
  scale: number;
  onSelect: (id: string) => void;
}

const HexCard = memo(function HexCard({ item, position, scale, onSelect }: HexCardProps) {
  const group = useRef<THREE.Group>(null);
  const hovered = useRef(false);
  const glow = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: "#d4af37",
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [],
  );
  const accent = useMemo(() => new THREE.MeshStandardMaterial({ color: ACCENT[item.variant] }), [item.variant]);
  useEffect(
    () => () => {
      glow.dispose();
      accent.dispose();
    },
    [glow, accent],
  );

  const hover = useHoverable(item.title, HINT[item.variant], (value) => {
    hovered.current = value;
  });

  useFrame((_, delta) => {
    const node = group.current;
    if (!node) return;
    const z = position[2] + (hovered.current ? 0.15 : 0);
    const opacity = hovered.current ? 0.6 : 0;
    if (Math.abs(node.position.z - z) < 0.001 && Math.abs(glow.opacity - opacity) < 0.001) return;
    node.position.z = THREE.MathUtils.damp(node.position.z, z, 6, delta);
    glow.opacity = THREE.MathUtils.damp(glow.opacity, opacity, 6, delta);
  });

  return (
    <group
      ref={group}
      position={position}
      scale={scale}
      {...hover}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(item.id);
      }}
    >
      <mesh geometry={GLOW_GEO} material={glow} rotation={ROTATION} position={[0, 0, -0.02]} />
      <mesh geometry={SHADOW_GEO} material={SHADOW_MAT} rotation={ROTATION} position={[0.02, -0.02, -0.03]} />
      <mesh geometry={BODY_GEO} material={BODY_MAT} rotation={ROTATION} receiveShadow />
      <mesh material={accent} position={[0, -0.4, 0.06]}>
        <boxGeometry args={[0.4, 0.03, 0.02]} />
      </mesh>
      <Text position={[0, 0.28, 0.06]} fontSize={0.24} color="#2d2d2d" anchorX="center" anchorY="middle">
        {item.symbol}
      </Text>
      <Text
        position={[0, 0.0, 0.06]}
        fontSize={0.14}
        lineHeight={1.05}
        maxWidth={1.0}
        textAlign="center"
        color="#242323"
        anchorX="center"
        anchorY="middle"
      >
        {item.title}
      </Text>
      <Text position={[0, -0.24, 0.06]} fontSize={0.085} maxWidth={1.05} textAlign="center" color="#7a0c0c" anchorX="center" anchorY="middle">
        {item.tagline}
      </Text>
    </group>
  );
});

interface HexWallProps {
  center: [number, number, number];
  items: HexItem[];
  scale?: number;
  gap?: number;
  onSelect: (id: string) => void;
}

export function HexWall({ center, items, scale = 0.32, gap = 0.035, onSelect }: HexWallProps) {
  const positions = useMemo(() => {
    const step = Math.sqrt(3) * RADIUS * scale + gap;
    return items.map((_, i): [number, number, number] => {
      if (i === 0) return center;
      const angle = RING_ANGLES[(i - 1) % RING_ANGLES.length];
      return [center[0] + Math.cos(angle) * step, center[1] + Math.sin(angle) * step, center[2]];
    });
  }, [items, center, scale, gap]);

  return (
    <group>
      {items.map((item, i) => (
        <HexCard key={item.id} item={item} position={positions[i]} scale={scale} onSelect={onSelect} />
      ))}
    </group>
  );
}
