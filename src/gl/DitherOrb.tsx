import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Color, DoubleSide, InstancedMesh, Object3D } from "three";
import { sectionProgress } from "../components/SectionContainer";
import { BAYER4, hash } from "./dither";
import { GEM_RAMPS } from "./gemPalettes";

/**
 * The Orb — the Contact scene, named after the pack's own preset:
 * "look-into-the-orb". A sphere made entirely of dithered pixel-cells.
 *
 * It breathes by threshold: cells exhale away in Bayer order and are drawn
 * back in. Every seven seconds it dither-dissolves into the NEXT gemstone
 * ramp — by the time someone reaches the end of the page it has cycled
 * through amethyst, emerald, ruby... the site's closing treasure.
 *
 * Slow rotation, occasional row tears, no lighting — pure pixel colour.
 */

const ROWS = 24;
const COLS = 44;
const COUNT = ROWS * COLS;
const R = 1.15;
const SIZE = 0.062;
const RAMP_SECONDS = 7;
const TAU = Math.PI * 2;


export function DitherOrb() {
  const mesh = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);

  const ramps = useMemo(
    () => GEM_RAMPS.map((r) => r.colors.map((h) => new Color(h))),
    [],
  );

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

  useFrame((state) => {
    const m = mesh.current;
    if (!m) return;
    const P = sectionProgress["contact"] ?? 0;
    if (P <= 0.001) {
      m.visible = false;
      return;
    }
    m.visible = true;

    const t = state.clock.elapsedTime;
    const arrive = Math.min(1, P * 6);

    // the ramp cycle: dither fully out, swap gem, dither back in
    const slot = (t / RAMP_SECONDS) | 0;
    const sweep = t - slot * RAMP_SECONDS;
    let gate = 1;
    if (sweep < 0.4) gate = 1 - sweep / 0.4;
    else if (sweep < 0.8) gate = (sweep - 0.4) / 0.4;

    const breath = 0.72 + 0.24 * Math.sin(t * 0.7);
    const vis = arrive * gate * breath;

    const ramp = ramps[slot % ramps.length];
    const shades = ramp.length;
    const beat = (t * 2) | 0;

    for (let i = 0; i < COUNT; i++) {
      const col = i % COLS;
      const row = (i / COLS) | 0;
      const on = ranks[i] < vis;

      const theta = ((row + 0.5) / ROWS) * Math.PI;
      // whole-orb rotation lives in the phi term; a torn row slips sideways
      const tearRow = hash(row + beat * 17) > 0.9 ? (hash(row + beat) - 0.5) * 0.5 : 0;
      const phi = (col / COLS) * TAU + t * 0.12 + tearRow;

      dummy.position.set(
        Math.sin(theta) * Math.cos(phi) * R,
        Math.cos(theta) * R,
        Math.sin(theta) * Math.sin(phi) * R,
      );
      dummy.scale.setScalar(on ? 1 : 0);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);

      if (on) {
        const v =
          0.5 +
          0.5 *
            Math.sin(col * 0.3 + Math.sin(row * 0.24 + t * 0.8) * 2 + t * 0.5) *
            Math.cos(row * 0.2 - t * 0.4);
        const q = v * (shades - 1) + (BAYER4[row % 4][col % 4] / 16 - 0.5) * 1.4;
        m.setColorAt(i, ramp[Math.min(shades - 1, Math.max(0, Math.round(q)))]);
      }
    }
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  });

  return (
    <group position={[3.1, 0.35, -122]}>
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
