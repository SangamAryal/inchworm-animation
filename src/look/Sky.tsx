import React from 'react';
import {continueRender, delayRender, staticFile} from 'remotion';
import {rng} from '../engine/noise';

// NASA Blue Marble with clouds (see media/sources.md), cropped to the tropics so it reads as the Earth seen edge-on
const EARTH = staticFile('textures/earth-strip.jpg');
let earthReady: Promise<void> | null = null;
const useEarth = () => {
  const [h] = React.useState(() => delayRender('earth texture'));
  React.useEffect(() => {
    earthReady = earthReady ?? new Promise((res) => { const im = new Image(); im.onload = () => res(); im.onerror = () => res(); im.src = EARTH; });
    earthReady.then(() => continueRender(h));
  }, [h]);
};

// Dusk horizon look, in the air: violet-to-peach sky, low sun, lit cumulus, land far below.
// alt (0..1) climbs from a dusk sky through the dark upper atmosphere to orbit: the sky darkens, stars come out,
// clouds sink below, and the horizon becomes the curved limb of the Earth.
const X0 = -380, W = 1460;
const wrap = (x: number, w: number) => ((x % w) + w) % w;
const smooth = (a: number, b: number, x: number) => {
  const u = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return u * u * (3 - 2 * u);
};
const hex = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const mixc = (a: string, b: string, u: number) => {
  const A = hex(a), B = hex(b);
  return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * u).toString(16).padStart(2, '0')).join('');
};
// three palettes (dusk, stratosphere, orbit), each as [offset, colour] stops from the top of the frame to the horizon
const PAL = [
  ['#2F2C44', '#4A3E5E', '#7A5E74', '#B47E80', '#E0A584', '#F4C79E'],
  ['#0E0E22', '#1C1A38', '#33294E', '#6A4A68', '#C9876E', '#F0B890'],
  ['#010106', '#03040C', '#060818', '#0C1230', '#2B4690', '#F4A070'],
];
const OFF = [0, 0.3, 0.55, 0.75, 0.92, 1];
const skyAt = (alt: number) => {
  const k = alt < 0.6 ? 0 : 1, u = alt < 0.6 ? alt / 0.6 : (alt - 0.6) / 0.4;
  return PAL[k].map((c, i) => mixc(c, PAL[k + 1][i], u));
};

type Puff = {x: number; y: number; w: number; h: number; seed: number};
const cloud = (p: Puff, key: string, stretch: number, op: number, alt: number) => {
  const R = rng(p.seed);
  const blobs = Array.from({length: 7}, (_, i) => {
    const u = i / 6;
    return {cx: (u - 0.5) * p.w * 0.8 + (R() - 0.5) * p.w * 0.1, cy: -p.h * (0.25 + 0.55 * Math.sin(Math.PI * u) * (0.6 + R() * 0.5)), r: p.h * (0.35 + 0.4 * Math.sin(Math.PI * u) * (0.7 + R() * 0.4))};
  });
  return (
    <g key={key} transform={`translate(${p.x},${p.y}) scale(${stretch},1)`} opacity={op}>
      <defs>
        <linearGradient id={`cg${key}`} gradientUnits="userSpaceOnUse" x1={0} y1={-p.h * 1.25} x2={0} y2={0}>
          <stop offset="0" stopColor={mixc('#FFE6CC', '#E8D8E0', alt)} /><stop offset="0.5" stopColor={mixc('#EDB08E', '#B8A8C0', alt)} /><stop offset="1" stopColor={mixc('#8A6680', '#4A4862', alt)} />
        </linearGradient>
      </defs>
      <ellipse cx={0} cy={-p.h * 0.18} rx={p.w * 0.55} ry={p.h * 0.22} fill={`url(#cg${key})`} />
      {blobs.map((b, i) => <circle key={i} cx={b.cx} cy={b.cy} r={b.r} fill={`url(#cg${key})`} />)}
    </g>
  );
};

// Air streaks: small motes at mixed depths that stretch into lines as speed rises. They are on screen at every
// altitude, so the jump in speed between machines reads the same way from the first plane to orbit.
export const Motes: React.FC<{bgX: number; spf: number; seed: number; n: number; y0: number; y1: number; dMin: number; dMax: number; op: number}> = ({bgX, spf, seed, n, y0, y1, dMin, dMax, op}) => {
  const M = rng(seed), tile = 2600;
  const list = Array.from({length: n}, () => ({x: M() * tile, y: y0 + M() * (y1 - y0), d: dMin + M() * (dMax - dMin), a: 0.4 + M() * 0.6}));
  return <g>{list.flatMap((m, i) => {
    const trail = Math.min(2400, spf * m.d * 1.6), w = 1.4 + 1.8 * m.d;
    const x = wrap(m.x - bgX * m.d, tile) + X0;
    return [0, tile].map((k) => {
      const xx = x + k - tile * 0.5;
      if (xx > W + 20 || xx + trail < X0) return null;
      return <g key={`${i}-${k}`} opacity={op * m.a * Math.min(1, 0.35 + trail / 120)}>
        <rect x={xx} y={m.y - w / 2} width={Math.max(trail, w)} height={w} rx={w / 2} fill="url(#skMote)" />
        <circle cx={xx} cy={m.y} r={w * 0.7} fill="#FFF4E6" />
      </g>;
    });
  })}</g>;
};

// bgX: accumulated background travel (px at depth 1). spf: background speed (px per frame at depth 1).
export const Sky: React.FC<{bgX: number; spf: number; alt: number; t: number}> = ({bgX, spf, alt, t}) => {
  useEarth();
  const sky = skyAt(alt);
  const HZ = 1390 + 170 * smooth(0.3, 1, alt); // horizon height on screen
  const R = 1 / (1 / 90000 + smooth(0.35, 1, alt) / 2300); // radius of the Earth's limb, in px
  const cy = HZ + R;
  const stars = smooth(0.42, 0.85, alt), space = smooth(0.75, 1, alt), clouds = 1 - smooth(0.55, 0.9, alt);
  const land = 1 - smooth(0.55, 0.95, alt);
  const S = rng(77);
  const starList = Array.from({length: 220}, () => ({x: X0 + S() * (W - X0), y: -400 + S() * 1900, r: 0.6 + S() * S() * 2.4, a: 0.3 + S() * 0.7, tw: S() * 6}));

  // clouds: far ones near the horizon, mid ones around the flight level; they streak at high speed
  const layer = (seed: number, n: number, par: number, yMin: number, yMax: number, size: number, tile: number) => {
    const G = rng(seed);
    const puffs = Array.from({length: n}, () => ({x: G() * tile, y: yMin + G() * (yMax - yMin), w: size * (0.7 + G() * 0.8), h: size * (0.22 + G() * 0.14), seed: Math.floor(G() * 1e6)}));
    const off = wrap(bgX * par, tile), trail = spf * par;
    const stretch = 1 + Math.min(6, trail / (size * 0.9));
    return puffs.flatMap((p, i) => [0, -tile, tile].map((k) => {
      const x = p.x - off + k;
      const half = p.w * stretch * 0.6;
      if (x < X0 - half || x > W + half) return null;
      return cloud({...p, x}, `${seed}-${i}-${k}`, stretch, Math.max(0.25, 1 / Math.sqrt(stretch)), alt);
    }));
  };
  const sink = 520 * smooth(0.15, 0.6, alt); // clouds fall away below as the plane climbs

  // ground texture: fields at dusk, swirls of cloud over the sea from orbit; it moves slowly (it is far below)
  const gOff = (par: number, tile: number) => wrap(bgX * par, tile);
  const G = rng(5);
  const fields = Array.from({length: 26}, () => ({x: G() * 2400, y: G(), w: 60 + G() * 260, c: G()}));
  const swirls = Array.from({length: 30}, () => ({x: G() * 2600, y: G(), w: 120 + G() * 420, r: G()}));
  const ridge = (() => {
    let d = `M${X0},${HZ + 4}`;
    const off = gOff(0.012, 1800);
    for (let x = X0; x <= W; x += 20) {
      const wx = x + off;
      const h = 26 * Math.max(0, Math.sin(wx / 260) * Math.sin(wx / 97 + 1)) + 9 * Math.sin(wx / 53) ** 2 + 4;
      d += ` L${x},${HZ - h}`;
    }
    return d + ` L${W},${HZ + 4}Z`;
  })();
  const limb = `M${X0},${cy - Math.sqrt(Math.max(0, R * R - (X0 - 540) ** 2))} A${R},${R} 0 0 1 ${W},${cy - Math.sqrt(Math.max(0, R * R - (W - 540) ** 2))} L${W},2400 L${X0},2400Z`;

  return (
    <g>
      <defs>
        <linearGradient id="skSky" gradientUnits="userSpaceOnUse" x1="0" y1="-420" x2="0" y2={HZ}>
          {sky.map((c, i) => <stop key={i} offset={OFF[i]} stopColor={c} />)}
        </linearGradient>
        <radialGradient id="skSun"><stop offset="0" stopColor="#FFE2B8" stopOpacity="0.85" /><stop offset="0.25" stopColor="#FFC58E" stopOpacity="0.35" /><stop offset="1" stopColor="#FFB070" stopOpacity="0" /></radialGradient>
        <linearGradient id="skCloud" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={mixc('#FFE0C4', '#E8D8E0', alt)} /><stop offset="0.45" stopColor={mixc('#E6A88E', '#B8A8C0', alt)} /><stop offset="1" stopColor={mixc('#7E6078', '#4A4862', alt)} />
        </linearGradient>
        <linearGradient id="skLand" gradientUnits="userSpaceOnUse" x1="0" y1={HZ} x2="0" y2="2000">
          <stop offset="0" stopColor={mixc('#A88470', '#2A3E78', 1 - land)} /><stop offset="0.15" stopColor={mixc('#7A5C4C', '#16264E', 1 - land)} /><stop offset="1" stopColor={mixc('#2A1C16', '#060A18', 1 - land)} />
        </linearGradient>
        <linearGradient id="skHaze" gradientUnits="userSpaceOnUse" x1="0" y1={HZ - 120} x2="0" y2={HZ + 160}>
          <stop offset="0" stopColor="#F4C79E" stopOpacity="0" /><stop offset="0.45" stopColor="#F4C79E" stopOpacity={0.55 * land} /><stop offset="1" stopColor="#F4C79E" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="skNight" gradientUnits="userSpaceOnUse" x1="0" y1={HZ} x2="0" y2={HZ + 700}>
          <stop offset="0" stopColor="#0a1030" stopOpacity="0.15" /><stop offset="0.5" stopColor="#060a1c" stopOpacity="0.45" /><stop offset="1" stopColor="#03050e" stopOpacity="0.8" />
        </linearGradient>
        <linearGradient id="skMote" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#FFF4E6" stopOpacity="0.9" /><stop offset="1" stopColor="#FFF4E6" stopOpacity="0" /></linearGradient>
        <clipPath id="skEarth"><path d={limb} /></clipPath>
        <filter id="skBlur" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="10" /></filter>
        <filter id="skGlow" x="-10%" y="-200%" width="120%" height="500%"><feGaussianBlur stdDeviation="7" /></filter>
      </defs>
      <rect x={X0} y={-420} width={W - X0} height={HZ + 1000} fill="url(#skSky)" />
      {stars > 0.01 && <g>{starList.map((s, i) => s.y < HZ - 20 && <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#F6ECDF" opacity={stars * s.a * (0.75 + 0.25 * Math.sin(t * 2 + s.tw))} />)}</g>}
      {/* low sun on the left; from orbit it becomes a sunrise flare on the limb */}
      <circle cx={170} cy={HZ - 40 + 30 * alt} r={460 - 120 * alt} fill="url(#skSun)" />
      <circle cx={170} cy={HZ - 40 + 30 * alt} r={46 - 14 * alt} fill="#FFE8C8" opacity={0.95} />
      {/* far clouds near the horizon */}
      {clouds > 0.01 && <g opacity={0.75 * clouds} transform={`translate(0,${sink * 0.15})`}>{layer(21, 10, 0.05, HZ - 150, HZ - 30, 150, 2600)}</g>}
      {land > 0.01 && <path d={ridge} fill="#8A6A78" opacity={0.7 * land} />}
      {/* the ground: flat land at dusk that curves into the Earth's limb */}
      <path d={limb} fill="url(#skLand)" />
      <g clipPath="url(#skEarth)">
        {land > 0.01 && <g opacity={land}>{fields.flatMap((p, i) => [0, -2400, 2400].map((k) => {
          const x = p.x - gOff(0.06, 2400) + k, y = HZ + 20 + Math.pow(p.y, 1.6) * 520, d = 0.3 + (y - HZ) / 300;
          if (x < X0 - p.w * d || x > W + 20) return null;
          return <ellipse key={`${i}${k}`} cx={x} cy={y} rx={p.w * d} ry={p.w * d * 0.06 + 2} fill={p.c > 0.5 ? '#5E4A38' : '#8A6E52'} opacity={0.35} />;
        }))}</g>}
        {land < 0.99 && <g opacity={1 - land}>
          {[0, 1, 2].map((k) => <image key={k} href={EARTH} x={k * 3200 - gOff(0.14, 3200) + X0} y={HZ - 30} width={3200} height={760} preserveAspectRatio="none" />)}
          <rect x={X0} y={HZ - 40} width={W - X0} height={900} fill="url(#skNight)" />
        </g>}
      </g>
      <rect x={X0} y={HZ - 120} width={W - X0} height={280} fill="url(#skHaze)" />
      {/* atmosphere seen from above: a thin blue band with a warm edge on the limb */}
      {space > 0.01 && <g opacity={space} filter="url(#skGlow)">
        <path d={`M${X0},${cy - Math.sqrt(R * R - (X0 - 540) ** 2)} A${R},${R} 0 0 1 ${W},${cy - Math.sqrt(R * R - (W - 540) ** 2)}`} fill="none" stroke="#6FA0FF" strokeWidth={18} opacity={0.75} />
        <path d={`M${X0},${cy - Math.sqrt(R * R - (X0 - 540) ** 2)} A${R},${R} 0 0 1 ${W},${cy - Math.sqrt(R * R - (W - 540) ** 2)}`} fill="none" stroke="#FFB080" strokeWidth={5} opacity={0.8} />
      </g>}
      {/* clouds around the flight level, sinking away as the planes climb */}
      {clouds > 0.01 && <g opacity={clouds} transform={`translate(0,${sink})`}>
        {layer(31, 7, 0.35, 520, 1250, 260, 2600)}
        {layer(41, 5, 0.65, 1150, 1500, 380, 3000)}
      </g>}
      <Motes bgX={bgX} spf={spf} seed={88} n={42} y0={470} y1={1700} dMin={0.35} dMax={1} op={0.55} />
    </g>
  );
};

// A few large, fast clouds that pass in front of the planes (depth > 1), for parallax.
export const SkyFront: React.FC<{bgX: number; spf: number; alt: number}> = ({bgX, spf, alt}) => {
  const op = 1 - smooth(0.12, 0.45, alt);
  const motes = <Motes bgX={bgX} spf={spf} seed={93} n={10} y0={480} y1={1650} dMin={1.3} dMax={1.8} op={0.5} />;
  if (op < 0.01) return motes;
  const G = rng(51), tile = 4200, par = 1.3;
  const puffs = Array.from({length: 3}, () => ({x: G() * tile, y: 1420 + G() * 300, w: 620 + G() * 300, h: 0, seed: Math.floor(G() * 1e6)})).map((p) => ({...p, h: p.w * 0.3}));
  const off = wrap(bgX * par, tile), stretch = 1 + Math.min(5, (spf * par) / 600);
  return <g><g opacity={op * 0.9}>{puffs.flatMap((p, i) => [0, -tile, tile].map((k) => {
    const x = p.x - off + k;
    if (x < X0 - p.w * stretch || x > W + p.w * stretch) return null;
    return cloud({...p, x}, `f${i}${k}`, stretch, 1 / Math.sqrt(stretch), alt);
  }))}</g>{motes}</g>;
};
