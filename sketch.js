const CANVAS_SIZE = 400;

let shapeSelect, posX, posY, dimW, dimH;
let fillColor, strokeColor, strokeW;
let arcStart, arcStop, arcModeSelect;

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
