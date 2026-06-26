// Churning dark storm-cloud shell around the core. Cheap volumetric *look* via
// domain-warped fbm density + fresnel edge; lights up on each flash.

#include "./lib/noise.glsl"

uniform float uTime;
uniform float uFlash;
uniform vec3 uCloud;
uniform vec3 uEdge;

varying vec3 vNormal;
varying vec3 vView;
varying vec3 vPos;

void main() {
  float fres = pow(1.0 - abs(dot(vView, vNormal)), 2.0);
  vec3 q = vPos * 1.8 + vec3(uTime * 0.15, uTime * 0.1, uTime * 0.05);
  float d = fbm(q + vec3(fbm(q * 0.6)));
  float dens = smoothstep(0.0, 0.85, d);

  vec3 col = mix(uCloud, uEdge, fres * 0.8);
  col += uEdge * uFlash * 0.7; // clouds flash on strike

  float alpha = dens * (0.32 + fres * 0.55);
  gl_FragColor = vec4(col, alpha);
}
