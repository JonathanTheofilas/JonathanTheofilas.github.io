import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, MathUtils, Mesh, MeshStandardMaterial } from "three";
import { sectionProgress } from "../components/SectionContainer";

/**
 * One abstract hologram per work item, crossfading as the Experience list's
 * focus travels. The proprietary work can't be shown as screenshots, so each
 * system gets a *diagram of itself* instead:
 *
 *   0 telephony      — concentric rings: calls radiating from a core
 *   1 agent platform — a node swarm orbiting a hub
 *   2 billing        — a field of bars breathing in a wave
 *
 * The active index replicates Experience.tsx's math exactly (same span, same
 * floor) so the hologram always matches the highlighted list item.
 *
 * Staged at x ≈ +2 — screen right — so it lives beside the DOM text column,
 * not underneath it.
 */

const ACCENT = "#4a9fd8";

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

export function WorkHolograms() {
  const outer = useRef<Group>(null);
  const g0 = useRef<Group>(null);
  const g1 = useRef<Group>(null);
  const g2 = useRef<Group>(null);
  const groups = [g0, g1, g2];

  const mats = useRef<MeshStandardMaterial[][]>([[], [], []]);
  const vis = useRef([0, 0, 0]);
  const rings = useRef<Mesh[]>([]);
  const nodes = useRef<Mesh[]>([]);
  const bars = useRef<Mesh[]>([]);

  // Collect every material once so the crossfade is a flat array walk, not a
  // scene traversal per frame.
  useEffect(() => {
    [g0, g1, g2].forEach((g, gi) => {
      const list: MeshStandardMaterial[] = [];
      g.current?.traverse((o) => {
        if (o instanceof Mesh) {
          const m = o.material as MeshStandardMaterial;
          m.transparent = true;
          list.push(m);
        }
      });
      mats.current[gi] = list;
    });
  }, []);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const P = sectionProgress["experience"] ?? 0;
    // mirror of Experience.tsx: span(progress, 0.08, 0.92)
    const p = clamp01((P - 0.08) / 0.84);
    const active = P > 0 && P < 1 ? Math.min(2, Math.floor(p * 3)) : -1;

    groups.forEach((g, gi) => {
      const target = gi === active ? 1 : 0;
      vis.current[gi] = MathUtils.damp(vis.current[gi], target, 5, dt);
      const v = vis.current[gi];
      const gr = g.current;
      if (!gr) return;
      gr.visible = v > 0.02;
      gr.scale.setScalar(0.78 + 0.28 * v);
      for (const m of mats.current[gi]) m.opacity = v;
    });

    if (outer.current) outer.current.rotation.y = Math.sin(t * 0.15) * 0.2;

    rings.current.forEach((r, i) => {
      r.rotation.z += dt * (0.2 + i * 0.12);
      r.rotation.y += dt * 0.1;
    });
    nodes.current.forEach((n, i) => {
      const a = t * (0.5 + (i % 4) * 0.12) + (i / 12) * Math.PI * 2;
      const r = i % 2 ? 1.15 : 1.6;
      n.position.set(Math.cos(a) * r, Math.sin(a * 0.9 + i) * 0.45, Math.sin(a) * r);
    });
    bars.current.forEach((b, i) => {
      const h = 0.35 + 0.85 * (0.5 + 0.5 * Math.sin(t * 1.5 + i * 0.55));
      b.scale.y = h;
      b.position.y = h / 2;
    });
  });

  return (
    // Scaled to sit beside the text column, never across it — the swarm's
    // widest orbit must stay inside the right third of the frame.
    <group ref={outer} position={[3.1, 0.1, -32]} scale={0.72}>
      {/* 0 — telephony: concentric rings */}
      <group ref={g0}>
        {[1.0, 1.35, 1.7].map((r, i) => (
          <mesh
            key={r}
            ref={(m) => {
              if (m) rings.current[i] = m;
            }}
            rotation={[Math.PI / 2.4 + i * 0.18, 0, i * 0.5]}
          >
            <torusGeometry args={[r, 0.022, 12, 96]} />
            <meshStandardMaterial
              color={ACCENT}
              emissive={ACCENT}
              emissiveIntensity={0.25}
              roughness={0.4}
            />
          </mesh>
        ))}
        <mesh>
          <sphereGeometry args={[0.24, 32, 32]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive={ACCENT}
            emissiveIntensity={0.5}
            roughness={0.2}
          />
        </mesh>
      </group>

      {/* 1 — agents: a node swarm around a hub */}
      <group ref={g1}>
        <mesh>
          <sphereGeometry args={[0.3, 32, 32]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive={ACCENT}
            emissiveIntensity={0.4}
            roughness={0.25}
          />
        </mesh>
        {Array.from({ length: 12 }, (_, i) => (
          <mesh
            key={i}
            ref={(m) => {
              if (m) nodes.current[i] = m;
            }}
          >
            <sphereGeometry args={[0.09, 16, 16]} />
            <meshStandardMaterial
              color={i % 3 === 0 ? "#ffffff" : ACCENT}
              emissive={ACCENT}
              emissiveIntensity={0.3}
              roughness={0.35}
            />
          </mesh>
        ))}
      </group>

      {/* 2 — billing: bars breathing in a wave */}
      <group ref={g2} position={[0, -0.7, 0]}>
        {Array.from({ length: 15 }, (_, i) => {
          const col = i % 5;
          const row = Math.floor(i / 5);
          return (
            <mesh
              key={i}
              ref={(m) => {
                if (m) bars.current[i] = m;
              }}
              position={[(col - 2) * 0.5, 0, (row - 1) * 0.5]}
            >
              <boxGeometry args={[0.3, 1, 0.3]} />
              <meshStandardMaterial
                color={row === 1 ? "#ffffff" : ACCENT}
                emissive={ACCENT}
                emissiveIntensity={0.15}
                roughness={0.35}
              />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}
