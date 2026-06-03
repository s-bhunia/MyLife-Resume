import { create } from 'zustand';

type ViewMode = 'assistant' | 'feedback';

interface WidgetState {
  isOpen: boolean;
  viewMode: ViewMode;
  targetAction: string | null; // e.g., 'resume_room', 'skills_section'
  toggleOpen: () => void;
  closeWidget: () => void;
  setViewMode: (mode: ViewMode) => void;
  setTargetAction: (action: string | null) => void;
}

export const useWidgetStore = create<WidgetState>((set) => ({
  isOpen: false,
  viewMode: 'assistant',
  targetAction: null,
  toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
  closeWidget: () => set({ isOpen: false }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setTargetAction: (action) => set({ targetAction: action }),
}));