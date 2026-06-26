// The single shared WebGL stage. One renderer, one scene, one orthographic
// camera mapped 1:1 to CSS pixels, driven by the GSAP ticker (one rAF for the
// whole site). Layers (globe, particles, project grid) are plugged in.

import {
  WebGLRenderer,
  Scene,
  OrthographicCamera,
  Vector2,
} from "three";
import { gsap } from "gsap";

export class Stage {
  constructor(canvas) {
    this.canvas = canvas;
    this.layers = [];
    this.running = false;

    this.size = { w: window.innerWidth, h: window.innerHeight, dpr: 1 };

    // pointer in normalized (-1..1) and smoothed normalized
    this.pointer = new Vector2(0, 0);
    this.pointerSmooth = new Vector2(0, 0);
    this.time = 0;
    this.scrollVel = 0;

    this.renderer = new WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    this.renderer.setClearColor(0x000000, 0);

    this.scene = new Scene();
    this.camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 1000);
    this.camera.position.z = 100;

    this._onResize = this.resize.bind(this);
    this._onPointer = (e) => {
      this.pointer.x = (e.clientX / this.size.w) * 2 - 1;
      this.pointer.y = -((e.clientY / this.size.h) * 2 - 1);
    };
    this._onVisibility = () => {
      if (document.hidden) this.stop();
      else this.start();
    };

    window.addEventListener("resize", this._onResize);
    window.addEventListener("pointermove", this._onPointer, { passive: true });
    document.addEventListener("visibilitychange", this._onVisibility);

    this.resize();
  }

  add(layer) {
    this.layers.push(layer);
    if (layer.object) this.scene.add(layer.object);
    if (layer.resize) layer.resize(this);
    return layer;
  }

  resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.size = { w, h, dpr };

    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(w, h, false);

    this.camera.left = -w / 2;
    this.camera.right = w / 2;
    this.camera.top = h / 2;
    this.camera.bottom = -h / 2;
    this.camera.updateProjectionMatrix();

    for (const l of this.layers) if (l.resize) l.resize(this);
  }

  setScrollVelocity(v) {
    this.scrollVel = v;
  }

  _tick = (time, deltaMs) => {
    const dt = Math.min(deltaMs / 1000, 0.05);
    this.time += dt;

    // smooth pointer toward target
    this.pointerSmooth.x += (this.pointer.x - this.pointerSmooth.x) * 0.08;
    this.pointerSmooth.y += (this.pointer.y - this.pointerSmooth.y) * 0.08;

    for (const l of this.layers) if (l.update) l.update(dt, this);

    this.renderer.render(this.scene, this.camera);
  };

  start() {
    if (this.running) return;
    this.running = true;
    gsap.ticker.add(this._tick);
  }

  stop() {
    if (!this.running) return;
    this.running = false;
    gsap.ticker.remove(this._tick);
  }

  dispose() {
    this.stop();
    window.removeEventListener("resize", this._onResize);
    window.removeEventListener("pointermove", this._onPointer);
    document.removeEventListener("visibilitychange", this._onVisibility);
    for (const l of this.layers) if (l.dispose) l.dispose();
    this.renderer.dispose();
  }
}
