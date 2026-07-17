import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { CatmullRomCurve3, MathUtils, Vector3 } from "three";
import { useAppStore } from "../store/useAppStore";
import { sectionProgress } from "../components/SectionContainer";
import { SECTION_VH } from "./timeline";

/**
 * The dolly. One camera path through the whole site, sampled by scroll.
 *
 * The timeline is the sum of every section's progress (sections complete
 * strictly in order, so the sum is a clean 0..N ramp). Waypoint i sits
 * exactly at "section i begins", which means dwell and travel fall out of
 * the waypoint spacing: consecutive waypoints close together = the camera
 * lingers in a scene while its section plays; far apart = a flight between
 * zones. The transition beats ARE the flights.
 *
 * On top of the path: pointer parallax (the Wii cursor's gentle world-tilt,
 * off on touch) and a slow breathing bob, because the Wii Menu was never
 * perfectly still.
 */

// During a dwell (a content section), the camera pans laterally but HOLDS
// ~5–6 units of standoff from its scene — drift the z through the zone and
// the dolly ends up inside the objects, which fill the frame like walls.
// The flights between zones are where the z moves.
const POS: [number, number, number][] = [
  [0, 0.3, 9], //     0 page top — inside the channel field
  [0.5, 0.1, 1.5], //   1 hero done — drifting deeper into the field
  [-1.1, 0, -25], //    2 experience begins — settled before the holograms (-32)
  [1.0, -0.2, -26.5], // 3 experience done — lateral pan, standoff held
  [-1.3, 0.2, -54.5], // 4 projects begin — settled before the orbit (-60.5)
  [1.2, 0.1, -56], //   5 projects done — pan, standoff held; the flight out
  //                      punches through the orb row, a deliberate whoosh
  [0, 1.4, -88], //     6 about done — risen through the constellation
  [0, 0.5, -115], //    7 page bottom — facing the finale orb (-122)
];

// Targets aim BETWEEN the text column and the scene, not at the scene —
// looking straight at an object centres it over the DOM copy. Aiming ~1.5
// units left of each scene parks it in the right third of the frame.
const TGT: [number, number, number][] = [
  [0, 0.1, 0],
  [0, 0, -14],
  [0.7, 0, -32],
  [1.1, -0.1, -32],
  [0.6, 0.1, -60.5],
  [1.0, 0, -60.5],
  [0, 1.2, -97],
  [1.6, 0.3, -122],
];

export function CameraRig() {
  const camera = useThree((s) => s.camera);
  const touch = useAppStore((s) => s.touch);

  const posCurve = useMemo(
    () =>
      new CatmullRomCurve3(
        POS.map((p) => new Vector3(...p)),
        false,
        "centripetal",
        0.5,
      ),
    [],
  );
  const tgtCurve = useMemo(
    () =>
      new CatmullRomCurve3(
        TGT.map((p) => new Vector3(...p)),
        false,
        "centripetal",
        0.5,
      ),
    [],
  );

  const smoothed = useRef(0);
  const pointer = useRef({ x: 0, y: 0 });
  const parallax = useRef({ x: 0, y: 0 });
  const pos = useRef(new Vector3());
  const tgt = useRef(new Vector3());

  useEffect(() => {
    if (touch) return;
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [touch]);

  useFrame((state, dt) => {
    // 0..1 across the whole page — see the header comment.
    const raw =
      SECTION_VH.reduce((acc, [id]) => acc + (sectionProgress[id] ?? 0), 0) /
      SECTION_VH.length;

    // Lenis already smooths the scroll; this damp only eats measurement
    // jitter. Two smoothing stages with big lambdas would feel like driving
    // through syrup.
    smoothed.current = MathUtils.damp(smoothed.current, raw, 6, dt);

    posCurve.getPoint(smoothed.current, pos.current);
    tgtCurve.getPoint(smoothed.current, tgt.current);

    parallax.current.x = MathUtils.damp(
      parallax.current.x,
      pointer.current.x * 0.35,
      3,
      dt,
    );
    parallax.current.y = MathUtils.damp(
      parallax.current.y,
      -pointer.current.y * 0.2,
      3,
      dt,
    );

    const t = state.clock.elapsedTime;
    camera.position.set(
      pos.current.x + parallax.current.x,
      pos.current.y + parallax.current.y + Math.sin(t * 0.6) * 0.04,
      pos.current.z,
    );
    camera.lookAt(tgt.current);
  });

  return null;
}
