import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Suspense, useCallback, useEffect, useState } from "react";
import gsap from "gsap";
import * as THREE from "three";
import { Environment } from "./components/Environment";
import { House } from "./components/House";
import Loader from "@mylife/loader";

// --- CAMERA DIRECTOR (Unchanged) ---
const CameraDirector = ({
  onIntroFinish,
  onOpenDoor,
}: {
  onIntroFinish: () => void;
  onOpenDoor: () => void;
}) => {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(20, 15, 30);
    const lookTarget = new THREE.Vector3(0, 1.5, 2.5);
    camera.lookAt(lookTarget);

    const tl = gsap.timeline({
      onComplete: () => {
        onIntroFinish();
      },
    });

    tl.to(camera.position, {
      x: 0,
      y: 1.6,
      z: 5.5,
      duration: 3.5,
      ease: "power2.inOut",
      onUpdate: () => camera.lookAt(lookTarget),
    });

    tl.to({}, { duration: 0.5 });
    tl.call(() => onOpenDoor());
    tl.to({}, { duration: 1.5 });

    tl.to(camera.position, {
      x: 0,
      y: 1.6,
      z: 0,
      duration: 3,
      ease: "power2.inOut",
      onUpdate: () => {
        lookTarget.lerp(new THREE.Vector3(0, 1.5, -4), 0.05);
        camera.lookAt(lookTarget);
      },
    });

    return () => {
      tl.kill();
    };
  }, [camera, onIntroFinish, onOpenDoor]);

  return null;
};

// --- SCENE PRELOADER (New) ---
const ScenePreloader = ({ onSceneReady }: { onSceneReady: () => void }) => {
  const { gl, scene, camera } = useThree();

  useEffect(() => {
    gl.compile(scene, camera);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        onSceneReady();
      });
    });
  }, [gl, scene, camera, onSceneReady]);

  return null;
};

// --- MAIN APP ---
export default function App() {
  const [sceneReady, setSceneReady] = useState(false);
  const [introFinished, setIntroFinished] = useState(false);
  const [doorOpen, setDoorOpen] = useState(false);

  const handleSceneReady = useCallback(() => setSceneReady(true), []);
  const handleOpenDoor = useCallback(() => setDoorOpen(true), []);
  const handleIntroFinish = useCallback(() => setIntroFinished(true), []);

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#87CEEB" }}>
      {/* Optional: You can pass sceneReady to your Loader to keep it on screen until the GPU is ready */}
      {/* <Loader isReady={!sceneReady} /> */}
      <Loader />

      <Canvas shadows>
        <Suspense fallback={null}>
          {/* 1. Silently compile everything to the GPU */}
          <ScenePreloader onSceneReady={handleSceneReady} />

          <Environment />
          <House entranceOpen={doorOpen} />
          <PerspectiveCamera makeDefault fov={55} />

          {/* 2. Only mount and start the camera animation AFTER the GPU is fully ready */}
          {sceneReady && !introFinished && (
            <CameraDirector
              onOpenDoor={handleOpenDoor}
              onIntroFinish={handleIntroFinish}
            />
          )}

          {sceneReady && introFinished && (
            <OrbitControls
              target={[0, 1.5, -2]}
              enablePan={true}
              maxPolarAngle={Math.PI / 2 - 0.05}
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
