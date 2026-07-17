import { useEffect } from "react";
import Lenis from "lenis";
import { useAppStore } from "../store/useAppStore";

/**
 * Smooth scroll, matching alche.studio's setup (Lenis 1.3.4, `lenis` class on
 * <html>). Default browser scrolling feels noticeably different — it's the
 * first thing people register as "cheap" without being able to name it.
 *
 * The scroll position is published to `scrollState` every frame (non-React, so
 * per-frame reads don't re-render), and to the DOM as --scroll-y for any CSS
 * that wants it.
 */

export const scrollState = {
  y: 0,
  /** total scrollable height in px */
  limit: 1,
  /** instantaneous velocity — useful for motion that reacts to scroll speed */
  velocity: 0,
};

let lenis: Lenis | null = null;

/** Imperative handle for nav links / skip-to-section. */
export const scrollTo = (target: string | number, offset = 0) =>
  lenis?.scrollTo(target, { offset });

export function useLenis() {
  const reducedMotion = useAppStore((s) => s.reducedMotion);

  useEffect(() => {
    // Honour the OS setting — smoothing a scroll for someone who asked for
    // less motion is exactly the wrong move.
    if (reducedMotion) return;

    const instance = new Lenis({
      // Calm and long. alche's whole feel is that nothing snaps.
      duration: 1.4,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // expo.out
      orientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.6,
    });
    lenis = instance;

    instance.on(
      "scroll",
      ({
        scroll,
        limit,
        velocity,
      }: {
        scroll: number;
        limit: number;
        velocity: number;
      }) => {
        scrollState.y = scroll;
        scrollState.limit = limit || 1;
        scrollState.velocity = velocity;
      },
    );

    let raf = 0;
    const loop = (time: number) => {
      instance.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      instance.destroy();
      lenis = null;
    };
  }, [reducedMotion]);
}
