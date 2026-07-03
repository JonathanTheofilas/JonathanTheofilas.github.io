// Custom cursor: an ever-rotating orbit of ASCII glyphs on a small canvas,
// colored along the indigo->coral artwork gradient, with a two-ghost trail.
// Rotation drops to a tenth of its speed over interactive elements.
// Fine pointers only; falls back to the native cursor elsewhere.

import { gsap } from "gsap";
import { finePointer, reducedMotion, quality } from "./device.js";

const GLYPHS = ["+", "*", "·", ":", "/", "\\", "x", "-", "o"];
const SIZE = 72; // css px, ring centred inside
const RADIUS = 15;
const BASE_SPEED = 1.7; // rad/s
const SLOW_SPEED = BASE_SPEED / 10;
const INDIGO = [70, 60, 239];
const CORAL = [250, 96, 79];
const HOVER_SELECTOR = "a, button, [data-magnetic], .tile, [data-cursor-slow]";

function ringColor(t) {
  const c = INDIGO.map((v, i) => Math.round(v + (CORAL[i] - v) * t));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}

export function initCursor() {
  if (!finePointer || reducedMotion) return;

  const wrap = document.createElement("div");
  wrap.className = "cursor-ring";
  wrap.setAttribute("aria-hidden", "true");
  const canvas = document.createElement("canvas");
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = SIZE * dpr;
  canvas.height = SIZE * dpr;
  canvas.style.width = `${SIZE}px`;
  canvas.style.height = `${SIZE}px`;
  wrap.appendChild(canvas);
  document.body.appendChild(wrap);

  const ghosts = [];
  if (quality !== "low") {
    [
      { char: "·", color: ringColor(0.8), alpha: 0.4, lag: 0.26 },
      { char: ":", color: ringColor(0.2), alpha: 0.18, lag: 0.42 },
    ].forEach((g) => {
      const s = document.createElement("span");
      s.className = "cursor-ghost";
      s.textContent = g.char;
      s.style.color = g.color;
      document.body.appendChild(s);
      gsap.set(s, { xPercent: -50, yPercent: -50 });
      ghosts.push({
        el: s,
        alpha: g.alpha,
        x: gsap.quickTo(s, "x", { duration: g.lag, ease: "power2.out" }),
        y: gsap.quickTo(s, "y", { duration: g.lag, ease: "power2.out" }),
      });
    });
  }

  document.documentElement.classList.add("has-custom-cursor");

  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);
  ctx.font = `500 11px "JetBrains Mono", monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  let angle = 0;
  let speed = BASE_SPEED;
  let targetSpeed = BASE_SPEED;
  let shown = false;

  const xTo = gsap.quickTo(wrap, "x", { duration: 0.13, ease: "power3.out" });
  const yTo = gsap.quickTo(wrap, "y", { duration: 0.13, ease: "power3.out" });

  gsap.ticker.add((time, dt) => {
    speed += (targetSpeed - speed) * 0.07;
    angle += speed * (dt / 1000);
    ctx.clearRect(0, 0, SIZE, SIZE);
    const n = GLYPHS.length;
    for (let i = 0; i < n; i++) {
      const a = angle + (i / n) * Math.PI * 2;
      const x = SIZE / 2 + Math.cos(a) * RADIUS;
      const y = SIZE / 2 + Math.sin(a) * RADIUS;
      ctx.fillStyle = ringColor(i / (n - 1));
      // per-slot shimmer keeps brightness evenly distributed around the ring
      ctx.globalAlpha = 0.55 + 0.45 * Math.sin(i * 2.1 + time * 2);
      ctx.fillText(GLYPHS[i], x, y);
    }
    // faint dot marking the exact pointer hotspot
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = "#f2f0fb";
    ctx.beginPath();
    ctx.arc(SIZE / 2, SIZE / 2, 1.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  });

  window.addEventListener(
    "pointermove",
    (e) => {
      if (!shown) {
        shown = true;
        gsap.to(wrap, { opacity: 1, duration: 0.25 });
        ghosts.forEach((g) => gsap.to(g.el, { opacity: g.alpha, duration: 0.4 }));
      }
      xTo(e.clientX);
      yTo(e.clientY);
      ghosts.forEach((g) => {
        g.x(e.clientX);
        g.y(e.clientY);
      });
    },
    { passive: true }
  );

  // slow to a tenth over interactive elements
  document.addEventListener("pointerover", (e) => {
    if (e.target.closest?.(HOVER_SELECTOR)) {
      targetSpeed = SLOW_SPEED;
      wrap.classList.add("is-hover");
    }
  });
  document.addEventListener("pointerout", (e) => {
    if (
      e.target.closest?.(HOVER_SELECTOR) &&
      !e.relatedTarget?.closest?.(HOVER_SELECTOR)
    ) {
      targetSpeed = BASE_SPEED;
      wrap.classList.remove("is-hover");
    }
  });

  document.documentElement.addEventListener("mouseleave", () => {
    gsap.to(wrap, { opacity: 0, duration: 0.2 });
    ghosts.forEach((g) => gsap.to(g.el, { opacity: 0, duration: 0.2 }));
    shown = false;
  });
}
