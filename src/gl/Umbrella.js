// Connect-section umbrella: a 3D canopy + handle sheltering the content, with
// shader-driven rain bouncing off it. Its own perspective scene, composited
// into the #connect-anchor box.

import {
  Scene,
  PerspectiveCamera,
  Group,
  LatheGeometry,
  CylinderGeometry,
  TorusGeometry,
  Mesh,
  MeshBasicMaterial,
  ShaderMaterial,
  Color,
  Vector2,
  DoubleSide,
} from "three";
import sphereVert from "./shaders/sphere.vert.glsl";
import umbrellaFrag from "./shaders/umbrella.frag.glsl";
import { createRain } from "./Rain.js";
import { isOnScreen } from "./DomSync.js";
import { quality } from "../modules/device.js";

export class Umbrella {
  constructor(anchorEl) {
    this.el = anchorEl;

    this.scene = new Scene();
    this.camera = new PerspectiveCamera(42, 1, 0.1, 100);
    this.camera.position.set(0, 0, 5.2);

    this.group = new Group();
    this.group.position.y = 0.1;
    this.group.scale.setScalar(0.85);
    this.scene.add(this.group);

    // canopy (lathe dome with a small upturned lip)
    const profile = [
      new Vector2(0.0, 0.7),
      new Vector2(0.35, 0.62),
      new Vector2(0.7, 0.48),
      new Vector2(1.05, 0.3),
      new Vector2(1.35, 0.16),
      new Vector2(1.45, 0.2),
    ];
    this.canopyMat = new ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uFlash: { value: 0 },
        uCanopy: { value: new Color(0x0c1426) },
        uEdge: { value: new Color(0x38bdf8) },
      },
      vertexShader: sphereVert,
      fragmentShader: umbrellaFrag,
      side: DoubleSide,
    });
    this.canopy = new Mesh(new LatheGeometry(profile, 64), this.canopyMat);
    this.group.add(this.canopy);

    // shaft + J-hook handle
    const metal = new MeshBasicMaterial({ color: 0x223152 });
    const shaft = new Mesh(new CylinderGeometry(0.025, 0.025, 1.8, 12), metal);
    shaft.position.y = -0.2;
    this.group.add(shaft);
    const hook = new Mesh(
      new TorusGeometry(0.14, 0.025, 8, 20, Math.PI),
      metal
    );
    hook.position.set(0.14, -1.1, 0);
    hook.rotation.z = Math.PI;
    this.group.add(hook);
    this.metal = metal;

    // rain
    const count = quality === "low" ? 320 : 760;
    const rain = createRain(count, 2.2);
    this.rain = rain;
    this.group.add(rain.points);

    this._sway = 0;
  }

  resize() {}

  update(dt, stage) {
    if (!this.el || !isOnScreen(this.el, 120)) return;
    this._sway += dt;
    this.group.rotation.z = Math.sin(this._sway * 0.6) * 0.04;
    this.group.rotation.y +=
      (stage.pointerSmooth.x * 0.25 - this.group.rotation.y) * 0.04;
    this.canopyMat.uniforms.uTime.value = stage.time;
    this.canopyMat.uniforms.uFlash.value = stage.flash;
    this.rain.material.uniforms.uTime.value = stage.time;
  }

  render(stage) {
    if (!this.el || !isOnScreen(this.el, 120)) return;
    stage.renderPerspective(this.scene, this.camera, this.el);
  }

  dispose() {
    this.canopy.geometry.dispose();
    this.canopyMat.dispose();
    this.metal.dispose();
    this.rain.points.geometry.dispose();
    this.rain.material.dispose();
  }
}
