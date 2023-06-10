const VS_TXT = `
    precision mediump float;
    attribute vec3 vertPosition;
    attribute vec3 vertColor;
    varying vec3 fragColor;
    uniform mat4 mWorld, mView, mProj;
    void main()
    {
        fragColor = vertColor;
        gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);
    }
`;

const FS_TXT = `
    precision mediump float;
    varying vec3 fragColor;
    void main()
    {
        gl_FragColor = vec4(fragColor, 1.0);
    }
`;

const mat4 = glMatrix.mat4;

const createCube = (sideLength, colors) => {
  const halfLen = sideLength / 2;

  const faces = [
    { // Top
      vertices: [
        [-halfLen, halfLen, -halfLen],
        [-halfLen, halfLen, halfLen],
        [halfLen, halfLen, halfLen],
        [halfLen, halfLen, -halfLen]
      ],
      color: colors[0]
    },
    { // Left
      vertices: [
        [-halfLen, halfLen, halfLen],
        [-halfLen, -halfLen, halfLen],
        [-halfLen, -halfLen, -halfLen],
        [-halfLen, halfLen, -halfLen]
      ],
      color: colors[1]
    },
    { // Right
      vertices: [
        [halfLen, halfLen, halfLen],
        [halfLen, -halfLen, halfLen],
        [halfLen, -halfLen, -halfLen],
        [halfLen, halfLen, -halfLen]
      ],
      color: colors[2]
    },
    { // Front
      vertices: [
        [halfLen, halfLen, halfLen],
        [halfLen, -halfLen, halfLen],
        [-halfLen, -halfLen, halfLen],
        [-halfLen, halfLen, halfLen]
      ],
      color: colors[3]
    },
    { // Back
      vertices: [
        [halfLen, halfLen, -halfLen],
        [halfLen, -halfLen, -halfLen],
        [-halfLen, -halfLen, -halfLen],
        [-halfLen, halfLen, -halfLen]
      ],
      color: colors[4]
    },
    { // Bottom
      vertices: [
        [-halfLen, -halfLen, -halfLen],
        [-halfLen, -halfLen, halfLen],
        [halfLen, -halfLen, halfLen],
        [halfLen, -halfLen, -halfLen]
      ],
      color: colors[5]
    }
  ];

  const vertices = [];
  const indices = [];

  for (const face of faces) {
    const startIndex = vertices.length / 6;

    for (const vertex of face.vertices) {
      vertices.push(
        ...vertex,
        ...face.color
      );
    }

    indices.push(
      startIndex, startIndex + 1, startIndex + 2,
      startIndex, startIndex + 2, startIndex + 3,
      startIndex, startIndex + 2, startIndex + 1,
      startIndex, startIndex + 3, startIndex + 2
    );
  }

  return { vertices, indices };
};

const Triangle = function(){
  const canvas = document.querySelector('#main-canvas');
  const gl = canvas.getContext('webgl');

  if (!gl) {
    console.error('WebGL not supported');
    return;
  }

  gl.clearColor(0.0, 0.0, 0.0, 0.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);

  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

  gl.shaderSource(vertexShader, VS_TXT);
  gl.shaderSource(fragmentShader, FS_TXT);

  gl.compileShader(vertexShader);
  if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    console.error('ERROR compiling vertex shader!', gl.getShaderInfoLog(vertexShader));
    return;
  }
  gl.compileShader(fragmentShader);

  let program = gl.createProgram();

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  gl.detachShader(program, vertexShader);
  gl.detachShader(program, fragmentShader);

  gl.validateProgram(program);

  const { vertices, indices } = createCube(2.0, [
    [0.5, 0.5, 0.5],
    [0.75, 0.25, 0.5],
    [0.2, 1.0, 0.75],
    [1.0, 0.0, 0.15],
    [0.0, 1.0, 0.15],
    [0.5, 0.5, 1.0]
  ]);

  const vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

  const posAttrLocation = gl.getAttribLocation(program, 'vertPosition');
  const colorAttrLocation = gl.getAttribLocation(program, 'vertColor');

  gl.vertexAttribPointer(
    posAttrLocation,
    3,
    gl.FLOAT,
    gl.FALSE,
    6 * Float32Array.BYTES_PER_ELEMENT,
    0,
  );
  gl.vertexAttribPointer(
    colorAttrLocation,
    3,
    gl.FLOAT,
    gl.FALSE,
    6 * Float32Array.BYTES_PER_ELEMENT,
    3 * Float32Array.BYTES_PER_ELEMENT,
  );

  gl.enableVertexAttribArray(posAttrLocation);
  gl.enableVertexAttribArray(colorAttrLocation);

  gl.useProgram(program);
  const matWorldUniformLocation = gl.getUniformLocation(program, "mWorld");
  const matViewUniformLocation = gl.getUniformLocation(program, 'mView');
  const matProjUniformLocation = gl.getUniformLocation(program, 'mProj');

  let worldMatrix = mat4.create();
  let viewMatrix = mat4.create();
  mat4.lookAt(viewMatrix, [0,0,-10], [0,0,0], [0,1,0]);
  let projMatrix = mat4.create();
  mat4.perspective(projMatrix, glMatrix.glMatrix.toRadian(45), canvas.width / canvas.height, 0.1, 1000.0);

  gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
  gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
  gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);

  let identityMatrix = mat4.create(); 
  let angle = 0;
  const loop = () => {
    angle = performance.now() / 1000 * Math.PI;
    mat4.rotate(worldMatrix, identityMatrix, angle, [1,2,0]);
    gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

    requestAnimationFrame(loop);
  };
  
  requestAnimationFrame(loop);
};

window.onload = Triangle;
 

