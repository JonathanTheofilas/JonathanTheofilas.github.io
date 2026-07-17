import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * A scroll-duration container — the single idea the whole site runs on.
 *
 * The outer element is an empty spacer whose height declares how much scroll
 * the section owns (`vh` × viewport). The content inside is pinned and
 * animates against its progress through that spacer, so the visitor scrolls
 * *through* a section while the content stays put and transforms.
 *
 *   <SectionContainer id="work" vh={5}>
 *     {(p) => <Work progress={p} />}
 *   </SectionContainer>
 *
 * The scroll budget IS the design decision — it's how you say what matters.
 * Give the work five viewports and the hero one, and you've said which is
 * worth someone's attention without writing a word about it.
 *
 * (alche.studio pins with `position: fixed` + JS bookkeeping. `sticky` gets
 * the same result natively, so we use that instead.)
 */

interface Props {
  /** section identity — drives nav state and the #anchor */
  id: string;
  /** scroll budget, in viewport heights. 1 = one screen of scroll. */
  vh: number;
  /** render-prop receiving progress 0..1 through the section */
  children: ReactNode | ((progress: number) => ReactNode);
  /** label announced to screen readers */
  label?: string;
  className?: string;
}

export function SectionContainer({ id, vh, children, label, className }: Props) {
  const ref = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);
  const isFn = typeof children === "function";

  useEffect(() => {
    // Only pay for the scroll math when the section is actually on screen,
    // and only when the content asked for progress.
    if (!isFn) return;
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    let visible = false;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      // 0 when the section's top hits the viewport top,
      // 1 when its bottom does.
      const travel = rect.height - window.innerHeight;
      const p = travel > 0 ? clamp(-rect.top / travel) : rect.top <= 0 ? 1 : 0;
      setProgress(p);
      if (visible) raf = requestAnimationFrame(measure);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        cancelAnimationFrame(raf);
        if (visible) raf = requestAnimationFrame(measure);
        else measure(); // settle at a final 0 or 1
      },
      { rootMargin: "10% 0px" },
    );
    io.observe(el);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [isFn]);

  return (
    <section
      ref={ref}
      id={id}
      data-section={id}
      /* mirrors the live progress into the DOM — the only way to see this
         value from outside React, and worth keeping for debugging motion */
      data-progress={progress.toFixed(3)}
      aria-label={label}
      className={className}
      style={{ position: "relative", height: `${vh * 100}vh` }}
    >
      {/* the pinned viewport — content lives here and never scrolls itself */}
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          overflow: "hidden",
        }}
      >
        {isFn ? (children as (p: number) => ReactNode)(progress) : children}
      </div>
    </section>
  );
}

const clamp = (n: number, min = 0, max = 1) => Math.min(max, Math.max(min, n));

/**
 * Remap a 0..1 section progress onto a sub-range, so several beats can share
 * one section's budget.
 *
 *   const fade = span(progress, 0, 0.3);    // first 30% of the section
 *   const slide = span(progress, 0.4, 1);   // last 60%
 */
export const span = (progress: number, start: number, end: number) =>
  clamp((progress - start) / (end - start));

/** Ease a 0..1 value. Matches --ease-out in editorial.css. */
export const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
