import { create } from "zustand";
import type { ViewId } from "../config/views";

export type Phase = "loading" | "ready" | "entering" | "exploring";

interface MindState {
  phase: Phase;
  progress: number;
  sceneCompiled: boolean;
  doorOpen: boolean;
  view: ViewId;
  navNonce: number;
  scrollId: string | null;
  book: string | null;
  soul: boolean;
  setProgress: (progress: number) => void;
  markCompiled: () => void;
  enter: () => void;
  finishIntro: () => void;
  openDoor: () => void;
  goTo: (view: ViewId) => void;
  openScroll: (id: string) => void;
  closeScroll: () => void;
  openBook: (name: string) => void;
  closeBook: () => void;
  openSoul: () => void;
  closeSoul: () => void;
}

const resolvePhase = (progress: number, compiled: boolean, phase: Phase): Phase =>
  phase === "loading" && compiled && progress >= 1 ? "ready" : phase;

export const useMind = create<MindState>((set) => ({
  phase: "loading",
  progress: 0,
  sceneCompiled: false,
  doorOpen: false,
  view: "home",
  navNonce: 0,
  scrollId: null,
  book: null,
  soul: false,
  setProgress: (progress) =>
    set((s) => ({ progress: Math.max(s.progress, progress), phase: resolvePhase(Math.max(s.progress, progress), s.sceneCompiled, s.phase) })),
  markCompiled: () => set((s) => ({ sceneCompiled: true, progress: 1, phase: resolvePhase(1, true, s.phase) })),
  enter: () => set((s) => (s.phase === "ready" ? { phase: "entering" } : s)),
  finishIntro: () => set({ phase: "exploring", doorOpen: true, view: "home" }),
  openDoor: () => set({ doorOpen: true }),
  goTo: (view) => set((s) => ({ view, navNonce: s.navNonce + 1 })),
  openScroll: (scrollId) => set({ scrollId }),
  closeScroll: () => set({ scrollId: null }),
  openBook: (book) => set({ book }),
  closeBook: () => set({ book: null }),
  openSoul: () => set({ soul: true }),
  closeSoul: () => set({ soul: false }),
}));

export const selectOverlayOpen = (s: MindState) => Boolean(s.scrollId || s.book || s.soul);
