// The hero centerpiece: two ASCII hands reaching toward each other from the
// viewport edges. While the pointer is inside the hero they follow it so the
// cursor stays nestled in the gap between the fingertips; scrolling past the
// hero parks them. The artwork auto-cycles minimal -> standard -> detailed ->
// block on a timed crossfade.

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { HANDS } from "../data/hands.js";
import {
  measureCharRatio,
  unionBBox,
  prerenderHand,
  compositeMix,
} from "./renderer.js";
import { reducedMotion, finePointer, quality } from "../modules/device.js";

gsap.registerPlugin(ScrollTrigger);

const CYCLE_SECONDS = quality === "low" ? 3.2 : 1.6; // + fade ≈ one swap every 2s
const FADE_SECONDS = 0.4;
const GAP_MIN_PX = 64; // fingertip gap kept around the cursor
const STRETCH_X = 1.08; // horizontal stretch pulling the arms toward the middle

export function initHands() {
  const layer = document.getElementById("hands");
  const landing = document.getElementById("landing");
  if (!layer || !landing) return { ready: Promise.resolve() };

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const sides = ["left", "right"];
  const els = {}; // side -> visible canvas
  const pre = {}; // side -> [offscreen canvas per variant]
  const geo = {}; // side -> { union, x, y, tipX, tipY } in landing-local px
  let cellW = 0;
  let cellH = 0;
  let bleed = 0; // horizontal off-screen overhang keeping arms rooted at edges
  let current = 0;
  let entranceDone = false;
  let followEnabled = false;
  let heroActive = true;
  let fading = false;

  sides.forEach((side) => {
    const c = document.createElement("canvas");
    c.className = `hands__${side}`;
    layer.appendChild(c);
    els[side] = c;
  });

  // ---------- layout + prerender ----------
  function build() {
    const vw = landing.clientWidth;
    const vh = landing.clientHeight;
    const ratio = measureCharRatio();
    const rows = HANDS.variants[0].rows;
    const cols = Math.max(...HANDS.variants.map((v) => v.cols));
    // Width-driven: the combined artwork spans ~106% of the viewport so each
    // arm stays rooted at (and bleeds past) its screen edge; the vertical
    // overflow is clipped by the hero section. Floor of 2.5px keeps narrow
    // phones sane — glyphs read as texture at that size.
    // fs is sized from the unstretched width (controls height/clipping);
    // STRETCH_X then widens the raster so the arms reach further inward
    const fs = gsap.utils.clamp(2.5, 18, (vw * 1.06) / (cols * ratio));
    cellW = fs * ratio * STRETCH_X;
    cellH = fs * HANDS.lineHeight;
    bleed = vw * 0.04;

    // fingertips sit at ~48% of the hero height so the cursor meets them
    // comfortably above the intro text
    const tipRow = HANDS.variants[0].left.tip[0];
    const oy = vh * 0.48 - (tipRow + 0.5) * cellH;

    sides.forEach((side) => {
      const union = unionBBox(side);
      pre[side] = HANDS.variants.map((v) =>
        prerenderHand(v, side, union, fs, ratio, dpr, STRETCH_X)
      );
      const el = els[side];
      el.width = pre[side][0].width;
      el.height = pre[side][0].height;
      el.style.width = `${union.cols * cellW}px`;
      el.style.height = `${union.rows * cellH}px`;
      // each hand anchors to its own page edge, arm base off-screen by `bleed`
      const x =
        side === "left" ? -bleed : vw + bleed - union.cols * cellW;
      const y = oy + union.r0 * cellH;
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;

      // fingertip anchor (variant 0 tip), local to the canvas — rotation pivot
      const [tr, tc] = HANDS.variants[0][side].tip;
      const tipX = (tc - union.c0 + 0.5) * cellW;
      const tipY = (tr - union.r0 + 0.5) * cellH;
      gsap.set(el, { transformOrigin: `${tipX}px ${tipY}px` });

      geo[side] = { union, x, y, tipX, tipY };
    });

    compositeAll(current, null, 0);
  }

  function compositeAll(cur, next, mix) {
    sides.forEach((side) => {
      compositeMix(
        els[side].getContext("2d"),
        pre[side][cur],
        next == null ? null : pre[side][next],
        mix,
        dpr
      );
    });
  }

  // ---------- pointer follow ----------
  const to = {};
  function makeTweens() {
    sides.forEach((side) => {
      to[side] = {
        x: gsap.quickTo(els[side], "x", { duration: 0.55, ease: "power3.out" }),
        y: gsap.quickTo(els[side], "y", { duration: 0.6, ease: "power3.out" }),
        r: gsap.quickTo(els[side], "rotation", { duration: 0.8, ease: "power2.out" }),
      };
    });
  }

  function restMeet() {
    // resting meeting point between the two fingertips, landing-local
    const lx = geo.left.x + geo.left.tipX;
    const rx = geo.right.x + geo.right.tipX;
    const ly = geo.left.y + geo.left.tipY;
    const ry = geo.right.y + geo.right.tipY;
    return { x: (lx + rx) / 2, y: (ly + ry) / 2, gap: rx - lx };
  }

  function follow(e) {
    if (!followEnabled) return;
    const rect = landing.getBoundingClientRect();
    if (rect.bottom < 0) return;
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const m = restMeet();
    const vw = landing.clientWidth;
    const vh = landing.clientHeight;

    // horizontal reach is capped by the bleed so an arm never detaches from
    // its edge; vertical reach only reveals more of the clipped artwork
    const dx = gsap.utils.clamp(-bleed, bleed, mx - m.x);
    const dy = gsap.utils.clamp(-vh * 0.28, vh * 0.28, (my - m.y) * 0.6);
    // widen the natural gap so the cursor sits comfortably between the tips
    const extra = Math.max(0, GAP_MIN_PX - m.gap) / 2;

    to.left.x(gsap.utils.clamp(-bleed, bleed, dx - extra));
    to.right.x(gsap.utils.clamp(-bleed, bleed, dx + extra));
    to.left.y(dy);
    to.right.y(dy);
    const tilt = (dy / (vh * 0.28)) * 2.5;
    to.left.r(-tilt);
    to.right.r(tilt);
  }

  function settle() {
    sides.forEach((side) => {
      to[side].x(0);
      to[side].y(0);
      to[side].r(0);
    });
  }

  // ---------- entrance (after preloader) ----------
  function entrance() {
    if (entranceDone) return;
    entranceDone = true;
    const vw = landing.clientWidth;
    if (reducedMotion) {
      gsap.set([els.left, els.right], { x: 0, y: 0, opacity: 1 });
      gsap.set(".landing__intro", { autoAlpha: 1 });
      followEnabled = false;
      return;
    }
    const offL = -(geo.left.x + geo.left.union.cols * cellW) - 40;
    const offR = vw - geo.right.x + 40;
    gsap.set(els.left, { x: offL, opacity: 1 });
    gsap.set(els.right, { x: offR, opacity: 1 });
    const tl = gsap.timeline({
      onComplete: () => {
        followEnabled = finePointer;
      },
    });
    tl.to(els.left, { x: 0, duration: 1.25, ease: "expo.out" }, 0)
      .to(els.right, { x: 0, duration: 1.25, ease: "expo.out" }, 0.08)
      .fromTo(
        ".landing__intro",
        { autoAlpha: 0, y: 24 },
        { autoAlpha: 1, y: 0, duration: 0.8, ease: "power3.out" },
        0.5
      );
  }

  // RGB-split + sliced-band displacement over the composited frame; intensity
  // peaks mid-crossfade so every swap reads as a glitch, not a dissolve
  function glitchPass(intensity) {
    sides.forEach((side) => {
      const el = els[side];
      const ctx = el.getContext("2d");
      const w = el.width;
      const h = el.height;
      const bands = 3 + ((Math.random() * 4) | 0);
      for (let i = 0; i < bands; i++) {
        const sy = (Math.random() * h) | 0;
        const bh = Math.max(2, (Math.random() * h * 0.045) | 0);
        const dx = (Math.random() - 0.5) * w * 0.06 * intensity;
        ctx.drawImage(el, 0, sy, w, bh, dx, sy, w, bh);
      }
      // occasional color-channel echo for the analog-glitch feel
      if (Math.random() < 0.6 * intensity) {
        ctx.save();
        ctx.globalAlpha = 0.18 * intensity;
        ctx.globalCompositeOperation = "lighter";
        ctx.drawImage(el, (Math.random() - 0.5) * w * 0.015, 0);
        ctx.restore();
      }
    });
  }

  // ---------- variant auto-cycle ----------
  function scheduleCycle() {
    if (reducedMotion) return;
    gsap.delayedCall(CYCLE_SECONDS, () => {
      if (!heroActive || document.hidden || !entranceDone) {
        scheduleCycle();
        return;
      }
      const next = (current + 1) % HANDS.variants.length;
      const mixer = { t: 0 };
      fading = true;
      gsap.to(mixer, {
        t: 1,
        duration: FADE_SECONDS,
        ease: "power2.inOut",
        onUpdate: () => {
          compositeAll(current, next, mixer.t);
          const intensity = Math.sin(mixer.t * Math.PI);
          if (intensity > 0.15) glitchPass(intensity);
        },
        onComplete: () => {
          current = next;
          fading = false;
          compositeAll(current, null, 0);
          scheduleCycle();
        },
      });
    });
  }

  // ---------- scroll gating ----------
  function wireScroll() {
    ScrollTrigger.create({
      trigger: landing,
      start: "top top",
      end: "bottom 40%",
      onLeave: () => {
        heroActive = false;
        followEnabled = false;
        settle();
        gsap.to([els.left, els.right], { opacity: 0.45, duration: 0.6 });
      },
      onEnterBack: () => {
        heroActive = true;
        followEnabled = entranceDone && finePointer && !reducedMotion;
        gsap.to([els.left, els.right], { opacity: 1, duration: 0.6 });
      },
    });
  }

  // The stylesheet arrives via async CSS imports in dev, so the landing may
  // not have its 100dvh height yet when fonts resolve — wait for real layout.
  // setTimeout (not rAF): rAF is throttled to zero in hidden tabs.
  function layoutReady() {
    return new Promise((res) => {
      const t0 = performance.now();
      (function check() {
        if (
          landing.clientHeight >= window.innerHeight * 0.8 ||
          performance.now() - t0 > 2000
        ) {
          res();
        } else {
          setTimeout(check, 40);
        }
      })();
    });
  }

  // ---------- boot ----------
  const ready = Promise.all([
    document.fonts?.ready || Promise.resolve(),
    layoutReady(),
  ]).then(() => {
    // static fallbacks show the standard (index 1) variant
    if (reducedMotion) current = 1;
    build();
    makeTweens();
    // hidden until the preloader lifts and the entrance runs
    gsap.set([els.left, els.right], { opacity: 0 });
    wireScroll();
    scheduleCycle();
  });

  window.addEventListener("preloader:done", () => {
    ready.then(entrance);
  });

  if (finePointer && !reducedMotion) {
    window.addEventListener("pointermove", follow, { passive: true });
  }

  let resizeT;
  window.addEventListener("resize", () => {
    clearTimeout(resizeT);
    resizeT = setTimeout(() => {
      ready.then(() => {
        build();
        if (entranceDone) gsap.set([els.left, els.right], { opacity: 1, x: 0, y: 0, rotation: 0 });
      });
    }, 200);
  });

  return { ready };
}
