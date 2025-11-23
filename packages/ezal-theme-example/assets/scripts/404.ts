import { initBase } from './_base';
import { $, doc, handle } from './_utils';

class GlitchTextEffect {
	canvas: HTMLCanvasElement;
	text: string;
	fontSize: number;
	gl: WebGLRenderingContext | null = null;
	program: WebGLProgram | null = null;
	startTime: number;
	timeLocation: WebGLUniformLocation | null = null;
	resolutionLocation: WebGLUniformLocation | null = null;
	textLocation: WebGLUniformLocation | null = null;
	textTexture: WebGLTexture | null = null;

	constructor(canvas: HTMLCanvasElement, text: string, fontSize: number) {
		this.canvas = canvas;

		this.text = text;
		this.fontSize = fontSize;
		this.startTime = Date.now();

		this.initWebGL();
		this.createShaders();
		this.setupBuffers();
		this.animate();
	}

	initWebGL(): void {
		const gl =
			this.canvas.getContext('webgl', { alpha: true, antialias: true }) ??
			this.canvas.getContext('experimental-webgl', {
				alpha: true,
				antialias: true,
			});
		if (!gl) {
			throw new Error('WebGL not supported');
		}
		this.gl = gl as any;
		this.gl!.viewport(0, 0, this.canvas.width, this.canvas.height);
	}

	createShaders(): void {
		if (!this.gl) return;

		const vsSource = `
      attribute vec2 aPosition;
      varying vec2 vUv;

      void main() {
        vUv = aPosition * 0.5 + 0.5;
        gl_Position = vec4(aPosition, 0.0, 1.0);
      }
    `;

		const fsSource = `
      precision mediump float;

      varying vec2 vUv;
      uniform float uTime;
      uniform vec2 uResolution;
      uniform sampler2D uTexture;

      // 伪随机数生成器
      float random (in vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
      }

      void main() {
        vec2 st = gl_FragCoord.xy / uResolution.xy;

        // 基础UV坐标
        vec2 uv = vUv;

        // 计算文字纹理坐标
        vec2 textUV = vec2(uv.x, 1.0 - uv.y); // 翻转Y轴以匹配纹理

        // 信号错位故障效果
        float timeFactor = uTime * 1.5;
        float glitchIntensity = abs(sin(timeFactor * 0.7)) * 0.8;

        // 检查是否触发故障
        float glitchEvent = random(vec2(floor(uTime * 4.0)));

        // 初始化偏移
        vec2 offset = vec2(0.0);

        // 水平撕裂/错位效果
        if (glitchEvent > 0.5) {
          // 生成多个水平撕裂线
          float tearCount = 3.0 + mod(uTime * 0.5, 3.0); // 撕裂线条数

          for (float i = 0.0; i < 5.0; i++) {
            if (i >= tearCount) break;

            float tearY = random(vec2(i, floor(uTime * 2.0 + i))) * 1.0; // 随机水平线位置
            float tearHeight = 0.02 + random(vec2(i * 2.0)) * 0.08; // 撕裂区域高度
            float shiftAmount = (random(vec2(i * 3.0)) - 0.5) * 0.1 * glitchIntensity; // 偏移量

            if (abs(textUV.y - tearY) < tearHeight) {
              offset.x += shiftAmount;
            }
          }
        }

        // 垂直撕裂效果
        float verticalGlitch = random(vec2(floor(uTime * 6.0), 2.0));
        if (verticalGlitch > 0.8) {
          float tearX = random(vec2(2.0, floor(uTime * 3.0))) * 1.0; // 随机垂直线位置
          float tearWidth = 0.02 + random(vec2(4.0)) * 0.05; // 撕裂区域宽度
          float shiftAmount = (random(vec2(5.0)) - 0.5) * 0.1 * glitchIntensity; // 垂直偏移量

          if (abs(textUV.x - tearX) < tearWidth) {
            offset.y += shiftAmount;
          }
        }

        // 块状故障效果
        float blockGlitch = random(vec2(floor(uTime * 2.0), 3.0));
        if (blockGlitch > 0.9) {
          vec2 blockSize = vec2(0.1, 0.05) + vec2(random(vec2(6.0)), random(vec2(7.0))) * 0.1;
          vec2 blockPos = vec2(random(vec2(8.0, floor(uTime))), random(vec2(9.0, floor(uTime * 1.5))));

          if (textUV.x > blockPos.x && textUV.x < blockPos.x + blockSize.x &&
              textUV.y > blockPos.y && textUV.y < blockPos.y + blockSize.y) {
            // 块状区域偏移
            offset += vec2(
              (random(vec2(10.0)) - 0.5) * 0.1 * glitchIntensity,
              (random(vec2(11.0)) - 0.5) * 0.05 * glitchIntensity
            );
          }
        }

        // 颜色通道分离
        vec2 offsetR = offset + vec2(
          sin(uTime * 8.0 + textUV.y * 5.0) * 0.005 * glitchIntensity,
          0.0
        );
        vec2 offsetG = offset + vec2(
          cos(uTime * 7.0 + textUV.x * 4.0) * 0.003 * glitchIntensity,
          0.0
        );
        vec2 offsetB = offset + vec2(
          sin(uTime * 9.0 + (textUV.x + textUV.y) * 3.0) * 0.007 * glitchIntensity,
          0.0
        );

        // 颜色通道分离
        float r = texture2D(uTexture, textUV + offsetR).r;
        float g = texture2D(uTexture, textUV + offsetG).g;
        float b = texture2D(uTexture, textUV + offsetB).b;

        // 主文字颜色
        vec4 baseColor = texture2D(uTexture, textUV + offset);

        // 创建故障颜色
        vec3 glitchColor = vec3(r, g, b);

        // 混合原始颜色和故障颜色
        vec3 finalColor = mix(baseColor.rgb, glitchColor, 0.4);

        // 偶尔的色差效果
        if (random(vec2(floor(uTime * 5.0))) > 0.92) {
          finalColor = vec3(r, b, g); // 随机交换颜色通道
        }

        // 透明度处理
        gl_FragColor = vec4(finalColor, baseColor.a);
      }
    `;

		const vertexShader = this.loadShader(this.gl.VERTEX_SHADER, vsSource);
		const fragmentShader = this.loadShader(this.gl.FRAGMENT_SHADER, fsSource);

		if (!(vertexShader && fragmentShader)) {
			throw new Error('Failed to load shaders');
		}

		this.program = this.gl.createProgram();
		if (!this.program) {
			throw new Error('Failed to create WebGL program');
		}

		this.gl.attachShader(this.program, vertexShader);
		this.gl.attachShader(this.program, fragmentShader);
		this.gl.linkProgram(this.program);

		if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
			throw new Error(
				'Unable to initialize the shader program: ' +
					this.gl.getProgramInfoLog(this.program),
			);
		}

		this.gl.useProgram(this.program);

		// 获取 uniform 变量位置
		this.timeLocation = this.gl.getUniformLocation(this.program, 'uTime');
		this.resolutionLocation = this.gl.getUniformLocation(
			this.program,
			'uResolution',
		);
		this.textLocation = this.gl.getUniformLocation(this.program, 'uTexture');
	}

	loadShader(type: number, source: string): WebGLShader | null {
		if (!this.gl) return null;

		const shader = this.gl.createShader(type);
		if (!shader) {
			console.error('Unable to create shader');
			return null;
		}

		this.gl.shaderSource(shader, source);
		this.gl.compileShader(shader);

		if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
			console.error(
				'An error occurred compiling the shaders: ' +
					this.gl.getShaderInfoLog(shader),
			);
			this.gl.deleteShader(shader);
			return null;
		}

		return shader;
	}

	setupBuffers(): void {
		if (!this.gl) return;

		// 创建一个覆盖整个视口的四边形
		const vertices = new Float32Array([
			-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0,
		]);

		const vertexBuffer = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);

		const positionLocation = this.gl.getAttribLocation(
			this.program!,
			'aPosition',
		);
		if (positionLocation !== -1) {
			this.gl.enableVertexAttribArray(positionLocation);
			this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, 0, 0);
		}

		// 创建纹理并绘制文字
		this.createTextTexture();
	}

	createTextTexture(): void {
		if (!this.gl) return;

		// 创建一个临时canvas来绘制文字
		const tempCanvas = document.createElement('canvas');
		const tempCtx = tempCanvas.getContext('2d');

		if (!tempCtx) {
			throw new Error('Could not get 2D context for text canvas');
		}

		// 设置canvas大小 - 使用更大的尺寸以获得更高分辨率的文字纹理
		tempCanvas.width = 1600;
		tempCanvas.height = 600;

		// 绘制文字
		tempCtx.fillStyle = 'white';
		tempCtx.font = `bold ${this.fontSize}px sans-serif`;
		tempCtx.textAlign = 'center';
		tempCtx.textBaseline = 'middle';
		tempCtx.fillText(this.text, tempCanvas.width / 2, tempCanvas.height / 2);

		// 创建纹理
		this.textTexture = this.gl.createTexture();
		if (!this.textTexture) {
			throw new Error('Failed to create WebGL texture');
		}

		this.gl.bindTexture(this.gl.TEXTURE_2D, this.textTexture);

		// 设置纹理参数
		this.gl.texParameteri(
			this.gl.TEXTURE_2D,
			this.gl.TEXTURE_WRAP_S,
			this.gl.CLAMP_TO_EDGE,
		);
		this.gl.texParameteri(
			this.gl.TEXTURE_2D,
			this.gl.TEXTURE_WRAP_T,
			this.gl.CLAMP_TO_EDGE,
		);
		this.gl.texParameteri(
			this.gl.TEXTURE_2D,
			this.gl.TEXTURE_MIN_FILTER,
			this.gl.LINEAR,
		);
		this.gl.texParameteri(
			this.gl.TEXTURE_2D,
			this.gl.TEXTURE_MAG_FILTER,
			this.gl.LINEAR,
		);

		// 将canvas内容上传到纹理
		this.gl.texImage2D(
			this.gl.TEXTURE_2D,
			0,
			this.gl.RGBA,
			this.gl.RGBA,
			this.gl.UNSIGNED_BYTE,
			tempCanvas,
		);
	}

	animate = (): void => {
		if (!this.gl) return;
		requestAnimationFrame(this.animate);
		// 清除画布 - 使用透明色
		this.gl.clearColor(0.0, 0.0, 0.0, 0.0);
		this.gl.clear(this.gl.COLOR_BUFFER_BIT);

		// 激活纹理单元并绑定纹理
		this.gl.activeTexture(this.gl.TEXTURE0);
		this.gl.bindTexture(this.gl.TEXTURE_2D, this.textTexture as WebGLTexture);
		if (this.textLocation) {
			this.gl.uniform1i(this.textLocation, 0);
		}

		// 设置 uniform 变量
		const currentTime = (Date.now() - this.startTime) / 1000;
		if (this.timeLocation) {
			this.gl.uniform1f(this.timeLocation, currentTime);
		}
		if (this.resolutionLocation) {
			this.gl.uniform2f(
				this.resolutionLocation,
				this.canvas.width,
				this.canvas.height,
			);
		}

		// 绘制
		this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
	};
}

handle(doc, 'DOMContentLoaded', () => {
	initBase();
	new GlitchTextEffect($('canvas')!, '404', 600);
});
