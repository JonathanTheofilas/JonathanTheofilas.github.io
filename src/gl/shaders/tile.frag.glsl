// Per-project generative texture (no images). A seeded gradient + domain-warped
// fbm + contour bands, that "develops" and liquid-distorts toward the cursor on
// hover.

#include "./lib/noise.glsl"

uniform float uSeed;
uniform float uHover;    // 0..1
uniform float uTime;
uniform vec2 uMouse;     // local uv 0..1
uniform float uAspect;   // w/h
uniform vec3 uGold;
uniform vec3 uGoldDeep;

varying vec2 vUv;

void main() {
  vec2 uv = vUv;
  vec2 am = vec2((uv.x - uMouse.x) * uAspect, uv.y - uMouse.y);
  float d = length(am);

  // liquid displacement toward the cursor on hover
  float ripple = sin(d * 16.0 - uTime * 2.2) * 0.018 * uHover;
  float warp = fbm(vec3(uv * 3.0 + uSeed, uTime * 0.08));
  uv += normalize(am + 1e-4) * ripple;
  uv += (warp - 0.5) * 0.03 * uHover;

  // seeded generative texture
  float ang = uSeed * 0.7;
  vec2 dir = vec2(cos(ang), sin(ang));
  float grad = dot(uv - 0.5, dir) + 0.5;
  float g = fbm(vec3(uv * 2.6 + uSeed * 1.7, uSeed));
  float bands = 0.5 + 0.5 * sin((grad * 7.0) + g * 4.0 + uSeed);

  vec3 base = mix(uGoldDeep, uGold, clamp(grad * 0.7 + g * 0.4, 0.0, 1.0));
  base = mix(base, base * 1.25, bands * 0.4);

  // reveal: dim at rest, full under hover
  vec3 col = base * mix(0.16, 1.0, uHover);

  // cursor glow
  col += uGold * exp(-d * 3.0) * uHover * 0.35;

  gl_FragColor = vec4(col, 0.92);
}
