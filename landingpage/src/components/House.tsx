import { Box, Plane, Cylinder, Sphere } from "@react-three/drei";
import { useRef, useState, useEffect, memo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Geometry, Base, Subtraction } from "@react-three/csg";

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

// --- UTILITY COMPONENTS ---

const TallWindow = memo(({
  position,
  rotation = [0, 0, 0],
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
}) => {
  const frameColor = "#1a1a1a";
  const F_DEPTH = THICKNESS + 0.05;

  return (
    <group position={position} rotation={rotation}>
      {/* Outer Hollow Frame */}
      <Box
        args={[0.8, 0.05, F_DEPTH]}
        position={[0, 1.075, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={frameColor} roughness={0.4} />
      </Box>
      <Box
        args={[0.8, 0.05, F_DEPTH]}
        position={[0, -1.075, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={frameColor} roughness={0.4} />
      </Box>
      <Box
        args={[0.05, 2.1, F_DEPTH]}
        position={[-0.375, 0, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={frameColor} roughness={0.4} />
      </Box>
      <Box
        args={[0.05, 2.1, F_DEPTH]}
        position={[0.375, 0, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={frameColor} roughness={0.4} />
      </Box>

      {/* Stone Window Sill */}
      <Box
        args={[0.9, 0.06, 0.3]}
        position={[0, -1.13, 0.05]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color="#d4cbb8" roughness={0.8} />
      </Box>

      {/* Crossbars (Mullions) */}
      <Box args={[0.03, 2.1, 0.05]} position={[0, 0, 0]} castShadow>
        <meshStandardMaterial color={frameColor} roughness={0.4} />
      </Box>
      <Box args={[0.7, 0.03, 0.05]} position={[0, 0.3, 0]} castShadow>
        <meshStandardMaterial color={frameColor} roughness={0.4} />
      </Box>
      <Box args={[0.7, 0.03, 0.05]} position={[0, -0.4, 0]} castShadow>
        <meshStandardMaterial color={frameColor} roughness={0.4} />
      </Box>

      {/* Glass Pane */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.7, 2.1, 0.02]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transmission={0.9}
          opacity={0.4}
          roughness={0.1}
          transparent
        />
      </mesh>
    </group>
  );
});

const GeometricDoor = memo(({
  position,
  entranceOpen = false,
}: {
  position: [number, number, number];
  entranceOpen?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const doorRef = useRef<THREE.Group>(null);

  // Listen to the prop from App.tsx to trigger the swing
  useEffect(() => {
    setIsOpen(entranceOpen);
  }, [entranceOpen]);

  useFrame((state, delta) => {
    if (doorRef.current) {
      // Swing inward by -90 degrees
      const targetRotation = isOpen ? -Math.PI / 2 : 0;
      doorRef.current.rotation.y = THREE.MathUtils.damp(
        doorRef.current.rotation.y,
        targetRotation,
        5,
        delta,
      );
    }
  });

  return (
    <group position={position}>
      {/* Static Door Frame */}
      <group position={[0, 1.2, 0]}>
        <mesh position={[0, 1.2 - 0.025, 0]} castShadow>
          <boxGeometry args={[1.2, 0.05, THICKNESS + 0.05]} />
          <meshStandardMaterial color="#3d2613" roughness={0.8} />
        </mesh>
        <mesh position={[-0.6 + 0.025, 0, 0]} castShadow>
          <boxGeometry args={[0.05, 2.4, THICKNESS + 0.05]} />
          <meshStandardMaterial color="#3d2613" roughness={0.8} />
        </mesh>
        <mesh position={[0.6 - 0.025, 0, 0]} castShadow>
          <boxGeometry args={[0.05, 2.4, THICKNESS + 0.05]} />
          <meshStandardMaterial color="#3d2613" roughness={0.8} />
        </mesh>
      </group>

      {/* Swinging Door - Hinge set to left edge (-0.6) */}
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
          {/* Main Door Slab */}
          <mesh position={[0.6, 1.175, 0]} castShadow>
            <boxGeometry args={[1.1, 2.35, 0.1]} />
            <meshStandardMaterial color="#6b4423" roughness={0.7} />
          </mesh>

          {/* Stacked Square Panels */}
          {[0.4, 0.9, 1.4, 1.9].map((y, i) => (
            <mesh key={i} position={[0.6, y - 0.025, 0.06]} castShadow>
              <boxGeometry args={[0.7, 0.35, 0.02]} />
              <meshStandardMaterial color="#54351b" roughness={0.8} />
            </mesh>
          ))}

          {/* Door Handle */}
          <group position={[1.05, 1.175, 0.06]}>
            <mesh castShadow>
              <boxGeometry args={[0.06, 0.25, 0.02]} />
              <meshStandardMaterial
                color="#111111"
                metalness={0.8}
                roughness={0.2}
              />
            </mesh>
            <mesh position={[-0.04, 0, 0.03]} castShadow>
              <boxGeometry args={[0.12, 0.03, 0.03]} />
              <meshStandardMaterial
                color="#111111"
                metalness={0.8}
                roughness={0.2}
              />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
});

// --- LANDSCAPING COMPONENTS ---

const PalmTree = memo(({
  position,
}: { position: [number, number, number] }) => (
  <group position={position}>
    <Cylinder args={[0.15, 0.25, 3]} position={[0, 1.5, 0]} castShadow>
      <meshStandardMaterial color="#5c4033" roughness={0.9} />
    </Cylinder>
    {[0, 1, 2, 3, 4].map((i) => (
      <Plane
        key={i}
        args={[1.5, 0.5]}
        position={[0, 3, 0]}
        rotation={[Math.PI / 4, (i * Math.PI * 2) / 5, 0]}
        castShadow
      >
        <meshStandardMaterial color="#2d5a27" side={THREE.DoubleSide} />
      </Plane>
    ))}
  </group>
));

const OrnamentalShrub = memo(({
  position,
}: {
  position: [number, number, number];
}) => (
  <group position={position}>
    <Cylinder args={[0.05, 0.05, 1]} position={[0, 0.5, 0]} castShadow>
      <meshStandardMaterial color="#3d2817" />
    </Cylinder>
    <Sphere args={[0.4]} position={[0, 1, 0]} castShadow>
      <meshStandardMaterial color="#4a7c3b" roughness={0.8} />
    </Sphere>
    <Sphere args={[0.3]} position={[0, 1.5, 0]} castShadow>
      <meshStandardMaterial color="#5c9a49" roughness={0.8} />
    </Sphere>
  </group>
));

// --- MAIN HOUSE COMPONENT ---

export const House = ({ entranceOpen = false }: { entranceOpen?: boolean }) => {
  const matPlaster = <meshStandardMaterial color="#f0f0f0" roughness={0.9} />;
  const matCladding = <meshStandardMaterial color="#d4cbb8" roughness={1} />;
  const matPinkBand = <meshStandardMaterial color="#e0a8b9" roughness={0.6} />;

  const WallSegment = memo(({
    args,
    position,
    rotation = [0, 0, 0],
    cutouts = [],
  }: any) => {
    const [w, , d] = args;
    return (
      <group position={position} rotation={rotation}>
        <mesh castShadow receiveShadow position={[0, H_BASE / 2, 0]}>
          <Geometry>
            <Base>
              <boxGeometry args={[w, H_BASE, d]} />
            </Base>
            {cutouts.map((cut: any, i: number) => (
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
          {matCladding}
        </mesh>

        <mesh castShadow receiveShadow position={[0, H_BASE + H_UPPER / 2, 0]}>
          <Geometry>
            <Base>
              <boxGeometry args={[w, H_UPPER, d]} />
            </Base>
            {cutouts.map((cut: any, i: number) => (
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
          {matPlaster}
        </mesh>

        <mesh castShadow position={[0, H_BASE + H_UPPER + H_BAND / 2, 0]}>
          <Geometry>
            <Base>
              <boxGeometry args={[w + 0.02, H_BAND, d + 0.02]} />
            </Base>
            {cutouts.map((cut: any, i: number) => (
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
          {matPinkBand}
        </mesh>
      </group>
    );
  });
  
  return (
    <group position={[0, 0, 0]}>
      {/* 1. PLATFORM & SURROUNDINGS */}
      <group>
        <Box args={[W + 2, 0.4, D + 2]} position={[0, 0.2, 0]} receiveShadow>
          <meshStandardMaterial color="#8a8a8a" roughness={0.8} />
        </Box>
        <Box args={[W + 2.1, 0.05, D + 2.1]} position={[0, 0.38, 0]}>
          <meshStandardMaterial color="#e8c338" roughness={0.5} />
        </Box>
        <Box
          args={[4, 0.15, 0.6]}
          position={[0, 0.075, D / 2 + 1.3]}
          receiveShadow
        >
          <meshStandardMaterial color="#8a8a8a" />
        </Box>
        <Box
          args={[4, 0.3, 0.6]}
          position={[0, 0.15, D / 2 + 0.7]}
          receiveShadow
        >
          <meshStandardMaterial color="#8a8a8a" />
        </Box>
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
      <group position={[0, 0.4, 0]}>
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
        <WallSegment args={[W, 0, THICKNESS]} position={[0, 0, -D / 2]} />

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

        <WallSegment
          args={[THICKNESS, 0, PORCH_D]}
          position={[-PORCH_W / 2, 0, D / 2 - PORCH_D / 2]}
        />
        <WallSegment
          args={[THICKNESS, 0, PORCH_D]}
          position={[PORCH_W / 2, 0, D / 2 - PORCH_D / 2]}
        />

        <WallSegment
          args={[PORCH_W, 0, THICKNESS]}
          position={[0, 0, D / 2 - PORCH_D]}
          cutouts={[
            { position: [0, 1.2, 0], args: [1.2, 2.4, THICKNESS + 0.2] },
          ]}
        />

        <Plane
          args={[PORCH_W, PORCH_D]}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.01, D / 2 - PORCH_D / 2]}
        >
          <meshStandardMaterial color="#1a1a1a" roughness={0.7} />
        </Plane>

        <GeometricDoor
          position={[0, 0, D / 2 - PORCH_D]}
          entranceOpen={entranceOpen}
        />

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
      <group position={[0, 0.4 + H_TOTAL, 0]}>
        <Box
          args={[W + 1.2, 0.25, D + 1.2]}
          position={[0, 0.125, 0]}
          castShadow
        >
          <meshStandardMaterial color="#e0e0e0" roughness={0.9} />
        </Box>
        <mesh position={[0, -0.01, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry
            args={[Math.max(W, D) / 2, Math.max(W, D) / 2 + 0.4, 4]}
          />
          <meshBasicMaterial color="#6a0dad" />
        </mesh>
        <rectAreaLight
          width={W + 1}
          height={D + 1}
          color="#8a2be2"
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
        >
          <meshStandardMaterial color="#5c9a49" roughness={0.9} />
        </Sphere>
      ))}
    </group>
  );
};