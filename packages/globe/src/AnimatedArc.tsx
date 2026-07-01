// globe/src/components/AnimatedArc.tsx
import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";

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
  tubeRadius = 0.03,
  pinScale = 1.5,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const pinGroupRef = useRef<THREE.Group>(null);

  const lastRadiusRef = useRef(tubeRadius);
  const lastDistRef = useRef(-1); // Cache camera distance
  const zoomFactorRef = useRef(0.1); // Cache zoom factor

  const ANIMATION_SPEED = 400;
  const TUB_SEGMENTS = 48;
  const RADIAL_SEGMENTS = 8;
  const DIST_THRESHOLD = 0.5;
  const { invalidate } = useThree();

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

  const curveCenter = useMemo(() => curve.getPointAt(0.5), [curve]);

  useFrame((state, delta) => {
    if (!meshRef.current || !pinGroupRef.current) return;

    // --- 1. ZOOM / DISTANCE LOGIC (Cached) ---
    const dist = state.camera.position.distanceTo(curveCenter);

    // Only update zoom factor if the camera moved significantly
    if (Math.abs(dist - lastDistRef.current) > DIST_THRESHOLD) {
      lastDistRef.current = dist;
      zoomFactorRef.current = THREE.MathUtils.clamp(dist / 15, 0.1, 0.5);

      const targetRadius = tubeRadius * zoomFactorRef.current;
      const radiusChange =
        Math.abs(lastRadiusRef.current - targetRadius) / lastRadiusRef.current;

      // Rebuild geometry only after a meaningful zoom change
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
    }

    const zoomFactor = zoomFactorRef.current;
    const currentRadius = lastRadiusRef.current;

    // --- 2. UPDATE PIN SIZE ---
    const geo = meshRef.current.geometry;
    const totalCount = geo.index ? geo.index.count : 0;
    let currentCount = meshRef.current.userData.drawCount || 0;

    const isVisible = currentCount > 0 && currentCount < totalCount;
    const targetPinScale = isVisible ? pinScale * zoomFactor : 0;

    const smoothScale = THREE.MathUtils.lerp(
      pinGroupRef.current.scale.x,
      targetPinScale,
      0.2,
    );
    pinGroupRef.current.scale.setScalar(smoothScale);

    // --- 3. ANIMATE LINE DRAWING ---
    currentCount += ANIMATION_SPEED * delta;
    if (currentCount > totalCount + 1500) currentCount = 0;

    meshRef.current.userData.drawCount = currentCount;
    const drawRangeCount = Math.min(currentCount, totalCount);
    geo.setDrawRange(0, drawRangeCount);

    // --- 4. PIN POSITION & ROTATION ---
    const t = totalCount > 0 ? Math.min(1, currentCount / totalCount) : 0;
    const baseCurvePoint = curve.getPointAt(t);

    const hoverOffset = currentRadius * 1.5;
    const outwardNormal = baseCurvePoint.clone().normalize();
    const finalPosition = baseCurvePoint
      .clone()
      .add(outwardNormal.multiplyScalar(hoverOffset));

    pinGroupRef.current.position.copy(finalPosition);

    const localCenter = new THREE.Vector3(0, 0, 0);
    const tangent = curve.getTangentAt(t).normalize();
    const rotationMatrix = new THREE.Matrix4();

    rotationMatrix.lookAt(finalPosition, localCenter, tangent);
    pinGroupRef.current.quaternion.setFromRotationMatrix(rotationMatrix);
    pinGroupRef.current.rotateX(Math.PI / 4);
    if (dist < 10) {
      invalidate();
    }
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
