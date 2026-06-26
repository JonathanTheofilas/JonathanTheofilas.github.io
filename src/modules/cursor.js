// Custom cursor: a small storm cloud that follows the pointer (the lightning
// bolts spawn from the cursor, so they crackle out of it). Fine pointers only.

import { gsap } from "gsap";
import { finePointer, reducedMotion } from "./device.js";

export function initCursor() {
  if (!finePointer || reducedMotion) return;

  const cloud = document.getElementById("cursor-cloud");
  const label = document.getElementById("cursor-label");
  if (!cloud) return;

  document.body.classList.add("has-custom-cursor");

  const xTo = gsap.quickTo(cloud, "x", { duration: 0.16, ease: "power3.out" });
  const yTo = gsap.quickTo(cloud, "y", { duration: 0.16, ease: "power3.out" });

  let visible = false;
  window.addEventListener(
    "pointermove",
    (e) => {
      if (!visible) {
        visible = true;
        gsap.to(cloud, { autoAlpha: 1, duration: 0.3 });
      }
      xTo(e.clientX);
      yTo(e.clientY);
    },
    { passive: true }
  );

  window.addEventListener("pointerleave", () => {
    visible = false;
    gsap.to(cloud, { autoAlpha: 0, duration: 0.2 });
  });

  document.querySelectorAll("a, button, [data-magnetic]").forEach((el) => {
    el.addEventListener("pointerenter", () => {
      cloud.classList.add("is-hover");
      const t = el.getAttribute("data-cursor");
      if (label) {
        label.textContent = t || "";
        cloud.classList.toggle("is-label", !!t);
      }
    });
    el.addEventListener("pointerleave", () => {
      cloud.classList.remove("is-hover", "is-label");
    });
  });
}
