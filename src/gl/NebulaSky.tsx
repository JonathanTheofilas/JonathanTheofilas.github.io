import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Instance, Instances } from "@react-three/drei";
import {
  AdditiveBlending,
  BackSide,
  BufferAttribute,
  CanvasTexture,
  Color,
  Group,
  SphereGeometry,
} from "three";
import { mulberry32 } from "./random";

/**
 * The Galaxy sky — three layers, all original geometry:
 *
 * 1. A vertex-coloured sphere: deep indigo with a brighter galactic band and
 *    a cyan/magenta swirl, the way the game's skyboxes carry colour in the
 *    dark rather than fading to black.
 * 2. Soft additive nebula sprites — distant clouds of purple, cyan, magenta.
 * 3. Star bits: ~130 tiny candy-coloured octahedra drifting through the whole
 *    camera path. Not the sky — the space between you and it.
 */

const SKY_R = 220;

const BIT_COLORS = [
  "#ffd75e",
  "#ff9ad5",
  "#7fe0d8",
  "#a8e06a",
  "#b78aff",
  "#6fa8ff",
];

function useNebulaTexture() {
  return useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 128;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const g = ctx.createRadialGradient(64, 64, 4, 64, 64, 64);
      g.addColorStop(0, "rgba(255,255,255,0.9)");
      g.addColorStop(0.4, "rgba(255,255,255,0.32)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 128, 128);
    }
    return new CanvasTexture(canvas);
  }, []);
}

export function NebulaSky() {
  const skyGeo = useMemo(() => {
    const geo = new SphereGeometry(SKY_R, 48, 32);
    const pos = geo.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    const c = new Color();
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i) / SKY_R;
      const x = pos.getX(i) / SKY_R;
      const z = pos.getZ(i) / SKY_R;
      // The bright band sits HIGH in the sky, above the camera's corridor —
      // the text column lives at eye level, and starlight ink on a bright
      // lavender band is unreadable. Sky drama up top, deep indigo ahead.
      const band = Math.exp(-Math.pow((y - 0.45 + x * 0.1) * 2.6, 2));
      const swirl = 0.5 + 0.5 * Math.sin(Math.atan2(z, x) * 2 + y * 3);
      c.setRGB(
        0.03 + 0.09 * band * swirl + 0.015 * Math.max(0, -y),
        0.045 + 0.07 * band * (1 - 0.4 * swirl),
        0.13 + 0.16 * band + 0.04 * Math.max(0, y),
      );
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    geo.setAttribute("color", new BufferAttribute(colors, 3));
    return geo;
  }, []);

  const nebulaTex = useNebulaTexture();

  const bits = useMemo(() => {
    const rnd = mulberry32(2007); // Galaxy's year
    return Array.from({ length: 130 }, () => ({
      pos: [
        (rnd() * 2 - 1) * 14,
        (rnd() * 2 - 1) * 7,
        12 - rnd() * 147,
      ] as [number, number, number],
      scale: 0.04 + rnd() * 0.07,
      color: BIT_COLORS[Math.floor(rnd() * BIT_COLORS.length)],
      rot: rnd() * Math.PI,
    }));
  }, []);

  const bitField = useRef<Group>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (bitField.current) {
      bitField.current.position.y = Math.sin(t * 0.1) * 0.5;
      bitField.current.rotation.z = Math.sin(t * 0.07) * 0.02;
    }
  });

  return (
    <group>
      {/* the sky itself — unfogged, or the fog would grey it out */}
      <mesh geometry={skyGeo}>
        <meshBasicMaterial vertexColors side={BackSide} fog={false} />
      </mesh>

      {/* nebula clouds */}
      <sprite position={[-60, 26, -70]} scale={[85, 85, 1]}>
        <spriteMaterial
          map={nebulaTex}
          color="#4a2a8a"
          blending={AdditiveBlending}
          opacity={0.34}
          depthWrite={false}
          fog={false}
        />
      </sprite>
      <sprite position={[80, 28, -60]} scale={[70, 70, 1]}>
        <spriteMaterial
          map={nebulaTex}
          color="#1a5a7a"
          blending={AdditiveBlending}
          opacity={0.28}
          depthWrite={false}
          fog={false}
        />
      </sprite>
      <sprite position={[-45, -26, -135]} scale={[90, 90, 1]}>
        <spriteMaterial
          map={nebulaTex}
          color="#6a2a5a"
          blending={AdditiveBlending}
          opacity={0.26}
          depthWrite={false}
          fog={false}
        />
      </sprite>

      {/* star bits — the candy diamonds, drifting */}
      <group ref={bitField}>
        <Instances limit={bits.length}>
          <octahedronGeometry args={[1, 0]} />
          {/* unfogged — a fogged star bit is a navy blob; these are sky */}
          <meshBasicMaterial toneMapped={false} fog={false} />
          {bits.map((b, i) => (
            <Instance
              key={i}
              position={b.pos}
              scale={b.scale}
              rotation={[b.rot, b.rot * 0.7, 0]}
              color={b.color}
            />
          ))}
        </Instances>
      </group>
    </group>
  );
}
