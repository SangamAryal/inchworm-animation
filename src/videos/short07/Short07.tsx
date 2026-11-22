import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';
import '@fontsource/inter/300.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/ibm-plex-mono/500.css';
import {fbm1, rng} from '../../engine/noise';
import {cumulus, mixc} from '../../look/DaySky';
import {BeakedWhale, DeepDefs, DestroyerEscort, ElephantSeal, EverestUpsideDown, Freediver, Mud, Penguin, ScubaDiver, Snailfish, SpermWhale, Submersible, SurfaceSwimmer, TechDiver, Titanic, Turtle} from '../../deep/Deep';
import {COLD, CUR_Y, DIVES, Dive, EVEREST, LABEL_Y, SURF, T} from './data';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const CREAM = '#F6ECDF', MUTE = '#D9C4B4', ACC = '#F6B985';
const shadow = {filter: 'drop-shadow(0 2px 10px rgba(4,10,24,0.8))'};
const ease = Easing.inOut(Easing.cubic);
const group = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
const fmtD = (d: Dive) => `${d.approx ? '~' : ''}${group(d.d)}`;
const fmtRatio = (r: number) => (r < 1.995 ? r.toFixed(2) : r < 10 ? r.toFixed(1) : group(r));

// Water colour by depth: sunlit turquoise at the top, deep blue by 200 m (end of the sunlight zone),
// nearly black past 1,000 m (the midnight zone).
const WATER: [number, string][] = [[0, '#5CC6D8'], [15, '#3FAACB'], [60, '#2384B5'], [200, '#145A92'], [500, '#0C3666'], [1000, '#08203E'], [2500, '#05122A'], [5000, '#030B1C'], [11000, '#020712']];
const waterAt = (d: number) => {
  const x = Math.log10(Math.max(0, d) + 10);
  for (let i = 1; i < WATER.length; i++) {
    const a = Math.log10(WATER[i - 1][0] + 10), b = Math.log10(WATER[i][0] + 10);
    if (x <= b) return mixc(WATER[i - 1][1], WATER[i][1], (x - a) / (b - a));
  }
  return WATER[WATER.length - 1][1];
};
// how dark a subject is at its depth (0 = full light, 1 = darkest), used for its tint and its light pool
const darkAt = (d: number) => Math.max(0, Math.min(1, (Math.log10(d + 1) - 1.4) / 2.4));

const Subject: React.FC<{id: string; t: number}> = ({id, t}) => {
  switch (id) {
    case 'you': return <SurfaceSwimmer t={t} />;
    case 'scuba': return <ScubaDiver t={t} />;
    case 'nitsch': return <Freediver t={t} />;
    case 'gabr': return <TechDiver t={t} />;
    case 'penguin': return <Penguin t={t} />;
    case 'turtle': return <Turtle t={t} />;
    case 'sperm': return <SpermWhale t={t} />;
    case 'seal': return <ElephantSeal t={t} />;
    case 'beaked': return <BeakedWhale t={t} />;
    case 'titanic': return <Titanic t={t} />;
    case 'sammy': return <DestroyerEscort t={t} />;
    case 'snail': return <Snailfish t={t} />;
    case 'deep': return <Submersible t={t} />;
    default: return null;
  }
};
// wrecks and the submersible rest on the bottom, so their drawing origin is their keel line
const ON_FLOOR = new Set(['titanic', 'sammy', 'deep']);

export const makeLayout = () => {
  const N = DIVES.length;
  const arrive = (k: number) => T.intro + T.move + (k - 1) * (T.hold + T.move);
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

// camera: the surface sits at surfY, the highlighted depth at CUR_Y, so px per metre = (CUR_Y - surfY) / depth
const viewAt = (p: number) => {
  const k = Math.floor(p), u = p - k;
  const D = (i: number) => Math.max(DIVES[Math.min(i, DIVES.length - 1)].d, 12);
  const Dv = u > 0 ? D(k) * Math.pow(D(k + 1) / D(k), u) : D(k);
  const surf = interpolate(p, [0, 1], [880, SURF], clamp);
  return {surf, s: (CUR_Y - surf) / Dv};
};

// ---------------------------------------------------------------- the sea, sky to trench
const Sea: React.FC<{surf: number; s: number; t: number; descent: number; trench: number}> = ({surf, s, t, descent, trench}) => {
  const n = 28;
  const stops = Array.from({length: n + 1}, (_, i) => {
    const v = i / n, y = surf + v * (1920 - surf);
    return <stop key={i} offset={v} stopColor={waterAt((y - surf) / s)} />;
  });
  const rayLen = Math.min(1500, 220 * s);
  const rayOp = interpolate(rayLen, [30, 300], [0, 1], clamp);
  const R = rng(5);
  const rays = Array.from({length: 8}, (_, i) => {
    const x = 30 + i * 140 + 40 * fbm1(t * 0.1, i), w = 30 + R() * 70, o = (0.06 + 0.05 * (0.5 + 0.5 * fbm1(t * 0.35, i + 20))) * rayOp;
    return <path key={i} d={`M${x},${surf} L${x + w},${surf} L${x + w + 0.25 * rayLen},${surf + rayLen} L${x + 0.18 * rayLen},${surf + rayLen}Z`} fill="url(#s7Ray)" opacity={o * 2} />;
  });
  // marine snow: specks that drift up past the camera as it goes down
  const M = rng(17);
  const snow = Array.from({length: 120}, (_, i) => {
    const x0 = M() * 1080, y0 = M() * 2000, sp = 6 + M() * 12, par = 0.5 + M();
    const y = ((((y0 - t * sp - descent * 520 * par) % 1500) + 1500) % 1500) + surf - 20;
    if (y < surf + 4) return null;
    const dep = (y - surf) / s;
    const o = (0.15 + 0.35 * M()) * interpolate(dep, [10, 300], [0.35, 1], clamp);
    return <circle key={i} cx={x0 + 6 * Math.sin(t * 0.5 + i)} cy={y} r={0.7 + M() * 1.5} fill="#E8F6FF" opacity={o} />;
  });
  // bioluminescent sparks in the dark water
  const B = rng(29);
  const sparks = Array.from({length: 40}, (_, i) => {
    const x = B() * 1080, y0 = B() * 1600, ph = B() * 6.28;
    const y = ((((y0 - descent * 300) % 1400) + 1400) % 1400) + surf + 40;
    const dep = (y - surf) / s;
    const o = interpolate(dep, [500, 1200], [0, 1], clamp) * Math.max(0, Math.sin(t * 1.3 + ph)) ** 3;
    if (o < 0.02) return null;
    return <circle key={i} cx={x} cy={y} r={2.4} fill="#7FE6FF" opacity={o * 0.8} filter="url(#s7Glow)" />;
  });
  // the sky above the sea
  const G = rng(31);
  const clouds = Array.from({length: 5}, (_, i) => ({x: G() * 1300 - 100, y: surf - 120 - G() * Math.max(30, surf - 420), w: 160 + G() * 220, seed: 200 + i * 31}));
  let wave = `M0,${surf}`;
  for (let x = 0; x <= 1080; x += 18) wave += ` L${x},${(surf + 3 * Math.sin(x / 41 + t * 1.9) + 1.6 * Math.sin(x / 14 - t * 3.1)).toFixed(1)}`;
  return (
    <g>
      <defs>
        <linearGradient id="s7Water" x1="0" y1={surf} x2="0" y2={1920} gradientUnits="userSpaceOnUse">{stops}</linearGradient>
        <linearGradient id="s7Sky" x1="0" y1="0" x2="0" y2={surf} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#2C6FC2" /><stop offset="0.5" stopColor="#5E9EDC" /><stop offset="0.85" stopColor="#A9CDEE" /><stop offset="1" stopColor="#DCEAF2" />
        </linearGradient>
        <linearGradient id="s7Ray" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFFFFF" stopOpacity="0.9" /><stop offset="1" stopColor="#FFFFFF" stopOpacity="0" /></linearGradient>
        <filter id="s7Glow" x="-200%" y="-200%" width="500%" height="500%"><feGaussianBlur stdDeviation="2.5" /></filter>
        <filter id="dsCloudEdge" x="-5%" y="-10%" width="110%" height="120%"><feGaussianBlur stdDeviation="1.6" /></filter>
      </defs>
      <rect width={1080} height={surf + 4} fill="url(#s7Sky)" />
      {clouds.map((c, i) => cumulus({x: ((c.x - t * 5) % 1400 + 1400) % 1400 - 200, y: c.y, w: c.w, h: c.w * 0.36, seed: c.seed}, `s7c${i}`, 1, 0.95, 0.2))}
      <rect y={surf - 10} width={1080} height={10} fill="#3E8CB8" opacity={0.5} />
      <rect y={surf} width={1080} height={1920 - surf} fill="url(#s7Water)" />
      {rays}
      {snow}
      {sparks}
      {trench > 0 && <Trench surf={surf} s={s} op={trench} />}
      <path d={wave + ` L1080,${surf - 5} L0,${surf - 5}Z`} fill="#BFEAF2" opacity={0.55} />
      <path d={wave} fill="none" stroke="#FFFFFF" strokeOpacity={0.9} strokeWidth={3} />
    </g>
  );
};

// The Mariana Trench walls, in world metres around the centre of the frame: a V from about 6,000 m down to
// a narrow floor at 10,935 m.
const FLOOR = 10935;
const trenchHW = (d: number) => 900 + Math.max(0, (FLOOR - d) / (FLOOR - 6000)) * 21000;
const Trench: React.FC<{surf: number; s: number; op: number}> = ({surf, s, op}) => {
  const side = (sgn: number) => {
    let d = '';
    for (let i = 0; i <= 24; i++) {
      const dep = 5600 + ((FLOOR - 5600) * i) / 24;
      const x = 540 + sgn * (trenchHW(dep) + 300 * Math.sin(i * 1.7)) * s, y = surf + dep * s;
      d += `${i ? ' L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`;
    }
    const yb = surf + FLOOR * s;
    return d + ` L540,${yb} L540,${yb + 900} L${540 + sgn * 3000},${yb + 900} L${540 + sgn * 3000},${surf + 5600 * s}Z`;
  };
  const yb = surf + FLOOR * s;
  return (
    <g opacity={op}>
      <defs>
        <linearGradient id="s7Rock" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1A2230" /><stop offset="1" stopColor="#0A0E16" /></linearGradient>
      </defs>
      <path d={side(-1)} fill="url(#s7Rock)" />
      <path d={side(1)} fill="url(#s7Rock)" />
      <rect x={-10} y={yb} width={1100} height={900} fill="#141A22" />
      <path d={`M0,${yb} L1080,${yb}`} stroke="#6A6E70" strokeOpacity={0.5} strokeWidth={2} />
    </g>
  );
};

const Ruler: React.FC<{surf: number; s: number; opacity: number}> = ({surf, s, opacity}) => {
  let step = 1;
  for (const m of [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000]) { step = m; if (m * s >= 125) break; }
  const ticks: number[] = [];
  for (let d = step; surf + d * s < 1500 && d <= 11000; d += step) ticks.push(d);
  return (
    <g opacity={opacity * 0.85} style={shadow}>
      <line x1={1034} y1={surf + 6} x2={1034} y2={1500} stroke={CREAM} strokeWidth={2} opacity={0.7} />
      {ticks.map((d) => (
        <g key={d}>
          <line x1={1020} x2={1034} y1={surf + d * s} y2={surf + d * s} stroke={CREAM} strokeWidth={2} />
          <text x={1012} y={surf + d * s + 8} textAnchor="end" fontFamily="IBM Plex Mono" fontWeight={500} fontSize={22} fill={CREAM}>{group(d)} m</text>
        </g>
      ))}
    </g>
  );
};

const CenterLabel: React.FC<{g: Dive; opacity: number}> = ({g, opacity}) => (
  <g opacity={opacity} style={shadow}>
    <text x={540} y={LABEL_Y} textAnchor="middle" fontFamily="Inter" fontWeight={500} fontSize={22} letterSpacing={3.5} fill={MUTE}>{g.kind.toUpperCase()}</text>
    <text x={540} y={LABEL_Y + 60} textAnchor="middle" fontFamily="Inter" fontWeight={600} fontSize={g.name.length > 16 ? 50 : 58} fill={CREAM}>{g.name}</text>
    <text x={540} y={LABEL_Y + 124} textAnchor="middle" fontFamily="IBM Plex Mono" fontWeight={500} fontSize={52} fill={ACC}>{fmtD(g)}<tspan fontSize={30} dx={10}>m</tspan><tspan fontSize={26} fill={MUTE} dx={18}>{g.approx ? '~' : ''}{group(g.d * 3.28084)} ft</tspan></text>
  </g>
);

const TopLine: React.FC<{big: string; small: string; opacity: number; accentX?: boolean}> = ({big, small, opacity, accentX}) => (
  <g opacity={opacity} style={shadow}>
    <text x={540} y={300} textAnchor="middle" fontFamily="Inter" fontWeight={300} fontSize={140} fill={CREAM} letterSpacing={-4}>{big}{accentX && <tspan fill={ACC}>×</tspan>}</text>
    <text x={540} y={366} textAnchor="middle" fontFamily="Inter" fontWeight={500} fontSize={28} letterSpacing={4} fill={CREAM}>{small.toUpperCase()}</text>
  </g>
);

// one subject on screen: dimmed and tinted blue for its depth, with a soft pool of light behind it so it reads
const Placed: React.FC<{g: Dive; i: number; x: number; y: number; k: number; t: number; op: number; pool: boolean}> = ({g, i, x, y, k, t, op, pool}) => {
  const dk = darkAt(g.d), b = 1 - 0.3 * dk;
  return (
    <g opacity={op}>
      <defs>
        <filter id={`dim${i}`} x="-30%" y="-30%" width="160%" height="160%" colorInterpolationFilters="sRGB">
          <feColorMatrix type="matrix" values={`${(b * 0.86).toFixed(3)} 0 0 0 0  0 ${(b * 0.95).toFixed(3)} 0 0 0.01  0 0 ${b.toFixed(3)} 0 ${(0.04 * dk).toFixed(3)}  0 0 0 1 0`} />
        </filter>
        <radialGradient id={`pool${i}`} cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#A8DCFF" stopOpacity={0.12 + 0.22 * dk} /><stop offset="1" stopColor="#A8DCFF" stopOpacity="0" /></radialGradient>
      </defs>
      {pool && dk > 0.15 && <ellipse cx={x} cy={y - (ON_FLOOR.has(g.id) ? 60 : 0)} rx={360 * k} ry={260 * k} fill={`url(#pool${i})`} />}
      <g transform={`translate(${x},${y}) scale(${k})`} filter={`url(#dim${i})`}><Subject id={g.id} t={t} /></g>
    </g>
  );
};

type SceneState = {f: number; t: number; p: number; cold?: boolean};
const Scene: React.FC<SceneState> = ({f, t, p, cold}) => {
  const L = makeLayout();
  const k = Math.floor(p), u = p - k;
  const {surf, s} = viewAt(p);
  const cur = u < 0.5 ? k : k + 1;
  const labOp = u === 0 ? 1 : Math.abs(u - 0.5) * 2;
  const sway = {x: 3 * fbm1(f / 80, 1), y: 2 * fbm1(f / 95, 3)};
  const trench = interpolate(Math.log10(Math.max(1, (CUR_Y - surf) / s)), [3.6, 3.85], [0, 1], clamp);
  // subjects: the one arriving (k + 1) at the centre, the current one sliding to the left, the one before fading
  const items: {i: number; x: number; k: number; op: number}[] = [];
  const add = (i: number, x: number, sc: number, op: number) => { if (i >= 0 && i < L.N && op > 0.01) items.push({i, x, k: sc, op}); };
  const PX = 270, PK = 0.58;
  add(k - 1, PX - 120 * u, PK * (1 - 0.2 * u), 1 - u);
  add(k, 540 + (PX - 540) * u, 1 + (PK - 1) * u, 1);
  if (u > 0) add(k + 1, 540, 1, interpolate(u, [0, 0.25], [0, 1], clamp));
  const yOf = (g: Dive) => surf + g.d * s;
  const isFinal = k === L.N - 1;
  const fEnd = L.arrive(L.N - 1);
  const ev = cold ? interpolate(f, [0, 34], [0, 1], {...clamp, easing: Easing.out(Easing.quad)}) : isFinal ? interpolate(f, [fEnd + 20, fEnd + 56], [0, 1], {...clamp, easing: Easing.in(Easing.quad)}) : 0;
  const evSettle = cold ? interpolate(f, [34, 46], [0, 1], clamp) : interpolate(f, [fEnd + 56, fEnd + 70], [0, 1], clamp);
  const evH = EVEREST * s, evHW = 8000 * s;
  const evY = surf - (1 - ev) * (surf + evH + 120) + 10 * Math.sin(evSettle * Math.PI) * (1 - evSettle);
  const evRot = cold ? 180 * (1 - Math.min(1, ev * 1.2)) : 0;
  const showEv = cold || (isFinal && f > fEnd + 18);
  const spareOp = cold ? interpolate(f, [40, 50], [0, 1], clamp) : interpolate(f, [fEnd + 66, fEnd + 80], [0, 1], clamp);
  const endFade = cold ? 1 : interpolate(f, [L.duration - 12, L.duration - 1], [1, 0], clamp);
  const curG = DIVES[cur];
  const prevG = cur >= 1 ? DIVES[cur - 1] : null;
  const tipY = surf + evH, floorY = surf + FLOOR * s;
  return (
    <AbsoluteFill style={{background: '#0a1420', opacity: endFade}}>
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <DeepDefs />
        <g transform={`translate(${sway.x},${sway.y})`}>
          <Sea surf={surf} s={s} t={t} descent={Math.log10(Math.max(12, (CUR_Y - surf) / s))} trench={cold ? 1 : trench} />
          {items.map((o) => {
            const g = DIVES[o.i];
            return <Placed key={g.id} g={g} i={o.i} x={o.x} y={yOf(g)} k={o.k * g.size} t={t + o.i * 0.7} op={o.op} pool={o.k > 0.9} />;
          })}
          {cold && <Placed g={DIVES[L.N - 1]} i={L.N - 1} x={540} y={floorY} k={1} t={t} op={1} pool />}
          {showEv && (
            <g transform={`translate(540,${evY}) rotate(${evRot},0,${evH / 2})`}>
              <EverestUpsideDown h={evH} hw={evHW} />
            </g>
          )}
          {showEv && spareOp > 0 && (
            <g opacity={spareOp} style={shadow}>
              <line x1={700} x2={700} y1={tipY} y2={floorY} stroke={ACC} strokeWidth={3} />
              <line x1={684} x2={716} y1={tipY} y2={tipY} stroke={ACC} strokeWidth={3} />
              <line x1={684} x2={716} y1={floorY} y2={floorY} stroke={ACC} strokeWidth={3} />
              <line x1={556} x2={684} y1={tipY} y2={tipY} stroke={ACC} strokeWidth={1.5} strokeDasharray="6 6" />
              <text x={728} y={(tipY + floorY) / 2 - 4} fontFamily="IBM Plex Mono" fontWeight={500} fontSize={34} fill={ACC}>{group(FLOOR - EVEREST)} m</text>
              <text x={728} y={(tipY + floorY) / 2 + 30} fontFamily="Inter" fontWeight={500} fontSize={22} letterSpacing={3} fill={CREAM}>TO SPARE</text>
            </g>
          )}
        </g>
        <rect y={0} width={1080} height={460} fill="url(#s7Top)" />
        <defs><linearGradient id="s7Top" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0c2238" stopOpacity="0.55" /><stop offset="1" stopColor="#0c2238" stopOpacity="0" /></linearGradient></defs>
        <rect y={LABEL_Y - 120} width={1080} height={1920 - LABEL_Y + 120} fill="url(#s7Lab)" />
        <defs><linearGradient id="s7Lab" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#020610" stopOpacity="0" /><stop offset="0.35" stopColor="#020610" stopOpacity="0.45" /><stop offset="1" stopColor="#020610" stopOpacity="0.6" /></linearGradient></defs>
        {cold ? (
          <TopLine big="Everest fits." small="With 2 km to spare" opacity={interpolate(f, [0, 6], [0, 1], clamp)} />
        ) : (
          <>
            <CenterLabel g={curG} opacity={labOp} />
            {cur === 0 && <TopLine big="How deep?" small="Can we go" opacity={labOp * interpolate(f, [0, 10], [0, 1], clamp)} />}
            {cur === 1 && <TopLine big="40 m" small="Below you" opacity={labOp} />}
            {cur >= 2 && cur < L.N - 1 && prevG && <TopLine big={fmtRatio(curG.d / prevG.d)} accentX small={`Deeper than ${prevG.ref}`} opacity={labOp} />}
            {cur === L.N - 1 && <TopLine big={fmtRatio(curG.d / DIVES[1].d)} accentX small={'Deeper than a scuba diver'} opacity={labOp * (1 - spareOp)} />}
            {cur === L.N - 1 && <TopLine big="Everest fits." small="Upside down, with room to spare" opacity={spareOp} />}
            <Ruler surf={surf} s={s} opacity={interpolate(f, [10, 30], [0, 1], clamp)} />
          </>
        )}
      </svg>
    </AbsoluteFill>
  );
};

const Main: React.FC = () => {
  const f = useCurrentFrame();
  const L = makeLayout();
  return <Scene f={f} t={(f + COLD) / T.fps} p={L.progress(f)} />;
};
// Cold open: the final picture first. Everest flips upside down and drops into the trench, the hook line on top.
const Cold: React.FC = () => {
  const f = useCurrentFrame();
  return <Scene f={f} t={f / T.fps} p={DIVES.length - 1} cold />;
};

export const Short07: React.FC<{audio?: string; only?: 'cold' | 'main'}> = ({audio, only}) => (
  <AbsoluteFill style={{background: '#0a1420', filter: 'contrast(1.04)'}}>
    {only !== 'main' && <Sequence durationInFrames={COLD}><Cold /></Sequence>}
    {only !== 'cold' && <Sequence from={only === 'main' ? 0 : COLD}><Main /></Sequence>}
    {audio && <Audio src={staticFile(audio)} />}
  </AbsoluteFill>
);

export const short07Duration = () => COLD + makeLayout().duration;
