// Project distortion grid: one shader plane per completed-project tile, synced
// to the tile's DOM rect. Each tile renders a seeded generative texture that
// develops and liquid-distorts toward the cursor on hover.

import {
  PlaneGeometry,
  Mesh,
  Group,
  ShaderMaterial,
  Color,
  Vector2,
} from "three";
import { gsap } from "gsap";
import vert from "./shaders/tile.vert.glsl";
import frag from "./shaders/tile.frag.glsl";
import { syncToRect, isOnScreen } from "./DomSync.js";
import { finePointer } from "../modules/device.js";

const GEO = new PlaneGeometry(1, 1);
// electric palette (uniform names kept for minimal churn)
const GOLD = new Color(0x49b6f7); // cyan-blue accent
const GOLD_DEEP = new Color(0x0a0e1c); // deep navy

export class ProjectGrid {
  constructor(tileEls) {
    this.object = new Group();
    this.tiles = [];

    tileEls.forEach((el) => {
      const seed = parseFloat(el.dataset.seed) || 1;
      const isStatic = el.hasAttribute("data-static");
      const material = new ShaderMaterial({
        uniforms: {
          uSeed: { value: seed },
          uHover: { value: isStatic ? 0.28 : finePointer ? 0 : 0.5 },
          uTime: { value: 0 },
          uMouse: { value: new Vector2(0.5, 0.5) },
          uAspect: { value: 1 },
          uGold: { value: GOLD },
          uGoldDeep: { value: GOLD_DEEP },
        },
        vertexShader: vert,
        fragmentShader: frag,
        transparent: true,
        depthTest: false,
        depthWrite: false,
      });
      const mesh = new Mesh(GEO, material);
      mesh.frustumCulled = false;
      this.object.add(mesh);

      const tile = { el, mesh, material };
      this.tiles.push(tile);
      if (finePointer && !isStatic) this._bind(tile);
    });
  }

  _bind(tile) {
    const { el, material } = tile;
    el.addEventListener("pointerenter", () => {
      gsap.to(material.uniforms.uHover, {
        value: 1,
        duration: 0.5,
        ease: "power2.out",
      });
    });
    el.addEventListener("pointerleave", () => {
      gsap.to(material.uniforms.uHover, {
        value: 0,
        duration: 0.6,
        ease: "power2.out",
      });
    });
    el.addEventListener(
      "pointermove",
      (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        // smooth toward the cursor
        gsap.to(material.uniforms.uMouse.value, {
          x,
          y: 1 - y,
          duration: 0.3,
          ease: "power2.out",
          overwrite: true,
        });
        // drive the CSS spotlight border too
        el.style.setProperty("--mx", `${e.clientX - r.left}px`);
        el.style.setProperty("--my", `${e.clientY - r.top}px`);
      },
      { passive: true }
    );
  }

  update(dt, stage) {
    for (const t of this.tiles) {
      if (!isOnScreen(t.el, 120)) {
        t.mesh.visible = false;
        continue;
      }
      t.mesh.visible = true;
      const r = syncToRect(t.mesh, t.el, stage, { fill: true });
      t.material.uniforms.uAspect.value = r.width / Math.max(1, r.height);
      t.material.uniforms.uTime.value = stage.time;
    }
  }

  dispose() {
    for (const t of this.tiles) t.material.dispose();
    GEO.dispose();
  }
}
