import { site } from "../content/site";
import { span, easeOut } from "../components/SectionContainer";
import "./Experience.css";

/**
 * Production work — the strongest content on the site, and the reason this
 * section carries the largest scroll budget of any (see App.tsx).
 *
 * INTERACTION MODEL: scroll-driven. The list is pinned; scrolling moves focus
 * down it. Nothing is clickable and nothing switches on click — the reference
 * site drives its equivalent the same way, and building this as a click-tab
 * would be the expensive mistake.
 *
 * The active item sits at full ink; its neighbours drop to a quarter. Focus is
 * carried by *contrast*, not by movement — the list itself barely travels.
 */
export function Experience({ progress }: { progress: number }) {
  const { items, heading, note } = site.experience;
  const n = items.length;

  // Ease into the section, then hand the remaining budget to the list. The
  // last item gets a beat to sit at full attention before the section ends.
  const p = span(progress, 0.08, 0.92);
  const active = Math.min(n - 1, Math.floor(p * n));

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

      <ol className="xp__list">
        {items.map((item, i) => {
          const isActive = i === active;
          // each item owns 1/n of the list's budget
          const local = span(p, i / n, (i + 1) / n);
          return (
            <li
              key={item.title}
              className={`xp__item ${isActive ? "is-active" : ""}`}
              style={{
                opacity: isActive ? 1 : 0.22,
                transform: `translateY(${isActive ? 0 : 6}px)`,
              }}
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
                style={{ transform: `scaleX(${isActive ? easeOut(local) : 0})` }}
              />
            </li>
          );
        })}
      </ol>
    </div>
  );
}
