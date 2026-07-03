// Parses ASCIInator HTML exports (per-char colored spans) into src/data/hands.js.
// Usage: node scripts/build-hands.mjs [minimal.html standard.html detailed.html block.html]
// The generated module is committed; this script only needs to run when the
// source artwork changes.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DL = "C:/Users/JonathanTheofilas/Downloads";

// The block export (asciinator_3Jul_003.html) was dropped from the rotation —
// its background-cell rendering didn't hold up next to the glyph variants.
const SOURCES = [
  { name: "minimal", file: `${DL}/asciinator_3Jul_005-minimal.html` },
  { name: "standard", file: `${DL}/asciinator_3Jul_004.html` },
  { name: "detailed", file: `${DL}/asciinator_3Jul_001-detailed.html` },
];
process.argv.slice(2).forEach((p, i) => {
  if (SOURCES[i]) SOURCES[i].file = p;
});

const decodeEntities = (s) =>
  s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");

// ---------- parse one export into a sparse cell grid ----------
function parseExport(html) {
  const pre = html.match(/<pre class="ascii">([\s\S]*?)<\/pre>/);
  if (!pre) throw new Error("no <pre class=\"ascii\"> found");
  const rows = pre[1].split("\n");
  // cells: Map "r,c" -> { char (or null for block), color }
  const cells = [];
  const spanRe = /<span style="([^"]*)">([\s\S]*?)<\/span>|([^<]+)/g;
  rows.forEach((row, r) => {
    let col = 0;
    let m;
    spanRe.lastIndex = 0;
    while ((m = spanRe.exec(row))) {
      if (m[3] !== undefined) {
        // literal text between spans — spaces advance the column
        const lit = decodeEntities(m[3]);
        for (const ch of lit) {
          if (ch !== " " && ch !== "\r") {
            // uncolored glyph: keep it, default color handled later
            cells.push({ r, c: col, char: ch, color: null });
          }
          col++;
        }
        continue;
      }
      const style = m[1];
      const content = decodeEntities(m[2]);
      const colorM = style.match(/(?:^|;)color:(#[0-9a-fA-F]{6})/);
      const bgM = style.match(/background:(#[0-9a-fA-F]{6})/);
      if (bgM && !colorM) {
        // block cell: empty inline-block span, occupies 1ch
        cells.push({ r, c: col, char: null, color: bgM[1].toLowerCase() });
        col += content.length || 1;
      } else if (colorM) {
        for (const ch of content) {
          if (ch !== " ") cells.push({ r, c: col, char: ch, color: colorM[1].toLowerCase() });
          col++;
        }
      } else {
        col += content.length;
      }
    }
  });
  const nrows = rows.length;
  const ncols = Math.max(...cells.map((c) => c.c)) + 1;
  return { cells, nrows, ncols };
}

// ---------- split into two hands via connected components ----------
// fallbackCol: used when the silhouette is fully connected (block variant) —
// a plain vertical split derived from an earlier variant's fingertip gap.
function splitHands({ cells, nrows, ncols }, fallbackCol) {
  const idx = new Map();
  cells.forEach((cell, i) => idx.set(cell.r * ncols + cell.c, i));
  const label = new Array(cells.length).fill(-1);
  let nLabels = 0;
  for (let i = 0; i < cells.length; i++) {
    if (label[i] !== -1) continue;
    // BFS
    const queue = [i];
    label[i] = nLabels;
    while (queue.length) {
      const j = queue.pop();
      const { r, c } = cells[j];
      // generous 8-connectivity with horizontal reach of 2 (charsets leave pinholes)
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
          if (!dr && !dc) continue;
          const k = idx.get((r + dr) * ncols + (c + dc));
          if (k !== undefined && label[k] === -1) {
            label[k] = nLabels;
            queue.push(k);
          }
        }
      }
    }
    nLabels++;
  }
  // component stats
  const comps = Array.from({ length: nLabels }, () => ({ n: 0, sumC: 0 }));
  cells.forEach((cell, i) => {
    comps[label[i]].n++;
    comps[label[i]].sumC += cell.c;
  });
  const ranked = comps
    .map((s, l) => ({ l, ...s, cx: s.sumC / s.n }))
    .sort((a, b) => b.n - a.n);
  const [a, b] = ranked.slice(0, 2);
  if (!b || b.n < a.n * 0.3) {
    if (fallbackCol == null)
      throw new Error("hands are connected and no fallback split column available");
    const left = cells.filter((c) => c.c <= fallbackCol);
    const right = cells.filter((c) => c.c > fallbackCol);
    return { left, right };
  }
  const leftLabel = a.cx < b.cx ? a.l : b.l;
  const rightLabel = a.cx < b.cx ? b.l : a.l;
  const centers = { [leftLabel]: null, [rightLabel]: null };
  const compCx = {};
  ranked.forEach((s) => (compCx[s.l] = s.cx));
  const mid = (compCx[leftLabel] + compCx[rightLabel]) / 2;

  const left = [];
  const right = [];
  cells.forEach((cell, i) => {
    const l = label[i];
    let side;
    if (l === leftLabel) side = left;
    else if (l === rightLabel) side = right;
    else side = compCx[l] < mid ? left : right; // strays join nearest hand
    side.push(cell);
  });
  return { left, right };
}

// ---------- per-hand geometry ----------
function handInfo(cells) {
  let r0 = Infinity, c0 = Infinity, r1 = -Infinity, c1 = -Infinity;
  for (const { r, c } of cells) {
    if (r < r0) r0 = r;
    if (r > r1) r1 = r;
    if (c < c0) c0 = c;
    if (c > c1) c1 = c;
  }
  return { bbox: [r0, c0, r1, c1] };
}

function tipOf(cells, side) {
  // fingertip = extreme column toward the centre gap; tie-break = topmost row
  // (the reaching index finger sits high in the artwork)
  let best = null;
  for (const cell of cells) {
    if (
      !best ||
      (side === "left"
        ? cell.c > best.c || (cell.c === best.c && cell.r < best.r)
        : cell.c < best.c || (cell.c === best.c && cell.r < best.r))
    ) {
      best = cell;
    }
  }
  return [best.r, best.c];
}

// ---------- encode cells as same-color horizontal runs ----------
function encodeRuns(cells, palette, paletteIdx, isBlock) {
  const sorted = [...cells].sort((a, b) => a.r - b.r || a.c - b.c);
  const runs = [];
  let cur = null;
  for (const cell of sorted) {
    const color = cell.color ?? "#ffffff";
    if (!paletteIdx.has(color)) {
      paletteIdx.set(color, palette.length);
      palette.push(color);
    }
    const p = paletteIdx.get(color);
    if (
      cur &&
      cur.r === cell.r &&
      cur.c + cur.len === cell.c &&
      cur.p === p
    ) {
      cur.len++;
      if (!isBlock) cur.text += cell.char;
    } else {
      if (cur) runs.push(cur);
      cur = { r: cell.r, c: cell.c, p, len: 1, text: isBlock ? null : cell.char };
    }
  }
  if (cur) runs.push(cur);
  return runs.map((x) => (isBlock ? [x.r, x.c, x.p, x.len] : [x.r, x.c, x.p, x.text]));
}

// ---------- main ----------
const palette = [];
const paletteIdx = new Map();
const variants = [];

let fallbackCol = null; // midpoint between fingertips, from the first clean split

for (const { name, file } of SOURCES) {
  const html = readFileSync(file, "utf8");
  const grid = parseExport(html);
  const { left, right } = splitHands(grid, fallbackCol);
  const isBlock = name === "block";
  const variant = {
    name,
    rows: grid.nrows,
    cols: grid.ncols,
    left: {
      ...handInfo(left),
      tip: tipOf(left, "left"),
      runs: encodeRuns(left, palette, paletteIdx, isBlock),
    },
    right: {
      ...handInfo(right),
      tip: tipOf(right, "right"),
      runs: encodeRuns(right, palette, paletteIdx, isBlock),
    },
  };
  variants.push(variant);
  if (fallbackCol == null)
    fallbackCol = Math.round((variant.left.tip[1] + variant.right.tip[1]) / 2);
  console.log(
    `${name}: ${grid.nrows}x${grid.ncols}  left ${left.length} cells (tip ${variant.left.tip}), right ${right.length} cells (tip ${variant.right.tip})`
  );
}

const out = `// GENERATED by scripts/build-hands.mjs — do not edit by hand.
// Source: ASCIInator exports (asciinator_3Jul_*.html).
// runs: [row, col, paletteIndex, text|cellCount] — text for glyph variants,
// cell count for the block variant (drawn as filled rects at 0.25 alpha).

export const HANDS = ${JSON.stringify({
  lineHeight: 1.313,
  fontWeight: 600,
  blockAlpha: 0.25,
  palette,
  variants,
})};
`;

const dest = resolve(__dirname, "../src/data/hands.js");
mkdirSync(dirname(dest), { recursive: true });
writeFileSync(dest, out);
console.log(`wrote ${dest} (${(out.length / 1024).toFixed(1)} KB, palette ${palette.length} colors)`);
