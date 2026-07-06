import { useCallback, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { site } from "../content/site";
import { useAppStore } from "../store/useAppStore";
import { sfx } from "../audio/sfx";
import { BootDisc } from "./BootDisc";

const MIN_BOOT_SECONDS = 4.6;

/**
 * The Wii disc boot: splash parody → disc insert → spin-up (real loading)
 * → channel bloom → plaza. Skippable; skipped entirely for
 * prefers-reduced-motion (bootPhase starts at "done").
 */
export function BootOverlay() {
  const bootPhase = useAppStore((s) => s.bootPhase);
  const setBootPhase = useAppStore((s) => s.setBootPhase);
  const finishBoot = useAppStore((s) => s.finishBoot);
  const returnVisitor = useAppStore((s) => s.returnVisitor);
  const setCursorMode = useAppStore((s) => s.setCursorMode);
  const sceneReady = useAppStore((s) => s.sceneReady);

  const [gone, setGone] = useState(bootPhase === "done");
  const [fading, setFading] = useState(false);
  const [showSkip, setShowSkip] = useState(returnVisitor);
  const discStarted = useRef<number | null>(null);

  const skip = useCallback(() => {
    setCursorMode("pointer");
    finishBoot();
  }, [finishBoot, setCursorMode]);

  /* splash: any click / key = "Press A" */
  useEffect(() => {
    if (bootPhase !== "splash") return;
    const t = setTimeout(() => setShowSkip(true), 1500);
    const advance = () => {
      // the press-A gesture unlocks audio (autoplay policy) — mute toggle
      // in the HUD can silence it again at any time
      useAppStore.setState({ muted: false });
      setBootPhase("disc");
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return;
      advance();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [bootPhase, setBootPhase]);

  /* disc phase: loading cursor + completion gate */
  useEffect(() => {
    if (bootPhase !== "disc") return;
    setCursorMode("loading");
    discStarted.current = performance.now();
    return () => setCursorMode("pointer");
  }, [bootPhase, setCursorMode]);

  useEffect(() => {
    if (bootPhase !== "disc") return;
    const iv = setInterval(() => {
      const elapsed = (performance.now() - (discStarted.current ?? 0)) / 1000;
      // never block on fake timers once the scene is genuinely ready
      if (sceneReady && elapsed >= MIN_BOOT_SECONDS) {
        sfx.play("chime");
        setBootPhase("bloom");
      } else if (elapsed > 12) {
        // safety valve — something failed to report ready; let people in
        setBootPhase("bloom");
      }
    }, 120);
    return () => clearInterval(iv);
  }, [bootPhase, sceneReady, setBootPhase]);

  /* bloom → done → fade out */
  useEffect(() => {
    if (bootPhase !== "bloom") return;
    const t = setTimeout(() => finishBoot(), 1350);
    return () => clearTimeout(t);
  }, [bootPhase, finishBoot]);

  useEffect(() => {
    if (bootPhase !== "done" || gone) return;
    setFading(true);
    sfx.startAmbient();
    const t = setTimeout(() => setGone(true), 950);
    return () => clearTimeout(t);
  }, [bootPhase, gone]);

  if (gone) return null;

  return (
    <div
      className={[
        "boot",
        bootPhase === "bloom" || fading ? "is-bloom" : "",
        fading ? "is-fading" : "",
      ].join(" ")}
      role="dialog"
      aria-label="Intro"
    >
      {bootPhase === "splash" && (
        <div
          className="boot-splash"
          onClick={() => {
            useAppStore.setState({ muted: false });
            setBootPhase("disc");
          }}
        >
          <h1>{site.name}</h1>
          <p className="boot-warning">{site.boot.warning}</p>
          <p className="boot-press-a">{site.boot.pressA}</p>
        </div>
      )}

      {bootPhase === "disc" && (
        <>
          <div className="boot-canvas">
            <Canvas
              dpr={[1, 2]}
              camera={{ fov: 38, position: [0, 0, 6] }}
              gl={{ antialias: true, alpha: true }}
            >
              <BootDisc onInsert={() => sfx.play("whir")} />
            </Canvas>
          </div>
          <div className="boot-slot" aria-hidden="true" />
          <p className="boot-status">loading</p>
        </>
      )}

      {bootPhase === "bloom" && <div className="boot-bloom-card" aria-hidden="true" />}

      {showSkip && bootPhase !== "bloom" && !fading && (
        <button className="wii-btn boot-skip" onClick={skip}>
          Skip ▸
        </button>
      )}
    </div>
  );
}
