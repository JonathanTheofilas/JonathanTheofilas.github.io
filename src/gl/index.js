// WebGL entry: shared Stage + lightning background + project distortion grid.
// No-ops when WebGL is unavailable or reduced motion is requested.

import { Stage } from "./Stage.js";
import { Lightning } from "./Lightning.js";
import { ProjectGrid } from "./ProjectGrid.js";
import { webglOK, reducedMotion } from "../modules/device.js";
import { scrollState } from "../modules/scroll.js";

export function initGL() {
  if (!webglOK || reducedMotion) return null;

  const canvas = document.getElementById("gl");
  if (!canvas) return null;

  const stage = new Stage(canvas);
  document.documentElement.classList.add("webgl-on");

  // feed scroll velocity into the stage each frame
  stage.add({ update: () => stage.setScrollVelocity(scrollState.velocity) });

  // electric lightning background (drawn first, behind everything)
  stage.add(new Lightning());

  // project distortion grid
  const tiles = document.querySelectorAll("#project-grid .tile");
  if (tiles.length) stage.add(new ProjectGrid(tiles));

  stage.start();
  if (import.meta.env.DEV) window.__stage = stage;
  return stage;
}
