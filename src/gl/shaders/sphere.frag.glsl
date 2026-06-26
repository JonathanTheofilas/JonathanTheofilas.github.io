// Abstract electric energy core: fresnel rim + churning interior energy veins,
// blooming on each flash.

#include "./lib/noise.glsl"

uniform float uTime;
uniform float uFlash;
uniform vec3 uCore;
uniform vec3 uRim;
uniform vec3 uDeep;

varying vec3 vNormal;
varying vec3 vView;
varying vec3 vPos;

void main() {
  float fres = pow(1.0 - max(dot(vView, vNormal), 0.0), 3.0);
  float churn = fbm(vPos * 2.2 + vec3(0.0, 0.0, uTime * 0.3));

  vec3 inner = mix(uDeep, uCore, smoothstep(-0.3, 0.7, churn));
  vec3 col = inner * 0.45 + uRim * fres * 1.5;
  col += uCore * smoothstep(0.72, 1.0, churn) * (0.5 + uFlash * 1.5); // veins
  col += uCore * fres * uFlash * 1.6;                                  // flash bloom

  gl_FragColor = vec4(col, 1.0);
}
