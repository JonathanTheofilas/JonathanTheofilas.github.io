// Ambient flow-field background: a single full-viewport shader quad sitting
// behind everything, reacting to cursor + scroll velocity.

import {
  PlaneGeometry,
  Mesh,
  ShaderMaterial,
  AdditiveBlending,
  Color,
  Vector2,
} from "three";
import vert from "./shaders/field.vert.glsl";
import frag from "./shaders/field.frag.glsl";

export class Field {
  constructor() {
    this.material = new ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new Vector2(0, 0) },
        uScroll: { value: 0 },
        uRes: { value: new Vector2(1, 1) },
        uGold: { value: new Color(0xffd27a) },
      },
      vertexShader: vert,
      fragmentShader: frag,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      blending: AdditiveBlending,
    });

    this.object = new Mesh(new PlaneGeometry(1, 1), this.material);
    this.object.position.z = -60; // behind the globe
    this.object.frustumCulled = false;
  }

  resize(stage) {
    this.object.scale.set(stage.size.w, stage.size.h, 1);
    this.material.uniforms.uRes.value.set(stage.size.w, stage.size.h);
  }

  update(dt, stage) {
    const u = this.material.uniforms;
    u.uTime.value = stage.time;
    u.uMouse.value.copy(stage.pointerSmooth);
    const target = Math.min(Math.abs(stage.scrollVel) * 0.06, 1);
    u.uScroll.value += (target - u.uScroll.value) * 0.06;
  }

  dispose() {
    this.object.geometry.dispose();
    this.material.dispose();
  }
}
