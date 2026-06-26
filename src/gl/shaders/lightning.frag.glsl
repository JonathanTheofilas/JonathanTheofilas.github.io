// Faint electric grid/horizon on opaque navy. Brightens on each flash. No
// cursor-following filaments.

#include "./lib/noise.glsl"

uniform float uTime;
uniform vec2 uRes;
uniform float uScroll;
uniform float uFlash;

varying vec2 vUv;

const vec3 BG   = vec3(0.024, 0.031, 0.059);
const vec3 BLUE = vec3(0.231, 0.510, 0.965);
const vec3 CYAN = vec3(0.220, 0.741, 0.973);

void main() {
  float aspect = uRes.x / uRes.y;
  vec2 p = vec2((vUv.x - 0.5) * aspect, vUv.y - 0.5);

  // drifting perspective grid below a low horizon
  float horizon = 0.16;
  float depth = vUv.y - horizon;
  float persp = 1.0 / max(abs(depth) * 3.0 + 0.06, 0.06);
  float gx = abs(fract(p.x * persp * 3.0) - 0.5);
  float gy = abs(fract(uTime * 0.04 + persp) - 0.5);
  float lines = max(smoothstep(0.5, 0.46, gx), smoothstep(0.5, 0.47, gy));
  float grid = lines * smoothstep(0.0, 0.4, depth) * 0.06;

  // faint drifting energy haze
  float haze = fbm(vec3(p * 1.5, uTime * 0.05)) * 0.5 + 0.5;
  float ambient = smoothstep(0.55, 1.0, haze) * 0.04;

  float flash = clamp(uFlash, 0.0, 1.5);

  vec3 col = BG;
  col += grid * BLUE * (1.0 + flash * 2.0);
  col += ambient * CYAN;
  col += BLUE * flash * 0.14; // strike wash over the whole field

  gl_FragColor = vec4(col, 1.0);
}
