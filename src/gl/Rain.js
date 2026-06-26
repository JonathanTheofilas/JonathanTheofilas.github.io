// GPU rain: THREE.Points whose fall + canopy bounce are computed entirely in
// the vertex shader (no per-frame buffer upload). Built into the umbrella scene.

import {
  BufferGeometry,
  BufferAttribute,
  Points,
  ShaderMaterial,
  AdditiveBlending,
  Color,
} from "three";
import vert from "./shaders/rain.vert.glsl";
import frag from "./shaders/rain.frag.glsl";

export function createRain(count, spread) {
  const pos = new Float32Array(count * 3);
  const phase = new Float32Array(count);
  const speed = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (Math.random() * 2 - 1) * spread;
    pos[i * 3 + 1] = 0;
    pos[i * 3 + 2] = (Math.random() * 2 - 1) * spread * 0.5;
    phase[i] = Math.random();
    speed[i] = 0.6 + Math.random() * 0.8;
  }

  const geo = new BufferGeometry();
  geo.setAttribute("position", new BufferAttribute(pos, 3));
  geo.setAttribute("aPhase", new BufferAttribute(phase, 1));
  geo.setAttribute("aSpeed", new BufferAttribute(speed, 1));

  const material = new ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uTop: { value: 2.6 },
      uFall: { value: 5.2 },
      uCanopyY: { value: 0.7 },
      uCanopyR: { value: 1.45 },
      uK: { value: 0.34 },
      uSize: { value: 1.4 },
      uColor: { value: new Color(0x6cc4ff) },
      uSplash: { value: new Color(0xeaf6ff) },
    },
    vertexShader: vert,
    fragmentShader: frag,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  });

  const points = new Points(geo, material);
  points.frustumCulled = false;
  return { points, material };
}
