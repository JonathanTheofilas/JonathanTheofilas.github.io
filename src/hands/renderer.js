// Pure drawing for the ASCII hands: prerenders each variant's hand into an
// offscreen canvas once, then crossfades are two drawImage calls. All variants
// share one grid coordinate space (75 rows x ~204 cols), so hands align across
// variants with no per-variant offsets.

import { HANDS } from "../data/hands.js";

export const FONT_STACK = '"JetBrains Mono", ui-monospace, "SFMono-Regular", monospace';

// Advance width of the mono font relative to font size (measured once).
export function measureCharRatio() {
  const ctx = document.createElement("canvas").getContext("2d");
  ctx.font = `${HANDS.fontWeight} 100px ${FONT_STACK}`;
  return ctx.measureText("M").width / 100;
}

// Union bounding box of one side across every variant, so a single visible
// canvas fits all of them.
export function unionBBox(side) {
  let r0 = Infinity, c0 = Infinity, r1 = -Infinity, c1 = -Infinity;
  for (const v of HANDS.variants) {
    const [a, b, c, d] = v[side].bbox;
    if (a < r0) r0 = a;
    if (b < c0) c0 = b;
    if (c > r1) r1 = c;
    if (d > c1) c1 = d;
  }
  return { r0, c0, r1, c1, rows: r1 - r0 + 1, cols: c1 - c0 + 1 };
}

// Draw one variant's hand into an offscreen canvas laid out in `union` space.
// stretchX elongates the artwork horizontally (arms reach further inward) by
// scaling the raster — glyphs widen with it, which reads as a stretch, not a
// layout gap.
export function prerenderHand(variant, side, union, fontSize, charRatio, dpr, stretchX = 1) {
  const cellW = fontSize * charRatio;
  const cellH = fontSize * HANDS.lineHeight;
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(union.cols * cellW * stretchX * dpr);
  canvas.height = Math.ceil(union.rows * cellH * dpr);
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr * stretchX, dpr);
  ctx.font = `${HANDS.fontWeight} ${fontSize}px ${FONT_STACK}`;
  ctx.textBaseline = "top";

  const isBlock = variant.name === "block";
  if (isBlock) ctx.globalAlpha = HANDS.blockAlpha * 1.8; // blocks read too faint at raw 0.25

  for (const [r, c, p, payload] of variant[side].runs) {
    ctx.fillStyle = HANDS.palette[p];
    const x = (c - union.c0) * cellW;
    const y = (r - union.r0) * cellH;
    if (isBlock) {
      ctx.fillRect(x, y, payload * cellW, cellH);
    } else {
      ctx.fillText(payload, x, y + (cellH - fontSize) / 2);
    }
  }
  return canvas;
}

// Composite current/next prerenders onto a visible canvas during a crossfade.
export function compositeMix(ctx, current, next, mix, dpr) {
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.globalAlpha = 1 - mix;
  ctx.drawImage(current, 0, 0);
  if (next && mix > 0) {
    ctx.globalAlpha = mix;
    ctx.drawImage(next, 0, 0);
  }
  ctx.restore();
}
