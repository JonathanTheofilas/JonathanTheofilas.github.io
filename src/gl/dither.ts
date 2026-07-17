/**
 * The dither core — shared by every GL set piece. The whole visual language
 * of the site is cells appearing and vanishing in Bayer order: nothing
 * fades, things materialize.
 */

/** 4×4 Bayer matrix — the classic ordered-dither threshold map. */
export const BAYER4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

/** cheap deterministic hash, 0..1 */
export const hash = (n: number) =>
  ((Math.sin(n * 12.9898) * 43758.5453) % 1 + 1) % 1;

/**
 * A cell's dissolve rank, 0..1 — Bayer by grid position, plus a whisper of
 * hash so cells within one Bayer level don't pop as a block.
 */
export const bayerRank = (i: number, col: number, row: number) =>
  (BAYER4[row % 4][col % 4] + hash(i) * 0.96) / 16;

/** Bayer threshold offset for colour quantization, ±0.7 shades. */
export const bayerShade = (col: number, row: number) =>
  (BAYER4[row % 4][col % 4] / 16 - 0.5) * 1.4;
