import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useHoverable } from "@mylife/core-engine";
import { MAT } from "./materials";

const BULB_ON = new THREE.MeshBasicMaterial({ color: "#fff1d6", toneMapped: false });
const BULB_OFF = new THREE.MeshStandardMaterial({ color: "#9a958a", roughness: 0.4 });
const SHADE = new THREE.MeshStandardMaterial({ color: "#1c1e23", roughness: 0.45, metalness: 0.6, side: THREE.DoubleSide });

export function DeskLamp({ position }: { position: [number, number, number] }) {
  const [on, setOn] = useState(true);
  const light = useRef<THREE.PointLight>(null);
  const hover = useHoverable("Desk lamp", on ? "Click to switch off" : "Click to switch on");

  useFrame((_, delta) => {
    const l = light.current;
    if (!l) return;
    const target = on ? 1.6 : 0;
    if (Math.abs(l.intensity - target) < 0.01) return;
    l.intensity = THREE.MathUtils.damp(l.intensity, target, 8, delta);
  });

  return (
    <group
      position={position}
      {...hover}
      onClick={(event) => {
        event.stopPropagation();
        setOn((value) => !value);
      }}
    >
      <mesh material={MAT.steel} position={[0, 0.008, 0]} castShadow>
        <cylinderGeometry args={[0.065, 0.07, 0.016, 28]} />
      </mesh>
      <group position={[0, 0.016, 0]} rotation-x={-0.35}>
        <mesh material={MAT.steel} position={[0, 0.17, 0]} castShadow>
          <cylinderGeometry args={[0.007, 0.007, 0.34, 10]} />
        </mesh>
        <group position={[0, 0.34, 0]} rotation-x={1.75}>
          <mesh material={MAT.brass}>
            <sphereGeometry args={[0.014, 12, 12]} />
          </mesh>
          <mesh material={MAT.steel} position={[0, 0.13, 0]} castShadow>
            <cylinderGeometry args={[0.006, 0.006, 0.26, 10]} />
          </mesh>
          <group position={[0, 0.26, 0]} rotation-x={-0.9}>
            <mesh material={SHADE} position={[0, -0.04, 0]} castShadow>
              <cylinderGeometry args={[0.028, 0.075, 0.1, 28, 1, true]} />
            </mesh>
            <mesh material={on ? BULB_ON : BULB_OFF} position={[0, -0.05, 0]}>
              <sphereGeometry args={[0.022, 16, 16]} />
            </mesh>
            <pointLight ref={light} position={[0, -0.09, 0]} color="#ffcf94" intensity={1.6} distance={2.2} decay={2} />
          </group>
        </group>
      </group>
    </group>
  );
}

export function Microphone({ position, onOpen }: { position: [number, number, number]; onOpen: () => void }) {
  const hover = useHoverable("Talk to my mind", "Opens the assistant");
  return (
    <group
      position={position}
      {...hover}
      onClick={(event) => {
        event.stopPropagation();
        onOpen();
      }}
    >
      <mesh material={MAT.steel} position={[0, 0.007, 0]} castShadow>
        <cylinderGeometry args={[0.055, 0.06, 0.014, 28]} />
      </mesh>
      <mesh material={MAT.steel} position={[0, 0.11, 0]} castShadow>
        <cylinderGeometry args={[0.0065, 0.0065, 0.2, 10]} />
      </mesh>
      <group position={[0, 0.235, 0]} rotation-x={0.42}>
        <mesh material={MAT.steel} rotation-x={Math.PI / 2}>
          <torusGeometry args={[0.04, 0.0035, 8, 28]} />
        </mesh>
        <mesh material={MAT.rubber} position={[0, -0.01, 0]} castShadow>
          <cylinderGeometry args={[0.027, 0.025, 0.1, 24]} />
        </mesh>
        <mesh material={MAT.grille} position={[0, 0.05, 0]}>
          <sphereGeometry args={[0.028, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2]} />
        </mesh>
        <mesh material={MAT.grille} position={[0, 0.045, 0]}>
          <cylinderGeometry args={[0.0282, 0.0282, 0.02, 24, 1, true]} />
        </mesh>
        <mesh material={MAT.brass} position={[0, 0.032, 0]}>
          <torusGeometry args={[0.0285, 0.0018, 6, 24]} />
        </mesh>
      </group>
    </group>
  );
}

export function Mug({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh material={MAT.ceramic} position={[0, 0.045, 0]} castShadow>
        <cylinderGeometry args={[0.036, 0.032, 0.09, 24]} />
      </mesh>
      <mesh position={[0, 0.082, 0]} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[0.032, 20]} />
        <meshStandardMaterial color="#3b2416" roughness={0.2} />
      </mesh>
      <mesh material={MAT.ceramic} position={[0.04, 0.048, 0]}>
        <torusGeometry args={[0.022, 0.006, 8, 16, Math.PI]} />
      </mesh>
    </group>
  );
}

export function Headphones({ position, rotationY = 0 }: { position: [number, number, number]; rotationY?: number }) {
  return (
    <group position={position} rotation-y={rotationY}>
      <mesh material={MAT.steel} position={[0, 0.012, 0]} rotation-x={-Math.PI / 2}>
        <torusGeometry args={[0.085, 0.009, 8, 32, Math.PI]} />
      </mesh>
      {[-0.085, 0.085].map((x) => (
        <group key={x} position={[x, 0.022, 0.01]}>
          <mesh material={MAT.rubber} castShadow>
            <cylinderGeometry args={[0.042, 0.042, 0.04, 24]} />
          </mesh>
          <mesh material={MAT.fabric} position={[0, 0.021, 0]}>
            <cylinderGeometry args={[0.036, 0.036, 0.004, 24]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function Notebook({ position, rotationY = 0 }: { position: [number, number, number]; rotationY?: number }) {
  return (
    <group position={position} rotation-y={rotationY}>
      <mesh material={MAT.cover} position={[0, 0.006, 0]} castShadow>
        <boxGeometry args={[0.15, 0.012, 0.21]} />
      </mesh>
      <mesh material={MAT.paper} position={[0.002, 0.0125, 0]}>
        <boxGeometry args={[0.14, 0.002, 0.2]} />
      </mesh>
      <mesh material={MAT.brass} position={[0.1, 0.008, 0.02]} rotation={[Math.PI / 2, 0, 0.25]}>
        <cylinderGeometry args={[0.0045, 0.0045, 0.14, 10]} />
      </mesh>
    </group>
  );
}

export function Chair({ position, rotationY = 0 }: { position: [number, number, number]; rotationY?: number }) {
  return (
    <group position={position} rotation-y={rotationY}>
      {Array.from({ length: 5 }, (_, i) => (i / 5) * Math.PI * 2).map((a) => (
        <group key={a} rotation-y={a}>
          <mesh material={MAT.steel} position={[0.16, 0.05, 0]} rotation-z={0.08} castShadow>
            <boxGeometry args={[0.3, 0.025, 0.035]} />
          </mesh>
          <mesh material={MAT.rubber} position={[0.29, 0.022, 0]}>
            <sphereGeometry args={[0.022, 10, 8]} />
          </mesh>
        </group>
      ))}
      <mesh material={MAT.steel} position={[0, 0.25, 0]} castShadow>
        <cylinderGeometry args={[0.022, 0.026, 0.38, 14]} />
      </mesh>
      <mesh material={MAT.fabric} position={[0, 0.47, 0]} castShadow>
        <boxGeometry args={[0.48, 0.07, 0.46]} />
      </mesh>
      <mesh material={MAT.steel} position={[0, 0.62, -0.22]} castShadow>
        <boxGeometry args={[0.05, 0.28, 0.025]} />
      </mesh>
      <mesh material={MAT.fabric} position={[0, 0.86, -0.24]} rotation-x={-0.12} castShadow>
        <boxGeometry args={[0.44, 0.46, 0.06]} />
      </mesh>
    </group>
  );
}
