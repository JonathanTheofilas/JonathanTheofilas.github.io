import { useEffect, useState } from "react";
import { site } from "../content/site";
import { projects } from "../content/projects";
import { useAppStore, CHAPTERS } from "../store/useAppStore";
import { scrollApi } from "../scene/scrollApi";
import { CHAPTER_COUNT } from "../scene/layout";
import { sfx } from "../audio/sfx";

const CHAPTER_LABELS: Record<(typeof CHAPTERS)[number], string> = {
  arrival: "Arrival",
  projects: "Projects",
  about: "About",
  skills: "Skills",
  contact: "Contact",
};

function WiiClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const iv = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(iv);
  }, []);
  const day = now.toLocaleDateString(undefined, { weekday: "short" });
  const date = now.toLocaleDateString(undefined, {
    day: "numeric",
    month: "numeric",
  });
  const time = now.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
  return (
    <span className="hud-clock" aria-hidden="true">
      {day} {date} · {time}
    </span>
  );
}

export function HUD() {
  const chapter = useAppStore((s) => s.chapter);
  const explore = useAppStore((s) => s.explore);
  const setExplore = useAppStore((s) => s.setExplore);
  const muted = useAppStore((s) => s.muted);
  const toggleMuted = useAppStore((s) => s.toggleMuted);
  const bootDone = useAppStore((s) => s.bootPhase === "done");
  const activeProject = useAppStore((s) => s.activeProject);
  const setActiveProject = useAppStore((s) => s.setActiveProject);
  const setHoveredMii = useAppStore((s) => s.setHoveredMii);

  if (!bootDone) return null;

  const goToChapter = (i: number) => {
    if (explore) setExplore(false);
    if (activeProject) setActiveProject(null);
    scrollApi.toChapter(i, CHAPTER_COUNT);
    sfx.play("click");
  };

  const hint = explore
    ? "drag to look around · scroll to zoom"
    : chapter === 0
      ? "scroll ↓"
      : chapter === 1
        ? "point at a Mii — click to open its project"
        : null;

  return (
    <>
      {/* keyboard navigation (visually hidden until focused) */}
      <nav className="kbd-nav" aria-label="Quick navigation">
        {CHAPTERS.map((c, i) => (
          <button key={c} onClick={() => goToChapter(i)}>
            Go to {CHAPTER_LABELS[c]}
          </button>
        ))}
        {projects.map((p) => (
          <button
            key={p.id}
            onFocus={() => setHoveredMii(p.id)}
            onBlur={() => setHoveredMii(null)}
            onClick={() => {
              scrollApi.toChapter(1, CHAPTER_COUNT);
              setActiveProject(p.id);
              sfx.play("click");
            }}
          >
            Open project: {p.name}
          </button>
        ))}
      </nav>

      <div className="hud-corner hud-corner--tl">
        <WiiClock />
      </div>

      <div className="hud-corner hud-corner--tr">
        <button
          className="hud-chip"
          aria-pressed={!muted}
          onClick={() => {
            toggleMuted();
            // toggling produces its own confirmation blip when unmuting
            if (muted) setTimeout(() => sfx.play("blip"), 60);
          }}
        >
          {muted ? "♪ sound off" : "♪ sound on"}
        </button>
        <button
          className="hud-chip"
          aria-pressed={explore}
          onClick={() => {
            setExplore(!explore);
            sfx.play(explore ? "back" : "click");
          }}
        >
          {explore ? "◉ back to tour" : "◎ explore freely"}
        </button>
      </div>

      {/* Wii-style chapter dots */}
      <nav className="hud-dots" aria-label="Tour chapters">
        {CHAPTERS.map((c, i) => (
          <button
            key={c}
            className={i === chapter && !explore ? "is-active" : ""}
            aria-label={CHAPTER_LABELS[c]}
            aria-current={i === chapter && !explore ? "step" : undefined}
            title={CHAPTER_LABELS[c]}
            onClick={() => goToChapter(i)}
          />
        ))}
      </nav>

      <div className="hud-corner hud-corner--bl">
        <p className="hud-footer">
          <span>{site.footer.copyright}</span>
          <span>{site.footer.disclaimer}</span>
        </p>
      </div>

      <p className={`scroll-hint ${hint ? "" : "is-hidden"}`} aria-hidden="true">
        {hint ?? ""}
      </p>
    </>
  );
}
