// globe/src/GlobeStand.tsx
import React, { useMemo } from 'react';
import * as THREE from 'three';

type Position3D = [number, number, number];
type Rotation3D = [number, number, number];

interface ComponentControls {
  position?: Position3D;
  rotation?: Rotation3D;
  scale?: [number, number, number] | number;
}

interface GlobeStandProps {
  globeRadius: number;
  /** Rotation in radians (0 to 6.28) - this spins the entire stand around the vertical axis */
  azimuthRotation?: number;
  
  // Base controls
  base?: ComponentControls & {
    radius?: number;
    radiusTop?: number;
    height?: number;
  };
  
  // Stem controls
  stem?: ComponentControls & {
    radius?: number;
    height?: number;
  };
  
  // Joint/Connector controls
  joint?: ComponentControls & {
    radiusTop?: number;
    radiusBottom?: number;
    height?: number;
  };
  
  // Meridian ring controls
  ring?: ComponentControls & {
    radius?: number; // Distance from center to ring center
    tubeRadius?: number; // Thickness of the ring tube
    arcAngle?: number; // Arc angle in radians (Math.PI for half-ring)
    segments?: number;
    tubeSegments?: number;
  };
  
  // North pole pin controls
  northPin?: ComponentControls & {
    radius?: number;
    length?: number;
  };
  
  // South pole pin controls
  southPin?: ComponentControls & {
    radius?: number;
    length?: number;
  };
}

export const GlobeStand: React.FC<GlobeStandProps> = ({ 
  globeRadius, 
  azimuthRotation = 0,
  base,
  stem,
  joint,
  ring,
  northPin,
  southPin,
}) => {
  // MATERIAL
  const metalMaterial = new THREE.MeshStandardMaterial({
    color: '#B0B0B0',
    metalness: 0.6,
    roughness: 0.3,
  });

  // DEFAULT VALUES
  const baseDefaults = {
    position: [0.0, -3.88, 0.00] as Position3D,
    rotation: [0, 0, 0] as Rotation3D,
    scale: 1 as number,
    radius: 1.8,
    radiusTop: 1.8 * 1.15,
    height: 0.3,
  };

  const stemDefaults = {
    position: [0.0, -3.1, 0.00] as Position3D,
    rotation: [0, 0, 0] as Rotation3D,
    scale: 1 as number,
    radius: 0.17,
    height: 1.4,
  };

  const jointDefaults = {
    position: [0.0, -2.47, 0.00] as Position3D,
    rotation: [0, 0, 0] as Rotation3D,
    scale: 1 as number,
    radiusTop: 0.2,
    radiusBottom: 0.1,
    height: 0.4,
  };

  const ringDefaults = {
    position: [0.0, 0, 0] as Position3D,
    rotation: [2.05, 1.57, -0.12] as Rotation3D,
    scale: 1 as number,
    radius: globeRadius + 0.3,
    tubeRadius: 0.1,
    arcAngle: Math.PI + 0.2, // Half-ring (C-shape)
    segments: 50,
    tubeSegments: 16,
  };

  const pinDefaults = {
    radius: 0.045,
    length: 0.3,
  };

  const northPinDefaults = {
    position: [0, globeRadius -0.1, 0.89] as Position3D,
    rotation: [0.5, 0, 0] as Rotation3D,
    scale: 1 as number,
    ...pinDefaults,
  };

  const southPinDefaults = {
    position: [0, -globeRadius +0.1, -0.89] as Position3D,
    rotation: [0.5, 0, 0] as Rotation3D,
    scale: 1 as number,
    ...pinDefaults,
  };

  // MERGE DEFAULTS WITH PROPS
  const baseConfig = { ...baseDefaults, ...base };
  const stemConfig = { ...stemDefaults, ...stem };
  const jointConfig = { ...jointDefaults, ...joint };
  const ringConfig = { ...ringDefaults, ...ring };
  const northPinConfig = { ...northPinDefaults, ...northPin };
  const southPinConfig = { ...southPinDefaults, ...southPin };

  // Helper: Normalize scale
  const getScale = (scale?: [number, number, number] | number): [number, number, number] => {
    if (!scale) return [1, 1, 1];
    if (typeof scale === 'number') return [scale, scale, scale];
    return scale;
  };

  // Helper: Calculate Cap Positions
  // TorusGeometry draws in the XY plane starting at angle 0.
  // Start Cap: (Radius, 0, 0)
  // End Cap: (Radius * cos(arc), Radius * sin(arc), 0)
  const startCapPos = useMemo(() => {
    return [ringConfig.radius, 0, 0] as Position3D;
  }, [ringConfig.radius]);

  const endCapPos = useMemo(() => {
    const angle = ringConfig.arcAngle;
    return [
      ringConfig.radius * Math.cos(angle),
      ringConfig.radius * Math.sin(angle),
      0
    ] as Position3D;
  }, [ringConfig.radius, ringConfig.arcAngle]);

  return (
    <group>
      {/* AZIMUTH ROTATION GROUP */}
      <group rotation={[0, azimuthRotation, 0]}>
        
        {/* BASE */}
        <mesh 
          position={baseConfig.position} 
          rotation={baseConfig.rotation}
          scale={getScale(baseConfig.scale)}
          receiveShadow
        >
          <cylinderGeometry args={[baseConfig.radius, baseConfig.radiusTop, baseConfig.height, 64]} />
          <primitive object={metalMaterial} attach="material" />
        </mesh>

        {/* STEM */}
        <mesh 
          position={stemConfig.position} 
          rotation={stemConfig.rotation}
          scale={getScale(stemConfig.scale)}
          castShadow
        >
          <cylinderGeometry args={[stemConfig.radius, stemConfig.radius, stemConfig.height, 32]} />
          <primitive object={metalMaterial} attach="material" />
        </mesh>

        {/* JOINT */}
        <mesh 
          position={jointConfig.position} 
          rotation={jointConfig.rotation}
          scale={getScale(jointConfig.scale)}
          castShadow
        >
          <cylinderGeometry args={[jointConfig.radiusTop, jointConfig.radiusBottom, jointConfig.height, 32]} />
          <primitive object={metalMaterial} attach="material" />
        </mesh>

        {/* --- MERIDIAN RING ASSEMBLY --- */}
        {/* We wrap the ring and its caps in a group so they rotate together */}
        <group
          position={ringConfig.position}
          rotation={ringConfig.rotation}
          scale={getScale(ringConfig.scale)}
        >
            {/* 1. The Main Ring Tube */}
            <mesh castShadow>
                <torusGeometry 
                    args={[
                    ringConfig.radius, 
                    ringConfig.tubeRadius, 
                    ringConfig.tubeSegments, 
                    ringConfig.segments, 
                    ringConfig.arcAngle
                    ]} 
                />
                <primitive object={metalMaterial} attach="material" />
            </mesh>

            {/* 2. Start Cap (Sphere) - Closes the first hole */}
            <mesh position={startCapPos}>
                <sphereGeometry args={[ringConfig.tubeRadius, 16, 16]} />
                <primitive object={metalMaterial} attach="material" />
            </mesh>

            {/* 3. End Cap (Sphere) - Closes the second hole */}
            <mesh position={endCapPos}>
                <sphereGeometry args={[ringConfig.tubeRadius, 16, 16]} />
                <primitive object={metalMaterial} attach="material" />
            </mesh>
        </group>

        {/* NORTH PIN */}
        <mesh 
          position={northPinConfig.position} 
          rotation={northPinConfig.rotation}
          scale={getScale(northPinConfig.scale)}
          castShadow
        >
          <cylinderGeometry args={[northPinConfig.radius, northPinConfig.radius, northPinConfig.length, 16]} />
          <primitive object={metalMaterial} attach="material" />
        </mesh>

        {/* SOUTH PIN */}
        <mesh 
          position={southPinConfig.position} 
          rotation={southPinConfig.rotation}
          scale={getScale(southPinConfig.scale)}
          castShadow
        >
          <cylinderGeometry args={[southPinConfig.radius, southPinConfig.radius, southPinConfig.length, 16]} />
          <primitive object={metalMaterial} attach="material" />
        </mesh>

      </group>
    </group>
  );
};