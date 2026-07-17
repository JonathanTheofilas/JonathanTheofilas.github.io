import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Color, DoubleSide, InstancedMesh, Object3D } from "three";
import { sectionProgress } from "../components/SectionContainer";
import { bayerRank, bayerShade } from "./dither";
import { rampOf } from "./gemPalettes";

/**
 * The Wave — the hero. A pixel ocean: ~4,200 flat cells rolling in layered
 * sines under the type, coloured by their own height quantized through the
 * Bayer matrix into a gemstone ramp. Every ten seconds it dither-dissolves
 * into the next gem.
 *
 * It reacts to the scroll: the swell calms as the hero plays out, and during
 * the flight to the first section the whole ocean disassembles in Bayer
 * order while the camera passes over it — the site's opening image is also
 * its first dither-out.
 */

const COLS = 96;
const ROWS = 44;
const COUNT = COLS * ROWS;
const XP = 0.22; // cell pitch across
const ZP = 0.5; // cell pitch into the distance
const SIZE = 0.18;
const RAMP_SECONDS = 10;

const WAVE_RAMPS = ["Sapphire", "Soul Gem", "Emerald Shard", "Amethyst", "Gem Cave"];

export function DitherWave() {
  const mesh = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);

  const ramps = useMemo(
    () => WAVE_RAMPS.map((n) => rampOf(n).map((h) => new Color(h))),
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

  useFrame((state) => {
    const m = mesh.current;
    if (!m) return;
    const Ph = sectionProgress["hero"] ?? 0;
    const Pw = sectionProgress["work-intro"] ?? 0;
    if (Pw >= 0.999) {
      m.visible = false;
      return;
    }
    m.visible = true;

    const t = state.clock.elapsedTime;

    // gem cycle: dissolve out, swap ramp, dissolve in
    const slot = (t / RAMP_SECONDS) | 0;
    const sweep = t - slot * RAMP_SECONDS;
    let gate = 1;
    if (sweep < 0.4) gate = 1 - sweep / 0.4;
    else if (sweep < 0.8) gate = (sweep - 0.4) / 0.4;

    // full at page top; disassembles across the flight to section one
    const vis = (1 - Pw) * gate;
    // the swell calms as the hero plays out
    const amp = 0.55 * (1 - Ph * 0.45);

    const ramp = ramps[slot % ramps.length];
    const shades = ramp.length;
    const x0 = (-(COLS - 1) * XP) / 2;

    for (let i = 0; i < COUNT; i++) {
      const col = i % COLS;
      const row = (i / COLS) | 0;
      const on = ranks[i] < vis;

      const x = x0 + col * XP;
      const z = 8 - row * ZP;
      const y =
        amp *
        (Math.sin(x * 0.5 + t * 1.2) * 0.35 +
          Math.sin(x * 0.23 - t * 0.7) * 0.5 +
          Math.sin(z * 0.6 + t * 0.9) * 0.35);

      dummy.position.set(x, y, z);
      dummy.rotation.set(-Math.PI / 2, 0, 0); // cells lie flat on the water
      dummy.scale.setScalar(on ? 1 : 0);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);

      if (on) {
        // colour by height — crests bright, troughs dark
        const hNorm = Math.min(1, Math.max(0, y / (amp * 1.2) / 2 + 0.5));
        const q = hNorm * (shades - 1) + bayerShade(col, row);
        m.setColorAt(i, ramp[Math.min(shades - 1, Math.max(0, Math.round(q)))]);
      }
    }
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  });

  return (
    <group position={[0, -1.7, 0]}>
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
