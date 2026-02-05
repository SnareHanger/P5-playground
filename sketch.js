const CANVAS_SIZE = 400;
const ANCHOR_SIZE = 12;
const ANCHOR_HIT_RADIUS = 15;

let shapeSelect, posX, posY, dimW, dimH;
let fillColor, strokeColor, strokeW;
let arcStart, arcStop, arcModeSelect;

let draggedAnchor = null;
let anchors = [];

function setup() {
  createCanvas(CANVAS_SIZE, CANVAS_SIZE).parent('canvas-container');

  shapeSelect = select('#shape-select');
  posX = select('#pos-x');
  posY = select('#pos-y');
  dimW = select('#dim-w');
  dimH = select('#dim-h');
  fillColor = select('#fill-color');
  strokeColor = select('#stroke-color');
  strokeW = select('#stroke-weight');
  arcStart = select('#arc-start');
  arcStop = select('#arc-stop');
  arcModeSelect = select('#arc-mode');

  wireSlider('pos-x', 'pos-x-val');
  wireSlider('pos-y', 'pos-y-val');
  wireSlider('dim-w', 'dim-w-val');
  wireSlider('dim-h', 'dim-h-val');
  wireSlider('stroke-weight', 'stroke-weight-val');
  wireSlider('arc-start', 'arc-start-val', '°');
  wireSlider('arc-stop', 'arc-stop-val', '°');

  shapeSelect.changed(updateControlsVisibility);
  updateControlsVisibility();
}

function wireSlider(sliderId, displayId, suffix = '') {
  const slider = document.getElementById(sliderId);
  const display = document.getElementById(displayId);
  slider.addEventListener('input', () => {
    display.textContent = slider.value + suffix;
  });
}

const shapeControls = {
  rectangle: { dimensions: true, arc: false, fill: true },
  ellipse:   { dimensions: true, arc: false, fill: true },
  triangle:  { dimensions: true, arc: false, fill: true },
  quad:      { dimensions: true, arc: false, fill: true },
  line:      { dimensions: true, arc: false, fill: false },
  arc:       { dimensions: true, arc: true,  fill: true },
  point:     { dimensions: false, arc: false, fill: false },
};

function updateControlsVisibility() {
  const config = shapeControls[shapeSelect.value()];
  document.getElementById('dimensions-fieldset').style.display = config.dimensions ? 'block' : 'none';
  document.getElementById('arc-fieldset').style.display = config.arc ? 'block' : 'none';
  document.getElementById('fill-row').style.display = config.fill ? 'flex' : 'none';
}

function getAnchors(shape, x, y, w, h) {
  const hw = w / 2;
  const hh = h / 2;

  switch (shape) {
    case 'rectangle':
      return [
        { x: x - hw, y: y - hh, role: 'topLeft' },
        { x: x + hw, y: y - hh, role: 'topRight' },
        { x: x + hw, y: y + hh, role: 'bottomRight' },
        { x: x - hw, y: y + hh, role: 'bottomLeft' },
      ];

    case 'ellipse':
      return [
        { x: x, y: y - hh, role: 'top' },
        { x: x + hw, y: y, role: 'right' },
        { x: x, y: y + hh, role: 'bottom' },
        { x: x - hw, y: y, role: 'left' },
      ];

    case 'triangle':
      return [
        { x: x, y: y - hh, role: 'top' },
        { x: x - hw, y: y + hh, role: 'bottomLeft' },
        { x: x + hw, y: y + hh, role: 'bottomRight' },
      ];

    case 'line':
      return [
        { x: x - hw, y: y - hh, role: 'start' },
        { x: x + hw, y: y + hh, role: 'end' },
      ];

    case 'quad':
      return [
        { x: x, y: y - hh, role: 'top' },
        { x: x + hw, y: y, role: 'right' },
        { x: x, y: y + hh, role: 'bottom' },
        { x: x - hw, y: y, role: 'left' },
      ];

    case 'arc':
      return [
        { x: x, y: y - hh, role: 'top' },
        { x: x + hw, y: y, role: 'right' },
        { x: x, y: y + hh, role: 'bottom' },
        { x: x - hw, y: y, role: 'left' },
      ];

    case 'point':
      return [
        { x: x, y: y, role: 'center' },
      ];

    default:
      return [];
  }
}

function draw() {
  background(240);
  drawGrid();

  const x = Number(posX.value());
  const y = Number(posY.value());
  const w = Number(dimW.value());
  const h = Number(dimH.value());
  const shape = shapeSelect.value();

  fill(fillColor.value());
  stroke(strokeColor.value());
  strokeWeight(Number(strokeW.value()));

  drawShape(shape, x, y, w, h);

  anchors = getAnchors(shape, x, y, w, h);
  drawAnchors(anchors);

  drawCrosshair(x, y);
}

function drawShape(shape, x, y, w, h) {
  const hw = w / 2;
  const hh = h / 2;

  switch (shape) {
    case 'rectangle':
      rectMode(CENTER);
      rect(x, y, w, h);
      break;

    case 'ellipse':
      ellipse(x, y, w, h);
      break;

    case 'triangle':
      triangle(x, y - hh, x - hw, y + hh, x + hw, y + hh);
      break;

    case 'line':
      line(x - hw, y - hh, x + hw, y + hh);
      break;

    case 'quad':
      quad(x, y - hh, x + hw, y, x, y + hh, x - hw, y);
      break;

    case 'arc':
      arc(x, y, w, h, radians(Number(arcStart.value())), radians(Number(arcStop.value())), window[arcModeSelect.value()]);
      break;

    case 'point':
      strokeWeight(max(Number(strokeW.value()), 8));
      point(x, y);
      break;
  }
}

function drawAnchors(anchors) {
  for (let i = 0; i < anchors.length; i++) {
    const a = anchors[i];
    const isHovered = dist(mouseX, mouseY, a.x, a.y) < ANCHOR_HIT_RADIUS;
    const isDragged = draggedAnchor === i;

    stroke(isDragged ? '#ff6600' : isHovered ? '#0066ff' : '#333');
    strokeWeight(2);
    fill(isDragged ? '#ffcc00' : isHovered ? '#66aaff' : '#fff');
    ellipse(a.x, a.y, ANCHOR_SIZE, ANCHOR_SIZE);
  }
}

function findAnchorAtPoint(px, py) {
  for (let i = 0; i < anchors.length; i++) {
    if (dist(px, py, anchors[i].x, anchors[i].y) < ANCHOR_HIT_RADIUS) {
      return i;
    }
  }
  return null;
}

function mousePressed() {
  if (mouseX < 0 || mouseX > CANVAS_SIZE || mouseY < 0 || mouseY > CANVAS_SIZE) return;
  draggedAnchor = findAnchorAtPoint(mouseX, mouseY);
}

function mouseDragged() {
  if (draggedAnchor === null) return;
  handleAnchorDrag(mouseX, mouseY);
}

function mouseReleased() {
  draggedAnchor = null;
}

function touchStarted() {
  if (touches.length === 0) return;
  const t = touches[0];
  if (t.x < 0 || t.x > CANVAS_SIZE || t.y < 0 || t.y > CANVAS_SIZE) return;
  draggedAnchor = findAnchorAtPoint(t.x, t.y);
  if (draggedAnchor !== null) return false;
}

function touchMoved() {
  if (draggedAnchor === null || touches.length === 0) return;
  handleAnchorDrag(touches[0].x, touches[0].y);
  return false;
}

function touchEnded() {
  draggedAnchor = null;
}

function handleAnchorDrag(mx, my) {
  const shape = shapeSelect.value();
  const anchor = anchors[draggedAnchor];
  const x = Number(posX.value());
  const y = Number(posY.value());

  mx = constrain(mx, 0, CANVAS_SIZE);
  my = constrain(my, 0, CANVAS_SIZE);

  switch (shape) {
    case 'point':
      updateSlider(posX, 'pos-x-val', mx);
      updateSlider(posY, 'pos-y-val', my);
      break;

    case 'line':
      handleLineDrag(anchor.role, mx, my, x, y);
      break;

    case 'rectangle':
      handleRectDrag(anchor.role, mx, my, x, y);
      break;

    case 'ellipse':
    case 'arc':
      handleEllipseDrag(anchor.role, mx, my, x, y);
      break;

    case 'triangle':
      handleTriangleDrag(anchor.role, mx, my, x, y);
      break;

    case 'quad':
      handleQuadDrag(anchor.role, mx, my, x, y);
      break;
  }
}

function handleLineDrag(role, mx, my, cx, cy) {
  const w = Number(dimW.value());
  const h = Number(dimH.value());

  if (role === 'start') {
    const endX = cx + w / 2;
    const endY = cy + h / 2;
    const newCx = (mx + endX) / 2;
    const newCy = (my + endY) / 2;
    const newW = Math.abs(endX - mx);
    const newH = Math.abs(endY - my);
    updateSlider(posX, 'pos-x-val', newCx);
    updateSlider(posY, 'pos-y-val', newCy);
    updateSlider(dimW, 'dim-w-val', Math.max(1, newW));
    updateSlider(dimH, 'dim-h-val', Math.max(1, newH));
  } else {
    const startX = cx - w / 2;
    const startY = cy - h / 2;
    const newCx = (startX + mx) / 2;
    const newCy = (startY + my) / 2;
    const newW = Math.abs(mx - startX);
    const newH = Math.abs(my - startY);
    updateSlider(posX, 'pos-x-val', newCx);
    updateSlider(posY, 'pos-y-val', newCy);
    updateSlider(dimW, 'dim-w-val', Math.max(1, newW));
    updateSlider(dimH, 'dim-h-val', Math.max(1, newH));
  }
}

function handleRectDrag(role, mx, my, cx, cy) {
  const w = Number(dimW.value());
  const h = Number(dimH.value());
  const hw = w / 2;
  const hh = h / 2;

  let left = cx - hw, right = cx + hw, top = cy - hh, bottom = cy + hh;

  if (role.includes('top')) top = my;
  if (role.includes('bottom')) bottom = my;
  if (role.includes('Left')) left = mx;
  if (role.includes('Right')) right = mx;

  const newW = Math.abs(right - left);
  const newH = Math.abs(bottom - top);
  const newCx = (left + right) / 2;
  const newCy = (top + bottom) / 2;

  updateSlider(posX, 'pos-x-val', newCx);
  updateSlider(posY, 'pos-y-val', newCy);
  updateSlider(dimW, 'dim-w-val', Math.max(1, newW));
  updateSlider(dimH, 'dim-h-val', Math.max(1, newH));
}

function handleEllipseDrag(role, mx, my, cx, cy) {
  const w = Number(dimW.value());
  const h = Number(dimH.value());

  let newW = w, newH = h, newCx = cx, newCy = cy;

  if (role === 'top' || role === 'bottom') {
    const opposite = role === 'top' ? cy + h / 2 : cy - h / 2;
    newH = Math.abs(my - opposite);
    newCy = (my + opposite) / 2;
  } else {
    const opposite = role === 'left' ? cx + w / 2 : cx - w / 2;
    newW = Math.abs(mx - opposite);
    newCx = (mx + opposite) / 2;
  }

  updateSlider(posX, 'pos-x-val', newCx);
  updateSlider(posY, 'pos-y-val', newCy);
  updateSlider(dimW, 'dim-w-val', Math.max(1, newW));
  updateSlider(dimH, 'dim-h-val', Math.max(1, newH));
}

function handleTriangleDrag(role, mx, my, cx, cy) {
  const w = Number(dimW.value());
  const h = Number(dimH.value());
  const hw = w / 2;
  const hh = h / 2;

  let topY = cy - hh;
  let bottomY = cy + hh;
  let leftX = cx - hw;
  let rightX = cx + hw;

  if (role === 'top') {
    topY = my;
    const newCx = (leftX + rightX) / 2;
    updateSlider(posX, 'pos-x-val', mx);
  } else if (role === 'bottomLeft') {
    leftX = mx;
    bottomY = my;
  } else if (role === 'bottomRight') {
    rightX = mx;
    bottomY = my;
  }

  const newW = Math.abs(rightX - leftX);
  const newH = Math.abs(bottomY - topY);
  const newCx = (leftX + rightX) / 2;
  const newCy = (topY + bottomY) / 2;

  updateSlider(posX, 'pos-x-val', newCx);
  updateSlider(posY, 'pos-y-val', newCy);
  updateSlider(dimW, 'dim-w-val', Math.max(1, newW));
  updateSlider(dimH, 'dim-h-val', Math.max(1, newH));
}

function handleQuadDrag(role, mx, my, cx, cy) {
  const w = Number(dimW.value());
  const h = Number(dimH.value());

  let newW = w, newH = h, newCx = cx, newCy = cy;

  if (role === 'top' || role === 'bottom') {
    const opposite = role === 'top' ? cy + h / 2 : cy - h / 2;
    newH = Math.abs(my - opposite);
    newCy = (my + opposite) / 2;
  } else {
    const opposite = role === 'left' ? cx + w / 2 : cx - w / 2;
    newW = Math.abs(mx - opposite);
    newCx = (mx + opposite) / 2;
  }

  updateSlider(posX, 'pos-x-val', newCx);
  updateSlider(posY, 'pos-y-val', newCy);
  updateSlider(dimW, 'dim-w-val', Math.max(1, newW));
  updateSlider(dimH, 'dim-h-val', Math.max(1, newH));
}

function updateSlider(slider, displayId, value) {
  value = Math.round(value);
  slider.elt.value = value;
  document.getElementById(displayId).textContent = value;
}

function drawGrid() {
  stroke(220);
  strokeWeight(1);
  for (let i = 0; i <= CANVAS_SIZE; i += 50) {
    line(i, 0, i, CANVAS_SIZE);
    line(0, i, CANVAS_SIZE, i);
  }

  noStroke();
  fill(180);
  textSize(10);
  textAlign(CENTER, TOP);
  for (let i = 0; i <= CANVAS_SIZE; i += 100) {
    text(i, i, 2);
  }
  textAlign(LEFT, CENTER);
  for (let i = 100; i <= CANVAS_SIZE; i += 100) {
    text(i, 2, i);
  }
}

function drawCrosshair(x, y) {
  stroke(255, 0, 0, 120);
  strokeWeight(1);
  line(x, 0, x, CANVAS_SIZE);
  line(0, y, CANVAS_SIZE, y);
}
