// apps/main/src/config/cameraTargets.ts
import * as THREE from 'three';

export interface CameraPosition {
  position: THREE.Vector3;
  lookAt: THREE.Vector3;
}

export const CAMERA_TARGETS: Record<string, CameraPosition> = {
  HOME: {
    position: new THREE.Vector3(0, 5, 10),
    lookAt: new THREE.Vector3(0, 0, 0)
  },
  NAVIGATE_PROJECTS: {
    position: new THREE.Vector3(-5, 2, 4), // Example coordinates of your project room
    lookAt: new THREE.Vector3(-5, 2, 0)
  },
  NAVIGATE_SKILLS: {
    position: new THREE.Vector3(4, 3, -2),  // Example coordinates of your skills wall
    lookAt: new THREE.Vector3(4, 1, -2)
  },
  // Add other actions like OPEN_RESUME here if they trigger camera moves
};