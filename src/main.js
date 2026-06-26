import "./styles/index.css";
import "lenis/dist/lenis.css";

import { initScroll } from "./modules/scroll.js";
import { initReveal } from "./modules/reveal.js";
import { initSections } from "./modules/sections.js";
import { initCursor } from "./modules/cursor.js";
import { initMagnetic } from "./modules/magnetic.js";
import { initScramble } from "./modules/scramble.js";

// Content is visible by default; arming this class lets the reveal styles apply.
document.documentElement.classList.add("js-ready");

const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

function boot() {
  // Reveals first (rAF-free, always reaches visible state).
  initReveal();
  // Scroll enhancements.
  initScroll();
  initSections();
  // Interaction layer (each no-ops on coarse pointer / reduced motion).
  initCursor();
  initMagnetic();
  initScramble();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
