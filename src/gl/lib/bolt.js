// Procedural lightning: a fractal polyline (recursive midpoint displacement)
// with side branches, plus a writer that turns polylines into a flat ribbon
// (triangle list) for thick, glowing additive bolts in the ortho pixel scene.

function midpointDisplace(a, b, displace, detail, out) {
  if (detail <= 0) {
    out.push(b);
    return;
  }
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const off = (Math.random() * 2 - 1) * displace;
  const mid = { x: (a.x + b.x) / 2 + nx * off, y: (a.y + b.y) / 2 + ny * off };
  midpointDisplace(a, mid, displace * 0.5, detail - 1, out);
  midpointDisplace(mid, b, displace * 0.5, detail - 1, out);
}

// Returns an array of polylines: [{ pts:[{x,y}], width }]
export function generateBolt(start, target, opts = {}) {
  const { detail = 5, branchProb = 0.18 } = opts;
  const dist = Math.hypot(target.x - start.x, target.y - start.y);
  const displace = opts.displace ?? dist * 0.22;

  const main = [{ x: start.x, y: start.y }];
  midpointDisplace(start, target, displace, detail, main);
  const polylines = [{ pts: main, width: 1 }];

  const baseAngle = Math.atan2(target.y - start.y, target.x - start.x);
  for (let i = 2; i < main.length - 2; i++) {
    if (Math.random() < branchProb) {
      const p = main[i];
      const dir = baseAngle + (Math.random() * 2 - 1) * 0.9;
      const blen = dist * (0.2 + Math.random() * 0.35);
      const bt = { x: p.x + Math.cos(dir) * blen, y: p.y + Math.sin(dir) * blen };
      const bpts = [{ x: p.x, y: p.y }];
      midpointDisplace(p, bt, displace * 0.5, Math.max(2, detail - 2), bpts);
      polylines.push({ pts: bpts, width: 0.55 });
    }
  }
  return polylines;
}

// Write a polyline as a tapered ribbon (triangle list) into preallocated arrays.
// Returns the next write index (in vertices).
export function writeRibbon(pts, halfWidth, edgeBright, z, pos, aT, aBright, idx) {
  const n = pts.length;
  if (n < 2) return idx;

  const L = new Array(n);
  const R = new Array(n);
  for (let i = 0; i < n; i++) {
    const prev = pts[Math.max(0, i - 1)];
    const next = pts[Math.min(n - 1, i + 1)];
    const dx = next.x - prev.x;
    const dy = next.y - prev.y;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
    const taper = i === 0 || i === n - 1 ? 0.25 : 1.0;
    const hw = halfWidth * taper;
    L[i] = { x: pts[i].x + nx * hw, y: pts[i].y + ny * hw };
    R[i] = { x: pts[i].x - nx * hw, y: pts[i].y - ny * hw };
  }

  for (let i = 0; i < n - 1; i++) {
    const quad = [
      [L[i], -1], [R[i], 1], [L[i + 1], -1],
      [R[i], 1], [R[i + 1], 1], [L[i + 1], -1],
    ];
    for (let k = 0; k < 6; k++) {
      const p = quad[k][0];
      pos[idx * 3] = p.x;
      pos[idx * 3 + 1] = p.y;
      pos[idx * 3 + 2] = z;
      aT[idx] = quad[k][1];
      aBright[idx] = edgeBright;
      idx++;
    }
  }
  return idx;
}
