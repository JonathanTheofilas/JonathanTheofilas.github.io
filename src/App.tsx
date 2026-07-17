import { useEffect } from "react";
import { useLenis } from "./lib/useLenis";
import { useAppStore } from "./store/useAppStore";
import { SectionContainer } from "./components/SectionContainer";
import { Header } from "./components/Header";
import { Loader } from "./components/Loader";
import { SectionLabel } from "./components/SectionLabel";
import { Stage } from "./gl/Stage";
import { vhOf } from "./gl/timeline";
import { Hero } from "./sections/Hero";
import { Beat } from "./sections/Beat";
import { Experience } from "./sections/Experience";
import { Projects } from "./sections/Projects";
import { About } from "./sections/About";
import { Contact } from "./sections/Contact";
import { SrDocument } from "./overlay/SrDocument";

/**
 * Two layers, same split as the reference site:
 *
 *   Stage  — a full-page WebGL canvas. The camera dollies through staged
 *            scenes (channel field → holograms → project orbs →
 *            constellation → finale) driven by scroll. The show.
 *   main   — monochrome typography floating above it. The frame.
 *
 * The scroll budget both layers share lives in gl/timeline.ts.
 */
export default function App() {
  useLenis();

  // theme reaches CSS via the data attribute; the GL stage reads the store
  const theme = useAppStore((s) => s.theme);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return (
    <>
      <a className="skip-link chrome" href="#sr-content">
        Skip to content
      </a>

      <Loader />
      <Stage />
      <Header />
      <SectionLabel />

      <main id="top">
        <SectionContainer id="hero" vh={vhOf("hero")} label="Introduction">
          {(p) => <Hero progress={p} />}
        </SectionContainer>

        <SectionContainer id="work-intro" vh={vhOf("work-intro")} label="Work">
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
          vh={vhOf("experience")}
          label="Experience"
        >
          {(p) => <Experience progress={p} />}
        </SectionContainer>

        <SectionContainer
          id="projects-intro"
          vh={vhOf("projects-intro")}
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

        <SectionContainer id="projects" vh={vhOf("projects")} label="Projects">
          {(p) => <Projects progress={p} />}
        </SectionContainer>

        <SectionContainer id="about" vh={vhOf("about")} label="About">
          {(p) => <About progress={p} />}
        </SectionContainer>

        <SectionContainer id="contact" vh={vhOf("contact")} label="Contact">
          {(p) => <Contact progress={p} />}
        </SectionContainer>
      </main>

      <div id="sr-content" className="sr-only">
        <SrDocument />
      </div>
    </>
  );
}
