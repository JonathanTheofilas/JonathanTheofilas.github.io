import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, MathUtils, Mesh, MeshPhysicalMaterial } from "three";
import { projects } from "../content/projects";
import { sectionProgress } from "../components/SectionContainer";

/**
 * The project orbs — the Miis' last physical form. Each project keeps the
 * body colour its Mii had in the plaza, now a glossy clearcoat sphere: a
 * channel on a shelf. The row slides under the camera in lockstep with the
 * DOM reel (same span, same math), and the focused orb lifts, brightens and
 * spins — channel-select, without the channel.
 *
 * Staged at x ≈ +2.6, screen right of the reel text.
 */

const SPACING = 1.35;

export function ProjectOrbit() {
  const row = useRef<Group>(null);
  const orbs = useRef<Mesh[]>([]);
  const ring = useRef<Mesh>(null);
  const idxF = useRef(0);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const P = sectionProgress["projects"] ?? 0;
    // mirror of Projects.tsx: span(progress, 0.06, 0.94)
    const p = Math.min(1, Math.max(0, (P - 0.06) / 0.88));
    const target = p * (projects.length - 1);
    idxF.current = MathUtils.damp(idxF.current, target, 5, dt);

    if (row.current) row.current.position.x = -idxF.current * SPACING;

    // the golden orbit ring rides with the focused planet
    if (ring.current) {
      ring.current.position.x = idxF.current * SPACING;
      const active = Math.round(idxF.current);
      const orb = orbs.current[active];
      ring.current.position.y = MathUtils.damp(
        ring.current.position.y,
        (orb?.position.y ?? 0) - 0.02,
        6,
        dt,
      );
      ring.current.scale.setScalar(1 + 0.05 * Math.sin(t * 1.8));
    }

    orbs.current.forEach((m, i) => {
      const d = Math.abs(i - idxF.current);
      const focus = 1 - Math.min(1, d);
      // Orbs more than a slot from focus retreat into the fog and thin out —
      // the GL version of the DOM reel dimming its passed items. Without
      // this, passed orbs trail across the text column at full strength.
      const presence = Math.min(1, Math.max(0, 1 - (d - 1) * 0.5));

      m.scale.setScalar(MathUtils.damp(m.scale.x, 0.72 + 0.55 * focus, 6, dt));
      m.position.y = MathUtils.damp(
        m.position.y,
        focus * 0.55 + Math.sin(t * 0.8 + i) * 0.08,
        6,
        dt,
      );
      m.position.z = MathUtils.damp(
        m.position.z,
        (i % 2) * -0.35 - (1 - presence) * 3,
        4,
        dt,
      );
      m.rotation.y += dt * (0.15 + focus * 0.5);
      const mat = m.material as MeshPhysicalMaterial;
      mat.opacity = MathUtils.damp(mat.opacity, 0.15 + 0.85 * presence, 5, dt);
      mat.emissiveIntensity = MathUtils.damp(
        mat.emissiveIntensity,
        0.05 + focus * 0.3,
        6,
        dt,
      );
    });
  });

  return (
    <group position={[2.6, -0.2, -60.5]}>
      <group ref={row}>
        {projects.map((proj, i) => (
          <mesh
            key={proj.id}
            ref={(m) => {
              if (m) orbs.current[i] = m;
            }}
            position={[i * SPACING, 0, (i % 2) * -0.35]}
          >
            <sphereGeometry args={[0.42, 48, 48]} />
            <meshPhysicalMaterial
              color={proj.mii.color}
              emissive={proj.mii.color}
              emissiveIntensity={0.05}
              roughness={0.25}
              clearcoat={1}
              clearcoatRoughness={0.15}
              transparent
            />
          </mesh>
        ))}

        {/* the focused planet's orbit ring — gold, breathing. Tilted enough
            to open into an ellipse; near edge-on it reads as a stick through
            the planet, not a ring around it. */}
        <mesh ref={ring} rotation={[Math.PI / 2.7, 0, -0.18]}>
          <torusGeometry args={[0.78, 0.016, 8, 72]} />
          <meshBasicMaterial color="#ffd75e" transparent opacity={0.55} />
        </mesh>
      </group>
    </group>
  );
}
