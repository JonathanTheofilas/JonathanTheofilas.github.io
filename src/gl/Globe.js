// Hero globe: a rotating point-sphere that warps toward the cursor. Synced to
// the [data-gl="globe"] anchor box in the hero.

import {
  BufferGeometry,
  BufferAttribute,
  Points,
  ShaderMaterial,
  AdditiveBlending,
  Color,
  Vector2,
} from "three";
import vert from "./shaders/globe.vert.glsl";
import frag from "./shaders/globe.frag.glsl";
import { syncToRect, isOnScreen } from "./DomSync.js";

function fibonacciSphere(n) {
  const pos = new Float32Array(n * 3);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const t = golden * i;
    pos[i * 3] = Math.cos(t) * r;
    pos[i * 3 + 1] = y;
    pos[i * 3 + 2] = Math.sin(t) * r;
  }
  return pos;
}

export class Globe {
  constructor(anchorEl, { count = 2600 } = {}) {
    this.el = anchorEl;

    const geo = new BufferGeometry();
    geo.setAttribute("position", new BufferAttribute(fibonacciSphere(count), 3));

    this.material = new ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uSize: { value: 3 },
        uRadius: { value: 160 },
        uMouse: { value: new Vector2(0, 0) },
        uScroll: { value: 0 },
        uColorBright: { value: new Color(0xffd27a) },
        uColorDim: { value: new Color(0x2a2740) },
      },
      vertexShader: vert,
      fragmentShader: frag,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      blending: AdditiveBlending,
    });

    this.object = new Points(geo, this.material);
    this.object.frustumCulled = false;
  }

  resize(stage) {
    this.material.uniforms.uSize.value = 2.2 * stage.size.dpr;
  }

  update(dt, stage) {
    if (!this.el || !isOnScreen(this.el, 80)) {
      this.object.visible = false;
      return;
    }
    this.object.visible = true;

    const r = syncToRect(this.object, this.el, stage, { fill: false });
    this.material.uniforms.uRadius.value = Math.min(r.width, r.height) * 0.42;

    this.object.rotation.y += dt * 0.16;
    this.object.rotation.x = Math.sin(stage.time * 0.1) * 0.16;

    const u = this.material.uniforms;
    u.uTime.value = stage.time;
    u.uMouse.value.copy(stage.pointerSmooth);
    const target = Math.min(Math.abs(stage.scrollVel) * 0.08, 1);
    u.uScroll.value += (target - u.uScroll.value) * 0.08;
  }

  dispose() {
    this.object.geometry.dispose();
    this.material.dispose();
  }
}
