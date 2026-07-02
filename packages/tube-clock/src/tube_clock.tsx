import { useState, useRef, memo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import { LampBody } from "./LampBody";
import { NeonClock } from "./NeonClock";
import { KnobControl } from "./KnobControl";

// Static part - only re-renders when brightness changes
const TubeClockContent = memo(
  ({
    brightness,
    setBrightness,
  }: {
    brightness: number;
    setBrightness: (val: number) => void;
  }) => {
    return (
      <>
        <LampBody />
        <NeonClock brightness={brightness} />
        <KnobControl
          setBrightness={setBrightness}
          currentBrightness={brightness}
        />
      </>
    );
  },
);

// Animated wrapper - handles rotation without causing content re-renders
const TubeClockAnimated = memo(
  ({
    brightness,
    setBrightness,
  }: {
    brightness: number;
    setBrightness: (val: number) => void;
  }) => {
    const groupRef = useRef<THREE.Group>(null);

    useFrame((state) => {
      if (groupRef.current) {
        // OPTIMIZATION: Only calculate sway if the camera is near the clock
        const dist = state.camera.position.distanceTo(
          groupRef.current.position,
        );

        if (dist < 15) {
          const t = state.clock.getElapsedTime();
          groupRef.current.rotation.z = Math.sin(t * 0.8) * 0.05;
          groupRef.current.rotation.x = Math.cos(t * 0.6) * 0.02;
        }
      }
    });

    return (
      // FIX: Added ref={groupRef} so the sway animation actually connects to the object!
      <group ref={groupRef} position={[0, 2, 0]}>
        <TubeClockContent
          brightness={brightness}
          setBrightness={setBrightness}
        />
      </group>
    );
  },
);

// Main component with local state
export default function TubeClock() {
  const [brightness, setBrightness] = useState(2.0);

  return (
    <TubeClockAnimated brightness={brightness} setBrightness={setBrightness} />
  );
}
