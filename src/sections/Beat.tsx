import { span, easeOut } from "../components/SectionContainer";
import "./Beat.css";

/**
 * A transition beat — a whole viewport of scroll that exists only to open or
 * close a section.
 *
 * This looks like waste and is the opposite. The reference site spends five
 * separate viewports on nothing but these (works_intro, works_outro,
 * mission_in, vision_out, service_in). Most sites cut straight from block to
 * block; giving every seam its own beat is most of what "expensive" means.
 *
 * The label rises, holds, and leaves. Nothing else happens, on purpose.
 */
export function Beat({
  progress,
  index,
  title,
  note,
}: {
  progress: number;
  /** the two-digit section number, e.g. "01" */
  index: string;
  title: string;
  note?: string;
}) {
  const enter = easeOut(span(progress, 0, 0.35));
  const exit = easeOut(span(progress, 0.65, 1));
  const shown = enter - exit;

  return (
    <div className="beat">
      <div
        className="beat__inner"
        style={{
          opacity: shown,
          transform: `translateY(${(1 - enter) * 28 + exit * -28}px)`,
        }}
      >
        <span className="beat__index chrome">{index}</span>
        <h2 className="beat__title display">{title}</h2>
        {note && <p className="beat__note meta">{note}</p>}
      </div>

      {/* a hairline that draws itself across the beat's full duration */}
      <div
        className="beat__rule"
        aria-hidden="true"
        style={{ transform: `scaleX(${easeOut(progress)})` }}
      />
    </div>
  );
}
