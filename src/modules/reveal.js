// "Brought-in" reveals: GSAP ScrollTrigger with `scrub`, so an element's
// position is interpolated by scroll (pulled up + scaled in) rather than a
// time-based fade. Visible by default; the hidden start is opt-in via the
// [data-reveal="armed"] attribute so JS-dead / reduced-motion stays readable.

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { reducedMotion } from "./device.js";

export function initReveal() {
  if (reducedMotion) return; // CSS default keeps everything visible

  gsap.utils.toArray(".reveal").forEach((el, i) => {
    el.setAttribute("data-reveal", "armed");
    gsap.fromTo(
      el,
      { yPercent: 18, scale: 0.96, autoAlpha: 0 },
      {
        yPercent: 0,
        scale: 1,
        autoAlpha: 1,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: `top ${90 - (i % 5) * 2}%`,
          end: "top 56%",
          scrub: 0.6,
        },
      }
    );
  });

  ScrollTrigger.refresh();
}
