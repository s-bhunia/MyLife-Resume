import { Text, Image } from "@react-three/drei";

interface FrontFacingBookProps {
  title: string;
  coverImage?: string;
  position: [number, number, number];
  color?: string;
}

const FrontFacingBook = ({
  title,
  coverImage,
  position,
  color = "#2c3e50",
}: FrontFacingBookProps) => {
  return (
    <group position={position}>
      {/* Main Book Volume */}
      <mesh castShadow>
        <boxGeometry args={[1.2, 1.8, 0.2]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* Title Text on Front Cover */}
      <Text
        position={[0, 0.5, 0.11]}
        fontSize={0.08}
        color="white"
        maxWidth={1}
        textAlign="center"
      >
        {title}
      </Text>

      {/* Optional Cover Image Placeholder */}
      {coverImage && (
        <Image url={coverImage} position={[0, -0.2, 0.12]} scale={[0.8, 1]} />
      )}
    </group>
  );
};

export default FrontFacingBook;
