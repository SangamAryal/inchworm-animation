import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';
import '@fontsource/inter/300.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/ibm-plex-mono/500.css';
import {fbm1, rng} from '../../engine/noise';
import {GiantDefs, Argo, BlueWhale, Croc, Jelly, Megalodon, Python, Spino, TRex, WhaleShark} from '../../giants/Animals';
import {TallDefs, TallObject} from '../short03/objects';
import {fmtFt} from '../short03/Short03';
import {COLD, GIANTS, Giant, SPAN, T, WY, X0, pxPerM} from './data';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const CREAM = '#F6ECDF', MUTE = '#D9C4B4', ACC = '#F6B985';
const shadow = {filter: 'drop-shadow(0 2px 8px rgba(14,10,18,0.6))'};
const ease = Easing.inOut(Easing.cubic);
const easeOut = Easing.out(Easing.cubic);

const ridge = (seed: number, y: number, amp: number, x0: number, x1: number) => {
  const R = rng(seed);
  let d = `M${x0},${y + 40} L${x0},${y}`;
  let a = 0;
  for (let x = x0; x <= x1; x += 18) { a += (R() - 0.5) * amp * 0.6; a *= 0.8; d += ` L${x},${(y - Math.max(0, a + Math.sin((x - x0) / 90 + seed) * amp)).toFixed(1)}`; }
  return d + ` L${x1},${y + 40}Z`;
};

// Dusk over the sea, cut at the waterline: the top half is a low warm sun over open water, the bottom half
// is an under-water cut-away lit from above, down to a sandy floor.
export const SEABED = 680; // px below the waterline
const Shore: React.FC<{wy: number; t: number; bed?: number}> = ({wy, t, bed = SEABED}) => {
  const hz = wy - 140, sb = wy + bed;
  const R = rng(8);
  const stars = Array.from({length: 40}, () => ({x: R() * 1080, y: R() * (hz - 260), r: 0.7 + R() * 1.4, o: 0.2 + R() * 0.45}));
  const glitter = Array.from({length: 70}, (_, i) => {
    const yy = hz + 6 + Math.pow(R(), 1.6) * (wy - hz - 14), spread = 30 + (yy - hz) * 1.6;
    const x = 210 + (R() - 0.5) * spread * 2, w = 6 + R() * 26 * ((yy - hz) / (wy - hz) + 0.3);
    const o = 0.25 + 0.55 * Math.max(0, Math.sin(t * (2 + R() * 3) + i));
    return <line key={i} x1={x - w / 2} x2={x + w / 2} y1={yy} y2={yy} stroke="#FFE1B8" strokeWidth={1.6} strokeOpacity={o * 0.8} />;
  });
  const rays = Array.from({length: 7}, (_, i) => {
    const x = 60 + i * 160 + 40 * fbm1(t * 0.15, i), w = 40 + R() * 70, o = 0.05 + 0.05 * (0.5 + 0.5 * fbm1(t * 0.4, i + 20));
    return <path key={i} d={`M${x},${wy} L${x + w},${wy} L${x + w + 260},${sb} L${x + 200},${sb}Z`} fill="url(#s6Ray)" opacity={o * 2.2} />;
  });
  const snow = Array.from({length: 90}, () => {
    const x0 = R() * 1300, y = wy + 20 + R() * (bed - 30), sp = 6 + R() * 14, r = 0.8 + R() * 1.8;
    const x = ((((x0 - t * sp) % 1300) + 1300) % 1300) - 110;
    return <circle key={x0} cx={x} cy={y + 6 * Math.sin(t * 0.6 + x0)} r={r} fill="#D8EEF0" opacity={0.18 + R() * 0.25} />;
  });
  return (
    <g>
      <defs>
        <linearGradient id="s6Sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#38344C" />
          <stop offset="0.45" stopColor="#5E4F6A" />
          <stop offset="0.8" stopColor="#B07E80" />
          <stop offset="1" stopColor="#E7B08E" />
        </linearGradient>
        <radialGradient id="s6Sun" cx="0.19" cy="1" r="0.75">
          <stop offset="0" stopColor="#FFD9AE" stopOpacity="0.75" />
          <stop offset="1" stopColor="#FFD9AE" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="s6Surf" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#C99486" />
          <stop offset="0.35" stopColor="#7E6274" />
          <stop offset="1" stopColor="#3E3A54" />
        </linearGradient>
        <linearGradient id="s6Deep" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3D6872" />
          <stop offset="0.3" stopColor="#24465A" />
          <stop offset="1" stopColor="#0E1C2A" />
        </linearGradient>
        <linearGradient id="s6Ray" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F4E4C4" stopOpacity="0.9" />
          <stop offset="1" stopColor="#F4E4C4" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="s6Bed" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3B4246" />
          <stop offset="1" stopColor="#15181E" />
        </linearGradient>
      </defs>
      <rect width={1080} height={hz + 2} fill="url(#s6Sky)" />
      <rect width={1080} height={hz + 2} fill="url(#s6Sun)" />
      {stars.map((s, i) => <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#FFF3E6" opacity={s.o * 0.7} />)}
      <circle cx={205} cy={hz - 34} r={40} fill="#FFE6C2" opacity={0.95} />
      <path d={ridge(3, hz, 26, 560, 1100)} fill="#7A5A6E" />
      <path d={ridge(9, hz, 14, -20, 120)} fill="#6A5064" />
      <rect y={hz} width={1080} height={wy - hz} fill="url(#s6Surf)" />
      {glitter}
      <rect y={wy} width={1080} height={bed} fill="url(#s6Deep)" />
      {rays}
      {snow}
      <rect y={sb} width={1080} height={1920 - sb + 400} fill="url(#s6Bed)" />
      <path d={`M0,${sb} ${Array.from({length: 28}, (_, i) => `Q${i * 40 + 20},${sb - 10 - 8 * Math.sin(i * 1.7)} ${i * 40 + 40},${sb}`).join(' ')} L1080,${sb + 30} L0,${sb + 30}Z`} fill="#3B4246" />
      {Array.from({length: 12}, (_, i) => <path key={i} d={`M${(i * 97) % 1080},${sb + 40 + (i % 4) * 26} q30,-6 60,0`} stroke="#5A6266" strokeOpacity={0.35} strokeWidth={2} fill="none" />)}
    </g>
  );
};

// drawn over the animals: water colour and depth haze, a bright band under the surface, then the surface line
const WaterFront: React.FC<{wy: number; t: number; bed?: number}> = ({wy, t, bed = SEABED}) => {
  const sb = wy + bed;
  let d = `M0,${wy}`;
  for (let x = 0; x <= 1080; x += 20) d += ` L${x},${(wy + 2.2 * Math.sin(x / 37 + t * 2.1) + 1.6 * Math.sin(x / 13 - t * 3.3)).toFixed(1)}`;
  return (
    <g>
      <defs>
        <linearGradient id="s6Haze" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3C7484" stopOpacity="0.22" />
          <stop offset="0.5" stopColor="#1C3A4C" stopOpacity="0.38" />
          <stop offset="1" stopColor="#0B1622" stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id="s6Under" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#D6F0EE" stopOpacity="0.35" />
          <stop offset="1" stopColor="#D6F0EE" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect y={wy} width={1080} height={bed} fill="url(#s6Haze)" />
      <rect y={wy} width={1080} height={26} fill="url(#s6Under)" />
      <path d={d} fill="none" stroke="#FFE4C4" strokeOpacity={0.75} strokeWidth={2.5} />
      <rect y={sb} width={1080} height={30} fill="#0B1622" opacity={0.25} />
    </g>
  );
};

const Animal: React.FC<{id: string; t: number; walk: number}> = ({id, t, walk}) => {
  switch (id) {
    case 'human': return <g transform="translate(0.3,0)"><TallObject id="person" uid="h" /></g>;
    case 'croc': return <Croc t={t} walk={walk} />;
    case 'python': return <Python t={t} walk={walk} />;
    case 'rex': return <TRex t={t} walk={walk} />;
    case 'spino': return <Spino t={t} walk={walk} />;
    case 'meg': return <Megalodon t={t} />;
    case 'ws': return <WhaleShark t={t} />;
    case 'whale': return <BlueWhale t={t} />;
    case 'argo': return <Argo t={t} walk={walk} />;
    case 'jelly': return <Jelly t={t} />;
    default: return null;
  }
};

type Placed = {g: Giant; i: number; x: number; walk: number; opacity: number};
// screen placement: x = left end on screen, s = px per metre, wy = waterline
const Layer: React.FC<{list: Placed[]; zone: 'land' | 'sea'; s: number; wy: number; t: number}> = ({list, zone, s, wy, t}) => (
  <>
    {list.filter((p) => p.g.zone === zone).sort((a, b) => b.i - a.i).map((p) => (
      <g key={p.g.id} opacity={p.opacity} transform={`translate(${p.x},${wy - p.g.y * s}) scale(${s})`}>
        <Animal id={p.g.id} t={t + p.i * 0.7} walk={p.walk} />
      </g>
    ))}
  </>
);

const fmtM = (g: Giant) => `${g.approx ? '~' : ''}${g.m < 10 ? g.m.toFixed(1) : (Math.round(g.m * 10) / 10).toString()}`;

const Label: React.FC<{g: Giant; opacity: number}> = ({g, opacity}) => {
  const fs = Math.min(66, 900 / (0.55 * g.name.length));
  return (
    <g opacity={opacity} style={shadow}>
      <text x={540} y={232} textAnchor="middle" fontFamily="Inter" fontWeight={500} fontSize={24} letterSpacing={3.5} fill={MUTE}>{g.kind.toUpperCase()}</text>
      <text x={540} y={306} textAnchor="middle" fontFamily="Inter" fontWeight={600} fontSize={fs} fill={CREAM}>{g.name}</text>
      <text x={540} y={420} textAnchor="middle" fontFamily="IBM Plex Mono" fontWeight={500} fontSize={104} fill={ACC}>{fmtM(g)}<tspan fontSize={50} dx={12}>m</tspan></text>
      <text x={540} y={474} textAnchor="middle" fontFamily="IBM Plex Mono" fontWeight={500} fontSize={30} fill={MUTE}>{g.approx ? '~' : ''}{fmtFt(g.m)}</text>
    </g>
  );
};

const RULER_Y = 1800;
const Ruler: React.FC<{s: number; len: number; opacity: number; tipTop: number}> = ({s, len, opacity, tipTop}) => {
  const step = [0.5, 1, 2, 5, 10].find((m) => m * s >= 105) ?? 10;
  const minor = step / 5;
  const ticks: React.ReactNode[] = [];
  for (let m = 0; X0 + m * s <= 1060; m += minor) {
    const major = Math.abs(m / step - Math.round(m / step)) < 1e-6, x = X0 + m * s;
    ticks.push(<line key={'t' + m} x1={x} x2={x} y1={RULER_Y} y2={RULER_Y - (major ? 18 : 8)} stroke={CREAM} strokeOpacity={major ? 0.75 : 0.4} strokeWidth={2} />);
    if (major) ticks.push(<text key={'n' + m} x={x} y={RULER_Y + 38} textAnchor="middle" fontFamily="IBM Plex Mono" fontWeight={500} fontSize={22} fill={CREAM} opacity={0.7}>{m === 0 ? '0 m' : +m.toFixed(1)}</text>);
  }
  const tx = X0 + len * s;
  return (
    <g opacity={opacity}>
      <line x1={X0} x2={1060} y1={RULER_Y} y2={RULER_Y} stroke={CREAM} strokeOpacity={0.45} strokeWidth={2} />
      {ticks}
      <line x1={X0} x2={tx} y1={RULER_Y} y2={RULER_Y} stroke={ACC} strokeWidth={6} strokeLinecap="round" />
      <line x1={tx} x2={tx} y1={RULER_Y + 4} y2={tipTop} stroke={ACC} strokeOpacity={0.55} strokeWidth={2} strokeDasharray="10 10" />
      <line x1={X0} x2={X0} y1={RULER_Y + 4} y2={tipTop} stroke={CREAM} strokeOpacity={0.25} strokeWidth={2} strokeDasharray="10 10" />
      <path d={`M${tx - 11},${RULER_Y - 26} L${tx + 11},${RULER_Y - 26} L${tx},${RULER_Y - 10}Z`} fill={ACC} />
    </g>
  );
};

export const makeTimeline = (n = GIANTS.length) => {
  const arrive = (i: number) => i * T.slot; // frame the animal is fully in place
  const duration = arrive(n - 1) + T.lastHold;
  const phase = (f: number) => {
    for (let i = 1; i < n; i++) {
      const a = arrive(i);
      if (f < a - T.trans) return i - 1;
      if (f < a) return i - 1 + (f - (a - T.trans)) / T.trans;
    }
    return n - 1;
  };
  return {arrive, duration, phase};
};

const Main: React.FC = () => {
  const f = useCurrentFrame();
  const TL = makeTimeline();
  const t = (f + COLD) / T.fps;
  const p = TL.phase(f), k = Math.floor(p), u = p - k;
  const e = ease(u);
  const sA = pxPerM(GIANTS[k], k), sB = pxPerM(GIANTS[Math.min(k + 1, GIANTS.length - 1)], k + 1);
  const s = u > 0 ? sA * Math.pow(sB / sA, e) : sA;
  const sway = {x: 5 * fbm1(f / 80, 1), y: 4 * fbm1(f / 95, 3)};
  const placed: Placed[] = [];
  GIANTS.forEach((g, i) => {
    if (i > k + 1 || (i === k + 1 && u === 0)) return;
    let x = X0, walk = 0;
    if (i === k + 1) {
      const v = easeOut(u);
      x = X0 - (g.L * s + 180) * (1 - v);
      walk = interpolate(u, [0, 0.75, 1], [1, 0.8, 0], clamp);
    }
    if (i === k && u === 0 && f >= TL.arrive(i) && f < TL.arrive(i) + 20) walk = interpolate(f - TL.arrive(i), [0, 20], [0.4, 0], clamp);
    placed.push({g, i, x, walk, opacity: 1});
  });
  const cur = Math.round(p);
  const labelOp = (i: number) => {
    const a = TL.arrive(i);
    const fin = i === 0 ? 1 : interpolate(f, [a - 16, a], [0, 1], clamp);
    const fout = i === GIANTS.length - 1 ? 1 : interpolate(f, [TL.arrive(i + 1) - T.trans, TL.arrive(i + 1) - T.trans + 12], [1, 0], clamp);
    return fin * fout;
  };
  const lenNow = u > 0 ? GIANTS[k].m + (GIANTS[k + 1].m - GIANTS[k].m) * e : GIANTS[k].m;
  const endFade = interpolate(f, [TL.duration - 12, TL.duration - 1], [1, 0], clamp);
  const wy = WY + sway.y;
  return (
    <AbsoluteFill style={{background: '#16141c', opacity: endFade}}>
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <GiantDefs />
        <TallDefs />
        <g transform={`translate(${sway.x},0)`}>
          <Shore wy={wy} t={t} />
          <Layer list={placed} zone="sea" s={s} wy={wy} t={t} />
          <Layer list={placed} zone="land" s={s} wy={wy} t={t} />
          <WaterFront wy={wy} t={t} />
        </g>
        <rect y={0} width={1080} height={560} fill="url(#s6Top)" />
        <defs><linearGradient id="s6Top" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1c1626" stopOpacity="0.45" /><stop offset="1" stopColor="#1c1626" stopOpacity="0" /></linearGradient></defs>
        <Ruler s={s} len={lenNow} opacity={1} tipTop={600} />
        {GIANTS.map((g, i) => {
          const o = labelOp(i);
          return o > 0.01 && Math.abs(i - cur) <= 1 ? <Label key={g.id} g={g} opacity={o} /> : null;
        })}
      </svg>
    </AbsoluteFill>
  );
};

// Cold open: tight on a blue whale's head while a jellyfish's tentacles drift past it and keep going.
const Cold: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / T.fps, s = 52;
  const wy = 600;
  const pop = interpolate(f, [0, 6], [0.92, 1], clamp);
  const whaleX = 830 - 29.9 * s + 14 * (f / COLD);
  const jx = 990 - 36.6 * s + 26 * (f / COLD);
  return (
    <AbsoluteFill style={{background: '#16141c'}}>
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <GiantDefs />
        <Shore wy={wy} t={t} bed={1400} />
        <g transform={`translate(${jx},${1010}) scale(${s})`}><Jelly t={t + 3} strands={40} /></g>
        <g transform={`translate(${whaleX},${1300}) scale(${s})`}><BlueWhale t={t} /></g>
        <WaterFront wy={wy} t={t} bed={1400} />
        <rect y={0} width={1080} height={560} fill="url(#s6TopC)" />
        <defs><linearGradient id="s6TopC" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1c1626" stopOpacity="0.5" /><stop offset="1" stopColor="#1c1626" stopOpacity="0" /></linearGradient></defs>
        <g style={shadow} transform={`translate(540,330) scale(${pop}) translate(-540,-330)`}>
          <text x={540} y={300} textAnchor="middle" fontFamily="Inter" fontWeight={300} fontSize={84} fill={CREAM}>Longer than</text>
          <text x={540} y={400} textAnchor="middle" fontFamily="Inter" fontWeight={600} fontSize={92} fill={CREAM}>a blue whale<tspan fill={ACC}>?</tspan></text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

export const Short06: React.FC<{audio?: string; only?: 'cold' | 'main'}> = ({audio, only}) => (
  <AbsoluteFill style={{background: '#16141c', filter: 'contrast(1.06) saturate(1.1)'}}>
    {only !== 'main' && <Sequence durationInFrames={COLD}><Cold /></Sequence>}
    {only !== 'cold' && <Sequence from={only === 'main' ? 0 : COLD}><Main /></Sequence>}
    {audio && <Audio src={staticFile(audio)} />}
  </AbsoluteFill>
);

export const short06Duration = () => COLD + makeTimeline().duration;
export {SPAN};
