import { RoundedBox, useTexture } from "@react-three/drei";
import * as THREE from "three";

interface BookshelfProps {
  rows?: number;
  width?: number;
  height?: number;
  depth?: number;
  thickness?: number;
  smoothness?: number;
}

const BookshelfModel: React.FC<BookshelfProps> = ({
  rows = 5,
  width = 4,
  height = 6,
  depth = 1.5,
  thickness = 0.2,
  smoothness = 0.03,
}) => {
  // 1. Load the texture.
  // R3F will automatically suspend rendering until this is downloaded.
  const plyTexture = useTexture("/bookshelf/plywood.webp");

  // 2. Configure texture wrapping so it doesn't stretch awkwardly on long panels
  plyTexture.wrapS = THREE.RepeatWrapping;
  plyTexture.wrapT = THREE.RepeatWrapping;

  // Optional: Adjust how many times the texture repeats (tiles) across the surface
  plyTexture.repeat.set(0, 1);

  // 3. Apply the texture to our material
  const materialProps: THREE.MeshStandardMaterialParameters = {
    map: plyTexture,
    // We keep the whitish color! Three.js will mathematically blend this color
    // WITH your plywood texture, giving you a whitewashed plywood effect.
    // color: "#fbfbfb",
    roughness: 0.85,
    metalness: 0.05,
  };

  // --- Dynamic Math Calculations ---
  const halfW = width / 2;
  const halfH = height / 2;
  const halfD = depth / 2;

  const innerHeight = height - thickness * 2;
  const shelfSpacing = innerHeight / rows;

  const shelfPositions: number[] = [];
  const startY = -halfH + thickness;

  for (let i = 1; i < rows; i++) {
    shelfPositions.push(startY + i * shelfSpacing);
  }

  return (
    <group>
      <RoundedBox
        args={[thickness, height, depth]}
        position={[-halfW + thickness / 2, 0, 0]}
        radius={smoothness}
      >
        <meshStandardMaterial {...materialProps} />
      </RoundedBox>

      <RoundedBox
        args={[thickness, height, depth]}
        position={[halfW - thickness / 2, 0, 0]}
        radius={smoothness}
      >
        <meshStandardMaterial {...materialProps} />
      </RoundedBox>

      <RoundedBox
        args={[width - thickness * 2, thickness, depth]}
        position={[0, halfH - thickness / 2, 0]}
        radius={smoothness}
      >
        <meshStandardMaterial {...materialProps} />
      </RoundedBox>

      <RoundedBox
        args={[width - thickness * 2, thickness, depth]}
        position={[0, -halfH + thickness / 2, 0]}
        radius={smoothness}
      >
        <meshStandardMaterial {...materialProps} />
      </RoundedBox>

      <RoundedBox
        args={[width, height, thickness]}
        position={[0, 0, -halfD + thickness / 2]}
        radius={smoothness}
      >
        <meshStandardMaterial {...materialProps} />
      </RoundedBox>

      {shelfPositions.map((y, index) => (
        <RoundedBox
          key={`shelf-${index}`}
          args={[width - thickness * 2, thickness, depth - thickness]}
          position={[0, y, thickness / 2]}
          radius={smoothness}
        >
          <meshStandardMaterial {...materialProps} />
        </RoundedBox>
      ))}
    </group>
  );
};

export default BookshelfModel;
