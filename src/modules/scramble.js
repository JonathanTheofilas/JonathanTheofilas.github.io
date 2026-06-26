// Text-scramble on hover for [data-scramble]. Hand-rolled glyph cycler, no
// paid GSAP plugin. Skipped under reduced motion.

import { reducedMotion } from "./device.js";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/<>_=*";

function scramble(el) {
  const final = el.dataset.text;
  const total = 16; // frames
  let frame = 0;
  const start = performance.now();
  const settle = final.split("").map((_, i) => 3 + i * 1.2);

  function tick(now) {
    frame = (now - start) / 26;
    let out = "";
    let done = 0;
    for (let i = 0; i < final.length; i++) {
      if (frame >= settle[i]) {
        out += final[i];
        done++;
      } else if (final[i] === " ") {
        out += " ";
        done++;
      } else {
        out += CHARS[(Math.random() * CHARS.length) | 0];
      }
    }
    el.textContent = out;
    if (done < final.length) {
      el._raf = requestAnimationFrame(tick);
    } else {
      el.textContent = final;
    }
  }
  cancelAnimationFrame(el._raf);
  requestAnimationFrame(tick);
}

export function initScramble() {
  if (reducedMotion) return;
  document.querySelectorAll("[data-scramble]").forEach((el) => {
    el.dataset.text = el.textContent;
    el.addEventListener("pointerenter", () => scramble(el));
  });
}
