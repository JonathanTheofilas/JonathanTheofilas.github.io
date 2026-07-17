import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Color, DoubleSide, InstancedMesh, MathUtils, Object3D } from "three";
import { projects } from "../content/projects";
import { sectionProgress } from "../components/SectionContainer";
import { BAYER4 } from "./tilePainters";
import { rampOf } from "./gemPalettes";

/**
 * The Monolith — the Projects scene. One floating slab of ~1,300 physical
 * pixel-cells, displaying an animated gem plasma in the ACTIVE project's own
 * gemstone ramp.
 *
 * The theatrical part is the transition. Nothing fades: cells appear and
 * vanish in Bayer order — "dither in, dither out" made spatial. As the DOM
 * reel moves between projects the slab disassembles pixel by pixel, rows
 * tear loose like the modulation-lines preset, and it reassembles as the
 * next gem. Arrival and departure from the section dither the whole thing
 * in and out the same way.
 *
 * Unlit meshBasicMaterial on purpose — it's a pixel-art object hanging in
 * space, not a lit prop.
 */

const COLS = 46;
const ROWS = 28;
const COUNT = COLS * ROWS;
const PITCH = 0.075; // cell centre spacing
const SIZE = 0.064; // quad size (pitch minus gap)

/** one gemstone per project, matched to its Mii colour */
const RAMP_NAMES = [
  "Sapphire", //      sqlite — blue
  "Dirty Gem", //     aws music — amber/pink
  "Rubies", //        booking — red
  "Emerald Mine", //  bpe — olive gold
  "Emerald", //       bug farm — green
  "Amethyst Cave", // gamesight — purple
  "Emerald Shard", // data intelligence — teal
];

const hash = (n: number) => ((Math.sin(n * 12.9898) * 43758.5453) % 1 + 1) % 1;

export function DitherMonolith() {
  const mesh = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);
  const idxF = useRef(0);

  const ramps = useMemo(
    () =>
      projects.map((_, i) =>
        rampOf(RAMP_NAMES[i % RAMP_NAMES.length]).map((h) => new Color(h)),
      ),
    [],
  );

  // per-cell dither rank 0..1 — Bayer, plus a whisper of hash to break ties
  // so cells within one Bayer level don't pop as a block
  const ranks = useMemo(() => {
    const r = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      const col = i % COLS;
      const row = (i / COLS) | 0;
      r[i] = (BAYER4[row % 4][col % 4] + hash(i) * 0.96) / 16;
    }
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
    const P = sectionProgress["projects"] ?? 0;
    if (P <= 0.001 || P >= 0.999) {
      m.visible = false;
      return;
    }
    m.visible = true;

    const t = state.clock.elapsedTime;
    const n = projects.length;
    // mirror of Projects.tsx: span(progress, 0.06, 0.94)
    const p = Math.min(1, Math.max(0, (P - 0.06) / 0.88));

    // Item-window mapping, matching the DOM reel's floor() exactly: project i
    // is active for u in [i, i+1). The slab is fully assembled through the
    // middle of that window and dithers out only near the handoff — keying
    // assembly to exact integer positions instead means it sits half-melted
    // at almost every place a reader actually stops.
    idxF.current = MathUtils.damp(idxF.current, p * n, 5, dt);
    const u = Math.min(n - 0.001, idxF.current);
    const disp = Math.floor(u);
    const edgeDist = Math.min(u - disp, disp + 1 - u); // 0 at edges, .5 mid-window
    const trans = 1 - Math.min(1, edgeDist * 4);
    const arrive = Math.min(1, Math.min(P, 1 - P) * 10); // dither in/out at zone edges
    const vis = (1 - trans) * arrive;
    const ramp = ramps[disp];
    const shades = ramp.length;
    const beat = (t * 2.5) | 0;

    // row tear offsets — strongest mid-transition, a rare flicker at rest
    const tear = new Float32Array(ROWS);
    for (let row = 0; row < ROWS; row++) {
      const h = hash(row + beat * 31);
      const idle = h > 0.93 ? (h - 0.93) * 3 : 0;
      tear[row] = (h - 0.5) * (trans * 0.5 + idle * 0.12);
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
        // a gentle bow toward the viewer, so it reads as an object, not a wall
        Math.sin((col / (COLS - 1)) * Math.PI) * 0.22,
      );
      dummy.scale.setScalar(on ? 1 : 0);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);

      if (on) {
        // same plasma as the gemDither tile painter, sampled per cell
        const v =
          0.5 +
          0.5 *
            Math.sin(col * 0.18 + Math.sin(row * 0.16 + t * 0.9) * 2 + t * 0.6) *
            Math.cos(row * 0.14 - t * 0.5);
        const q = v * (shades - 1) + (BAYER4[row % 4][col % 4] / 16 - 0.5) * 1.4;
        m.setColorAt(i, ramp[Math.min(shades - 1, Math.max(0, Math.round(q)))]);
      }
    }
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;

    m.rotation.y = -0.15 + Math.sin(t * 0.3) * 0.06;
    m.position.y = Math.sin(t * 0.5) * 0.08;
  });

  return (
    <group position={[2.7, -0.1, -60.5]}>
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
