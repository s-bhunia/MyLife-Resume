import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useHoverable } from "@mylife/core-engine";
import { MAT } from "./materials";

const BOWL = new THREE.LatheGeometry(
  [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(0.03, 0.002),
    new THREE.Vector2(0.046, 0.012),
    new THREE.Vector2(0.052, 0.026),
    new THREE.Vector2(0.049, 0.03),
    new THREE.Vector2(0.04, 0.022),
    new THREE.Vector2(0.0, 0.018),
  ],
  24,
).scale(1, 1, 0.82);

const FLAME = new THREE.LatheGeometry(
  [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(0.007, 0.006),
    new THREE.Vector2(0.008, 0.016),
    new THREE.Vector2(0.004, 0.03),
    new THREE.Vector2(0, 0.042),
  ],
  12,
);

const FLAME_MAT = new THREE.MeshBasicMaterial({ color: "#ffd27a", toneMapped: false });
const CORE_MAT = new THREE.MeshBasicMaterial({ color: "#fff6dc", toneMapped: false });

function glowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 64;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, "rgba(255,200,110,0.95)");
  g.addColorStop(0.35, "rgba(255,150,60,0.35)");
  g.addColorStop(1, "rgba(255,120,40,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

interface DiyaProps {
  position: [number, number, number];
  onOpen: () => void;
}

export function Diya({ position, onOpen }: DiyaProps) {
  const flame = useRef<THREE.Group>(null);
  const glow = useRef<THREE.Sprite>(null);
  const hovered = useRef(false);
  const hover = useHoverable("Light the diya", "A quiet corner of my mind", (value) => {
    hovered.current = value;
  });
  const glowMat = useMemo(
    () =>
      new THREE.SpriteMaterial({
        map: glowTexture(),
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true,
        toneMapped: false,
      }),
    [],
  );
  useEffect(
    () => () => {
      glowMat.map?.dispose();
      glowMat.dispose();
    },
    [glowMat],
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const flicker = 1 + Math.sin(t * 13) * 0.06 + Math.sin(t * 23.7) * 0.04 + Math.sin(t * 7.1) * 0.05;
    if (flame.current) {
      flame.current.scale.set(1, flicker * (hovered.current ? 1.35 : 1), 1);
      flame.current.rotation.z = Math.sin(t * 3.3) * 0.08;
    }
    if (glow.current) {
      const s = (hovered.current ? 0.2 : 0.14) * flicker;
      glow.current.scale.set(s, s, 1);
    }
  });

  return (
    <group
      position={position}
      {...hover}
      onClick={(event) => {
        event.stopPropagation();
        onOpen();
      }}
    >
      <mesh geometry={BOWL} material={MAT.clay} castShadow />
      <mesh position={[0, 0.02, 0]} material={MAT.brass} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[0.038, 20]} />
      </mesh>
      <group ref={flame} position={[0.036, 0.03, 0]}>
        <mesh geometry={FLAME} material={FLAME_MAT} />
        <mesh geometry={FLAME} material={CORE_MAT} scale={[0.5, 0.55, 0.5]} />
      </group>
      <sprite ref={glow} material={glowMat} position={[0.036, 0.05, 0]} />
    </group>
  );
}
