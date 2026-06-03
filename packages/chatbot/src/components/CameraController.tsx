// apps/main/src/components/CameraController.tsx
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useWidgetStore } from '@mylife/chatbot';
import { CAMERA_TARGETS } from '../config/cameraTargets';

// Temporary vectors to prevent garbage collection overhead inside useFrame
const targetPos = new THREE.Vector3();
const targetLook = new THREE.Vector3();

export function CameraController() {
  useFrame((state) => {
    // 1. Grab the latest action imperatively (Transient read - NO RE-RENDERS)
    const currentAction = useWidgetStore.getState().targetAction;
    
    // Default to HOME view if action is null or unrecognized
    const targetConfig = CAMERA_TARGETS[currentAction || 'HOME'] || CAMERA_TARGETS.HOME;

    // 2. Smoothly interpolate (lerp) the camera position
    // 0.05 controls the dampening speed. Lower = smoother/slower, Higher = snappier
    state.camera.position.lerp(targetConfig.position, 0.05);

    // 3. Smoothly interpolate where the camera is looking
    // We update the controls or manually update matrix if orbit controls are disabled
    targetLook.lerp(targetConfig.lookAt, 0.05);
    state.camera.lookAt(targetLook);
  });

  return null; // This component doesn't render any geometry, it just controls the camera
}