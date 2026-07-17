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
    </group>
  );
}
