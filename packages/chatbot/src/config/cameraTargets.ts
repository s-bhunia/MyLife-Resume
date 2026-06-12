// apps/main/src/config/cameraTargets.ts
import * as THREE from 'three';

export const CAMERA_TARGETS: Record<string, { position: THREE.Vector3; lookAt: THREE.Vector3 }> = {
  NAVIGATE_HOME: { position: new THREE.Vector3(0, 1.6, 2.5), lookAt: new THREE.Vector3(0, 1.5, -2) },
  NAVIGATE_PROJECTS: { position: new THREE.Vector3(-2.5, 1.6, -1.5), lookAt: new THREE.Vector3(-2.5, 1.6, -3.85) },
  NAVIGATE_SKILLS: { position: new THREE.Vector3(2.5, 1.6, -1.5), lookAt: new THREE.Vector3(2.5, 1.6, -3.85) },
  NAVIGATE_SOCIAL: { position: new THREE.Vector3(-2.5, 1.5, 0), lookAt: new THREE.Vector3(-4.86, 1.5, 0) },
  NAVIGATE_TIME: { position: new THREE.Vector3(4, 1.7, -2.5), lookAt: new THREE.Vector3(4, 1.7, -3.8) },
  NAVIGATE_GLOBE: { position: new THREE.Vector3(2.5, 1.79, 0), lookAt: new THREE.Vector3(4.2, 1.79, 0) },
  NAVIGATE_BOOKSHELF: { position: new THREE.Vector3(0, 1.4, -1.5), lookAt: new THREE.Vector3(0, 1.35, -3.5) }
};