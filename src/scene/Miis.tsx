import { useEffect, useMemo, useRef } from "react";
import { Html } from "@react-three/drei";
import { projects } from "../content/projects";
import { useAppStore } from "../store/useAppStore";
import { sfx } from "../audio/sfx";
import { Mii } from "./Mii";
import { miiRegistry } from "./registry";
import { WANDER_RADIUS } from "./layout";

/**
 * The crowd: one Mii per project, spawned in a loose ring, plus the
 * project channel panel that springs up next to the selected Mii.
 */
export function Miis() {
  const activeProject = useAppStore((s) => s.activeProject);
  const setActiveProject = useAppStore((s) => s.setActiveProject);

  // deterministic loose ring so Miis don't spawn inside each other
  const spawns = useMemo<[number, number][]>(() => {
    return projects.map((_, i) => {
      const a = (i / projects.length) * Math.PI * 2 + 0.7;
      const r = WANDER_RADIUS * (0.45 + 0.5 * ((i * 37) % 10) / 10);
      return [Math.sin(a) * r, Math.cos(a) * r];
    });
  }, []);

  // wave goodbye when a panel closes
  const prevActive = useRef<string | null>(null);
  useEffect(() => {
    if (prevActive.current && !activeProject) {
      const entry = miiRegistry.get(prevActive.current);
      if (entry) entry.goodbyeFor = 1.4;
    }
    prevActive.current = activeProject;
  }, [activeProject]);

  const active = projects.find((p) => p.id === activeProject);
  const activePos = active ? miiRegistry.get(active.id)?.pos : undefined;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && useAppStore.getState().activeProject) {
        setActiveProject(null);
        sfx.play("back");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setActiveProject]);

  return (
    <group>
      {projects.map((p, i) => (
        <Mii key={p.id} project={p} spawn={spawns[i]} />
      ))}

      {active && activePos && (
        <Html
          position={[activePos.x, 1.9, activePos.z]}
          center
          distanceFactor={6.5}
          zIndexRange={[26, 21]}
        >
          {/* screen-space shift so the card sits beside the Mii, camera-relative */}
          <article
            className="project-panel"
            style={{ position: "relative", marginLeft: "68%" }}
            aria-label={active.name}
          >
            <button
              className="wii-btn panel-close"
              aria-label="Close project"
              onClick={() => {
                setActiveProject(null);
                sfx.play("back");
              }}
            >
              ✕
            </button>
            <h2>{active.name}</h2>
            <p className="project-blurb">{active.blurb}</p>
            <div className="tags">
              {active.tags.map((t) => (
                <span key={t} className="wii-pill">
                  {t}
                </span>
              ))}
            </div>
            <div className="project-actions">
              {active.demo && (
                <a
                  className="wii-btn wii-btn--primary"
                  href={active.demo}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => sfx.play("click")}
                >
                  Visit ↗
                </a>
              )}
              {active.repo && (
                <a
                  className="wii-btn"
                  href={active.repo}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => sfx.play("click")}
                >
                  Code ↗
                </a>
              )}
              {!active.repo && !active.demo && (
                <span className="panel-note">
                  Built for RMIT / client work — no public repo.
                </span>
              )}
            </div>
          </article>
        </Html>
      )}
    </group>
  );
}
