import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {continueRender, delayRender} from 'remotion';
import {VERT} from '../bodies/shaders';

// Full-frame deep-space sky: Milky Way band with dust lanes, faint nebulae,
// three parallax star layers and a warm glow where the low sun sits.
const FRAG = `#version 300 es
precision highp float;
in vec2 vUv; out vec4 o;
uniform float uT, uDrift; uniform vec2 uRes;
float h2(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }
float h1(vec3 p){ p=fract(p*.3183099+.1); p*=17.; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
float vn(vec3 x){ vec3 i=floor(x), f=fract(x); f=f*f*(3.-2.*f);
  return mix(mix(mix(h1(i),h1(i+vec3(1,0,0)),f.x),mix(h1(i+vec3(0,1,0)),h1(i+vec3(1,1,0)),f.x),f.y),
             mix(mix(h1(i+vec3(0,0,1)),h1(i+vec3(1,0,1)),f.x),mix(h1(i+vec3(0,1,1)),h1(i+vec3(1,1,1)),f.x),f.y),f.z); }
float fbm(vec3 p){ float a=.5,s=0.; for(int i=0;i<6;i++){ s+=a*vn(p); p=p*2.02+vec3(3.1,1.7,5.3); a*=.5; } return s; }
float stars(vec2 px, float dens, float seed, float tw){
  vec2 g=px/dens; vec2 c=floor(g); vec2 f=fract(g);
  float r=h2(c+seed);
  vec2 pos=vec2(h2(c+seed+1.7), h2(c+seed+3.1))*.8+.1;
  float d=length((f-pos)*dens);
  float b=pow(r,14.)*3.+pow(r,4.)*.25;
  b*=1.+.25*sin(uT*tw*(1.+r*3.)+r*40.);
  return b*exp(-d*d*1.6);
}
void main(){
  vec2 px=vUv*uRes; px.y=uRes.y-px.y;           // y down, like the SVG
  vec2 p=px/uRes.y;                              // 0..1 over the height
  float ar=uRes.x/uRes.y;
  // base: near-black violet, lifting a little toward the horizon
  float hz=clamp(px.y/1260.,0.,1.);
  vec3 col=mix(vec3(.018,.016,.035), vec3(.07,.055,.09), pow(hz,3.));
  // Milky Way: a tilted band drifting slowly with the camera
  vec2 q=p+vec2(uDrift*.012,0.);
  vec2 dir=normalize(vec2(1.,-1.35));
  vec2 nrm=vec2(-dir.y,dir.x);
  float dist=dot(q-vec2(.30,.42), nrm);
  float along=dot(q,dir);
  float warp=(fbm(vec3(q*2.2,1.))-.5)*.10;
  float band=exp(-pow((dist+warp)/.11,2.));
  float core=exp(-pow((dist+warp)/.045,2.))*smoothstep(-.3,.25,along);
  float neb=fbm(vec3(q*4.5,2.));
  float dust=smoothstep(.5,.72,fbm(vec3(q*9.+vec2(4.,1.),3.)));
  float lane=exp(-pow((dist+warp*1.4-.006)/.018,2.))*.8;
  vec3 mw=mix(vec3(.30,.27,.42), vec3(.85,.70,.55), core)*(band*.55+core*.6)*(.5+neb);
  mw*=1.-.45*dust*band-.45*lane;
  col+=max(mw,0.)*.55;
  // faint coloured nebulae
  col+=vec3(.10,.03,.08)*smoothstep(.55,.8,fbm(vec3(q*2.,7.)))*.6;
  col+=vec3(.02,.06,.09)*smoothstep(.55,.8,fbm(vec3(q*2.3+3.,9.)))*.6;
  // warm glow where the low sun is, just past the left horizon
  float sg=exp(-length((px-vec2(-120.,1260.))*vec2(1.,1.6))/520.);
  col+=vec3(.55,.30,.16)*sg*.55;
  // stars in three depths (parallax), denser inside the band
  float s=0.;
  s+=stars(px+vec2(uDrift*20.,0.), 9., 1., 1.5)*.35*(.6+band);
  s+=stars(px+vec2(uDrift*55.,0.), 26., 7., 2.)*(.7+band*.8);
  s+=stars(px+vec2(uDrift*120.,0.), 70., 13., 2.5)*1.2;
  vec3 sc=mix(vec3(.75,.82,1.), vec3(1.,.88,.75), h2(floor(px/26.)));
  col+=sc*s*(1.-smoothstep(1150.,1260.,px.y));
  o=vec4(col,1.);
}`;

const compile = (gl: WebGL2RenderingContext, type: number, src: string) => {
  const sh = gl.createShader(type)!;
  gl.shaderSource(sh, src); gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh) || 'shader');
  return sh;
};

export const SpaceSky: React.FC<{t: number; drift: number}> = ({t, drift}) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const st = useRef<{gl: WebGL2RenderingContext; loc: Record<string, WebGLUniformLocation | null>} | null>(null);
  const [handle] = useState(() => delayRender('sky'));
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const gl = ref.current!.getContext('webgl2', {preserveDrawingBuffer: true, antialias: false})!;
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog); gl.useProgram(prog);
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const aP = gl.getAttribLocation(prog, 'aP'); gl.enableVertexAttribArray(aP); gl.vertexAttribPointer(aP, 2, gl.FLOAT, false, 0, 0);
    st.current = {gl, loc: {uT: gl.getUniformLocation(prog, 'uT'), uDrift: gl.getUniformLocation(prog, 'uDrift'), uRes: gl.getUniformLocation(prog, 'uRes')}};
    setReady(true);
    continueRender(handle);
  }, []);
  useLayoutEffect(() => {
    const s = st.current; if (!s || !ready) return;
    const {gl, loc} = s;
    gl.viewport(0, 0, 1080, 1920);
    gl.uniform1f(loc.uT, t); gl.uniform1f(loc.uDrift, drift + 1); gl.uniform2f(loc.uRes, 1080, 1920);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); gl.finish();
  });
  return <canvas ref={ref} width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920}} />;
};
