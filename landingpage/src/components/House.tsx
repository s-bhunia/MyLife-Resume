import { Box, Plane, Cylinder, Sphere, useTexture } from "@react-three/drei";
import { useRef, useState, useEffect, memo, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Geometry, Base, Subtraction } from "@react-three/csg";
import { Bookshelf } from "@mylife/bookshelf";

// --- ARCHITECTURAL CONSTANTS ---
const W = 10;
const D = 8;
const H_BASE = 0.8;
const H_UPPER = 2.05;
const H_BAND = 0.15;
const H_TOTAL = H_BASE + H_UPPER + H_BAND;
const THICKNESS = 0.2;
const PORCH_W = 3;
const PORCH_D = 1.5;

// ---------------------------------------------------------------------------
// MODULE-LEVEL SHARED MATERIALS
// Defining materials outside components means they are created ONCE and shared
// across all instances. No new THREE.Material objects on re-render.
// ---------------------------------------------------------------------------
const MAT_PLASTER = new THREE.MeshStandardMaterial({
  color: "#ffffff",
  roughness: 0.9,
});
const MAT_CLADDING = new THREE.MeshStandardMaterial({
  color: "#d4cbb8",
  roughness: 1,
});
const MAT_BAND = new THREE.MeshStandardMaterial({
  color: "#c0c0c0",
  roughness: 0.1,
});
const MAT_FRAME = new THREE.MeshStandardMaterial({
  color: "#1a1a1a",
  roughness: 0.4,
});
const MAT_SILL = new THREE.MeshStandardMaterial({
  color: "#d4cbb8",
  roughness: 0.8,
});
// Simple transparent material instead of expensive meshPhysicalMaterial + transmission.
// transmission=0.9 forces an extra "background texture" render pass for EVERY window — 6 passes
// gone. This looks almost identical from normal viewing distances.
const MAT_GLASS = new THREE.MeshStandardMaterial({
  color: "#aaccff",
  transparent: true,
  opacity: 0.25,
  roughness: 0.05,
  metalness: 0.1,
});
const MAT_DOOR_DARK = new THREE.MeshStandardMaterial({
  color: "#3d2613",
  roughness: 0.8,
});
const MAT_DOOR_MAIN = new THREE.MeshStandardMaterial({
  color: "#6b4423",
  roughness: 0.7,
});
const MAT_DOOR_PANEL = new THREE.MeshStandardMaterial({
  color: "#54351b",
  roughness: 0.8,
});
const MAT_HANDLE = new THREE.MeshStandardMaterial({
  color: "#111111",
  metalness: 0.8,
  roughness: 0.2,
});
const MAT_TRUNK = new THREE.MeshStandardMaterial({
  color: "#5c4033",
  roughness: 0.9,
});
const MAT_LEAF = new THREE.MeshStandardMaterial({
  color: "#2d5a27",
  side: THREE.DoubleSide,
});
const MAT_SHRUB_STEM = new THREE.MeshStandardMaterial({ color: "#3d2817" });
const MAT_SHRUB_LO = new THREE.MeshStandardMaterial({
  color: "#4a7c3b",
  roughness: 0.8,
});
const MAT_SHRUB_HI = new THREE.MeshStandardMaterial({
  color: "#5c9a49",
  roughness: 0.8,
});
const MAT_STONE = new THREE.MeshStandardMaterial({
  color: "#8a8a8a",
  roughness: 0.8,
});
const MAT_GOLD = new THREE.MeshStandardMaterial({
  color: "#e8c338",
  roughness: 0.5,
});
const MAT_PORCH_TILE = new THREE.MeshStandardMaterial({
  color: "#1a1a1a",
  roughness: 0.7,
});
const MAT_ROOF = new THREE.MeshStandardMaterial({
  color: "#e0e0e0",
  roughness: 0.9,
});
const MAT_ROOF_RING = new THREE.MeshBasicMaterial({ color: "#6a0dad" });

// ---------------------------------------------------------------------------
// WALL SEGMENT
// ⚠️  MUST live OUTSIDE House so its identity is stable across re-renders.
// When it was defined inside House, every prop change (e.g. entranceOpen) gave
// React a brand-new component type → full unmount+remount of all walls →
// every CSG boolean operation re-ran simultaneously → GPU spike to 99%.
// ---------------------------------------------------------------------------
interface CutoutDef {
  position: [number, number, number];
  args: [number, number, number];
}

interface WallSegmentProps {
  args: [number, number, number];
  position: [number, number, number];
  rotation?: [number, number, number];
  cutouts?: CutoutDef[];
}

const WallSegment = memo(
  ({
    args,
    position,
    rotation = [0, 0, 0],
    cutouts = [],
  }: WallSegmentProps) => {
    const [w, , d] = args;
    return (
      <group position={position} rotation={rotation}>
        {/* Lower cladding band */}
        <mesh
          castShadow
          receiveShadow
          position={[0, H_BASE / 2, 0]}
          material={MAT_CLADDING}
        >
          <Geometry>
            <Base>
              <boxGeometry args={[w, H_BASE, d]} />
            </Base>
            {cutouts.map((cut, i) => (
              <Subtraction
                key={`base-${i}`}
                position={[
                  cut.position[0],
                  cut.position[1] - H_BASE / 2,
                  cut.position[2],
                ]}
              >
                <boxGeometry args={cut.args} />
              </Subtraction>
            ))}
          </Geometry>
        </mesh>

        {/* Upper plaster band */}
        <mesh
          castShadow
          receiveShadow
          position={[0, H_BASE + H_UPPER / 2, 0]}
          material={MAT_PLASTER}
        >
          <Geometry>
            <Base>
              <boxGeometry args={[w, H_UPPER, d]} />
            </Base>
            {cutouts.map((cut, i) => (
              <Subtraction
                key={`plaster-${i}`}
                position={[
                  cut.position[0],
                  cut.position[1] - (H_BASE + H_UPPER / 2),
                  cut.position[2],
                ]}
              >
                <boxGeometry args={cut.args} />
              </Subtraction>
            ))}
          </Geometry>
        </mesh>

        {/* Decorative band */}
        <mesh
          castShadow
          position={[0, H_BASE + H_UPPER + H_BAND / 2, 0]}
          material={MAT_BAND}
        >
          <Geometry>
            <Base>
              <boxGeometry args={[w + 0.02, H_BAND, d + 0.02]} />
            </Base>
            {cutouts.map((cut, i) => (
              <Subtraction
                key={`band-${i}`}
                position={[
                  cut.position[0],
                  cut.position[1] - (H_BASE + H_UPPER + H_BAND / 2),
                  cut.position[2],
                ]}
              >
                <boxGeometry args={cut.args} />
              </Subtraction>
            ))}
          </Geometry>
        </mesh>
      </group>
    );
  },
);

// ---------------------------------------------------------------------------
// TALL WINDOW
// ---------------------------------------------------------------------------
const TallWindow = memo(
  ({
    position,
    rotation = [0, 0, 0],
  }: {
    position: [number, number, number];
    rotation?: [number, number, number];
  }) => {
    const F_DEPTH = THICKNESS + 0.05;
    return (
      <group position={position} rotation={rotation}>
        {/* Frame — top/bottom rails */}
        <Box
          args={[0.8, 0.05, F_DEPTH]}
          position={[0, 1.075, 0]}
          castShadow
          receiveShadow
          material={MAT_FRAME}
        />
        <Box
          args={[0.8, 0.05, F_DEPTH]}
          position={[0, -1.075, 0]}
          castShadow
          receiveShadow
          material={MAT_FRAME}
        />
        {/* Frame — side stiles */}
        <Box
          args={[0.05, 2.1, F_DEPTH]}
          position={[-0.375, 0, 0]}
          castShadow
          receiveShadow
          material={MAT_FRAME}
        />
        <Box
          args={[0.05, 2.1, F_DEPTH]}
          position={[0.375, 0, 0]}
          castShadow
          receiveShadow
          material={MAT_FRAME}
        />
        {/* Stone sill */}
        <Box
          args={[0.9, 0.06, 0.3]}
          position={[0, -1.13, 0.05]}
          castShadow
          receiveShadow
          material={MAT_SILL}
        />
        {/* Mullions */}
        <Box
          args={[0.03, 2.1, 0.05]}
          position={[0, 0, 0]}
          castShadow
          material={MAT_FRAME}
        />
        <Box
          args={[0.7, 0.03, 0.05]}
          position={[0, 0.3, 0]}
          castShadow
          material={MAT_FRAME}
        />
        <Box
          args={[0.7, 0.03, 0.05]}
          position={[0, -0.4, 0]}
          castShadow
          material={MAT_FRAME}
        />
        {/* Glass — simple transparent, NOT transmission (saves one render pass per window) */}
        <mesh position={[0, 0, 0]} material={MAT_GLASS}>
          <boxGeometry args={[0.7, 2.1, 0.02]} />
        </mesh>
      </group>
    );
  },
);

// ---------------------------------------------------------------------------
// GEOMETRIC DOOR
// ---------------------------------------------------------------------------
const GeometricDoor = memo(
  ({
    position,
    entranceOpen = false,
  }: {
    position: [number, number, number];
    entranceOpen?: boolean;
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const doorRef = useRef<THREE.Group>(null);

    useEffect(() => {
      setIsOpen(entranceOpen);
    }, [entranceOpen]);

    useFrame((_, delta) => {
      if (doorRef.current) {
        const target = isOpen ? -Math.PI / 2 : 0;
        doorRef.current.rotation.y = THREE.MathUtils.damp(
          doorRef.current.rotation.y,
          target,
          5,
          delta,
        );
      }
    });

    return (
      <group position={position}>
        {/* Static Door Frame */}
        <group position={[0, 1.2, 0]}>
          <mesh
            position={[0, 1.2 - 0.025, 0]}
            castShadow
            material={MAT_DOOR_DARK}
          >
            <boxGeometry args={[1.2, 0.05, THICKNESS + 0.05]} />
          </mesh>
          <mesh
            position={[-0.6 + 0.025, 0, 0]}
            castShadow
            material={MAT_DOOR_DARK}
          >
            <boxGeometry args={[0.05, 2.4, THICKNESS + 0.05]} />
          </mesh>
          <mesh
            position={[0.6 - 0.025, 0, 0]}
            castShadow
            material={MAT_DOOR_DARK}
          >
            <boxGeometry args={[0.05, 2.4, THICKNESS + 0.05]} />
          </mesh>
        </group>

        {/* Swinging Door — hinge at left edge */}
        <group position={[-0.6, 0, 0]}>
          <group
            ref={doorRef}
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              document.body.style.cursor = "pointer";
            }}
            onPointerOut={(e) => {
              e.stopPropagation();
              document.body.style.cursor = "auto";
            }}
          >
            <mesh
              position={[0.6, 1.175, 0]}
              castShadow
              material={MAT_DOOR_MAIN}
            >
              <boxGeometry args={[1.1, 2.35, 0.1]} />
            </mesh>
            {[0.4, 0.9, 1.4, 1.9].map((y, i) => (
              <mesh
                key={i}
                position={[0.6, y - 0.025, 0.06]}
                castShadow
                material={MAT_DOOR_PANEL}
              >
                <boxGeometry args={[0.7, 0.35, 0.02]} />
              </mesh>
            ))}
            {/* Door handle */}
            <group position={[1.05, 1.175, 0.06]}>
              <mesh castShadow material={MAT_HANDLE}>
                <boxGeometry args={[0.06, 0.25, 0.02]} />
              </mesh>
              <mesh
                position={[-0.04, 0, 0.03]}
                castShadow
                material={MAT_HANDLE}
              >
                <boxGeometry args={[0.12, 0.03, 0.03]} />
              </mesh>
            </group>
          </group>
        </group>
      </group>
    );
  },
);

// ---------------------------------------------------------------------------
// LANDSCAPING
// ---------------------------------------------------------------------------
const PalmTree = memo(
  ({ position }: { position: [number, number, number] }) => (
    <group position={position}>
      <Cylinder
        args={[0.15, 0.25, 3]}
        position={[0, 1.5, 0]}
        castShadow
        material={MAT_TRUNK}
      />
      {[0, 1, 2, 3, 4].map((i) => (
        <Plane
          key={i}
          args={[1.5, 0.5]}
          position={[0, 3, 0]}
          rotation={[Math.PI / 4, (i * Math.PI * 2) / 5, 0]}
          castShadow
          material={MAT_LEAF}
        />
      ))}
    </group>
  ),
);

const OrnamentalShrub = memo(
  ({ position }: { position: [number, number, number] }) => (
    <group position={position}>
      <Cylinder
        args={[0.05, 0.05, 1]}
        position={[0, 0.5, 0]}
        castShadow
        material={MAT_SHRUB_STEM}
      />
      <Sphere
        args={[0.4]}
        position={[0, 1, 0]}
        castShadow
        material={MAT_SHRUB_LO}
      />
      <Sphere
        args={[0.3]}
        position={[0, 1.5, 0]}
        castShadow
        material={MAT_SHRUB_HI}
      />
    </group>
  ),
);

// ---------------------------------------------------------------------------
// MAIN HOUSE COMPONENT
// ---------------------------------------------------------------------------
export const House = ({ entranceOpen = false }: { entranceOpen?: boolean }) => {
  const floorTexture = useTexture("/textures/floor.jpg");

  // Memoize texture setup so it only runs once
  useMemo(() => {
    floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(2, 2);
  }, [floorTexture]);

  // Memoize floor material to avoid new object each render
  const matFloor = useMemo(
    () => new THREE.MeshStandardMaterial({ map: floorTexture }),
    [floorTexture],
  );

  return (
    <group>
      {/* 1. PLATFORM & SURROUNDINGS */}
      <group>
        <Box
          args={[W + 2, 0.4, D + 2]}
          position={[0, 0.2, 0]}
          receiveShadow
          material={MAT_STONE}
        />
        <Box
          args={[W + 2.1, 0.05, D + 2.1]}
          position={[0, 0.38, 0]}
          material={MAT_GOLD}
        />
        <Box
          args={[4, 0.15, 0.6]}
          position={[0, 0.075, D / 2 + 1.3]}
          receiveShadow
          material={MAT_STONE}
        />
        <Box
          args={[4, 0.3, 0.6]}
          position={[0, 0.15, D / 2 + 0.7]}
          receiveShadow
          material={MAT_STONE}
        />
        <Plane
          args={[30, 30]}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -0.01, 0]}
          receiveShadow
        >
          <meshStandardMaterial color="#4b6b3b" roughness={1} />
        </Plane>
      </group>

      {/* 2. HOUSE STRUCTURE */}
      <group>
        <Plane
          args={[W, D]}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, H_BASE - 0.39, 0]}
          receiveShadow
        >
          <primitive object={matFloor} attach="material" />
        </Plane>

        <Bookshelf position={[0, 1.35, -3.5]} scale={0.3} />

        {/* Side walls with window cutouts */}
        <WallSegment
          args={[THICKNESS, 0, D]}
          position={[-W / 2, 0, 0]}
          cutouts={[
            { position: [0, 1.5, -2], args: [THICKNESS + 0.2, 2.2, 0.8] },
            { position: [0, 1.5, 2], args: [THICKNESS + 0.2, 2.2, 0.8] },
          ]}
        />
        <WallSegment
          args={[THICKNESS, 0, D]}
          position={[W / 2, 0, 0]}
          cutouts={[
            { position: [0, 1.5, -2], args: [THICKNESS + 0.2, 2.2, 0.8] },
            { position: [0, 1.5, 2], args: [THICKNESS + 0.2, 2.2, 0.8] },
          ]}
        />

        {/* Rear wall */}
        <WallSegment args={[W, 0, THICKNESS]} position={[0, 0, -D / 2]} />

        {/* Front wall — left & right of porch opening */}
        <WallSegment
          args={[(W - PORCH_W) / 2, 0, THICKNESS]}
          position={[-(W + PORCH_W) / 4, 0, D / 2]}
          cutouts={[
            { position: [0.25, 1.5, 0], args: [0.8, 2.2, THICKNESS + 0.2] },
          ]}
        />
        <WallSegment
          args={[(W - PORCH_W) / 2, 0, THICKNESS]}
          position={[(W + PORCH_W) / 4, 0, D / 2]}
          cutouts={[
            { position: [-0.25, 1.5, 0], args: [0.8, 2.2, THICKNESS + 0.2] },
          ]}
        />

        {/* Porch side walls */}
        <WallSegment
          args={[THICKNESS, 0, PORCH_D]}
          position={[-PORCH_W / 2, 0, D / 2 - PORCH_D / 2]}
        />
        <WallSegment
          args={[THICKNESS, 0, PORCH_D]}
          position={[PORCH_W / 2, 0, D / 2 - PORCH_D / 2]}
        />

        {/* Porch front wall with door cutout */}
        <WallSegment
          args={[PORCH_W, 0, THICKNESS]}
          position={[0, 0, D / 2 - PORCH_D]}
          cutouts={[
            { position: [0, 1.2, 0], args: [1.2, 2.4, THICKNESS + 0.2] },
          ]}
        />

        {/* Porch floor */}
        <Plane
          args={[PORCH_W, PORCH_D]}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.01, D / 2 - PORCH_D / 2]}
          material={MAT_PORCH_TILE}
        />

        <GeometricDoor
          position={[0, 0, D / 2 - PORCH_D]}
          entranceOpen={entranceOpen}
        />

        {/* Windows */}
        <TallWindow
          position={[-W / 2, 1.5, -2]}
          rotation={[0, Math.PI / 2, 0]}
        />
        <TallWindow
          position={[-W / 2, 1.5, 2]}
          rotation={[0, Math.PI / 2, 0]}
        />
        <TallWindow
          position={[W / 2, 1.5, -2]}
          rotation={[0, -Math.PI / 2, 0]}
        />
        <TallWindow
          position={[W / 2, 1.5, 2]}
          rotation={[0, -Math.PI / 2, 0]}
        />
        <TallWindow position={[-3, 1.5, D / 2]} />
        <TallWindow position={[3, 1.5, D / 2]} />
      </group>

      {/* 3. ROOF & LIGHTING */}
      <group position={[0, H_TOTAL, 0]}>
        <Box
          args={[W + 1.2, 0.25, D + 1.2]}
          position={[0, 0.125, 0]}
          castShadow
          material={MAT_ROOF}
        />
        <mesh
          position={[0, -0.01, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          material={MAT_ROOF_RING}
        >
          <ringGeometry
            args={[Math.max(W, D) / 2, Math.max(W, D) / 2 + 0.4, 4]}
          />
        </mesh>
        {/* rectAreaLight is kept but intensity reduced — it's expensive but unique-looking */}
        <rectAreaLight
          width={W + 1}
          height={D + 1}
          color="#ffe8c0"
          intensity={2}
          position={[0, -0.1, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <pointLight
          position={[0, -0.2, D / 2 - PORCH_D / 2]}
          intensity={5}
          color="#ffe8b5"
          distance={4}
        />
      </group>

      {/* 4. LANDSCAPING */}
      <PalmTree position={[-W / 2 - 2, 0, D / 2 - 1]} />
      <OrnamentalShrub position={[W / 2 + 1.5, 0, D / 2]} />
      {[-4, -2.5, 2.5, 4].map((x, i) => (
        <Sphere
          key={i}
          args={[0.3]}
          position={[x, 0.3, D / 2 + 1.5]}
          castShadow
          material={MAT_SHRUB_HI}
        />
      ))}
    </group>
  );
};
