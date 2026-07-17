import { useEffect, useState } from "react";
import { sectionProgress } from "./SectionContainer";
import { SECTION_VH } from "../gl/timeline";
import "./SectionLabel.css";

/**
 * A live section readout, bottom-right, in mono: "03 / experience".
 *
 * Borrowed straight from the reference, which stamps its sections with mono
 * tokens (kv, works_intro, mission_in…) and lets you see them — the shipped
 * site keeps a faint air of the instrument panel. It reads technical on
 * purpose; on a systems engineer's portfolio that's the right accent.
 */
export function SectionLabel() {
  const [current, setCurrent] = useState<[number, string]>([0, SECTION_VH[0][0]]);

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      let idx = SECTION_VH.findIndex(([id]) => (sectionProgress[id] ?? 0) < 1);
      if (idx === -1) idx = SECTION_VH.length - 1;
      const id = SECTION_VH[idx][0];
      setCurrent((prev) => (prev[1] === id ? prev : [idx, id]));
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="sl chrome" aria-hidden="true">
      {String(current[0] + 1).padStart(2, "0")} / {current[1]}
    </div>
  );
}
