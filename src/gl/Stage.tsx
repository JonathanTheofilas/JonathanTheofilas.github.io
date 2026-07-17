import { Canvas } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import { useAppStore } from "../store/useAppStore";
import { CameraRig } from "./CameraRig";
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
      camera={{ fov: 38, near: 0.1, far: 60, position: [0, 0.3, 9] }}
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
      <fog attach="fog" args={["#0b1030", 6, 38]} />

      {/* Observatory light: cool starlight from above, near-dark below, and
          scenes carrying their own glow. The warm point source lives at the
          finale beacon (FinaleOrb). */}
      <hemisphereLight args={["#9fb2ff", "#141033", 0.55]} />
      <directionalLight position={[5, 7, 4]} intensity={0.7} color="#dfe6ff" />
      <ambientLight intensity={0.3} />

      {/* the sky itself — a star sphere wide enough to hold the whole
          camera path, unfogged, slowly twinkling */}
      <Stars radius={140} depth={60} count={4200} factor={4} fade speed={0.6} />

      <CameraRig />
      <ChannelField />
      <WorkHolograms />
      <ProjectOrbit />
      <Constellation />
      <FinaleOrb />
    </Canvas>
  );
}
