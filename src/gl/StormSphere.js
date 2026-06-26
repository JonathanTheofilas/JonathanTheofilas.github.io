// Hero storm-sphere: an abstract electric orb inside a churning storm-cloud
// shell. Its own perspective scene, composited into the #hero-anchor box.

import {
  Scene,
  PerspectiveCamera,
  IcosahedronGeometry,
  SphereGeometry,
  Mesh,
  Group,
  ShaderMaterial,
  Color,
  DoubleSide,
} from "three";
import vert from "./shaders/sphere.vert.glsl";
import coreFrag from "./shaders/sphere.frag.glsl";
import cloudFrag from "./shaders/cloud.frag.glsl";
import { isOnScreen } from "./DomSync.js";

export class StormSphere {
  constructor(anchorEl) {
    this.el = anchorEl;

    this.scene = new Scene();
    this.camera = new PerspectiveCamera(35, 1, 0.1, 100);
    this.camera.position.set(0, 0, 4.6);

    this.group = new Group();
    this.scene.add(this.group);

    this.coreMat = new ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uFlash: { value: 0 },
        uCore: { value: new Color(0xaedcff) },
        uRim: { value: new Color(0x38bdf8) },
        uDeep: { value: new Color(0x0a1024) },
      },
      vertexShader: vert,
      fragmentShader: coreFrag,
    });
    this.core = new Mesh(new IcosahedronGeometry(1, 4), this.coreMat);
    this.group.add(this.core);

    this.cloudMat = new ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uFlash: { value: 0 },
        uCloud: { value: new Color(0x0b1020) },
        uEdge: { value: new Color(0x2f6cf0) },
      },
      vertexShader: vert,
      fragmentShader: cloudFrag,
      transparent: true,
      depthWrite: false,
      side: DoubleSide,
    });
    this.cloud = new Mesh(new SphereGeometry(1.34, 48, 48), this.cloudMat);
    this.group.add(this.cloud);

    this._strikeTimer = 1 + Math.random() * 2;
    this._spin = 0;
  }

  resize() {}

  update(dt, stage) {
    if (!this.el || !isOnScreen(this.el, 80)) return;

    // slow auto-spin + strong cursor coupling: moving the mouse turns the orb
    this._spin += dt * 0.1;
    const targetY = this._spin + stage.pointerSmooth.x * 0.9;
    const targetX = -stage.pointerSmooth.y * 0.6;
    this.group.rotation.y += (targetY - this.group.rotation.y) * 0.1;
    this.group.rotation.x += (targetX - this.group.rotation.x) * 0.1;

    this.coreMat.uniforms.uTime.value = stage.time;
    this.cloudMat.uniforms.uTime.value = stage.time;
    this.coreMat.uniforms.uFlash.value = stage.flash;
    this.cloudMat.uniforms.uFlash.value = stage.flash;

    // occasional internal strike
    this._strikeTimer -= dt;
    if (this._strikeTimer <= 0) {
      stage.flash = Math.max(stage.flash, 0.8);
      this._strikeTimer = 1.6 + Math.random() * 2.6;
    }
  }

  render(stage) {
    if (!this.el || !isOnScreen(this.el, 80)) return;
    stage.renderPerspective(this.scene, this.camera, this.el);
  }

  dispose() {
    this.core.geometry.dispose();
    this.cloud.geometry.dispose();
    this.coreMat.dispose();
    this.cloudMat.dispose();
  }
}
