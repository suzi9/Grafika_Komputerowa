// Shaders
const vertexShaderSource = `
  attribute vec4 a_position;
  void main() {
    gl_Position = a_position;
  }
`;

const fragmentShaderSource = `
  precision mediump float;
  uniform vec4 u_color;
  void main() {
    gl_FragColor = u_color;
  }
`;

// Funkcja do tworzenia shaderów
function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return shader;
}

// Funkcja do tworzenia programu
function createProgram(gl, vertexShader, fragmentShader) {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  return program;
}

// Inicjalizacja WebGL
const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl");

const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
const program = createProgram(gl, vertexShader, fragmentShader);

const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
const colorUniformLocation = gl.getUniformLocation(program, "u_color");

const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

const positions = [
  -0.5, -0.5,
   0.5, -0.5,
  -0.5,  0.5,
  -0.5,  0.5,
   0.5, -0.5,
   0.5,  0.5,
];
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
gl.clearColor(0, 0, 0, 0);
gl.clear(gl.COLOR_BUFFER_BIT);

gl.useProgram(program);

gl.enableVertexAttribArray(positionAttributeLocation);
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

// Rysowanie kwadratu
gl.uniform4f(colorUniformLocation, 1, 0, 0, 1); // Kolor czerwony
gl.drawArrays(gl.TRIANGLES, 0, 6);

// Kolory
const colors = [
    [1, 0, 0, 1], // czerwony
    [0, 1, 0, 1], // zielony
    [0, 0, 1, 1], // niebieski
    [1, 1, 0, 1], // Yellow
  ];
  
  let currentColorIndex = 0;
  
  function changeColor() {
    currentColorIndex = (currentColorIndex + 1) % colors.length;
    gl.uniform4f(colorUniformLocation, ...colors[currentColorIndex]);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 6); // Zmień na gl.TRIANGLE_FAN dla sześciokąta
  }
  
  const colorButton = document.getElementById("colorButton");
  colorButton.addEventListener("click", changeColor);
  