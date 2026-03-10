import { useState, memo } from "react";
import { Cylinder } from "@react-three/drei";
// import { extend } from "@react-three/fiber";
import { COLORS } from "./constants";

// Map your percentages to actual Light Intensity values
// 0% = 0 (Off)
// 30% = 0.6 (Dim, no bloom)
// 50% = 1.2 (Low Glow, slight bloom)
// 70% = 2.0 (Bright)
// 100% = 4.0 (Max Neon)
const INTENSITY_MAP = [0, 0.6, 1.2, 2.0, 4.0];
const STEPS_DEG = [0, 72, 144, 216, 288]; // Rotation angles for visual feedback

interface KnobProps {
  setBrightness: (val: number) => void;
  currentBrightness: number;
}

export const KnobControl = memo(({ setBrightness }: KnobProps) => {
  const [stepIndex, setStepIndex] = useState(3); // Start at index 3 (70% brightness)

  const handleClick = (e: any) => {
    e.stopPropagation();
    const nextIndex = (stepIndex + 1) % INTENSITY_MAP.length;
    setStepIndex(nextIndex);
    setBrightness(INTENSITY_MAP[nextIndex]);
  };

  const currentRotation = (STEPS_DEG[stepIndex] * Math.PI) / 180;

  return (
    <group position={[1.8, 0, 0]}>
      {/* The Stem */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.05, 0.5]} />
        <meshStandardMaterial color={COLORS.brass} />
      </mesh>

      {/* The Knob Head (Clickable) */}
      <group
        position={[0.3, 0, 0]}
        rotation={[currentRotation, 0, Math.PI / 2]}
        onClick={handleClick}
        onPointerOver={() => (document.body.style.cursor = "pointer")}
        onPointerOut={() => (document.body.style.cursor = "auto")}
      >
        {/* Main Knob Body */}
        <Cylinder args={[0.2, 0.2, 0.1, 8]}>
          <meshStandardMaterial
            color={COLORS.brass}
            roughness={0.3}
            metalness={0.8}
          />
        </Cylinder>

        {/* Visual Grip Ridges (Decor) */}
        <Cylinder args={[0.22, 0.22, 0.02, 8]} position={[0, 0, 0]}>
          <meshStandardMaterial color="#000" />
        </Cylinder>

        {/* Position Marker (Small dot to show rotation) */}
        <mesh position={[0.15, 0.06, 0]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#ffffff"
            emissiveIntensity={0.5}
          />
        </mesh>
      </group>
    </group>
  );
});
