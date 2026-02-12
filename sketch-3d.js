// 3D shape configuration: dimension labels and count per shape
const shape3DConfig = {
  box:      { dims: ['Width', 'Height', 'Depth'], count: 3 },
  sphere:   { dims: ['Radius'],                   count: 1 },
  cylinder: { dims: ['Radius', 'Height'],          count: 2 },
  cone:     { dims: ['Radius', 'Height'],          count: 2 },
  torus:    { dims: ['Radius', 'Tube Radius'],     count: 2 },
  plane:    { dims: ['Width', 'Height'],            count: 2 },
};

// 3D editor state
let shapeSelect3D, posX3D, posY3D, posZ3D;
let dim1_3D, dim2_3D, dim3_3D;
let rotX3D, rotY3D, rotZ3D;
let materialType3D, materialColor3D, shininess3D;
let lightingEnabled3D, ambientColor3D, directionalColor3D;
let strokeEnabled3D, strokeColor3D;

let is3DInitialized = false;

function setup3D() {
  shapeSelect3D = select('#shape-select-3d');
  posX3D = select('#pos-x-3d');
  posY3D = select('#pos-y-3d');
  posZ3D = select('#pos-z-3d');
  dim1_3D = select('#dim1-3d');
  dim2_3D = select('#dim2-3d');
  dim3_3D = select('#dim3-3d');
  rotX3D = select('#rot-x-3d');
  rotY3D = select('#rot-y-3d');
  rotZ3D = select('#rot-z-3d');
  materialType3D = select('#material-type-3d');
  materialColor3D = select('#material-color-3d');
  shininess3D = select('#shininess-3d');
  lightingEnabled3D = select('#lighting-enabled-3d');
  ambientColor3D = select('#ambient-color-3d');
  directionalColor3D = select('#directional-color-3d');
  strokeEnabled3D = select('#stroke-enabled-3d');
  strokeColor3D = select('#stroke-color-3d');

  if (!is3DInitialized) {
    wireSlider('pos-x-3d', 'pos-x-3d-val');
    wireSlider('pos-y-3d', 'pos-y-3d-val');
    wireSlider('pos-z-3d', 'pos-z-3d-val');
    wireSlider('dim1-3d', 'dim1-3d-val');
    wireSlider('dim2-3d', 'dim2-3d-val');
    wireSlider('dim3-3d', 'dim3-3d-val');
    wireSlider('rot-x-3d', 'rot-x-3d-val', '\u00B0');
    wireSlider('rot-y-3d', 'rot-y-3d-val', '\u00B0');
    wireSlider('rot-z-3d', 'rot-z-3d-val', '\u00B0');
    wireSlider('shininess-3d', 'shininess-3d-val');

    shapeSelect3D.changed(onShape3DChanged);
    materialType3D.changed(onMaterial3DChanged);
    strokeEnabled3D.changed(onStroke3DChanged);

    is3DInitialized = true;
  }

  update3DControlsVisibility();
}

function onShape3DChanged() {
  update3DDimensionLabels();
}

function onMaterial3DChanged() {
  update3DMaterialVisibility();
}

function onStroke3DChanged() {
  document.getElementById('stroke-color-3d-row').style.display =
    strokeEnabled3D.elt.checked ? 'flex' : 'none';
}

function update3DControlsVisibility() {
  update3DDimensionLabels();
  update3DMaterialVisibility();
  onStroke3DChanged();
}

function update3DDimensionLabels() {
  const shape = shapeSelect3D.value();
  const config = shape3DConfig[shape];
  const labels = ['dim1-3d-label', 'dim2-3d-label', 'dim3-3d-label'];
  const rows = ['dim1-3d-row', 'dim2-3d-row', 'dim3-3d-row'];

  for (let i = 0; i < 3; i++) {
    if (i < config.count) {
      document.getElementById(rows[i]).style.display = 'flex';
      document.getElementById(labels[i]).textContent = config.dims[i];
    } else {
      document.getElementById(rows[i]).style.display = 'none';
    }
  }
}

function update3DMaterialVisibility() {
  const matType = materialType3D.value();
  document.getElementById('material-color-3d-row').style.display =
    matType !== 'normal' ? 'flex' : 'none';
  document.getElementById('shininess-3d-row').style.display =
    matType === 'specular' ? 'flex' : 'none';
}

function draw3D() {
  background(240);
  orbitControl();

  if (lightingEnabled3D.elt.checked) {
    ambientLight(ambientColor3D.value());
    const dc = color(directionalColor3D.value());
    directionalLight(red(dc), green(dc), blue(dc), 1, 1, -1);
  }

  drawGrid3D();

  const px = Number(posX3D.value());
  const py = Number(posY3D.value());
  const pz = Number(posZ3D.value());
  const rx = Number(rotX3D.value());
  const ry = Number(rotY3D.value());
  const rz = Number(rotZ3D.value());
  const d1 = Number(dim1_3D.value());
  const d2 = Number(dim2_3D.value());
  const d3 = Number(dim3_3D.value());
  const shapeName = shapeSelect3D.value();

  push();
  translate(px, py, pz);
  rotateX(radians(rx));
  rotateY(radians(ry));
  rotateZ(radians(rz));

  applyMaterial3D();

  if (strokeEnabled3D.elt.checked) {
    stroke(strokeColor3D.value());
    strokeWeight(1);
  } else {
    noStroke();
  }

  drawShape3D(shapeName, d1, d2, d3);
  pop();
}

function applyMaterial3D() {
  const matType = materialType3D.value();
  const matColor = materialColor3D.value();

  switch (matType) {
    case 'normal':
      normalMaterial();
      break;
    case 'ambient':
      ambientMaterial(matColor);
      break;
    case 'specular':
      specularMaterial(matColor);
      shininess(Number(shininess3D.value()));
      break;
    case 'emissive':
      emissiveMaterial(matColor);
      break;
  }
}

function drawShape3D(shapeName, d1, d2, d3) {
  switch (shapeName) {
    case 'box':
      box(d1, d2, d3);
      break;
    case 'sphere':
      sphere(d1);
      break;
    case 'cylinder':
      cylinder(d1, d2);
      break;
    case 'cone':
      cone(d1, d2);
      break;
    case 'torus':
      torus(d1, d2);
      break;
    case 'plane':
      plane(d1, d2);
      break;
  }
}

function drawGrid3D() {
  push();
  strokeWeight(1);
  stroke(220);

  const size = 200;
  const step = 50;

  for (let i = -size; i <= size; i += step) {
    line(i, -size, 0, i, size, 0);
    line(-size, i, 0, size, i, 0);
  }

  // Axis lines
  strokeWeight(2);
  stroke(220, 80, 80);
  line(-size, 0, 0, size, 0, 0);   // X axis (red)
  stroke(80, 180, 80);
  line(0, -size, 0, 0, size, 0);   // Y axis (green)
  stroke(80, 80, 220);
  line(0, 0, -size, 0, 0, size);   // Z axis (blue)

  pop();
}
