// Display pass: turn the trail energy field into branching electric filaments,
// over a faint drifting grid/horizon, on opaque navy.

#include "./lib/noise.glsl"

uniform sampler2D uTrail;
uniform float uTime;
uniform vec2 uRes;
uniform vec2 uMouse;
uniform float uSpeed;
uniform float uScroll;

varying vec2 vUv;

const vec3 BG   = vec3(0.024, 0.031, 0.059); // #06080f
const vec3 BLUE = vec3(0.231, 0.510, 0.965); // #3b82f6
const vec3 CYAN = vec3(0.220, 0.741, 0.973); // #38bdf8
const vec3 CORE = vec3(0.859, 0.918, 0.996); // #dbeafe

float ridged(vec3 p) { return 1.0 - abs(snoise(p)); }

void main() {
  float aspect = uRes.x / uRes.y;
  vec2 p = vec2((vUv.x - 0.5) * aspect, vUv.y - 0.5);

  // --- ambient electric grid / horizon (quiet base) ---
  float horizon = 0.16;
  float depth = vUv.y - horizon;
  float persp = 1.0 / max(abs(depth) * 3.0 + 0.06, 0.06);
  float gx = abs(fract(p.x * persp * 3.0) - 0.5);
  float gy = abs(fract((uTime * 0.04 + persp)) - 0.5);
  float lines = max(smoothstep(0.5, 0.46, gx), smoothstep(0.5, 0.47, gy));
  float grid = lines * smoothstep(0.0, 0.4, depth) * 0.05;

  // --- lightning filaments masked by the trail field ---
  float t = texture2D(uTrail, vUv).r;
  vec2 w = vec2(
    snoise(vec3(p * 2.0, uTime * 0.2)),
    snoise(vec3(p * 2.0 + 5.0, uTime * 0.2))
  );
  vec3 q = vec3((p + w * 0.25) * 7.0, uTime * 0.5);
  float f = ridged(q);
  float f2 = ridged(q * 2.1 + 3.0);
  float thr = mix(0.965, 0.9, clamp(uSpeed, 0.0, 1.0));
  float fil = smoothstep(thr, 1.0, f) + smoothstep(thr + 0.02, 1.0, f2) * 0.5;
  float flicker = 0.7 + 0.3 * snoise(vec3(p * 10.0, uTime * 7.0));
  fil *= clamp(t, 0.0, 1.0) * flicker;

  float core = pow(fil, 3.0);
  float glow = smoothstep(0.0, 0.7, t) * 0.6;

  vec3 col = BG;
  col += grid * BLUE;
  col += glow * BLUE;
  col += fil * CYAN;
  col += core * CORE;

  gl_FragColor = vec4(col, 1.0);
}
