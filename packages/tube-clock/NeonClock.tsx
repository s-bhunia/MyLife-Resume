import React from "react";
import { RoundedBox } from "@react-three/drei";
import { COLORS } from "./constants";

const SEGMENT_MAP: Record<string, number[]> = {
  "0": [1, 1, 1, 1, 1, 1, 0],
  "1": [0, 1, 1, 0, 0, 0, 0],
  "2": [1, 1, 0, 1, 1, 0, 1],
  "3": [1, 1, 1, 1, 0, 0, 1],
  "4": [0, 1, 1, 0, 0, 1, 1],
  "5": [1, 0, 1, 1, 0, 1, 1],
  "6": [1, 0, 1, 1, 1, 1, 1],
  "7": [1, 1, 1, 0, 0, 0, 0],
  "8": [1, 1, 1, 1, 1, 1, 1],
  "9": [1, 1, 1, 1, 0, 1, 1],
  P: [1, 1, 0, 0, 1, 1, 1],
  A: [1, 1, 1, 0, 1, 1, 1],
};

const Digit = ({
  value,
  size = 0.5,
  brightness,
}: {
  value: string;
  size?: number;
  brightness: number;
}) => {
  const thickness = size * 0.12;

  // GEOMETRY FIX:
  // We use the exact 'size' for positioning to keep corners aligned.
  // We reduce 'len' to create the visual gap between segments.
  const len = size * 0.85;

  // Standard 7-segment positions relative to center (0,0)
  // 0: Top, 1: TR, 2: BR, 3: Bottom, 4: BL, 5: TL, 6: Middle
  const segs = [
    [0, size, 0, 0], // Top (Horizontal)
    [size / 2, size / 2, Math.PI / 2, 1], // Top Right (Vertical)
    [size / 2, -size / 2, Math.PI / 2, 2], // Bottom Right (Vertical)
    [0, -size, 0, 3], // Bottom (Horizontal)
    [-size / 2, -size / 2, Math.PI / 2, 4], // Bottom Left (Vertical)
    [-size / 2, size / 2, Math.PI / 2, 5], // Top Left (Vertical)
    [0, 0, 0, 6], // Middle (Horizontal)
  ];

  return (
    <group>
      {segs.map((s, i) => {
        const idx = s[3] as number;
        // Safety check: Default to off if value not found
        const isActive = SEGMENT_MAP[value]
          ? SEGMENT_MAP[value][idx] === 1
          : false;

        const finalColor = isActive ? COLORS.neonOn : COLORS.neonOff;
        const emissiveColor = isActive ? "#ffaa00" : "#000000";
        const intensity = isActive ? brightness * 2 : 0;

        return (
          <RoundedBox
            key={i}
            args={[len, thickness, thickness]}
            radius={thickness / 2}
            position={[s[0] as number, s[1] as number, 0]}
            rotation={[0, 0, s[2] as number]}
          >
            <meshStandardMaterial
              color={finalColor}
              emissive={emissiveColor}
              emissiveIntensity={intensity}
              roughness={0.2}
              toneMapped={false}
            />
          </RoundedBox>
        );
      })}
    </group>
  );
};

// Custom 'M' component that matches Digit geometry exactly
const LetterM = ({
  size = 0.5,
  brightness,
}: {
  size?: number;
  brightness: number;
}) => {
  const thickness = size * 0.12;
  const len = size * 0.85; // Match Digit length

  const segs = [
    // 1. Left Vertical Column (Top Left & Bottom Left positions)
    [-size / 2, size / 2, Math.PI / 2],
    [-size / 2, -size / 2, Math.PI / 2],

    // 2. Right Vertical Column (Top Right & Bottom Right positions)
    [size / 2, size / 2, Math.PI / 2],
    [size / 2, -size / 2, Math.PI / 2],

    // 3. Center V (Diagonals)
    // Adjusted to hang from the top corners inwards
    [-size * 0.18, size * 0.3, -Math.PI / 6], // Left slant
    [size * 0.18, size * 0.3, Math.PI / 6], // Right slant
  ];

  // Slightly shorter length for diagonals
  const diagLen = size * 0.6;

  return (
    <group>
      {segs.map((s, i) => {
        const isDiagonal = i >= 4;
        const currentLen = isDiagonal ? diagLen : len;

        return (
          <RoundedBox
            key={i}
            args={[currentLen, thickness, thickness]}
            radius={thickness / 2}
            position={[s[0] as number, s[1] as number, 0]}
            rotation={[0, 0, s[2] as number]}
          >
            <meshStandardMaterial
              color={COLORS.neonOn}
              emissive="#ffaa00"
              emissiveIntensity={brightness * 2}
              roughness={0.2}
              toneMapped={false}
            />
          </RoundedBox>
        );
      })}
    </group>
  );
};

export const NeonClock = ({ brightness }: { brightness: number }) => {
  const [time, setTime] = React.useState(new Date());

  React.useEffect(() => {
    // Update every second
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const h = time.getHours();
  const m = time.getMinutes();
  const isPM = h >= 12;

  // Logic: 0 becomes 12, 13 becomes 1, etc.
  const hours = (h % 12 || 12).toString().padStart(2, "0");
  const minutes = m.toString().padStart(2, "0");

  return (
    <group position={[0, 2.5, 0]}>
      {/* Hours (Top) */}
      <group position={[-0.5, 1.2, 0]}>
        <Digit value={hours[0]} size={0.8} brightness={brightness} />
      </group>
      <group position={[0.5, 1.2, 0]}>
        <Digit value={hours[1]} size={0.8} brightness={brightness} />
      </group>

      {/* Minutes (Bottom) */}
      <group position={[-0.5, -0.6, 0]}>
        <Digit value={minutes[0]} size={0.8} brightness={brightness} />
      </group>
      <group position={[0.5, -0.6, 0]}>
        <Digit value={minutes[1]} size={0.8} brightness={brightness} />
      </group>

      {/* AM/PM (Side Vertical) */}
      <group position={[1.3, 0.3, 0]}>
        <Digit value={isPM ? "P" : "A"} size={0.25} brightness={brightness} />
        <group position={[0, -0.6, 0]}>
          <LetterM size={0.25} brightness={brightness} />
        </group>
      </group>
    </group>
  );
};
