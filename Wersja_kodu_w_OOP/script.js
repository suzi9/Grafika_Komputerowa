// ciężko to skończyć
class Triangle {
    constructor() {
        // Kod vertex shadera
        this.vertexShaderTxt = `
            precision mediump float;

            attribute vec3 vertPosition;
            attribute vec3 vertColor;

            varying vec3 fragColor;

            uniform mat4 mWorld;
            uniform mat4 mView;
            uniform mat4 mProj;

            void main()
            {
                fragColor = vertColor;
                gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);
            }
        `;

        // Kod fragment shadera
        this.fragmentShaderTxt = `
            precision mediump float;

            varying vec3 fragColor;

            void main()
            {
                gl_FragColor = vec4(fragColor, 1.0); // R,G,B, opacity
            }
        `;

        // Tworzenie obiektu mat4
        this.mat4 = glMatrix.mat4;

        // Inicjalizacja WebGL
        this.initializeWebGL();
    }

    initializeWebGL() {
        let canvas = document.getElementById('main-canvas');
        this.gl = canvas.getContext('webgl');

        if (!this.gl) {
            alert('webgl not supported');
        }

        this.gl.clearColor(0.5, 0.5, 0.9, 1.0);  // Ustalamy kolor, którym ma zostać wyczyszczony bufor
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT); // Czyścimy bufor kolorów i bufor głębokości
        this.gl.enable(this.gl.DEPTH_TEST); // Włączamy test głębokości
        this.gl.enable(this.gl.CULL_FACE); // Włączamy usuwanie niewidocznych ścian

        this.initializeShaders();
    }

    initializeShaders() {
        // Tworzenie shaderów
        this.vertexShader = this.gl.createShader(this.gl.VERTEX_SHADER);
        this.fragmentShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);

        // Ładowanie kodu shaderów
        this.gl.shaderSource(this.vertexShader, this.vertexShaderTxt);
        this.gl.shaderSource(this.fragmentShader, this.fragmentShaderTxt);

        // Kompilowanie shaderów
        this.gl.compileShader(this.vertexShader);
        if (!this.gl.getShaderParameter(this.vertexShader, this.gl.COMPILE_STATUS)) {
            console.error('ERROR compiling vertex shader!', this.gl.getShaderInfoLog(this.vertexShader));
            return;
        }
        this.gl.compileShader(this.fragmentShader);

        // Tworzenie programu
        this.program = this.gl.createProgram();

        // Dołączanie shaderów do programu
        this.gl.attachShader(this.program, this.vertexShader);
        this.gl.attachShader(this.program, this.fragmentShader);

        // Łączenie programu
        this.gl.linkProgram(this.program);

        // Odczepianie shaderów
        this.gl.detachShader(this.program, this.vertexShader);
        this.gl.detachShader(this.program, this.fragmentShader);

        // Walidacja programu
        this.gl.validateProgram(this.program);
        
        this.setupVertices();
    }
}