// Capability flags. Every interaction module reads from here so fallbacks
// are decided in exactly one place.

const mq = (q) => window.matchMedia(q);

export const reducedMotion = mq("(prefers-reduced-motion: reduce)").matches;

// Fine pointer + hover => safe to use the custom cursor, magnetic, hover effects.
export const finePointer =
  mq("(pointer: fine)").matches && mq("(hover: hover)").matches;

export const coarsePointer = !finePointer;

// Master switch for the heavy interactive layer.
export const interactive = !reducedMotion && finePointer;

// One quality knob (variant-cycle rate, cursor trail) so scaling stays central.
const lowMem = (navigator.deviceMemory || 8) <= 4;
export const quality = coarsePointer || lowMem ? "low" : "high";

export const device = {
  reducedMotion,
  finePointer,
  coarsePointer,
  interactive,
};
