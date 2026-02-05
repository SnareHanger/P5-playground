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
  const startAngle = radians(Number(arcStart.value()));
  const stopAngle = radians(Number(arcStop.value()));

  switch (shape) {
    case 'rectangle':
      return [
        { x: x, y: y, role: 'center' },
        { x: x - hw, y: y - hh, role: 'topLeft' },
        { x: x + hw, y: y - hh, role: 'topRight' },
        { x: x + hw, y: y + hh, role: 'bottomRight' },
        { x: x - hw, y: y + hh, role: 'bottomLeft' },
      ];

    case 'ellipse':
      return [
        { x: x, y: y, role: 'center' },
        { x: x, y: y - hh, role: 'top' },
        { x: x + hw, y: y, role: 'right' },
        { x: x, y: y + hh, role: 'bottom' },
        { x: x - hw, y: y, role: 'left' },
      ];

    case 'triangle':
      return [
        { x: x, y: y, role: 'center' },
        { x: x, y: y - hh, role: 'top' },
        { x: x - hw, y: y + hh, role: 'bottomLeft' },
        { x: x + hw, y: y + hh, role: 'bottomRight' },
      ];

    case 'line':
      return [
        { x: x, y: y, role: 'center' },
        { x: x - hw, y: y - hh, role: 'start' },
        { x: x + hw, y: y + hh, role: 'end' },
      ];

    case 'quad':
      return [
        { x: x, y: y, role: 'center' },
        { x: x, y: y - hh, role: 'top' },
        { x: x + hw, y: y, role: 'right' },
        { x: x, y: y + hh, role: 'bottom' },
        { x: x - hw, y: y, role: 'left' },
      ];

    case 'arc':
      return [
        { x: x, y: y, role: 'center' },
        { x: x, y: y - hh, role: 'top' },
        { x: x + hw, y: y, role: 'right' },
        { x: x, y: y + hh, role: 'bottom' },
        { x: x - hw, y: y, role: 'left' },
        { x: x + cos(startAngle) * hw, y: y + sin(startAngle) * hh, role: 'arcStart' },
        { x: x + cos(stopAngle) * hw, y: y + sin(stopAngle) * hh, role: 'arcStop' },
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
    const isCenter = a.role === 'center';
    const isArcAngle = a.role === 'arcStart' || a.role === 'arcStop';

    stroke(isDragged ? '#ff6600' : isHovered ? '#0066ff' : '#333');
    strokeWeight(2);

    if (isCenter) {
      fill(isDragged ? '#ffcc00' : isHovered ? '#66aaff' : '#90EE90');
    } else if (isArcAngle) {
      fill(isDragged ? '#ffcc00' : isHovered ? '#66aaff' : '#FFB6C1');
    } else {
      fill(isDragged ? '#ffcc00' : isHovered ? '#66aaff' : '#fff');
    }

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

  if (anchor.role === 'center') {
    updateSlider(posX, 'pos-x-val', mx);
    updateSlider(posY, 'pos-y-val', my);
    return;
  }

  if (anchor.role === 'arcStart' || anchor.role === 'arcStop') {
    handleArcAngleDrag(anchor.role, mx, my, x, y);
    return;
  }

  switch (shape) {
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

function handleArcAngleDrag(role, mx, my, cx, cy) {
  const angle = atan2(my - cy, mx - cx);
  let degrees = angle * 180 / PI;
  if (degrees < 0) degrees += 360;

  if (role === 'arcStart') {
    updateSlider(arcStart, 'arc-start-val', degrees, '°');
  } else {
    updateSlider(arcStop, 'arc-stop-val', degrees, '°');
  }
}

function handleLineDrag(role, mx, my, cx, cy) {
  const w = Number(dimW.value());
  const h = Number(dimH.value());

  if (role === 'start') {
    const newW = (cx - mx) * 2;
    const newH = (cy - my) * 2;
    updateSlider(dimW, 'dim-w-val', Math.max(1, Math.abs(newW)));
    updateSlider(dimH, 'dim-h-val', Math.max(1, Math.abs(newH)));
  } else {
    const newW = (mx - cx) * 2;
    const newH = (my - cy) * 2;
    updateSlider(dimW, 'dim-w-val', Math.max(1, Math.abs(newW)));
    updateSlider(dimH, 'dim-h-val', Math.max(1, Math.abs(newH)));
  }
}

function handleRectDrag(role, mx, my, cx, cy) {
  let newW, newH;

  if (role === 'topLeft') {
    newW = (cx - mx) * 2;
    newH = (cy - my) * 2;
  } else if (role === 'topRight') {
    newW = (mx - cx) * 2;
    newH = (cy - my) * 2;
  } else if (role === 'bottomRight') {
    newW = (mx - cx) * 2;
    newH = (my - cy) * 2;
  } else if (role === 'bottomLeft') {
    newW = (cx - mx) * 2;
    newH = (my - cy) * 2;
  }

  updateSlider(dimW, 'dim-w-val', Math.max(1, Math.abs(newW)));
  updateSlider(dimH, 'dim-h-val', Math.max(1, Math.abs(newH)));
}

function handleEllipseDrag(role, mx, my, cx, cy) {
  if (role === 'top') {
    updateSlider(dimH, 'dim-h-val', Math.max(1, Math.abs((cy - my) * 2)));
  } else if (role === 'bottom') {
    updateSlider(dimH, 'dim-h-val', Math.max(1, Math.abs((my - cy) * 2)));
  } else if (role === 'left') {
    updateSlider(dimW, 'dim-w-val', Math.max(1, Math.abs((cx - mx) * 2)));
  } else if (role === 'right') {
    updateSlider(dimW, 'dim-w-val', Math.max(1, Math.abs((mx - cx) * 2)));
  }
}

function handleTriangleDrag(role, mx, my, cx, cy) {
  if (role === 'top') {
    updateSlider(dimH, 'dim-h-val', Math.max(1, Math.abs((cy - my) * 2)));
  } else if (role === 'bottomLeft') {
    updateSlider(dimW, 'dim-w-val', Math.max(1, Math.abs((cx - mx) * 2)));
    updateSlider(dimH, 'dim-h-val', Math.max(1, Math.abs((my - cy) * 2)));
  } else if (role === 'bottomRight') {
    updateSlider(dimW, 'dim-w-val', Math.max(1, Math.abs((mx - cx) * 2)));
    updateSlider(dimH, 'dim-h-val', Math.max(1, Math.abs((my - cy) * 2)));
  }
}

function handleQuadDrag(role, mx, my, cx, cy) {
  if (role === 'top') {
    updateSlider(dimH, 'dim-h-val', Math.max(1, Math.abs((cy - my) * 2)));
  } else if (role === 'bottom') {
    updateSlider(dimH, 'dim-h-val', Math.max(1, Math.abs((my - cy) * 2)));
  } else if (role === 'left') {
    updateSlider(dimW, 'dim-w-val', Math.max(1, Math.abs((cx - mx) * 2)));
  } else if (role === 'right') {
    updateSlider(dimW, 'dim-w-val', Math.max(1, Math.abs((mx - cx) * 2)));
  }
}

function updateSlider(slider, displayId, value, suffix = '') {
  value = Math.round(value);
  slider.elt.value = value;
  document.getElementById(displayId).textContent = value + suffix;
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
