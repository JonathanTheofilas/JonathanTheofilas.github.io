import "./styles/index.css";
import "lenis/dist/lenis.css";

import { initScroll } from "./modules/scroll.js";
import { initSections } from "./modules/sections.js";
import { initReveal } from "./modules/reveal.js";
import { initSkew } from "./modules/skew.js";
import { initCursor } from "./modules/cursor.js";
import { initMagnetic } from "./modules/magnetic.js";
import { initScramble } from "./modules/scramble.js";
import { initTiles } from "./modules/tiles.js";
import { initPreloader } from "./modules/preloader.js";
import { initHands } from "./hands/index.js";

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
  initTiles();

  // Hero hands + the load-in sequence. The preloader waits for the hands to
  // prerender (with a timeout) before lifting.
  const hands = initHands();
  initPreloader({ ready: hands.ready });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
