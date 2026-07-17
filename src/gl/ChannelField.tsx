import { useMemo } from "react";
import { Float, RoundedBox } from "@react-three/drei";
import { mulberry32 } from "./random";

/**
 * The opening scene: the Wii Menu's channel grid, exploded into a 3D field
 * the camera flies through. Rounded white slabs, gently bobbing, a few
 * tinted the pale blue of a highlighted channel.
 *
 * The field spans z 6 → -16, and the camera's first two waypoints run
 * z 9 → 1.5 → onward — so the hero plays *inside* the field and the first
 * transition beat is the flight out the far side of it.
 */

interface Panel {
  pos: [number, number, number];
  rot: [number, number, number];
  w: number;
  speed: number;
  tint: string;
}

export function ChannelField() {
  const panels = useMemo<Panel[]>(() => {
    const rnd = mulberry32(2006); // the year the Wii shipped
    return Array.from({ length: 14 }, () => {
      const w = 1.7 + rnd() * 1.0;
      return {
        // Nearest panel sits 7 units from the camera's opening position —
        // anything closer becomes a wall across the viewport, not a field.
        pos: [(rnd() * 2 - 1) * 7, -1.6 + rnd() * 3.8, 2 - rnd() * 20],
        rot: [(rnd() * 2 - 1) * 0.12, (rnd() * 2 - 1) * 0.35, 0],
        w,
        speed: 0.5 + rnd() * 0.8,
        tint: rnd() > 0.72 ? "#e9f4fb" : "#fdfefe",
      };
    });
  }, []);

  return (
    <group>
      {panels.map((p, i) => (
        <Float
          key={i}
          speed={p.speed}
          floatIntensity={0.6}
          rotationIntensity={0.15}
        >
          <RoundedBox
            args={[p.w, p.w * 0.62, 0.12]}
            radius={0.16}
            smoothness={4}
            position={p.pos}
            rotation={p.rot}
          >
            {/* the emissive floor keeps faces that point away from the light
                from shading down to grey — Wii plastic is never dark */}
            <meshStandardMaterial
              color={p.tint}
              roughness={0.32}
              emissive="#ffffff"
              emissiveIntensity={0.22}
            />
          </RoundedBox>
        </Float>
      ))}
    </group>
  );
}
