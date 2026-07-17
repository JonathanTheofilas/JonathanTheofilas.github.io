import { site } from "../content/site";
import { span, easeOut } from "../components/SectionContainer";
import "./Hero.css";

/**
 * The opening screen. One viewport of budget — the hero is not the product,
 * the work is. It says who and where, then gets out of the way.
 *
 * As you scroll through it the whole thing lifts and dissolves, so the beat
 * that follows arrives on a clean field rather than sliding over a crowded one.
 */
export function Hero({ progress }: { progress: number }) {
  const exit = easeOut(span(progress, 0.15, 1));

  return (
    <div className="hero">
      <div
        className="hero__inner"
        style={{
          opacity: 1 - exit,
          transform: `translateY(${exit * -40}px)`,
        }}
      >
        <p className="hero__eyebrow chrome">{site.location}</p>

        <h1 className="hero__name display">{site.name}</h1>

        <p className="hero__tagline chrome">{site.tagline}</p>
      </div>

      <div className="hero__hint chrome" style={{ opacity: 1 - easeOut(span(progress, 0, 0.4)) }}>
        <span>Scroll</span>
        <span className="hero__rule" aria-hidden="true" />
      </div>
    </div>
  );
}
