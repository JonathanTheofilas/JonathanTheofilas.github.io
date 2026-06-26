// Map a DOM element's viewport rect onto the pixel-mapped orthographic camera.
// The canvas is fixed/full-viewport, so an element's getBoundingClientRect is
// already in the camera's coordinate space (origin at screen center, y up).

export function syncToRect(object, el, stage, { fill = true } = {}) {
  const r = el.getBoundingClientRect();
  const { w, h } = stage.size;
  object.position.x = r.left + r.width / 2 - w / 2;
  object.position.y = -(r.top + r.height / 2 - h / 2);
  if (fill) {
    object.scale.x = r.width;
    object.scale.y = r.height;
  }
  return r;
}

// Visibility test against the viewport (with margin) so offscreen layers can be
// skipped.
export function isOnScreen(el, margin = 200) {
  const r = el.getBoundingClientRect();
  return r.bottom > -margin && r.top < window.innerHeight + margin;
}
