import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Instance, Instances } from "@react-three/drei";
import { Group } from "three";
import { projects } from "../content/projects";
import { mulberry32 } from "./random";

/**
 * The About sky. The camera rises through a slow field of white stars —
 * plus seven coloured ones, one per project, arranged in a loose ring. The
 * work, seen from a distance.
 */
export function Constellation() {
  const group = useRef<Group>(null);

  const stars = useMemo(() => {
    const rnd = mulberry32(1983); // NES year — the other console in the DNA
    return Array.from({ length: 70 }, () => ({
      pos: [
        (rnd() * 2 - 1) * 8,
        (rnd() * 2 - 1) * 4,
        (rnd() * 2 - 1) * 9,
      ] as [number, number, number],
      r: 0.03 + rnd() * 0.05,
    }));
  }, []);

  useFrame((state) => {
    if (group.current)
      group.current.rotation.y =
        Math.sin(state.clock.elapsedTime * 0.05) * 0.15;
  });

  return (
    <group ref={group} position={[0, 1, -93]}>
      <Instances limit={stars.length}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#bcd9ee"
          emissiveIntensity={0.6}
          roughness={0.4}
        />
        {stars.map((s, i) => (
          <Instance key={i} position={s.pos} scale={s.r} />
        ))}
      </Instances>

      {projects.map((p, i) => {
        const a = (i / projects.length) * Math.PI * 2;
        return (
          <mesh
            key={p.id}
            position={[Math.cos(a) * 3.4, Math.sin(a) * 1.8, -2 - (i % 3)]}
          >
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshStandardMaterial
              color={p.mii.color}
              emissive={p.mii.color}
              emissiveIntensity={0.5}
              roughness={0.3}
            />
          </mesh>
        );
      })}

      {/* small planetoids drifting through the garden — grass and ice caps */}
      <mesh position={[-4.6, 0.4, -5]} rotation={[0.3, 0, -0.2]}>
        <sphereGeometry args={[0.55, 24, 24]} />
        <meshStandardMaterial color="#4a6fa5" roughness={0.5} />
        <mesh>
          <sphereGeometry args={[0.56, 20, 10, 0, Math.PI * 2, 0, 0.8]} />
          <meshStandardMaterial color="#7fce6a" roughness={0.6} />
        </mesh>
      </mesh>
      <mesh position={[4.9, 2.4, -9]} rotation={[-0.2, 0, 0.4]}>
        <sphereGeometry args={[0.38, 20, 20]} />
        <meshStandardMaterial color="#8f6bc7" roughness={0.5} />
        <mesh>
          <sphereGeometry args={[0.39, 18, 9, 0, Math.PI * 2, 0, 0.7]} />
          <meshStandardMaterial color="#e8f4ff" roughness={0.55} />
        </mesh>
      </mesh>
    </group>
  );
}
