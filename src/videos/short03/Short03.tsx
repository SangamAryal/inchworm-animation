import React from 'react';
import {AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame} from 'remotion';
import '@fontsource/inter/300.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/ibm-plex-mono/500.css';
import {rng} from '../../engine/noise';
import {TALL, Tall, T03} from './data';
import {makeTallLayout} from './layout';
import {TallDefs, TallObject} from './objects';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const FLOOR = 1260;
const CREAM = '#F4E9DC', MUTE = '#C9B8B0', ACC = '#F2B48A';
const textShadow = {filter: 'drop-shadow(0 2px 6px rgba(20,10,16,0.5))'};

const group = (n: number) => n.toLocaleString('en-US');
export const fmtM = (m: number) => (m < 10 ? m.toFixed(1) : m < 200 ? (Math.round(m * 10) / 10).toString() : group(Math.round(m)));
export const fmtFt = (m: number) => {
  const ft = m * 3.28084;
  if (ft < 30) { const f = Math.floor(ft), i = Math.round((ft - f) * 12); return `${f} ft ${i} in`; }
  return `${group(Math.round(ft))} ft`;
};
const fmtRatio = (r: number) => (r < 10 ? r.toFixed(1) : group(Math.round(r)));

const ridge = (seed: number, y: number, amp: number, len = 2800) => {
  const R = rng(seed);
  let d = `M0,1920 L0,${y}`;
  let a = 0;
  for (let x = 0; x <= len; x += 40) { a += (R() - 0.5) * amp * 0.5; a *= 0.85; d += ` L${x},${(y + a + Math.sin(x / 210 + seed) * amp * 0.6).toFixed(1)}`; }
  return d + ` L${len},1920Z`;
};

// Dusk horizon: violet-to-peach sky, low sun on the left, parallax hills, dark plain.
export const Background: React.FC<{drift: number}> = ({drift}) => {
  const R = rng(4);
  const stars = Array.from({length: 46}, () => ({x: R() * 1080, y: R() * 620, s: 0.8 + R() * 1.6, o: 0.2 + R() * 0.5}));
  const layer = (seed: number, y: number, amp: number, fill: string, depth: number) => {
    const ox = -((((drift + 1) * 260 * depth) % 1400) + 1400) % 1400;
    return <path d={ridge(seed, y, amp)} fill={fill} transform={`translate(${ox},0)`} />;
  };
  return (
    <g>
      <defs>
        <linearGradient id="bSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3E3A52" />
          <stop offset="0.35" stopColor="#6A5872" />
          <stop offset="0.58" stopColor="#B98482" />
          <stop offset="0.66" stopColor="#E3AE8E" />
        </linearGradient>
        <radialGradient id="bSun" cx="0.16" cy="0.62" r="0.55">
          <stop offset="0" stopColor="#FFD9AE" stopOpacity="0.6" />
          <stop offset="1" stopColor="#FFD9AE" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="bGround" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4A3A47" />
          <stop offset="1" stopColor="#1E1822" />
        </linearGradient>
      </defs>
      <rect width={1080} height={1920} fill="url(#bSky)" />
      <rect width={1080} height={1920} fill="url(#bSun)" />
      {stars.map((s, i) => <circle key={i} cx={s.x} cy={s.y} r={s.s} fill="#FFF3E6" opacity={s.o * 0.7} />)}
      <circle cx={170} cy={1180} r={46} fill="#FFE6C2" opacity={0.9} />
      {layer(3, 1150, 60, '#9A7380', 0.15)}
      {layer(7, 1200, 45, '#7A5A6A', 0.3)}
      {layer(11, 1240, 25, '#5A4352', 0.55)}
      <rect y={FLOOR - 4} width={1080} height={1920 - FLOOR + 4} fill="url(#bGround)" />
      <line x1={0} x2={1080} y1={FLOOR - 3} y2={FLOOR - 3} stroke="#E8A57A" strokeOpacity={0.2} strokeWidth={2} />
    </g>
  );
};

const Label: React.FC<{it: Tall; x: number; opacity: number; highlight: boolean; maxW: number}> = ({it, x: x0, opacity, highlight, maxW}) => {
  const fs = Math.max(30, Math.min(48, maxW / (0.56 * it.name.length)));
  const half = Math.max(it.kind.length * 7.4, it.name.length * fs * 0.28, 120) + 20;
  const x = Math.min(Math.max(x0, half), 1080 - half);
  const y = FLOOR + 40;
  return (
    <g opacity={opacity} style={textShadow}>
      <text x={x} y={y + 40} textAnchor="middle" fontFamily="Inter" fontWeight={500} fontSize={19} letterSpacing={3} fill={MUTE}>{it.kind.toUpperCase()}</text>
      <text x={x} y={y + 92} textAnchor="middle" fontFamily="Inter" fontWeight={600} fontSize={fs} fill={CREAM}>{it.name}</text>
      <text x={x} y={y + 146} textAnchor="middle" fontFamily="IBM Plex Mono" fontWeight={500} fontSize={40} fill={highlight ? ACC : CREAM}>{fmtM(it.m)}<tspan fontSize={26} dx={8}>m</tspan></text>
      <text x={x} y={y + 186} textAnchor="middle" fontFamily="IBM Plex Mono" fontWeight={500} fontSize={24} fill={MUTE}>{fmtFt(it.m)}</text>
      {it.note && <text x={x} y={y + 222} textAnchor="middle" fontFamily="Inter" fontWeight={500} fontSize={20} fill={MUTE} opacity={0.85}>{it.note}</text>}
    </g>
  );
};

const niceBar = (s: number) => {
  for (let exp = -1; exp < 6; exp++) for (const k of [1, 2, 5]) {
    const m = k * 10 ** exp;
    if (m * s >= 130) return {m, len: m * s};
  }
  return {m: 1e6, len: 1e6 * s};
};
const barText = (m: number) => (m >= 1000 ? `${m / 1000} km` : `${m} m`);

export type Short03Props = {ids?: string[]; audio?: string; title?: [string, string]};

export const Short03: React.FC<Short03Props> = ({ids, audio, title = ['How tall is', 'the tallest?']}) => {
  const f = useCurrentFrame();
  const items = ids ? ids.map((id) => TALL.find((t) => t.id === id)!) : TALL;
  const L = makeTallLayout(items);
  const p = L.progress(f);
  const {s, cx} = L.camera(p);

  const vis = items.map((it, i) => {
    const x = 540 + (L.centers[i] - cx) * s;
    const hPx = it.m * s;
    if (x + it.r * s < -60 && x + it.m * s * 1.5 < -60) return null;
    if (x - it.l * s > 1140) return null;
    const intro = i === 0 ? interpolate(f, [4, 30], [0, 1], clamp) : 1;
    const labOp = interpolate(hPx, [6, 20], [0, 1], clamp) * intro * interpolate(p - i, [0.05, 0.35], [1, 0], clamp) * interpolate(i - p, [1.45, 1.85], [1, 0], clamp) * (i === 0 ? interpolate(f, [18, 40], [0, 1], clamp) : 1);
    return {it, i, x, hPx, intro, labOp};
  }).filter(Boolean) as {it: Tall; i: number; x: number; hPx: number; intro: number; labOp: number}[];

  const kF = Math.max(0, Math.min(Math.floor(p), L.NP - 1));
  const inTrans = p >= 0 && p !== Math.floor(p);
  const e = p - Math.floor(p);
  const curK = p < 0 ? 0 : inTrans ? (e < 0.5 ? kF : kF + 1) : kF;
  const multOp = interpolate(p, [-0.4, 0], [0, 1], clamp) * (inTrans ? Math.abs(e - 0.5) * 2 : 1);
  const titleOp = interpolate(f, [0, 12], [0, 1], clamp) * interpolate(p, [-1, -0.6], [1, 0], clamp);
  const bar = niceBar(s);
  const endFade = interpolate(f, [L.duration - 14, L.duration - 1], [1, 0], clamp);
  const labelW = Math.min(470, L.sepAt(p) - 40);
  const a = items[curK], b = items[curK + 1];

  return (
    <AbsoluteFill style={{background: '#1B1620', opacity: endFade}}>
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <filter id="toShadow" colorInterpolationFilters="sRGB">
          <feColorMatrix type="matrix" values="0 0 0 0 0.08  0 0 0 0 0.06  0 0 0 0 0.09  0 0 0 0.8 0" />
        </filter>
        <TallDefs />
        <Background drift={p} />
        {/* long cast shadows, away from the low sun on the left */}
        {vis.map((v) => {
          const len = v.it.m * s * 1.5;
          return (
            <g key={'sh' + v.i} opacity={v.intro}>
              <defs>
                <linearGradient id={`sf${v.i}`} gradientUnits="userSpaceOnUse" x1={v.x} y1={0} x2={v.x + len + 1} y2={0}>
                  <stop offset="0" stopColor="#fff" stopOpacity="1" />
                  <stop offset="1" stopColor="#fff" stopOpacity="0" />
                </linearGradient>
                <mask id={`sm${v.i}`} maskUnits="userSpaceOnUse" x={-2000} y={0} width={6000} height={1920}>
                  <rect x={-2000} y={0} width={6000} height={1920} fill={`url(#sf${v.i})`} />
                </mask>
              </defs>
              <g mask={`url(#sm${v.i})`} filter="url(#toShadow)">
                <g transform={`translate(${v.x},${FLOOR}) matrix(1,0,-1.5,0.1,0,0) scale(${s})`}>
                  <TallObject id={v.it.id} uid={'s' + v.i} />
                </g>
              </g>
            </g>
          );
        })}
        {vis.map((v) => (
          <g key={'o' + v.i} opacity={v.intro} transform={`translate(${v.x},${FLOOR}) scale(${s})`}>
            <TallObject id={v.it.id} uid={'o' + v.i} />
          </g>
        ))}
        {vis.map((v) => v.hPx < 2.5 && <circle key={'d' + v.i} cx={v.x} cy={FLOOR - 1.5} r={1.5} fill={CREAM} opacity={v.intro * 0.7} />)}
        <rect y={FLOOR} width={1080} height={10} fill="#1E1822" opacity={0.0} />
        {vis.map((v) => v.labOp > 0.01 && <Label key={'l' + v.i} it={v.it} x={v.x} opacity={v.labOp} highlight={v.i === curK + 1 || (p < 0 && v.i === 0)} maxW={labelW} />)}
        {titleOp > 0.01 && (
          <g opacity={titleOp} style={textShadow}>
            <text x={540} y={330} textAnchor="middle" fontFamily="Inter" fontWeight={300} fontSize={72} fill={CREAM}>{title[0]}</text>
            <text x={540} y={418} textAnchor="middle" fontFamily="Inter" fontWeight={600} fontSize={72} fill={CREAM}>{title[1]}</text>
          </g>
        )}
        {multOp > 0.01 && b && (
          <g opacity={multOp} style={textShadow}>
            <text x={540} y={300} textAnchor="middle" fontFamily="Inter" fontWeight={300} fontSize={150} fill={CREAM} letterSpacing={-4}>{fmtRatio(b.m / a.m)}<tspan fill={ACC}>×</tspan></text>
            <text x={540} y={370} textAnchor="middle" fontFamily="Inter" fontWeight={500} fontSize={28} letterSpacing={4} fill={MUTE}>{`TALLER THAN ${a.ref.toUpperCase()}`}</text>
          </g>
        )}
        <g opacity={interpolate(f, [20, 40], [0, 1], clamp) * 0.85}>
          <text x={540} y={1838} textAnchor="middle" fontFamily="IBM Plex Mono" fontWeight={500} fontSize={22} fill={CREAM}>{barText(bar.m)}</text>
          <line x1={540 - bar.len / 2} x2={540 + bar.len / 2} y1={1858} y2={1858} stroke={CREAM} strokeWidth={2} />
          <line x1={540 - bar.len / 2} x2={540 - bar.len / 2} y1={1849} y2={1867} stroke={CREAM} strokeWidth={2} />
          <line x1={540 + bar.len / 2} x2={540 + bar.len / 2} y1={1849} y2={1867} stroke={CREAM} strokeWidth={2} />
        </g>
      </svg>
      {audio && <Audio src={staticFile(audio)} />}
    </AbsoluteFill>
  );
};

export const short03Duration = (ids?: string[]) => makeTallLayout(ids ? ids.map((id) => TALL.find((t) => t.id === id)!) : TALL).duration;
export {T03};
