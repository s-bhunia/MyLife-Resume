import { useMemo, useSyncExternalStore } from "react";
import type { ThreeEvent } from "@react-three/fiber";

export interface HoverInfo {
  label: string;
  hint?: string;
}

let current: HoverInfo | null = null;
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((listener) => listener());

export const hoverStore = {
  get: () => current,
  set(next: HoverInfo | null) {
    if (current === next) return;
    current = next;
    document.body.style.cursor = next ? "pointer" : "";
    emit();
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

export const useHoverInfo = () =>
  useSyncExternalStore(hoverStore.subscribe, hoverStore.get, hoverStore.get);

export function useHoverable(label: string, hint?: string, onChange?: (hovered: boolean) => void) {
  return useMemo(() => {
    const info: HoverInfo = { label, hint };
    return {
      onPointerOver(event: ThreeEvent<PointerEvent>) {
        event.stopPropagation();
        hoverStore.set(info);
        onChange?.(true);
      },
      onPointerOut(event: ThreeEvent<PointerEvent>) {
        event.stopPropagation();
        if (hoverStore.get() === info) hoverStore.set(null);
        onChange?.(false);
      },
    };
  }, [label, hint, onChange]);
}
