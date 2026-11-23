import React from 'react';
import {fbm1, rng} from '../engine/noise';

// Short 08 stand-ins. Each anime character is an original glowing streak: a bright head at (0, 0) moving
// right with a trail behind it (towards -x). Colours and effects only hint at the character (lightning,
// sparks, a red ribbon, a gold beam); there is no face, costume, logo or outline from any show.
// len is the trail length in px, t is seconds.

export type StreakKind = 'thunder' | 'fist' | 'jet' | 'ribbon' | 'sparks' | 'comet' | 'aura' | 'light' | 'silver';
type P = {t: number; len: number; seed?: number};

export const StreakDefs: React.FC = () => (
  <defs>
    <filter id="kGlow" x="-50%" y="-200%" width="200%" height="500%"><feGaussianBlur stdDeviation="10" /></filter>
    <filter id="kGlowS" x="-50%" y="-200%" width="200%" height="500%"><feGaussianBlur stdDeviation="3.5" /></filter>
    <filter id="kGlowL" x="-50%" y="-300%" width="200%" height="700%"><feGaussianBlur stdDeviation="26" /></filter>
    {([
      ['kYel', '#FFF6B0', '#FFD23C'], ['kRed', '#FFD6C8', '#E2452E'], ['kSil', '#FFFFFF', '#B8C8E0'], ['kBlu', '#E8FBFF', '#5CC8FF'],
      ['kWhi', '#FFFFFF', '#FFE9B8'], ['kOra', '#FFF2C0', '#FF9A2E'], ['kGold', '#FFFDF0', '#FFC94A'], ['kUI', '#FFFFFF', '#C8D4FF'],
    ] as [string, string, string][]).map(([id, a, b]) => (
      <linearGradient key={id} id={id} x1="1" y1="0" x2="0" y2="0">
        <stop offset="0" stopColor={a} stopOpacity="1" /><stop offset="0.25" stopColor={b} stopOpacity="0.85" /><stop offset="1" stopColor={b} stopOpacity="0" />
      </linearGradient>
    ))}
  </defs>
);

// a tapered trail: thick at the head, a thin point at the tail
const trail = (len: number, w: number, wob = 0, t = 0, seed = 0) => {
  const n = 14, top: string[] = [], bot: string[] = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n, x = -len * u, hw = (w / 2) * Math.pow(1 - u, 0.7), y = wob * fbm1(t * 2 + u * 3, seed) * u;
    top.push(`${x.toFixed(1)},${(y - hw).toFixed(1)}`);
    bot.unshift(`${x.toFixed(1)},${(y + hw).toFixed(1)}`);
  }
  return `M${top.join(' L')} L${bot.join(' L')}Z`;
};
const Head: React.FC<{r: number; c: string; glow: string}> = ({r, c, glow}) => (
  <g>
    <circle r={r * 3.2} fill={glow} opacity={0.35} filter="url(#kGlow)" />
    <ellipse rx={r * 1.4} ry={r} fill={c} filter="url(#kGlowS)" />
    <ellipse rx={r * 0.9} ry={r * 0.6} fill="#FFFFFF" />
  </g>
);
// a jagged bolt from (x0, y0) to (x1, y1)
const bolt = (x0: number, y0: number, x1: number, y1: number, R: () => number, amp: number, n = 8) => {
  let d = `M${x0},${y0}`;
  for (let i = 1; i < n; i++) {
    const u = i / n;
    d += ` L${(x0 + (x1 - x0) * u).toFixed(1)},${(y0 + (y1 - y0) * u + (R() - 0.5) * amp).toFixed(1)}`;
  }
  return d + ` L${x1},${y1}`;
};

// Zenitsu: a yellow lightning dash, zig-zag bolts along the trail, a few sparks
const Thunder: React.FC<P> = ({t, len, seed = 1}) => {
  const R = rng(seed + Math.floor(t * 12));
  return (
    <g>
      <path d={trail(len, 56)} fill="url(#kYel)" opacity={0.55} filter="url(#kGlow)" />
      {[0, 1, 2].map((i) => <path key={i} d={bolt(0, 0, -len * (0.6 + 0.4 * R()), (R() - 0.5) * 30, R, 46, 9)} stroke={i ? '#FFE27A' : '#FFFFFF'} strokeWidth={i ? 3 : 5} fill="none" strokeLinejoin="bevel" opacity={i ? 0.7 : 1} filter={i ? undefined : 'url(#kGlowS)'} />)}
      {Array.from({length: 10}, (_, i) => <circle key={i} cx={-R() * len * 0.8} cy={(R() - 0.5) * 70} r={1.5 + R() * 2.5} fill="#FFF3A0" />)}
      <Head r={16} c="#FFE04A" glow="#FFD23C" />
    </g>
  );
};
// Rocket Punch: a red-hot projectile with a flame exhaust
const Fist: React.FC<P> = ({t, len}) => {
  const fl = 1 + 0.15 * Math.sin(t * 40);
  return (
    <g>
      <path d={trail(len, 46)} fill="url(#kRed)" opacity={0.6} filter="url(#kGlow)" />
      <path d={`M-30,-14 L${-120 * fl},0 L-30,14Z`} fill="#FFB060" filter="url(#kGlowS)" />
      <path d={`M-30,-7 L${-70 * fl},0 L-30,7Z`} fill="#FFF4D0" />
      <rect x={-36} y={-22} width={56} height={44} rx={18} fill="#B8433A" />
      <rect x={-36} y={-22} width={56} height={22} rx={14} fill="#E06A5A" opacity={0.6} />
      <circle cx={10} r={30} fill="#FF7A50" opacity={0.25} filter="url(#kGlow)" />
    </g>
  );
};
// Jet Scrander: a red-and-silver swept-wing chevron with twin exhausts
const Jet: React.FC<P> = ({t, len}) => {
  const fl = 1 + 0.12 * Math.sin(t * 50);
  return (
    <g>
      <path d={trail(len, 70)} fill="url(#kSil)" opacity={0.45} filter="url(#kGlow)" />
      {[-12, 12].map((y) => <path key={y} d={`M-40,${y - 5} L${-150 * fl},${y} L-40,${y + 5}Z`} fill="#9FD8FF" filter="url(#kGlowS)" />)}
      <path d="M30,0 L-40,-46 L-24,-6 L-48,0 L-24,6 L-40,46Z" fill="#C93A30" />
      <path d="M30,0 L-40,-46 L-24,-6Z" fill="#E8EEF2" opacity={0.85} />
      <circle cx={10} r={34} fill="#FFFFFF" opacity={0.2} filter="url(#kGlow)" />
    </g>
  );
};
// 002: a white rocket streak trailing a long red ribbon
const Ribbon: React.FC<P> = ({t, len}) => {
  let d = 'M-4,-6';
  const pts: string[] = [];
  for (let i = 0; i <= 16; i++) {
    const u = i / 16, x = -u * len * 0.75, y = 14 * Math.sin(u * 9 - t * 18) * u;
    pts.push(`${x.toFixed(1)},${(y - 7 * (1 - u * 0.6)).toFixed(1)}`);
  }
  const back: string[] = [];
  for (let i = 16; i >= 0; i--) {
    const u = i / 16, x = -u * len * 0.75, y = 14 * Math.sin(u * 9 - t * 18) * u;
    back.push(`${x.toFixed(1)},${(y + 7 * (1 - u * 0.6)).toFixed(1)}`);
  }
  d = `M${pts.join(' L')} L${back.join(' L')}Z`;
  return (
    <g>
      <path d={trail(len, 40)} fill="url(#kSil)" opacity={0.5} filter="url(#kGlow)" />
      <path d={d} fill="#D8262E" />
      <path d={`M-10,18 L-90,26 L-10,32Z`} fill="#FFC070" filter="url(#kGlowS)" />
      <Head r={14} c="#F4F8FF" glow="#C8D8FF" />
    </g>
  );
};
// Killua: a blue-white core wrapped in crackling electric arcs
const Sparks: React.FC<P> = ({t, len, seed = 3}) => {
  const R = rng(seed + Math.floor(t * 15));
  return (
    <g>
      <path d={trail(len, 80)} fill="url(#kBlu)" opacity={0.6} filter="url(#kGlow)" />
      {Array.from({length: 7}, (_, i) => {
        const a = R() * Math.PI * 2, r = 30 + R() * 50;
        return <path key={i} d={bolt(0, 0, Math.cos(a) * r - R() * 60, Math.sin(a) * r, R, 22, 5)} stroke="#DDF6FF" strokeWidth={2.4} fill="none" opacity={0.9} />;
      })}
      {[0, 1].map((i) => <path key={i} d={bolt(0, 0, -len * 0.9, (R() - 0.5) * 40, R, 36, 10)} stroke="#8FE0FF" strokeWidth={3} fill="none" opacity={0.8} filter="url(#kGlowS)" />)}
      <Head r={17} c="#BEEFFF" glow="#5CC8FF" />
    </g>
  );
};
// Saitama: a plain white-hot comet with shockwave rings
const Comet: React.FC<P> = ({t, len}) => (
  <g>
    <path d={trail(len, 90)} fill="url(#kWhi)" opacity={0.7} filter="url(#kGlow)" />
    <path d={trail(len * 0.8, 26)} fill="url(#kWhi)" />
    {[0, 1, 2].map((i) => {
      const u = (t * 2.4 + i / 3) % 1;
      return <ellipse key={i} cx={-u * len * 0.5} rx={18 + u * 30} ry={40 + u * 120} fill="none" stroke="#FFFFFF" strokeWidth={3 * (1 - u)} opacity={0.7 * (1 - u)} />;
    })}
    <Head r={20} c="#FFF6DA" glow="#FFE9B8" />
  </g>
);
// Goku: an orange-gold flame aura streak
const Aura: React.FC<P> = ({t, len, seed = 5}) => {
  const R = rng(seed);
  return (
    <g>
      <path d={trail(len, 110, 18, t, 4)} fill="url(#kOra)" opacity={0.65} filter="url(#kGlow)" />
      {Array.from({length: 9}, (_, i) => {
        const ph = R(), y = (R() - 0.5) * 60, ln = 60 + R() * 90;
        const x = -((t * 3 + ph) % 1) * len * 0.6;
        return <path key={i} d={`M${x},${y - 8} Q${x - ln / 2},${y - 22} ${x - ln},${y} Q${x - ln / 2},${y + 10} ${x},${y + 8}Z`} fill="#FFD27A" opacity={0.55} />;
      })}
      <Head r={20} c="#FFE7A0" glow="#FF9A2E" />
    </g>
  );
};
// Kizaru: a beam of gold light across everything, with a soft flare at the head
const Light: React.FC<P> = ({t, len}) => (
  <g>
    <rect x={-len} y={-70} width={len} height={140} fill="url(#kGold)" opacity={0.5} filter="url(#kGlowL)" />
    <rect x={-len} y={-10} width={len} height={20} fill="url(#kGold)" />
    <rect x={-len} y={-3} width={len} height={6} fill="#FFFFFF" />
    <circle r={120} fill="#FFE9A0" opacity={0.35 + 0.05 * Math.sin(t * 9)} filter="url(#kGlowL)" />
    <path d="M-260,0 L260,0 M0,-160 L0,160" stroke="#FFF8E0" strokeWidth={3} opacity={0.6} filter="url(#kGlowS)" />
    <circle r={26} fill="#FFFFFF" />
  </g>
);
// End-card tease: a flickering silver-white streak
const Silver: React.FC<P> = ({t, len}) => {
  const on = Math.sin(t * 31) > -0.3 ? 1 : 0.25;
  return (
    <g opacity={on}>
      <path d={trail(len, 70)} fill="url(#kUI)" opacity={0.7} filter="url(#kGlow)" />
      <path d={trail(len * 0.9, 16)} fill="url(#kUI)" />
      <Head r={18} c="#F2F4FF" glow="#C8D4FF" />
    </g>
  );
};

export const Streak: React.FC<P & {kind: StreakKind}> = ({kind, ...p}) => {
  switch (kind) {
    case 'thunder': return <Thunder {...p} />;
    case 'fist': return <Fist {...p} />;
    case 'jet': return <Jet {...p} />;
    case 'ribbon': return <Ribbon {...p} />;
    case 'sparks': return <Sparks {...p} />;
    case 'comet': return <Comet {...p} />;
    case 'aura': return <Aura {...p} />;
    case 'light': return <Light {...p} />;
    case 'silver': return <Silver {...p} />;
  }
};
