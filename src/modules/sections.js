// Scroll-driven enhancements (GSAP ScrollTrigger): hero parallax, the
// horizontal "works" track, and the active-nav indicator. These are eye-candy
// layered on top; reveals/visibility are handled rAF-free in reveal.js.

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { reducedMotion } from "./device.js";

export function initSections() {
  if (reducedMotion) return;

  // Hero parallax + fade as it scrolls away
  gsap.to("#hero .hero__inner", {
    yPercent: -12,
    autoAlpha: 0.15,
    ease: "none",
    scrollTrigger: {
      trigger: "#hero",
      start: "top top",
      end: "bottom top",
      scrub: true,
    },
  });

  // Horizontal "in progress" track (wide viewports only)
  const works = document.getElementById("works");
  const track = document.getElementById("works-track");
  if (works && track && window.innerWidth > 760) {
    works.classList.add("works--pinned");
    const amount = () =>
      Math.max(0, track.scrollWidth - window.innerWidth * 0.92);
    gsap.to(track, {
      x: () => -amount(),
      ease: "none",
      scrollTrigger: {
        trigger: works,
        start: "center center",
        end: () => "+=" + amount(),
        pin: true,
        scrub: 0.8,
        invalidateOnRefresh: true,
        anticipatePin: 1,
      },
    });
  }

  // Active-nav indicator
  gsap.utils.toArray(".site-nav__links a").forEach((link) => {
    const id = link.getAttribute("href");
    const section = document.querySelector(id);
    if (!section) return;
    ScrollTrigger.create({
      trigger: section,
      start: "top 45%",
      end: "bottom 45%",
      onToggle: (self) =>
        link.setAttribute("aria-current", self.isActive ? "true" : "false"),
    });
  });
}
