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

import { useAtomValue } from "jotai";
import { GlobalCanvas } from "@mylife/core-engine";
import { isMobileAtom } from "@mylife/core-engine";

// --- CAMERA TARGETS ---
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

// --- COMPONENTS ---
const CameraDirector = ({
  onIntroFinish,
  onOpenDoor,
}: {
  onIntroFinish: () => void;
  onOpenDoor: () => void;
}) => {
  const { camera } = useThree();
  const isMobile = useAtomValue(isMobileAtom);

  useEffect(() => {
    camera.position.set(20, 15, 30);
    const lookTarget = new THREE.Vector3(0, 1.5, 2.5);
    const finalLookTarget = new THREE.Vector3(0, 1.5, -4);
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

    const finalCameraZ = isMobile ? -2 : 0;

    tl.to(camera.position, {
      x: 0,
      y: 1.6,
      z: finalCameraZ,
      duration: 3,
      ease: "power2.inOut",
      onUpdate: () => {
        lookTarget.lerp(finalLookTarget, 0.05);
        camera.lookAt(lookTarget);
      },
    });

    return () => {
      tl.kill();
    };
  }, [camera, onIntroFinish, onOpenDoor, isMobile]);

  return null;
};

const SmartCameraController = ({
  controlsRef,
}: {
  controlsRef: React.RefObject<any>;
}) => {
  useFrame((state) => {
    const targetAction = useWidgetStore.getState().targetAction;

    if (!targetAction || !targetAction.startsWith("NAVIGATE_")) {
      if (controlsRef.current) {
        const padding = 0.6;
        const minX = -5 + padding,
          maxX = 5 - padding;
        const minZ = -4 + padding,
          maxZ = 4 - padding;
        const minY = 0.5,
          maxY = 2.8;

        state.camera.position.x = THREE.MathUtils.clamp(
          state.camera.position.x,
          minX,
          maxX,
        );
        state.camera.position.y = THREE.MathUtils.clamp(
          state.camera.position.y,
          minY,
          maxY,
        );
        state.camera.position.z = THREE.MathUtils.clamp(
          state.camera.position.z,
          minZ,
          maxZ,
        );

        const target = controlsRef.current.target;
        target.x = THREE.MathUtils.clamp(target.x, minX, maxX);
        target.y = THREE.MathUtils.clamp(target.y, minY, maxY);
        target.z = THREE.MathUtils.clamp(target.z, minZ, maxZ);
      }
      return;
    }

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
        state.camera.position.copy(targetConfig.position);
        if (controlsRef.current) {
          controlsRef.current.target.copy(targetConfig.lookAt);
          controlsRef.current.update();
        }
        useWidgetStore.getState().setTargetAction(null);
      }
    }
  });
  return null;
};

const ScenePreloader = ({ onSceneReady }: { onSceneReady: () => void }) => {
  const { gl, scene, camera } = useThree();

  useEffect(() => {
    gl.compile(scene, camera);
    let secondFrame: number | undefined;
    const firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => {
        onSceneReady();
      });
    });

    return () => {
      cancelAnimationFrame(firstFrame);
      if (secondFrame !== undefined) cancelAnimationFrame(secondFrame);
    };
  }, [gl, scene, camera, onSceneReady]);

  return null;
};

// --- MAIN APP ---
export default function App() {
  const [sceneReady, setSceneReady] = useState(false);
  const [introFinished, setIntroFinished] = useState(false);
  const [doorOpen, setDoorOpen] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);
  const [activeScrollId, setActiveScrollId] = useState<string | null>(null);
  const [activeBook, setActiveBook] = useState<string | null>(null);
  const [bookOpacity, setBookOpacity] = useState(false);

  const isMobile = useAtomValue(isMobileAtom);
  const [showMobileControls, setShowMobileControls] = useState(false);

  const controlsRef = useRef<any>(null);
  const hasShownControlsRef = useRef(false);
  const bookTransitionTimer = useRef<number | null>(null);

  const handleSceneReady = useCallback(() => setSceneReady(true), []);
  const handleOpenDoor = useCallback(() => setDoorOpen(true), []);
  const handleIntroFinish = useCallback(() => setIntroFinished(true), []);

  useEffect(() => {
    const isTouchDevice =
      "ontouchstart" in window || navigator.maxTouchPoints > 0;
    if (
      isMobile &&
      isTouchDevice &&
      hasEntered &&
      introFinished &&
      !hasShownControlsRef.current
    ) {
      setShowMobileControls(true);
      hasShownControlsRef.current = true;
    }
  }, [isMobile, hasEntered, introFinished]);

  const handleEnter = async () => {
    setHasEntered(true);
    const elem = document.documentElement as any;

    if (elem.requestFullscreen) {
      elem
        .requestFullscreen()
        .catch((err: unknown) =>
          console.warn("Fullscreen request failed:", err),
        );
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
    if (bookTransitionTimer.current !== null) {
      window.clearTimeout(bookTransitionTimer.current);
    }
    setActiveBook(bookName);
    bookTransitionTimer.current = window.setTimeout(
      () => setBookOpacity(true),
      10,
    );
  }, []);

  const handleBookClose = useCallback(() => {
    setBookOpacity(false);
    if (bookTransitionTimer.current !== null) {
      window.clearTimeout(bookTransitionTimer.current);
    }
    bookTransitionTimer.current = window.setTimeout(
      () => setActiveBook(null),
      500,
    );
  }, []);

  useEffect(
    () => () => {
      if (bookTransitionTimer.current !== null) {
        window.clearTimeout(bookTransitionTimer.current);
      }
    },
    [],
  );

  useEffect(() => {
    const unsubscribe = useWidgetStore.subscribe((state) => {
      const action = state.targetAction;
      if (!action) return;

      if (action === "OPEN_RESUME") {
        window.open(
          "/loader/Resume_S_Bhunia.pdf",
          "_blank",
          "noopener,noreferrer",
        );
        useWidgetStore.getState().setTargetAction(null);
      } else if (action === "OPEN_SKILLS_BOOK") {
        useWidgetStore.getState().setTargetAction("NAVIGATE_SKILLS");
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
        @keyframes hintSlideUp {
          from { opacity: 0; transform: translate(-50%, 24px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>

      {/* --- UI OVERLAYS --- */}
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

      {hasEntered && introFinished && (
        <Suspense fallback={null}>
          <AssistantWidget />
        </Suspense>
      )}

      {activeScrollId && (
        <Suspense fallback={null}>
          <ScrollUI
            id={activeScrollId}
            onClose={() => setActiveScrollId(null)}
            speed={60}
          />
        </Suspense>
      )}

      {/* --- SCENE 1: THE HOUSE (Restored to original structure) --- */}
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
          cursor: "url('/home-icon.png'), auto",
        }}
      >
        <GlobalCanvas shadows frameloop={activeBook ? "demand" : "always"}>
          <Suspense fallback={null}>
            <Environment />
            <House
              entranceOpen={doorOpen}
              onOpenScroll={setActiveScrollId}
              onBookClick={handleBookOpen}
            />
            <PerspectiveCamera makeDefault />
            <ScenePreloader onSceneReady={handleSceneReady} />

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
                  makeDefault
                  ref={controlsRef}
                  target={[0, 1.5, isMobile ? -4.5 : -2]}
                  enablePan={true}
                  maxPolarAngle={Math.PI / 2 - 0.05}
                  minDistance={0.5}
                  maxDistance={8}
                  rotateSpeed={0.5}
                  mouseButtons={{
                    LEFT: THREE.MOUSE.PAN,
                    MIDDLE: THREE.MOUSE.DOLLY,
                    RIGHT: THREE.MOUSE.ROTATE,
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
      </div>

      {/* --- SCENE 2: THE BOOK VIEWER (Restored) --- */}
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
          <Suspense fallback={null}>
            <BookViewer bookName={activeBook} onClose={handleBookClose} />
          </Suspense>
        )}

        {showMobileControls && (
          <div
            style={{
              position: "absolute",
              bottom: "28px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "calc(100vw - 48px)",
              maxWidth: "320px",
              backgroundColor: "rgba(13, 13, 20, 0.85)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "16px",
              padding: "18px 20px",
              color: "#ffffff",
              zIndex: 99999,
              display: "flex",
              flexDirection: "column",
              gap: "14px",
              boxShadow: "0 12px 40px rgba(0, 0, 0, 0.45)",
              animation:
                "hintSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
              fontFamily: "system-ui, -apple-system, sans-serif",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  color: "#87CEEB",
                  textTransform: "uppercase",
                }}
              >
                How to Navigate
              </span>
              <button
                onClick={() => setShowMobileControls(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#999",
                  fontSize: "1.1rem",
                  padding: "4px",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <span style={{ fontSize: "1.35rem" }}>👆</span>
                <span style={{ fontSize: "0.9rem", lineHeight: "1.2" }}>
                  <strong>1-Finger Drag:</strong> Look around
                </span>
              </div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <span style={{ fontSize: "1.35rem" }}>✌️</span>
                <span style={{ fontSize: "0.9rem", lineHeight: "1.2" }}>
                  <strong>2-Finger Drag:</strong> Move position
                </span>
              </div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <span style={{ fontSize: "1.35rem" }}>🤏</span>
                <span style={{ fontSize: "0.9rem", lineHeight: "1.2" }}>
                  <strong>Pinch:</strong> Zoom in & out
                </span>
              </div>
            </div>
            <button
              onClick={() => setShowMobileControls(false)}
              style={{
                marginTop: "4px",
                width: "100%",
                padding: "10px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: "#e6bb11",
                color: "#111",
                fontWeight: 700,
                fontSize: "0.9rem",
                cursor: "pointer",
              }}
            >
              Got it
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
