// Fragment shaders for each kind of body. Each draws into a square canvas whose
// half-width is `ext` body radii; uRf = 1/ext, uPx = body radius in canvas pixels.
import {BodyKind} from '../engine/types';

export const VERT = `#version 300 es
in vec2 aP; out vec2 vUv;
void main(){ vUv = aP*0.5+0.5; gl_Position = vec4(aP,0.,1.); }`;

const HEAD = `#version 300 es
precision highp float;
in vec2 vUv; out vec4 o;
uniform float uT, uRf, uPx, uSeed, uIncl, uSpin;
uniform vec3 uL, uTint;
uniform sampler2D uTex0, uTex1;
const float PI = 3.14159265;
float h1(vec3 p){ p = fract(p*0.3183099+0.1); p *= 17.0; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
float vn(vec3 x){ vec3 i=floor(x), f=fract(x); f=f*f*(3.-2.*f);
  return mix(mix(mix(h1(i),h1(i+vec3(1,0,0)),f.x),mix(h1(i+vec3(0,1,0)),h1(i+vec3(1,1,0)),f.x),f.y),
             mix(mix(h1(i+vec3(0,0,1)),h1(i+vec3(1,0,1)),f.x),mix(h1(i+vec3(0,1,1)),h1(i+vec3(1,1,1)),f.x),f.y),f.z); }
float fbm(vec3 p){ float a=.5, s=0.; for(int i=0;i<6;i++){ s+=a*vn(p); p=p*2.03+vec3(1.7,9.2,3.1); a*=.5; } return s; }
mat3 rotY(float a){ float c=cos(a), s=sin(a); return mat3(c,0.,-s, 0.,1.,0., s,0.,c); }
mat3 rotZ(float a){ float c=cos(a), s=sin(a); return mat3(c,s,0., -s,c,0., 0.,0.,1.); }
vec2 Q(){ return (vUv*2.-1.)/uRf; }
float edgeA(float d){ return clamp((1.-d)*uPx+.5, 0., 1.); }
vec3 sphereN(vec2 q){ return vec3(q, sqrt(max(0., 1.-dot(q,q)))); }
vec2 equi(vec3 b){ return vec2(atan(b.x,b.z)/(2.*PI)+.5, .5 - asin(clamp(b.y,-1.,1.))/PI); }
// dusk key light (warm, low, from the left) + cool sky fill
vec3 lit(vec3 alb, vec3 n){ vec3 L=normalize(uL); float l=max(dot(n,L),0.);
  float fill = .5+.5*n.y; return alb*(vec3(1.,.87,.74)*l*1.25 + vec3(.10,.09,.15)*(.6+.4*fill)); }
vec4 pm(vec3 c, float a){ return vec4(c*a, a); }
float radFade(){ float e=1./uRf; float d=length(vUv*2.-1.)*e; return smoothstep(e, mix(1.,e,.25), d); }
float boxFade(){ vec2 e=abs(vUv*2.-1.); float m=max(e.x,e.y); return smoothstep(1.,.82,m); }
vec3 bodyCoord(vec3 n, float tilt, float spin){ return rotY(spin) * (rotZ(tilt) * n); }
`;

const EARTH = `
void main(){
  vec2 q=Q(); float d=length(q); vec3 L=normalize(uL);
  vec4 col=vec4(0.);
  if(d<1.){
    vec3 n=sphereN(q); vec3 b=bodyCoord(n,-.41,uSpin+uT*.06);
    vec3 day=pow(texture(uTex0,equi(b)).rgb, vec3(1.1));
    vec3 bc=bodyCoord(n,-.41,uSpin+uT*.075);
    float cl=texture(uTex1,equi(bc)).r;
    float ocean=smoothstep(.02,.12, day.b-day.r);
    vec3 surf=mix(day, vec3(.97), cl*.85);
    vec3 c=lit(surf,n);
    vec3 R=reflect(-L,n); c += vec3(1.,.85,.7)*pow(max(R.z,0.),30.)*ocean*(1.-cl)*.35;
    float rim=pow(1.-n.z,2.5); c=mix(c, vec3(.45,.65,1.)*(.25+max(dot(n,L)+.35,0.)), rim*.55);
    col=pm(c, edgeA(d));
  }
  float g=exp(-(d-1.)*28.)*smoothstep(.0,.02,d-.98);
  float side=clamp(dot(normalize(vec3(q,.3)),L)+.6,0.,1.);
  vec3 gc=vec3(.45,.68,1.)*g*side*.8;
  o = col + vec4(gc, g*side*.8)*(1.-col.a);
  o*=radFade();
}`;

const MOON = `
void main(){
  vec2 q=Q(); float d=length(q); if(d>1.02){ o=vec4(0.); return; }
  vec3 n=sphereN(q); vec3 b=bodyCoord(n,0.,uSpin+uT*.03);
  vec3 alb=pow(texture(uTex0,equi(b)).rgb, vec3(1.15))*1.05;
  o=pm(lit(alb,n), edgeA(d));
}`;

const MARS = `
void main(){
  vec2 q=Q(); float d=length(q); vec3 L=normalize(uL);
  vec4 col=vec4(0.);
  if(d<1.){
    vec3 n=sphereN(q); vec3 b=bodyCoord(n,-.44,uSpin+uT*.06);
    float n1=fbm(b*2.6+11.), n2=fbm(b*9.+3.), n3=fbm(b*24.);
    vec3 alb=mix(vec3(.74,.40,.22), vec3(.40,.20,.13), smoothstep(.48,.66,n1));
    alb=mix(alb, vec3(.86,.58,.40), smoothstep(.55,.75,n2)*.45);
    alb*= .88+.24*n3;
    alb=mix(alb, vec3(.95,.93,.9), smoothstep(.86,.92,abs(b.y)+.04*n2));
    vec3 c=lit(alb,n);
    c=mix(c, vec3(.9,.6,.5)*max(dot(n,L)+.3,0.)*.6, pow(1.-n.z,3.)*.35);
    col=pm(c,edgeA(d));
  }
  float g=exp(-(d-1.)*45.)*smoothstep(0.,.02,d-.98)*clamp(dot(normalize(vec3(q,.3)),L)+.5,0.,1.);
  o=col+vec4(vec3(.95,.6,.45)*g*.5, g*.5)*(1.-col.a);
  o*=radFade();
}`;

const JUPITER = `
void main(){
  vec2 q=Q(); float d=length(q); if(d>1.02){ o=vec4(0.); return; }
  vec3 n=sphereN(q); vec3 b=bodyCoord(n,-.05,uSpin+uT*.035);
  float lat=b.y, lon=atan(b.x,b.z);
  float w=fbm(vec3(b.x*3.5, lat*14., b.z*3.5))-.5;
  float w2=fbm(vec3(b.x*9., lat*40., b.z*9.))-.5;
  float y=lat+w*.08+w2*.025;
  float band=.75*sin(y*PI*6.1+.9)+.55*sin(y*PI*3.3+2.1)+.3*sin(y*PI*15.+1.);
  vec3 cream=vec3(.90,.84,.74), belt=vec3(.66,.47,.33), rust=vec3(.72,.42,.28);
  vec3 alb=mix(cream, belt, smoothstep(-.2,1.,band)*.8);
  alb=mix(alb, rust, smoothstep(.9,1.25,band)*.5);
  alb*= .9+.18*fbm(vec3(b.x*10., y*70., b.z*10.));
  alb=mix(alb, vec3(.58,.54,.52), smoothstep(.55,.95,abs(lat)));
  // Great Red Spot
  float glon=lon+.35; glon=mod(glon+PI,2.*PI)-PI;
  float e=pow(glon/.30,2.)+pow((lat+.37)/.10,2.);
  float sw=fbm(vec3(glon*8., lat*20., 2.));
  alb=mix(alb, mix(vec3(.80,.45,.32), vec3(.9,.65,.5), sw), smoothstep(1.,.55,e));
  vec3 c=lit(alb,n)*(.82+.18*pow(n.z,.4));
  o=pm(c,edgeA(d));
}`;

const NEPTUNE = `
void main(){
  vec2 q=Q(); float d=length(q); vec3 L=normalize(uL);
  vec4 col=vec4(0.);
  if(d<1.){
    vec3 n=sphereN(q); vec3 b=bodyCoord(n,-.49,uSpin+uT*.1);
    float lat=b.y, lon=atan(b.x,b.z);
    vec3 alb=vec3(.24,.42,.82)+.04*sin(lat*22.)+vec3(0.,.02,.05)*fbm(b*6.);
    alb*=mix(1.,.75,smoothstep(.5,1.,abs(lat)));
    float slon=mod(lon-.6+PI,2.*PI)-PI;
    float spot=pow(slon/.28,2.)+pow((lat+.33)/.09,2.);
    alb=mix(alb, vec3(.10,.20,.48), smoothstep(1.,.5,spot));
    float st=smoothstep(.62,.8,fbm(vec3(b.x*2.5, lat*30., b.z*2.5)))*smoothstep(.15,.0,abs(fract(lat*3.+.2)-.5)-.2);
    alb=mix(alb, vec3(.85,.9,1.), st*.45);
    vec3 c=lit(alb,n);
    c=mix(c, vec3(.5,.7,1.)*max(dot(n,L)+.4,0.)*.7, pow(1.-n.z,2.5)*.5);
    col=pm(c,edgeA(d));
  }
  float g=exp(-(d-1.)*30.)*smoothstep(0.,.02,d-.98)*clamp(dot(normalize(vec3(q,.3)),L)+.6,0.,1.);
  o=col+vec4(vec3(.45,.65,1.)*g*.6, g*.6)*(1.-col.a);
  o*=radFade();
}`;

const SUN = `
void main(){
  vec2 q=Q(); float d=length(q);
  vec4 col=vec4(0.);
  if(d<1.){
    vec3 n=sphereN(q); vec3 b=bodyCoord(n,0.,uT*.02);
    float mu=n.z;
    float gr=fbm(b*55.+vec3(0.,0.,uT*.25));
    float gr2=fbm(b*14.+vec3(uT*.05));
    float I=.78+.32*gr+.12*gr2;
    float spot=smoothstep(.70,.74,fbm(b*5.+4.));
    I*=1.-.55*spot;
    I*=.38+.62*pow(mu,.55);
    vec3 c=mix(vec3(.95,.35,.06), vec3(1.,.93,.72), smoothstep(.35,1.,I))*(.55+I*.8);
    col=pm(c, edgeA(d));
  }
  float r=max(d-1.,0.);
  float g=exp(-r*7.)*.85+exp(-r*1.8)*.28;
  g*= .85+.15*fbm(vec3(normalize(q)*3., uT*.05));
  o=col+vec4(vec3(1.,.62,.28)*g, g*.9)*(1.-col.a);
  o*=radFade();
}`;

const REDGIANT = `
void main(){
  vec2 q=Q(); float d=length(q);
  vec4 col=vec4(0.);
  vec2 wq=q*(1.+.04*(fbm(vec3(q*1.5,uT*.03))-.5));
  float dw=length(wq);
  if(dw<1.){
    vec3 n=sphereN(wq); vec3 b=bodyCoord(n,0.,uT*.01);
    float c1=fbm(b*1.9+vec3(0.,0.,uT*.04)), c2=fbm(b*5.5+2.);
    float I=.62+.45*smoothstep(.34,.7,c1)+.15*c2;
    I*=.30+.70*pow(n.z,.8);
    vec3 c=mix(vec3(.45,.08,.03), vec3(1.,.58,.28), smoothstep(.25,1.05,I))*(.6+.7*I);
    col=pm(c, edgeA(dw));
  }
  float r=max(dw-1.,0.);
  float g=(exp(-r*5.)*.8+exp(-r*1.4)*.25)*(.7+.5*fbm(vec3(q*1.8,1.+uT*.02)));
  o=col+vec4(vec3(1.,.42,.22)*g, g*.85)*(1.-col.a);
  o*=radFade();
}`;

const NEUTRON = `
void main(){
  vec2 q=Q(); float d=length(q);
  vec4 col=vec4(0.);
  // magnetic axis sweeps around as the star spins
  float a=.55+.55*sin(uT*1.6+uSeed);
  vec2 ax=vec2(sin(a),cos(a));
  if(d<1.){
    vec3 n=sphereN(q);
    float hot=pow(max(abs(dot(n,normalize(vec3(ax,.35)))),0.),18.);
    float I=.75+.25*n.z+.06*fbm(n*20.+uT);
    vec3 c=mix(vec3(.72,.85,1.), vec3(1.), hot)*(I+hot*.6)*1.15;
    col=pm(c, edgeA(d));
  }
  float along=dot(q,ax), perp=abs(q.x*ax.y-q.y*ax.x);
  float al=abs(along);
  float beam=exp(-perp/(.10+.16*al))*exp(-al/(uRf>0.? 1./uRf*.55 : 3.))*smoothstep(.8,1.6,al);
  float r=max(d-1.,0.);
  float g=exp(-r*2.2)*.75+exp(-r*.5)*.15;
  vec3 gc=vec3(.55,.75,1.)*(g+beam*.9);
  float ga=clamp(g+beam*.8,0.,1.);
  o=col+vec4(gc, ga)*(1.-col.a);
  o*=radFade();
}`;

// Schwarzschild black hole with a thin accretion disk, ray-traced.
// Units: M = 1, so the event horizon is at r = 2. q is in horizon radii.
const BLACKHOLE = `
vec3 diskColor(float T){
  // T ~ 0..1.4: deep red -> orange -> warm white
  vec3 c=mix(vec3(.55,.10,.02), vec3(1.,.48,.12), smoothstep(.0,.55,T));
  c=mix(c, vec3(1.,.86,.62), smoothstep(.55,1.1,T));
  return mix(c, vec3(1.,.97,.92), smoothstep(1.1,1.6,T));
}
void main(){
  vec2 q=Q(); float cr=cos(uSpin), sr=sin(uSpin); q=vec2(cr*q.x-sr*q.y, sr*q.x+cr*q.y); vec2 s=q*2.;
  float inc=uIncl;
  vec3 cam=vec3(0., cos(inc), -sin(inc))*60.;
  vec3 fwd=-normalize(cam), up=vec3(0., sin(inc), cos(inc)), right=vec3(1.,0.,0.);
  vec3 pos=cam+right*s.x+up*s.y, vel=fwd;
  // start close to the hole: move along the straight ray first
  pos += vel*45.;
  float h2=dot(cross(pos,vel),cross(pos,vel));
  vec3 acc=vec3(0.); float A=0.; bool cap=false;
  float rin=6., rout=12.;
  for(int i=0;i<220;i++){
    float r=length(pos);
    if(r<2.02){ cap=true; break; }
    if(r>70. && dot(pos,vel)>0.) break;
    float dt=clamp(.07*r, .015, 2.);
    vec3 a=-1.5*h2*pos/pow(r,5.);
    vec3 p0=pos;
    vel+=a*dt; pos+=vel*dt;
    if(p0.y*pos.y<0.){
      float t=p0.y/(p0.y-pos.y); vec3 P=mix(p0,pos,t);
      float rr=length(P.xz);
      if(rr>rin && rr<rout){
        float phi=atan(P.z,P.x);
        float om=pow(rr,-1.5);
        float ph=phi-uT*om*6.;
        float nz=fbm(vec3(cos(ph)*rr*.9, sin(ph)*rr*.9, rr*.35));
        float nz2=fbm(vec3(cos(ph)*rr*3., sin(ph)*rr*3., 5.));
        float Tp=pow(rr/rin,-.75)*pow(max(1.-sqrt(rin/rr),0.),.25)*2.2;
        vec3 vdir=normalize(vec3(-sin(phi),0.,cos(phi)));
        float v=sqrt(1./rr);
        float g=sqrt(1.-v*v)/(1.-v*dot(vdir,-normalize(vel)))*sqrt(max(1.-3./rr,0.));
        float I=Tp*pow(g,3.)*(.45+.9*nz)*(.8+.4*nz2);
        float fade=smoothstep(rin,rin+.6,rr)*smoothstep(rout,rout-4.,rr);
        vec3 c=diskColor(I*uTint.y)*I*1.25;
        float al=clamp(I*1.4,0.,1.)*fade*uTint.z;
        acc+=(1.-A)*c*al; A+=(1.-A)*al;
      }
    }
    if(A>.985) break;
  }
  if(cap){ A=1.; }
  else {
    float b=sqrt(h2);
    float ring=exp(-pow((b-5.196)*3.2,2.))*.9;
    acc+=(1.-A)*diskColor(1.)*ring; A+=(1.-A)*ring*.9;
  }
  // dashed circle marking the true event horizon (inside the shadow)
  float rq=length(q);
  float ang=atan(q.y,q.x);
  float dash=step(.5,fract(ang*12./PI));
  float line=smoothstep(1.4/uPx,0.,abs(rq-1.))*dash*(cap?1.:0.);
  acc+=vec3(.85,.8,.75)*line*.55;
  o=vec4(acc, A)*boxFade();
}`;

export const FRAG: Record<BodyKind, string> = {
  earth: HEAD + EARTH,
  moon: HEAD + MOON,
  mars: HEAD + MARS,
  jupiter: HEAD + JUPITER,
  neptune: HEAD + NEPTUNE,
  sun: HEAD + SUN,
  redgiant: HEAD + REDGIANT,
  neutron: HEAD + NEUTRON,
  blackhole: HEAD + BLACKHOLE,
};

export const TEXTURES: Partial<Record<BodyKind, string[]>> = {
  earth: ['textures/earth-day.jpg', 'textures/earth-clouds.jpg'],
  moon: ['textures/moon.jpg'],
};
