// Scroll-velocity skew on text elements — the "physicality" tell. Applied only
// to DOM text (not the .tile boxes) so it never disturbs the WebGL rect sync.

import { gsap } from "gsap";
import { scrollState } from "./scroll.js";
import { reducedMotion } from "./device.js";

export function initSkew() {
  if (reducedMotion) return;

  const els = gsap.utils.toArray(
    ".section__title, .connect__name, .connect__line, .tile__title"
  );
  if (!els.length) return;

  const setters = els.map((el) => gsap.quickSetter(el, "skewY", "deg"));
  let cur = 0;

  gsap.ticker.add(() => {
    const target = gsap.utils.clamp(-6, 6, scrollState.velocity * 0.4);
    cur += (target - cur) * 0.12;
    if (Math.abs(cur) < 0.01) cur = 0;
    for (const s of setters) s(cur);
  });
}
