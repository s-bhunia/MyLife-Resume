import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, Float } from "@react-three/drei";
import * as THREE from "three";

interface BookProps {
  title: string;
  color: string;
  position: [number, number, number];
  [key: string]: any;
}

const Book = ({ title, color, position, ...props }: BookProps) => {
  const mesh = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Subtle floating animation when hovered
  useFrame(() => {
    if (hovered && mesh.current) {
      mesh.current.position.y = THREE.MathUtils.lerp(
        mesh.current.position.y,
        position[1] + 0.2,
        0.1
      );
    } else if (mesh.current) {
      mesh.current.position.y = THREE.MathUtils.lerp(
        mesh.current.position.y,
        position[1],
        0.1
      );
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <group
        {...props}
        position={position}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        {/* Book Spine */}
        <mesh castShadow position={[-0.45, 0, 0]}>
          <boxGeometry args={[0.1, 1.5, 0.8]} />
          <meshStandardMaterial color={color} roughness={0.3} />
        </mesh>

        {/* Book Pages/Body */}
        <mesh castShadow position={[0, 0, 0]}>
          <boxGeometry args={[0.8, 1.45, 0.75]} />
          <meshStandardMaterial color="#f5f5f5" />
        </mesh>

        {/* Front Cover */}
        <mesh castShadow position={[0.45, 0, 0]}>
          <boxGeometry args={[0.1, 1.5, 0.8]} />
          <meshStandardMaterial color={color} />
          <Text
            position={[0.06, 0, 0]}
            rotation={[0, Math.PI / 2, 0]}
            fontSize={0.1}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            {title}
          </Text>
        </mesh>
      </group>
    </Float>
  );
};

export default Book;
