import { site } from "../content/site";
import { span, easeOut } from "../components/SectionContainer";
import "./Contact.css";

/**
 * The closer. Ends on the invitation rather than on a wall of footer chrome —
 * the copyright line is the last thing on the page and the smallest.
 */
export function Contact({ progress }: { progress: number }) {
  const { heading, links } = site.contact;
  const enter = easeOut(span(progress, 0.1, 0.5));

  return (
    <div className="ct">
      <div
        className="ct__inner"
        style={{
          opacity: enter,
          transform: `translateY(${(1 - enter) * 24}px)`,
        }}
      >
        <h2 className="ct__heading display">{heading}</h2>

        <ul className="ct__links">
          {links.map((link, i) => {
            const li = easeOut(span(progress, 0.24 + i * 0.06, 0.56 + i * 0.06));
            return (
              <li
                key={link.href}
                style={{
                  opacity: li,
                  transform: `translateY(${(1 - li) * 12}px)`,
                }}
              >
                <a
                  className="ct__link"
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  <span className="ct__link_label">{link.label}</span>
                  <span className="ct__link_arrow chrome" aria-hidden="true">
                    ↗
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>

      <footer
        className="ct__foot chrome"
        style={{ opacity: easeOut(span(progress, 0.5, 0.8)) }}
      >
        {site.footer.copyright}
      </footer>
    </div>
  );
}
