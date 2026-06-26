// globe/src/components/AnimatedArc.tsx
import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

interface AnimatedArcProps {
  startVec: THREE.Vector3;
  endVec: THREE.Vector3;
  globeRadius: number;
  color?: string;
  arcAltitude?: number;
  tubeRadius?: number;
  pinScale?: number;
}

// --- MapPin Component ---
const MapPin: React.FC<{ color: string }> = ({ color }) => {
  const shapes = useMemo(() => {
    const shape = new THREE.Shape();
    const r = 0.14;
    const h = 0.36;
    const w = r * 0.9;
    shape.moveTo(0, 0);
    shape.bezierCurveTo(-0.02, 0.05, -w - 0.05, h * 0.4, -w - 0.05, h);
    shape.absarc(0, h, r + 0.05, Math.PI, 0, true);
    shape.bezierCurveTo(w + 0.05, h * 0.4, 0.02, 0.05, 0, 0);
    const holePath = new THREE.Path();
    holePath.absarc(0, h, r * 0.6, 0, Math.PI * 2, true);
    shape.holes.push(holePath);
    return shape;
  }, []);

  const extrudeSettings = useMemo(
    () => ({
      depth: 0.1,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.02,
      bevelSegments: 3,
    }),
    [],
  );

  return (
    <group rotation={[Math.PI / 2, Math.PI / 2, 0]}>
      <mesh position={[0, 0, -0.05]}>
        <extrudeGeometry args={[shapes, extrudeSettings]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.6}
          metalness={0.6}
          roughness={0.2}
        />
      </mesh>
    </group>
  );
};

// --- Main Component ---
const AnimatedArc: React.FC<AnimatedArcProps> = ({
  startVec,
  endVec,
  globeRadius,
  color = "#FFD700",
  arcAltitude = 2,
  tubeRadius = 0.03, // Base thickness
  pinScale = 1.5, // Base pin size
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const pinGroupRef = useRef<THREE.Group>(null);

  // Keep track of the last radius to avoid rebuilding geometry unnecessarily
  const lastRadiusRef = useRef(tubeRadius);

  const ANIMATION_SPEED = 400;
  const TUB_SEGMENTS = 48;
  const RADIAL_SEGMENTS = 8;

  // 1. Calculate Curve
  const curve = useMemo(() => {
    const midPoint = new THREE.Vector3()
      .addVectors(startVec, endVec)
      .multiplyScalar(0.5);

    const distance = startVec.distanceTo(endVec);
    const midPointLifted = midPoint
      .normalize()
      .multiplyScalar(globeRadius + distance * arcAltitude);

    return new THREE.QuadraticBezierCurve3(startVec, midPointLifted, endVec);
  }, [startVec, endVec, globeRadius, arcAltitude]);

  // Calculate the center point of the arc for distance checking
  const curveCenter = useMemo(() => curve.getPointAt(0.5), [curve]);

  useFrame((state, delta) => {
    if (!meshRef.current || !pinGroupRef.current) return;

    // --- 1. ZOOM / DISTANCE LOGIC ---
    const camera = state.camera;
    // Distance from camera to the center of this specific arc
    const dist = camera.position.distanceTo(curveCenter);

    // SCALE FACTOR:
    // Slightly widened the max clamp so it can scale just a bit more naturally
    const zoomFactor = THREE.MathUtils.clamp(dist / 15, 0.1, 0.5);

    // --- 2. UPDATE PIN SIZE ---
    const geo = meshRef.current.geometry;
    const totalCount = geo.index ? geo.index.count : 0;
    let currentCount = meshRef.current.userData.drawCount || 0;

    // Apply Scale to Pin
    const isVisible = currentCount > 0 && currentCount < totalCount;
    const targetPinScale = isVisible ? pinScale * zoomFactor : 0;

    // Smooth lerp for pin
    const smoothScale = THREE.MathUtils.lerp(
      pinGroupRef.current.scale.x,
      targetPinScale,
      0.2,
    );
    pinGroupRef.current.scale.setScalar(smoothScale);

    // --- 3. UPDATE TUBE THICKNESS (Geometry Regeneration) ---
    const targetRadius = tubeRadius * zoomFactor;

    const radiusChange =
      Math.abs(lastRadiusRef.current - targetRadius) / lastRadiusRef.current;

    // Rebuild only after a meaningful zoom change
    if (radiusChange > 0.2) {
      lastRadiusRef.current = targetRadius;
      meshRef.current.geometry.dispose();
      meshRef.current.geometry = new THREE.TubeGeometry(
        curve,
        TUB_SEGMENTS,
        targetRadius,
        RADIAL_SEGMENTS,
        false,
      );
    }

    // --- 4. ANIMATE LINE DRAWING ---
    const activeGeo = meshRef.current.geometry;
    const activeTotalCount = activeGeo.index ? activeGeo.index.count : 0;

    currentCount += ANIMATION_SPEED * delta;
    if (currentCount > activeTotalCount + 1500) currentCount = 0;

    meshRef.current.userData.drawCount = currentCount;
    const drawRangeCount = Math.min(currentCount, activeTotalCount);
    activeGeo.setDrawRange(0, drawRangeCount);

    // --- 5. PIN POSITION & ROTATION ---
    const t =
      activeTotalCount > 0 ? Math.min(1, currentCount / activeTotalCount) : 0;
    const baseCurvePoint = curve.getPointAt(t);

    // Dynamically push the pin slightly outward so it rests ON the tube, not inside it
    const hoverOffset = targetRadius * 1.5;
    const outwardNormal = baseCurvePoint.clone().normalize();
    const finalPosition = baseCurvePoint
      .clone()
      .add(outwardNormal.multiplyScalar(hoverOffset));

    // Update Position
    pinGroupRef.current.position.copy(finalPosition);

    // Update Rotation (Local Matrix)
    const localCenter = new THREE.Vector3(0, 0, 0);
    const tangent = curve.getTangentAt(t).normalize();
    const rotationMatrix = new THREE.Matrix4();

    rotationMatrix.lookAt(finalPosition, localCenter, tangent);
    pinGroupRef.current.quaternion.setFromRotationMatrix(rotationMatrix);

    // Flip exactly 180 degrees (Math.PI) to point outward.
    pinGroupRef.current.rotateX(Math.PI / 4);
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <tubeGeometry
          args={[curve, TUB_SEGMENTS, tubeRadius, RADIAL_SEGMENTS, false]}
        />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={2}
          toneMapped={false}
          transparent
          opacity={0.8}
        />
      </mesh>

      <group ref={pinGroupRef}>
        <MapPin color="#FF4500" />
      </group>
    </group>
  );
};

export default AnimatedArc;
