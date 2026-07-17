/**
 * Screen content for the channel tiles — each painter draws one "channel"
 * onto a 256×160 canvas, repainted ~8×/s so everything is alive.
 *
 * The kaleidoscope of things is not random clip-art: every channel is one of
 * Jonathan's things rendered as a pattern. A waveform (telephony), a running
 * Langton's Ant (the bug farm — genuinely simulated, not faked), code glyphs,
 * breathing bars (billing reports), an orbiting node graph (agent pipelines),
 * plus rings, dot fields and a true mirrored kaleidoscope to glue it together.
 */

export interface PainterStore {
  grid?: Uint8Array;
  ax?: number;
  ay?: number;
  ad?: number;
  /** gem-dither: the ramp this screen locked onto when its channel opened */
  ramp?: string[];
}

export type Painter = (
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  colors: string[],
  store: PainterStore,
) => void;

import { GEM_RAMPS } from "./gemPalettes";

const TAU = Math.PI * 2;

/** 4×4 Bayer matrix — the classic ordered-dither threshold map. Shared with
 *  ChannelField's channel-switch dissolve. */
export const BAYER4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

const kaleido: Painter = (ctx, w, h, t, c, _store) => {
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);
  const seg = 8;
  for (let s = 0; s < seg; s++) {
    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.rotate((s / seg) * TAU + t * 0.15);
    if (s % 2) ctx.scale(1, -1);
    for (let i = 0; i < 3; i++) {
      const r = 12 + 24 * i + 9 * Math.sin(t * 0.8 + i);
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = c[i % c.length];
      ctx.beginPath();
      ctx.arc(r, 5 + 4 * Math.sin(t + i * 2), 6 + 3 * Math.sin(t * 1.3 + i), 0, TAU);
      ctx.fill();
      ctx.strokeStyle = c[(i + 1) % c.length];
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0.1, 0.7 + 0.3 * Math.sin(t * 0.6 + i));
      ctx.stroke();
    }
    ctx.restore();
  }
  ctx.globalAlpha = 1;
};

const waves: Painter = (ctx, w, h, t, c, _store) => {
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);
  for (let k = 0; k < 3; k++) {
    ctx.strokeStyle = c[k % c.length];
    ctx.lineWidth = 3.5 - k;
    ctx.globalAlpha = 1 - k * 0.25;
    ctx.beginPath();
    for (let x = 0; x <= w; x += 4) {
      const y =
        h / 2 +
        Math.sin(x * 0.035 + t * (1.2 + k * 0.4)) * (18 + k * 8) *
          Math.sin(x * 0.008 + t * 0.3);
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
};

// Langton's Ant, actually running — ~160 real steps per repaint.
const ant: Painter = (ctx, w, h, _t, c, s) => {
  const gw = 64;
  const gh = 40;
  if (!s.grid) {
    s.grid = new Uint8Array(gw * gh);
    s.ax = gw >> 1;
    s.ay = gh >> 1;
    s.ad = 0;
  }
  let ax = s.ax ?? 32;
  let ay = s.ay ?? 20;
  let ad = s.ad ?? 0;
  const grid = s.grid;
  for (let i = 0; i < 160; i++) {
    const idx = ay * gw + ax;
    const on = grid[idx];
    grid[idx] = on ? 0 : 1;
    ad = (ad + (on ? 3 : 1)) % 4;
    ax = (ax + [1, 0, -1, 0][ad] + gw) % gw;
    ay = (ay + [0, 1, 0, -1][ad] + gh) % gh;
  }
  s.ax = ax;
  s.ay = ay;
  s.ad = ad;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = c[0];
  for (let y = 0; y < gh; y++)
    for (let x = 0; x < gw; x++)
      if (grid[y * gw + x]) ctx.fillRect(x * 4, y * 4, 4, 4);
  ctx.fillStyle = c[2 % c.length];
  ctx.fillRect(ax * 4 - 2, ay * 4 - 2, 8, 8);
};

const bars: Painter = (ctx, w, h, t, c, _store) => {
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);
  const n = 9;
  const bw = w / n;
  for (let i = 0; i < n; i++) {
    const v = 0.25 + 0.65 * (0.5 + 0.5 * Math.sin(t * 1.4 + i * 0.7));
    ctx.fillStyle = c[i % c.length];
    ctx.globalAlpha = 0.9;
    ctx.fillRect(i * bw + 3, h - v * (h - 16), bw - 6, v * (h - 16));
  }
  ctx.globalAlpha = 1;
};

const nodes: Painter = (ctx, w, h, t, c, _store) => {
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);
  const pts: [number, number][] = [];
  for (let i = 0; i < 7; i++) {
    const a = t * (0.3 + (i % 3) * 0.15) + (i / 7) * TAU;
    pts.push([
      w / 2 + Math.cos(a) * (30 + (i % 3) * 26),
      h / 2 + Math.sin(a * 1.3) * (22 + (i % 2) * 18),
    ]);
  }
  ctx.strokeStyle = c[0];
  ctx.globalAlpha = 0.35;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
  ctx.closePath();
  ctx.stroke();
  ctx.globalAlpha = 1;
  pts.forEach(([x, y], i) => {
    ctx.fillStyle = c[i % c.length];
    ctx.beginPath();
    ctx.arc(x, y, i === 0 ? 7 : 4.5, 0, TAU);
    ctx.fill();
  });
};

const rings: Painter = (ctx, w, h, t, c, _store) => {
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);
  for (let i = 5; i >= 0; i--) {
    const r = 12 + i * 15 + 6 * Math.sin(t * 1.1 + i * 0.8);
    ctx.strokeStyle = c[i % c.length];
    ctx.lineWidth = 4 + 2 * Math.sin(t + i);
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, Math.max(2, r), 0, TAU);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
};

const dots: Painter = (ctx, w, h, t, c, _store) => {
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);
  for (let y = 0; y < 6; y++)
    for (let x = 0; x < 10; x++) {
      const r = 2 + 5 * (0.5 + 0.5 * Math.sin(t * 1.6 + x * 0.7 + y * 0.9));
      ctx.fillStyle = c[(x + y) % c.length];
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      ctx.arc(14 + x * 25, 16 + y * 26, r, 0, TAU);
      ctx.fill();
    }
  ctx.globalAlpha = 1;
};

const glyphs: Painter = (ctx, w, h, t, c, _store) => {
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);
  const chars = "01{}<>=;+*#$";
  ctx.font = "700 17px monospace";
  const hot = Math.floor(t * 2) % 5;
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 11; col++) {
      const ch = chars[(row * 11 + col + Math.floor(t * (row === hot ? 8 : 0.5))) % chars.length];
      ctx.fillStyle = row === hot ? c[col % c.length] : "#c3ccd4";
      ctx.fillText(ch, 8 + col * 22, 28 + row * 28);
    }
  }
};

// Ordered dithering of an animated plasma field, quantized to a gemstone
// ramp (see gemPalettes.ts — colour data from Studio AAA's Dither Boy
// Gemstones pack). Chunky 4px cells; the ramp is chosen when the channel
// opens and held for its whole run.
const gemDither: Painter = (ctx, w, h, t, _c, s) => {
  if (!s.ramp) {
    const pick = Math.abs(Math.floor(t * 7)) % GEM_RAMPS.length;
    s.ramp = GEM_RAMPS[pick].colors;
  }
  const ramp = s.ramp;
  const n = ramp.length;
  const gw = w >> 2;
  const gh = h >> 2;
  for (let y = 0; y < gh; y++) {
    for (let x = 0; x < gw; x++) {
      // a slow plasma — two travelling waves warped against each other
      const v =
        0.5 +
        0.5 *
          Math.sin(x * 0.18 + Math.sin(y * 0.16 + t * 0.9) * 2 + t * 0.6) *
          Math.cos(y * 0.14 - t * 0.5);
      const q = v * (n - 1) + (BAYER4[y % 4][x % 4] / 16 - 0.5) * 1.4;
      const idx = Math.min(n - 1, Math.max(0, Math.round(q)));
      ctx.fillStyle = ramp[idx];
      ctx.fillRect(x * 4, y * 4, 4, 4);
    }
  }
};

// Glitchy modulation lines — after the "Modulation Lines Demo" preset:
// near-black field, stacked scanlines in one electric colour, lengths
// modulating smoothly with hard random displacements on a slow beat.
const modLines: Painter = (ctx, w, h, t, c, _store) => {
  ctx.fillStyle = "#08080c";
  ctx.fillRect(0, 0, w, h);
  const beat = Math.floor(t * 2.5); // displacement re-rolls on this beat
  const hash = (n: number) =>
    ((Math.sin(n * 12.9898 + beat * 78.233) * 43758.5453) % 1 + 1) % 1;
  for (let row = 0; row < 40; row++) {
    const y = row * 4;
    const lit = Math.sin(row * 0.55 + t * 2.2) > -0.1;
    if (!lit) continue;
    const jitter = hash(row);
    const glitched = jitter > 0.82; // a few rows tear loose each beat
    const offset = glitched ? jitter * 60 - 30 : Math.sin(t * 1.4 + row * 0.3) * 8;
    const len = w * (0.45 + 0.5 * hash(row + 100));
    ctx.fillStyle = glitched ? "#ffffff" : c[1 % c.length];
    ctx.globalAlpha = glitched ? 0.95 : 0.75;
    ctx.fillRect(12 + offset, y + 1, len, glitched ? 3 : 2);
  }
  ctx.globalAlpha = 1;
};

export const PAINTERS: Painter[] = [
  kaleido,
  waves,
  ant,
  bars,
  nodes,
  rings,
  dots,
  glyphs,
  gemDither,
  modLines,
];
