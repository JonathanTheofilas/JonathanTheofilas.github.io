// Light full-screen rain: sparse procedural streaks falling with a slight wind
// slant. Additive, low intensity, present across the whole site.

uniform float uTime;
uniform vec2 uRes;

varying vec2 vUv;

float hash(float x) { return fract(sin(x * 127.1) * 43758.5453); }

void main() {
  float aspect = uRes.x / uRes.y;
  vec2 uv = vUv;
  uv.x *= aspect;
  uv.x += uv.y * 0.06; // wind slant

  float cols = 70.0;
  float c = floor(uv.x * cols);
  float speed = 0.7 + hash(c) * 0.9;
  float off = hash(c * 1.7) * 10.0;

  float colMask = smoothstep(0.5, 0.0, abs(fract(uv.x * cols) - 0.5));
  // +uTime so the drop head moves DOWN the column (uv.y is 0 at the bottom)
  float yy = fract(uv.y * 2.0 + uTime * speed + off);
  float head = pow(yy, 18.0); // sharp falling drop head

  float drop = head * colMask * step(0.45, hash(c * 2.3)); // sparse columns
  float intensity = drop * 0.35; // light

  gl_FragColor = vec4(vec3(0.6, 0.82, 1.0) * intensity, intensity);
}
