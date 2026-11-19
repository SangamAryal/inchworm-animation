import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';
import '@fontsource/inter/300.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/ibm-plex-mono/500.css';
import {fbm1, rng} from '../../engine/noise';
import {GiantDefs, Human, Argo, Croc, Diplo, Komodo, Python, Spino, TRex} from '../../giants/Animals';
import {cumulus} from '../../look/DaySky';
import {fmtFt} from '../short03/Short03';
import {COLD, GIANTS, Giant, LABEL_Y, T, WY} from './data';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const CREAM = '#F6ECDF', MUTE = '#D9C4B4', ACC = '#F6B985';
const shadow = {filter: 'drop-shadow(0 2px 10px rgba(8,18,34,0.75))'};
const ease = Easing.inOut(Easing.cubic);

// Clear day on open grassland, the same light as the Short 05 day look: bright midday sky, white cumulus,
// blue hills fading into haze, a plain of grass. The sun is high on the left, so shadows are short and fall
// to the lower right of each animal.
const PAL6 = ['#2C6FC2', '#3F86D3', '#62A2E0', '#8DBDEA', '#BCD8F0', '#E4EEF2'];
const OFF6 = [0, 0.3, 0.55, 0.75, 0.92, 1];
const Meadow: React.FC<{gy: number; t: number; pan: number}> = ({gy, t, pan}) => {
  const hz = gy - 120;
  const wrap = (x: number, w: number) => ((x % w) + w) % w;
  const range = (par: number, amp: number, seed: number, base: number) => {
    let d = `M-40,${base + 4}`;
    for (let x = -40; x <= 1120; x += 14) {
      const wx = x + pan * par + seed * 977;
      const h = amp * (0.55 * Math.max(0, Math.sin(wx / 230) * Math.sin(wx / 91 + seed)) + 0.3 * Math.sin(wx / 53 + seed) ** 2 + 0.15);
      d += ` L${x},${(base - h).toFixed(1)}`;
    }
    return d + ` L1120,${base + 4}Z`;
  };
  const G = rng(31);
  const clouds = Array.from({length: 7}, (_, i) => ({x: G() * 1500, y: 640 + G() * Math.max(40, hz - 860), w: 180 + G() * 260, seed: 100 + i * 37, par: 0.04 + G() * 0.05}));
  const R = rng(14);
  const tufts = Array.from({length: 160}, () => ({x: R() * 1400, y: gy + 8 + Math.pow(R(), 1.5) * (1920 - gy), h: 6 + R() * 14, c: R()}));
  const trees = Array.from({length: 9}, () => ({x: R() * 1600, s: 0.6 + R() * 0.6}));
  return (
    <g>
      <defs>
        <linearGradient id="m6Sky" x1="0" y1="0" x2="0" y2="1">
          {PAL6.map((c, i) => <stop key={i} offset={OFF6[i]} stopColor={c} />)}
        </linearGradient>
        <radialGradient id="m6Sun" cx="0.12" cy="0.12" r="0.6"><stop offset="0" stopColor="#FFF8E6" stopOpacity="0.85" /><stop offset="1" stopColor="#FFF8E6" stopOpacity="0" /></radialGradient>
        <linearGradient id="m6Grass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9DBA6A" />
          <stop offset="0.25" stopColor="#7FA555" />
          <stop offset="1" stopColor="#4C7A3A" />
        </linearGradient>
        <linearGradient id="m6Far" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#B9C9D8" /><stop offset="1" stopColor="#CBD8DF" /></linearGradient>
        <linearGradient id="m6Mid" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8EA88A" /><stop offset="1" stopColor="#A9BC92" /></linearGradient>
        <filter id="dsCloudEdge" x="-5%" y="-10%" width="110%" height="120%"><feGaussianBlur stdDeviation="1.6" /></filter>
        <filter id="m6Soft" x="-20%" y="-200%" width="140%" height="500%"><feGaussianBlur stdDeviation="6" /></filter>
      </defs>
      <rect width={1080} height={hz + 60} fill="url(#m6Sky)" />
      <rect width={1080} height={hz} fill="url(#m6Sun)" />
      {clouds.map((c, i) => {
        const x = wrap(c.x - pan * c.par - t * 4, 1500) - 200;
        return cumulus({x, y: c.y, w: c.w, h: c.w * 0.38, seed: c.seed}, `m6c${i}`, 1, 0.95, 0.15);
      })}
      <path d={range(0.03, 70, 2, hz)} fill="url(#m6Far)" />
      <path d={range(0.07, 46, 5, hz + 30)} fill="url(#m6Mid)" />
      {trees.map((tr, i) => {
        const x = wrap(tr.x - pan * 0.1, 1600) - 200, y = hz + 30;
        return <g key={i} transform={`translate(${x},${y}) scale(${tr.s})`}><rect x={-2} y={-18} width={4} height={18} fill="#5E6E52" /><ellipse cx={0} cy={-26} rx={16} ry={13} fill="#6F8A5E" /></g>;
      })}
      <rect y={hz + 28} width={1080} height={1920 - hz} fill="url(#m6Grass)" />
      <rect y={hz + 28} width={1080} height={gy - hz - 20} fill="#C8D8B0" opacity={0.25} />
      {tufts.map((g, i) => {
        const x = wrap(g.x - pan * (0.2 + (g.y - gy) / 900), 1400) - 160, k = 0.5 + (g.y - gy) / 700;
        return <path key={i} d={`M${x},${g.y} l${-3 * k},${-g.h * k} M${x},${g.y} l${1 * k},${-g.h * 1.2 * k} M${x},${g.y} l${4 * k},${-g.h * 0.9 * k}`} stroke={g.c > 0.5 ? '#5E8A44' : '#88AE5E'} strokeWidth={1.6} opacity={0.7} />;
      })}
    </g>
  );
};

const Animal: React.FC<{id: string; t: number; walk: number}> = ({id, t, walk}) => {
  switch (id) {
    case 'human': return <g transform="translate(0.17,0)"><Human t={t} /></g>;
    case 'komodo': return <Komodo t={t} />;
    case 'croc': return <Croc t={t} walk={walk} />;
    case 'python': return <Python t={t} walk={walk} />;
    case 'rex': return <TRex t={t} walk={walk} />;
    case 'spino': return <Spino t={t} walk={walk} />;
    case 'diplo': return <Diplo t={t} />;
    case 'argo': return <Argo t={t} walk={walk} />;
    default: return null;
  }
};

// soft contact shadow on the grass, offset a little to the right (sun high on the left)
const Shadow: React.FC<{x: number; w: number; gy: number; s: number}> = ({x, w, gy, s}) => (
  <ellipse cx={x + w * 0.54} cy={gy + 4} rx={w * 0.5} ry={Math.max(4, Math.min(16, 0.35 * s))} fill="#26401E" opacity={0.32} filter="url(#m6Soft)" />
);

type Placed = {g: Giant; i: number; x: number; walk: number; opacity: number};
// screen placement: x = left end on screen, s = px per metre, wy = waterline
const Layer: React.FC<{list: Placed[]; zone: 'land' | 'sea'; s: number; wy: number; t: number}> = ({list, zone, s, wy, t}) => (
  <>
    {list.filter((p) => p.g.zone === zone).map((p) => (
      <g key={p.g.id} opacity={p.opacity} transform={`translate(${p.x},${wy - p.g.y * s}) scale(${s})`}>
        <Animal id={p.g.id} t={t + p.i * 0.7} walk={p.walk} />
      </g>
    ))}
  </>
);

const fmtM = (g: Giant) => `${g.approx ? '~' : ''}${g.m < 10 ? g.m.toFixed(1) : (Math.round(g.m * 10) / 10).toString()}`;
const fmtRatio = (r: number) => (r < 1.995 ? r.toFixed(2) : r < 10 ? r.toFixed(1) : Math.round(r).toString());

// Short 01 style label, under the animal: kind, name, length (highlighted on the newcomer)
const Label: React.FC<{g: Giant; x: number; opacity: number; highlight: boolean}> = ({g, x: x0, opacity, highlight}) => {
  const fs = g.name.length > 16 ? 38 : g.name.length > 12 ? 42 : 48;
  const half = Math.max(g.kind.length * 7.2, g.name.length * fs * 0.27, 110) + 22;
  const x = Math.min(Math.max(x0, half), 1080 - half);
  const y = LABEL_Y;
  return (
    <g opacity={opacity} style={shadow}>
      <text x={x} y={y} textAnchor="middle" fontFamily="Inter" fontWeight={500} fontSize={19} letterSpacing={3} fill={MUTE}>{g.kind.toUpperCase()}</text>
      <text x={x} y={y + 52} textAnchor="middle" fontFamily="Inter" fontWeight={600} fontSize={fs} fill={CREAM}>{g.name}</text>
      <text x={x} y={y + 100} textAnchor="middle" fontFamily="IBM Plex Mono" fontWeight={500} fontSize={38} fill={highlight ? ACC : MUTE}>{fmtM(g)}<tspan fontSize={24} dx={8}>m</tspan></text>
      <text x={x} y={y + 136} textAnchor="middle" fontFamily="IBM Plex Mono" fontWeight={500} fontSize={22} fill={MUTE}>{g.approx ? '~' : ''}{fmtFt(g.m)}</text>
    </g>
  );
};

const Multiplier: React.FC<{value: number; than: string; opacity: number}> = ({value, than, opacity}) => (
  <g opacity={opacity} style={shadow}>
    <text x={540} y={360} textAnchor="middle" fontFamily="Inter" fontWeight={300} fontSize={150} fill={CREAM} letterSpacing={-4}>{fmtRatio(value)}<tspan fill={ACC}>×</tspan></text>
    <text x={540} y={430} textAnchor="middle" fontFamily="Inter" fontWeight={500} fontSize={28} letterSpacing={4} fill={MUTE}>{`LONGER THAN ${than.toUpperCase()}`}</text>
  </g>
);

const ScaleBar: React.FC<{len: number; text: string; opacity: number}> = ({len, text, opacity}) => (
  <g opacity={opacity * 0.85}>
    <text x={540} y={1798} textAnchor="middle" fontFamily="IBM Plex Mono" fontWeight={500} fontSize={24} fill={CREAM}>{text}</text>
    <line x1={540 - len / 2} x2={540 + len / 2} y1={1820} y2={1820} stroke={CREAM} strokeWidth={2} />
    <line x1={540 - len / 2} x2={540 - len / 2} y1={1810} y2={1830} stroke={CREAM} strokeWidth={2} />
    <line x1={540 + len / 2} x2={540 + len / 2} y1={1810} y2={1830} stroke={CREAM} strokeWidth={2} />
  </g>
);
const niceBar = (s: number) => {
  for (const m of [0.5, 1, 2, 5, 10, 20]) if (m * s >= 130) return {m, len: m * s};
  return {m: 20, len: 20 * s};
};

// Same layout as Short 01 / 03: pair k = animals k (left) and k+1 (right), each pair scaled so the newcomer is
// about maxL px long while both fit side by side; the camera slides and zooms (log scale) between pairs.
export const makeLayout = (items: Giant[] = GIANTS, o = {maxL: 900, introH: 560, fit: 1040, gap: 50, floor: 0}) => {
  const N = items.length, NP = N - 1;
  const pairS = (k: number) => {
    if (k < 0) return o.introH / 1.75;
    const a = items[k], b = items[k + 1];
    const byL = o.maxL / b.L, byW = (o.fit - o.gap) / (a.L + b.L);
    return Math.min(byL, Math.max(byW, byL * o.floor));
  };
  const xs: {l: number; r: number}[] = [];
  const centers = [0];
  for (let k = 0; k < NP; k++) {
    const s = pairS(k), a = items[k], b = items[k + 1];
    const sep = (a.L / 2) * s + o.gap + (b.L / 2) * s;
    const span = a.L * s + o.gap + b.L * s;
    // if the pair is wider than the screen, keep the newcomer whole and let the old one run off the left
    const l = span <= 1040 ? 540 - span / 2 + (a.L / 2) * s : 1080 - 40 - b.L * s - o.gap - (a.L / 2) * s;
    xs.push({l, r: l + sep});
    centers.push(centers[k] + sep / s);
  }
  const ease = Easing.inOut(Easing.cubic);
  const pairStart = (k: number) => T.intro + T.move + k * (T.hold + T.move);
  const duration = pairStart(NP - 1) + T.hold + T.outro;
  const progress = (f: number) => {
    if (f < T.intro) return -1;
    if (f < T.intro + T.move) return -1 + ease((f - T.intro) / T.move);
    for (let k = 0; k < NP - 1; k++) {
      const st = pairStart(k) + T.hold;
      if (f < st) return k;
      if (f < st + T.move) return k + ease((f - st) / T.move);
    }
    return NP - 1;
  };
  const lerpLog = (a: number, b: number, e: number) => Math.exp(Math.log(a) * (1 - e) + Math.log(b) * e);
  const camera = (p: number) => {
    if (p < 0) {
      const e = p + 1, s = lerpLog(pairS(-1), pairS(0), e);
      const ax = 540 * (1 - e) + xs[0].l * e;
      return {s, cx: centers[0] - (ax - 540) / s};
    }
    const k = Math.min(Math.floor(p), NP - 1), e = p - k;
    if (k >= NP - 1) return {s: pairS(NP - 1), cx: centers[NP] - (xs[NP - 1].r - 540) / pairS(NP - 1)};
    const s = lerpLog(pairS(k), pairS(k + 1), e);
    const ax = xs[k].r * (1 - e) + xs[k + 1].l * e;
    return {s, cx: centers[k + 1] - (ax - 540) / s};
  };
  return {centers, progress, camera, duration, NP};
};

const Main: React.FC = () => {
  const f = useCurrentFrame();
  const L = makeLayout();
  const t = (f + COLD) / T.fps;
  const p = L.progress(f);
  const {s, cx} = L.camera(p);
  const sway = {x: 4 * fbm1(f / 80, 1), y: 3 * fbm1(f / 95, 3)};
  const placed: Placed[] = [];
  const vis: {g: Giant; i: number; mid: number; labOp: number}[] = [];
  GIANTS.forEach((g, i) => {
    const mid = 540 + (L.centers[i] - cx) * s;
    const x = mid - (g.L / 2) * s;
    if (x + g.L * s < -60 || x > 1140) return;
    placed.push({g, i, x, walk: 0, opacity: 1});
    const labOp = interpolate(p - i, [0.15, 0.55], [1, 0], clamp) * interpolate(i - p, [1.45, 1.85], [1, 0], clamp);
    vis.push({g, i, mid, labOp});
  });
  const kF = Math.max(0, Math.min(Math.floor(p), L.NP - 1));
  const inTrans = p >= 0 && p !== Math.floor(p);
  const e = p - Math.floor(p);
  const curK = p < 0 ? 0 : inTrans ? (e < 0.5 ? kF : kF + 1) : kF;
  const multOp = interpolate(p, [-0.4, 0], [0, 1], clamp) * (inTrans ? Math.abs(e - 0.5) * 2 : 1);
  const bar = niceBar(s);
  const endFade = interpolate(f, [L.duration - 12, L.duration - 1], [1, 0], clamp);
  const wy = WY + sway.y;
  const a = GIANTS[curK], b = GIANTS[curK + 1];
  return (
    <AbsoluteFill style={{background: '#16141c', opacity: endFade}}>
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <GiantDefs />
        <g transform={`translate(${sway.x},0)`}>
          <Meadow gy={wy} t={t} pan={cx * 0.6 + Math.log(s) * 400} />
          {placed.map((pl) => <Shadow key={'sh' + pl.g.id} x={pl.x} w={pl.g.L * s} gy={wy} s={s} />)}
          <Layer list={placed} zone="land" s={s} wy={wy} t={t} />
        </g>
        <rect y={0} width={1080} height={560} fill="url(#s6Top)" />
        <defs><linearGradient id="s6Top" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0c2238" stopOpacity="0.62" /><stop offset="1" stopColor="#0c2238" stopOpacity="0" /></linearGradient></defs>
        <rect y={LABEL_Y - 60} width={1080} height={240} fill="url(#s6Lab)" />
        <defs><linearGradient id="s6Lab" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#13240E" stopOpacity="0" /><stop offset="0.4" stopColor="#13240E" stopOpacity="0.42" /><stop offset="1" stopColor="#13240E" stopOpacity="0" /></linearGradient></defs>
        {vis.map((v) => v.labOp > 0.01 && <Label key={v.g.id} g={v.g} x={v.mid + sway.x} opacity={v.labOp} highlight={v.i === curK + 1 || (p < 0 && v.i === 0)} />)}
        {multOp > 0.01 && b && <Multiplier value={b.m / a.m} than={a.ref} opacity={multOp} />}
        <ScaleBar len={bar.len} text={`${bar.m} m`} opacity={interpolate(f, [10, 30], [0, 1], clamp)} />
      </svg>
    </AbsoluteFill>
  );
};

// Cold open: the biggest dinosaur, with a person standing by its front foot, and the hook number.
const Cold: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / T.fps, s = 27;
  const gy = 1300;
  const pop = interpolate(f, [0, 6], [0.92, 1], clamp);
  const ax = 1060 - 35 * s - 20 * (f / COLD);
  return (
    <AbsoluteFill style={{background: '#16141c'}}>
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <GiantDefs />
        <Meadow gy={gy} t={t} pan={f * 1.5} />
        <Shadow x={ax} w={35 * s} gy={gy} s={s} />
        <g transform={`translate(${ax},${gy}) scale(${s})`}><Argo t={t + 2} /></g>
        <g transform={`translate(${ax + 23.4 * s},${gy}) scale(${s})`}><Human t={t} /></g>
        <rect y={0} width={1080} height={620} fill="url(#s6TopC)" />
        <defs><linearGradient id="s6TopC" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0c2238" stopOpacity="0.62" /><stop offset="1" stopColor="#0c2238" stopOpacity="0" /></linearGradient></defs>
        <g style={shadow} transform={`translate(540,360) scale(${pop}) translate(-540,-360)`}>
          <text x={540} y={300} textAnchor="middle" fontFamily="Inter" fontWeight={600} fontSize={112} fill={CREAM}>1.7 <tspan fill={ACC}>→</tspan> 35 m</text>
          <text x={540} y={372} textAnchor="middle" fontFamily="Inter" fontWeight={500} fontSize={32} letterSpacing={5} fill={CREAM}>LONGEST LAND ANIMALS EVER</text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

export const Short06: React.FC<{audio?: string; only?: 'cold' | 'main'}> = ({audio, only}) => (
  <AbsoluteFill style={{background: '#16141c', filter: 'contrast(1.04)'}}>
    {only !== 'main' && <Sequence durationInFrames={COLD}><Cold /></Sequence>}
    {only !== 'cold' && <Sequence from={only === 'main' ? 0 : COLD}><Main /></Sequence>}
    {audio && <Audio src={staticFile(audio)} />}
  </AbsoluteFill>
);

export const short06Duration = () => COLD + makeLayout().duration;
