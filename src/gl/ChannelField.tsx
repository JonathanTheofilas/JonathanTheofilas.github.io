import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, RoundedBox } from "@react-three/drei";
import { CanvasTexture, SRGBColorSpace } from "three";
import { sectionProgress } from "../components/SectionContainer";
import { mulberry32 } from "./random";
import { PAINTERS, type PainterStore } from "./tilePainters";

/**
 * The opening scene: the Wii Menu's channel grid, exploded into a 3D field
 * the camera flies through — and every channel is ON. Each tile carries a
 * live canvas screen painting one of the site's motifs (see tilePainters.ts),
 * and switches channel every ~8s with a white flash.
 *
 * The colour discipline holds: the DOM stays monochrome and the channel
 * screens are the only colour on screen — the frame is quiet so the work can
 * be loud, compressed into one scene.
 *
 * Repainting stops once the camera has left the field (work-intro complete);
 * 26 live canvases you can't see are just heat.
 */

const COLORS = [
  "#4a6fa5", // sqlite
  "#e8963a", // aws music
  "#e05d5d", // booking
  "#f0c94a", // bpe
  "#5cb86e", // bug farm
  "#8f6bc7", // gamesight
  "#46b5a4", // data intelligence
  "#4a9fd8", // the site accent
];

const SCREEN_W = 256;
const SCREEN_H = 160;
const CHANNEL_SECONDS = 8;
const REPAINT_INTERVAL = 0.13;

interface TileSpec {
  pos: [number, number, number];
  rot: [number, number, number];
  w: number;
  speed: number;
  phase: number;
  painterBase: number;
  colors: string[];
}

function Tile({ spec }: { spec: TileSpec }) {
  const { tex, ctx } = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = SCREEN_W;
    canvas.height = SCREEN_H;
    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    return { tex: texture, ctx: canvas.getContext("2d") };
  }, []);

  const run = useRef<{ last: number; slot: number; store: PainterStore }>({
    last: -1,
    slot: -1,
    store: {},
  });

  useFrame((state) => {
    if ((sectionProgress["work-intro"] ?? 0) >= 1) return; // field is behind us
    if (!ctx) return;

    const t = state.clock.elapsedTime + spec.phase;
    const r = run.current;
    if (t - r.last < REPAINT_INTERVAL) return;
    r.last = t;

    // channel switching — painter changes every CHANNEL_SECONDS, staggered
    // per tile by its phase; state resets so the ant starts a fresh farm
    const slot = Math.floor(t / CHANNEL_SECONDS);
    if (slot !== r.slot) {
      r.slot = slot;
      r.store = {};
    }
    const painter = PAINTERS[(spec.painterBase + slot) % PAINTERS.length];
    painter(ctx, SCREEN_W, SCREEN_H, t, spec.colors, r.store);

    // the white flash of a channel change
    const sinceSwitch = t - slot * CHANNEL_SECONDS;
    if (sinceSwitch < 0.45) {
      ctx.fillStyle = `rgba(255,255,255,${1 - sinceSwitch / 0.45})`;
      ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
    }
    tex.needsUpdate = true;
  });

  const h = spec.w * 0.62;

  return (
    <Float speed={spec.speed} floatIntensity={0.6} rotationIntensity={0.15}>
      <group position={spec.pos} rotation={spec.rot}>
        <RoundedBox args={[spec.w, h, 0.12]} radius={0.16} smoothness={4}>
          {/* the emissive floor keeps faces that point away from the light
              from shading down to grey — Wii plastic is never dark */}
          <meshStandardMaterial
            color="#fdfefe"
            roughness={0.32}
            emissive="#ffffff"
            emissiveIntensity={0.22}
          />
        </RoundedBox>
        {/* the screen — unlit, like a real display */}
        <mesh position={[0, 0, 0.067]}>
          <planeGeometry args={[spec.w * 0.86, h * 0.82]} />
          <meshBasicMaterial map={tex} toneMapped={false} />
        </mesh>
      </group>
    </Float>
  );
}

export function ChannelField() {
  const tiles = useMemo<TileSpec[]>(() => {
    const rnd = mulberry32(2006); // the year the Wii shipped
    return Array.from({ length: 26 }, () => {
      const pick = () => COLORS[Math.floor(rnd() * COLORS.length)];
      return {
        // Nearest tile sits ~6 units from the camera's opening position —
        // anything closer becomes a wall across the viewport, not a field.
        pos: [(rnd() * 2 - 1) * 8, -1.8 + rnd() * 4.4, 3 - rnd() * 25],
        rot: [(rnd() * 2 - 1) * 0.12, (rnd() * 2 - 1) * 0.35, 0],
        w: 1.5 + rnd() * 1.2,
        speed: 0.5 + rnd() * 0.8,
        phase: rnd() * 20,
        painterBase: Math.floor(rnd() * PAINTERS.length),
        colors: [pick(), pick(), pick()],
      };
    });
  }, []);

  return (
    <group>
      {tiles.map((spec, i) => (
        <Tile key={i} spec={spec} />
      ))}
    </group>
  );
}
