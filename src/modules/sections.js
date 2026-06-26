// Active-nav indicator (which section you're in). The old hero/works
// choreography is gone with the redesign.

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function initSections() {
  gsap.utils.toArray(".site-nav__links a").forEach((link) => {
    const id = link.getAttribute("href");
    const section = document.querySelector(id);
    if (!section) return;
    ScrollTrigger.create({
      trigger: section,
      start: "top 50%",
      end: "bottom 50%",
      onToggle: (self) =>
        link.setAttribute("aria-current", self.isActive ? "true" : "false"),
    });
  });
}
