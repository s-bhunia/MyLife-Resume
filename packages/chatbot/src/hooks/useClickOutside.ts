import { useEffect, RefObject } from 'react';

export function useClickOutside(
  ref: RefObject<HTMLElement | null>,
  handler: () => void,
) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      // Do nothing if clicking ref's element or descendent elements
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }

      // Mobile Keyboard Fix: If user taps outside while an input is focused,
      // just blur the input to hide the keyboard instead of closing the widget.
      const activeEl = document.activeElement as HTMLElement;
      if (
        activeEl &&
        (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA') &&
        event.type === 'touchstart'
      ) {
        activeEl.blur();
        return; 
      }

      handler();
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}