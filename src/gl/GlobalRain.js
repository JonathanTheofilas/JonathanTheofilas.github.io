// Site-wide light rain: a full-viewport ortho quad with procedural streaks,
// drawn behind the bolts and content so it falls across every section.

import {
  PlaneGeometry,
  Mesh,
  ShaderMaterial,
  AdditiveBlending,
  Vector2,
} from "three";
import vert from "./shaders/field.vert.glsl";
import frag from "./shaders/rainfield.frag.glsl";

export class GlobalRain {
  constructor() {
    this.material = new ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uRes: { value: new Vector2(1, 1) },
      },
      vertexShader: vert,
      fragmentShader: frag,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      blending: AdditiveBlending,
    });
    this.object = new Mesh(new PlaneGeometry(1, 1), this.material);
    this.object.position.z = -50;
    this.object.frustumCulled = false;
  }

  resize(stage) {
    this.object.scale.set(stage.size.w, stage.size.h, 1);
    this.material.uniforms.uRes.value.set(stage.size.w, stage.size.h);
  }

  update(dt, stage) {
    this.material.uniforms.uTime.value = stage.time;
  }

  dispose() {
    this.object.geometry.dispose();
    this.material.dispose();
  }
}
