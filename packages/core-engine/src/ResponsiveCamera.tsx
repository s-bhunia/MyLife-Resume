// packages/core-engine/src/ResponsiveCamera.tsx
import { useThree } from "@react-three/fiber";
import { useAtomValue } from "jotai";
import { isMobileAtom } from "./DeviceManager";
import { useEffect } from "react";
import { PerspectiveCamera } from "three";

export const ResponsiveCamera = () => {
  const { camera } = useThree();
  const isMobile = useAtomValue(isMobileAtom);

  useEffect(() => {
    if (camera instanceof PerspectiveCamera) {
      // Adjust FOV for mobile to fit more of the scene,
      // instead of hard-locking the Z position every frame.
      camera.fov = isMobile ? 75 : 55;
      camera.updateProjectionMatrix();
    }
  }, [isMobile, camera]);

  return null;
};
