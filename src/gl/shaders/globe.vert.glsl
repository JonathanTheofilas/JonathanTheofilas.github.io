// Point-sphere globe: displace points along their normal with simplex noise and
// warp toward the cursor. Rotation is applied to the object on the CPU.

#include "./lib/noise.glsl"

uniform float uTime;
uniform float uSize;
uniform float uRadius;
uniform vec2 uMouse;     // smoothed, normalized -1..1
uniform float uScroll;

varying float vDepth;
varying float vNoise;

void main() {
  vec3 p = position;          // unit sphere point
  vec3 n = normalize(position);

  // animated surface displacement
  float ns = snoise(n * 1.6 + vec3(0.0, 0.0, uTime * 0.15));
  vNoise = ns;
  p += n * ns * 0.16;

  // cursor warp: bulge points that face the cursor direction
  vec3 mdir = normalize(vec3(uMouse, 0.85));
  float facing = max(dot(n, mdir), 0.0);
  p += n * pow(facing, 2.0) * 0.18;

  // scroll subtly inflates the globe
  p *= 1.0 + uScroll * 0.04;

  vec4 mv = modelViewMatrix * vec4(p * uRadius, 1.0);
  vDepth = clamp((mv.z / uRadius) * 0.5 + 0.5, 0.0, 1.0);

  // near points larger, far points smaller (depth cue under ortho)
  gl_PointSize = uSize * (0.35 + 0.9 * vDepth);
  gl_Position = projectionMatrix * mv;
}
