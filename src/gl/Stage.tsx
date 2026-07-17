import { Canvas } from "@react-three/fiber";
import { useAppStore } from "../store/useAppStore";
import { CameraRig } from "./CameraRig";
import { DitherWave } from "./DitherWave";
import { DitherEmblem } from "./DitherEmblem";
import { DitherMonolith } from "./DitherMonolith";
import { DitherDust } from "./DitherDust";
import { DitherOrb } from "./DitherOrb";

/**
 * The GL stage — the show. One canvas spanning the whole experience, scenes
 * staged along a camera dolly, the DOM reduced to typography floating above
 * it, on the Wii's luminous white.
 *
 * Every scene speaks one language now: instanced pixel-cells appearing and
 * vanishing in Bayer order, coloured from the gemstone ramps. Nothing on
 * this site fades — things materialize.
 *
 *   hero      The Wave      a pixel ocean rolling under the type
 *   03        The Emblem    one panel, a new pattern per work item
 *   05        The Monolith  the active project as a floating gem slab
 *   06        The Dust      a twinkling field; the Mii colours' last echo
 *   07        The Orb       "look into the orb" — the closing treasure
 *
 * Fog does the scene management: zones sit ~30 units apart, the horizon is
 * ~34, so each piece assembles out of the white as the camera approaches.
 *
 * The scenes are unlit (meshBasicMaterial) — the lights below exist only so
 * any future lit prop doesn't arrive into darkness. pointer-events is none:
 * the DOM owns every interaction. Reduced motion renders no canvas at all.
 */
/** The page colour per theme. Fog and background MUST move together — fog
 *  darker or lighter than the page turns every distant cell into a
 *  silhouette speck (learned on the galaxy branch, kept forever). */
const PAGE = { light: "#f4f6f8", dark: "#0f1217" } as const;

export function Stage() {
  const reducedMotion = useAppStore((s) => s.reducedMotion);
  const quality = useAppStore((s) => s.quality);
  const theme = useAppStore((s) => s.theme);
  const page = PAGE[theme];

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
      <color attach="background" args={[page]} />
      <fog attach="fog" args={[page, 6, 34]} key={page} />

      <hemisphereLight args={["#ffffff", "#dde9f2", 1.1]} />
      <directionalLight position={[5, 7, 4]} intensity={1.3} />
      <ambientLight intensity={0.45} />

      <CameraRig />
      <DitherWave />
      <DitherEmblem />
      <DitherMonolith />
      <DitherDust />
      <DitherOrb />
    </Canvas>
  );
}
