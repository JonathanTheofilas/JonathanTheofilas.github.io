// Single source of truth for site content.
// The DOM and the WebGL tiles read from the same arrays so their indices and
// per-project `seed` values stay aligned.

export const profile = {
  name: "Jonathan Theofilas",
  location: "Melbourne, Australia",
  role: "Software engineer",
  // Humanized copy (see humanizer rules): plain, specific, no clichés, no em dashes.
  tagline:
    "Computer science graduate from Melbourne. I build low-level systems in C, full-stack apps on AWS, and AR for the Meta Quest.",
  about: [
    "I finished my computer science degree at RMIT in 2025. Most of what I make sits at two extremes: low-level systems in C (right now, a SQLite clone with its own B-tree and SQL parser) and full-stack apps on AWS.",
    "Before I wrote code for a living I ran café floors for five years, which is where I learned to stay calm when everything breaks at once.",
  ],
  facts: [
    { label: "Education", value: "RMIT B.Sc. Computer Science" },
    { label: "Based in", value: "Melbourne, Australia" },
    { label: "Languages", value: "English, Greek" },
    { label: "Award", value: "People's Choice, Boeing Hackathon" },
  ],
};

export const links = {
  github: "https://github.com/JonathanTheofilas",
  linkedin: "https://www.linkedin.com/in/jonathan-theofilas-9454732b7",
};

export const skills = [
  {
    group: "Languages",
    items: ["Python", "C", "C++", "Java", "JavaScript", "TypeScript"],
  },
  {
    group: "Cloud & data",
    items: ["AWS", "Lambda", "DynamoDB", "S3", "MongoDB", "MySQL"],
  },
  {
    group: "Frameworks & tools",
    items: ["React", "Node.js", "Express", "Docker", "Unity", "Git"],
  },
];

// Completed work -> the WebGL distortion grid. `seed` drives the generative
// texture so each tile looks distinct but deterministic.
export const completed = [
  {
    title: "SQLite clone",
    blurb:
      "A database engine written from scratch in C: B-tree storage, a hand-written SQL parser, and transactions.",
    tags: ["C", "Databases", "Systems"],
    href: "https://github.com/JonathanTheofilas/sqlite-clone",
    seed: 17,
  },
  {
    title: "AWS music platform",
    blurb:
      "A music subscription app on AWS. DynamoDB for the catalogue, S3 for media, and search that returns what you asked for.",
    tags: ["AWS", "DynamoDB", "S3"],
    href: "https://github.com/JonathanTheofilas/AWS-Music-Subscription-System",
    seed: 42,
  },
  {
    title: "Property booking platform",
    blurb:
      "A property rental app built on Node and MongoDB, handling listings, bookings, and the messy edge cases that come with both.",
    tags: ["Node.js", "MongoDB", "Express"],
    href: "https://github.com/JonathanTheofilas/AirBnB-Clone---Property-Booking-Platform",
    seed: 73,
  },
  {
    title: "GameSight AR",
    blurb:
      "An augmented reality app for the Meta Quest 3, built for RMIT's RoboCup team to see what the robots see.",
    tags: ["Unity", "AR", "C#"],
    href: null,
    seed: 91,
  },
  {
    title: "Data intelligence project",
    blurb:
      "A Python analytics pipeline that reached 92% prediction accuracy on its test set.",
    tags: ["Python", "ML", "Pandas"],
    href: null,
    seed: 28,
  },
];

// Active / in-progress work -> the horizontal-scroll "Works" track.
export const active = [
  {
    title: "BPE tokeniser",
    blurb:
      "A byte pair encoding tokeniser in Python, trained over a multilingual corpus, built to learn how language models split text into tokens.",
    tags: ["Python", "NLP"],
    href: "https://github.com/JonathanTheofilas/BPE-Tokeniser",
  },
  {
    title: "Langton's bug farm",
    blurb:
      "A cellular automata sandbox in JavaScript. Langton's Ant, turmites, and custom Turing machines, all drawn in real time.",
    tags: ["JavaScript", "Simulation"],
    href: "https://github.com/JonathanTheofilas/Langtons-Bug-Farm",
  },
  {
    title: "This site",
    blurb:
      "A WebGL portfolio built with Three.js, GSAP and Lenis. The globe, the grain, and the project tiles are all generated in shaders.",
    tags: ["Three.js", "GSAP", "WebGL"],
    href: "https://github.com/JonathanTheofilas/JonathanTheofilas.github.io",
  },
];
