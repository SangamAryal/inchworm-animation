import React from 'react';
import {Pt, poly, rotAbout, sc, smooth, tube, yAt} from './geom';
import {fbm1, rng} from '../engine/noise';

// Short 06 animals, code-drawn side views facing right. Each is drawn in metres with its rear end
// (tail tip, or tentacle tip) at x = 0 and its front end at x = length. Land animals stand on y = 0;
// sea animals are centred on y = 0. Light: low warm sun from the left above water, cool skylight
// from above under water. t is seconds, walk 0..1 is how hard the legs are swinging.

export type AnimalProps = {t: number; walk?: number};
const NS = {vectorEffect: 'non-scaling-stroke' as const};

const lin = (id: string, stops: [number, string, number?][], dir: 'v' | 'h' = 'v') => (
  <linearGradient key={id} id={id} x1="0" y1="0" x2={dir === 'h' ? 1 : 0} y2={dir === 'v' ? 1 : 0}>
    {stops.map(([o, c, a], i) => <stop key={i} offset={o} stopColor={c} stopOpacity={a ?? 1} />)}
  </linearGradient>
);

export const GiantDefs: React.FC = () => (
  <defs>
    {/* round-body shading shared by everyone: a soft core shadow low on the body and a sheen on top */}
    {lin('gForm', [[0, '#000', 0], [0.5, '#000', 0], [0.8, '#120c14', 0.22], [1, '#120c14', 0.42]])}
    {lin('gSheen', [[0, '#FFE2C2', 0.3], [0.22, '#FFE2C2', 0.06], [0.4, '#FFE2C2', 0]])}
    {lin('gSheenSea', [[0, '#CFEFF2', 0.28], [0.25, '#CFEFF2', 0.05], [0.45, '#CFEFF2', 0]])}
    {/* skin: dark mottling plus small light scales, from fractal noise in metres (F fine, M medium, C coarse) */}
    {([['F', 7], ['M', 2.8], ['C', 1.2]] as [string, number][]).map(([k, fr]) => (
      <filter key={k} id={`tex${k}`} x="0" y="0" width="1" height="1" primitiveUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency={fr} numOctaves={4} seed={k.charCodeAt(0)} result="n" />
        <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.08  0 0 0 0 0.06  0 0 0 0 0.05  -1.5 0 0 0 0.95" result="d" />
        <feTurbulence type="turbulence" baseFrequency={fr * 3.2} numOctaves={2} seed={k.charCodeAt(0) + 9} result="n2" />
        <feColorMatrix in="n2" type="matrix" values="0 0 0 0 1  0 0 0 0 0.97  0 0 0 0 0.9  0 0 0 1.1 -0.5" result="l" />
        <feMerge result="m"><feMergeNode in="d" /><feMergeNode in="l" /></feMerge>
        <feComposite in="m" in2="SourceAlpha" operator="in" />
      </filter>
    ))}
    {lin('gLegAO', [[0, '#120c10', 0.45], [0.28, '#120c10', 0.08], [0.85, '#120c10', 0], [1, '#120c10', 0.25]])}
    {lin('gCroc', [[0, '#3F4630'], [0.35, '#5C6140'], [0.62, '#8A8558'], [1, '#D2C49A']])}
    {lin('gCrocLeg', [[0, '#4E5236'], [1, '#2E3022']])}
    {lin('gPy', [[0, '#7A6438'], [0.4, '#B39557'], [0.75, '#C9B07A'], [1, '#E2D3A6']])}
    {lin('gRex', [[0, '#5B4A3E'], [0.3, '#7C6652'], [0.7, '#A48C70'], [1, '#C9B496']])}
    {lin('gRexLeg', [[0, '#927A64'], [1, '#64523F']])}
    {lin('gSpino', [[0, '#4E4A40'], [0.35, '#6E6652'], [0.7, '#968A6E'], [1, '#C2B392']])}
    {lin('gSail', [[0, '#B4614A'], [0.5, '#8E4A3E'], [1, '#5A3A34', 0]])}
    {lin('gMeg', [[0, '#34404A'], [0.42, '#5D6C78'], [0.52, '#A9B4B8'], [0.6, '#D3D8D4'], [1, '#E9EAE2']])}
    {lin('gFinDark', [[0, '#3E4A54'], [1, '#26303A']])}
    {lin('gWs', [[0, '#26394A'], [0.4, '#3E5468'], [0.58, '#8C9AA2'], [0.7, '#D7DAD2'], [1, '#ECECE4']])}
    {lin('gWhale', [[0, '#3D5065'], [0.35, '#587089'], [0.7, '#7E95A8'], [1, '#A6B6C0']])}
    {lin('gArgo', [[0, '#5E5248'], [0.35, '#7E7062'], [0.7, '#A69682'], [1, '#C8B89E']])}
    {lin('gKomo', [[0, '#5A5246'], [0.35, '#776C5A'], [0.7, '#998C72'], [1, '#B7A98A']])}
    {lin('gDiplo', [[0, '#5E6052'], [0.35, '#7C7C66'], [0.7, '#A29E84'], [1, '#C3BCA0']])}
    {lin('gArgoLeg', [[0, '#A09280'], [0.6, '#8A7B68'], [1, '#6A5C4E']])}
    <radialGradient id="gBell" cx="0.62" cy="0.42" r="0.7">
      <stop offset="0" stopColor="#FFD9AE" stopOpacity="0.95" />
      <stop offset="0.45" stopColor="#E98A5A" stopOpacity="0.88" />
      <stop offset="1" stopColor="#9C3A2C" stopOpacity="0.85" />
    </radialGradient>
  </defs>
);

// fill + core shadow + sheen + rim light along the top edge
type Tex = 'F' | 'M' | 'C';
const Body: React.FC<{d: string; fill: string; rim?: string; top?: Pt[]; sea?: boolean; rimO?: number; tex?: Tex; texO?: number}> = ({d, fill, rim, top, sea, rimO = 0.55, tex, texO = 0.32}) => (
  <g>
    <path d={d} fill={fill} />
    {tex && <path d={d} fill="#000" filter={`url(#tex${tex})`} opacity={texO} />}
    <path d={d} fill="url(#gForm)" />
    <path d={d} fill={sea ? 'url(#gSheenSea)' : 'url(#gSheen)'} />
    {top && <path d={smooth(top, false)} fill="none" stroke={rim ?? (sea ? '#D9F2F2' : '#FFD6A8')} strokeOpacity={rimO} strokeWidth={1.6} {...NS} />}
  </g>
);
const Eye: React.FC<{x: number; y: number; r: number; iris?: string}> = ({x, y, r, iris = '#2A1E16'}) => (
  <g>
    <circle cx={x} cy={-y} r={r * 1.35} fill="#000" opacity={0.25} />
    <circle cx={x} cy={-y} r={r} fill={iris} />
    <circle cx={x + r * 0.3} cy={-y - r * 0.35} r={r * 0.32} fill="#FFF4E0" opacity={0.85} />
  </g>
);
const Line: React.FC<{pts: Pt[]; c: string; w?: number; o?: number; sm?: boolean}> = ({pts, c, w = 1.2, o = 1, sm = true}) => (
  <path d={sm ? smooth(pts, false) : poly(pts, false)} fill="none" stroke={c} strokeWidth={w} strokeOpacity={o} strokeLinecap="round" {...NS} />
);

// ------------------------------------------------------------------ saltwater crocodile, 6.17 m, floating
export const CROC_L = 6.17;
export const Croc: React.FC<AnimalProps> = ({t, walk = 0}) => {
  const sway = (x: number) => (x < 2.6 ? 0.07 * Math.pow((2.6 - x) / 2.6, 2) * Math.sin(t * 2.2 - x * 1.4) * (0.4 + walk) : 0);
  const top: Pt[] = [[0, 0.03], [0.8, 0.1], [1.7, 0.18], [2.6, 0.25], [3.3, 0.3], [4.1, 0.3], [4.65, 0.24], [5.0, 0.27], [5.22, 0.33], [5.36, 0.26], [5.75, 0.17], [6.17, 0.09]].map(([x, y]) => [x, y + sway(x)] as Pt);
  const bot: Pt[] = [[6.17, 0.03], [5.8, -0.02], [5.35, -0.08], [4.95, -0.14], [4.5, -0.3], [3.7, -0.42], [2.9, -0.37], [2.1, -0.24], [1.2, -0.11], [0.3, -0.02]].map(([x, y]) => [x, y + sway(x)] as Pt);
  const stroke = Math.sin(t * 3.2) * (6 + 14 * walk);
  const leg = (pts: Pt[], piv: Pt, a: number, fill: string) => <path d={smooth(rotAbout(pts, piv, a))} fill={fill} />;
  const front: Pt[] = [[4.32, -0.12], [4.62, -0.14], [4.68, -0.46], [4.86, -0.7], [5.02, -0.78], [4.92, -0.84], [4.6, -0.8], [4.46, -0.52]];
  const back: Pt[] = [[2.72, -0.16], [3.24, -0.18], [3.24, -0.52], [3.46, -0.82], [3.64, -0.9], [3.52, -0.96], [3.06, -0.92], [2.92, -0.6]];
  const scutes: React.ReactNode[] = [];
  for (let x = 0.25; x < 3.4; x += 0.17) {
    const y = yAt(top, x), h = x < 2.4 ? 0.07 : 0.045;
    scutes.push(<path key={x} d={poly([[x - 0.07, y - 0.01], [x, y + h], [x + 0.07, y - 0.01]])} fill="#3A402C" />);
  }
  return (
    <g>
      {leg(back.map(([x, y]) => [x + 0.15, y + 0.04]), [3.0, -0.2], -stroke, '#2E3022')}
      {leg(front.map(([x, y]) => [x + 0.12, y + 0.04]), [4.45, -0.15], stroke, '#2E3022')}
      {scutes}
      <Body d={smooth([...top, ...bot])} fill="url(#gCroc)" top={top.slice(0, 11)} tex="F" texO={0.4} />
      {/* banded tail and back */}
      {Array.from({length: 9}, (_, i) => 0.4 + i * 0.36).map((x) => (
        <path key={x} d={poly([[x, yAt(top, x) - 0.02], [x + 0.12, yAt(top, x + 0.12) - 0.02], [x + 0.06, yAt(bot, x + 0.06) * 0.4], [x - 0.06, yAt(bot, x - 0.06) * 0.4]])} fill="#2A2E20" opacity={0.35} />
      ))}
      <Line pts={[[4.98, 0.04], [5.4, 0.01], [5.8, 0.05], [6.12, 0.06]]} c="#2A2618" w={1.4} />
      {Array.from({length: 9}, (_, i) => 5.05 + i * 0.12).map((x) => (
        <path key={x} d={poly([[x, 0.03], [x + 0.025, -0.025], [x + 0.05, 0.035]])} fill="#F2E6CC" />
      ))}
      <Eye x={5.24} y={0.29} r={0.04} iris="#C9962E" />
      <circle cx={6.08} cy={-0.11} r={0.025} fill="#2A2618" />
      {leg(back, [3.0, -0.2], stroke, 'url(#gCrocLeg)')}
      {leg(front, [4.45, -0.15], -stroke, 'url(#gCrocLeg)')}
    </g>
  );
};

// ------------------------------------------------------------------ reticulated python, 7.67 m, swimming at the surface
export const PY_L = 7.67;
export const Python: React.FC<AnimalProps> = ({t}) => {
  const L = PY_L, n = 70;
  const c: Pt[] = [], w: number[] = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n, x = u * L;
    const headCalm = 1 - Math.pow(Math.max(0, (u - 0.8) / 0.2), 1.5) * 0.85;
    c.push([x, 0.02 + 0.09 * Math.sin(u * 13 - t * 3.0) * headCalm]);
    const body = u < 0.12 ? 0.03 + (0.2 * u) / 0.12 : u < 0.86 ? 0.23 + 0.02 * Math.sin(u * 3) : u < 0.93 ? 0.24 - ((u - 0.86) / 0.07) * 0.11 : u < 0.975 ? 0.13 + ((u - 0.93) / 0.045) * 0.06 : 0.19 - ((u - 0.975) / 0.025) * 0.13;
    w.push(body);
  }
  const out = tube(c, w);
  const d = smooth(out);
  const top = out.slice(0, n + 1);
  const pat: React.ReactNode[] = [];
  for (let x = 0.5, k = 0; x < L * 0.92; x += 0.34, k++) {
    const i = Math.round((x / L) * n), cy = c[i][1], hw = w[i] * 0.5;
    pat.push(<path key={'d' + k} d={poly([[x - 0.2, cy + hw * 0.1], [x, cy + hw * 1.05], [x + 0.2, cy + hw * 0.1], [x, cy - hw * 0.75]])} fill="#2A2216" opacity={0.85} />);
    pat.push(<path key={'i' + k} d={poly([[x - 0.1, cy + hw * 0.2], [x, cy + hw * 0.62], [x + 0.1, cy + hw * 0.2], [x, cy - hw * 0.3]])} fill="#8F7746" />);
    pat.push(<ellipse key={'w' + k} cx={x + 0.17} cy={-(cy - hw * 0.45)} rx={0.06} ry={hw * 0.25} fill="#F1E6C4" opacity={0.7} />);
  }
  const hi = n - 2, hx = c[hi][0], hy = c[hi][1];
  return (
    <g>
      <clipPath id="pyClip"><path d={d} /></clipPath>
      <path d={d} fill="url(#gPy)" />
      <g clipPath="url(#pyClip)">
        {pat}
        <path d={poly([[L * 0.93, hy + 0.12], [L, hy + 0.06], [L, hy + 0.2], [L * 0.93, hy + 0.2]])} fill="#5A4A2C" opacity={0.75} />
        <Line pts={[[L * 0.94, hy + 0.0], [hx, hy + 0.02], [L - 0.02, hy + 0.01]]} c="#2A2216" w={1.3} />
        <path d={d} fill="url(#gForm)" />
        <path d={d} fill="url(#gSheen)" />
      </g>
      <path d={smooth(top, false)} fill="none" stroke="#FFD6A8" strokeOpacity={0.5} strokeWidth={1.4} {...NS} />
      <Eye x={hx - 0.02} y={hy + 0.045} r={0.025} iris="#C29A3C" />
    </g>
  );
};

// ------------------------------------------------------------------ Tyrannosaurus rex, 12.3 m ("Sue")
export const REX_L = 12.3;
const REX_TOP: Pt[] = [[0, 2.6], [1.5, 2.86], [3.2, 3.3], [4.8, 3.78], [5.9, 4.02], [7.1, 3.95], [8.3, 3.7], [9.2, 3.6], [9.9, 3.72], [10.5, 3.98], [11.2, 3.86], [11.8, 3.62], [12.3, 3.34]];
const REX_BOT: Pt[] = [[12.3, 3.1], [11.8, 2.92], [11.1, 2.76], [10.5, 2.62], [10.0, 2.52], [9.5, 2.46], [8.9, 2.32], [7.9, 2.14], [6.8, 2.26], [5.8, 2.6], [4.4, 3.02], [2.8, 2.9], [1.3, 2.68]];
// leg as a tapered tube through hip, knee, ankle and toes (thick drumstick thigh, slim shin, long foot)
const legTube = (j: Pt[], w: number[]) => smooth(tube(j, w), true, 0.8);
// a muscular thigh: an egg shape from hip to knee, wide at the top
const thigh = (hip: Pt, knee: Pt, w: number): Pt[] => {
  const dx = knee[0] - hip[0], dy = knee[1] - hip[1], len = Math.hypot(dx, dy), ux = dx / len, uy = dy / len;
  return Array.from({length: 16}, (_, i) => {
    const a = (i / 16) * Math.PI * 2, along = (Math.cos(a) * 0.5 + 0.5) * len, r = (w / 2) * Math.sin(a) * (1 - 0.45 * (along / len));
    return [hip[0] + ux * along - uy * r, hip[1] + uy * along + ux * r] as Pt;
  });
};
const dinoLeg = (j: Pt[], piv: Pt, deg: number, tw: number, w: number[]) => {
  const r = [...rotAbout(j.slice(0, 2), piv, deg), ...rotAbout(j.slice(2), piv, deg * 0.6)];
  return smooth(thigh(r[0], r[1], tw)) + legTube(r.slice(1), w);
};

// sauropod leg: a muscled thigh/upper arm blending into the body, a slight knee, a straight column and a
// broad foot with blunt nails; ambient occlusion where it meets the belly and at the ground
const sauroPts = (x: number, top: number, w: number): Pt[] => [
  [x - 0.7 * w, top + 0.4], [x + 0.64 * w, top + 0.4], [x + 0.6 * w, top * 0.74], [x + 0.5 * w, top * 0.52], [x + 0.53 * w, top * 0.45],
  [x + 0.42 * w, top * 0.26], [x + 0.46 * w, top * 0.09], [x + 0.64 * w, 0.04], [x + 0.68 * w, 0],
  [x - 0.6 * w, 0], [x - 0.55 * w, top * 0.07], [x - 0.42 * w, top * 0.2], [x - 0.43 * w, top * 0.46], [x - 0.56 * w, top * 0.72],
];
const SauroLeg: React.FC<{x: number; top: number; w: number; deg: number; piv: Pt; fill: string; far?: boolean}> = ({x, top, w, deg, piv, fill, far}) => {
  const pts = rotAbout(sauroPts(x, top, w), piv, deg), d = smooth(pts, true, 0.7);
  const foot = rotAbout([[x + 0.3 * w, 0.06], [x + 0.48 * w, 0.06], [x + 0.6 * w, 0.03]], piv, deg);
  return (
    <g>
      <path d={d} fill={fill} />
      <path d={d} fill="#000" filter="url(#texC)" opacity={0.25} />
      <path d={d} fill="url(#gLegAO)" />
      {far && <path d={d} fill="#1a1410" opacity={0.28} />}
      {!far && foot.map(([fx, fy], i) => <ellipse key={i} cx={fx} cy={-fy} rx={0.09 * w} ry={0.045 * w} fill="#D8CDB8" opacity={0.7} />)}
      {!far && [0.47, 0.5].map((k) => <Line key={k} pts={rotAbout([[x - 0.25 * w, top * k], [x + 0.05 * w, top * k + 0.06], [x + 0.35 * w, top * k]], piv, deg)} c="#2E2620" w={1} o={0.35} />)}
    </g>
  );
};
// theropod foot: three forward toes with dark claws, placed at the ankle
const TheroFoot: React.FC<{ax: number; ay: number; sc: number; fill: string}> = ({ax, ay, sc, fill}) => {
  const P = (pts: Pt[]) => pts.map(([x, y]) => [ax + x * sc, y * sc + (ay - ay)] as Pt);
  return (
    <g>
      <path d={smooth(P([[-0.18, 0.32], [0.14, 0.3], [0.5, 0.12], [0.86, 0.06], [0.92, 0.0], [0.42, 0.0], [0.1, 0.02], [-0.16, 0.08]]), true, 0.8)} fill={fill} />
      {[[0.92, 0.0], [0.74, 0.0], [0.6, 0.0]].map(([x, y], i) => <path key={i} d={poly(P([[x - 0.05 - i * 0.02, y + 0.06], [x + 0.1 - i * 0.04, y], [x - 0.06 - i * 0.02, y]]))} fill="#1E1812" />)}
      <Line pts={P([[0.3, 0.1], [0.62, 0.05]])} c="#1E1812" w={1} o={0.4} />
    </g>
  );
};
const REX_J: Pt[] = [[5.8, 3.4], [6.55, 1.85], [6.25, 1.05], [6.05, 0.4], [6.6, 0.12], [7.2, 0.04]];
const REX_W = [0.78, 0.44, 0.27, 0.22, 0.12];
export const TRex: React.FC<AnimalProps> = ({t, walk = 0}) => {
  const ph = t * 3.4, a = 13 * walk * Math.sin(ph);
  const bob = 0.06 * walk * Math.abs(Math.cos(ph)) + 0.02 * Math.sin(t * 1.3);
  const tail = (x: number) => (x < 5 ? 0.12 * Math.pow((5 - x) / 5, 2) * Math.sin(t * 1.6 - x * 0.5) : 0);
  const head = (x: number) => (x > 9.2 ? 0.05 * Math.sin(t * 1.1) * (x - 9.2) / 3 : 0);
  const mv = (p: Pt[]) => p.map(([x, y]) => [x, y + bob + tail(x) + head(x)] as Pt);
  const top = mv(REX_TOP), bot = mv(REX_BOT);
  const hip: Pt = [5.9, 3.2 + bob];
  const leg = (deg: number, fill: string, dx = 0) => {
    const j = REX_J.map(([x, y], i) => [x + dx, y + (i < 1 ? bob : 0)] as Pt);
    const a3 = rotAbout([j[3]], hip, deg * 0.6)[0];
    return (
      <g>
        <path d={dinoLeg(j.slice(0, 4).concat([[j[3][0] + 0.2, 0.2]]), hip, deg, 1.7, REX_W.slice(0, 4))} fill={fill} />
        <path d={dinoLeg(j.slice(0, 4).concat([[j[3][0] + 0.2, 0.2]]), hip, deg, 1.7, REX_W.slice(0, 4))} fill="#000" filter="url(#texM)" opacity={0.25} />
        <TheroFoot ax={a3[0] - 0.1} ay={0} sc={0.95} fill={fill} />
      </g>
    );
  };
  const stripes = [3.0, 3.8, 4.6, 5.4, 6.3, 7.2, 8.1].map((x) => (
    <path key={x} d={smooth([[x, yAt(top, x) + 0.02], [x + 0.35, yAt(top, x + 0.35) + 0.02], [x + 0.1, yAt(top, x) - 0.5]])} fill="#3E3028" opacity={0.3} />
  ));
  return (
    <g>
      {leg(-a, '#4A3A30', -0.25)}
      <path d={smooth(rotAbout([[9.25, 2.55 + bob], [9.5, 2.55 + bob], [9.75, 2.1 + bob], [9.95, 1.95 + bob], [9.85, 1.86 + bob], [9.55, 2.02 + bob], [9.3, 2.35 + bob]], [9.4, 2.5 + bob], -6))} fill="#4A3A30" />
      <Body d={smooth([...top, ...bot])} fill="url(#gRex)" top={top} tex="M" />
      {stripes}
      {/* jaw muscle and skull openings read as shading on the head */}
      <ellipse cx={10.75} cy={-(3.2 + bob)} rx={0.55} ry={0.32} fill="#2E241C" opacity={0.18} />
      <ellipse cx={11.55} cy={-(3.42 + bob)} rx={0.32} ry={0.14} fill="#2E241C" opacity={0.14} />
      <path d={smooth([[9.4, 3.1 + bob], [10.0, 3.0 + bob], [10.5, 2.75 + bob]], false)} fill="none" stroke="#2E241C" strokeOpacity={0.3} strokeWidth={1.2} {...NS} />
      {/* jaw line, teeth, eye ridge */}
      <Line pts={[[10.55, 2.9 + bob], [11.2, 3.0 + bob], [11.8, 3.12 + bob], [12.25, 3.2 + bob]]} c="#2A1E18" w={1.6} />
      {Array.from({length: 8}, (_, i) => 10.75 + i * 0.19).map((x) => (
        <path key={x} d={poly([[x, 2.92 + bob + (x - 10.6) * 0.17], [x + 0.05, 2.8 + bob + (x - 10.6) * 0.17], [x + 0.1, 2.93 + bob + (x - 10.6) * 0.17]])} fill="#F2E6CC" />
      ))}
      <path d={smooth([[10.8, 3.72 + bob], [11.2, 3.86 + bob], [11.45, 3.76 + bob]], false)} fill="none" stroke="#3E3028" strokeWidth={2} {...NS} />
      <Eye x={11.1} y={3.58 + bob} r={0.07} iris="#C98A2E" />
      <circle cx={12.1} cy={-(3.28 + bob)} r={0.04} fill="#2A1E18" />
      <path d={smooth(rotAbout([[9.3, 2.6 + bob], [9.55, 2.6 + bob], [9.8, 2.12 + bob], [10.0, 1.98 + bob], [9.9, 1.88 + bob], [9.6, 2.04 + bob], [9.35, 2.38 + bob]], [9.4, 2.55 + bob], 4))} fill="url(#gRexLeg)" />
      {leg(a, 'url(#gRexLeg)')}
    </g>
  );
};

// ------------------------------------------------------------------ Spinosaurus, about 14 m, wading
export const SPINO_L = 14;
export const Spino: React.FC<AnimalProps> = ({t, walk = 0}) => {
  const ph = t * 3.0, a = 11 * walk * Math.sin(ph);
  const bob = 0.05 * walk * Math.abs(Math.cos(ph)) + 0.025 * Math.sin(t * 1.2);
  const tail = (x: number) => (x < 6 ? 0.22 * Math.pow((6 - x) / 6, 2) * Math.sin(t * 2.0 - x * 0.7) : 0);
  const mv = (p: Pt[]) => p.map(([x, y]) => [x, y + bob + tail(x)] as Pt);
  const top = mv([[0, 2.2], [1.0, 2.75], [2.4, 3.05], [4.0, 3.2], [5.6, 3.28], [6.6, 3.45], [7.4, 4.5], [8.4, 5.05], [9.3, 4.85], [10.0, 4.0], [10.5, 3.5], [11.3, 3.62], [12.0, 3.78], [12.6, 3.56], [13.3, 3.18], [14.0, 3.0]]);
  const bot = mv([[14.0, 2.86], [13.2, 2.78], [12.4, 2.8], [11.7, 2.72], [11.0, 2.48], [10.2, 2.0], [9.0, 1.62], [7.6, 1.7], [6.3, 2.1], [5.0, 2.25], [3.2, 1.95], [1.6, 1.85], [0.4, 1.95]]);
  const sail = mv([[6.5, 3.3], [7.4, 4.42], [8.4, 4.96], [9.3, 4.78], [10.0, 3.95], [10.4, 3.45], [9.0, 3.2], [7.6, 3.15]]);
  const hip: Pt = [6.6, 2.3 + bob];
  const J: Pt[] = [[6.5, 2.5], [7.05, 1.35], [6.85, 0.8], [6.7, 0.35], [7.1, 0.1], [7.6, 0.03]];
  const leg = (deg: number, fill: string, dx = 0) => {
    const j = J.map(([x, y], i) => [x + dx, y + (i < 1 ? bob : 0)] as Pt);
    return <path d={dinoLeg(j, hip, deg, 1.3, [0.55, 0.38, 0.28, 0.24, 0.1])} fill={fill} />;
  };
  const tailFin = mv([[0.2, 2.1], [1.2, 2.9], [2.6, 3.4], [4.2, 3.45], [4.0, 3.15], [2.4, 3.0], [1.0, 2.6]]);
  return (
    <g>
      {leg(-a, '#3A342C', -0.3)}
      <path d={smooth(tailFin)} fill="#5A5044" />
      <Body d={smooth([...top, ...bot])} fill="url(#gSpino)" top={top} tex="M" />
      <path d={smooth(sail)} fill="url(#gSail)" opacity={0.85} />
      {Array.from({length: 11}, (_, i) => 6.9 + i * 0.32).map((x) => (
        <Line key={x} pts={[[x, 3.35 + bob], [x + 0.05, yAt(sail.slice(0, 6), x + 0.05) - 0.08]]} c="#5A3028" w={1} o={0.5} sm={false} />
      ))}
      <Line pts={[[11.9, 2.98 + bob], [12.8, 2.9 + bob], [13.95, 2.92 + bob]]} c="#2A241C" w={1.4} />
      <Eye x={12.05} y={3.48 + bob} r={0.07} iris="#B88A34" />
      <circle cx={12.9} cy={-(3.32 + bob)} r={0.035} fill="#2A241C" />
      <path d={smooth([[10.1, 2.05 + bob], [10.4, 2.05 + bob], [10.65, 1.5 + bob], [10.95, 1.3 + bob], [10.8, 1.2 + bob], [10.45, 1.42 + bob], [10.15, 1.8 + bob]])} fill="#6E6450" />
      {leg(a, 'url(#gRexLeg)')}
    </g>
  );
};

// ------------------------------------------------------------------ sharks: shared outline, fractions of length
const sharkSwim = (pts: Pt[], L: number, t: number, speed: number, amp: number): Pt[] =>
  pts.map(([x, y]) => {
    const u = x / L, w = Math.pow(Math.max(0, 1 - u / 0.55), 2);
    // a side-on shark's tail sweeps sideways: seen from the side the fin foreshortens and the body flexes a little
    const fs = u < 0.1 ? 1 - 0.18 * (0.5 + 0.5 * Math.sin(t * speed)) * (0.1 - u) / 0.1 : 1;
    return [L * 0.1 - (L * 0.1 - x) * fs, y + amp * L * w * Math.sin(t * speed - u * 5)];
  });

export const MEG_L = 16;
export const Megalodon: React.FC<AnimalProps> = ({t}) => {
  const L = MEG_L;
  const raw = sc([[0.0, 0.2], [0.05, 0.06], [0.09, 0.035], [0.2, 0.05], [0.25, 0.058], [0.27, 0.075], [0.3, 0.06], [0.44, 0.1], [0.475, 0.115], [0.535, 0.245], [0.56, 0.125], [0.66, 0.12], [0.8, 0.095], [0.9, 0.065], [0.96, 0.035], [1.0, 0.0],
    [0.985, -0.03], [0.94, -0.06], [0.88, -0.085], [0.78, -0.105], [0.66, -0.11], [0.55, -0.1], [0.42, -0.085], [0.38, -0.105], [0.355, -0.08], [0.27, -0.06], [0.23, -0.075], [0.2, -0.05], [0.1, -0.03], [0.065, -0.04], [0.025, -0.14], [0.055, 0.0]], L);
  const b = sharkSwim(raw, L, t, 2.4, 0.012);
  const d = smooth(b);
  const pec = sharkSwim(sc([[0.74, -0.075], [0.71, -0.1], [0.6, -0.23], [0.585, -0.225], [0.64, -0.1]], L), L, t, 2.4, 0.012);
  const yb = (u: number) => b.reduce((acc, p) => (Math.abs(p[0] - u * L) < Math.abs(acc[0] - u * L) ? p : acc))[1];
  return (
    <g>
      <clipPath id="megClip"><path d={d} /></clipPath>
      <path d={smooth(pec.map(([x, y]) => [x - 0.3, y + 0.15] as Pt))} fill="#2A343C" />
      <Body d={d} fill="url(#gMeg)" top={b.slice(0, 16)} sea tex="M" texO={0.25} />
      <g clipPath="url(#megClip)">
        {[0.775, 0.795, 0.815, 0.835, 0.855].map((u) => <Line key={u} pts={[[u * L, -0.01 * L], [u * L - 0.25, -0.06 * L]]} c="#2A343C" w={1.3} o={0.7} />)}
      </g>
      <Line pts={[[0.885 * L, -0.07 * L], [0.93 * L, -0.06 * L], [0.97 * L, -0.04 * L]]} c="#1E262C" w={1.6} />
      {Array.from({length: 7}, (_, i) => 0.895 + i * 0.011).map((u) => (
        <path key={u} d={poly([[u * L, -0.068 * L + (u - 0.89) * 0.2 * L], [u * L + 0.06, -0.08 * L + (u - 0.89) * 0.2 * L], [u * L + 0.12, -0.066 * L + (u - 0.89) * 0.2 * L]])} fill="#F2EEE2" />
      ))}
      <Eye x={0.925 * L} y={yb(0.925) - 0.04 * L} r={0.09} iris="#0E1216" />
      <Body d={smooth(pec)} fill="url(#gFinDark)" sea rimO={0.3} top={pec.slice(0, 3)} />
    </g>
  );
};

export const WS_L = 18.8;
export const WhaleShark: React.FC<AnimalProps> = ({t}) => {
  const L = WS_L;
  const raw = sc([[0.0, 0.19], [0.05, 0.05], [0.09, 0.035], [0.2, 0.05], [0.25, 0.055], [0.28, 0.09], [0.31, 0.06], [0.42, 0.08], [0.46, 0.09], [0.505, 0.165], [0.55, 0.1], [0.7, 0.1], [0.85, 0.085], [0.95, 0.06], [0.995, 0.025], [1.0, -0.01],
    [0.985, -0.035], [0.93, -0.06], [0.82, -0.085], [0.68, -0.095], [0.55, -0.09], [0.42, -0.075], [0.37, -0.085], [0.34, -0.065], [0.26, -0.05], [0.22, -0.06], [0.19, -0.04], [0.1, -0.025], [0.065, -0.03], [0.03, -0.12], [0.055, 0.0]], L);
  const b = sharkSwim(raw, L, t + 1.3, 1.6, 0.01);
  const d = smooth(b);
  const pec = sharkSwim(sc([[0.76, -0.07], [0.72, -0.09], [0.6, -0.2], [0.585, -0.19], [0.66, -0.09]], L), L, t + 1.3, 1.6, 0.01);
  const R = rng(66);
  const spots: React.ReactNode[] = [];
  for (let x = 0.08; x < 0.98; x += 0.022) for (let y = -0.03; y < 0.17; y += 0.022) {
    const jx = x + (R() - 0.5) * 0.008, jy = y + (R() - 0.5) * 0.008 + (Math.round(x / 0.022) % 2 ? 0.011 : 0);
    spots.push(<circle key={spots.length} cx={jx * L} cy={-jy * L} r={(0.0035 + R() * 0.002) * L * (x > 0.85 ? 0.7 : 1)} fill="#E8EEF0" opacity={0.75} />);
  }
  return (
    <g>
      <clipPath id="wsClip"><path d={d} /></clipPath>
      <path d={smooth(pec.map(([x, y]) => [x - 0.4, y + 0.2] as Pt))} fill="#1E2A36" />
      <Body d={d} fill="url(#gWs)" top={b.slice(0, 15)} sea tex="M" texO={0.3} />
      <g clipPath="url(#wsClip)">
        {spots}
        {[0.035, 0.06].map((y) => <Line key={y} pts={[[0.3 * L, y * L], [0.6 * L, (y + 0.02) * L], [0.9 * L, (y + 0.005) * L]]} c="#C8D4D8" w={1.2} o={0.45} />)}
        {[0.835, 0.85, 0.865, 0.88, 0.895].map((u) => <Line key={u} pts={[[u * L, 0.0], [u * L - 0.15, -0.05 * L]]} c="#1E2A36" w={1.3} o={0.6} />)}
        <path d={poly([[0.0, -0.06 * L], [L, -0.06 * L], [L, -0.2 * L], [0, -0.2 * L]])} fill="#000" opacity={0} />
      </g>
      <Line pts={[[0.965 * L, -0.03 * L], [0.99 * L, -0.02 * L], [L, -0.012 * L]]} c="#141C24" w={2} />
      <Eye x={0.955 * L} y={0.015 * L} r={0.07} iris="#0E1216" />
      <Body d={smooth(pec)} fill="url(#gFinDark)" sea rimO={0.3} top={pec.slice(0, 3)} />
    </g>
  );
};

// ------------------------------------------------------------------ blue whale, 29.9 m
export const WHALE_L = 29.9;
export const BlueWhale: React.FC<AnimalProps> = ({t}) => {
  const L = WHALE_L, ph = t * 1.5;
  // whales beat their flukes up and down, so the body wave is vertical
  const wv = (x: number) => 0.022 * L * Math.pow(Math.max(0, 1 - x / (0.6 * L)), 2.2) * Math.sin(ph - (x / L) * 4);
  const mv = (p: Pt[]) => p.map(([x, y]) => [x, y + wv(x)] as Pt);
  const top = mv(sc([[0.035, 0.012], [0.08, 0.022], [0.18, 0.038], [0.25, 0.048], [0.272, 0.068], [0.29, 0.056], [0.42, 0.064], [0.58, 0.072], [0.74, 0.072], [0.81, 0.074], [0.88, 0.058], [0.95, 0.034], [1.0, 0.006]], L));
  const bot = mv(sc([[1.0, -0.004], [0.98, -0.022], [0.93, -0.05], [0.85, -0.068], [0.74, -0.072], [0.6, -0.066], [0.45, -0.052], [0.3, -0.032], [0.16, -0.018], [0.06, -0.01]], L));
  const d = smooth([...top, ...bot]);
  // fluke: seen a little from above, so both blades show; it pitches with the beat
  const fa = 18 * Math.cos(ph);
  const piv: Pt = [0.045 * L, wv(0.045 * L)];
  const fluke = rotAbout(sc([[0.05, 0.004], [0.02, 0.05], [-0.005, 0.06], [0.0, 0.02], [0.012, 0.0], [0.0, -0.02], [-0.005, -0.06], [0.02, -0.05], [0.05, -0.004]], L), [0.045 * L, 0], fa).map(([x, y]) => [x, y + piv[1]] as Pt);
  const flip = mv(sc([[0.735, -0.05], [0.69, -0.075], [0.6, -0.105], [0.595, -0.098], [0.68, -0.058]], L));
  const R = rng(9);
  const mottle = Array.from({length: 140}, (_, i) => {
    const x = (0.08 + R() * 0.85) * L, y = (R() - 0.35) * 0.1 * L;
    return <ellipse key={i} cx={x} cy={-(y + wv(x))} rx={0.06 + R() * 0.18} ry={0.04 + R() * 0.1} fill={R() > 0.5 ? '#B7C6CF' : '#2E3E50'} opacity={0.35} />;
  });
  return (
    <g>
      <clipPath id="whClip"><path d={d} /></clipPath>
      <Body d={smooth(fluke)} fill="url(#gWhale)" sea rimO={0.35} />
      <Body d={d} fill="url(#gWhale)" top={top} sea tex="C" texO={0.35} />
      <g clipPath="url(#whClip)">
        {mottle}
        {Array.from({length: 12}, (_, i) => -0.028 - i * 0.004).map((y, i) => (
          <Line key={i} pts={[[0.62 * L, y * L + wv(0.62 * L)], [0.8 * L, (y - 0.004) * L], [0.97 * L, (y * 0.5) * L]]} c="#2A3846" w={1} o={0.45} />
        ))}
      </g>
      <Line pts={[[0.995 * L, -0.002 * L], [0.95 * L, -0.012 * L], [0.88 * L, -0.012 * L]]} c="#1E2A36" w={1.6} />
      <Eye x={0.875 * L} y={-0.005 * L} r={0.12} iris="#10161C" />
      <Body d={smooth(flip)} fill="url(#gWhale)" sea rimO={0.3} top={flip.slice(0, 3)} />
    </g>
  );
};

// ------------------------------------------------------------------ Argentinosaurus, about 35 m
export const ARGO_L = 35;
export const Argo: React.FC<AnimalProps> = ({t, walk = 0}) => {
  const ph = t * 1.9, a = 7 * walk * Math.sin(ph);
  const bob = 0.12 * walk * Math.abs(Math.cos(ph)) + 0.04 * Math.sin(t * 0.9);
  const neck = (x: number) => (x > 22 ? 0.25 * Math.sin(t * 0.7) * Math.pow((x - 22) / 13, 1.5) : 0);
  const tail = (x: number) => (x < 12 ? 0.35 * Math.pow((12 - x) / 12, 2) * Math.sin(t * 1.1 - x * 0.25) : 0);
  const mv = (p: Pt[]) => p.map(([x, y]) => [x, y + bob + neck(x) + tail(x)] as Pt);
  const top = mv([[0, 3.2], [3, 4.1], [6.5, 5.3], [10, 6.5], [13.5, 7.35], [16.5, 7.4], [19.5, 7.05], [21.5, 7.15], [23.5, 7.8], [26.5, 8.9], [29.5, 10.1], [32, 11.1], [33.4, 11.55], [34.3, 11.45], [35, 11.0]]);
  const bot = mv([[35, 10.6], [34.3, 10.45], [33.3, 10.4], [32.2, 10.0], [29.5, 8.7], [26.5, 7.4], [24, 6.2], [22.3, 4.6], [19.5, 3.6], [16.5, 3.55], [14, 3.95], [11.5, 4.6], [8.5, 4.6], [5, 3.75], [2, 3.15], [0.3, 3.05]]);
  const pil = (x: number, top: number, w: number): Pt[] => [[x - w * 0.62, top], [x + w * 0.62, top], [x + w * 0.5, top * 0.55], [x + w * 0.42, 0.45], [x + w * 0.6, 0], [x - w * 0.55, 0], [x - w * 0.42, 0.45], [x - w * 0.5, top * 0.55]];
  const leg = (x: number, top: number, w: number, deg: number, fill: string) => (
    <path d={smooth(rotAbout(pil(x, top, w).map(([px, py]) => [px, py > 1 ? py + bob : py] as Pt), [x, top - 0.5 + bob], deg), true, 0.6)} fill={fill} />
  );
  const R = rng(5);
  const folds = Array.from({length: 7}, (_, i) => 24.5 + i * 1.3).map((x) => <Line key={x} pts={[[x, yAt(bot, x) + 0.15], [x + 0.25, yAt(top, x + 0.25) - 0.2]]} c="#4A3E36" w={1} o={0.35} sm={false} />);
  const blot = Array.from({length: 40}, (_, i) => {
    const x = 4 + R() * 26, yt = yAt(top, x), yb = yAt(bot, x);
    return <ellipse key={i} cx={x} cy={-(yb + (yt - yb) * (0.45 + R() * 0.5))} rx={0.4 + R() * 0.8} ry={0.15 + R() * 0.25} fill="#4E4238" opacity={0.18} />;
  });
  return (
    <g>
      <clipPath id="argClip"><path d={smooth([...top, ...bot])} /></clipPath>
      <SauroLeg x={14.0} top={5.6 + bob} w={1.45} deg={-a} piv={[14.0, 5.1 + bob]} fill="#6A5C50" far />
      <SauroLeg x={20.9} top={5.4 + bob} w={1.25} deg={a} piv={[20.9, 4.9 + bob]} fill="#6A5C50" far />
      <Body d={smooth([...top, ...bot])} fill="url(#gArgo)" top={top} tex="C" texO={0.35} />
      <g clipPath="url(#argClip)">{blot}{folds}</g>
      <Line pts={[[33.6, 10.62 + bob + neck(33.6)], [34.4, 10.6 + bob + neck(34.4)], [34.95, 10.75 + bob + neck(35)]]} c="#2E2620" w={1.4} />
      <Eye x={33.9} y={11.15 + bob + neck(33.9)} r={0.11} iris="#2A2018" />
      <SauroLeg x={15.0} top={5.7 + bob} w={1.5} deg={a} piv={[15.0, 5.2 + bob]} fill="url(#gArgoLeg)" />
      <SauroLeg x={21.8} top={5.5 + bob} w={1.3} deg={-a} piv={[21.8, 5.0 + bob]} fill="url(#gArgoLeg)" />
    </g>
  );
};

// ------------------------------------------------------------------ lion's mane jellyfish, 36.6 m bell to tentacle tip
export const JELLY_L = 36.6;
export const Jelly: React.FC<AnimalProps & {strands?: number}> = ({t, strands = 46}) => {
  const L = JELLY_L, pulse = Math.sin(t * 2.4);
  const rimX = L - 2.1, bx = rimX, rx = 2.1 * (1 - 0.07 * pulse), ry = 1.15 * (1 + 0.07 * pulse);
  const bell: Pt[] = [];
  for (let i = 0; i <= 24; i++) {
    const a = -Math.PI / 2 + (i / 24) * Math.PI;
    bell.push([bx + Math.cos(a) * rx * (i % 2 ? 1 : 1), Math.sin(a) * ry * (1 + (Math.abs(Math.sin(a)) > 0.97 ? 0.05 : 0))]);
  }
  bell.push([bx - 0.12, ry * 0.95], [bx - 0.18, ry * 0.4], [bx - 0.12, 0], [bx - 0.18, -ry * 0.4], [bx - 0.12, -ry * 0.95]);
  const R = rng(12);
  const lines: React.ReactNode[] = [];
  for (let k = 0; k < strands; k++) {
    const y0 = (R() * 2 - 1) * ry * 0.92;
    const long = k < 3; // the record-length strands
    const end = long ? 0.0 + k * 0.4 : rimX - (3 + R() * R() * 26);
    const ph = R() * 6.28, lam = 3 + R() * 4, amp = 0.15 + R() * 0.35, sag = (R() - 0.3) * 0.9;
    const pts: Pt[] = [];
    const n = Math.max(6, Math.ceil((rimX - end) / 0.8));
    for (let i = 0; i <= n; i++) {
      const x = rimX - ((rimX - end) * i) / n, dd = rimX - x;
      const drift = 0.9 * fbm1(dd / 9 + t * 0.12, k) * Math.min(1, dd / 8);
      pts.push([x, y0 * (1 - Math.min(1, dd / 30) * 0.5) + Math.sin(dd / lam - t * 1.3 + ph) * amp * Math.min(1, dd / 4) + sag * Math.min(1, dd / 20) + drift]);
    }
    lines.push(<path key={k} d={smooth(pts, false)} fill="none" stroke={long ? '#FFC79E' : R() > 0.5 ? '#F2A57C' : '#E58A68'} strokeOpacity={long ? 0.95 : 0.5 + R() * 0.35} strokeWidth={long ? 2.6 : 1.4 + R() * 0.9} strokeLinecap="round" {...NS} />);
  }
  const arms: React.ReactNode[] = [];
  for (let k = 0; k < 4; k++) {
    const y0 = (k - 1.5) * 0.3, len = 3 + k * 0.7;
    const c: Pt[] = [], w: number[] = [];
    for (let i = 0; i <= 14; i++) {
      const dd = (len * i) / 14;
      c.push([rimX - 0.1 - dd, y0 + Math.sin(dd * 1.4 - t * 1.6 + k) * 0.18 * (dd / len)]);
      w.push(0.5 * (1 - i / 16) * (0.8 + 0.2 * Math.sin(i * 2.3 + k)));
    }
    arms.push(<path key={k} d={smooth(tube(c, w))} fill="#C9603F" opacity={0.55} />);
  }
  return (
    <g>
      {lines}
      {arms}
      <path d={smooth(bell)} fill="url(#gBell)" />
      {Array.from({length: 8}, (_, i) => -0.8 + (i / 7) * 1.6).map((f) => (
        <Line key={f} pts={[[bx - 0.05, f * ry * 0.9], [bx + rx * 0.5, f * ry * 0.75], [bx + rx * 0.92, f * ry * 0.3]]} c="#8C2E22" w={1.2} o={0.45} />
      ))}
      <path d={smooth(bell.slice(0, 25), false)} fill="none" stroke="#FFE6CC" strokeOpacity={0.6} strokeWidth={1.4} {...NS} />
    </g>
  );
};

// ------------------------------------------------------------------ human, 1.75 m, side view facing the animals
// Base centre at x = 0. Natural proportions (head about 1/7.5 of height), a face in profile, hair, a t-shirt,
// jeans and trainers, arm hanging relaxed with a slight bend; breathing and a small weight shift keep it alive.
export const HUMAN_H = 1.75;
export const Human: React.FC<AnimalProps> = ({t}) => {
  const br = 0.004 * Math.sin(t * 1.6), sw = 0.006 * fbm1(t * 0.3, 7);
  const up = (p: Pt[], k = 1): Pt[] => p.map(([x, y]) => [x + sw * (y / 1.75), y + br * k * Math.max(0, (y - 0.9) / 0.85)]);
  const hd = (p: Pt[]): Pt[] => p.map(([x, y]) => [x * 1.1, 1.52 + (y - 1.52) * 1.1 - 0.035]);
  const head = up(hd([[-0.098, 1.6], [-0.1, 1.67], [-0.07, 1.725], [-0.01, 1.752], [0.05, 1.74], [0.088, 1.705], [0.1, 1.668], [0.098, 1.648], [0.112, 1.63], [0.127, 1.607], [0.109, 1.596], [0.113, 1.581], [0.105, 1.572], [0.109, 1.558], [0.1, 1.538], [0.072, 1.522], [0.035, 1.524], [0.0, 1.535], [-0.045, 1.55], [-0.08, 1.567]]));
  const hair = up(hd([[-0.106, 1.585], [-0.108, 1.672], [-0.075, 1.735], [-0.012, 1.765], [0.052, 1.755], [0.094, 1.718], [0.101, 1.69], [0.07, 1.708], [0.03, 1.712], [-0.005, 1.7], [-0.03, 1.676], [-0.05, 1.63], [-0.07, 1.585]]));
  const neck = up([[-0.048, 1.56], [0.04, 1.53], [0.052, 1.43], [-0.06, 1.43]]);
  const shirt = up([[-0.112, 1.435], [-0.03, 1.455], [0.06, 1.448], [0.108, 1.4], [0.13, 1.3], [0.128, 1.18], [0.112, 1.06], [0.108, 0.95], [0.11, 0.9], [-0.105, 0.9], [-0.11, 0.98], [-0.125, 1.1], [-0.138, 1.25], [-0.14, 1.37]]);
  const leg = (dx: number, kneeF: number): Pt[] => [[-0.105 + dx, 0.96], [0.108 + dx, 0.96], [0.1 + dx, 0.8], [0.078 + dx + kneeF, 0.52], [0.062 + dx, 0.3], [0.052 + dx, 0.09], [-0.042 + dx, 0.09], [-0.052 + dx, 0.3], [-0.05 + dx + kneeF, 0.5], [-0.085 + dx, 0.76]];
  const shoe = (dx: number): Pt[] => [[-0.062 + dx, 0.0], [0.19 + dx, 0.0], [0.195 + dx, 0.03], [0.15 + dx, 0.068], [0.07 + dx, 0.095], [-0.05 + dx, 0.1], [-0.07 + dx, 0.05]];
  const arm = (dx: number): Pt[] => up([[-0.02 + dx, 1.4], [-0.025 + dx, 1.25], [-0.005 + dx, 1.1], [0.03 + dx, 0.95], [0.045 + dx, 0.86]]);
  return (
    <g>
      <defs>
        {lin('hSkin', [[0, '#F0C4A2'], [0.55, '#D19A7A'], [1, '#9A6650']], 'h')}
        {lin('hShirt', [[0, '#6F93A8'], [0.6, '#4C6E86'], [1, '#2E4458']], 'h')}
        {lin('hJeans', [[0, '#5A6C90'], [0.6, '#3E4E72'], [1, '#262F48']], 'h')}
        {lin('hHair', [[0, '#4A3428'], [1, '#1C1412']], 'v')}
      </defs>
      {/* far side */}
      <path d={smooth(leg(-0.035, -0.01))} fill="#2A3350" />
      <path d={smooth(shoe(-0.04))} fill="#9A9AA2" />
      <path d={smooth(tube(arm(-0.05), [0.095, 0.085, 0.075, 0.064, 0.055]))} fill="#8E5E4A" />
      {/* near side */}
      <path d={smooth(leg(0, 0.012))} fill="url(#hJeans)" />
      <Line pts={[[0.01, 0.95], [0.02, 0.6], [0.005, 0.12]]} c="#1E2538" w={1} o={0.5} />
      <path d={smooth(shoe(0))} fill="#ECE8E2" />
      <path d={poly([[-0.062, 0.0], [0.19, 0.0], [0.195, 0.02], [-0.066, 0.022]])} fill="#8A8690" />
      <path d={smooth(neck)} fill="url(#hSkin)" />
      <path d={smooth(shirt)} fill="url(#hShirt)" />
      <path d={smooth(shirt)} fill="url(#gForm)" opacity={0.6} />
      <path d={smooth(head)} fill="url(#hSkin)" />
      <path d={smooth(hair)} fill="url(#hHair)" />
      <ellipse cx={-0.02} cy={-(1.62 + br)} rx={0.021} ry={0.033} fill="#C48A6C" />
      <path d={smooth(up(hd([[-0.022, 1.645], [-0.012, 1.63], [-0.02, 1.612]])), false)} fill="none" stroke="#8A5440" strokeWidth={1} {...NS} />
      {/* eye, brow, mouth */}
      <ellipse cx={0.091 + sw} cy={-(1.638 + br)} rx={0.009} ry={0.006} fill="#2A1C16" />
      <path d={smooth(up(hd([[0.066, 1.666], [0.085, 1.672], [0.1, 1.666]])), false)} fill="none" stroke="#3A2820" strokeWidth={1.4} {...NS} />
      <path d={smooth(up(hd([[0.09, 1.572], [0.105, 1.574]])), false)} fill="none" stroke="#8A4E40" strokeWidth={1} {...NS} />
      {/* sleeve and near arm */}
      <path d={smooth(tube(arm(0), [0.1, 0.09, 0.08, 0.068, 0.058]))} fill="#CC9474" />
      <path d={smooth(tube(arm(0), [0.1, 0.09, 0.08, 0.068, 0.058]))} fill="url(#gForm)" />
      <path d={smooth(up([[-0.075, 1.43], [0.04, 1.42], [0.045, 1.26], [-0.065, 1.24]]))} fill="url(#hShirt)" />
      <ellipse cx={0.05 + sw} cy={-(0.815 + br * 0.1)} rx={0.036} ry={0.062} fill="#BE8466" />
      <path d={smooth(shirt.slice(0, 6), false)} fill="none" stroke="#FFD6A8" strokeOpacity={0.45} strokeWidth={1.4} {...NS} />
    </g>
  );
};


// ------------------------------------------------------------------ Komodo dragon, about 3 m, standing
export const KOMO_L = 3;
export const Komodo: React.FC<AnimalProps> = ({t}) => {
  const tail = (x: number) => (x < 1.3 ? 0.04 * Math.pow((1.3 - x) / 1.3, 2) * Math.sin(t * 1.8 - x * 2) : 0);
  const br = 0.006 * Math.sin(t * 1.4);
  const mv = (p: Pt[]) => p.map(([x, y]) => [x, y + tail(x) + (x > 1.5 ? br : 0)] as Pt);
  const top = mv([[0, 0.05], [0.6, 0.15], [1.2, 0.3], [1.6, 0.42], [1.8, 0.46], [2.2, 0.47], [2.45, 0.43], [2.6, 0.41], [2.78, 0.4], [2.92, 0.36], [3.0, 0.3]]);
  const bot = mv([[3.0, 0.27], [2.86, 0.23], [2.66, 0.24], [2.46, 0.27], [2.26, 0.22], [1.95, 0.19], [1.6, 0.23], [1.2, 0.17], [0.6, 0.07], [0.1, 0.03]]);
  const hind: Pt[] = [[1.5, 0.34], [1.78, 0.34], [1.84, 0.18], [1.93, 0.04], [2.04, 0.0], [1.72, 0.0], [1.6, 0.14]];
  const fore: Pt[] = [[2.14, 0.31], [2.36, 0.31], [2.42, 0.15], [2.5, 0.03], [2.6, 0.0], [2.3, 0.0], [2.2, 0.13]];
  const flick = Math.max(0, Math.sin(t * 2.3)) ** 6;
  return (
    <g>
      <path d={smooth(hind.map(([x, y]) => [x - 0.08, y] as Pt))} fill="#3E382E" />
      <path d={smooth(fore.map(([x, y]) => [x - 0.08, y] as Pt))} fill="#3E382E" />
      <Body d={smooth([...top, ...bot])} fill="url(#gKomo)" top={top} tex="F" texO={0.4} />
      {Array.from({length: 18}, (_, i) => 0.3 + i * 0.14).map((x) => <circle key={x} cx={x} cy={-(yAt(top, x) - 0.06)} r={0.012} fill="#3A342A" opacity={0.4} />)}
      <Line pts={[[2.62, 0.3 + br], [2.85, 0.29 + br], [2.99, 0.29 + br]]} c="#2A241C" w={1.2} />
      {flick > 0.05 && <Line pts={[[2.99, 0.28 + br], [3.0 + 0.14 * flick, 0.28 + br], [3.06 + 0.12 * flick, 0.3 + br]]} c="#E8C24A" w={1.6} sm={false} />}
      <Eye x={2.8} y={0.36 + br} r={0.016} iris="#3A2A18" />
      <path d={smooth(hind)} fill="url(#gKomo)" />
      <path d={smooth(fore)} fill="url(#gKomo)" />
    </g>
  );
};

// ------------------------------------------------------------------ Diplodocus, about 25 m, whip tail and level neck
export const DIPLO_L = 25;
export const Diplo: React.FC<AnimalProps> = ({t}) => {
  const bob = 0.03 * Math.sin(t * 0.9);
  const neck = (x: number) => (x > 15 ? 0.2 * Math.sin(t * 0.6) * Math.pow((x - 15) / 10, 1.5) : 0);
  const tail = (x: number) => (x < 9 ? 0.3 * Math.pow((9 - x) / 9, 2) * Math.sin(t * 1.2 - x * 0.35) : 0);
  const mv = (p: Pt[]) => p.map(([x, y]) => [x, y + bob + neck(x) + tail(x)] as Pt);
  const top = mv([[0, 2.6], [2, 2.85], [5, 3.55], [8, 4.55], [10.5, 5.25], [12, 5.55], [14, 5.4], [15.5, 5.05], [17, 5.3], [20, 5.8], [23, 6.1], [24.2, 6.18], [24.75, 6.02], [25, 5.82]]);
  const bot = mv([[25, 5.6], [24.4, 5.52], [23, 5.58], [20, 5.18], [17, 4.5], [15.6, 3.75], [13.5, 3.35], [11.5, 3.5], [9.5, 4.0], [7, 3.7], [4, 3.0], [1.5, 2.55], [0.2, 2.55]]);
  const pil = (x: number, tp: number, w: number): Pt[] => [[x - w * 0.62, tp], [x + w * 0.62, tp], [x + w * 0.5, tp * 0.55], [x + w * 0.42, 0.4], [x + w * 0.6, 0], [x - w * 0.55, 0], [x - w * 0.42, 0.4], [x - w * 0.5, tp * 0.55]];
  const leg = (x: number, tp: number, w: number, fill: string) => <path d={smooth(pil(x, tp + bob, w), true, 0.6)} fill={fill} />;
  return (
    <g>
      <SauroLeg x={11.2} top={4.2 + bob} w={0.95} deg={0} piv={[11.2, 4 + bob]} fill="#6C6A58" far />
      <SauroLeg x={15.0} top={4.0 + bob} w={0.85} deg={0} piv={[15, 3.8 + bob]} fill="#6C6A58" far />
      <Body d={smooth([...top, ...bot])} fill="url(#gDiplo)" top={top} tex="C" texO={0.35} />
      {Array.from({length: 9}, (_, i) => 16.5 + i * 0.9).map((x) => <Line key={x} pts={[[x, yAt(bot, x) + 0.1], [x + 0.2, yAt(top, x + 0.2) - 0.12]]} c="#4A4636" w={1} o={0.3} sm={false} />)}
      <Line pts={[[24.3, 5.68 + bob + neck(24.3)], [24.95, 5.72 + bob + neck(25)]]} c="#2E2A20" w={1.3} />
      <Eye x={24.45} y={5.95 + bob + neck(24.45)} r={0.08} iris="#2A2018" />
      <SauroLeg x={11.9} top={4.3 + bob} w={1.0} deg={0} piv={[11.9, 4 + bob]} fill="url(#gArgoLeg)" />
      <SauroLeg x={15.6} top={4.1 + bob} w={0.9} deg={0} piv={[15.6, 3.8 + bob]} fill="url(#gArgoLeg)" />
    </g>
  );
};
