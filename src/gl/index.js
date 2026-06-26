// WebGL entry: shared Stage + lightning background + project distortion grid.
// No-ops when WebGL is unavailable or reduced motion is requested.

import { Stage } from "./Stage.js";
import { Lightning } from "./Lightning.js";
import { Bolts } from "./Bolts.js";
import { StormSphere } from "./StormSphere.js";
import { Umbrella } from "./Umbrella.js";
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

  // cursor-spawned lightning bolts (ortho overlay)
  const heroAnchor = document.getElementById("hero-anchor");
  stage.add(new Bolts(heroAnchor));

  // hero storm-sphere (perspective pass, gated to the landing)
  if (heroAnchor) stage.add(new StormSphere(heroAnchor));

  // project distortion grid (selected work + generic experience tiles)
  const tiles = document.querySelectorAll(".tile");
  if (tiles.length) stage.add(new ProjectGrid(tiles));

  // umbrella + rain (perspective pass, gated to the connect section)
  const connectAnchor = document.getElementById("connect-anchor");
  if (connectAnchor) stage.add(new Umbrella(connectAnchor));

  stage.start();
  if (import.meta.env.DEV) window.__stage = stage;
  return stage;
}
