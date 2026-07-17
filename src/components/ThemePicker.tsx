import { useEffect, useRef, useState } from "react";
import { THEMES, useAppStore } from "../store/useAppStore";
import { THEME_META } from "../lib/themes";
import "./ThemePicker.css";

/**
 * The theme wardrobe as a dropdown — each entry wears its own swatch: the
 * theme's page colour with its accent as the pupil. Closes on outside
 * click, Escape, or a pick.
 */
export function ThemePicker() {
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="tp" ref={root}>
      <button
        type="button"
        className="tp__button chrome"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Theme: ${theme}. Open theme picker.`}
      >
        <span
          className="tp__swatch"
          aria-hidden="true"
          style={{ background: THEME_META[theme].bg }}
        >
          <span style={{ background: THEME_META[theme].accent }} />
        </span>
        theme: {theme}
      </button>

      {open && (
        <ul className="tp__menu" role="listbox" aria-label="Theme">
          {THEMES.map((t) => (
            <li key={t}>
              <button
                type="button"
                role="option"
                aria-selected={t === theme}
                className={`tp__item chrome ${t === theme ? "is-active" : ""}`}
                onClick={() => {
                  setTheme(t);
                  setOpen(false);
                }}
              >
                <span
                  className="tp__swatch"
                  aria-hidden="true"
                  style={{ background: THEME_META[t].bg }}
                >
                  <span style={{ background: THEME_META[t].accent }} />
                </span>
                {t}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
