# Wii cursor assets

Source pack: **"Wii Cursors v1.0" by allewun** (deviantart.com/allewun, 2007) —
free to use per the pack's readme.txt. Original `.cur`/`.ani` files are kept
here unmodified; the PNGs are converted from them by
`scripts/convert-cursors.py` (`npm run cursors:convert`), 32×32 with alpha.

The site uses the **tilted (`-ccw`) variants** as the primary art — the tilt
reads as a loosely pointed Wii Remote (and the pack author preferred them
too). Hotspots come from each `.cur` header and are baked into the JS cursor
layer (`src/cursor/CursorLayer.tsx`) and the CSS fallback (`src/styles/wii.css`).

## PNG → source mapping

| PNG | Converted from | Used for |
| --- | --- | --- |
| `wii-pointer-ccw.png` | `wii-pointer-ccw.cur` | default pointer (JS layer) + CSS fallback |
| `wii-open-ccw.png` | `wii-open-ccw.cur` | hovering grabbable things (Miis, buttons) |
| `wii-grab-ccw.png` | `wii-grab-ccw.cur` | dragging / orbiting in explore mode |
| `wii-loading-cd-ccw-f00..f08.png` | `wii-loading-cd-ccw.ani` (9 frames) | animated boot/loading cursor |
| `wii-pointer.png`, `wii-open.png`, `wii-grab.png`, … | matching `.cur` | converted for completeness, unused |
| `wii-loading-cd-f00..f07.png` | `wii-loading-cd.ani` (8 frames) | unused (untilted variant) |
| `wii-loading-ring-f00..f09.png` | `wii-loading-ring.ani` (10 frames) | unused alternative loader |

Quirk preserved from the original pack: `wii-pointer.cur` (untilted) has the
loading CD baked into its art — another reason the tilted set is primary.

`cursors.json` is the generated manifest (file, frames, hotspot per cursor).
