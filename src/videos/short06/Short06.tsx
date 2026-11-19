import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';
import '@fontsource/inter/300.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/ibm-plex-mono/500.css';
import {fbm1, rng} from '../../engine/noise';
import {GiantDefs, Human, Argo, Croc, Diplo, Komodo, Python, Spino, TRex, Megalodon, WhaleShark, BlueWhale, Jelly} from '../../giants/Animals';
import {cumulus} from '../../look/DaySky';
import {fmtFt} from '../short03/Short03';
import {COLD, GIANTS, Giant, LABEL_Y, T, WY, GY, SB} from './data';

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
    case 'meg': return <Megalodon t={t} />;
    case 'ws': return <WhaleShark t={t} />;
    case 'whale': return <BlueWhale t={t} />;
    case 'jelly': return <Jelly t={t} />;
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
    <text x={540} y={1626} textAnchor="middle" fontFamily="IBM Plex Mono" fontWeight={500} fontSize={24} fill={CREAM}>{text}</text>
    <line x1={540 - len / 2} x2={540 + len / 2} y1={1648} y2={1648} stroke={CREAM} strokeWidth={2} />
    <line x1={540 - len / 2} x2={540 - len / 2} y1={1638} y2={1658} stroke={CREAM} strokeWidth={2} />
    <line x1={540 + len / 2} x2={540 + len / 2} y1={1638} y2={1658} stroke={CREAM} strokeWidth={2} />
  </g>
);
const niceBar = (s: number) => {
  for (const m of [0.5, 1, 2, 5, 10, 20]) if (m * s >= 130) return {m, len: m * s};
  return {m: 20, len: 20 * s};
};

// The beach: the same clear day, grass behind, a strip of sand where land animals stand, then the sea cut
// away in front so the sea animals show whole in sunlit water, down to a sandy floor.
const Coast: React.FC<{t: number; pan: number}> = ({t, pan}) => {
  const R = rng(21);
  const rays = Array.from({length: 7}, (_, i) => {
    const x = 40 + i * 165 + 40 * fbm1(t * 0.12, i), w = 40 + R() * 80, o = 0.07 + 0.06 * (0.5 + 0.5 * fbm1(t * 0.4, i + 20));
    return <path key={i} d={`M${x},${WY} L${x + w},${WY} L${x + w + 220},${SB} L${x + 170},${SB}Z`} fill="url(#c6Ray)" opacity={o * 2} />;
  });
  const motes = Array.from({length: 70}, () => {
    const x0 = R() * 1300, y = WY + 20 + R() * (SB - WY - 40), sp = 5 + R() * 10, r = 0.8 + R() * 1.6;
    const x = ((((x0 - t * sp) % 1300) + 1300) % 1300) - 110;
    return <circle key={x0} cx={x} cy={y + 5 * Math.sin(t * 0.6 + x0)} r={r} fill="#F2FBFF" opacity={0.25 + R() * 0.3} />;
  });
  let surf = `M0,${WY}`;
  for (let x = 0; x <= 1080; x += 20) surf += ` L${x},${(WY + 2.4 * Math.sin(x / 37 + t * 2.1) + 1.5 * Math.sin(x / 13 - t * 3.3)).toFixed(1)}`;
  return (
    <g>
      <defs>
        <linearGradient id="c6Sand" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#EADBB2" /><stop offset="0.6" stopColor="#D9C394" /><stop offset="1" stopColor="#B9A275" /></linearGradient>
        <linearGradient id="c6Sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#58BCCF" /><stop offset="0.35" stopColor="#2A92B4" /><stop offset="1" stopColor="#11577F" /></linearGradient>
        <linearGradient id="c6Ray" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFFFFF" stopOpacity="0.9" /><stop offset="1" stopColor="#FFFFFF" stopOpacity="0" /></linearGradient>
        <linearGradient id="c6Bed" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#C2B184" /><stop offset="1" stopColor="#7E6E50" /></linearGradient>
      </defs>
      <Meadow gy={GY} t={t} pan={pan} />
      <path d={`M0,${GY - 26} C300,${GY - 34} 700,${GY - 20} 1080,${GY - 30} L1080,${WY + 4} L0,${WY + 4}Z`} fill="url(#c6Sand)" />
      <rect y={WY - 14} width={1080} height={18} fill="#A8946A" opacity={0.45} />
      <rect y={WY} width={1080} height={SB - WY} fill="url(#c6Sea)" />
      {rays}
      {motes}
      <rect y={SB} width={1080} height={1920 - SB} fill="url(#c6Bed)" />
      <path d={`M0,${SB} ${Array.from({length: 28}, (_, i) => `Q${i * 40 + 20},${SB - 9 - 7 * Math.sin(i * 1.7)} ${i * 40 + 40},${SB}`).join(' ')} L1080,${SB + 30} L0,${SB + 30}Z`} fill="#C2B184" />
      {Array.from({length: 14}, (_, i) => <path key={i} d={`M${(i * 97) % 1080},${SB + 50 + (i % 4) * 34} q30,-6 60,0`} stroke="#6E6044" strokeOpacity={0.35} strokeWidth={2} fill="none" />)}
      <path d={surf + ` L1080,${WY - 6} L0,${WY - 6}Z`} fill="#BFEAF2" opacity={0.5} />
      <path d={surf} fill="none" stroke="#FFFFFF" strokeOpacity={0.9} strokeWidth={3} />
    </g>
  );
};
// light water over the sea animals (drawn on top of them), so they sit in the water, not on a sticker
const SeaFront: React.FC = () => (
  <g>
    <defs><linearGradient id="c6Haze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7FD3E2" stopOpacity="0.1" /><stop offset="1" stopColor="#0E4A70" stopOpacity="0.35" /></linearGradient></defs>
    <rect y={WY} width={1080} height={SB - WY} fill="url(#c6Haze)" />
  </g>
);

// One animal is highlighted at a time and sits in the centre of the frame, with the one before it on its left.
const pairScale = (i: number) => (i === 0 ? 380 / 1.75 : 640 / GIANTS[i].L);
export const makeLayout = () => {
  const N = GIANTS.length;
  const ease = Easing.inOut(Easing.cubic);
  const arrive = (k: number) => T.intro + T.move + (k - 1) * (T.hold + T.move); // frame item k is in place (k >= 1)
  const duration = arrive(N - 1) + T.hold + T.outro;
  const progress = (f: number) => {
    for (let k = 1; k < N; k++) {
      const a = arrive(k);
      if (f < a - T.move) return k - 1;
      if (f < a) return k - 1 + ease((f - (a - T.move)) / T.move);
    }
    return N - 1;
  };
  return {duration, progress, arrive, N};
};

const Main: React.FC = () => {
  const f = useCurrentFrame();
  const L = makeLayout();
  const t = (f + COLD) / T.fps;
  const p = L.progress(f), k = Math.floor(p), u = p - k;
  const sA = pairScale(k), sB = pairScale(Math.min(k + 1, L.N - 1));
  const s = u > 0 ? sA * Math.pow(sB / sA, u) : sA;
  const sway = {x: 3 * fbm1(f / 80, 1), y: 2 * fbm1(f / 95, 3)};
  // all animals stand in one row in world metres, each a small gap right of the one before; the camera keeps
  // the highlighted one centred, so the previous one sits on its left (and older ones run off screen)
  const X: number[] = [];
  GIANTS.forEach((g, i) => X.push(i === 0 ? 0 : X[i - 1] + GIANTS[i - 1].L + Math.max(0.35, 0.06 * g.L)));
  const ctr = (i: number) => X[i] + GIANTS[i].L / 2;
  const camX = u > 0 && k + 1 < L.N ? ctr(k) + (ctr(k + 1) - ctr(k)) * u : ctr(k);
  const show: {i: number; walk: number}[] = [];
  GIANTS.forEach((g, i) => {
    const x0 = 540 + (X[i] - camX) * s, x1 = x0 + g.L * s;
    if (x1 > -40 && x0 < 1120) show.push({i, walk: i === k + 1 && u > 0 ? interpolate(u, [0, 0.8, 1], [1, 0.7, 0], clamp) : 0});
  });
  const ordered = show;
  const place = (o: typeof show[0]) => {
    const g = GIANTS[o.i], x = 540 + (X[o.i] - camX) * s;
    const y = g.zone === 'land' ? GY - g.y * s : WY - g.y * s;
    return {g, x, y};
  };
  const cur = p - k < 0.5 ? k : k + 1;
  const curG = GIANTS[cur];
  const labOp = u === 0 ? 1 : Math.abs(u - 0.5) * 2;
  const multI = cur, multOp = multI >= 1 ? labOp * interpolate(f, [0, 10], [0, 1], clamp) : 0;
  const bar = niceBar(s);
  const endFade = interpolate(f, [L.duration - 12, L.duration - 1], [1, 0], clamp);
  const pan = p * 260;
  const layer = (zone: 'land' | 'sea') => ordered.filter((o) => GIANTS[o.i].zone === zone).map((o) => {
    const {g, x, y} = place(o);
    return (
      <g key={g.id}>
        {zone === 'land' && <Shadow x={x} w={g.L * s} gy={y + g.y * s} s={s} />}
        <g transform={`translate(${x},${y}) scale(${s})`}><Animal id={g.id} t={t + o.i * 0.7} walk={o.walk} /></g>
      </g>
    );
  });
  return (
    <AbsoluteFill style={{background: '#16141c', opacity: endFade}}>
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <GiantDefs />
        <g transform={`translate(${sway.x},${sway.y})`}>
          <Coast t={t} pan={pan} />
          {layer('sea')}
          <SeaFront />
          {layer('land')}
        </g>
        <rect y={0} width={1080} height={560} fill="url(#s6Top)" />
        <defs><linearGradient id="s6Top" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0c2238" stopOpacity="0.62" /><stop offset="1" stopColor="#0c2238" stopOpacity="0" /></linearGradient></defs>
        <rect y={SB - 20} width={1080} height={1940 - SB} fill="url(#s6Lab)" />
        <defs><linearGradient id="s6Lab" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1E1A10" stopOpacity="0" /><stop offset="0.3" stopColor="#1E1A10" stopOpacity="0.45" /><stop offset="1" stopColor="#1E1A10" stopOpacity="0.55" /></linearGradient></defs>
        <CenterLabel g={curG} opacity={labOp} />
        {multOp > 0.01 && <Multiplier value={curG.m / GIANTS[multI - 1].m} than={GIANTS[multI - 1].ref} opacity={multOp} />}
        <ScaleBar len={bar.len} text={`${bar.m} m`} opacity={interpolate(f, [10, 30], [0, 1], clamp)} />
      </svg>
    </AbsoluteFill>
  );
};

const CenterLabel: React.FC<{g: Giant; opacity: number}> = ({g, opacity}) => (
  <g opacity={opacity} style={shadow}>
    <text x={540} y={LABEL_Y} textAnchor="middle" fontFamily="Inter" fontWeight={500} fontSize={22} letterSpacing={3.5} fill={MUTE}>{g.kind.toUpperCase()}</text>
    <text x={540} y={LABEL_Y + 58} textAnchor="middle" fontFamily="Inter" fontWeight={600} fontSize={g.name.length > 16 ? 50 : 56} fill={CREAM}>{g.name}</text>
    <text x={540} y={LABEL_Y + 120} textAnchor="middle" fontFamily="IBM Plex Mono" fontWeight={500} fontSize={50} fill={ACC}>{fmtM(g)}<tspan fontSize={30} dx={10}>m</tspan><tspan fontSize={26} fill={MUTE} dx={18}>{g.approx ? '~' : ''}{fmtFt(g.m)}</tspan></text>
  </g>
);

// Cold open: the two longest, a dinosaur on the beach and a giant jellyfish trailing below it in the sea,
// with a person by the dinosaur's front foot, and the hook number.
const Cold: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / T.fps, s = 27;
  const pop = interpolate(f, [0, 6], [0.92, 1], clamp);
  const ax = 1060 - 35 * s - 20 * (f / COLD);
  const jx = 1060 - 36.6 * s - 10 * (f / COLD);
  return (
    <AbsoluteFill style={{background: '#16141c'}}>
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <GiantDefs />
        <Coast t={t} pan={0} />
        <g transform={`translate(${jx},${WY + 9 * s}) scale(${s})`}><Jelly t={t} /></g>
        <SeaFront />
        <Shadow x={ax} w={35 * s} gy={GY} s={s} />
        <g transform={`translate(${ax},${GY}) scale(${s})`}><Argo t={t + 2} /></g>
        <g transform={`translate(${ax + 23.4 * s},${GY + 20}) scale(${s})`}><Human t={t} /></g>
        <rect y={0} width={1080} height={560} fill="url(#s6TopC)" />
        <defs><linearGradient id="s6TopC" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0c2238" stopOpacity="0.62" /><stop offset="1" stopColor="#0c2238" stopOpacity="0" /></linearGradient></defs>
        <g style={shadow} transform={`translate(540,300) scale(${pop}) translate(-540,-300)`}>
          <text x={540} y={260} textAnchor="middle" fontFamily="Inter" fontWeight={600} fontSize={112} fill={CREAM}>1.7 <tspan fill={ACC}>→</tspan> 36.6 m</text>
          <text x={540} y={332} textAnchor="middle" fontFamily="Inter" fontWeight={500} fontSize={32} letterSpacing={5} fill={CREAM}>LONGEST ANIMALS EVER</text>
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
