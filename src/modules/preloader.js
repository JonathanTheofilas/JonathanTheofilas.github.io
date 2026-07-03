// Load-in: Matrix-style rain — columns of the artwork's glyph vocabulary
// scrolling frantically down the whole page, colored along the indigo->coral
// gradient. Once assets are ready (and a minimum showtime has passed) the
// overlay fades out over the still-running rain, then `preloader:done` tells
// the hands to enter from the edges.
//
// Deliberately GSAP-free: the rain is its own rAF loop and the fade is a CSS
// transition + setTimeout, so the load-in can never be stranded by a paused
// animation ticker (e.g. hidden tabs).

import { reducedMotion } from "./device.js";
import { getLenis } from "./scroll.js";

const GATE_TIMEOUT_MS = 2500;
const MIN_SHOW_MS = 1400;
const FADE_MS = 550;
const PITCH = 14; // px per rain column
const GLYPHS = "#%*+-=:·/\\<>x01*".split("");
const INDIGO = [70, 60, 239];
const CORAL = [250, 96, 79];

const mix = (t) =>
  `rgb(${INDIGO.map((v, i) => Math.round(v + (CORAL[i] - v) * t)).join(",")})`;

function startRain(canvas) {
  const ctx = canvas.getContext("2d");
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let W, H, drops;

  function setup() {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.ceil(W * dpr);
    canvas.height = Math.ceil(H * dpr);
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = "#0a0813";
    ctx.fillRect(0, 0, W, H);
    ctx.font = '600 13px "JetBrains Mono", monospace';
    ctx.textBaseline = "top";
    const cols = Math.ceil(W / PITCH);
    drops = Array.from({ length: cols }, (_, i) => ({
      x: i * PITCH,
      y: Math.random() * H, // scattered so the rain is instantly busy
      speed: 500 + Math.random() * 900,
      color: mix(i / Math.max(1, cols - 1)),
    }));
  }
  setup();
  window.addEventListener("resize", setup);

  let raf = 0;
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    // translucent wash leaves fading trails behind the heads
    ctx.fillStyle = "rgba(10, 8, 19, 0.22)";
    ctx.fillRect(0, 0, W, H);
    for (const d of drops) {
      const g = GLYPHS[(Math.random() * GLYPHS.length) | 0];
      // bright head + a dimmer chaser one cell up, in the column's hue
      ctx.fillStyle = "#f2f0fb";
      ctx.fillText(g, d.x, d.y);
      ctx.fillStyle = d.color;
      ctx.fillText(GLYPHS[(Math.random() * GLYPHS.length) | 0], d.x, d.y - 16);
      d.y += d.speed * dt;
      if (d.y > H + 40) {
        d.y = -20 - Math.random() * H * 0.25;
        d.speed = 500 + Math.random() * 900;
      }
    }
    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener("resize", setup);
  };
}

function finish(el) {
  el.style.display = "none";
  document.documentElement.classList.remove("is-loading");
  getLenis()?.start();
  window.dispatchEvent(new CustomEvent("preloader:done"));
}

function fadeOut(el, ms, done) {
  el.style.transition = `opacity ${ms}ms ease-out`;
  el.style.opacity = "0";
  el.style.pointerEvents = "none";
  setTimeout(done, ms + 60);
}

export function initPreloader({ ready = Promise.resolve() } = {}) {
  const el = document.getElementById("preloader");
  if (!el) {
    window.dispatchEvent(new CustomEvent("preloader:done"));
    return;
  }
  getLenis()?.stop();

  if (reducedMotion) {
    fadeOut(el, 150, () => finish(el));
    return;
  }

  const canvas = el.querySelector("canvas");
  const stopRain = startRain(canvas);
  const started = performance.now();

  const gate = Promise.race([
    Promise.all([document.fonts?.ready || Promise.resolve(), ready]),
    new Promise((res) => setTimeout(res, GATE_TIMEOUT_MS)),
  ]);

  // never strand the user behind the overlay, even if a prerender step throws
  gate.catch(() => {}).then(() => {
    const wait = Math.max(0, MIN_SHOW_MS - (performance.now() - started));
    setTimeout(() => {
      fadeOut(el, FADE_MS, () => {
        stopRain();
        finish(el);
      });
    }, wait);
  });
}
