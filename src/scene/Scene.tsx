import { Suspense, useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { OrbitControls, PerformanceMonitor } from "@react-three/drei";
import { useAppStore } from "../store/useAppStore";
import { Plaza } from "./Plaza";
import { Miis } from "./Miis";
import { SkillCapsules } from "./SkillCapsules";
import { CameraRig } from "./CameraRig";

/** Everything that lives inside the main Canvas. */
export function Scene() {
  const explore = useAppStore((s) => s.explore);
  const setQuality = useAppStore((s) => s.setQuality);
  const setCursorMode = useAppStore((s) => s.setCursorMode);

  // the plaza is procedural — once this tree has mounted, the scene is ready
  const setSceneReady = useAppStore((s) => s.setSceneReady);
  useEffect(() => {
    setSceneReady(true);
  }, [setSceneReady]);

  const scene = useThree((s) => s.scene);
  useEffect(() => {
    if (import.meta.env.DEV) {
      (window as unknown as Record<string, unknown>).__scene = scene;
    }
  }, [scene]);

  return (
    <>
      <color attach="background" args={["#f4f6f8"]} />
      <fog attach="fog" args={["#f4f6f8", 20, 48]} />

      <PerformanceMonitor
        onDecline={() => setQuality("low")}
        onIncline={() => setQuality("high")}
        flipflops={2}
      >
        <Suspense fallback={null}>
          <Plaza />
          <Miis />
          <SkillCapsules />
        </Suspense>
      </PerformanceMonitor>

      <CameraRig />
      {explore && (
        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.08}
          target={[0, 1.3, 0]}
          minDistance={3.5}
          maxDistance={26}
          maxPolarAngle={1.48}
          minPolarAngle={0.15}
          onStart={() => setCursorMode("grab")}
          onEnd={() => setCursorMode("pointer")}
        />
      )}
    </>
  );
}
