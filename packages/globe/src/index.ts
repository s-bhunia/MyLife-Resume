// globe/src/index.ts
export { default as TravelGlobe } from './TravelGlobe';
export type { Location as GlobeLocation } from './TravelGlobe';

// Export individual modules for composition
export { GlobeStand } from './GlobeStand';
export { default as AnimatedArc } from './AnimatedArc';
export { LocationMarker } from './LocationMarker';
export { latLonToVector3 } from './utils';