import { useEffect, useRef } from "react";
import { useAppStore, type CursorMode } from "../store/useAppStore";

/**
 * Floaty Wii Remote pointer: a DOM cursor that chases the real pointer with
 * a slight lerp, wobbles a couple of degrees while idle, and swaps art by
 * interaction state. Converted PNGs ship with .cur fallbacks (see
 * public/cursors/README.md). Disabled on touch devices and for
 * prefers-reduced-motion — those get the native .cur cursor via CSS.
 */

const SIZE = 40; // display size; source art is 32px
const S = SIZE / 32; // hotspot scale factor

const ART: Record<
  Exclude<CursorMode, "loading">,
  { src: string; hx: number; hy: number }
> = {
  pointer: { src: "/cursors/wii-pointer-ccw.png", hx: 8 * S, hy: 2 * S },
  open: { src: "/cursors/wii-open-ccw.png", hx: 7 * S, hy: 3 * S },
  grab: { src: "/cursors/wii-grab-ccw.png", hx: 9 * S, hy: 11 * S },
};

const LOADING_FRAMES = Array.from(
  { length: 9 },
  (_, i) => `/cursors/wii-loading-cd-ccw-f0${i}.png`,
);
const LOADING_HOTSPOT = { hx: 8 * S, hy: 2 * S };
const LOADING_FPS = 12;

export function CursorLayer() {
  const touch = useAppStore((s) => s.touch);
  const reducedMotion = useAppStore((s) => s.reducedMotion);
  const enabled = !touch && !reducedMotion;

  const rootRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    document.body.classList.toggle("custom-cursor", enabled);
    document.body.classList.toggle("native-cursor", !enabled);
    return () => {
      document.body.classList.remove("custom-cursor", "native-cursor");
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    const el = rootRef.current;
    const img = imgRef.current;
    if (!el || !img) return;

    let raf = 0;
    let target = { x: -100, y: -100 };
    let pos = { x: -100, y: -100 };
    let seen = false;
    let domHover = false;
    let lastMode: string | null = null;
    let frameClock = 0;
    let lastT = performance.now();

    const onMove = (e: PointerEvent) => {
      target = { x: e.clientX, y: e.clientY };
      if (!seen) {
        pos = { ...target };
        seen = true;
        el.classList.remove("is-hidden");
      }
    };
    const onLeave = () => el.classList.add("is-hidden");
    const onEnter = () => seen && el.classList.remove("is-hidden");
    const onOver = (e: PointerEvent) => {
      domHover = !!(e.target as Element | null)?.closest?.(
        "a, button, [role='button'], input, select, textarea",
      );
    };

    // preload every cursor frame so swaps never flicker
    for (const a of [...Object.values(ART).map((a) => a.src), ...LOADING_FRAMES]) {
      const pre = new Image();
      pre.src = a;
    }

    const tick = (t: number) => {
      const dt = Math.min((t - lastT) / 1000, 0.05);
      lastT = t;

      // floaty chase — ~14%/frame at 60fps, framerate-independent
      const k = 1 - Math.exp(-dt * 10);
      pos.x += (target.x - pos.x) * k;
      pos.y += (target.y - pos.y) * k;

      const storeMode = useAppStore.getState().cursorMode;
      const mode: CursorMode =
        storeMode !== "pointer" ? storeMode : domHover ? "open" : "pointer";

      let hx: number;
      let hy: number;
      if (mode === "loading") {
        frameClock += dt;
        const frame =
          Math.floor(frameClock * LOADING_FPS) % LOADING_FRAMES.length;
        const src = LOADING_FRAMES[frame];
        if (img.getAttribute("src") !== src) img.setAttribute("src", src);
        ({ hx, hy } = LOADING_HOTSPOT);
        lastMode = "loading";
      } else {
        const art = ART[mode];
        if (lastMode !== mode) {
          img.setAttribute("src", art.src);
          lastMode = mode;
        }
        hx = art.hx;
        hy = art.hy;
      }

      // idle wobble — a loosely pointed Wii Remote, never perfectly still
      const wobble =
        Math.sin(t / 640) * 2.4 + (target.x - pos.x) * 0.06;

      el.style.transform = `translate3d(${pos.x - hx}px, ${pos.y - hy}px, 0) rotate(${wobble}deg)`;
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    document.documentElement.addEventListener("pointerenter", onEnter);
    window.addEventListener("pointerover", onOver, { passive: true });
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.documentElement.removeEventListener("pointerenter", onEnter);
      window.removeEventListener("pointerover", onOver);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div ref={rootRef} className="wii-cursor is-hidden" aria-hidden="true">
      <img ref={imgRef} src={ART.pointer.src} alt="" draggable={false} />
    </div>
  );
}
