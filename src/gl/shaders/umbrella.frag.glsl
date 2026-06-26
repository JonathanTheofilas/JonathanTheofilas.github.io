// Dark umbrella canopy with cyan edge rim and faint radial panel ribs.

uniform float uTime;
uniform float uFlash;
uniform vec3 uCanopy;
uniform vec3 uEdge;

varying vec3 vNormal;
varying vec3 vView;
varying vec3 vPos;

void main() {
  float fres = pow(1.0 - max(dot(vView, vNormal), 0.0), 2.0);
  float ang = atan(vPos.z, vPos.x);
  float ribs = smoothstep(0.42, 0.5, abs(fract(ang / (6.2831853 / 8.0)) - 0.5));

  vec3 col = mix(uCanopy, uEdge, fres * 0.7);
  col = mix(col, uEdge * 0.7, ribs * 0.35);
  col += uEdge * uFlash * 0.5;

  gl_FragColor = vec4(col, 1.0);
}
