// Custom cursor: a fast dot and a lagging ring, with a small state machine
// (default | hover | label). Only enabled on fine pointers.

import { gsap } from "gsap";
import { finePointer, reducedMotion } from "./device.js";

export function initCursor() {
  if (!finePointer || reducedMotion) return;

  const dot = document.getElementById("cursor-dot");
  const ring = document.getElementById("cursor-ring");
  const label = document.getElementById("cursor-label");
  if (!dot || !ring) return;

  document.body.classList.add("has-custom-cursor");

  const dotX = gsap.quickTo(dot, "x", { duration: 0.12, ease: "power3.out" });
  const dotY = gsap.quickTo(dot, "y", { duration: 0.12, ease: "power3.out" });
  const ringX = gsap.quickTo(ring, "x", { duration: 0.4, ease: "power3.out" });
  const ringY = gsap.quickTo(ring, "y", { duration: 0.4, ease: "power3.out" });

  let visible = false;
  window.addEventListener(
    "pointermove",
    (e) => {
      if (!visible) {
        visible = true;
        gsap.to([dot, ring], { autoAlpha: 1, duration: 0.3 });
      }
      dotX(e.clientX);
      dotY(e.clientY);
      ringX(e.clientX);
      ringY(e.clientY);
    },
    { passive: true }
  );

  window.addEventListener("pointerleave", () => {
    visible = false;
    gsap.to([dot, ring], { autoAlpha: 0, duration: 0.2 });
  });

  // Hover targets
  const hoverSel = "a, button, [data-magnetic]";
  document.querySelectorAll(hoverSel).forEach((el) => {
    el.addEventListener("pointerenter", () => {
      const labelText = el.getAttribute("data-cursor");
      if (labelText) {
        ring.classList.remove("is-hover");
        ring.classList.add("is-label");
        if (label) label.textContent = labelText;
      } else {
        ring.classList.add("is-hover");
      }
    });
    el.addEventListener("pointerleave", () => {
      ring.classList.remove("is-hover", "is-label");
    });
  });
}
