// Scroll-reveal via IntersectionObserver + CSS transitions.
// Deliberately NOT rAF/GSAP-driven so the visible end-state is always reached
// (background-tab loads, reduced motion, or a dead ticker never hide content).

import { reducedMotion } from "./device.js";

export function initReveal() {
  const els = Array.from(document.querySelectorAll(".reveal"));

  if (reducedMotion || !("IntersectionObserver" in window)) {
    els.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const io = new IntersectionObserver(
    (entries, obs) => {
      // stagger within a single batch of entries
      let i = 0;
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target;
        el.style.transitionDelay = `${(i % 6) * 70}ms`;
        el.classList.add("is-visible");
        obs.unobserve(el);
        i++;
      }
    },
    { threshold: 0.12, rootMargin: "0px 0px -7% 0px" }
  );

  els.forEach((el) => io.observe(el));
}
