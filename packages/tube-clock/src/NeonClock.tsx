import React, { memo, useMemo } from "react";
import * as THREE from "three";
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

const Digit = memo(
  ({
    value,
    size = 0.5,
    brightness,
  }: {
    value: string;
    size?: number;
    brightness: number;
  }) => {
    const thickness = size * 0.12;
    const len = size * 0.85;

    const segs = useMemo(
      () => [
        [0, size, 0, 0],
        [size / 2, size / 2, Math.PI / 2, 1],
        [size / 2, -size / 2, Math.PI / 2, 2],
        [0, -size, 0, 3],
        [-size / 2, -size / 2, Math.PI / 2, 4],
        [-size / 2, size / 2, Math.PI / 2, 5],
        [0, 0, 0, 6],
      ],
      [size],
    );

    const isActiveMap = useMemo(() => {
      const map: boolean[] = [];
      const segValues = SEGMENT_MAP[value] || [0, 0, 0, 0, 0, 0, 0];
      for (let i = 0; i < 7; i++) {
        map.push(segValues[i] === 1);
      }
      return map;
    }, [value]);

    return (
      <group>
        {segs.map((s, i) => {
          const isActive = isActiveMap[i];
          const emissiveColor = isActive ? "#ffaa00" : "#ede1e1";
          const intensity = isActive ? brightness * 8 : 0;

          return (
            <group
              key={`segment-${value}-${i}`}
              position={[s[0] as number, s[1] as number, 0]}
              rotation={[0, 0, s[2] as number]}
            >
              {/* 1. THE CORE TUBE (White hot in the center when active) */}
              <RoundedBox
                args={[len, thickness, thickness]}
                radius={thickness / 2}
              >
                <meshStandardMaterial
                  color={isActive ? "#ffffff" : COLORS.neonOff}
                  emissive={emissiveColor}
                  emissiveIntensity={intensity}
                  roughness={0.2}
                  transparent={true}
                  opacity={isActive ? 1 : 0.05}
                  toneMapped={false}
                />
              </RoundedBox>
              {/* 2. THE NEON GLOW HALO (Only renders on active segments) */}
              {isActive && (
                <RoundedBox
                  args={[len + 0.04, thickness * 2.5, thickness * 2.5]}
                  radius={thickness}
                >
                  <meshBasicMaterial
                    color="#ff5900" // The color of the glow
                    transparent={true}
                    opacity={0.5} // Soft transparency
                    depthWrite={false} // Prevents clipping with the glass
                    blending={THREE.AdditiveBlending} // This is the magic that creates the optical "glow"
                    toneMapped={false}
                  />
                </RoundedBox>
              )}
            </group>
          );
        })}
      </group>
    );
  },
);

const LetterM = memo(
  ({ size = 0.5, brightness }: { size?: number; brightness: number }) => {
    const thickness = size * 0.12;
    const len = size * 0.85;

    const segs = useMemo(
      () => [
        [-size / 2, size / 2, Math.PI / 2],
        [-size / 2, -size / 2, Math.PI / 2],
        [size / 2, size / 2, Math.PI / 2],
        [size / 2, -size / 2, Math.PI / 2],
        [-size * 0.18, size * 0.3, -Math.PI / 6],
        [size * 0.18, size * 0.3, Math.PI / 6],
      ],
      [size],
    );

    const diagLen = size * 0.6;

    return (
      <group>
        {segs.map((s, i) => {
          const isDiagonal = i >= 4;
          const currentLen = isDiagonal ? diagLen : len;

          return (
            <group
              key={`letter-m-${i}`}
              position={[s[0] as number, s[1] as number, 0]}
              rotation={[0, 0, s[2] as number]}
            >
              {/* 1. CORE TUBE */}
              <RoundedBox
                args={[currentLen, thickness, thickness]}
                radius={thickness / 2}
              >
                <meshStandardMaterial
                  color="#ffffff"
                  emissive="#ffaa00"
                  emissiveIntensity={brightness * 6}
                  roughness={0.2}
                  toneMapped={false}
                />
              </RoundedBox>

              {/* 2. NEON GLOW HALO */}
              <RoundedBox
                args={[currentLen + 0.04, thickness * 2.5, thickness * 2.5]}
                radius={thickness}
              >
                <meshBasicMaterial
                  color="#ff5100"
                  transparent={true}
                  opacity={0.15}
                  depthWrite={false}
                  blending={THREE.AdditiveBlending}
                  toneMapped={false}
                />
              </RoundedBox>
            </group>
          );
        })}
      </group>
    );
  },
);

export const NeonClock = memo(({ brightness }: { brightness: number }) => {
  const [time, setTime] = React.useState(new Date());

  React.useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const h = time.getHours();
  const m = time.getMinutes();
  const isPM = h >= 12;

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
});
