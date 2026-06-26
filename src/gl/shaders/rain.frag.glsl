uniform vec3 uColor;
uniform vec3 uSplash;

varying float vSplash;

void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  if (d > 0.5) discard;
  float a = smoothstep(0.5, 0.05, d);
  vec3 col = mix(uColor, uSplash, vSplash);
  gl_FragColor = vec4(col, a * (vSplash > 0.5 ? 0.95 : 0.6));
}
