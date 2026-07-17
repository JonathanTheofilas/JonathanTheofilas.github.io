import { create } from "zustand";

export type BootPhase = "splash" | "disc" | "bloom" | "done";
export type ThemeMode = "light" | "dark";
export type CursorMode = "pointer" | "open" | "grab" | "loading";
export type Quality = "high" | "low";

/** Chapters of the scroll tour, in order. */
export const CHAPTERS = [
  "arrival",
  "projects",
  "about",
  "skills",
  "contact",
] as const;
export type Chapter = (typeof CHAPTERS)[number];

const prefersReducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// touch-first devices (no hover, coarse pointer) get native cursors and
// touch controls; touch-capable laptops with a mouse keep the full cursor
const isTouch =
  typeof window !== "undefined" &&
  window.matchMedia("(hover: none), (pointer: coarse)").matches;

const hasBooted =
  typeof window !== "undefined" &&
  localStorage.getItem("wii-booted") === "1";

const storedTheme =
  typeof window !== "undefined"
    ? (localStorage.getItem("theme") as ThemeMode | null)
    : null;
const prefersDark =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-color-scheme: dark)").matches;

interface AppState {
  reducedMotion: boolean;
  touch: boolean;

  bootPhase: BootPhase;
  setBootPhase: (p: BootPhase) => void;
  finishBoot: () => void;
  /** true when the visitor has seen the boot before (skippable immediately) */
  returnVisitor: boolean;

  cursorMode: CursorMode;
  setCursorMode: (m: CursorMode) => void;

  chapter: number; // discrete active chapter index 0..4
  setChapter: (c: number) => void;

  explore: boolean; // free-orbit mode
  setExplore: (v: boolean) => void;

  hoveredMii: string | null;
  setHoveredMii: (id: string | null) => void;

  activeProject: string | null;
  setActiveProject: (id: string | null) => void;

  muted: boolean;
  toggleMuted: () => void;

  theme: ThemeMode;
  toggleTheme: () => void;

  quality: Quality;
  setQuality: (q: Quality) => void;

  /** flips true once the main scene has mounted — gates the boot's bloom */
  sceneReady: boolean;
  setSceneReady: (v: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  reducedMotion: prefersReducedMotion,
  touch: isTouch,

  bootPhase: prefersReducedMotion ? "done" : "splash",
  returnVisitor: hasBooted,
  setBootPhase: (bootPhase) => set({ bootPhase }),
  finishBoot: () => {
    try {
      localStorage.setItem("wii-booted", "1");
    } catch {
      /* private mode — boot will simply replay next visit */
    }
    set({ bootPhase: "done" });
  },

  cursorMode: "pointer",
  setCursorMode: (cursorMode) => set({ cursorMode }),

  chapter: 0,
  setChapter: (chapter) => set({ chapter }),

  explore: false,
  setExplore: (explore) => set({ explore }),

  hoveredMii: null,
  setHoveredMii: (hoveredMii) => set({ hoveredMii }),

  activeProject: null,
  setActiveProject: (activeProject) => set({ activeProject }),

  muted: true, // browsers block autoplay; audio unlocks on first gesture
  toggleMuted: () => set((s) => ({ muted: !s.muted })),

  theme: storedTheme ?? (prefersDark ? "dark" : "light"),
  toggleTheme: () =>
    set((s) => {
      const theme: ThemeMode = s.theme === "light" ? "dark" : "light";
      try {
        localStorage.setItem("theme", theme);
      } catch {
        /* private mode — preference simply won't persist */
      }
      return { theme };
    }),

  quality: "high",
  setQuality: (quality) => set({ quality }),

  sceneReady: false,
  setSceneReady: (sceneReady) => set({ sceneReady }),
}));

/**
 * Transient (non-React) scroll state, written every frame by the camera rig
 * and read by whoever needs it without triggering re-renders.
 */
export const scrollState = {
  offset: 0, // 0..1 through the whole tour
};
