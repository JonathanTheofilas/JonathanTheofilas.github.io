import { projects } from "../content/projects";
import { span } from "../components/SectionContainer";
import "./Projects.css";

/**
 * The works index.
 *
 * alche.studio-lean: the projects read as a numbered catalogue you can scan at
 * a glance — every entry visible at once, hairline-ruled — rather than a reel
 * that reveals one at a time. Scrolling walks a highlight down the index and
 * crossfades the detail readout beside it; the GL camera keeps travelling
 * underneath. Kept deliberately distinct from Experience, which stays a
 * one-at-a-time contrast list so the two big scroll sections don't read as one.
 *
 * Each Mii's body colour survives as its row marker — chosen per-project back
 * when each entry was a character in the plaza.
 */
export function Projects({ progress }: { progress: number }) {
  const n = projects.length;
  const p = span(progress, 0.06, 0.94);
  const active = Math.min(n - 1, Math.floor(p * n + 0.0001));
  const cur = projects[active];

  return (
    <div className="pj">
      <div className="pj__head">
        <h2 className="pj__heading chrome">Selected work</h2>
        <p className="pj__note meta">Things built to find out how they work.</p>
      </div>

      <ol className="pj__list">
        {projects.map((proj, i) => {
          const isActive = i === active;
          return (
            <li
              key={proj.id}
              className={`pj__row ${isActive ? "is-active" : ""}`}
              aria-current={isActive || undefined}
            >
              <span className="pj__num chrome">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span
                className="pj__dot"
                aria-hidden="true"
                style={{ background: proj.mii.color }}
              />
              <h3 className="pj__title display">
                {proj.repo ? (
                  <a href={proj.repo} target="_blank" rel="noreferrer">
                    {proj.name}
                  </a>
                ) : (
                  proj.name
                )}
              </h3>
            </li>
          );
        })}
      </ol>

      <div className="pj__detail">
        {/* keyed on the active id → remounts and fades on change (opacity only) */}
        <div className="pj__detail_inner" key={cur.id}>
          <span className="pj__detail_label chrome">
            {String(active + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
            {" · "}
            {cur.name}
          </span>
          <p className="pj__detail_blurb">{cur.blurb}</p>
          <ul className="pj__tags" aria-label="Stack">
            {cur.tags.map((t) => (
              <li key={t} className="pj__tag chrome">
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
