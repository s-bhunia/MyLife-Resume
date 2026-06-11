// packages/core-engine/src/GlobalCanvas.tsx
import React, { useEffect } from "react";
import { Canvas, CanvasProps } from "@react-three/fiber";
import { ResponsiveCamera } from "./ResponsiveCamera";
import { initDeviceManager } from "./DeviceManager";

export const GlobalCanvas: React.FC<CanvasProps> = ({ children, ...props }) => {
  useEffect(() => {
    const cleanup = initDeviceManager();
    return cleanup;
  }, []);

  return (
    <Canvas
      {...props}
      // CRITICAL: Cap pixel ratio at 1.5 to prevent mobile GPU melting
      dpr={[1, 1.5]}
    >
      <ResponsiveCamera />
      {children}
    </Canvas>
  );
};
