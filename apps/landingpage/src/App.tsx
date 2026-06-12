import { useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Suspense, useCallback, useEffect, useState, useRef } from "react";
import gsap from "gsap";
import * as THREE from "three";

import { Environment } from "./components/Environment";
import { House } from "./components/House";
import Loader from "@mylife/loader";
import { ScrollUI } from "@mylife/scroll";
import { BookViewer } from "@mylife/book-slider";
import { AssistantWidget, useWidgetStore } from "@mylife/chatbot";
import { GlobalCanvas } from "@mylife/core-engine";

const CAMERA_TARGETS: Record<
  string,
  { position: THREE.Vector3; lookAt: THREE.Vector3 }
> = {
  NAVIGATE_HOME: {
    position: new THREE.Vector3(0, 1.6, 2.5),
    lookAt: new THREE.Vector3(0, 1.5, -2),
  },
  NAVIGATE_PROJECTS: {
    position: new THREE.Vector3(-2.5, 1.6, -1.5),
    lookAt: new THREE.Vector3(-2.5, 1.6, -3.85),
  },
  NAVIGATE_SKILLS: {
    position: new THREE.Vector3(2.5, 1.6, -1.5),
    lookAt: new THREE.Vector3(2.5, 1.6, -3.85),
  },
  NAVIGATE_SOCIAL: {
    position: new THREE.Vector3(-2.5, 1.5, 0),
    lookAt: new THREE.Vector3(-4.86, 1.5, 0),
  },
  NAVIGATE_TIME: {
    position: new THREE.Vector3(4, 1.7, -2.5),
    lookAt: new THREE.Vector3(4, 1.7, -3.8),
  },
  NAVIGATE_GLOBE: {
    position: new THREE.Vector3(2.5, 1.79, 0),
    lookAt: new THREE.Vector3(4.2, 1.79, 0),
  },
  NAVIGATE_BOOKSHELF: {
    position: new THREE.Vector3(0, 1.4, -1.5),
    lookAt: new THREE.Vector3(0, 1.35, -3.5),
  },
};

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

const SmartCameraController = ({
  controlsRef,
}: {
  controlsRef: React.RefObject<any>;
}) => {
  useFrame((state) => {
    const targetAction = useWidgetStore.getState().targetAction;

    if (targetAction && targetAction.startsWith("NAVIGATE_")) {
      const targetConfig = CAMERA_TARGETS[targetAction];
      if (targetConfig) {
        state.camera.position.lerp(targetConfig.position, 0.03);

        if (controlsRef.current) {
          controlsRef.current.target.lerp(targetConfig.lookAt, 0.03);
          controlsRef.current.update();
        }

        const distPos = state.camera.position.distanceTo(targetConfig.position);
        const distLook = controlsRef.current
          ? controlsRef.current.target.distanceTo(targetConfig.lookAt)
          : 0;

        if (distPos < 0.1 && distLook < 0.1) {
          useWidgetStore.getState().setTargetAction(null);
        }
      }
    }
  });
  return null;
};

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

export default function App() {
  const [sceneReady, setSceneReady] = useState(false);
  const [introFinished, setIntroFinished] = useState(false);
  const [doorOpen, setDoorOpen] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);

  const [envReady, setEnvReady] = useState(false);
  const [houseReady, setHouseReady] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);

  const [activeScrollId, setActiveScrollId] = useState<string | null>(null);
  const [activeBook, setActiveBook] = useState<string | null>(null);
  const [bookOpacity, setBookOpacity] = useState(false);

  const controlsRef = useRef<any>(null);

  useEffect(() => {
    const timer = setTimeout(() => setCanvasReady(true), 1);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!canvasReady) return;
    const timer1 = setTimeout(() => setEnvReady(true), 20);
    return () => clearTimeout(timer1);
  }, [canvasReady]);

  useEffect(() => {
    if (!envReady) return;
    const timer2 = setTimeout(() => setHouseReady(true), 40);
    return () => clearTimeout(timer2);
  }, [envReady]);

  useEffect(() => {
    if (!houseReady) return;
    const timer3 = setTimeout(() => setCameraReady(true), 60);
    return () => clearTimeout(timer3);
  }, [houseReady]);

  const handleSceneReady = useCallback(() => setSceneReady(true), []);
  const handleOpenDoor = useCallback(() => setDoorOpen(true), []);
  const handleIntroFinish = useCallback(() => setIntroFinished(true), []);

  const handleEnter = async () => {
    setHasEntered(true);
    const elem = document.documentElement as any;

    if (elem.requestFullscreen) {
      elem
        .requestFullscreen()
        .catch((err: any) => console.log("FS Error:", err));
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    }

    if (
      window.screen &&
      window.screen.orientation &&
      (window.screen.orientation as any).lock
    ) {
      try {
        await (window.screen.orientation as any).lock("landscape");
      } catch (error) {
        console.warn("Screen orientation lock unsupported or failed.", error);
      }
    }
  };

  const handleBookOpen = useCallback((bookName: string) => {
    setActiveBook(bookName);
    setTimeout(() => setBookOpacity(true), 10);
  }, []);

  const handleBookClose = useCallback(() => {
    setBookOpacity(false);
    setTimeout(() => setActiveBook(null), 500);
  }, []);

  useEffect(() => {
    const unsubscribe = useWidgetStore.subscribe((state) => {
      const action = state.targetAction;
      if (!action) return;

      if (action === "OPEN_RESUME") {
        window.open("/loader/Resume_S_Bhunia.pdf", "_blank");
        useWidgetStore.getState().setTargetAction(null);
      } else if (action === "OPEN_SKILLS_BOOK") {
        handleBookOpen("skills");
      }
    });
    return unsubscribe;
  }, [handleBookOpen]);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#87CEEB",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <style>{`
        .portrait-overlay { display: none; }
        @media (max-width: 850px) and (orientation: portrait) {
          .portrait-overlay {
            display: flex; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background-color: #0d0d14; color: white; z-index: 99999; flex-direction: column;
            align-items: center; justify-content: center; text-align: center; font-family: sans-serif;
          }
          .rotate-icon { font-size: 3rem; margin-bottom: 20px; animation: spin 2s infinite ease-in-out; }
          @keyframes spin { 0% { transform: rotate(0deg); } 50% { transform: rotate(-90deg); } 100% { transform: rotate(-90deg); } }
        }
      `}</style>

      {hasEntered && (
        <div className="portrait-overlay">
          <div className="rotate-icon">📱</div>
          <h2>Please rotate your device</h2>
          <p>This experience is best viewed in landscape mode.</p>
        </div>
      )}

      {!hasEntered && (
        <Loader onEnter={handleEnter} isSceneReady={sceneReady} />
      )}

      {hasEntered && introFinished && <AssistantWidget />}

      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: bookOpacity ? 0 : 1,
          visibility: bookOpacity ? "hidden" : "visible",
          transitionProperty: "opacity, visibility",
          transitionDuration: "0.5s",
          transitionTimingFunction: "ease",
          pointerEvents: bookOpacity ? "none" : "auto",
        }}
      >
        {canvasReady && (
          <GlobalCanvas
            shadows
            frameloop={!sceneReady || activeBook ? "demand" : "always"}
          >
            <Suspense fallback={null}>
              <ScenePreloader onSceneReady={handleSceneReady} />

              {envReady && <Environment />}

              {houseReady && (
                <House
                  entranceOpen={doorOpen}
                  onOpenScroll={setActiveScrollId}
                  onBookClick={handleBookOpen}
                />
              )}

              {cameraReady && <PerspectiveCamera makeDefault />}

              {sceneReady && hasEntered && !introFinished && (
                <CameraDirector
                  onOpenDoor={handleOpenDoor}
                  onIntroFinish={handleIntroFinish}
                />
              )}

              {sceneReady && hasEntered && introFinished && (
                <>
                  <SmartCameraController controlsRef={controlsRef} />

                  <OrbitControls
                    ref={controlsRef}
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
                    onStart={() => {
                      if (useWidgetStore.getState().targetAction) {
                        useWidgetStore.getState().setTargetAction(null);
                      }
                    }}
                  />
                </>
              )}
            </Suspense>
          </GlobalCanvas>
        )}
      </div>

      {activeScrollId && (
        <ScrollUI
          id={activeScrollId}
          onClose={() => setActiveScrollId(null)}
          speed={60}
        />
      )}

      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: bookOpacity ? 1 : 0,
          visibility: activeBook ? "visible" : "hidden",
          transitionProperty: "opacity",
          transitionDuration: "0.5s",
          transitionTimingFunction: "ease",
          pointerEvents: bookOpacity ? "auto" : "none",
          background:
            "radial-gradient(circle at center, #FFE4C4 0%, #2054c4 60%)",
          zIndex: 50,
        }}
      >
        {activeBook && (
          <BookViewer bookName={activeBook} onClose={handleBookClose} />
        )}
      </div>
    </div>
  );
}
