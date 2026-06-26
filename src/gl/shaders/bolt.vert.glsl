attribute float aT;      // -1..1 across the ribbon
attribute float aBright; // per-vertex brightness (edge * life)

varying float vT;
varying float vB;

void main() {
  vT = aT;
  vB = aBright;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
