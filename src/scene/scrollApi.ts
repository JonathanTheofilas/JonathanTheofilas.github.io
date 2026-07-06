/**
 * Bridge between the DOM scroll track (App.tsx) and the camera rig / HUD.
 * The track is a plain scrollable div layered over the canvas; R3F pointer
 * events are sourced from it, so the 3D scene stays interactive.
 */
export const scrollApi = {
  el: null as HTMLDivElement | null,

  offset(): number {
    const el = this.el;
    if (!el) return 0;
    const max = el.scrollHeight - el.clientHeight;
    return max > 0 ? el.scrollTop / max : 0;
  },

  toChapter(i: number, chapters: number, smooth = true) {
    const el = this.el;
    if (!el) return;
    const max = el.scrollHeight - el.clientHeight;
    el.scrollTo({
      top: (i / (chapters - 1)) * max,
      behavior: smooth ? "smooth" : "auto",
    });
  },
};
