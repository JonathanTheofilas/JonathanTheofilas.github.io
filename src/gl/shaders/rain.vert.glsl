// Shader-driven rain: each point falls on a loop (no per-frame CPU upload) and
// clamps onto the umbrella canopy paraboloid when it hits, marking a splash.

uniform float uTime;
uniform float uTop;       // spawn height
uniform float uFall;      // fall distance before recycle
uniform float uCanopyY;   // canopy apex height
uniform float uCanopyR;   // canopy radius
uniform float uK;         // paraboloid steepness
uniform float uSize;

attribute float aPhase;
attribute float aSpeed;

varying float vSplash;

void main() {
  vec3 p = position; // x,z = column; y unused (recomputed)
  float t = uTime * aSpeed + aPhase;
  float fall = fract(t);
  float y = uTop - fall * uFall;

  float r = length(p.xz);
  float surf = uCanopyY - uK * r * r; // dome: high center, low rim
  vSplash = 0.0;
  if (r < uCanopyR && y < surf) {
    y = surf;
    vSplash = 1.0;
  }

  vec4 mv = modelViewMatrix * vec4(p.x, y, p.z, 1.0);
  gl_PointSize = uSize * (vSplash > 0.5 ? 2.2 : 1.0) * (300.0 / -mv.z);
  gl_Position = projectionMatrix * mv;
}
