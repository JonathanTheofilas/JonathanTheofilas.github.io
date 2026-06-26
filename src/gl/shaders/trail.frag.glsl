// Ping-pong trail simulation: decay the previous field and deposit a brush
// along the segment the cursor swept this frame. Output energy in .r.

#include "./lib/noise.glsl"

uniform sampler2D uPrev;
uniform vec2 uRes;       // sim target px
uniform vec2 uMouse;     // uv 0..1
uniform vec2 uPrevMouse; // uv 0..1
uniform float uSpeed;    // 0..1
uniform float uDecay;
uniform float uTime;

varying vec2 vUv;

float segDist(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a;
  vec2 ba = b - a;
  float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-6), 0.0, 1.0);
  return length(pa - ba * h);
}

void main() {
  float aspect = uRes.x / uRes.y;
  vec2 p = vec2(vUv.x * aspect, vUv.y);
  vec2 a = vec2(uPrevMouse.x * aspect, uPrevMouse.y);
  vec2 b = vec2(uMouse.x * aspect, uMouse.y);

  float prev = texture2D(uPrev, vUv).r;
  float trail = prev * uDecay;

  float d = segDist(p, a, b);
  float jit = 0.6 + 0.4 * snoise(vec3(p * 6.0, uTime * 0.6));
  float radius = 0.05 * jit;
  float brush = smoothstep(radius, 0.0, d) * (0.35 + uSpeed * 1.7);

  trail = clamp(trail + brush, 0.0, 1.6);
  gl_FragColor = vec4(trail, 0.0, 0.0, 1.0);
}
