// globe/src/TravelGlobe.tsx
import React, { useMemo, useEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame, ThreeEvent, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { latLonToVector3 } from "./utils";
import AnimatedArc from "./AnimatedArc";
import { LocationMarker } from "./LocationMarker";
import { GlobeStand } from "./GlobeStand";

export interface Location {
  lat: number;
  lon: number;
  label?: string;
}

type Position3D = [number, number, number];
type Rotation3D = [number, number, number];

interface TravelGlobeProps {
  origin: Location;
  destinations: Location[];
  globeRadius?: number;
  globePosition?: Position3D;
  globeRotation?: Rotation3D;
  globeScale?: [number, number, number] | number;
  earthTiltDeg?: number;
  autoRotateSpeed?: number;
  onClick?: () => void;
}

const TravelGlobe: React.FC<TravelGlobeProps> = ({
  origin,
  destinations,
  globeRadius = 2,
  globePosition = [0, 0, 0],
  globeRotation,
  globeScale = 1,
  earthTiltDeg = 23.5,
  autoRotateSpeed = 0.08,
  onClick,
}) => {
  const globeGroupRef = useRef<THREE.Group>(null);
  const isDragging = useRef(false);
  const previousMouseX = useRef(0);

  const [colorMap, bumpMap] = useTexture([
    "/globe/textures/earth_8k.webp",
    "/globe/textures/earth_bump_2k.webp",
  ]);

  useEffect(() => {
    if (colorMap) {
      colorMap.colorSpace = THREE.SRGBColorSpace;
      colorMap.wrapS = THREE.RepeatWrapping;
      colorMap.wrapT = THREE.RepeatWrapping;
    }
  }, [colorMap]);

  const originVec = useMemo(
    () => latLonToVector3(origin.lat, origin.lon, globeRadius),
    [origin, globeRadius],
  );

  const destinationVecs = useMemo(
    () =>
      destinations.map((dest) =>
        latLonToVector3(dest.lat, dest.lon, globeRadius),
      ),
    [destinations, globeRadius],
  );

  const earthTiltRad = (earthTiltDeg * Math.PI) / 180;
  const defaultRotation: Rotation3D = globeRotation || [earthTiltRad, 0, 0];

  useFrame((_, delta) => {
    if (globeGroupRef.current && !isDragging.current) {
      globeGroupRef.current.rotation.y += autoRotateSpeed * delta;
    }
  });

  const { controls } = useThree();

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    if (e.nativeEvent.button === 2) {
      e.stopPropagation();
      isDragging.current = true;
      (e.target as Element).setPointerCapture(e.pointerId);

      if (controls) (controls as any).enabled = false;
      previousMouseX.current = e.clientX;
      document.body.style.cursor = "grabbing";
    }
  };

  const handlePointerUp = () => {
    isDragging.current = false;
    if (controls) (controls as any).enabled = true;
    document.body.style.cursor = "";
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (isDragging.current && globeGroupRef.current) {
      e.stopPropagation();
      const deltaX = e.clientX - previousMouseX.current;
      const sensitivity = 0.005;
      globeGroupRef.current.rotation.y += deltaX * sensitivity;
      previousMouseX.current = e.clientX;
    }
  };

  useEffect(() => {
    const handleGlobalUp = () => {
      isDragging.current = false;
      if (controls) (controls as any).enabled = true;
      document.body.style.cursor = "";
    };
    window.addEventListener("pointerup", handleGlobalUp);
    return () => window.removeEventListener("pointerup", handleGlobalUp);
  }, [controls]);

  const getScale = (
    scale?: [number, number, number] | number,
  ): [number, number, number] => {
    if (!scale) return [1, 1, 1];
    if (typeof scale === "number") return [scale, scale, scale];
    return scale;
  };

  return (
    <group>
      <GlobeStand globeRadius={globeRadius} />

      <group
        rotation={defaultRotation}
        position={globePosition}
        scale={getScale(globeScale)}
      >
        <group ref={globeGroupRef} position={[0, 0, 0]}>
          <mesh
            castShadow
            receiveShadow
            position={[0, 0, 0]}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onContextMenu={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              if (onClick) onClick();
            }}
          >
            <sphereGeometry args={[globeRadius, 64, 64]} />
            <meshStandardMaterial
              map={colorMap}
              bumpMap={bumpMap}
              bumpScale={0.05}
              metalness={0.1}
              roughness={0.7}
            />
          </mesh>

          <LocationMarker position={originVec} color="#00ff00" />

          {destinationVecs.map((destVec, index) => (
            <React.Fragment key={index}>
              <LocationMarker position={destVec} color="#ff4400" />

              <AnimatedArc
                startVec={originVec}
                endVec={destVec}
                globeRadius={globeRadius}
                tubeRadius={0.03} // Base thickness (will scale with zoom)
                pinScale={2.0} // Base pin size (will scale with zoom)
              />
            </React.Fragment>
          ))}
        </group>
      </group>
    </group>
  );
};

export default TravelGlobe;
