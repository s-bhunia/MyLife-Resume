import { useMemo, memo } from "react";
import * as THREE from "three";
import { COLORS, CHIMNEY_PROFILE, TANK_PROFILE } from "./constants";

export const LampBody = memo(() => {
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
    const count = 8;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      items.push(
        <mesh
          key={`vent-${i}`}
          position={[Math.cos(angle) * 1.5, 0.5, Math.sin(angle) * 1.5]}
          rotation={[0, -angle, 0]}
        >
          <capsuleGeometry args={[0.08, 0.3, 4, 8]} />
          <meshStandardMaterial color="#000000" roughness={1} />
        </mesh>,
      );
    }
    return items;
  }, []);

  const halfFuelProfile = useMemo(() => {
    const liquidLevel = -1.5;
    const tankRadius = 2.75;

    return [
      new THREE.Vector2(0, liquidLevel),
      new THREE.Vector2(tankRadius, liquidLevel),
      new THREE.Vector2(tankRadius, -3.4),
      new THREE.Vector2(0, -3.9),
    ];
  }, []);

  return (
    <group>
      {/* 1. GLASS CHIMNEY - CLEAR FRONT, FROSTED BACK */}
      <group position={[0, 0.5, 0]} rotation={[0, -Math.PI / 2, 0]}>
        {/* Front Half: Clear Transparent Glass (OPTIMIZED) */}
        <mesh receiveShadow castShadow>
          <latheGeometry args={[CHIMNEY_PROFILE, 16, 0, Math.PI]} />
          <meshStandardMaterial
            color="#ffffff"
            transparent={true}
            opacity={0.15}
            roughness={0.5} // Crystal clear
            metalness={0.9} // High metalness catches environment reflections like glass
            envMapIntensity={2}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Back Half: Frosted/Blurry Glass (OPTIMIZED) */}
        <mesh receiveShadow castShadow>
          <latheGeometry args={[CHIMNEY_PROFILE, 16, Math.PI, Math.PI]} />
          <meshStandardMaterial
            color="#ffffff"
            transparent={true}
            opacity={0.7}
            roughness={0.9} // High roughness for frosted look
            metalness={0.7}
            envMapIntensity={1}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      {/* 2. BURNER */}
      <group position={[0, 0, 0]}>
        <mesh position={[0, 0.25, 0]}>
          <cylinderGeometry args={[1.5, 1.6, 1.5, 8]} />
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
        {/* Outer Glass Tank (OPTIMIZED) */}
        <mesh position={[0, 0.1, 0]}>
          <latheGeometry args={[TANK_PROFILE, 16]} />
          <meshStandardMaterial
            color="#ffffff"
            transparent={true}
            opacity={0.15}
            roughness={0.9}
            metalness={0.9}
            envMapIntensity={2}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Inner Fuel Liquid (OPTIMIZED) */}
        <mesh position={[0, 0.1, 0]}>
          <latheGeometry args={[halfFuelProfile, 16]} />
          <meshStandardMaterial
            color={COLORS.fuel}
            emissive={COLORS.fuel}
            emissiveIntensity={0.15}
            transparent={true}
            opacity={0.85}
            roughness={0.3}
            metalness={0.6}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      {/* 4. METAL WIRE FRAME */}
      <group position={[0, 6, 0]}>
        <mesh>
          <tubeGeometry args={[wirePath, 12, 0.07, 8, false]} />
          <meshStandardMaterial
            color={COLORS.darkMetal}
            roughness={0.7}
            metalness={0.5}
          />
        </mesh>
        <mesh scale={[-1, 1, 1]}>
          <tubeGeometry args={[wirePath, 12, 0.06, 8, false]} />
          <meshStandardMaterial
            color={COLORS.darkMetal}
            roughness={0.7}
            metalness={0.5}
          />
        </mesh>
      </group>
    </group>
  );
});
