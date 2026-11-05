import React from 'react';
import '@fontsource/inter/300.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/ibm-plex-mono/500.css';
import {rng} from '../engine/noise';
import {Item} from '../engine/types';
import {fmtSize} from '../engine/format';

export const FLOOR = 1260;
export const CREAM = '#F4E9DC', MUTE = '#C9B8B0', ACC = '#F2B48A';

const ridge = (seed: number, y: number, amp: number, len = 2600) => {
  const R = rng(seed);
  let d = `M0,1920 L0,${y}`;
  let a = 0;
  for (let x = 0; x <= len; x += 40) { a += (R() - 0.5) * amp * 0.5; a *= 0.85; d += ` L${x},${(y + a + Math.sin(x / 210 + seed) * amp * 0.6).toFixed(1)}`; }
  return d + ` L${len},1920Z`;
};

export const DuskDefs: React.FC = () => (
  <defs>
    <linearGradient id="duSky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#3E3A52" />
      <stop offset="0.35" stopColor="#6A5872" />
      <stop offset="0.58" stopColor="#B98482" />
      <stop offset="0.66" stopColor="#E3AE8E" />
    </linearGradient>
    <linearGradient id="duGround" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#4A3A47" />
      <stop offset="1" stopColor="#231C26" />
    </linearGradient>
    <radialGradient id="duSun" cx="0.18" cy="0.64" r="0.5">
      <stop offset="0" stopColor="#FFD9AE" stopOpacity="0.55" />
      <stop offset="1" stopColor="#FFD9AE" stopOpacity="0" />
    </radialGradient>
    <linearGradient id="duCast" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stopColor="#140F16" stopOpacity="0.6" />
      <stop offset="1" stopColor="#140F16" stopOpacity="0" />
    </linearGradient>
    <radialGradient id="duPool">
      <stop offset="0" stopColor="#fff" stopOpacity="1" />
      <stop offset="1" stopColor="#fff" stopOpacity="0" />
    </radialGradient>
  </defs>
);

export const DuskBackground: React.FC<{drift: number}> = ({drift}) => {
  const R = rng(4);
  const stars = Array.from({length: 40}, () => ({x: R() * 1080, y: R() * 640, s: 0.8 + R() * 1.6, o: 0.2 + R() * 0.5}));
  const layer = (seed: number, y: number, amp: number, fill: string, depth: number) => {
    const ox = -((((drift + 1) * 300 * depth) % 1400) + 1400) % 1400;
    return <path d={ridge(seed, y, amp)} fill={fill} transform={`translate(${ox},0)`} />;
  };
  return (
    <g>
      <rect width={1080} height={1920} fill="url(#duSky)" />
      <rect width={1080} height={1920} fill="url(#duSun)" />
      {stars.map((s, i) => <circle key={i} cx={s.x} cy={s.y} r={s.s} fill="#FFF3E6" opacity={s.o * 0.7} />)}
      {layer(3, 1150, 60, '#9A7380', 0.15)}
      {layer(7, 1200, 45, '#7A5A6A', 0.3)}
      {layer(11, 1240, 25, '#5A4352', 0.55)}
      <rect y={FLOOR - 4} width={1080} height={1920 - FLOOR + 4} fill="url(#duGround)" />
    </g>
  );
};

// What an object does to the ground: a long cast shadow, or a pool of its own light.
export const DuskGround: React.FC<{item: Item; x: number; r: number; y: number}> = ({item, x, r, y}) => {
  const gap = y + r - FLOOR; // <0 when hovering above the ground
  if (item.glow) return null;
  const lift = Math.max(0, -gap - 2);
  const k = Math.max(0.15, 1 - lift / (r * 3));
  return (
    <g opacity={k}>
      <path d={`M${x - r * 0.7},${FLOOR} Q${x + r * 1.2},${FLOOR - r * 0.12} ${x + r * 3.4},${FLOOR + r * 0.05} Q${x + r * 1.2},${FLOOR + r * 0.22} ${x - r * 0.7},${FLOOR}Z`} fill="url(#duCast)" />
      <ellipse cx={x} cy={FLOOR} rx={r * 0.85} ry={Math.max(r * 0.07, 1)} fill="#120D14" opacity={0.6} />
    </g>
  );
};

export const GroundGlow: React.FC<{item: Item; x: number; r: number}> = ({item, x, r}) => {
  if (!item.glow) return null;
  const w = Math.max(r * item.ext * 1.5, 6);
  return (
    <g style={{mixBlendMode: 'screen'}}>
      <defs>
        <radialGradient id={`gg${item.name.replace(/\W/g, '')}`}>
          <stop offset="0" stopColor={item.glow} stopOpacity="0.55" />
          <stop offset="1" stopColor={item.glow} stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx={x} cy={FLOOR + 10} rx={w} ry={Math.max(w * 0.14, 3)} fill={`url(#gg${item.name.replace(/\W/g, '')})`} />
    </g>
  );
};

export const DuskLabel: React.FC<{item: Item; x: number; opacity: number; highlight: boolean}> = ({item, x: x0, opacity, highlight}) => {
  const y = FLOOR + 40;
  const half = Math.max(item.kindLabel.length * 7.6, item.name.length * 13, 110) + 24;
  const x = Math.min(Math.max(x0, half), 1080 - half);
  return (
    <g opacity={opacity}>
      <text x={x} y={y + 40} textAnchor="middle" fontFamily="Inter" fontWeight={500} fontSize={19} letterSpacing={3} fill={MUTE}>{item.kindLabel.toUpperCase()}</text>
      <text x={x} y={y + 90} textAnchor="middle" fontFamily="Inter" fontWeight={600} fontSize={item.name.length > 12 ? 40 : 46} fill={CREAM}>{item.name}</text>
      <text x={x} y={y + 130} textAnchor="middle" fontFamily="IBM Plex Mono" fontWeight={500} fontSize={28} fill={highlight ? ACC : MUTE}>{fmtSize(item.km)}</text>
      {item.note && <text x={x} y={y + 164} textAnchor="middle" fontFamily="Inter" fontWeight={500} fontSize={20} fill={MUTE}>{item.note}</text>}
    </g>
  );
};

export const DuskMultiplier: React.FC<{value: string; opacity: number}> = ({value, opacity}) => (
  <g opacity={opacity}>
    <text x={540} y={360} textAnchor="middle" fontFamily="Inter" fontWeight={300} fontSize={150} fill={CREAM} letterSpacing={-4}>{value}<tspan fill={ACC}>×</tspan></text>
    <text x={540} y={430} textAnchor="middle" fontFamily="Inter" fontWeight={500} fontSize={22} letterSpacing={5} fill={MUTE}>WIDER</text>
  </g>
);

export const DuskTitle: React.FC<{lines: [string, string]; opacity: number}> = ({lines, opacity}) => (
  <g opacity={opacity}>
    <text x={540} y={340} textAnchor="middle" fontFamily="Inter" fontWeight={300} fontSize={72} fill={CREAM}>{lines[0]}</text>
    <text x={540} y={428} textAnchor="middle" fontFamily="Inter" fontWeight={600} fontSize={72} fill={CREAM}>{lines[1]}</text>
  </g>
);

export const DuskScaleBar: React.FC<{len: number; text: string}> = ({len, text}) => (
  <g opacity={0.85}>
    <text x={540} y={1748} textAnchor="middle" fontFamily="IBM Plex Mono" fontWeight={500} fontSize={24} fill={CREAM}>{text}</text>
    <line x1={540 - len / 2} x2={540 + len / 2} y1={1770} y2={1770} stroke={CREAM} strokeWidth={2} />
    <line x1={540 - len / 2} x2={540 - len / 2} y1={1760} y2={1780} stroke={CREAM} strokeWidth={2} />
    <line x1={540 + len / 2} x2={540 + len / 2} y1={1760} y2={1780} stroke={CREAM} strokeWidth={2} />
  </g>
);
