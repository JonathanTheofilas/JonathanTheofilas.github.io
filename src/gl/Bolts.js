// Cursor-spawned branching lightning. An ortho-scene layer at z=-40 that fires
// bolts from the cursor at random intervals, each flashing the shared bus.

import {
  BufferGeometry,
  BufferAttribute,
  Mesh,
  ShaderMaterial,
  AdditiveBlending,
  Color,
} from "three";
import vert from "./shaders/bolt.vert.glsl";
import frag from "./shaders/bolt.frag.glsl";
import { generateBolt, writeRibbon } from "./lib/bolt.js";
import { finePointer } from "../modules/device.js";
import { isOnScreen } from "./DomSync.js";

const MAX_VERTS = 6144;
const Z = -40;

export class Bolts {
  constructor(heroAnchor = null) {
    this.heroAnchor = heroAnchor;

    this.pos = new Float32Array(MAX_VERTS * 3);
    this.aT = new Float32Array(MAX_VERTS);
    this.aBright = new Float32Array(MAX_VERTS);

    const geo = new BufferGeometry();
    this.posAttr = new BufferAttribute(this.pos, 3);
    this.tAttr = new BufferAttribute(this.aT, 1);
    this.brightAttr = new BufferAttribute(this.aBright, 1);
    this.posAttr.setUsage(35048); // DynamicDraw
    this.tAttr.setUsage(35048);
    this.brightAttr.setUsage(35048);
    geo.setAttribute("position", this.posAttr);
    geo.setAttribute("aT", this.tAttr);
    geo.setAttribute("aBright", this.brightAttr);
    geo.setDrawRange(0, 0);
    this.geo = geo;

    this.material = new ShaderMaterial({
      uniforms: {
        uCore: { value: new Color(0xdbeafe) },
        uGlow: { value: new Color(0x49b6f7) },
      },
      vertexShader: vert,
      fragmentShader: frag,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      blending: AdditiveBlending,
    });

    this.object = new Mesh(geo, this.material);
    this.object.frustumCulled = false;
    this.object.renderOrder = 2;

    // pool of bolt slots (each holds a baked ribbon + a fading life)
    this.slots = [];
    for (let i = 0; i < 6; i++) {
      this.slots.push({
        active: false,
        life: 0,
        dur: 0.3,
        pos: new Float32Array(1536 * 3),
        t: new Float32Array(1536),
        bright: new Float32Array(1536),
        count: 0,
      });
    }
    this._timer = this._nextInterval();
  }

  _nextInterval() {
    return 0.4 + Math.random() * 1.8;
  }

  _spawn(stage) {
    const slot = this.slots.find((s) => !s.active);
    if (!slot) return;

    // cursor in ortho pixel space (origin center, y up)
    const cx = stage.pointerSmooth.x * (stage.size.w / 2);
    const cy = stage.pointerSmooth.y * (stage.size.h / 2);

    // target: random direction, or bias toward the hero orb when it's visible
    let tx, ty;
    const biasHero =
      this.heroAnchor && isOnScreen(this.heroAnchor, 0) && Math.random() < 0.55;
    if (biasHero) {
      const r = this.heroAnchor.getBoundingClientRect();
      tx = r.left + r.width / 2 - stage.size.w / 2;
      ty = -(r.top + r.height / 2 - stage.size.h / 2);
    } else {
      const ang = Math.random() * Math.PI * 2;
      const dist = 120 + Math.random() * 320;
      tx = cx + Math.cos(ang) * dist;
      ty = cy + Math.sin(ang) * dist;
    }

    const polylines = generateBolt({ x: cx, y: cy }, { x: tx, y: ty });
    let idx = 0;
    for (const pl of polylines) {
      idx = writeRibbon(
        pl.pts,
        2.2 * pl.width,
        pl.width,
        Z,
        slot.pos,
        slot.t,
        slot.bright,
        idx
      );
      if (idx > 1500) break; // safety
    }
    slot.count = idx;
    slot.life = 1;
    slot.dur = 0.18 + Math.random() * 0.22;
    slot.active = true;

    stage.flash = Math.max(stage.flash, 0.7 + Math.random() * 0.3);
  }

  update(dt, stage) {
    // schedule
    if (finePointer) {
      this._timer -= dt;
      if (this._timer <= 0) {
        this._spawn(stage);
        this._timer = this._nextInterval();
      }
    }

    // assemble active slots into the shared buffers
    let idx = 0;
    for (const s of this.slots) {
      if (!s.active) continue;
      s.life -= dt / s.dur;
      if (s.life <= 0) {
        s.active = false;
        continue;
      }
      const b = s.life * s.life; // ease-out brightness
      for (let i = 0; i < s.count && idx < MAX_VERTS; i++) {
        this.pos[idx * 3] = s.pos[i * 3];
        this.pos[idx * 3 + 1] = s.pos[i * 3 + 1];
        this.pos[idx * 3 + 2] = s.pos[i * 3 + 2];
        this.aT[idx] = s.t[i];
        this.aBright[idx] = s.bright[i] * b;
        idx++;
      }
    }

    this.geo.setDrawRange(0, idx);
    if (idx > 0) {
      this.posAttr.needsUpdate = true;
      this.tAttr.needsUpdate = true;
      this.brightAttr.needsUpdate = true;
    }
  }

  dispose() {
    this.geo.dispose();
    this.material.dispose();
  }
}
