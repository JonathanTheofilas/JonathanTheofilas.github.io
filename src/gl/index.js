// WebGL entry: builds the shared Stage and plugs in the layers. No-ops cleanly
// when WebGL is unavailable or reduced motion is requested.

import { Stage } from "./Stage.js";
import { Globe } from "./Globe.js";
import { Field } from "./Particles.js";
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

  // ambient flow field (behind everything)
  stage.add(new Field());

  // hero globe
  const globeEl = document.querySelector('[data-gl="globe"]');
  if (globeEl) stage.add(new Globe(globeEl));

  // project distortion grid
  const tiles = document.querySelectorAll("#project-grid .tile");
  if (tiles.length) stage.add(new ProjectGrid(tiles));

  stage.start();
  if (import.meta.env.DEV) window.__stage = stage;
  return stage;
}
