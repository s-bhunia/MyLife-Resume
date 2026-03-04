import React, { useMemo } from "react";
import { MeshTransmissionMaterial } from "@react-three/drei";
import * as THREE from "three";
import { COLORS, CHIMNEY_PROFILE, TANK_PROFILE } from "./constants";

export const LampBody = () => {
  const wirePath = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 8.5, 0),
      new THREE.Vector3(2.2, 8.0, 0),
      new THREE.Vector3(2.2, 1.0, 0),
      new THREE.Vector3(1.0, 0.5, 0),
    ]);
  }, []);

  const vents = useMemo(() => {
    const items = [];
    const count = 12;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      items.push(
        <mesh
          key={i}
          position={[Math.cos(angle) * 1.5, 0.5, Math.sin(angle) * 1.5]}
          rotation={[0, -angle, 0]}
        >
          <capsuleGeometry args={[0.08, 0.3, 4, 8]} />
          <meshStandardMaterial color="#000000" roughness={0.8} />
        </mesh>,
      );
    }
    return items;
  }, []);

  // Custom Profile for Half-Filled Tank
  const halfFuelProfile = useMemo(() => {
    const liquidLevel = -1.5; // Slightly higher to be more visible
    const tankRadius = 2.75; // Matches the glass width closely

    return [
      new THREE.Vector2(0, liquidLevel),
      new THREE.Vector2(tankRadius, liquidLevel),
      new THREE.Vector2(tankRadius, -3.4),
      new THREE.Vector2(0, -3.9),
    ];
  }, []);

  return (
    <group>
      {/* 1. GLASS CHIMNEY */}
      <mesh receiveShadow castShadow position={[0, 0.5, 0]}>
        <latheGeometry args={[CHIMNEY_PROFILE, 64]} />
        <MeshTransmissionMaterial
          backside
          side={THREE.DoubleSide}
          thickness={0.05}
          roughness={0.1}
          transmission={1}
          ior={1.5}
          chromaticAberration={0.02}
          color={COLORS.glass}
        />
      </mesh>

      {/* 2. BURNER */}
      <group position={[0, 0, 0]}>
        <mesh position={[0, 0.25, 0]}>
          <cylinderGeometry args={[1.5, 1.6, 1.5, 32]} />
          <meshStandardMaterial
            color={COLORS.brass}
            metalness={0.6}
            roughness={0.3}
          />
        </mesh>
        {vents}
      </group>

      {/* 3. FUEL TANK ASSEMBLY */}
      <group position={[0, 0, 0]}>
        {/* Outer Glass Tank - OPTIMIZED FOR VISIBILITY */}
        <mesh position={[0, 0.1, 0]}>
          <latheGeometry args={[TANK_PROFILE, 64]} />
          <MeshTransmissionMaterial
            backside
            side={THREE.DoubleSide}
            // Reduced thickness prevents heavy distortion/refraction
            thickness={0.5}
            // Low roughness for clarity, but not 0 to avoid artifacts
            roughness={0.3}
            transmission={1}
            ior={1.5}
            color={COLORS.glass}
            // REMOVED clearcoat to stop the "shiny" surface reflection
            clearcoat={0}
            chromaticAberration={0} // Removed rainbow edges for clarity
          />
        </mesh>

        {/* Inner Fuel Liquid - MADE DENSER */}
        <mesh position={[0, 0.1, 0]}>
          <latheGeometry args={[halfFuelProfile, 64]} />
          <meshPhysicalMaterial
            color={COLORS.fuel}
            emissive={COLORS.fuel}
            emissiveIntensity={0.1}
            // Reduced transmission makes it look like dense liquid, not colored air
            transmission={0.1}
            transparent={true}
            opacity={1}
            roughness={0.3}
            metalness={0.9}
            ior={1.4}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      {/* 4. METAL WIRE FRAME */}
      <group position={[0, 6, 0]}>
        <mesh>
          <tubeGeometry args={[wirePath, 64, 0.07, 8, false]} />
          <meshStandardMaterial
            color={COLORS.darkMetal}
            roughness={0.7}
            metalness={0.5}
          />
        </mesh>
        <mesh scale={[-1, 1, 1]}>
          <tubeGeometry args={[wirePath, 64, 0.06, 8, false]} />
          <meshStandardMaterial
            color={COLORS.darkMetal}
            roughness={0.7}
            metalness={0.5}
          />
        </mesh>
      </group>
    </group>
  );
};
