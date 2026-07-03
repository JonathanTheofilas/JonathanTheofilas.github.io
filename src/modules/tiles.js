// Tile spotlight: publish the pointer position as --mx/--my custom properties
// so the CSS border glow and ASCII texture track the cursor.

import { finePointer } from "./device.js";

export function initTiles() {
  if (!finePointer) return;
  document.querySelectorAll(".tile").forEach((tile) => {
    tile.addEventListener(
      "pointermove",
      (e) => {
        const r = tile.getBoundingClientRect();
        tile.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
        tile.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
      },
      { passive: true }
    );
  });
}
