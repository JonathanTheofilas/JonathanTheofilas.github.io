# jonathantheofilas.github.io

Personal portfolio, rebuilt as an interactive 3D **"Wii Menu, 2006"** plaza:
a React Three Fiber scene where each project is a wandering Mii-style
character, the scroll wheel drives a camera dolly through five chapters, and
the whole thing boots like a disc console. Not affiliated with Nintendo —
everything is procedural/original; only the cursor pack is third-party
(free, credited in [public/cursors/README.md](public/cursors/README.md)).

```bash
npm i
npm run dev        # local dev at http://localhost:5173
npm run build      # typecheck + production build to dist/
```

Deploys to GitHub Pages from `main` via `.github/workflows/deploy.yml`
(Node 22, `npm ci && npm run build`, publishes `dist/`).

## Adding a project (= a new Mii)

All content is data-driven. To add a project, append one object to
[`src/content/projects.ts`](src/content/projects.ts):

```ts
{
  id: "my-new-thing",                    // unique slug
  name: "My new thing",                  // nameplate + panel title
  blurb: "One or two plain sentences.",  // panel body
  tags: ["Rust", "WASM"],                // tech pills
  repo: "https://github.com/you/thing",  // optional "Code ↗" button
  demo: "https://thing.example",         // optional "Visit ↗" button
  mii: {
    color: "#b0413e",   // body colour — use the project's brand colour
    hair: "spike",      // "cap" | "bowl" | "spike" | "swirl" | "none"
    hairColor: "#2e2a26",
    accessory: "chart", // "database" | "headphones" | "house" | "scissors"
                        // | "bug" | "headset" | "chart" | "none"
    height: 1.0,        // 0.85–1.15
    headSize: 1.0,      // 0.9–1.15
  },
}
```

A new Mii spawns in the plaza automatically — walk cycle, wander AI,
hover-wave, click-to-open panel and keyboard access all come for free.
Also add a matching `<li>` to the static crawler fallback in
[`index.html`](index.html) (the visually-hidden list inside `#root`).

Everything else (bio, experience, skills, contact links, boot copy) lives in
[`src/content/site.ts`](src/content/site.ts).

## How it's put together

| Piece | Where |
| --- | --- |
| Boot sequence (splash → disc → bloom) | `src/overlay/BootOverlay.tsx`, `src/overlay/BootDisc.tsx` |
| Camera dolly + chapters | `src/scene/CameraRig.tsx`, waypoints in `src/scene/layout.ts` |
| Scroll plumbing (DOM track ↔ canvas) | `src/scene/scrollApi.ts`, track in `src/App.tsx` |
| Mii model / animation / AI | `src/scene/Mii.tsx`, crowd + project panel in `src/scene/Miis.tsx` |
| Plaza, lighting, channel cards | `src/scene/Plaza.tsx`, `src/scene/ChannelPanel.tsx` |
| Skill capsules | `src/scene/SkillCapsules.tsx` |
| Custom Wii-remote cursor | `src/cursor/CursorLayer.tsx`, assets in `public/cursors/` |
| Sounds (all synthesized) | `scripts/generate-audio.mjs` → `public/audio/`, played via `src/audio/sfx.ts` |
| Design tokens & overlay UI | `src/styles/wii.css` |
| Global state | `src/store/useAppStore.ts` (zustand) |

Accessibility: the full site exists as a visually-hidden semantic document
(`src/overlay/SrDocument.tsx` + static fallback in `index.html`), keyboard
navigation lives in the HUD (Tab → chapter/project buttons, Enter to open,
Esc to close), and `prefers-reduced-motion` skips the boot, snaps the camera
between chapters, stops the wandering and restores native cursors.

Regenerating assets: `npm run cursors:convert` (needs Python + Pillow),
`npm run audio:generate`.
