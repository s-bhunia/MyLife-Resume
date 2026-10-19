import { memo, useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { useHoverable } from "@mylife/core-engine";

const PHOTOS = ["/portrait/studio_black.webp", "/portrait/studio_white.webp"];
const HOLD_SECONDS = 6;

const FRAME = new THREE.MeshStandardMaterial({ color: "#14161a", roughness: 0.35, metalness: 0.6 });
const MAT = new THREE.MeshStandardMaterial({ color: "#f4f1ea", roughness: 0.95 });
const GLASS = new THREE.MeshStandardMaterial({
  color: "#ffffff",
  transparent: true,
  opacity: 0.06,
  roughness: 0.05,
  metalness: 0.9,
  depthWrite: false,
});

interface LivingPortraitProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  onClick: () => void;
}

export const LivingPortrait = memo(function LivingPortrait({ position, rotation, scale = 1, onClick }: LivingPortraitProps) {
  const textures = useTexture(PHOTOS);
  const meshes = useRef<(THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial> | null)[]>([]);
  const clock = useRef({ index: 0, previous: -1, elapsed: 0 });
  const hover = useHoverable("Santanu Bhunia", "About me · click to read");

  useEffect(() => {
    textures.forEach((texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 8;
    });
  }, [textures]);

  useFrame((_, delta) => {
    const state = clock.current;
    state.elapsed += delta;
    if (state.elapsed > HOLD_SECONDS) {
      state.elapsed = 0;
      state.previous = state.index;
      state.index = (state.index + 1) % PHOTOS.length;
      meshes.current.forEach((mesh, i) => {
        if (!mesh) return;
        mesh.visible = i === state.index || i === state.previous;
        mesh.renderOrder = i === state.index ? 3 : 2;
        if (i === state.index) mesh.material.opacity = 0;
      });
    }
    if (state.previous < 0) return;
    const current = meshes.current[state.index];
    if (!current) return;
    current.material.opacity = THREE.MathUtils.damp(current.material.opacity, 1, 2.2, delta);
    if (current.material.opacity > 0.995) {
      current.material.opacity = 1;
      const previous = meshes.current[state.previous];
      if (previous) previous.visible = false;
      state.previous = -1;
    }
  });

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh material={FRAME} castShadow>
        <boxGeometry args={[1.2, 1.6, 0.05]} />
      </mesh>
      <mesh material={MAT} position={[0, 0, 0.026]}>
        <planeGeometry args={[1.1, 1.5]} />
      </mesh>
      <group
        position={[0, 0, 0.028]}
        {...hover}
        onClick={(event) => {
          event.stopPropagation();
          onClick();
        }}
      >
        {textures.map((texture, i) => (
          <mesh
            key={PHOTOS[i]}
            ref={(mesh) => {
              meshes.current[i] = mesh as THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial> | null;
            }}
            visible={i === 0}
            renderOrder={2}
          >
            <planeGeometry args={[0.9, 1.2]} />
            <meshBasicMaterial map={texture} transparent toneMapped={false} depthWrite={false} />
          </mesh>
        ))}
        <mesh material={GLASS} position={[0, 0, 0.004]} renderOrder={10}>
          <planeGeometry args={[1.1, 1.5]} />
        </mesh>
      </group>
    </group>
  );
});
