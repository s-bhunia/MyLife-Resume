// src/utils/constants.ts

import * as THREE from 'three';

export const COLORS = {
  brass: "#b8860b",      // Vintage brass/gold
  darkMetal: "#1a1a1a",  // Aged iron for the cage
  glass: "#d2cdcd",
  fuel: "#0044ff",       // Deep Blue Dyed Kerosene (UPDATED)
  neonOff: "#614c4c17",    
  neonOn: "#211c1a",     
};

// Profile for the Upper Glass Chimney
export const CHIMNEY_PROFILE = [
  new THREE.Vector2(1.4, 0),    
  new THREE.Vector2(1.8, 1.5),  
  new THREE.Vector2(1.2, 4.5),  
  new THREE.Vector2(0.9, 6.5),  
  new THREE.Vector2(1.15, 7.0), // Slightly wider top lip
];

// Profile for the Fuel Tank
export const TANK_PROFILE = [
  new THREE.Vector2(1.4, 0),    // Top connects to burner
  new THREE.Vector2(2.8, -1.0), // Shoulder
  new THREE.Vector2(2.8, -3.5), // Main body
  new THREE.Vector2(0, -4.0),   // Bottom center
];

// Profile for the Liquid (Slightly smaller than tank)
export const FUEL_PROFILE = [
  new THREE.Vector2(1.3, -0.2), 
  new THREE.Vector2(2.7, -1.1), 
  new THREE.Vector2(2.7, -3.4), 
  new THREE.Vector2(0, -3.9),   
];