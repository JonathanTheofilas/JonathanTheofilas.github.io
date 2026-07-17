import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Color, DoubleSide, InstancedMesh, MathUtils, Object3D } from "three";
import { site } from "../content/site";
import { sectionProgress } from "../components/SectionContainer";
import { bayerRank, bayerShade, hash } from "./dither";
import { rampOf } from "./gemPalettes";

/**
 * The Emblem — the Experience scene. One dithered panel beside the list
 * that changes PATTERN with the active work item, not just colour:
 *
 *   0 telephony — waves travelling across the panel
 *   1 agents    — a spiral swarm circling a centre
 *   2 billing   — bars rising and falling in a sweep
 *
 * Same theatrical grammar as the Monolith: between items the cells dissolve
 * in Bayer order, rows tear loose, and the next pattern assembles. The
 * active index mirrors Experience.tsx exactly.
 */

const COLS = 40;
const ROWS = 26;
const COUNT = COLS * ROWS;
const PITCH = 0.082;
const SIZE = 0.07;

const RAMP_NAMES = ["Sapphire", "Amethyst Shard", "Emerald"];

/** pattern value 0..1 per cell — one function per work item */
function pattern(kind: number, col: number, row: number, t: number): number {
  if (kind === 0) {
    // telephony: waves crossing the panel
    return (
      0.5 +
      0.5 *
        Math.sin(col * 0.38 - t * 2.1 + Math.sin(row * 0.42 + t * 0.6) * 1.4)
    );
  }
  if (kind === 1) {
    // agents: spiral swarm
    const dx = col - COLS / 2;
    const dy = (row - ROWS / 2) * 1.5;
    const rad = Math.sqrt(dx * dx + dy * dy);
    const ang = Math.atan2(dy, dx);
    return 0.5 + 0.5 * Math.sin(rad * 0.65 - t * 2.2 + ang * 3);
  }
  // billing: bars rising in a sweep
  const band = (col / 4) | 0;
  const height = 0.25 + 0.6 * (0.5 + 0.5 * Math.sin(t * 1.5 + band * 0.8));
  const inBar = row / ROWS < height;
  return inBar ? 0.45 + 0.5 * (row / ROWS / height) : 0.04;
}

export function DitherEmblem() {
  const mesh = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);
  const idxF = useRef(0);

  const n = site.experience.items.length;

  const ramps = useMemo(
    () => RAMP_NAMES.map((name) => rampOf(name).map((h) => new Color(h))),
    [],
  );

  const ranks = useMemo(() => {
    const r = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) r[i] = bayerRank(i, i % COLS, (i / COLS) | 0);
    return r;
  }, []);

  useLayoutEffect(() => {
    const m = mesh.current;
    if (!m) return;
    const black = new Color(0, 0, 0);
    for (let i = 0; i < COUNT; i++) {
      dummy.position.set(0, 0, 0);
      dummy.scale.setScalar(0);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
      m.setColorAt(i, black);
    }
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [dummy]);

  useFrame((state, dt) => {
    const m = mesh.current;
    if (!m) return;
    const P = sectionProgress["experience"] ?? 0;
    if (P <= 0.001 || P >= 0.999) {
      m.visible = false;
      return;
    }
    m.visible = true;

    const t = state.clock.elapsedTime;
    // mirror of Experience.tsx: span(progress, 0.08, 0.92)
    const p = Math.min(1, Math.max(0, (P - 0.08) / 0.84));

    // same item-window mapping as the Monolith — assembled through the
    // middle of each item's window, dissolving near the handoff
    idxF.current = MathUtils.damp(idxF.current, p * n, 5, dt);
    const u = Math.min(n - 0.001, idxF.current);
    const disp = Math.floor(u);
    const edgeDist = Math.min(u - disp, disp + 1 - u);
    const trans = 1 - Math.min(1, edgeDist * 4);
    const arrive = Math.min(1, Math.min(P, 1 - P) * 10);
    const vis = (1 - trans) * arrive;

    const ramp = ramps[disp % ramps.length];
    const shades = ramp.length;
    const beat = (t * 2.5) | 0;

    const tear = new Float32Array(ROWS);
    for (let row = 0; row < ROWS; row++) {
      const h = hash(row + beat * 31);
      const idle = h > 0.93 ? (h - 0.93) * 3 : 0;
      tear[row] = (h - 0.5) * (trans * 0.5 + idle * 0.1);
    }

    const x0 = (-(COLS - 1) * PITCH) / 2;
    const y0 = (-(ROWS - 1) * PITCH) / 2;

    for (let i = 0; i < COUNT; i++) {
      const col = i % COLS;
      const row = (i / COLS) | 0;
      const on = ranks[i] < vis;

      dummy.position.set(
        x0 + col * PITCH + tear[row],
        y0 + row * PITCH,
        Math.sin((col / (COLS - 1)) * Math.PI) * 0.16,
      );
      dummy.rotation.set(0, 0, 0);
      dummy.scale.setScalar(on ? 1 : 0);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);

      if (on) {
        const v = pattern(disp % 3, col, row, t);
        const q = v * (shades - 1) + bayerShade(col, row);
        m.setColorAt(i, ramp[Math.min(shades - 1, Math.max(0, Math.round(q)))]);
      }
    }
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;

    m.rotation.y = -0.12 + Math.sin(t * 0.3) * 0.05;
    m.position.y = Math.sin(t * 0.45) * 0.07;
  });

  return (
    <group position={[3.0, 0.1, -32]}>
      <instancedMesh
        ref={mesh}
        args={[undefined as never, undefined as never, COUNT]}
        frustumCulled={false}
      >
        <planeGeometry args={[SIZE, SIZE]} />
        <meshBasicMaterial toneMapped={false} side={DoubleSide} />
      </instancedMesh>
    </group>
  );
}
