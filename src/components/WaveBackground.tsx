"use client"

import React, { useEffect, useRef } from 'react'

interface WaveBackgroundProps {
  xScale?: number;
  yScale?: number;
  distortion?: number;
  speed?: number;
  color1?: string;
  color2?: string;
  color3?: string;
}

const hexToRgb = (hex: string) => {
  const cleanHex = hex.replace('#', '');
  if (cleanHex.length !== 6) return [1, 1, 1]; 
  return [
    parseInt(cleanHex.substring(0, 2), 16) / 255,
    parseInt(cleanHex.substring(2, 4), 16) / 255,
    parseInt(cleanHex.substring(4, 6), 16) / 255
  ];
};

export default function WaveBackground({
  xScale = 1.0,
  yScale = 0.5,
  distortion = 0.05,
  speed = 1.0,
  color1 = "#ff0000",
  color2 = "#00ff00",
  color3 = "#0000ff" 
}: WaveBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl');
    if (!gl) return;

    const vsSource = `
      attribute vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    const fsSource = `
      precision highp float;
      uniform vec2 resolution;
      uniform float time;
      uniform float xScale;
      uniform float yScale;
      uniform float distortion;
      
      // Добавляем переменные цветов
      uniform vec3 u_color1;
      uniform vec3 u_color2;
      uniform vec3 u_color3;

      void main() {
        vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
        
        float d = length(p) * distortion;
        
        float rx = p.x * (1.0 + d);
        float gx = p.x;
        float bx = p.x * (1.0 - d);

        float i1 = 0.05 / abs(p.y + sin((rx + time) * xScale) * yScale);
        float i2 = 0.05 / abs(p.y + sin((gx + time) * xScale) * yScale);
        float i3 = 0.05 / abs(p.y + sin((bx + time) * xScale) * yScale);
        
        vec3 finalColor = (i1 * u_color1) + (i2 * u_color2) + (i3 * u_color3);
        
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `;

    const compileShader = (source: string, type: number) => {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
    };

    const vertexShader = compileShader(vsSource, gl.VERTEX_SHADER);
    const fragmentShader = compileShader(fsSource, gl.FRAGMENT_SHADER);

    const program = gl.createProgram()!;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1.0, -1.0,  1.0, -1.0,  -1.0, 1.0,  1.0, 1.0]),
      gl.STATIC_DRAW
    );

    const positionLocation = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const resolutionLoc = gl.getUniformLocation(program, "resolution");
    const timeLoc = gl.getUniformLocation(program, "time");
    const xScaleLoc = gl.getUniformLocation(program, "xScale");
    const yScaleLoc = gl.getUniformLocation(program, "yScale");
    const distortionLoc = gl.getUniformLocation(program, "distortion");
    
    const color1Loc = gl.getUniformLocation(program, "u_color1");
    const color2Loc = gl.getUniformLocation(program, "u_color2");
    const color3Loc = gl.getUniformLocation(program, "u_color3");

    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);
    const rgb3 = hexToRgb(color3);

    let animationFrameId: number;
    const startTime = Date.now();

    const render = () => {
      if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
      }

      const time = (Date.now() - startTime) * 0.001 * speed;

      gl.uniform2f(resolutionLoc, canvas.width, canvas.height);
      gl.uniform1f(timeLoc, time);
      gl.uniform1f(xScaleLoc, xScale);
      gl.uniform1f(yScaleLoc, yScale);
      gl.uniform1f(distortionLoc, distortion);
      
      gl.uniform3f(color1Loc, rgb1[0], rgb1[1], rgb1[2]);
      gl.uniform3f(color2Loc, rgb2[0], rgb2[1], rgb2[2]);
      gl.uniform3f(color3Loc, rgb3[0], rgb3[1], rgb3[2]);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      gl.deleteBuffer(positionBuffer);
    };
  }, [xScale, yScale, distortion, speed, color1, color2, color3]); // Добавили цвета в зависимости

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none -z-10 mix-blend-screen opacity-60"
    />
  );
}