import { useEffect, useState } from "react";
import { site } from "../content/site";
import { scrollTo } from "../lib/useLenis";
import { ThemePicker } from "./ThemePicker";
import "./Header.css";

const NAV = [
  { label: "Work", href: "#experience" },
  { label: "Projects", href: "#projects" },
  { label: "About", href: "#about" },
] as const;

/**
 * Fixed, transparent, mono. Fades over 1.5s — see Header.css for why that
 * number matters.
 */
export function Header() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      // Hide on the way down, reveal on the way up — but never within the
      // first screen, where the header is part of the first impression.
      if (y > window.innerHeight * 0.8) setHidden(y > lastY && y - lastY > 2);
      else setHidden(false);
      lastY = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const jump = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    scrollTo(href);
  };

  return (
    <header className={`hd ${hidden ? "hd--hidden" : ""}`}>
      <a
        className="hd__mark chrome"
        href="#top"
        onClick={(e) => jump(e, "#top")}
        aria-label={`${site.name} — back to top`}
      >
        {site.monogram}
      </a>

      <nav className="hd__nav" aria-label="Sections">
        {NAV.map(({ label, href }) => (
          <a
            key={href}
            className="hd__link chrome"
            href={href}
            onClick={(e) => jump(e, href)}
          >
            {label}
          </a>
        ))}
        <ThemePicker />

        <a
          className="hd__cta chrome"
          href={site.contact.links[0].href}
          target="_blank"
          rel="noreferrer"
        >
          Contact
        </a>
      </nav>
    </header>
  );
}
