import React, { useState, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import { LampBody } from "./LampBody";
import { NeonClock } from "./NeonClock";
import { KnobControl } from "./KnobControl";

// Rename SwayingLamp to TubeClock and export it directly
export default function TubeClock() {
  const groupRef = useRef<THREE.Group>(null);
  const [brightness, setBrightness] = useState(2.0);

  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.getElapsedTime();
      groupRef.current.rotation.z = Math.sin(t * 0.8) * 0.05;
      groupRef.current.rotation.x = Math.cos(t * 0.6) * 0.02;
    }
  });

  return (
    <group ref={groupRef} position={[0, 2, 0]}>
      <LampBody />

      <NeonClock brightness={brightness} />

      <KnobControl
        setBrightness={setBrightness}
        currentBrightness={brightness}
      />

      <pointLight
        position={[0, 2, 0]}
        color="#ffaa00"
        intensity={brightness === 0 ? 0 : 1 + brightness * 0.5}
        distance={10}
        decay={2}
      />
    </group>
  );
}
