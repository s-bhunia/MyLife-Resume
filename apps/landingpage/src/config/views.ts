export type Vec3 = [number, number, number];

export type ViewId = "home" | "about" | "desk" | "work" | "library" | "skills" | "time" | "journeys";

export interface View {
  label: string;
  position: Vec3;
  target: Vec3;
}

export const VIEWS: Record<ViewId, View> = {
  home: { label: "Home", position: [0, 1.7, 1.6], target: [0, 1.55, -2.2] },
  about: { label: "About", position: [-2.3, 1.75, 0], target: [-4.8, 1.75, 0] },
  desk: { label: "Desk", position: [-3.25, 1.6, 0.3], target: [-4.6, 1.32, 0] },
  work: { label: "Work", position: [-2.6, 1.85, -1.6], target: [-2.6, 1.85, -3.8] },
  library: { label: "Library", position: [0, 1.65, -1.7], target: [0, 1.6, -3.6] },
  skills: { label: "Skills", position: [2.6, 1.85, -1.6], target: [2.6, 1.85, -3.8] },
  time: { label: "Time", position: [4.05, 1.78, -2.55], target: [4.05, 1.72, -3.8] },
  journeys: { label: "Journeys", position: [2.55, 1.82, 0.35], target: [4.2, 1.74, 0] },
};

export const NAV_VIEWS: ViewId[] = ["about", "work", "library", "skills", "journeys", "desk"];

export const ACTION_VIEWS: Record<string, ViewId> = {
  NAVIGATE_HOME: "home",
  NAVIGATE_ABOUT: "about",
  NAVIGATE_PORTRAIT: "about",
  NAVIGATE_SOCIAL: "about",
  NAVIGATE_DESK: "desk",
  NAVIGATE_PROJECTS: "work",
  NAVIGATE_WORK: "work",
  NAVIGATE_SKILLS: "skills",
  OPEN_SKILLS_BOOK: "skills",
  NAVIGATE_BOOKSHELF: "library",
  NAVIGATE_LIBRARY: "library",
  NAVIGATE_TIME: "time",
  NAVIGATE_GLOBE: "journeys",
  NAVIGATE_JOURNEYS: "journeys",
};

export const INTRO = {
  start: { position: [15, 8.5, 22] as Vec3, target: [0, 2, 0] as Vec3 },
  door: { position: [0, 1.72, 6.1] as Vec3, target: [0, 1.55, 2.5] as Vec3 },
};

export const ROOM_BOUNDS = { min: [-4.86, 0.6, -3.86] as Vec3, max: [4.86, 2.85, 2.3] as Vec3 };
