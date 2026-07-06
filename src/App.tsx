import { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { useAppStore } from "./store/useAppStore";
import { scrollApi } from "./scene/scrollApi";
import { PAGES } from "./scene/layout";
import { Scene } from "./scene/Scene";
import { CursorLayer } from "./cursor/CursorLayer";
import { BootOverlay } from "./overlay/BootOverlay";
import { HUD } from "./overlay/HUD";
import { ChapterPanels } from "./overlay/ChapterPanels";
import { SrDocument } from "./overlay/SrDocument";
import "./audio/sfx"; // wires Howler to the store

export default function App() {
  const [track, setTrack] = useState<HTMLDivElement | null>(null);
  const quality = useAppStore((s) => s.quality);
  const explore = useAppStore((s) => s.explore);
  const bootDone = useAppStore((s) => s.bootPhase === "done");
  const activeProject = useAppStore((s) => s.activeProject);

  useEffect(() => {
    scrollApi.el = track;
    return () => {
      scrollApi.el = null;
    };
  }, [track]);

  // the tour scrolls; explore/boot/project-focus lock the track
  const scrollLocked = !bootDone || explore || !!activeProject;

  return (
    <>
      <a className="skip-link" href="#sr-content">
        Skip to content
      </a>

      {/* scroll track — also the pointer-event source for the canvas */}
      <div
        ref={setTrack}
        className={`scroll-track ${scrollLocked ? "no-scroll" : ""}`}
      >
        <div style={{ height: `${PAGES * 100}vh` }} />
      </div>

      {track && (
        <Canvas
          className="main-canvas"
          eventSource={track}
          eventPrefix="client"
          dpr={quality === "high" ? [1, 2] : 1}
          camera={{ fov: 42, near: 0.1, far: 90, position: [0, 5.6, 15.5] }}
          gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: "var(--z-canvas)" as unknown as number,
          }}
        >
          <Scene />
        </Canvas>
      )}

      <ChapterPanels />
      <HUD />
      <BootOverlay />
      <CursorLayer />
      <div id="sr-content">
        <SrDocument />
      </div>
    </>
  );
}
