/**
 * The scroll budget — the whole site's shape in one table.
 *
 * `vh` is how many viewport-heights of scroll each section owns. This is the
 * design decision, not a technicality: Experience and Projects take 9.5 of
 * 15.6 viewports (61%), matching the reference's habit of spending most of
 * the page on the two things worth showing.
 *
 * Both App.tsx (DOM sections) and the GL stage (camera path) read this table,
 * so the dolly and the content can never drift out of sync.
 */
export const SECTION_VH = [
  ["hero", 1],
  ["work-intro", 1],
  ["experience", 4.5],
  ["projects-intro", 1],
  ["projects", 5],
  ["about", 1.6],
  ["contact", 1.5],
] as const;

export type SectionId = (typeof SECTION_VH)[number][0];

export const vhOf = (id: SectionId): number => {
  const hit = SECTION_VH.find(([s]) => s === id);
  return hit ? hit[1] : 1;
};
