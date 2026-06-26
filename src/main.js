import "./styles/index.css";
import "lenis/dist/lenis.css";

import { initScroll } from "./modules/scroll.js";
import { initSections } from "./modules/sections.js";
import { initReveal } from "./modules/reveal.js";
import { initSkew } from "./modules/skew.js";
import { initCursor } from "./modules/cursor.js";
import { initMagnetic } from "./modules/magnetic.js";
import { initScramble } from "./modules/scramble.js";
import { initGL } from "./gl/index.js";

document.documentElement.classList.add("js-ready");

const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

function boot() {
  // Scroll first: ScrollTrigger + the Lenis ticker bridge must be live before
  // reveals/skew/sections create or read triggers.
  initScroll();
  initSections();
  initReveal();
  initSkew();

  // Interaction layer (each no-ops on coarse pointer / reduced motion).
  initCursor();
  initMagnetic();
  initScramble();

  // WebGL (no-ops if unsupported / reduced motion).
  initGL();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
