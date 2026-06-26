varying vec3 vNormal;
varying vec3 vView;
varying vec3 vPos;

void main() {
  vPos = position;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vNormal = normalize(mat3(modelMatrix) * normal);
  vView = normalize(cameraPosition - wp.xyz);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
