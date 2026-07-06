import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  CAM_POINTS,
  LOOK_TARGETS,
  CHAPTER_COUNT,
} from "./layout";
import { useAppStore, scrollState } from "../store/useAppStore";
import { scrollApi } from "./scrollApi";
import { miiRegistry } from "./registry";

const smoothstep = (t: number) => t * t * (3 - 2 * t);

/**
 * Drives the camera: a CatmullRom dolly path parameterised by the DOM
 * scroll offset, a focus dolly when a Mii is selected, and a snap-to-chapter
 * fallback for prefers-reduced-motion. Free exploration (OrbitControls)
 * bypasses the rig entirely.
 */
export function CameraRig() {
  const curve = useMemo(
    () => new THREE.CatmullRomCurve3(CAM_POINTS, false, "centripetal", 0.6),
    [],
  );

  const smoothed = useRef(0);
  const lookTarget = useRef(LOOK_TARGETS[0].clone());
  const focusPos = useRef<THREE.Vector3 | null>(null);
  const lastFocusId = useRef<string | null>(null);
  const lastChapter = useRef(-1);

  useFrame(({ camera }, dt) => {
    dt = Math.min(dt, 0.06);
    const app = useAppStore.getState();
    if (app.bootPhase !== "done") {
      camera.position.copy(CAM_POINTS[0]);
      camera.lookAt(LOOK_TARGETS[0]);
      return;
    }
    if (app.explore) return; // OrbitControls owns the camera

    const raw = scrollApi.offset();
    scrollState.offset = raw;

    // publish discrete chapter for the HUD dots / panels
    const chapter = Math.min(
      CHAPTER_COUNT - 1,
      Math.round(raw * (CHAPTER_COUNT - 1)),
    );
    if (chapter !== lastChapter.current) {
      lastChapter.current = chapter;
      app.setChapter(chapter);
    }

    /* focus dolly to the selected Mii */
    if (app.activeProject) {
      const entry = miiRegistry.get(app.activeProject);
      if (entry) {
        if (lastFocusId.current !== app.activeProject) {
          lastFocusId.current = app.activeProject;
          const away = new THREE.Vector3()
            .subVectors(camera.position, entry.pos)
            .setY(0)
            .normalize()
            .multiplyScalar(4.7);
          focusPos.current = entry.pos
            .clone()
            .add(away)
            .add(new THREE.Vector3(0, 2.0, 0));
        }
        const k = 1 - Math.exp(-dt * 3.2);
        camera.position.lerp(focusPos.current!, k);
        lookTarget.current.lerp(
          entry.pos.clone().add(new THREE.Vector3(0, 1.35, 0)),
          k,
        );
        camera.lookAt(lookTarget.current);
        return;
      }
    }
    lastFocusId.current = null;
    focusPos.current = null;

    /* scroll dolly */
    if (app.reducedMotion) {
      // no glide: sit exactly at the nearest chapter viewpoint
      camera.position.copy(CAM_POINTS[chapter]);
      camera.lookAt(LOOK_TARGETS[chapter]);
      return;
    }

    smoothed.current +=
      (raw - smoothed.current) * (1 - Math.exp(-dt * 5.5));
    const o = THREE.MathUtils.clamp(smoothed.current, 0, 1);

    // getPoint (not getPointAt): uniform per segment, so waypoint i sits
    // exactly at offset i/(CHAPTER_COUNT-1) and chapters stay aligned
    const pos = curve.getPoint(o);
    const k = 1 - Math.exp(-dt * 8);
    camera.position.lerp(pos, k);

    const seg = o * (CHAPTER_COUNT - 1);
    const i = Math.min(CHAPTER_COUNT - 2, Math.floor(seg));
    const f = smoothstep(seg - i);
    const desiredLook = new THREE.Vector3().lerpVectors(
      LOOK_TARGETS[i],
      LOOK_TARGETS[i + 1],
      f,
    );
    lookTarget.current.lerp(desiredLook, k);
    camera.lookAt(lookTarget.current);
  });

  return null;
}
