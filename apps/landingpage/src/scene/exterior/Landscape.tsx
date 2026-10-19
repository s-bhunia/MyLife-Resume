import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import {
  createBarkTexture,
  createGrassTexture,
  createLeafDepthMaterial,
  createLeafMaterial,
  createLeafTexture,
  mulberry32,
  windUniform,
} from "./foliage";
import { buildBush, buildTree, writeCards, type BushSpec, type TreeSpec } from "./trees";

const TREES: TreeSpec[] = [
  { x: -9, z: -2, height: 5.6, seed: 1 },
  { x: -10.8, z: 5.2, height: 4.6, seed: 2, lean: 0.4 },
  { x: -7.4, z: -8.2, height: 6.2, seed: 3 },
  { x: 9.6, z: -5.6, height: 5.3, seed: 4 },
  { x: 11.6, z: 2.8, height: 4.4, seed: 5, lean: 0.35 },
  { x: -4.2, z: 12.4, height: 5, seed: 6 },
  { x: 12.8, z: 12.2, height: 5.6, seed: 7 },
  { x: -12.5, z: 13.5, height: 6.4, seed: 8 },
  { x: 2.5, z: -12.5, height: 6.8, seed: 9 },
  { x: -15, z: -6, height: 7, seed: 10 },
  { x: 16, z: -2, height: 6.6, seed: 11 },
];

const BUSHES: BushSpec[] = [
  ...[-5.1, -3.8, -2.5, 2.5, 3.8, 5.1].map((x, i) => ({ x, z: 5.55, radius: 0.42 + (i % 2) * 0.08, seed: 20 + i })),
  { x: -6.7, z: -4.6, radius: 0.7, seed: 30 },
  { x: 6.7, z: 4.3, radius: 0.65, seed: 31 },
  { x: 6.9, z: -3.2, radius: 0.55, seed: 32 },
  { x: -6.8, z: 3.4, radius: 0.6, seed: 33 },
  { x: -8.6, z: -1.2, radius: 0.5, seed: 34 },
  { x: 10.6, z: 3.6, radius: 0.55, seed: 35 },
];

function Ground() {
  const material = useMemo(() => {
    const map = createGrassTexture();
    map.repeat.set(30, 30);
    return new THREE.MeshStandardMaterial({ map, roughness: 1, color: "#d8e0c8" });
  }, []);
  useEffect(() => () => {
    material.map?.dispose();
    material.dispose();
  }, [material]);

  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, -0.01, 0]} material={material} receiveShadow>
      <circleGeometry args={[70, 48]} />
    </mesh>
  );
}

function Path() {
  const geometry = useMemo(() => {
    const rand = mulberry32(5);
    const stones: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 9; i++) {
      const stone = new THREE.CylinderGeometry(0.42 + rand() * 0.1, 0.46 + rand() * 0.1, 0.06, 9);
      stone.scale(1.25, 1, 0.8);
      stone.rotateY(rand() * 0.6 - 0.3);
      stone.translate((rand() - 0.5) * 0.35, 0.02, 6.6 + i * 1.05);
      stones.push(stone);
    }
    const merged = mergeGeometries(stones, false)!;
    stones.forEach((g) => g.dispose());
    return merged;
  }, []);
  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <mesh geometry={geometry} receiveShadow castShadow>
      <meshStandardMaterial color="#9a958c" roughness={0.92} />
    </mesh>
  );
}

function buildVegetation() {
  const built = TREES.map(buildTree);
  const wood = mergeGeometries(built.map((b) => b.wood), false)!;
  built.forEach((b) => b.wood.dispose());
  const leafTexture = createLeafTexture();
  return {
    wood,
    cards: [...built.flatMap((b) => b.cards), ...BUSHES.flatMap(buildBush)],
    leafGeometry: new THREE.PlaneGeometry(1, 1),
    leafMaterial: createLeafMaterial(leafTexture),
    leafDepth: createLeafDepthMaterial(leafTexture),
    barkMaterial: new THREE.MeshStandardMaterial({ map: createBarkTexture(), roughness: 0.95, color: "#b8a995" }),
  };
}

let vegetation: ReturnType<typeof buildVegetation> | null = null;

function Vegetation() {
  const leaves = useRef<THREE.InstancedMesh>(null);
  vegetation ??= buildVegetation();
  const { wood, cards, leafMaterial, leafDepth, barkMaterial, leafGeometry } = vegetation;

  useLayoutEffect(() => {
    if (!leaves.current) return;
    writeCards(leaves.current, cards);
    leaves.current.customDepthMaterial = leafDepth;
  }, [cards, leafDepth]);

  useFrame((_, delta) => {
    windUniform.value += delta;
  });

  return (
    <>
      <mesh geometry={wood} material={barkMaterial} castShadow receiveShadow />
      <instancedMesh ref={leaves} args={[leafGeometry, leafMaterial, cards.length]} castShadow receiveShadow frustumCulled={false} />
    </>
  );
}

export function Landscape() {
  return (
    <group>
      <Ground />
      <Path />
      <Vegetation />
    </group>
  );
}
