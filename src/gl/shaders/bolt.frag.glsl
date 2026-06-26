// Glowing bolt ribbon: hot white-blue core, electric-blue falloff to the edges.

uniform vec3 uCore;
uniform vec3 uGlow;

varying float vT;
varying float vB;

void main() {
  float a = abs(vT);
  float core = pow(smoothstep(0.55, 0.0, a), 2.0); // tight bright center
  float glow = exp(-a * 2.6);                       // soft electric halo
  vec3 col = uGlow * glow + uCore * core;
  gl_FragColor = vec4(col * vB, (glow * 0.6 + core) * vB);
}
