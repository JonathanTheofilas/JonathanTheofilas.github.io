import { useLenis } from "./lib/useLenis";
import { SectionContainer } from "./components/SectionContainer";
import { Header } from "./components/Header";
import { Loader } from "./components/Loader";
import { Hero } from "./sections/Hero";
import { Beat } from "./sections/Beat";
import { Experience } from "./sections/Experience";
import { Projects } from "./sections/Projects";
import { About } from "./sections/About";
import { Contact } from "./sections/Contact";
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
 * sells and moves briskly through everything else. Same split here — the
 * production work and the projects take 9.5 of 15.6 viewports (61%), and the
 * introduction gets one screen to say a name and get out of the way.
 *
 * The `beat` entries are transition budget: a whole viewport that exists only
 * to open a section. That looks like waste and is the opposite — it's most of
 * what separates this from a page that cuts block to block.
 */
const BUDGET = {
  hero: 1,
  workIntro: 1,
  experience: 4.5,
  projectsIntro: 1,
  projects: 5,
  about: 1.6,
  contact: 1.5,
} as const;

export default function App() {
  useLenis();

  return (
    <>
      <a className="skip-link chrome" href="#sr-content">
        Skip to content
      </a>

      <Loader />
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

        <SectionContainer
          id="projects-intro"
          vh={BUDGET.projectsIntro}
          label="Projects"
        >
          {(p) => (
            <Beat
              progress={p}
              index="02"
              title="Built to find out"
              note="A database engine, a tokeniser, a cellular automata sandbox — things made to understand how they work."
            />
          )}
        </SectionContainer>

        <SectionContainer id="projects" vh={BUDGET.projects} label="Projects">
          {(p) => <Projects progress={p} />}
        </SectionContainer>

        <SectionContainer id="about" vh={BUDGET.about} label="About">
          {(p) => <About progress={p} />}
        </SectionContainer>

        <SectionContainer id="contact" vh={BUDGET.contact} label="Contact">
          {(p) => <Contact progress={p} />}
        </SectionContainer>
      </main>

      <div id="sr-content" className="sr-only">
        <SrDocument />
      </div>
    </>
  );
}
