import * as THREE from 'three';

/**
 * Converts latitude and longitude coordinates to a 3D vector (x, y, z)
 * on the surface of a sphere.
 */
export function latLonToVector3(
  lat: number,
  lon: number,
  radius: number
): THREE.Vector3 {
  // Convert degrees to radians
  const phi = (90 - lat) * (Math.PI / 180);
  
  // The offset aligns the math with the Three.js texture wrapping.
  // Standard equirectangular maps usually require a +90 or -90 degree offset.
 const theta = (lon-180) * (Math.PI / 180);

  // Calculate Cartesian coordinates
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);

  return new THREE.Vector3(x, y, z);
}