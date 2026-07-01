import { useState, memo } from "react";
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

// Animated wrapper replaced with a static group to save GPU
const TubeClockStatic = memo(
  ({
    brightness,
    setBrightness,
  }: {
    brightness: number;
    setBrightness: (val: number) => void;
  }) => {
    return (
      <group position={[0, 2, 0]}>
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
    <TubeClockStatic brightness={brightness} setBrightness={setBrightness} />
  );
}
