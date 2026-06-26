// Ambient flow field behind the content. Subtle gold filaments drifting on an
// fbm field, brightening toward the cursor and streaking with scroll velocity.

#include "./lib/noise.glsl"

uniform float uTime;
uniform vec2 uMouse;     // normalized -1..1
uniform float uScroll;   // 0..1 magnitude
uniform vec2 uRes;
uniform vec3 uGold;

varying vec2 vUv;

void main() {
  float aspect = uRes.x / uRes.y;
  vec2 p = (vUv - 0.5) * vec2(aspect, 1.0);

  // drifting flow, slightly stretched vertically by scroll velocity
  vec3 q = vec3(p * 2.2, uTime * 0.04);
  q.y += uScroll * 0.6;
  float n = fbm(q);
  float filaments = smoothstep(0.15, 0.75, n);

  // soft glow following the cursor
  vec2 m = uMouse * 0.5 * vec2(aspect, 1.0);
  float glow = exp(-length(p - m) * 2.2);

  float v = filaments * 0.16 + glow * 0.22 + uScroll * 0.05;

  vec3 col = mix(vec3(0.015, 0.015, 0.03), uGold, v);
  // vignette so the center stays calm behind text
  float vig = smoothstep(1.1, 0.2, length(p));
  gl_FragColor = vec4(col, v * 0.6 * vig);
}
