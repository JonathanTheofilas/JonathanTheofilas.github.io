/**
 * Projects — one entry per project, one wandering Mii per entry.
 *
 * To add a project (= a new Mii in the plaza), append an object here.
 * `mii` controls the character's look:
 *   - color:     body colour (use the project's "brand" colour)
 *   - hair:      "cap" | "bowl" | "spike" | "swirl" | "none"
 *   - accessory: "database" | "headphones" | "house" | "scissors"
 *                | "bug" | "headset" | "chart" | "none"
 *   - height:    0.85–1.15 scale multiplier
 *   - headSize:  0.9–1.15 scale multiplier
 */

export interface MiiSpec {
  color: string;
  hair: "cap" | "bowl" | "spike" | "swirl" | "none";
  hairColor: string;
  accessory:
    | "database"
    | "headphones"
    | "house"
    | "scissors"
    | "bug"
    | "headset"
    | "chart"
    | "none";
  height: number;
  headSize: number;
}

export interface Project {
  id: string;
  name: string;
  blurb: string;
  tags: string[];
  repo?: string;
  demo?: string;
  mii: MiiSpec;
}

export const projects: Project[] = [
  {
    id: "sqlite-clone",
    name: "SQLite clone",
    blurb:
      "A database engine written from scratch in C: B-tree storage, a hand-written SQL parser, and transactions.",
    tags: ["C", "Databases", "Systems"],
    repo: "https://github.com/JonathanTheofilas/sqlite-clone",
    mii: {
      color: "#4a6fa5",
      hair: "bowl",
      hairColor: "#3d3630",
      accessory: "database",
      height: 1.0,
      headSize: 1.0,
    },
  },
  {
    id: "aws-music",
    name: "AWS music platform",
    blurb:
      "A music subscription app on AWS. DynamoDB for the catalogue, S3 for media, and search that returns what you asked for.",
    tags: ["AWS", "DynamoDB", "S3"],
    repo: "https://github.com/JonathanTheofilas/AWS-Music-Subscription-System",
    mii: {
      color: "#e8963a",
      hair: "spike",
      hairColor: "#4a3527",
      accessory: "headphones",
      height: 1.05,
      headSize: 0.95,
    },
  },
  {
    id: "booking-platform",
    name: "Property booking platform",
    blurb:
      "A property rental app built on Node and MongoDB, handling listings, bookings, and the messy edge cases that come with both.",
    tags: ["Node.js", "MongoDB", "Express"],
    repo: "https://github.com/JonathanTheofilas/AirBnB-Clone---Property-Booking-Platform",
    mii: {
      color: "#e05d5d",
      hair: "cap",
      hairColor: "#59463c",
      accessory: "house",
      height: 0.95,
      headSize: 1.05,
    },
  },
  {
    id: "bpe-tokeniser",
    name: "BPE tokeniser",
    blurb:
      "A byte pair encoding tokeniser in Python, trained over a multilingual corpus, built to learn how models split text into tokens.",
    tags: ["Python", "NLP"],
    repo: "https://github.com/JonathanTheofilas/BPE-Tokeniser",
    mii: {
      color: "#f0c94a",
      hair: "swirl",
      hairColor: "#2e2a26",
      accessory: "scissors",
      height: 0.9,
      headSize: 1.1,
    },
  },
  {
    id: "langtons-bug-farm",
    name: "Langton's bug farm",
    blurb:
      "A cellular automata sandbox in JavaScript. Langton's Ant, turmites, and custom Turing machines, drawn in real time.",
    tags: ["JavaScript", "Simulation"],
    repo: "https://github.com/JonathanTheofilas/Langtons-Bug-Farm",
    mii: {
      color: "#5cb86e",
      hair: "spike",
      hairColor: "#274a2d",
      accessory: "bug",
      height: 0.88,
      headSize: 1.0,
    },
  },
  {
    id: "gamesight-ar",
    name: "GameSight AR",
    blurb:
      "An augmented reality app for the Meta Quest 3, built for RMIT's RoboCup team to see what the robots see.",
    tags: ["Unity", "AR", "C#"],
    mii: {
      color: "#8f6bc7",
      hair: "none",
      hairColor: "#000000",
      accessory: "headset",
      height: 1.1,
      headSize: 0.95,
    },
  },
  {
    id: "data-intelligence",
    name: "Data intelligence",
    blurb:
      "A Python analytics pipeline that reached 92% prediction accuracy on its test set.",
    tags: ["Python", "ML", "Pandas"],
    mii: {
      color: "#46b5a4",
      hair: "bowl",
      hairColor: "#5a4a3a",
      accessory: "chart",
      height: 1.0,
      headSize: 1.0,
    },
  },
];
