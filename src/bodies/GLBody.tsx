import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {continueRender, delayRender, staticFile} from 'remotion';
import {BodyKind} from '../engine/types';
import {FRAG, TEXTURES, VERT} from './shaders';

const imgCache = new Map<string, Promise<HTMLImageElement>>();
const loadImg = (src: string) => {
  if (!imgCache.has(src)) {
    imgCache.set(src, new Promise((res, rej) => {
      const im = new Image();
      im.onload = () => res(im);
      im.onerror = rej;
      im.src = staticFile(src);
    }));
  }
  return imgCache.get(src)!;
};

type GLState = {gl: WebGL2RenderingContext; prog: WebGLProgram; loc: Record<string, WebGLUniformLocation | null>};

const compile = (gl: WebGL2RenderingContext, type: number, src: string) => {
  const sh = gl.createShader(type)!;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh) || 'shader error');
  return sh;
};

export type GLBodyProps = {
  kind: BodyKind;
  x: number; y: number; // centre on screen
  r: number; // body radius on screen (px)
  ext: number;
  t: number; // seconds
  maxRes?: number;
  light?: [number, number, number];
  params?: {seed?: number; incl?: number; spin?: number; tint?: [number, number, number]};
};

export const GLBody: React.FC<GLBodyProps> = ({kind, x, y, r, ext, t, maxRes = 1024, light = [-0.85, 0.12, 0.5], params = {}}) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const st = useRef<GLState | null>(null);
  const [ready, setReady] = useState(false);
  const [handle] = useState(() => delayRender(`gl-${kind}`));
  const css = 2 * ext * r;
  const res = Math.max(8, Math.min(Math.ceil(css), maxRes));

  useEffect(() => {
    const canvas = ref.current!;
    const gl = canvas.getContext('webgl2', {premultipliedAlpha: true, preserveDrawingBuffer: true, antialias: false})!;
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG[kind]));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog) || 'link');
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const aP = gl.getAttribLocation(prog, 'aP');
    gl.enableVertexAttribArray(aP);
    gl.vertexAttribPointer(aP, 2, gl.FLOAT, false, 0, 0);
    const names = ['uT', 'uRf', 'uPx', 'uSeed', 'uIncl', 'uSpin', 'uL', 'uTint', 'uTex0', 'uTex1'];
    const loc: GLState['loc'] = {};
    for (const n of names) loc[n] = gl.getUniformLocation(prog, n);
    const texs = TEXTURES[kind] ?? [];
    Promise.all(texs.map(loadImg)).then((imgs) => {
      imgs.forEach((im, i) => {
        gl.activeTexture(gl.TEXTURE0 + i);
        const tx = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tx);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, im);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.uniform1i(loc[`uTex${i}`], i);
      });
      st.current = {gl, prog, loc};
      setReady(true);
      continueRender(handle);
    });
  }, []);

  useLayoutEffect(() => {
    const s = st.current;
    if (!s || !ready) return;
    const {gl, loc} = s;
    const c = ref.current!;
    if (c.width !== res) { c.width = res; c.height = res; }
    gl.viewport(0, 0, res, res);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1f(loc.uT, t);
    gl.uniform1f(loc.uRf, 1 / ext);
    gl.uniform1f(loc.uPx, (res / 2) / ext);
    gl.uniform1f(loc.uSeed, params.seed ?? 0);
    gl.uniform1f(loc.uIncl, params.incl ?? 1.4);
    gl.uniform1f(loc.uSpin, params.spin ?? 0);
    gl.uniform3fv(loc.uL, light);
    gl.uniform3fv(loc.uTint, params.tint ?? [1, 1, 1]);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.finish();
  });

  return (
    <canvas
      ref={ref}
      width={res}
      height={res}
      style={{position: 'absolute', left: x - css / 2, top: y - css / 2, width: css, height: css}}
    />
  );
};
