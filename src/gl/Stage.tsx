import { Canvas } from "@react-three/fiber";
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
      <color attach="background" args={["#f4f6f8"]} />
      <fog attach="fog" args={["#f4f6f8", 6, 34]} />

      {/* Wii light: white from above, cool blue bounce from below. Bright —
          the void reads as luminous, and white objects must stay white, not
          shade down to grey. */}
      <hemisphereLight args={["#ffffff", "#dde9f2", 1.1]} />
      <directionalLight position={[5, 7, 4]} intensity={1.3} />
      <ambientLight intensity={0.45} />

      <CameraRig />
      <ChannelField />
      <WorkHolograms />
      <ProjectOrbit />
      <Constellation />
      <FinaleOrb />
    </Canvas>
  );
}
