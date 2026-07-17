import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Color, DoubleSide, Group, InstancedMesh, Object3D } from "three";
import { projects } from "../content/projects";
import { sectionProgress } from "../components/SectionContainer";
import { hash } from "./dither";
import { GEM_RAMPS } from "./gemPalettes";
import { mulberry32 } from "./random";

/**
 * The Dust — the About scene. A drifting field of pixel-cells twinkling in
 * and out on their own slow phases, coloured from the gem ramps' mid-tones.
 * The seven project colours survive as slightly larger squares in a loose
 * ring — the last echo of the Miis, now four pixels wide.
 */

const N = 280;
const COUNT = N + projects.length;

interface Mote {
  pos: [number, number, number];
  size: number;
  phase: number;
  rank: number;
}

export function DitherDust() {
  const mesh = useRef<InstancedMesh>(null);
  const group = useRef<Group>(null);
  const dummy = useMemo(() => new Object3D(), []);

  const motes = useMemo<Mote[]>(() => {
    const rnd = mulberry32(4816); // Bayer's finest hour
    return Array.from({ length: N }, (_, i) => ({
      pos: [
        (rnd() * 2 - 1) * 7,
        (rnd() * 2 - 1) * 3.5,
        (rnd() * 2 - 1) * 8,
      ],
      size: 0.55 + rnd() * 0.9,
      phase: rnd() * Math.PI * 2,
      rank: hash(i * 3 + 1),
    }));
  }, []);

  const colors = useMemo(() => {
    const rnd = mulberry32(1994);
    return motes.map(() => {
      const ramp = GEM_RAMPS[Math.floor(rnd() * GEM_RAMPS.length)].colors;
      // mid-tones — bright ends vanish on the white page, dark ends go sooty
      const idx = Math.floor(ramp.length * (0.4 + rnd() * 0.4));
      return new Color(ramp[Math.min(ramp.length - 1, idx)]);
    });
  }, [motes]);

  const projectColors = useMemo(
    () => projects.map((p) => new Color(p.mii.color)),
    [],
  );

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
    const P = sectionProgress["about"] ?? 0;
    if (P <= 0.001) {
      m.visible = false;
      return;
    }
    m.visible = true;

    const t = state.clock.elapsedTime;
    const arrive = Math.min(1, P * 8) * Math.min(1, (1 - P) * 8 + 0.25);

    for (let i = 0; i < N; i++) {
      const mote = motes[i];
      // each mote twinkles on its own slow breath; arrive gates the field
      const tw = 0.5 + 0.5 * Math.sin(t * 0.55 + mote.phase);
      const on = mote.rank < arrive * (0.3 + 0.55 * tw);
      dummy.position.set(
        mote.pos[0],
        mote.pos[1] + Math.sin(t * 0.3 + mote.phase) * 0.18,
        mote.pos[2],
      );
      dummy.scale.setScalar(on ? mote.size : 0);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
      if (on) m.setColorAt(i, colors[i]);
    }

    // the seven project squares — steadier than the dust, a loose ring
    for (let k = 0; k < projects.length; k++) {
      const i = N + k;
      const a = (k / projects.length) * Math.PI * 2 + t * 0.04;
      const on = hash(k * 17 + 3) < arrive;
      dummy.position.set(
        Math.cos(a) * 3.6,
        Math.sin(a) * 1.7 + Math.sin(t * 0.4 + k) * 0.12,
        -2 - (k % 3),
      );
      dummy.scale.setScalar(on ? 1.9 : 0);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
      if (on) m.setColorAt(i, projectColors[k]);
    }

    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;

    if (group.current)
      group.current.rotation.y = Math.sin(t * 0.05) * 0.15;
  });

  return (
    <group ref={group} position={[0, 1, -93]}>
      <instancedMesh
        ref={mesh}
        args={[undefined as never, undefined as never, COUNT]}
        frustumCulled={false}
      >
        <planeGeometry args={[0.085, 0.085]} />
        <meshBasicMaterial toneMapped={false} side={DoubleSide} />
      </instancedMesh>
    </group>
  );
}
