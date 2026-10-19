import { useEffect, useState } from "react";
import { Canvas, events as pointerEvents, type CanvasProps, type EventManager } from "@react-three/fiber";
import { ResponsiveCamera } from "./ResponsiveCamera";
import { initDeviceManager } from "./DeviceManager";

const MAX_DPR = 2;
const currentDpr = () => Math.min(window.devicePixelRatio || 1, MAX_DPR);

function useDevicePixelRatio() {
  const [dpr, setDpr] = useState(currentDpr);
  useEffect(() => {
    let query = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
    const update = () => {
      setDpr(currentDpr());
      query.removeEventListener("change", update);
      query = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
      query.addEventListener("change", update);
    };
    query.addEventListener("change", update);
    window.addEventListener("resize", update);
    update();
    return () => {
      query.removeEventListener("change", update);
      window.removeEventListener("resize", update);
    };
  }, []);
  return dpr;
}

export function clientPointerEvents(store: Parameters<typeof pointerEvents>[0]): EventManager<HTMLElement> {
  return {
    ...pointerEvents(store),
    compute(event, state) {
      const { left, top, width, height } = state.size;
      state.pointer.set(((event.clientX - left) / width) * 2 - 1, -((event.clientY - top) / height) * 2 + 1);
      state.raycaster.setFromCamera(state.pointer, state.camera);
    },
  };
}

export function GlobalCanvas({ children, ...props }: CanvasProps) {
  const dpr = useDevicePixelRatio();

  useEffect(() => initDeviceManager(), []);

  return (
    <Canvas dpr={dpr} events={clientPointerEvents} {...props}>
      <ResponsiveCamera />
      {children}
    </Canvas>
  );
}
