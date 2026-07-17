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

/* --- the ticker -------------------------------------------------------

   One rAF loop for the whole page, not one per section.

   The obvious build is per-section: an IntersectionObserver to detect "am I
   on screen", gating a rAF loop so offscreen sections cost nothing. Don't.
   It makes every section's motion depend on IO delivering — and when IO is
   delayed or throttled, `visible` never flips, the loop never starts, and the
   section sits at progress 0 forever. For the transition beats, progress 0 is
   `opacity: 0`. The failure mode is a blank screen.

   A single always-on loop measuring N sections is a handful of
   getBoundingClientRect calls per frame — genuinely nothing — and it cannot
   fail this way. Correctness first; the IO gate was optimising the wrong side
   of the trade. The loop parks itself when nothing is subscribed. */

type Measurer = () => void;
const subscribers = new Set<Measurer>();
let ticking = 0;

function tick() {
  for (const fn of subscribers) fn();
  ticking = subscribers.size ? requestAnimationFrame(tick) : 0;
}

function subscribe(fn: Measurer) {
  subscribers.add(fn);
  if (!ticking) ticking = requestAnimationFrame(tick);
  return () => {
    subscribers.delete(fn);
    if (!subscribers.size && ticking) {
      cancelAnimationFrame(ticking);
      ticking = 0;
    }
  };
}

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
    if (!isFn) return;
    const el = ref.current;
    if (!el) return;

    let last = -1;

    const measure = () => {
      const rect = el.getBoundingClientRect();

      // Cheap reject: fully offscreen sections can't have changed visibly.
      // Still cheaper than an IntersectionObserver and it can't wedge.
      if (rect.bottom < 0 || rect.top > window.innerHeight) {
        const settled = rect.bottom < 0 ? 1 : 0;
        if (settled !== last) {
          last = settled;
          setProgress(settled);
        }
        return;
      }

      // Progress runs 0 → 1 as the section's top passes the viewport top.
      //
      // The denominator is the only subtle part. A section taller than the
      // viewport pins, and its budget is the pin distance (height - viewport).
      // A section exactly one viewport tall has *no* pin distance — it can't
      // hold still, it just scrolls away — so its budget is its own height.
      //
      // Using `height - viewport` unconditionally makes every vh:1 section
      // divide by zero and report 1 forever, rendering it permanently finished
      // (i.e. invisible) at scroll 0. Both transition beats and the hero are
      // vh:1.
      const pinTravel = rect.height - window.innerHeight;
      const budget = pinTravel > 0 ? pinTravel : rect.height;
      const p = budget > 0 ? clamp(-rect.top / budget) : 0;

      // Don't re-render on sub-pixel noise.
      if (Math.abs(p - last) > 0.0005) {
        last = p;
        setProgress(p);
      }
    };

    measure(); // settle before the first frame, so nothing flashes
    return subscribe(measure);
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
