import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';
import '@fontsource/inter/300.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/ibm-plex-mono/500.css';
import {fbm1, rng} from '../../engine/noise';
import {GiantDefs, Human, Argo, BlueWhale, Croc, Jelly, Megalodon, Python, Spino, TRex, WhaleShark} from '../../giants/Animals';
import {fmtFt} from '../short03/Short03';
import {COLD, GIANTS, Giant, LABEL_Y, T, WY} from './data';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const CREAM = '#F6ECDF', MUTE = '#D9C4B4', ACC = '#F6B985';
const shadow = {filter: 'drop-shadow(0 2px 8px rgba(14,10,18,0.6))'};
const ease = Easing.inOut(Easing.cubic);

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
    case 'human': return <g transform="translate(0.17,0)"><Human t={t} /></g>;
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
          <Shore wy={wy} t={t} bed={560} />
          <Layer list={placed} zone="sea" s={s} wy={wy} t={t} />
          <Layer list={placed} zone="land" s={s} wy={wy} t={t} />
          <WaterFront wy={wy} t={t} bed={560} />
        </g>
        <rect y={0} width={1080} height={560} fill="url(#s6Top)" />
        <defs><linearGradient id="s6Top" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1c1626" stopOpacity="0.45" /><stop offset="1" stopColor="#1c1626" stopOpacity="0" /></linearGradient></defs>
        <rect y={LABEL_Y - 60} width={1080} height={240} fill="url(#s6Lab)" />
        <defs><linearGradient id="s6Lab" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0B1622" stopOpacity="0" /><stop offset="0.4" stopColor="#0B1622" stopOpacity="0.35" /><stop offset="1" stopColor="#0B1622" stopOpacity="0" /></linearGradient></defs>
        {vis.map((v) => v.labOp > 0.01 && <Label key={v.g.id} g={v.g} x={v.mid + sway.x} opacity={v.labOp} highlight={v.i === curK + 1 || (p < 0 && v.i === 0)} />)}
        {multOp > 0.01 && b && <Multiplier value={b.m / a.m} than={a.ref} opacity={multOp} />}
        <ScaleBar len={bar.len} text={`${bar.m} m`} opacity={interpolate(f, [10, 30], [0, 1], clamp)} />
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

export const short06Duration = () => COLD + makeLayout().duration;
