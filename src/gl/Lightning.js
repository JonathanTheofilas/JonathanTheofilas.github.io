// Cursor-following electric "lightning" background. A ping-pong FBO accumulates
// a decaying trail of the cursor path; a display quad turns that field into
// branching filaments over a faint grid. Runs inside the single Stage tick.

import {
  PlaneGeometry,
  Mesh,
  Scene,
  OrthographicCamera,
  ShaderMaterial,
  WebGLRenderTarget,
  HalfFloatType,
  RGBAFormat,
  LinearFilter,
  ClampToEdgeWrapping,
  Vector2,
} from "three";
import vert from "./shaders/field.vert.glsl";
import trailFrag from "./shaders/trail.frag.glsl";
import lightningFrag from "./shaders/lightning.frag.glsl";
import { coarsePointer } from "../modules/device.js";

export class Lightning {
  constructor() {
    this.simScale = 0.5; // half-res trail field

    // offscreen sim
    this.simScene = new Scene();
    this.simCam = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.trailMat = new ShaderMaterial({
      uniforms: {
        uPrev: { value: null },
        uRes: { value: new Vector2(1, 1) },
        uMouse: { value: new Vector2(0.5, 0.5) },
        uPrevMouse: { value: new Vector2(0.5, 0.5) },
        uSpeed: { value: 0 },
        uDecay: { value: 0.95 },
        uTime: { value: 0 },
      },
      vertexShader: vert,
      fragmentShader: trailFrag,
      depthTest: false,
      depthWrite: false,
    });
    this.simQuad = new Mesh(new PlaneGeometry(2, 2), this.trailMat);
    this.simScene.add(this.simQuad);

    // display quad (a Stage layer object)
    this.dispMat = new ShaderMaterial({
      uniforms: {
        uTrail: { value: null },
        uTime: { value: 0 },
        uRes: { value: new Vector2(1, 1) },
        uMouse: { value: new Vector2(0.5, 0.5) },
        uSpeed: { value: 0 },
        uScroll: { value: 0 },
        uFlash: { value: 0 },
      },
      vertexShader: vert,
      fragmentShader: lightningFrag,
      depthTest: false,
      depthWrite: false,
      transparent: false,
    });
    this.object = new Mesh(new PlaneGeometry(1, 1), this.dispMat);
    this.object.position.z = -60;
    this.object.frustumCulled = false;

    this.rtA = null;
    this.rtB = null;
    this.read = null;
    this.write = null;
    this._cleared = false;

    this.mouseUv = new Vector2(0.5, 0.5);
    this.prevMouseUv = new Vector2(0.5, 0.5);
    this._speed = 0;
  }

  _makeRT(w, h) {
    return new WebGLRenderTarget(w, h, {
      type: HalfFloatType,
      format: RGBAFormat,
      minFilter: LinearFilter,
      magFilter: LinearFilter,
      depthBuffer: false,
      stencilBuffer: false,
      wrapS: ClampToEdgeWrapping,
      wrapT: ClampToEdgeWrapping,
    });
  }

  resize(stage) {
    const { w, h, dpr } = stage.size;
    this.object.scale.set(w, h, 1);
    this.dispMat.uniforms.uRes.value.set(w, h);

    const sw = Math.max(2, Math.ceil(w * dpr * this.simScale));
    const sh = Math.max(2, Math.ceil(h * dpr * this.simScale));
    if (!this.rtA) {
      this.rtA = this._makeRT(sw, sh);
      this.rtB = this._makeRT(sw, sh);
      this.read = this.rtA;
      this.write = this.rtB;
    } else {
      this.rtA.setSize(sw, sh);
      this.rtB.setSize(sw, sh);
    }
    this._cleared = false;
    this.trailMat.uniforms.uRes.value.set(sw, sh);
  }

  update(dt, stage) {
    const r = stage.renderer;
    if (!this.read) return;

    if (!this._cleared) {
      r.setRenderTarget(this.rtA);
      r.clear();
      r.setRenderTarget(this.rtB);
      r.clear();
      r.setRenderTarget(null);
      this._cleared = true;
    }

    // cursor position in uv (phantom Lissajous path on touch)
    this.prevMouseUv.copy(this.mouseUv);
    if (coarsePointer) {
      const tt = stage.time;
      this.mouseUv.set(
        0.5 + 0.32 * Math.sin(tt * 0.5),
        0.5 + 0.26 * Math.sin(tt * 0.37 + 1.3)
      );
    } else {
      this.mouseUv.set(
        stage.pointerSmooth.x * 0.5 + 0.5,
        stage.pointerSmooth.y * 0.5 + 0.5
      );
    }
    const moved = this.mouseUv.distanceTo(this.prevMouseUv);
    const targetSpeed = Math.min((moved / Math.max(dt, 1e-3)) * 0.7, 1.0);
    this._speed += (targetSpeed - this._speed) * 0.2;

    // --- sim pass ---
    const tu = this.trailMat.uniforms;
    tu.uPrev.value = this.read.texture;
    tu.uMouse.value.copy(this.mouseUv);
    tu.uPrevMouse.value.copy(this.prevMouseUv);
    tu.uSpeed.value = this._speed;
    tu.uTime.value = stage.time;

    r.setRenderTarget(this.write);
    r.render(this.simScene, this.simCam);
    r.setRenderTarget(null);

    // swap so read holds the freshest frame
    const tmp = this.read;
    this.read = this.write;
    this.write = tmp;

    // --- display uniforms ---
    const du = this.dispMat.uniforms;
    du.uTrail.value = this.read.texture;
    du.uTime.value = stage.time;
    du.uMouse.value.copy(this.mouseUv);
    du.uSpeed.value = this._speed;
    du.uFlash.value = stage.flash;
    const sc = Math.min(Math.abs(stage.scrollVel) * 0.05, 1);
    du.uScroll.value += (sc - du.uScroll.value) * 0.1;
  }

  dispose() {
    if (this.rtA) this.rtA.dispose();
    if (this.rtB) this.rtB.dispose();
    this.trailMat.dispose();
    this.dispMat.dispose();
    this.simQuad.geometry.dispose();
    this.object.geometry.dispose();
  }
}
