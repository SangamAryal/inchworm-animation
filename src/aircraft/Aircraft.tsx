import React from 'react';
import {APart, ASpec} from './types';
import {shape} from '../vehicles/path';

// x: screen x of the aircraft's middle, g: screen y of its centre line, s: px per metre,
// t: seconds (for props, flames and drift), v: airspeed in m/s (blurs props and stretches trails).
type Props = {spec: ASpec; x: number; g: number; s: number; t: number; v: number; id: string; trail?: number; pitch?: number};

const cl = (u: number) => Math.max(0, Math.min(1, u));

export const Aircraft: React.FC<Props> = ({spec: S, x, g, s, t, v, id, trail = 1, pitch = 0}) => {
  const drift = S.bob * (Math.sin(t * 1.7 + x * 0.002) + 0.4 * Math.sin(t * 3.9 + 1.1));
  const tilt = pitch + 0.6 * Math.sin(t * 1.3 + 0.4); // degrees, nose up positive
  const T = `translate(${x},${g}) rotate(${-tilt}) translate(${-(S.L / 2) * s},${-drift * s}) scale(${s},${-s})`;
  const fill = (p: APart) => {
    const f = p.fill ?? 'none';
    return ['paint', 'paint2', 'glass', 'metal', 'dark'].includes(f) ? `url(#${id}-${f})` : f;
  };
  const partEl = (p: APart, k: string) => (
    <path key={k} d={p.d} fill={fill(p)} stroke={p.stroke} strokeWidth={p.sw} strokeLinecap="round" strokeLinejoin="round"
      opacity={p.op} clipPath={p.clip ? `url(#${id}-clip)` : undefined} />
  );
  const layer = (l: 'back' | 'mid' | 'front') => S.parts.filter((p) => (p.layer ?? 'mid') === l).map((p, i) => partEl(p, l + i));
  const solids = S.parts.filter((p) => p.solid);
  const silhouette = (col: string) => (
    <g>
      <path d={S.body} fill={col} />
      {solids.map((p, i) => <path key={i} d={p.d} fill={p.fill && p.fill !== 'none' ? col : 'none'} stroke={p.stroke ? col : undefined} strokeWidth={p.sw} strokeLinecap="round" />)}
    </g>
  );
  const rim = (S.rim ?? 2.2) / s; // rim light offset (m): the low sun is behind, to the left
  const clipShapes = [S.body, ...S.parts.filter((p) => p.solid && (p.fill === 'paint' || p.fill === 'paint2')).map((p) => p.d)];
  const flick = (a: number) => 1 + 0.08 * Math.sin(t * 47 + a) + 0.05 * Math.sin(t * 83 + a * 2);
  const grad = (key: string, c: [string, string, string]) => (
    <linearGradient id={`${id}-${key}`} gradientUnits="userSpaceOnUse" x1={0} y1={S.top} x2={0} y2={S.bot}>
      <stop offset="0" stopColor={c[0]} /><stop offset="0.55" stopColor={c[1]} /><stop offset="1" stopColor={c[2]} />
    </linearGradient>
  );
  // contrails: soft white streaks trailing behind, longer at higher speed
  const tLen = Math.min(900, 120 + v * 0.9) / s; // metres
  return (
    <g>
      <defs>
        {grad('paint', S.paint)}
        {S.paint2 && grad('paint2', S.paint2)}
        <linearGradient id={`${id}-glass`} x1="0" y1="1" x2="0.4" y2="0">
          <stop offset="0" stopColor="#7c6a80" /><stop offset="0.4" stopColor="#2a2230" /><stop offset="0.42" stopColor="#9a8290" /><stop offset="0.52" stopColor="#1b1520" /><stop offset="1" stopColor="#0b090e" />
        </linearGradient>
        <linearGradient id={`${id}-metal`} gradientUnits="userSpaceOnUse" x1={0} y1={S.top} x2={0} y2={S.bot}>
          <stop offset="0" stopColor="#f3ece6" /><stop offset="0.35" stopColor="#b9b2b4" /><stop offset="0.5" stopColor="#6c666c" /><stop offset="0.8" stopColor="#9a9298" /><stop offset="1" stopColor="#4a4448" />
        </linearGradient>
        <linearGradient id={`${id}-dark`} gradientUnits="userSpaceOnUse" x1={0} y1={S.top} x2={0} y2={S.bot}>
          <stop offset="0" stopColor="#4a4250" /><stop offset="0.5" stopColor="#1d1a22" /><stop offset="1" stopColor="#0c0a0e" />
        </linearGradient>
        <linearGradient id={`${id}-flame`} x1="1" y1="0" x2="0" y2="0">
          <stop offset="0" stopColor="#fff3d0" /><stop offset="0.2" stopColor="#ffb25a" stopOpacity="0.9" /><stop offset="0.6" stopColor="#ff6a2a" stopOpacity="0.45" /><stop offset="1" stopColor="#c23a1a" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${id}-trail`} x1="1" y1="0" x2="0" y2="0">
          <stop offset="0" stopColor="#fff4ea" stopOpacity="0" /><stop offset="0.04" stopColor="#fff4ea" stopOpacity="0.8" /><stop offset="1" stopColor="#ffe6d6" stopOpacity="0" />
        </linearGradient>
        <radialGradient id={`${id}-glow`}><stop offset="0" stopColor="#fff6e4" stopOpacity="0.9" /><stop offset="0.3" stopColor="#ffcf98" stopOpacity="0.35" /><stop offset="1" stopColor="#ff9a58" stopOpacity="0" /></radialGradient>
        <radialGradient id={`${id}-disc`}><stop offset="0" stopColor="#2a2228" stopOpacity="0.55" /><stop offset="0.85" stopColor="#2a2228" stopOpacity="0.35" /><stop offset="1" stopColor="#2a2228" stopOpacity="0" /></radialGradient>
        <clipPath id={`${id}-clip`}>{clipShapes.map((d, i) => <path key={i} d={d} />)}</clipPath>
        <filter id={`${id}-soft`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation={0.04} /></filter>
        <filter id={`${id}-trailb`} x="-10%" y="-200%" width="120%" height="500%"><feGaussianBlur stdDeviation={Math.max(0.08, 3 / s)} /></filter>
      </defs>
      <g transform={T}>
        {trail > 0 && S.trails?.map(([tx, ty], i) => (
          <g key={'tr' + i} filter={`url(#${id}-trailb)`} opacity={trail}>
            <path d={shape([[tx, ty + 0.05, 0], [tx - tLen * 0.5, ty + 0.35 + tLen * 0.006], [tx - tLen, ty + 0.6 + tLen * 0.01, 0], [tx - tLen, ty - 0.4 - tLen * 0.01, 0], [tx - tLen * 0.5, ty - 0.25 - tLen * 0.006], [tx, ty - 0.05, 0]])} fill={`url(#${id}-trail)`} />
          </g>
        ))}
        {S.flame?.map((fl, i) => {
          const len = fl.len * (fl.kind === 'rocket' ? 1 : 0.8);
          return <g key={'fl' + i}>
            <path d={shape([[fl.x, fl.y + fl.r * 0.95, 0], [fl.x - len * 0.5 * flick(1 + i), fl.y + fl.r * 0.7], [fl.x - len * flick(2 + i), fl.y, 0], [fl.x - len * 0.5 * flick(3 + i), fl.y - fl.r * 0.7], [fl.x, fl.y - fl.r * 0.95, 0]])} fill={`url(#${id}-flame)`} filter={`url(#${id}-soft)`} />
            <path d={shape([[fl.x, fl.y + fl.r * 0.6, 0], [fl.x - len * 0.4 * flick(4 + i), fl.y, 0], [fl.x, fl.y - fl.r * 0.6, 0]])} fill="#fff6dc" opacity={0.9} filter={`url(#${id}-soft)`} />
            {/* shock diamonds */}
            {[0, 1, 2, 3].map((k) => <ellipse key={k} cx={fl.x - len * (0.14 + 0.16 * k)} cy={fl.y} rx={fl.r * 0.2} ry={fl.r * (0.45 - k * 0.08)} fill="#fff1c8" opacity={(0.8 - k * 0.17) * flick(k)} filter={`url(#${id}-soft)`} />)}
            <circle cx={fl.x - fl.r} cy={fl.y} r={fl.r * 4} fill={`url(#${id}-glow)`} opacity={0.55} />
          </g>;
        })}
        <g transform={`translate(${-rim},${rim * 0.8})`} opacity={S.rim ? 1 : 0.85}>{silhouette('#ffd8b0')}</g>
        {layer('back')}
        <path d={S.body} fill={`url(#${id}-paint)`} />
        {layer('mid')}
        {layer('front')}
        {S.props?.map((p, i) => {
          const omega = 40; // rad/s, always a blur at this frame rate
          const ang = t * omega + i;
          return <g key={'pr' + i} transform={`translate(${p.x},${p.y})`}>
            <ellipse rx={p.r * 0.09} ry={p.r} fill={`url(#${id}-disc)`} />
            {Array.from({length: p.blades}, (_, b) => {
              const a = ang + (b / p.blades) * Math.PI * 2;
              const yy = Math.sin(a) * p.r, w = 0.05 + 0.06 * Math.abs(Math.cos(a));
              return <rect key={b} x={-w / 2} y={Math.min(0, yy)} width={w} height={Math.abs(yy)} fill={p.color ?? '#1c1618'} opacity={0.5} />;
            })}
            <ellipse rx={p.r * 0.03} ry={p.r} fill="none" stroke="#f6e6d6" strokeWidth={0.015} opacity={0.35} />
          </g>;
        })}
      </g>
    </g>
  );
};

export const cl01 = cl;
