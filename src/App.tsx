import { useLenis } from "./lib/useLenis";
import { SectionContainer } from "./components/SectionContainer";
import { Header } from "./components/Header";
import { Hero } from "./sections/Hero";
import { Beat } from "./sections/Beat";
import { Experience } from "./sections/Experience";
import { SrDocument } from "./overlay/SrDocument";
import "./audio/sfx"; // wires Howler to the store

/**
 * The scroll budget — the whole layout in one table.
 *
 * `vh` is how many viewport-heights of scroll each section owns. This is the
 * design decision, not a technicality: giving Experience 4.5 screens and the
 * hero 1 says which is worth someone's time without writing a word about it.
 *
 * The reference site spends 48% of its entire length on the two things it
 * sells and moves briskly through everything else. Same idea here — the
 * production work gets the room; the introduction doesn't.
 */
const BUDGET = {
  hero: 1,
  workIntro: 1,
  experience: 4.5,
} as const;

export default function App() {
  useLenis();

  return (
    <>
      <a className="skip-link chrome" href="#sr-content">
        Skip to content
      </a>

      <Header />

      <main id="top">
        <SectionContainer id="hero" vh={BUDGET.hero} label="Introduction">
          {(p) => <Hero progress={p} />}
        </SectionContainer>

        <SectionContainer id="work-intro" vh={BUDGET.workIntro} label="Work">
          {(p) => (
            <Beat
              progress={p}
              index="01"
              title="Selected work"
              note="Production systems — telephony, LLM pipelines, and the automation that keeps them honest."
            />
          )}
        </SectionContainer>

        <SectionContainer
          id="experience"
          vh={BUDGET.experience}
          label="Experience"
        >
          {(p) => <Experience progress={p} />}
        </SectionContainer>
      </main>

      <div id="sr-content" className="sr-only">
        <SrDocument />
      </div>
    </>
  );
}
