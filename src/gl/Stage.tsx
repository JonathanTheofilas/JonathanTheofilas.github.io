import { Canvas } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import { useAppStore } from "../store/useAppStore";
import { CameraRig } from "./CameraRig";
import { NebulaSky } from "./NebulaSky";
import { Observatory } from "./Observatory";
import { ChannelField } from "./ChannelField";
import { WorkHolograms } from "./WorkHolograms";
import { ProjectOrbit } from "./ProjectOrbit";
import { Constellation } from "./Constellation";
import { FinaleOrb } from "./FinaleOrb";

/**
 * The GL stage — the show. The reference site is architected exactly this
 * way: one canvas spanning the whole experience, scenes staged along a camera
 * dolly, the DOM reduced to typography floating above it. Their void is
 * black; ours is the Wii's luminous white.
 *
 * Fog does the scene management. Zones sit ~30 units apart along the path
 * and the fog horizon is ~34, so each diorama assembles out of the white as
 * the camera approaches and dissolves behind it after — no visibility
 * bookkeeping, just atmosphere.
 *
 * pointer-events is none: the DOM above owns every interaction. The canvas
 * is scenery, never a hit target.
 *
 * Reduced motion renders no canvas at all. A camera dolly you asked not to
 * experience isn't scenery, it's motion sickness — the typographic site
 * stands alone.
 */
export function Stage() {
  const reducedMotion = useAppStore((s) => s.reducedMotion);
  const quality = useAppStore((s) => s.quality);

  if (reducedMotion) return null;

  return (
    <Canvas
      dpr={quality === "high" ? [1, 1.75] : 1}
      /* far plane must clear the sky sphere (r 220). The first star sky was
         placed at r 140 with far at 60 — clipped, never rendered once. */
      camera={{ fov: 38, near: 0.1, far: 400, position: [0, 0.3, 9] }}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: "var(--z-canvas)" as unknown as number,
        pointerEvents: "none",
      }}
      aria-hidden="true"
    >
      <color attach="background" args={["#0b1030"]} />
      {/* fog isolates the scenes; the sky layers all set fog={false}.
          The fog colour matches the eye-level sky — if it's darker than
          the sky behind it, every distant object silhouettes as a dark
          speck instead of dissolving. */}
      <fog attach="fog" args={["#0a0e2c", 8, 44]} />

      {/* Observatory light: cool starlight from above, near-dark below, and
          scenes carrying their own glow (dome windows, the beacons). */}
      <hemisphereLight args={["#9fb2ff", "#141033", 0.55]} />
      <directionalLight position={[5, 7, 4]} intensity={0.7} color="#dfe6ff" />
      <ambientLight intensity={0.34} />

      <NebulaSky />
      <Stars radius={120} depth={40} count={5000} factor={4} fade speed={0.6} />
      <Observatory />

      <CameraRig />
      <ChannelField />
      <WorkHolograms />
      <ProjectOrbit />
      <Constellation />
      <FinaleOrb />
    </Canvas>
  );
}
