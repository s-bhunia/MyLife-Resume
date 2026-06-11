// packages/core-engine/src/DeviceManager.ts
import { atom, getDefaultStore } from 'jotai';

export const isMobileAtom = atom(false);
export const isPortraitAtom = atom(false);

export const initDeviceManager = () => {
  if (typeof window === 'undefined') return;
  
  const store = getDefaultStore();

  const checkDevice = () => {
    // FIX: Detect mobile hardware via user agent, or if the smallest screen dimension acts like a phone.
    const isMobileHardware = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isSmallScreen = Math.min(window.innerWidth, window.innerHeight) < 768;
    
    store.set(isMobileAtom, isMobileHardware || isSmallScreen);
    store.set(isPortraitAtom, window.innerHeight > window.innerWidth);
  };

  window.addEventListener('resize', checkDevice);
  checkDevice(); 
  
  return () => window.removeEventListener('resize', checkDevice);
};