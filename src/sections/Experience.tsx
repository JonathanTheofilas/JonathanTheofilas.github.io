import { useLayoutEffect, useRef, useState } from "react";
import { site } from "../content/site";
import { span, easeOut } from "../components/SectionContainer";
import "./Experience.css";

/**
 * Production work — the strongest content on the site, and the reason this
 * section carries one of the largest scroll budgets (see timeline.ts).
 *
 * INTERACTION MODEL: scroll-driven. The list is taller than one screen once
 * there are more than a few roles, so it scrolls inside a fixed, feathered
 * viewport as the section plays — every role is reachable and the last one is
 * never clipped. The active role sits at full ink; its neighbours drop back.
 * Kept distinct from Projects, which is a static scannable index.
 */
export function Experience({ progress }: { progress: number }) {
  const { items, heading, note } = site.experience;
  const n = items.length;

  // Ease into the section, then hand the remaining budget to the list.
  const p = span(progress, 0.08, 0.92);
  const active = Math.min(n - 1, Math.floor(p * n));

  // How far the list must travel = its height beyond the viewport. Measured,
  // so it stays correct as roles are added or the viewport resizes.
  const viewRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const [overflow, setOverflow] = useState(0);

  useLayoutEffect(() => {
    const measure = () => {
      const v = viewRef.current;
      const l = listRef.current;
      if (!v || !l) return;
      setOverflow(Math.max(0, l.scrollHeight - v.clientHeight));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [n]);

  const travel = easeOut(p) * overflow;

  return (
    <div className="xp">
      <div className="xp__head">
        <span className="xp__index chrome">
          {String(active + 1).padStart(2, "0")}
          <span className="xp__index_total"> / {String(n).padStart(2, "0")}</span>
        </span>
        <h2 className="xp__heading chrome">{heading}</h2>
        <p className="xp__note meta">{note}</p>
      </div>

      <div className="xp__viewport" ref={viewRef}>
        <ol
          className="xp__list"
          ref={listRef}
          style={{ transform: `translateY(${-travel}px)` }}
        >
          {items.map((item, i) => {
            const isActive = i === active;
            // each item owns 1/n of the list's budget, for its progress bar
            const local = span(p, i / n, (i + 1) / n);
            return (
              <li
                key={item.title}
                className={`xp__item ${isActive ? "is-active" : ""}`}
                style={{ opacity: isActive ? 1 : 0.3 }}
                aria-current={isActive || undefined}
              >
                <h3 className="xp__title display">{item.title}</h3>
                <p className="xp__blurb">{item.blurb}</p>

                <ul className="xp__tags" aria-label="Stack">
                  {item.tags.map((t) => (
                    <li key={t} className="xp__tag chrome">
                      {t}
                    </li>
                  ))}
                </ul>

                {/* progress hairline under the active item */}
                <span
                  className="xp__bar"
                  aria-hidden="true"
                  style={{
                    transform: `scaleX(${isActive ? easeOut(local) : 0})`,
                  }}
                />
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
