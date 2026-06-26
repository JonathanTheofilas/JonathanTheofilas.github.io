// Smooth scroll (Lenis) bridged to GSAP ScrollTrigger through a single ticker.
// Exposes a live scroll velocity for the WebGL layer to read.

import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { reducedMotion } from "./device.js";

gsap.registerPlugin(ScrollTrigger);

export const scrollState = { velocity: 0, progress: 0 };

let lenis = null;

export function initScroll() {
  lenis = new Lenis({
    duration: 1.1,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: !reducedMotion,
    syncTouch: false,
  });

  lenis.on("scroll", (e) => {
    ScrollTrigger.update();
    // normalize velocity into a small range for shader uniforms
    scrollState.velocity = e.velocity || 0;
    scrollState.progress = e.progress || 0;
  });

  // one RAF for both Lenis and GSAP
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  // anchor links -> Lenis scrollTo
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (ev) => {
      const id = a.getAttribute("href");
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      ev.preventDefault();
      lenis.scrollTo(target, { offset: -10, duration: 1.2 });
    });
  });

  return lenis;
}

export function getLenis() {
  return lenis;
}
