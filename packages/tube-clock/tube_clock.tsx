import React, { useState, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";

import { LampBody } from "./LampBody";
import { NeonClock } from "./NeonClock";
import { KnobControl } from "./KnobControl";

// Component to handle the physics sway
const SwayingLamp = () => {
  const groupRef = useRef<THREE.Group>(null);

  // Start at 2.0 (which corresponds to our 70% step in the knob)
  const [brightness, setBrightness] = useState(2.0);

  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.getElapsedTime();
      // Slower, heavier sway as requested previously
      groupRef.current.rotation.z = Math.sin(t * 0.8) * 0.05;
      groupRef.current.rotation.x = Math.cos(t * 0.6) * 0.02;
    }
  });

  return (
    <group ref={groupRef} position={[0, 2, 0]}>
      <LampBody />
      {/* Pass brightness to clock */}
      <NeonClock brightness={brightness} />

      {/* Pass setter to knob */}
      <KnobControl
        setBrightness={setBrightness}
        currentBrightness={brightness}
      />

      {/* Light Source */}
      <pointLight
        position={[0, 2, 0]}
        color="#ffaa00"
        // If brightness is 0, light is 0. Otherwise scale it slightly
        intensity={brightness === 0 ? 0 : 1 + brightness * 0.5}
        distance={10}
        decay={2}
      />
    </group>
  );
};

export default function tube_clock() {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 0, 14], fov: 40 }}
      gl={{ toneMapping: THREE.ReinhardToneMapping }}
    >
      <color attach="background" args={["#050505"]} />

      {/* Lighting */}
      <ambientLight intensity={0.1} />
      <spotLight
        position={[10, 15, 10]}
        angle={0.3}
        penumbra={1}
        intensity={1}
        castShadow
      />
      <Environment preset="city" blur={0.8} />

      <SwayingLamp />

      <OrbitControls
        target={[0, 0, 0]}
        maxPolarAngle={Math.PI / 1.5}
        enablePan={false}
      />

      <EffectComposer disableNormalPass>
        <Bloom
          luminanceThreshold={0.5} // Bloom kicks in for our neon segments
          mipmapBlur
          intensity={1.0}
          radius={0.5}
        />
      </EffectComposer>
    </Canvas>
  );
}
