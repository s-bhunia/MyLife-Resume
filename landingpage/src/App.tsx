import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Suspense, useCallback, useEffect, useState } from "react";
import gsap from "gsap";
import * as THREE from "three";
import { Environment } from "./components/Environment";
import { House } from "./components/House";

const CameraDirector = ({
  onIntroFinish,
  onOpenDoor,
}: {
  onIntroFinish: () => void;
  onOpenDoor: () => void;
}) => {
  const { camera } = useThree();

  useEffect(() => {
    // 1. Start far out in the landscape
    camera.position.set(20, 15, 30);

    // Create a target vector so we can smoothly adjust where the camera looks
    const lookTarget = new THREE.Vector3(0, 1.5, 2.5);
    camera.lookAt(lookTarget);

    const tl = gsap.timeline({
      onComplete: () => {
        onIntroFinish();
      },
    });

    // Step 1: Swoop to exactly in front of the porch/door
    tl.to(camera.position, {
      x: 0,
      y: 1.6, // Human eye level
      z: 5.5, // Just outside the porch
      duration: 3.5,
      ease: "power2.inOut",
      onUpdate: () => {
        camera.lookAt(lookTarget);
      },
    });

    // Step 2: HARD PAUSE. Rest at the door for 0.5 seconds
    tl.to({}, { duration: 0.5 });

    // Step 3: Trigger the React state to open the door
    tl.call(() => {
      onOpenDoor();
    });

    // Step 4: HARD PAUSE. Wait 1.5 seconds for the door to physically swing open
    tl.to({}, { duration: 1.5 });

    // Step 5: Walk inside
    tl.to(camera.position, {
      x: 0,
      y: 1.6,
      z: 0, // Step inside the living room
      duration: 3,
      ease: "power2.inOut",
      onUpdate: () => {
        // Slowly shift the camera's gaze deeper into the house as we walk in
        lookTarget.lerp(new THREE.Vector3(0, 1.5, -4), 0.05);
        camera.lookAt(lookTarget);
      },
    });

    // Cleanup function to prevent double-animations in React Strict Mode
    return () => {
      tl.kill();
    };
  }, [camera, onIntroFinish, onOpenDoor]);

  return null;
};

export default function App() {
  const [introFinished, setIntroFinished] = useState(false);
  const [doorOpen, setDoorOpen] = useState(false);

  const handleOpenDoor = useCallback(() => setDoorOpen(true), []);
  const handleIntroFinish = useCallback(() => setIntroFinished(true), []);

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#87CEEB" }}>
      <Canvas shadows>
        <Suspense fallback={null}>
          <Environment />

          {/* Pass the state to the House so the GeometricDoor knows when to swing */}
          <House entranceOpen={doorOpen} />

          <PerspectiveCamera makeDefault fov={55} />

          {/* Intro Animation */}
          {!introFinished && (
            <CameraDirector
              onOpenDoor={handleOpenDoor}
              onIntroFinish={handleIntroFinish}
            />
          )}

          {/* Interactive Controls */}
          {introFinished && (
            <OrbitControls
              target={[0, 1.5, -2]} // Centered on the interior space we just walked into
              enablePan={true}
              maxPolarAngle={Math.PI / 2 - 0.05} // Keep camera strictly above the floor
              minDistance={1}
              maxDistance={15}
              mouseButtons={{
                LEFT: THREE.MOUSE.ROTATE,
                MIDDLE: THREE.MOUSE.DOLLY,
                RIGHT: THREE.MOUSE.PAN,
              }}
            />
          )}
        </Suspense>
      </Canvas>
    </div>
  );
}
