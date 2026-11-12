import React from 'react';
import {Part, VSpec, Wheel} from './types';
import {circle, poly, shape} from './path';

type Props = {spec: VSpec; x: number; g: number; s: number; t: number; v: number; id: string; fps?: number; shadow?: number; lights?: boolean};

const cl = (u: number) => Math.max(0, Math.min(1, u));
const SIL = '#120c10';

// One spoke as a tapered quad from the hub (r0, half-width w0) to the rim (r1, w1), at angle a (twist: extra angle at the rim).
const spoke = (a: number, r0: number, r1: number, w0: number, w1: number, twist = 0) => {
  const c0 = Math.cos(a), s0 = Math.sin(a), c1 = Math.cos(a + twist), s1 = Math.sin(a + twist);
  return poly([
    [c0 * r0 - s0 * w0, s0 * r0 + c0 * w0], [c1 * r1 - s1 * w1, s1 * r1 + c1 * w1],
    [c1 * r1 + s1 * w1, s1 * r1 - c1 * w1], [c0 * r0 + s0 * w0, s0 * r0 - c0 * w0],
  ]);
};

const ring = (r0: number, r1: number, color: string, op = 1) => (
  <circle r={(r0 + r1) / 2} fill="none" stroke={color} strokeWidth={Math.abs(r1 - r0)} opacity={op} />
);

// A wheel centred at the origin. ang is the rotation (radians), sharp in 0..1 fades spokes into a motion-blurred disc.
const WheelArt: React.FC<{w: Wheel; ang: number; sharp: number; id: string}> = ({w, ang, sharp, id}) => {
  const {r, rim} = w;
  const deg = (ang * 180) / Math.PI;
  const tyre = <circle r={r} fill="#17120f" />;
  const side = <circle r={r * 0.93} fill="none" stroke="#3a312b" strokeWidth={r * 0.03} opacity={0.7} />;
  const n = (k: number) => Array.from({length: k}, (_, i) => (i / k) * Math.PI * 2);
  const blur = (color: string, op = 1) => <circle r={rim} fill={color} opacity={(1 - sharp) * op} />;
  switch (w.style) {
    case 'wire':
      return <g>
        {ring(rim, r, '#1b1514')}
        <circle r={rim} fill="none" stroke="#3b3536" strokeWidth={r * 0.035} />
        <g transform={`rotate(${deg})`} opacity={0.35 + 0.65 * sharp}>
          {n(16).map((a, i) => <line key={i} x1={Math.cos(a) * r * 0.08} y1={Math.sin(a) * r * 0.08} x2={Math.cos(a) * rim} y2={Math.sin(a) * rim} stroke="#2a2526" strokeWidth={0.011} />)}
        </g>
        {blur('#2a2526', 0.25)}
        <circle r={r * 0.09} fill={`url(#${id}-brass)`} />
      </g>;
    case 'wood':
      return <g>
        {ring(rim, r, '#141012')}
        {ring(rim * 0.86, rim, '#7c4f2b')}
        <g transform={`rotate(${deg})`} opacity={sharp}>
          {n(12).map((a, i) => <path key={i} d={spoke(a, r * 0.12, rim * 0.88, 0.022, 0.014)} fill="#a8743f" />)}
          <circle r={rim * 0.86} fill="none" stroke="#5c3a1f" strokeWidth={0.006} />
        </g>
        {blur('#8a5c33', 0.85)}
        <circle r={r * 0.15} fill="#2a1d14" />
        <circle r={r * 0.09} fill={`url(#${id}-brass)`} />
      </g>;
    case 'steel':
      return <g>
        {tyre}{side}
        <circle r={rim} fill="#c7ced2" />
        <circle r={rim} fill="none" stroke="#7d868c" strokeWidth={0.012} />
        <g transform={`rotate(${deg})`} opacity={sharp}>
          {n(4).map((a, i) => <ellipse key={i} cx={Math.cos(a) * rim * 0.78} cy={Math.sin(a) * rim * 0.78} rx={0.018} ry={0.018} fill="#2a2e33" />)}
        </g>
        <circle r={rim * 0.62} fill={`url(#${id}-chrome)`} />
        <circle r={rim * 0.16} fill="#8aa3b0" />
      </g>;
    case 'star5':
    case 'multi':
    case 'turbine': {
      const k = w.style === 'star5' ? 5 : w.style === 'multi' ? 10 : 9;
      const col = w.style === 'star5' ? '#5c5a63' : w.style === 'multi' ? '#c6c3cc' : '#b4b8c4';
      const ws = w.style === 'star5' ? [0.03, 0.045] : w.style === 'multi' ? [0.012, 0.016] : [0.014, 0.022];
      return <g>
        {tyre}{side}
        <circle r={rim} fill="#1d1b20" />
        <circle r={rim * 0.72} fill="#4a4446" />
        <circle r={rim * 0.6} fill="#262224" />
        <g transform={`rotate(${deg})`} opacity={sharp}>
          {n(k).map((a, i) => <path key={i} d={spoke(a, rim * 0.18, rim * 0.97, ws[0], ws[1], w.style === 'turbine' ? 0.32 : 0)} fill={col} />)}
        </g>
        {blur(w.style === 'star5' ? '#38363c' : w.style === 'multi' ? '#77747c' : '#666874')}
        {w.caliper && <g transform="rotate(130)"><rect x={rim * 0.52} y={-0.04} width={rim * 0.3} height={0.08} rx={0.02} fill={w.caliper} /></g>}
        <circle r={rim} fill="none" stroke={`url(#${id}-chrome)`} strokeWidth={0.014} />
        <circle r={rim * 0.17} fill={w.style === 'turbine' ? '#c8ccd6' : col} />
        <circle r={rim * 0.07} fill={w.style === 'turbine' ? '#b8322c' : '#2a282c'} />
      </g>;
    }
    case 'f1':
      return <g>
        {tyre}
        <circle r={r * 0.78} fill="none" stroke="#d4302a" strokeWidth={0.016} />
        <g transform={`rotate(${deg})`} opacity={sharp}>
          {[0, 2.2, 4.1].map((a, i) => <path key={i} d={`M${Math.cos(a) * r * 0.88},${Math.sin(a) * r * 0.88} A${r * 0.88},${r * 0.88} 0 0,1 ${Math.cos(a + 0.5) * r * 0.88},${Math.sin(a + 0.5) * r * 0.88}`} fill="none" stroke="#e8e2da" strokeWidth={0.012} opacity={0.75} />)}
        </g>
        {ring(r * 0.86, r * 0.9, '#e8e2da', (1 - sharp) * 0.25)}
        <circle r={rim} fill="#0f0f13" />
        <circle r={rim * 0.92} fill="#2a2a33" />
        <circle r={rim * 0.92} fill="none" stroke="#5a5a66" strokeWidth={0.008} />
        <circle r={rim * 0.12} fill="#d4302a" />
      </g>;
    case 'disc':
      return <g>
        <circle r={r} fill={`url(#${id}-alu)`} />
        <circle r={r * 0.72} fill="none" stroke="#6e6a72" strokeWidth={0.02} />
        <circle r={r * 0.2} fill="#5a5660" />
        <g transform={`rotate(${deg})`} opacity={sharp}>
          {n(6).map((a, i) => <circle key={i} cx={Math.cos(a) * r * 0.45} cy={Math.sin(a) * r * 0.45} r={0.03} fill="#4a4650" />)}
        </g>
      </g>;
  }
};

export const Vehicle: React.FC<Props> = ({spec: S, x, g, s, t, v, id, fps = 30, shadow = 0.55, lights = true}) => {
  const T = `translate(${x - (S.L / 2) * s},${g}) scale(${s},${-s})`;
  const bob = S.bounce * (Math.sin(t * 13.1 + x * 0.001) + 0.5 * Math.sin(t * 29.7 + 1.3)) * Math.min(1, 0.3 + v / 15);
  const fill = (p: Part) => {
    const f = p.fill ?? 'none';
    return ['paint', 'paint2', 'glass', 'chrome', 'brass'].includes(f) ? `url(#${id}-${f})` : f;
  };
  const stroke = (p: Part) => (p.stroke === 'chrome' ? `url(#${id}-chrome)` : p.stroke);
  const partEl = (p: Part, k: string) => (
    <path key={k} d={p.d} fill={fill(p)} stroke={stroke(p)} strokeWidth={p.sw} strokeLinecap="round" strokeLinejoin="round"
      opacity={p.op} clipPath={p.clip ? `url(#${id}-clip)` : undefined} filter={p.blur ? `url(#${id}-blur)` : undefined} />
  );
  const layer = (l: 'back' | 'mid' | 'front') => S.parts.filter((p) => (p.layer ?? 'mid') === l).map((p, i) => partEl(p, l + i));
  const solids = S.parts.filter((p) => p.solid);
  const silhouette = (col: string, wheels = true) => (
    <g>
      <path d={S.body} fill={col} />
      {solids.map((p, i) => <path key={i} d={p.d} fill={p.fill && p.fill !== 'none' ? col : 'none'} stroke={p.stroke ? col : undefined} strokeWidth={p.sw} strokeLinecap="round" />)}
      {wheels && S.wheels.filter((w) => !w.hidden).map((w, i) => <circle key={'w' + i} cx={w.x} cy={w.y ?? w.r} r={w.r} fill={col} />)}
    </g>
  );
  const wheel = (w: Wheel, i: number) => {
    const ang = -(v * t) / w.r + i * 0.7;
    const omega = v / (w.r * fps); // radians per frame
    const sharp = cl(1 - (omega - 0.18) / 0.3);
    const cy = w.y ?? w.r;
    return (
      <g key={'wh' + i} transform={`translate(${w.x + (w.far ? 0.03 : 0)},${cy + (w.far ? 0.025 : 0)})`} opacity={w.far ? 0.75 : 1}>
        <WheelArt w={w} ang={ang} sharp={sharp} id={id} />
        {w.far && <circle r={w.r} fill="#000" opacity={0.35} />}
      </g>
    );
  };
  const rim = 2.4 / s; // rim light offset, in metres
  const clipShapes = [S.body, ...S.parts.filter((p) => p.solid && (p.fill === 'paint' || p.fill === 'paint2')).map((p) => p.d)];
  const k = 0.9, sy = 0.16;
  const fl = S.flame;
  const flick = (a: number) => 1 + 0.07 * Math.sin(t * 47 + a) + 0.05 * Math.sin(t * 83 + a * 2);

  return (
    <g>
      <defs>
        <linearGradient id={`${id}-paint`} gradientUnits="userSpaceOnUse" x1={0} y1={S.H} x2={0} y2={0}>
          <stop offset="0" stopColor={S.paint[0]} /><stop offset="0.5" stopColor={S.paint[1]} /><stop offset="1" stopColor={S.paint[2]} />
        </linearGradient>
        {S.paint2 && <linearGradient id={`${id}-paint2`} gradientUnits="userSpaceOnUse" x1={0} y1={S.H} x2={0} y2={0}>
          <stop offset="0" stopColor={S.paint2[0]} /><stop offset="0.5" stopColor={S.paint2[1]} /><stop offset="1" stopColor={S.paint2[2]} />
        </linearGradient>}
        <linearGradient id={`${id}-glass`} x1="0" y1="1" x2="0.35" y2="0">
          <stop offset="0" stopColor="#5d4c63" /><stop offset="0.38" stopColor="#2a2230" /><stop offset="0.4" stopColor="#7d6672" /><stop offset="0.5" stopColor="#1b1520" /><stop offset="1" stopColor="#0b090e" />
        </linearGradient>
        <linearGradient id={`${id}-chrome`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#fff6ea" /><stop offset="0.45" stopColor="#a59ea2" /><stop offset="0.55" stopColor="#2e2a30" /><stop offset="1" stopColor="#cfc5c0" />
        </linearGradient>
        <linearGradient id={`${id}-brass`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#f6d891" /><stop offset="0.5" stopColor="#b5852f" /><stop offset="1" stopColor="#5a3b12" />
        </linearGradient>
        <radialGradient id={`${id}-alu`}><stop offset="0" stopColor="#d6d2d8" /><stop offset="0.8" stopColor="#9c98a2" /><stop offset="1" stopColor="#5e5a64" /></radialGradient>
        <linearGradient id={`${id}-refl`} gradientUnits="userSpaceOnUse" x1={0} y1={(S.belt ?? 0) + 0.06} x2={0} y2={0}>
          <stop offset="0" stopColor="#ffd9b8" stopOpacity="0" />
          <stop offset="0.12" stopColor="#ffe2c4" stopOpacity="0.55" />
          <stop offset="0.2" stopColor="#140c10" stopOpacity="0.45" />
          <stop offset="0.7" stopColor="#140c10" stopOpacity="0.25" />
          <stop offset="1" stopColor="#3a2a24" stopOpacity="0.1" />
        </linearGradient>
        <radialGradient id={`${id}-glow`}><stop offset="0" stopColor="#fff6e4" stopOpacity="0.95" /><stop offset="0.25" stopColor="#ffe9c8" stopOpacity="0.45" /><stop offset="1" stopColor="#ffd9a8" stopOpacity="0" /></radialGradient>
        <radialGradient id={`${id}-tglow`}><stop offset="0" stopColor="#ff6a50" stopOpacity="0.9" /><stop offset="0.3" stopColor="#ff3a2a" stopOpacity="0.35" /><stop offset="1" stopColor="#ff2a1a" stopOpacity="0" /></radialGradient>
        <linearGradient id={`${id}-flame`} x1="1" y1="0" x2="0" y2="0">
          <stop offset="0" stopColor="#fff3d0" /><stop offset="0.2" stopColor="#ffb25a" stopOpacity="0.9" /><stop offset="0.6" stopColor="#ff6a2a" stopOpacity="0.45" /><stop offset="1" stopColor="#c23a1a" stopOpacity="0" />
        </linearGradient>
        <clipPath id={`${id}-clip`}>{clipShapes.map((d, i) => <path key={i} d={d} />)}</clipPath>
        <filter id={`${id}-blur`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation={0.02} /></filter>
        <filter id={`${id}-sh`} x="-30%" y="-80%" width="160%" height="260%"><feGaussianBlur stdDeviation={Math.max(1.5, s * 0.035)} /></filter>
        <filter id={`${id}-soft`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation={0.05} /></filter>
        <filter id={`${id}-dust`} x="-50%" y="-80%" width="200%" height="260%"><feGaussianBlur stdDeviation={0.55} /></filter>
      </defs>

      {S.dust && (
        <g transform={T} filter={`url(#${id}-dust)`}>
          {Array.from({length: 26}, (_, i) => {
            const d = 1 + i * 1.6 + ((t * 9) % 1.6);
            const h = 0.6 + d * 0.11;
            return <ellipse key={i} cx={-d + 0.8 * Math.sin(i * 2.1 + t * 3)} cy={h * 0.55} rx={1.4 + d * 0.06} ry={h * (0.8 + 0.15 * Math.sin(i * 1.7 + t * 5))} fill="#c3a189" opacity={0.5 * Math.pow(1 - i / 26, 1.4)} />;
          })}
        </g>
      )}
      {shadow > 0 && (
        <g transform={`matrix(1,0,${-k},${-sy},${k * g},${g * (1 + sy)})`} filter={`url(#${id}-sh)`} opacity={shadow}>
          <g transform={T}>{silhouette(SIL)}</g>
        </g>
      )}
      <g transform={T}>
        <ellipse cx={S.L / 2} cy={0} rx={S.L * 0.48} ry={0.07} fill="#000" opacity={0.45} filter={`url(#${id}-soft)`} />
        {S.wheels.map((w, i) => <ellipse key={i} cx={w.x} cy={0} rx={w.r * 0.8} ry={0.035} fill="#000" opacity={0.6} filter={`url(#${id}-soft)`} />)}
        {S.wheels.map((w, i) => (w.far ? wheel(w, i) : null))}
        <g transform={`translate(0,${bob})`}>
          <g transform={`translate(${-rim},${rim * 0.7})`} opacity={0.9}>{silhouette('#ffcfa2', false)}</g>
          {layer('back')}
          <path d={S.body} fill={`url(#${id}-paint)`} />
          {S.belt !== undefined && <rect x={-1} y={0} width={S.L + 2} height={S.belt + 0.06} fill={`url(#${id}-refl)`} clipPath={`url(#${id}-clip)`} />}
          {layer('mid')}
          {S.wheels.filter((w) => !w.far && w.well !== false).map((w, i) => <circle key={'well' + i} cx={w.x} cy={(w.y ?? w.r) - bob} r={w.r * 1.1} fill="#0b0909" clipPath={`url(#${id}-clip)`} />)}
        </g>
        {S.wheels.map((w, i) => (w.far ? null : wheel(w, i)))}
        <g transform={`translate(0,${bob})`}>
          {layer('front')}
          {fl && (
            <g>
              <path d={shape([[fl.x, fl.y + fl.r * 0.95, 0], [fl.x - fl.len * 0.5 * flick(1), fl.y + fl.r * 0.55], [fl.x - fl.len * flick(2), fl.y, 0], [fl.x - fl.len * 0.5 * flick(3), fl.y - fl.r * 0.55], [fl.x, fl.y - fl.r * 0.95, 0]])} fill={`url(#${id}-flame)`} filter={`url(#${id}-soft)`} />
              <path d={shape([[fl.x, fl.y + fl.r * 0.6, 0], [fl.x - fl.len * 0.45 * flick(4), fl.y, 0], [fl.x, fl.y - fl.r * 0.6, 0]])} fill="#fff6dc" opacity={0.85} filter={`url(#${id}-soft)`} />
              {[0, 1, 2, 3].map((i) => <ellipse key={i} cx={fl.x - fl.len * (0.16 + 0.17 * i)} cy={fl.y} rx={fl.r * 0.22} ry={fl.r * (0.42 - i * 0.07)} fill="#fff1c8" opacity={(0.8 - i * 0.17) * flick(i)} filter={`url(#${id}-soft)`} />)}
              <circle cx={fl.x - 0.3} cy={fl.y} r={fl.r * 3} fill={`url(#${id}-glow)`} opacity={0.6} />
            </g>
          )}
          {lights && S.head && <>
            <circle cx={S.head[0]} cy={S.head[1]} r={0.45} fill={`url(#${id}-glow)`} />
            <ellipse cx={S.head[0] + 3.2} cy={0.02} rx={3.4} ry={0.09} fill="#ffe7c4" opacity={0.18} filter={`url(#${id}-soft)`} />
          </>}
          {lights && S.tail?.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r={0.28} fill={`url(#${id}-tglow)`} />)}
        </g>
      </g>
    </g>
  );
};

export {circle};
