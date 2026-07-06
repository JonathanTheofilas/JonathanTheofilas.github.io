import { site } from "../content/site";
import { useAppStore } from "../store/useAppStore";
import { sfx } from "../audio/sfx";

/**
 * Text-heavy chapter content rendered as real DOM (crisp, selectable,
 * accessible) in Wii-channel styled cards, faded in by chapter.
 */
export function ChapterPanels() {
  const chapter = useAppStore((s) => s.chapter);
  const bootDone = useAppStore((s) => s.bootPhase === "done");
  const explore = useAppStore((s) => s.explore);
  const activeProject = useAppStore((s) => s.activeProject);

  const show = (i: number) =>
    bootDone && !explore && !activeProject && chapter === i;

  const aboutVisible = show(2);
  const contactVisible = show(4);

  return (
    <>
      <section
        className={`chapter-panel chapter-panel--about ${aboutVisible ? "is-visible" : ""}`}
        aria-hidden={!aboutVisible}
      >
        <h2>{site.about.heading}</h2>
        {site.about.body.map((p) => (
          <p key={p.slice(0, 24)}>{p}</p>
        ))}
        <h2 style={{ marginTop: 18, fontSize: "1.15rem" }}>
          {site.experience.heading}
        </h2>
        <p className="panel-note">{site.experience.note}</p>
        {site.experience.items.map((item) => (
          <div className="exp-item" key={item.title}>
            <h3>{item.title}</h3>
            <p>{item.blurb}</p>
            <div className="tags">
              {item.tags.map((t) => (
                <span key={t} className="wii-pill">
                  {t}
                </span>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section
        className={`chapter-panel chapter-panel--contact ${contactVisible ? "is-visible" : ""}`}
        aria-hidden={!contactVisible}
      >
        <h2>{site.contact.heading}</h2>
        <p>
          {site.name} · {site.location}
        </p>
        <div className="contact-buttons">
          {site.contact.links.map((l) => (
            <a
              key={l.label}
              className="wii-btn wii-btn--primary"
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => sfx.play("click")}
            >
              {l.label} ↗
            </a>
          ))}
        </div>
      </section>
    </>
  );
}
