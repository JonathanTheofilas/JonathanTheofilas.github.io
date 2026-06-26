// Soft circular points, gold near / dim far, with a touch of noise-driven tint.

uniform vec3 uColorBright;
uniform vec3 uColorDim;

varying float vDepth;
varying float vNoise;

void main() {
  // circular point with soft edge
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  if (d > 0.5) discard;
  float soft = smoothstep(0.5, 0.1, d);

  vec3 col = mix(uColorDim, uColorBright, vDepth * 0.85 + vNoise * 0.15);
  float alpha = soft * (0.25 + vDepth * 0.75);

  gl_FragColor = vec4(col, alpha);
}
