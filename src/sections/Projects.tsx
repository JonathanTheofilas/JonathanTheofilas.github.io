import { useEffect, useRef } from "react";
import { projects } from "../content/projects";
import { span, easeOut } from "../components/SectionContainer";
import { sfx } from "../audio/sfx";
import "./Projects.css";

/**
 * The project reel.
 *
 * INTERACTION MODEL: scroll-driven. Where Experience holds still and moves
 * *attention*, this physically travels — the reel slides under a fixed
 * reading line. Two big scroll-driven sections that behaved identically would
 * read as one long section with a heading in the middle.
 *
 * Each Mii's body colour survives here as its project's accent. Nobody who
 * didn't know the plaza will ever notice; the palette was chosen per-project
 * back when each one was a character, and it still is.
 */

const SLOT = 132; // px per project in the reel

export function Projects({ progress }: { progress: number }) {
  const n = projects.length;
  const p = span(progress, 0.06, 0.94);
  const active = Math.min(n - 1, Math.floor(p * n + 0.0001));

  // the reel travels one slot per project, eased so it settles rather than slides
  const travel = easeOut(p) * (n - 1) * SLOT;

  // blip as the reel ticks past each project — see Experience.tsx
  const prevActive = useRef(active);
  useEffect(() => {
    if (prevActive.current !== active) {
      prevActive.current = active;
      sfx.play("blip");
    }
  }, [active]);

  return (
    <div className="pj">
      <div className="pj__head">
        <span className="pj__index chrome">
          {String(active + 1).padStart(2, "0")}
          <span className="pj__index_total"> / {String(n).padStart(2, "0")}</span>
        </span>
        <h2 className="pj__heading chrome">Projects</h2>
        <p className="pj__note meta">Things built to find out how they work.</p>
      </div>

      <div className="pj__viewport">
        {/* the reading line the reel passes under */}
        <span className="pj__line" aria-hidden="true" />

        <ol
          className="pj__reel"
          style={{ transform: `translateY(${-travel}px)` }}
        >
          {projects.map((proj, i) => {
            const isActive = i === active;
            const dist = Math.abs(i - active);
            return (
              <li
                key={proj.id}
                className={`pj__item ${isActive ? "is-active" : ""}`}
                style={{
                  height: SLOT,
                  opacity: isActive ? 1 : Math.max(0.12, 0.34 - dist * 0.08),
                }}
                aria-current={isActive || undefined}
              >
                <span
                  className="pj__dot"
                  aria-hidden="true"
                  style={{ background: proj.mii.color }}
                />

                <div className="pj__body">
                  <h3 className="pj__title display">
                    {proj.repo ? (
                      <a
                        href={proj.repo}
                        target="_blank"
                        rel="noreferrer"
                        tabIndex={isActive ? 0 : -1}
                      >
                        {proj.name}
                      </a>
                    ) : (
                      proj.name
                    )}
                  </h3>

                  <p className="pj__blurb">{proj.blurb}</p>

                  <ul className="pj__tags" aria-label="Stack">
                    {proj.tags.map((t) => (
                      <li key={t} className="pj__tag chrome">
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
