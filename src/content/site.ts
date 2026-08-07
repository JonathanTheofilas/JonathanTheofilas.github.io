/**
 * Site-wide content. Everything the plaza displays that isn't a project
 * lives here — edit this file, not the components.
 */

export const site = {
  name: "Jonathan Theofilas",
  firstName: "Jonathan",
  monogram: "JT",
  tagline: "systems · cloud · ar",
  location: "Melbourne",
  title: "Jonathan Theofilas — Selected work",
  description:
    "Selected work — systems, cloud, and AR. A portfolio by Jonathan Theofilas.",
  url: "https://jonathantheofilas.github.io",

  hero: {
    // A small personal line under the name, set just above the chrome. Swap
    // the text to whatever you want.
    statement: "112%'d Hollow Knight",
  },

  about: {
    heading: "About me",
    body: [
      "I'm a software engineer in Melbourne working across systems, cloud, and AR — from a database engine written in C to an augmented-reality app for the Meta Quest 3.",
      "Day to day I build AI-heavy platforms: telephony backends, multi-agent LLM pipelines, and the boring-but-critical automation that keeps them honest.",
    ],
  },

  experience: {
    heading: "Experience",
    note: "shown without proprietary detail",
    items: [
      {
        title: "AI call-handling platform",
        blurb:
          "Backend and frontend for a multi-tenant AI call platform: telephony, conversational AI, and voice synthesis with real-time call state.",
        tags: ["FastAPI", "PostgreSQL", "React/TS", "Azure", "Twilio"],
      },
      {
        title: "Multi-agent AI revenue automation",
        blurb:
          "A platform of LLM agents for enrichment, outreach sequencing, and reply classification, wired to CRM and finance APIs with approval workflows.",
        tags: ["FastAPI", "PostgreSQL", "React", "LLM agents"],
      },
      {
        title: "AI governance console",
        blurb:
          "An operator console for governing a fleet of AI agents: policy checks, compliance posture, and human-in-the-loop approvals, on a multi-tenant backend.",
        tags: ["React/TS", "FastAPI", "PostgreSQL", "Azure"],
      },
      {
        title: "Workflow-analysis platform",
        blurb:
          "A platform that maps an organisation's workflows, surfaces automation opportunities, and turns them into phased roadmaps, backed by an AI analysis pipeline and background jobs.",
        tags: ["FastAPI", "PostgreSQL", "Celery", "React/TS"],
      },
      {
        title: "Telecom billing automation",
        blurb:
          "A Python pipeline turning carrier billing exports into branded multi-format reports, with validation gates and workflow automation.",
        tags: ["Python", "Data pipeline", "Automation"],
      },
    ],
  },

  skills: [
    "Python",
    "C / C++",
    "TypeScript",
    "AWS",
    "React",
    "Node",
    "Docker",
  ],

  contact: {
    heading: "Say hi",
    links: [
      {
        label: "LinkedIn",
        href: "https://www.linkedin.com/in/jonathan-theofilas-9454732b7",
      },
      {
        label: "GitHub",
        href: "https://github.com/JonathanTheofilas",
      },
    ],
  },

  footer: {
    copyright: `© ${new Date().getFullYear()} Jonathan Theofilas · Melbourne`,
    disclaimer: "Not affiliated with Nintendo.",
  },

  boot: {
    warning: "⚠ WARNING: This portfolio may cause spontaneous hiring.",
    pressA: "Press Ⓐ to continue",
  },
} as const;

export type Site = typeof site;
