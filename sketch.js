const CANVAS_SIZE = 400;

let shapeSelect;
let posX, posY;
let dimW, dimH;
let fillColor, strokeColor, strokeW;

function setup() {
  const canvas = createCanvas(CANVAS_SIZE, CANVAS_SIZE);
  canvas.parent('canvas-container');

  shapeSelect = select('#shape-select');

  posX = select('#pos-x');
  posY = select('#pos-y');
  dimW = select('#dim-w');
  dimH = select('#dim-h');
  fillColor = select('#fill-color');
  strokeColor = select('#stroke-color');
  strokeW = select('#stroke-weight');

  // Wire up value displays for range inputs
  wireSlider('pos-x', 'pos-x-val');
  wireSlider('pos-y', 'pos-y-val');
  wireSlider('dim-w', 'dim-w-val');
  wireSlider('dim-h', 'dim-h-val');
  wireSlider('stroke-weight', 'stroke-weight-val');
}

function wireSlider(sliderId, displayId) {
  const slider = document.getElementById(sliderId);
  const display = document.getElementById(displayId);
  slider.addEventListener('input', () => {
    display.textContent = slider.value;
  });
}

function draw() {
  background(240);

  // Draw grid
  drawGrid();

  // Read control values
  const x = Number(posX.value());
  const y = Number(posY.value());
  const w = Number(dimW.value());
  const h = Number(dimH.value());
  const shape = shapeSelect.value();

  // Apply style
  fill(fillColor.value());
  stroke(strokeColor.value());
  strokeWeight(Number(strokeW.value()));

  // Draw the selected primitive
  switch (shape) {
    case 'rectangle':
      rectMode(CENTER);
      rect(x, y, w, h);
      break;

    case 'ellipse':
      ellipse(x, y, w, h);
      break;

    case 'triangle': {
      const halfW = w / 2;
      const halfH = h / 2;
      triangle(
        x, y - halfH,
        x - halfW, y + halfH,
        x + halfW, y + halfH
      );
      break;
    }

    case 'line': {
      const hw = w / 2;
      const hh = h / 2;
      line(x - hw, y - hh, x + hw, y + hh);
      break;
    }

    case 'quad': {
      const qw = w / 2;
      const qh = h / 2;
      quad(
        x, y - qh,
        x + qw, y,
        x, y + qh,
        x - qw, y
      );
      break;
    }

    case 'arc':
      arc(x, y, w, h, 0, PI + QUARTER_PI, PIE);
      break;

    case 'point': {
      const prevWeight = Number(strokeW.value());
      strokeWeight(max(prevWeight, 8));
      point(x, y);
      strokeWeight(prevWeight);
      break;
    }
  }

  // Draw crosshair at shape position
  drawCrosshair(x, y);
}

function drawGrid() {
  stroke(220);
  strokeWeight(1);
  for (let i = 0; i <= CANVAS_SIZE; i += 50) {
    line(i, 0, i, CANVAS_SIZE);
    line(0, i, CANVAS_SIZE, i);
  }

  // Axis labels
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
