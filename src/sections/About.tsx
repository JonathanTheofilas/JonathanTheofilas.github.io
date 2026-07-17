import { site } from "../content/site";
import { span, easeOut } from "../components/SectionContainer";
import "./About.css";

/**
 * About + skills. A smaller budget than the work sections on purpose — this is
 * context, not the pitch. Paragraphs stagger in against scroll progress rather
 * than firing on an IntersectionObserver, so the reveal tracks the scroll
 * exactly and reverses cleanly when you scroll back up.
 */
export function About({ progress }: { progress: number }) {
  const { heading, body } = site.about;

  return (
    <div className="ab">
      <div className="ab__head">
        <h2 className="ab__heading chrome">{heading}</h2>
      </div>

      <div className="ab__body">
        {body.map((para, i) => {
          // stagger: each paragraph owns a window, offset by index
          const start = 0.08 + i * 0.12;
          const enter = easeOut(span(progress, start, start + 0.3));
          return (
            <p
              key={i}
              className="ab__para"
              style={{
                opacity: enter,
                transform: `translateY(${(1 - enter) * 16}px)`,
              }}
            >
              {para}
            </p>
          );
        })}

        <div
          className="ab__skills"
          style={{ opacity: easeOut(span(progress, 0.4, 0.72)) }}
        >
          <h3 className="ab__skills_label chrome">Stack</h3>
          <ul className="ab__skills_list">
            {site.skills.map((skill, i) => {
              const enter = easeOut(
                span(progress, 0.44 + i * 0.03, 0.62 + i * 0.03),
              );
              return (
                <li
                  key={skill}
                  className="ab__skill chrome"
                  style={{
                    opacity: enter,
                    transform: `translateY(${(1 - enter) * 10}px)`,
                  }}
                >
                  {skill}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
