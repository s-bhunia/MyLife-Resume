import { Sky, Plane } from "@react-three/drei";

// Low Poly Procedural Palm Tree
// Low Poly Procedural Palm Tree
const PalmTree = ({
  position,
  scale = 1,
}: {
  position: [number, number, number];
  scale?: number;
}) => {
  return (
    <group position={position} scale={scale}>
      {/* Trunk */}
      <mesh position={[0, 2, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.3, 4, 7]} />
        <meshStandardMaterial color="#5c4033" roughness={1} />
      </mesh>
      {/* Leaves */}
      <group position={[0, 3.8, 0]}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <group key={i} rotation={[0, (i * Math.PI) / 3, 0]}>
            <mesh position={[0, 0.2, 1.2]} rotation={[-0.5, 0, 0]} castShadow>
              <boxGeometry args={[0.3, 0.05, 2.5]} />
              <meshStandardMaterial color="#4a7a4a" />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
};

// Procedural Shrub
const Shrub = ({
  position,
  color = "#2d5a27",
}: {
  position: [number, number, number];
  color?: string;
}) => (
  <group position={position}>
    <mesh castShadow position={[0, 0.4, 0]}>
      <dodecahedronGeometry args={[0.6, 0]} />
      <meshStandardMaterial color={color} roughness={0.8} />
    </mesh>
    {/* Flowers */}
    <mesh position={[0.3, 0.6, 0.2]}>
      <sphereGeometry args={[0.1]} />
      <meshStandardMaterial
        color="yellow"
        emissive="yellow"
        emissiveIntensity={0.5}
      />
    </mesh>
    <mesh position={[-0.2, 0.5, 0.4]}>
      <sphereGeometry args={[0.08]} />
      <meshStandardMaterial color="white" />
    </mesh>
  </group>
);

export const Environment = () => {
  const sunPosition: [number, number, number] = [50, 40, 50];

  return (
    <group>
      <fog attach="fog" args={["#ccddff", 30, 100]} />

      <Sky
        distance={450000}
        sunPosition={sunPosition}
        inclination={0}
        azimuth={0.25}
      />

      <ambientLight intensity={0.4} color="#ccccff" />
      <directionalLight
        position={sunPosition}
        intensity={1.5}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      {/* Manicured Lawn */}
      <Plane
        args={[100, 100]}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.1, 0]}
        receiveShadow
      >
        <meshStandardMaterial color="#3a5f0b" roughness={1} />
      </Plane>

      {/* --- LANDSCAPING --- */}

      {/* Palm Tree (Left Side) */}
      <PalmTree position={[-9, 0, 3]} scale={1.2} />
      <PalmTree position={[-11, 0, -2]} scale={1.5} />

      {/* Tall Ornamental Shrub (Right Side Corner) */}
      <group position={[9, 0, 6]}>
        <mesh position={[0, 1.5, 0]} castShadow>
          <capsuleGeometry args={[0.4, 3, 4, 8]} />
          <meshStandardMaterial color="#1e4d2b" />
        </mesh>
      </group>

      {/* Decorative Front Plants */}
      <Shrub position={[-6, 0, 7]} />
      <Shrub position={[-7.5, 0, 7.5]} />
      <Shrub position={[6, 0, 7]} color="#3a6b35" />

      {/* Small rock feature */}
      <mesh position={[7, 0.2, 8]} rotation={[0.5, 0.5, 0]} castShadow>
        <dodecahedronGeometry args={[0.4, 0]} />
        <meshStandardMaterial color="#666" />
      </mesh>
    </group>
  );
};
