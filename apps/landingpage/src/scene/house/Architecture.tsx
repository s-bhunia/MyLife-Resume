import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { bandGeometry, type Opening } from "./wallGeometry";
import { D, FLOOR_Y, H_BASE, H_TOTAL, H_UPPER, PORCH_D, PORCH_W, THICKNESS, W } from "./dimensions";

interface WallSpec {
  length: number;
  x: number;
  z: number;
  rotY: number;
  openings: Opening[];
}

const WINDOW: Omit<Opening, "x"> = { y: 1.5, w: 0.8, h: 2.2 };

const WALLS: WallSpec[] = [
  { length: D, x: -W / 2, z: 0, rotY: Math.PI / 2, openings: [-2, 2].map((x) => ({ x, ...WINDOW })) },
  { length: D, x: W / 2, z: 0, rotY: Math.PI / 2, openings: [-2, 2].map((x) => ({ x, ...WINDOW })) },
  { length: W, x: 0, z: -D / 2, rotY: 0, openings: [] },
  { length: (W - PORCH_W) / 2, x: -(W + PORCH_W) / 4, z: D / 2, rotY: 0, openings: [{ x: 0.25, ...WINDOW }] },
  { length: (W - PORCH_W) / 2, x: (W + PORCH_W) / 4, z: D / 2, rotY: 0, openings: [{ x: -0.25, ...WINDOW }] },
  { length: PORCH_D, x: -PORCH_W / 2, z: D / 2 - PORCH_D / 2, rotY: Math.PI / 2, openings: [] },
  { length: PORCH_D, x: PORCH_W / 2, z: D / 2 - PORCH_D / 2, rotY: Math.PI / 2, openings: [] },
  { length: PORCH_W, x: 0, z: D / 2 - PORCH_D, rotY: 0, openings: [{ x: 0, y: 1.2, w: 1.2, h: 2.4 }] },
];

const WINDOWS: { position: [number, number, number]; rotY: number }[] = [
  { position: [-W / 2, 1.5, -2], rotY: Math.PI / 2 },
  { position: [-W / 2, 1.5, 2], rotY: Math.PI / 2 },
  { position: [W / 2, 1.5, -2], rotY: -Math.PI / 2 },
  { position: [W / 2, 1.5, 2], rotY: -Math.PI / 2 },
  { position: [-3, 1.5, D / 2], rotY: 0 },
  { position: [3, 1.5, D / 2], rotY: 0 },
];

const MAT = {
  cladding: new THREE.MeshStandardMaterial({ color: "#cfc4b0", roughness: 0.95 }),
  plaster: new THREE.MeshStandardMaterial({ color: "#f3efe8", roughness: 0.92 }),
  band: new THREE.MeshStandardMaterial({ color: "#b9b4ab", roughness: 0.35, metalness: 0.4 }),
  frame: new THREE.MeshStandardMaterial({ color: "#16181c", roughness: 0.45, metalness: 0.5 }),
  sill: new THREE.MeshStandardMaterial({ color: "#cfc6b6", roughness: 0.75 }),
  glass: new THREE.MeshStandardMaterial({
    color: "#b9d4ea",
    transparent: true,
    opacity: 0.18,
    roughness: 0.04,
    metalness: 0.2,
    envMapIntensity: 1.6,
    depthWrite: false,
  }),
  stone: new THREE.MeshStandardMaterial({ color: "#8c877f", roughness: 0.9 }),
  trim: new THREE.MeshStandardMaterial({ color: "#a8875a", roughness: 0.35, metalness: 0.7 }),
  porch: new THREE.MeshStandardMaterial({ color: "#2b2a28", roughness: 0.6 }),
  roof: new THREE.MeshStandardMaterial({ color: "#ece9e3", roughness: 0.9 }),
  ceiling: new THREE.MeshStandardMaterial({ color: "#f3efe8", roughness: 0.95, emissive: "#fff1dc", emissiveIntensity: 0.22 }),
  cove: new THREE.MeshStandardMaterial({ color: "#fff3df", emissive: "#ffdcae", emissiveIntensity: 1.1, toneMapped: false }),
  doorFrame: new THREE.MeshStandardMaterial({ color: "#2a1c11", roughness: 0.7 }),
  door: new THREE.MeshStandardMaterial({ color: "#5b3a20", roughness: 0.55 }),
  doorPanel: new THREE.MeshStandardMaterial({ color: "#47301a", roughness: 0.6 }),
  handle: new THREE.MeshStandardMaterial({ color: "#c9a46a", metalness: 0.9, roughness: 0.25 }),
};

function buildWalls() {
  const bands = { cladding: [] as THREE.BufferGeometry[], plaster: [] as THREE.BufferGeometry[], band: [] as THREE.BufferGeometry[] };
  const matrix = new THREE.Matrix4();
  for (const wall of WALLS) {
    matrix.makeRotationY(wall.rotY).setPosition(wall.x, 0, wall.z);
    const layers: [keyof typeof bands, number, number, number, number][] = [
      ["cladding", 0, H_BASE, THICKNESS, wall.length],
      ["plaster", H_BASE, H_BASE + H_UPPER, THICKNESS, wall.length],
      ["band", H_BASE + H_UPPER, H_TOTAL, THICKNESS + 0.02, wall.length + 0.02],
    ];
    for (const [key, y0, y1, depth, length] of layers) {
      bands[key].push(bandGeometry(length, y0, y1, depth, wall.openings).applyMatrix4(matrix));
    }
  }
  const merge = (list: THREE.BufferGeometry[]) => {
    const merged = mergeGeometries(list, false)!;
    list.forEach((g) => g.dispose());
    return merged;
  };
  return { cladding: merge(bands.cladding), plaster: merge(bands.plaster), band: merge(bands.band) };
}

function buildWindowParts() {
  const depth = THICKNESS + 0.05;
  const boxes = (specs: [number, number, number, number, number][]) =>
    mergeGeometries(
      specs.map(([w, h, d, x, y]) => new THREE.BoxGeometry(w, h, d).translate(x, y, 0)),
      false,
    )!;
  return {
    frame: boxes([
      [0.8, 0.05, depth, 0, 1.075],
      [0.8, 0.05, depth, 0, -1.075],
      [0.05, 2.1, depth, -0.375, 0],
      [0.05, 2.1, depth, 0.375, 0],
      [0.03, 2.1, 0.05, 0, 0],
      [0.7, 0.03, 0.05, 0, 0.3],
      [0.7, 0.03, 0.05, 0, -0.4],
    ]),
    sill: new THREE.BoxGeometry(0.9, 0.06, 0.3).translate(0, -1.13, 0.05),
    glass: new THREE.BoxGeometry(0.7, 2.1, 0.02),
  };
}

function Windows() {
  const parts = useMemo(buildWindowParts, []);
  const refs = [useRef<THREE.InstancedMesh>(null), useRef<THREE.InstancedMesh>(null), useRef<THREE.InstancedMesh>(null)];

  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const s = new THREE.Vector3(1, 1, 1);
    WINDOWS.forEach(({ position, rotY }, i) => {
      q.setFromAxisAngle(THREE.Object3D.DEFAULT_UP, rotY);
      m.compose(new THREE.Vector3(...position), q, s);
      refs.forEach((ref) => ref.current?.setMatrixAt(i, m));
    });
    refs.forEach((ref) => {
      if (!ref.current) return;
      ref.current.instanceMatrix.needsUpdate = true;
      ref.current.computeBoundingSphere();
    });
  }, []);

  useEffect(() => () => Object.values(parts).forEach((g) => g.dispose()), [parts]);

  return (
    <>
      <instancedMesh ref={refs[0]} args={[parts.frame, MAT.frame, WINDOWS.length]} castShadow receiveShadow />
      <instancedMesh ref={refs[1]} args={[parts.sill, MAT.sill, WINDOWS.length]} receiveShadow />
      <instancedMesh ref={refs[2]} args={[parts.glass, MAT.glass, WINDOWS.length]} renderOrder={2} />
    </>
  );
}

function Door({ open }: { open: boolean }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    const door = ref.current;
    if (!door) return;
    const target = open ? -Math.PI / 2 : 0;
    if (Math.abs(door.rotation.y - target) < 0.0005) return;
    door.rotation.y = THREE.MathUtils.damp(door.rotation.y, target, 3.2, delta);
  });

  return (
    <group position={[0, 0, D / 2 - PORCH_D]}>
      <mesh position={[0, 2.375, 0]} material={MAT.doorFrame} castShadow>
        <boxGeometry args={[1.2, 0.05, THICKNESS + 0.05]} />
      </mesh>
      {[-0.575, 0.575].map((x) => (
        <mesh key={x} position={[x, 1.2, 0]} material={MAT.doorFrame} castShadow>
          <boxGeometry args={[0.05, 2.4, THICKNESS + 0.05]} />
        </mesh>
      ))}
      <group position={[-0.55, 0, 0]}>
        <group ref={ref}>
          <mesh position={[0.55, 1.175, 0]} material={MAT.door} castShadow>
            <boxGeometry args={[1.1, 2.35, 0.08]} />
          </mesh>
          {[0.42, 0.92, 1.42, 1.92].map((y) => (
            <mesh key={y} position={[0.55, y, 0.045]} material={MAT.doorPanel}>
              <boxGeometry args={[0.72, 0.36, 0.012]} />
            </mesh>
          ))}
          <mesh position={[1.0, 1.12, 0.07]} material={MAT.handle}>
            <boxGeometry args={[0.025, 0.42, 0.03]} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

function Floor() {
  const texture = useTexture("/textures/floor.jpg");
  const material = useMemo(() => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
    return new THREE.MeshStandardMaterial({ map: texture, roughness: 0.42, metalness: 0.02 });
  }, [texture]);
  useEffect(() => () => material.dispose(), [material]);

  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, FLOOR_Y, 0]} material={material} receiveShadow>
      <planeGeometry args={[W, D]} />
    </mesh>
  );
}

function Ceiling() {
  const inset = 0.22;
  const y = H_TOTAL - 0.012;
  const strips: [number, number, number, number][] = [
    [W - THICKNESS - inset * 2, 0, -D / 2 + THICKNESS / 2 + inset, 0],
    [W - THICKNESS - inset * 2, 0, D / 2 - PORCH_D - inset, 0],
    [D - PORCH_D - THICKNESS - inset * 2, -W / 2 + THICKNESS / 2 + inset, -PORCH_D / 2, Math.PI / 2],
    [D - PORCH_D - THICKNESS - inset * 2, W / 2 - THICKNESS / 2 - inset, -PORCH_D / 2, Math.PI / 2],
  ];
  return (
    <group>
      <mesh position={[0, H_TOTAL + 0.125, 0]} material={MAT.roof} castShadow receiveShadow>
        <boxGeometry args={[W + 1.2, 0.25, D + 1.2]} />
      </mesh>
      <mesh rotation-x={Math.PI / 2} position={[0, H_TOTAL - 0.002, 0]} material={MAT.ceiling}>
        <planeGeometry args={[W, D]} />
      </mesh>
      {strips.map(([length, x, z, rot], i) => (
        <mesh key={i} position={[x, y, z]} rotation-y={rot} material={MAT.cove}>
          <boxGeometry args={[length, 0.02, 0.05]} />
        </mesh>
      ))}
      <pointLight position={[0, H_TOTAL - 0.2, D / 2 - PORCH_D / 2]} intensity={3.5} color="#ffd9a8" distance={4.5} decay={2} />
    </group>
  );
}

function Platform() {
  return (
    <group>
      <mesh position={[0, 0.2, 0]} material={MAT.stone} receiveShadow castShadow>
        <boxGeometry args={[W + 2, 0.4, D + 2]} />
      </mesh>
      <mesh position={[0, 0.395, 0]} material={MAT.trim}>
        <boxGeometry args={[W + 2.04, 0.02, D + 2.04]} />
      </mesh>
      <mesh position={[0, 0.15, D / 2 + 1.25]} material={MAT.stone} receiveShadow castShadow>
        <boxGeometry args={[3.2, 0.3, 0.5]} />
      </mesh>
      <mesh position={[0, 0.075, D / 2 + 1.7]} material={MAT.stone} receiveShadow castShadow>
        <boxGeometry args={[3.6, 0.15, 0.5]} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.405, D / 2 - PORCH_D / 2]} material={MAT.porch} receiveShadow>
        <planeGeometry args={[PORCH_W, PORCH_D]} />
      </mesh>
    </group>
  );
}

export function Architecture({ doorOpen }: { doorOpen: boolean }) {
  const walls = useMemo(buildWalls, []);
  useEffect(() => () => Object.values(walls).forEach((g) => g.dispose()), [walls]);

  return (
    <group>
      <Platform />
      <Floor />
      <mesh geometry={walls.cladding} material={MAT.cladding} castShadow receiveShadow />
      <mesh geometry={walls.plaster} material={MAT.plaster} castShadow receiveShadow />
      <mesh geometry={walls.band} material={MAT.band} castShadow />
      <Windows />
      <Door open={doorOpen} />
      <Ceiling />
    </group>
  );
}
