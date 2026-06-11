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
  NAVIGATE_SOCIAL: {
    position: new THREE.Vector3(-8, 2, 0),  // Social media section
    lookAt: new THREE.Vector3(-8, 2, -5)
  },
  NAVIGATE_TIME: {
    position: new THREE.Vector3(6, 4, 5),  // Tube clock section
    lookAt: new THREE.Vector3(6, 4, -2)
  },
  NAVIGATE_GLOBE: {
    position: new THREE.Vector3(0, 3, -8),  // Globe section
    lookAt: new THREE.Vector3(0, 3, 0)
  },
  NAVIGATE_BOOKSHELF: {
    position: new THREE.Vector3(-6, 2, -8),  // Bookshelf section
    lookAt: new THREE.Vector3(-6, 2, 0)
  },
  OPEN_RESUME: {
    position: new THREE.Vector3(8, 5, 8),  // Resume viewing position
    lookAt: new THREE.Vector3(8, 2, 0)
  }
};