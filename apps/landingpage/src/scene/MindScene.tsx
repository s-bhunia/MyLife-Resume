import { Suspense, useCallback, useEffect, useState } from "react";
import { useThree } from "@react-three/fiber";
import { useProgress } from "@react-three/drei";
import * as THREE from "three";
import { GlobalCanvas } from "@mylife/core-engine";
import { INTRO } from "../config/views";
import { selectOverlayOpen, useMind } from "../state/mind";
import { Atmosphere } from "./Atmosphere";
import { CameraRig } from "./CameraRig";
import { Landscape } from "./exterior/Landscape";
import { Architecture } from "./house/Architecture";
import { Interior } from "./interior/Interior";

const STAGES = 3;
const TEXTURE_KEYS = ["map", "bumpMap", "normalMap", "roughnessMap", "alphaMap", "emissiveMap"] as const;
const afterFrame = (fn: () => void) => {
  let done = false;
  const run = () => {
    if (done) return;
    done = true;
    window.clearTimeout(timer);
    cancelAnimationFrame(frame);
    fn();
  };
  const frame = requestAnimationFrame(() => setTimeout(run, 0));
  const timer = window.setTimeout(run, 120);
  return () => {
    done = true;
    window.clearTimeout(timer);
    cancelAnimationFrame(frame);
  };
};
const nextFrame = () => new Promise<void>((resolve) => afterFrame(resolve));

function ShadowBaker() {
  const gl = useThree((s) => s.gl);
  const invalidate = useThree((s) => s.invalidate);
  const doorOpen = useMind((s) => s.doorOpen);

  useEffect(() => {
    gl.shadowMap.autoUpdate = false;
    const bake = () => {
      gl.shadowMap.needsUpdate = true;
      invalidate();
    };
    bake();
    const settle = window.setTimeout(bake, doorOpen ? 1600 : 400);
    return () => window.clearTimeout(settle);
  }, [gl, invalidate, doorOpen]);

  return null;
}

function Mounted({ onMount }: { onMount: () => void }) {
  useEffect(onMount, [onMount]);
  return null;
}

function Warmup() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  const invalidate = useThree((s) => s.invalidate);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      const textures = new Set<THREE.Texture>();
      scene.traverse((object) => {
        const material = (object as THREE.Mesh).material as THREE.Material | THREE.Material[] | undefined;
        for (const m of Array.isArray(material) ? material : material ? [material] : []) {
          for (const key of TEXTURE_KEYS) {
            const texture = (m as unknown as Record<string, THREE.Texture | null>)[key];
            if (texture?.isTexture) textures.add(texture);
          }
        }
      });
      let budget = 0;
      for (const texture of textures) {
        gl.initTexture(texture);
        if (++budget % 3 === 0) {
          await nextFrame();
          if (cancelled) return;
        }
      }
      await nextFrame();
      if (cancelled) return;
      await gl.compileAsync(scene, camera);
      if (cancelled) return;
      useMind.getState().markCompiled();
      invalidate();
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [gl, scene, camera, invalidate]);

  return null;
}

function ProgressReporter() {
  useEffect(
    () =>
      useProgress.subscribe(({ loaded, total }) => {
        if (total > 0) queueMicrotask(() => useMind.getState().setProgress(Math.min((loaded / total) * 0.92, 0.92)));
      }),
    [],
  );
  return null;
}

function useStaged() {
  const [stage, setStage] = useState(0);
  const [mounted, setMounted] = useState(0);
  const advance = useCallback(() => setMounted((m) => m + 1), []);

  useEffect(() => {
    if (stage >= STAGES || mounted < stage) return;
    return afterFrame(() => setStage((s) => s + 1));
  }, [stage, mounted]);

  return { stage, ready: mounted >= STAGES, advance };
}

export default function MindScene() {
  const phase = useMind((s) => s.phase);
  const doorOpen = useMind((s) => s.doorOpen);
  const compiled = useMind((s) => s.sceneCompiled);
  const overlay = useMind(selectOverlayOpen);
  const { stage, ready, advance } = useStaged();
  const frameloop = phase === "loading" || phase === "ready" ? "demand" : overlay ? "never" : "always";

  return (
    <div className="mind-canvas">
      <GlobalCanvas
        shadows="percentage"
        frameloop={frameloop}
        camera={{ fov: 55, near: 0.05, far: 220, position: INTRO.start.position }}
        gl={{ antialias: true, powerPreference: "high-performance", stencil: false }}
      >
        <Atmosphere />
        <group visible={compiled}>
          {stage >= 1 && (
            <>
              <Landscape />
              <Mounted onMount={advance} />
            </>
          )}
          {stage >= 2 && (
            <Suspense fallback={null}>
              <Architecture doorOpen={doorOpen} />
              <Mounted onMount={advance} />
            </Suspense>
          )}
          {stage >= 3 && (
            <Suspense fallback={null}>
              <Interior />
              <Mounted onMount={advance} />
            </Suspense>
          )}
        </group>
        {ready && <Warmup />}
        {compiled && <ShadowBaker />}
        <ProgressReporter />
        <CameraRig />
      </GlobalCanvas>
    </div>
  );
}
