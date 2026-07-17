import { useEffect, useRef, useState } from "react";
import { useAppStore } from "../store/useAppStore";
import { site } from "../content/site";
import "./Loader.css";

/**
 * The loading page.
 *
 * It waits on something real: `document.fonts.ready`. That's not decoration —
 * the whole design rests on Inter Tight and IBM Plex Mono, and letting the
 * hero paint in Arial for 200ms and then reflow to 88px Inter Tight is a worse
 * first impression than a loader. So the loader earns its place by hiding a
 * real problem rather than inventing a fake one.
 *
 * The counter holds at 90 until fonts actually resolve, then runs to 100. It
 * never claims to be finished before it is.
 *
 * Wii DNA lives in the exit: the field blooms — scales up and glows out —
 * rather than cutting or cross-fading. That expand-and-glow was the Wii Menu's
 * signature, and it's the one moment on the site that's allowed to be springy.
 * Everything else eases.
 *
 * It runs on EVERY visit — the reference site does the same. An earlier
 * version skipped it for return visitors, which meant the person most likely
 * to look at the site repeatedly (its owner) never saw the boot at all.
 * Only reduced-motion skips it.
 */

const MIN_MS = 1200; // below this it reads as a flash, not a beat
const BLOOM_MS = 900;

export function Loader() {
  const phase = useAppStore((s) => s.bootPhase);
  const setBootPhase = useAppStore((s) => s.setBootPhase);
  const finishBoot = useAppStore((s) => s.finishBoot);
  const reducedMotion = useAppStore((s) => s.reducedMotion);

  const [pct, setPct] = useState(0);
  const startedAt = useRef(performance.now());

  // Skip only for those who asked for less motion.
  useEffect(() => {
    if (reducedMotion) finishBoot();
  }, [reducedMotion, finishBoot]);

  // Safety valve: the loader gates the whole site on rAF and fonts.ready —
  // a wedged font promise or a battery-saver throttling rAF must never hold
  // a visitor hostage on the count screen. After 6s, we're in regardless.
  useEffect(() => {
    const t = setTimeout(() => {
      if (useAppStore.getState().bootPhase !== "done") finishBoot();
    }, 6000);
    return () => clearTimeout(t);
  }, [finishBoot]);

  // Count toward a target that only reaches 100 once fonts are actually ready.
  useEffect(() => {
    if (phase === "done") return;

    let ready = false;
    let raf = 0;

    document.fonts.ready.then(() => {
      ready = true;
    });

    const tick = () => {
      const elapsed = performance.now() - startedAt.current;
      const timeGate = Math.min(1, elapsed / MIN_MS);
      const target = ready ? 100 * timeGate : 90 * timeGate;

      setPct((prev) => {
        const next = prev + (target - prev) * 0.12; // ease toward, never jump
        return next > 99.5 && ready ? 100 : next;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(raf);
  }, [phase]);

  // At 100, start the bloom.
  useEffect(() => {
    if (phase !== "splash" || pct < 100) return;
    setBootPhase("bloom");
  }, [pct, phase, setBootPhase]);

  // Bloom → done, on its own effect.
  //
  // These have to be separate. Setting the phase and scheduling the exit in
  // one effect means the phase change re-runs that effect, whose cleanup
  // clears the very timeout it just set — the loader sticks in bloom forever,
  // and since it also locks scrolling, the whole page freezes. Keyed on
  // `phase === "bloom"`, the timer is only torn down on leaving bloom.
  useEffect(() => {
    if (phase !== "bloom") return;
    const t = setTimeout(finishBoot, BLOOM_MS);
    return () => clearTimeout(t);
  }, [phase, finishBoot]);

  // Nothing scrolls while the loader is up.
  useEffect(() => {
    const locked = phase !== "done";
    document.documentElement.style.overflow = locked ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [phase]);

  if (phase === "done") return null;

  const shown = Math.round(pct);

  return (
    <div
      className={`ld ${phase === "bloom" ? "ld--bloom" : ""}`}
      role="status"
      aria-live="polite"
      aria-label={`Loading, ${shown} percent`}
    >
      {/* the bloom — a soft ring that expands past the viewport on exit */}
      <span className="ld__bloom" aria-hidden="true" />

      <div className="ld__inner">
        {/* the monogram sits inside a slow pulsing ring — the Wii's glowing
            "press Ⓐ" button, reduced to its outline */}
        <div className="ld__markwrap">
          <span className="ld__ring" aria-hidden="true" />
          <span className="ld__ring ld__ring--late" aria-hidden="true" />
          <span className="ld__mark display">{site.monogram}</span>
        </div>

        <div className="ld__track" aria-hidden="true">
          <span
            className="ld__fill"
            style={{ transform: `scaleX(${pct / 100})` }}
          />
        </div>

        <span className="ld__pct chrome" aria-hidden="true">
          {String(shown).padStart(3, "0")}
        </span>
      </div>
    </div>
  );
}
