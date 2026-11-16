import React from 'react';
import {continueRender, delayRender, staticFile} from 'remotion';
import {rng} from '../engine/noise';

// "Clear day" look: a bright midday sky, white cumulus with flat grey-blue bases, farmland far below,
// blue hills fading into haze (aerial perspective). One light: the sun high up on the left, so every cloud,
// plane and shadow is lit from the same side. alt (0..1) climbs to orbit: the blue deepens to black,
// the clouds sink into a deck below and the horizon becomes the curved, sunlit limb of the Earth.
const EARTH = staticFile('textures/earth-strip.jpg');
let earthReady: Promise<void> | null = null;
const useEarth = () => {
  const [h] = React.useState(() => delayRender('earth texture'));
  React.useEffect(() => {
    earthReady = earthReady ?? new Promise((res) => { const im = new Image(); im.onload = () => res(); im.onerror = () => res(); im.src = EARTH; });
    earthReady.then(() => continueRender(h));
  }, [h]);
};

const X0 = -380, W = 1460;
const wrap = (x: number, w: number) => ((x % w) + w) % w;
const smooth = (a: number, b: number, x: number) => {
  const u = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return u * u * (3 - 2 * u);
};
const hex = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
export const mixc = (a: string, b: string, u: number) => {
  const A = hex(a), B = hex(b);
  return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * u).toString(16).padStart(2, '0')).join('');
};
// sky stops from the top of the frame down to the horizon: midday, stratosphere, orbit
const PAL = [
  ['#2C6FC2', '#3F86D3', '#62A2E0', '#8DBDEA', '#BCD8F0', '#E4EEF2'],
  ['#0A2462', '#103684', '#1C52A6', '#3474C2', '#7FB0E2', '#D6E8F6'],
  ['#000004', '#01030B', '#030818', '#071A44', '#2E70CC', '#BFDDFF'],
];
const OFF = [0, 0.3, 0.55, 0.75, 0.92, 1];
const skyAt = (alt: number) => {
  const k = alt < 0.6 ? 0 : 1, u = alt < 0.6 ? alt / 0.6 : (alt - 0.6) / 0.4;
  return PAL[k].map((c, i) => mixc(c, PAL[k + 1][i], u));
};

// A cumulus cloud: lobes piled on a flat base, lit from the upper left. Each cloud has its own random shape
// (no repeated stamp), a bright crown, a cool shadowed underside and a soft edge.
type Puff = {x: number; y: number; w: number; h: number; seed: number};
const cumulus = (p: Puff, key: string, stretch: number, op: number, haze: number) => {
  const R = rng(p.seed);
  const n = 9 + Math.floor(R() * 5);
  const tier = Array.from({length: n}, (_, i) => {
    const u = (i + 0.5) / n;
    const hump = Math.sin(Math.PI * u) ** 0.9;
    const r = p.h * (0.18 + 0.34 * hump * (0.7 + R() * 0.6));
    return {cx: (u - 0.5) * p.w * 0.9 + (R() - 0.5) * p.w * 0.04, cy: -r * (0.7 + R() * 0.3) - p.h * 0.18 * hump, r};
  });
  // cauliflower bumps on top of the bigger lobes
  const bumps = tier.filter((b) => b.r > p.h * 0.3).flatMap((b) => Array.from({length: 2}, () => {
    const a = -Math.PI * (0.2 + R() * 0.6), r = b.r * (0.35 + R() * 0.25);
    return {cx: b.cx + Math.cos(a) * b.r * 0.75, cy: b.cy + Math.sin(a) * b.r * 0.75, r};
  }));
  const lobes = [...tier, ...bumps];
  const top = Math.min(...lobes.map((l) => l.cy - l.r));
  const id = `cu${key}`;
  const lit = mixc('#FFFFFF', '#E8F0F8', haze), mid = mixc('#EEF3F8', '#DCE7F2', haze), base = mixc('#A8B9CE', '#C4D3E4', haze);
  return (
    <g key={key} transform={`translate(${p.x},${p.y}) scale(${stretch},1)`} opacity={op}>
      <defs>
        <linearGradient id={id} gradientUnits="userSpaceOnUse" x1={0} y1={top} x2={0} y2={0}>
          <stop offset="0" stopColor={lit} /><stop offset="0.55" stopColor={mid} /><stop offset="0.85" stopColor={mixc(mid, base, 0.6)} /><stop offset="1" stopColor={base} />
        </linearGradient>
        <radialGradient id={id + 'h'} cx="0.3" cy="0.25" r="0.7"><stop offset="0" stopColor="#FFFFFF" stopOpacity="0.9" /><stop offset="1" stopColor="#FFFFFF" stopOpacity="0" /></radialGradient>
      </defs>
      <g fill={`url(#${id})`} filter="url(#dsCloudEdge)">
        <rect x={-p.w * 0.47} y={-p.h * 0.32} width={p.w * 0.94} height={p.h * 0.32} rx={p.h * 0.08} />
        {lobes.map((b, i) => <circle key={i} cx={b.cx} cy={b.cy} r={b.r} />)}
      </g>
      {/* sunlit crowns on the upper-left of the big lobes */}
      {lobes.filter((b) => b.r > p.h * 0.4).map((b, i) => <circle key={'h' + i} cx={b.cx - b.r * 0.18} cy={b.cy - b.r * 0.2} r={b.r * 0.7} fill={`url(#${id}h)`} opacity={0.7 * (1 - haze)} />)}
    </g>
  );
};

// Air streaks: small motes at mixed depths that stretch into lines as speed rises, at every altitude.
export const DayMotes: React.FC<{bgX: number; spf: number; seed: number; n: number; y0: number; y1: number; dMin: number; dMax: number; op: number}> = ({bgX, spf, seed, n, y0, y1, dMin, dMax, op}) => {
  const M = rng(seed), tile = 2600;
  const list = Array.from({length: n}, () => ({x: M() * tile, y: y0 + M() * (y1 - y0), d: dMin + M() * (dMax - dMin), a: 0.4 + M() * 0.6}));
  return <g>{list.flatMap((m, i) => {
    const trail = Math.min(2400, spf * m.d * 1.6), w = 1.3 + 1.6 * m.d;
    const x = wrap(m.x - bgX * m.d, tile) + X0;
    return [0, tile].map((k) => {
      const xx = x + k - tile * 0.5;
      if (xx > W + 20 || xx + trail < X0) return null;
      return <g key={`${i}-${k}`} opacity={op * m.a * Math.min(1, 0.3 + trail / 120)}>
        <rect x={xx} y={m.y - w / 2} width={Math.max(trail, w)} height={w} rx={w / 2} fill="url(#dsMote)" />
      </g>;
    });
  })}</g>;
};

export const DaySky: React.FC<{bgX: number; spf: number; alt: number; t: number}> = ({bgX, spf, alt, t}) => {
  useEarth();
  const sky = skyAt(alt);
  const HZ = 1390 + 170 * smooth(0.3, 1, alt);
  const R = 1 / (1 / 90000 + smooth(0.35, 1, alt) / 2300);
  const cy = HZ + R;
  const stars = smooth(0.7, 0.95, alt), space = smooth(0.7, 1, alt), clouds = 1 - smooth(0.6, 0.92, alt);
  const land = 1 - smooth(0.55, 0.95, alt);
  const sink = 520 * smooth(0.15, 0.6, alt);
  const gOff = (par: number, tile: number) => wrap(bgX * par, tile);
  const S = rng(77);
  const starList = Array.from({length: 160}, () => ({x: X0 + S() * (W - X0), y: -400 + S() * 1700, r: 0.6 + S() * S() * 2, a: 0.3 + S() * 0.7}));

  const layer = (seed: number, n: number, par: number, yMin: number, yMax: number, size: number, tile: number, haze: number) => {
    const G = rng(seed);
    const puffs = Array.from({length: n}, () => ({x: G() * tile, y: yMin + G() * (yMax - yMin), w: size * (0.6 + G() * 0.9), h: 0, seed: Math.floor(G() * 1e6)})).map((p) => ({...p, h: p.w * (0.32 + rng(p.seed)() * 0.18)}));
    const off = wrap(bgX * par, tile), trail = spf * par;
    const stretch = 1 + Math.min(6, trail / (size * 0.9));
    return puffs.flatMap((p, i) => [0, -tile, tile].map((k) => {
      const x = p.x - off + k;
      const half = p.w * stretch * 0.6;
      if (x < X0 - half || x > W + half) return null;
      return cumulus({...p, x}, `${seed}-${i}-${k}`, stretch, Math.max(0.3, 1 / Math.sqrt(stretch)), haze);
    }));
  };

  // hills along the horizon: two ranges, the far one paler (aerial perspective)
  const range = (par: number, amp: number, seed: number, tile: number) => {
    let d = `M${X0},${HZ + 4}`;
    const off = gOff(par, tile);
    for (let x = X0; x <= W; x += 16) {
      const wx = x + off + seed * 977;
      const h = amp * (0.55 * Math.max(0, Math.sin(wx / 210) * Math.sin(wx / 83 + seed)) + 0.3 * Math.sin(wx / 47 + seed) ** 2 + 0.15);
      d += ` L${x},${HZ - h}`;
    }
    return d + ` L${W},${HZ + 4}Z`;
  };

  // farmland in perspective: rows of fields that grow and speed up towards the bottom of the frame
  const F = rng(5);
  const FIELD = ['#6F9A4E', '#82A856', '#97B45E', '#B9B66A', '#C9B77A', '#5E8A47', '#A7C06A'];
  const rows = Array.from({length: 9}, (_, r) => {
    const v = r / 8, y = HZ + 6 + Math.pow(v, 1.7) * 560, d = 0.08 + Math.pow(v, 1.7) * 1.2;
    return {y, d, h: 6 + 70 * Math.pow(v, 1.7), fields: Array.from({length: 14}, () => ({w: 0.5 + F() * 1.2, c: FIELD[Math.floor(F() * FIELD.length)], tree: F() < 0.3}))};
  });
  const persp = (x: number, y: number, w: number, h: number) => {
    const k = h / Math.max(40, y - HZ + 40) * 0.9; // lean of the side edges
    const sx = (xx: number) => (xx - 540) * k;
    return `M${x},${y} L${x + w},${y} L${x + w + sx(x + w)},${y + h} L${x + sx(x)},${y + h}Z`;
  };
  const limb = `M${X0},${cy - Math.sqrt(Math.max(0, R * R - (X0 - 540) ** 2))} A${R},${R} 0 0 1 ${W},${cy - Math.sqrt(Math.max(0, R * R - (W - 540) ** 2))} L${W},2400 L${X0},2400Z`;
  const arc = `M${X0},${cy - Math.sqrt(R * R - (X0 - 540) ** 2)} A${R},${R} 0 0 1 ${W},${cy - Math.sqrt(R * R - (W - 540) ** 2)}`;

  return (
    <g>
      <defs>
        <linearGradient id="dsSky" gradientUnits="userSpaceOnUse" x1="0" y1="-420" x2="0" y2={HZ}>
          {sky.map((c, i) => <stop key={i} offset={OFF[i]} stopColor={c} />)}
        </linearGradient>
        <radialGradient id="dsSun"><stop offset="0" stopColor="#FFFFFF" stopOpacity="0.95" /><stop offset="0.12" stopColor="#FFFBEA" stopOpacity="0.6" /><stop offset="0.4" stopColor="#FFF4D6" stopOpacity="0.15" /><stop offset="1" stopColor="#FFF4D6" stopOpacity="0" /></radialGradient>
        <linearGradient id="dsLand" gradientUnits="userSpaceOnUse" x1="0" y1={HZ} x2="0" y2="2000">
          <stop offset="0" stopColor="#A9C2C6" /><stop offset="0.12" stopColor="#8EAA7A" /><stop offset="1" stopColor="#5C8442" />
        </linearGradient>
        <linearGradient id="dsHaze" gradientUnits="userSpaceOnUse" x1="0" y1={HZ - 140} x2="0" y2={HZ + 260}>
          <stop offset="0" stopColor="#E4EEF2" stopOpacity="0" /><stop offset="0.35" stopColor="#E4EEF2" stopOpacity={0.7 * land} /><stop offset="1" stopColor="#E4EEF2" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="dsMote" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#FFFFFF" stopOpacity="0.95" /><stop offset="1" stopColor="#FFFFFF" stopOpacity="0" /></linearGradient>
        <clipPath id="dsEarth"><path d={limb} /></clipPath>
        <filter id="dsGlow" x="-10%" y="-200%" width="120%" height="500%"><feGaussianBlur stdDeviation="8" /></filter>
        <filter id="dsCloudEdge" x="-5%" y="-10%" width="110%" height="120%"><feGaussianBlur stdDeviation="1.6" /></filter>
        <filter id="dsSoft" x="-10%" y="-50%" width="120%" height="200%"><feGaussianBlur stdDeviation="14" /></filter>
      </defs>
      <rect x={X0} y={-420} width={W - X0} height={HZ + 1000} fill="url(#dsSky)" />
      {stars > 0.01 && <g>{starList.map((s, i) => s.y < HZ - 30 && <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#FFFFFF" opacity={stars * s.a} />)}</g>}
      {/* the sun, high on the left, with a soft glare */}
      <circle cx={-20} cy={520} r={520} fill="url(#dsSun)" />
      <circle cx={-20} cy={520} r={44} fill="#FFFFFF" />
      {/* far clouds near the horizon */}
      {clouds > 0.01 && <g opacity={0.9 * clouds} transform={`translate(0,${sink * 0.15})`}>{layer(21, 12, 0.05, HZ - 110, HZ - 20, 170, 2600, 0.7)}</g>}
      {land > 0.01 && <g opacity={land}>
        <path d={range(0.006, 60, 1, 2600)} fill="#9DB6CC" />
        <path d={range(0.014, 38, 2, 2200)} fill="#86A3B4" />
      </g>}
      <path d={limb} fill="url(#dsLand)" opacity={land} />
      <g clipPath="url(#dsEarth)">
        {land > 0.01 && <g opacity={land}>
          {rows.map((row, r) => {
            const unit = 260 * row.d + 30, total = row.fields.reduce((a, f) => a + f.w, 0) * unit;
            const off = gOff(0.09 * row.d, total);
            let acc = 0;
            return <g key={r}>{row.fields.flatMap((f, i) => {
              const x0 = acc; acc += f.w * unit;
              return [0, total, 2 * total].map((k) => {
                const x = X0 + x0 - off + k - total * 0.3;
                if (x > W || x + f.w * unit < X0) return null;
                const haze = 0.25 + Math.max(0, 1 - row.d * 1.6) * 0.55;
                return <g key={`${i}-${k}`}>
                  <path d={persp(x, row.y, f.w * unit - 2, row.h)} fill={mixc(f.c, '#B9CCD0', haze)} />
                  {f.tree && row.d > 0.25 && <path d={persp(x + f.w * unit - 6 * row.d - 2, row.y, 6 * row.d + 2, row.h)} fill={mixc('#3F6634', '#B9CCD0', haze)} />}
                </g>;
              });
            })}</g>;
          })}
          {/* cloud shadows sliding over the fields: same sun, same clouds */}
          {clouds > 0.01 && Array.from({length: 5}, (_, i) => {
            const G = rng(400 + i), tile = 3000, x = wrap(G() * tile - bgX * 0.12, tile) + X0 - 400, y = HZ + 120 + G() * 420;
            return <ellipse key={i} cx={x} cy={y} rx={180 + G() * 200} ry={18 + (y - HZ) * 0.08} fill="#2E4A2A" opacity={0.18 * clouds} filter="url(#dsSoft)" />;
          })}
        </g>}
        {land < 0.99 && <g opacity={1 - land}>
          {[0, 1, 2].map((k) => <image key={k} href={EARTH} x={k * 3200 - gOff(0.14, 3200) + X0} y={HZ - 30} width={3200} height={760} preserveAspectRatio="none" />)}
        </g>}
      </g>
      <rect x={X0} y={HZ - 140} width={W - X0} height={400} fill="url(#dsHaze)" />
      {space > 0.01 && <g opacity={space} filter="url(#dsGlow)">
        <path d={arc} fill="none" stroke="#8CC0FF" strokeWidth={22} opacity={0.85} />
        <path d={arc} fill="none" stroke="#E8F4FF" strokeWidth={6} opacity={0.9} />
      </g>}
      {clouds > 0.01 && <g opacity={clouds} transform={`translate(0,${sink})`}>
        {layer(31, 6, 0.35, 720, 1180, 300, 2800, 0.15)}
        {layer(41, 4, 0.65, 1220, 1330, 380, 3600, 0)}
      </g>}
      <DayMotes bgX={bgX} spf={spf} seed={88} n={42} y0={470} y1={1700} dMin={0.35} dMax={1} op={0.6} />
    </g>
  );
};

// A few large, fast clouds that pass in front of the planes (depth > 1), plus near air streaks.
export const DaySkyFront: React.FC<{bgX: number; spf: number; alt: number}> = ({bgX, spf, alt}) => {
  const op = 0 * smooth(0.12, 0.45, alt);
  const motes = <DayMotes bgX={bgX} spf={spf} seed={93} n={10} y0={480} y1={1650} dMin={1.3} dMax={1.8} op={0.55} />;
  if (op < 0.01) return motes;
  const G = rng(51), tile = 4200, par = 1.3;
  const puffs = Array.from({length: 3}, () => ({x: G() * tile, y: 1560 + G() * 260, w: 640 + G() * 300, h: 0, seed: Math.floor(G() * 1e6)})).map((p) => ({...p, h: p.w * 0.36}));
  const off = wrap(bgX * par, tile), stretch = 1 + Math.min(5, (spf * par) / 600);
  return <g><g opacity={op}>{puffs.flatMap((p, i) => [0, -tile, tile].map((k) => {
    const x = p.x - off + k;
    if (x < X0 - p.w * stretch || x > W + p.w * stretch) return null;
    return cumulus({...p, x}, `f${i}${k}`, stretch, 1 / Math.sqrt(stretch), 0);
  }))}</g>{motes}</g>;
};
