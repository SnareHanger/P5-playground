let currentMode = '2d';

function setup() {
  createCanvas(CANVAS_SIZE, CANVAS_SIZE).parent('canvas-container');
  setup2D();

  document.getElementById('mode-2d').addEventListener('click', () => switchMode('2d'));
  document.getElementById('mode-3d').addEventListener('click', () => switchMode('3d'));
}

function draw() {
  if (currentMode === '2d') {
    draw2D();
  } else {
    draw3D();
  }
}

function switchMode(mode) {
  if (mode === currentMode) return;
  currentMode = mode;

  document.getElementById('mode-2d').classList.toggle('active', mode === '2d');
  document.getElementById('mode-3d').classList.toggle('active', mode === '3d');

  document.getElementById('controls-2d').style.display = mode === '2d' ? 'flex' : 'none';
  document.getElementById('controls-3d').style.display = mode === '3d' ? 'flex' : 'none';

  document.getElementById('orbit-hint').style.display = mode === '3d' ? 'block' : 'none';

  if (mode === '3d') {
    createCanvas(CANVAS_SIZE, CANVAS_SIZE, WEBGL).parent('canvas-container');
    setup3D();
  } else {
    createCanvas(CANVAS_SIZE, CANVAS_SIZE).parent('canvas-container');
    setup2D();
  }
}

function mousePressed() {
  if (currentMode === '2d') mousePressed2D();
}

function mouseDragged() {
  if (currentMode === '2d') mouseDragged2D();
}

function mouseReleased() {
  if (currentMode === '2d') mouseReleased2D();
}

function touchStarted() {
  if (currentMode === '2d') return touchStarted2D();
}

function touchMoved() {
  if (currentMode === '2d') return touchMoved2D();
}

function touchEnded() {
  if (currentMode === '2d') touchEnded2D();
}
