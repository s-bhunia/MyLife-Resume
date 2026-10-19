import * as THREE from "three";

export const MAT = {
  walnut: new THREE.MeshStandardMaterial({ color: "#5a3a24", roughness: 0.48, metalness: 0.02 }),
  walnutDark: new THREE.MeshStandardMaterial({ color: "#3e2717", roughness: 0.55 }),
  steel: new THREE.MeshStandardMaterial({ color: "#1c1e23", roughness: 0.38, metalness: 0.75 }),
  aluminium: new THREE.MeshStandardMaterial({ color: "#a4a9b0", roughness: 0.32, metalness: 0.85 }),
  keyboard: new THREE.MeshStandardMaterial({ color: "#2a2d33", roughness: 0.7 }),
  rubber: new THREE.MeshStandardMaterial({ color: "#121316", roughness: 0.9 }),
  fabric: new THREE.MeshStandardMaterial({ color: "#2f3238", roughness: 0.95 }),
  ceramic: new THREE.MeshStandardMaterial({ color: "#e9e4da", roughness: 0.35 }),
  grille: new THREE.MeshStandardMaterial({ color: "#6c7078", roughness: 0.5, metalness: 0.8 }),
  clay: new THREE.MeshStandardMaterial({ color: "#9a4f2c", roughness: 0.85 }),
  paper: new THREE.MeshStandardMaterial({ color: "#efe8da", roughness: 0.9 }),
  cover: new THREE.MeshStandardMaterial({ color: "#1f3a4a", roughness: 0.7 }),
  brass: new THREE.MeshStandardMaterial({ color: "#c79a5a", roughness: 0.3, metalness: 0.85 }),
};
