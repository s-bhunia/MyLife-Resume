// apps/main/src/components/CameraController.tsx
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useWidgetStore } from "@mylife/chatbot";
import { CAMERA_TARGETS } from "../config/cameraTargets";

const targetLook = new THREE.Vector3();
const EPS = 0.005;
export function CameraController() {
  useFrame((state, delta) => {
    const currentAction = useWidgetStore.getState().targetAction;
    const targetConfig =
      CAMERA_TARGETS[currentAction || "HOME"] || CAMERA_TARGETS.HOME;

    const posDiff = state.camera.position.distanceTo(targetConfig.position);
    const lookDiff = targetLook.distanceTo(targetConfig.lookAt);

    // Stop updating matrix once the camera has arrived
    if (posDiff < EPS && lookDiff < EPS) return;

    // Use damp to avoid framerate dependency
    state.camera.position.lerp(targetConfig.position, 0.05); // Or upgrade to damp
    targetLook.lerp(targetConfig.lookAt, 0.05);
    state.camera.lookAt(targetLook);
  });

  return null;
}
