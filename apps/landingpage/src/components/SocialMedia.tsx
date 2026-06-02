import { useRef, useState, memo, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox, Text, useTexture } from "@react-three/drei";
import * as THREE from "three";

// Define materials OUTSIDE the component to save memory
const MAT_YT_RED = new THREE.MeshStandardMaterial({ color: "#FF0000", roughness: 0.4 });
const MAT_WHITE = new THREE.MeshStandardMaterial({ color: "#FFFFFF", roughness: 0.1 });
const MAT_LI_BLUE = new THREE.MeshStandardMaterial({ color: "#0A66C2", roughness: 0.4 });
const MAT_GH_BLACK = new THREE.MeshStandardMaterial({ color: "#181717", roughness: 0.4 });

// Interactive Wrapper
const SocialIcon = memo(({ position, url, children }: any) => {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((_, delta) => {
    if (groupRef.current) {
      const targetScale = hovered ? 1.1 : 1.0;
      const targetZ = hovered ? position[2] + 0.1 : position[2];
      
      groupRef.current.scale.setScalar(THREE.MathUtils.damp(groupRef.current.scale.x, targetScale, 6, delta));
      groupRef.current.position.z = THREE.MathUtils.damp(groupRef.current.position.z, targetZ, 6, delta);
    }
  });

  return (
    <group
      ref={groupRef}
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        window.open(url, "_blank");
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
        document.body.style.cursor = "auto";
      }}
    >
      {children}
    </group>
  );
});

export const SocialWall = memo(({ position, rotation, scale = 1 }: { position: [number, number, number], rotation: [number, number, number], scale?: number }) => {
  // Load GitHub Logo Texture (Ensure this exists in your public folder!)
  const ghTexture = useTexture("/textures/github-white-icon.png");
  ghTexture.colorSpace = THREE.SRGBColorSpace;

  // Perfect Triangle for YouTube
  const playShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-0.1, 0.15);
    shape.lineTo(0.2, 0);
    shape.lineTo(-0.1, -0.15);
    shape.closePath();
    return shape;
  }, []);

  const extrudeSettings = { depth: 0.05, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.01, bevelSegments: 2 };

  return (
    <group position={position} rotation={rotation} scale={scale}>
      
      {/* YouTube Button */}
      <SocialIcon position={[0, 1, 0]} url="https://www.youtube.com/@InitToInfinity">
        <RoundedBox args={[0.8, 0.6, 0.15]} radius={0.09} castShadow material={MAT_YT_RED} />
        <mesh position={[0, 0, 0.08]} material={MAT_WHITE} castShadow>
          <extrudeGeometry args={[playShape, extrudeSettings]} />
        </mesh>
      </SocialIcon>

      {/* LinkedIn Button */}
      <SocialIcon position={[0, .15, 0]} url="https://www.linkedin.com/in/s-bhunia/">
        <RoundedBox args={[0.6, 0.6, 0.15]} radius={0.1} castShadow material={MAT_LI_BLUE} />
        <Text position={[0, 0, 0.08]} fontSize={0.35} color="#FFFFFF" fontWeight="bold">
          in
        </Text>
      </SocialIcon>

      {/* GitHub Button (Texture Approach for Best Performance) */}
      <SocialIcon position={[0, -0.7, 0]} url="https://github.com/s-bhunia">
        <RoundedBox args={[0.6, 0.6, 0.15]} radius={0.1} castShadow material={MAT_GH_BLACK} />
        
        {/* Mapping the logo onto a flat plane slightly in front of the box */}
        <mesh position={[0, 0, 0.076]}>
          <planeGeometry args={[0.4, 0.4]} />
          <meshBasicMaterial 
            map={ghTexture} 
            transparent 
            alphaTest={0.1} // Ensures crisp edges on the transparent PNG
          />
        </mesh>
      </SocialIcon>
      
    </group>
  );
});