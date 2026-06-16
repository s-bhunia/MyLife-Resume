// globe/src/components/LocationMarker.tsx

import React, { useLayoutEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Renders a glowing marker + a 3D Map Pin icon pointing outwards from the globe.
 */
export const LocationMarker: React.FC<{
  position: THREE.Vector3;
  color: string;
}> = ({ position, color }) => {
  const pinGroupRef = useRef<THREE.Group>(null);

  // This effect ensures the pin always stands perpendicular to the globe surface
  useLayoutEffect(() => {
    if (pinGroupRef.current) {
      // 1. Make the group look at the center of the world (0,0,0)
      //    This orients the Z-axis towards the center.
      pinGroupRef.current.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0), // Default 'up' of the pin
        position.clone().normalize(), // Outward direction from the globe center
      );
    }
  }, [position]);

  return (
    <group position={position}>
      {/* 1. The Base Glowing Dot (Existing) */}
      <mesh>
        <sphereGeometry args={[0.02, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={2}
          toneMapped={false}
        />
      </mesh>

      {/* 2. The Map Pin Icon */}
      <group ref={pinGroupRef}>
        {/* We wrap the pin parts in a group so we can offset them 
           to ensure the tip touches the surface, not the center of the pin 
        */}
        <group position={[0, 0.15, 0]}>
          {/* The Pin Head (Sphere) */}
          <mesh position={[0, 0.1, 0]}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial
              color={color}
              roughness={0.3}
              metalness={0.5}
            />
          </mesh>

          {/* The Pin Body (Cone) */}
          <mesh position={[0, -0.02, 0]}>
            {/* RadiusTop, RadiusBottom, Height, Segments */}
            <cylinderGeometry args={[0.02, 0, 0.2, 8]} />
            <meshStandardMaterial
              color={color}
              roughness={0.3}
              metalness={0.5}
            />
          </mesh>
        </group>
      </group>
    </group>
  );
};
