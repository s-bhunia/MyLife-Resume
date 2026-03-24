import * as THREE from 'three';

/**
 * Converts latitude and longitude coordinates to a 3D vector (x, y, z)
 * on the surface of a sphere.
 *
 * @param lat - Latitude (in degrees)
 * @param lon - Longitude (in degrees)
 * @param radius - The radius of the sphere
 * @returns A THREE.Vector3 representing the position on the sphere's surface.
 */
export function latLonToVector3(
  lat: number,
  lon: number,
  radius: number
): THREE.Vector3 {
  // Convert degrees to radians
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  // Calculate coordinates
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
}