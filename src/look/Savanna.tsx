import React from 'react';
import {rng} from '../engine/noise';
import {V, closedPath} from '../creatures/geom';

export const HZ = 1060; // horizon
export const GROUND = 1300; // the plane the animals run on
const W = 1080;

const wrap = (x: number, w: number) => ((x % w) + w) % w;

// Flat-topped acacia: thin forked trunk and a wide, layered canopy.
const acacia = (x: number, y: number, h: number, seed: number, fill: string) => {
  const R = rng(seed);
  const cw = h * (1.3 + R() * 0.7), ch = h * 0.22, top = y - h;
  const pts: V[] = [];
  const n = 14;
  for (let i = 0; i <= n; i++) { // top edge, bumpy
    const u = i / n;
    pts.push([x - cw / 2 + u * cw, top - ch * (0.35 + 0.65 * Math.sin(Math.PI * u)) * (0.8 + R() * 0.3)]);
  }
  for (let i = n; i >= 0; i--) { // ragged underside
    const u = i / n;
    pts.push([x - cw / 2 + u * cw, top + ch * 0.25 * Math.sin(Math.PI * u) + (R() - 0.5) * ch * 0.35]);
  }
  const lean = (R() - 0.5) * h * 0.2;
  const trunk = `M${x - h * 0.03},${y} L${x + lean - h * 0.012},${top + ch * 0.1} L${x + lean + h * 0.012},${top + ch * 0.1} L${x + h * 0.03},${y}Z` +
    `M${x + lean * 0.5},${y - h * 0.45} L${x - cw * 0.28},${top + ch * 0.15} L${x - cw * 0.26},${top + ch * 0.2} L${x + lean * 0.5 + h * 0.02},${y - h * 0.4}Z` +
    `M${x + lean * 0.6},${y - h * 0.55} L${x + cw * 0.3},${top + ch * 0.15} L${x + cw * 0.28},${top + ch * 0.22} L${x + lean * 0.6 - h * 0.02},${y - h * 0.5}Z`;
  return <g fill={fill}><path d={trunk} /><path d={closedPath(pts)} /></g>;
};

const SKY = (
  <defs>
    <linearGradient id="svSky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#2F2C44" />
      <stop offset="0.3" stopColor="#5A4A68" />
      <stop offset="0.48" stopColor="#A3757E" />
      <stop offset="0.56" stopColor="#E0A584" />
      <stop offset="0.6" stopColor="#F2C29A" />
    </linearGradient>
    <radialGradient id="svSun" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stopColor="#FFE2B8" stopOpacity="0.85" />
      <stop offset="0.25" stopColor="#FFC58E" stopOpacity="0.35" />
      <stop offset="1" stopColor="#FFB070" stopOpacity="0" />
    </radialGradient>
    <linearGradient id="svGround" x1="0" y1={HZ} x2="0" y2="1920" gradientUnits="userSpaceOnUse">
      <stop offset="0" stopColor="#9A7460" />
      <stop offset="0.12" stopColor="#7A5843" />
      <stop offset="0.3" stopColor="#5E4232" />
      <stop offset="1" stopColor="#21160F" />
    </linearGradient>
    <linearGradient id="svHaze" x1="0" y1={HZ - 60} x2="0" y2={HZ + 80} gradientUnits="userSpaceOnUse">
      <stop offset="0" stopColor="#F2C29A" stopOpacity="0" />
      <stop offset="0.5" stopColor="#F2C29A" stopOpacity="0.35" />
      <stop offset="1" stopColor="#F2C29A" stopOpacity="0" />
    </linearGradient>
  </defs>
);

// camX: camera position in metres. s: pixels per metre on the running plane. v: camera speed (m/s).
export const Savanna: React.FC<{camX: number; s: number; v: number; fps: number; lift?: number}> = ({camX, s, v, fps, lift = 0}) => {
  const perFrame = (v * s) / fps;
  const R = rng(21);
  // distant ridge
  let ridge = `M0,${HZ}`;
  const rOff = wrap(camX * s * 0.006, 1600);
  for (let x = -40; x <= W + 40; x += 20) {
    const wx = x + rOff;
    const h = 26 * Math.max(0, Math.sin(wx / 260) * Math.sin(wx / 97 + 1)) + 10 * Math.sin(wx / 53) ** 2 + 6;
    ridge += ` L${x},${HZ - h}`;
  }
  ridge += ` L${W + 40},${HZ + 2} L-40,${HZ + 2}Z`;

  const treeLayer = (seed: number, n: number, depth: number, yMin: number, yMax: number, hMin: number, hMax: number, fill: string, tile: number) => {
    const T = rng(seed);
    const items = Array.from({length: n}, () => ({x: T() * tile, y: yMin + T() * (yMax - yMin), h: hMin + T() * (hMax - hMin), seed: Math.floor(T() * 1e6)}));
    const off = wrap(camX * s * depth, tile);
    return (
      <g>
        {items.flatMap((it, i) => [0, -tile, tile].map((k) => {
          const x = it.x - off + k;
          if (x < -it.h * 2 || x > W + it.h * 2) return null;
          return <g key={i + '_' + k}>{acacia(x, it.y, it.h, it.seed, fill)}</g>;
        }))}
      </g>
    );
  };

  // grass rows on the ground plane: depth grows linearly below the horizon
  const rows = Array.from({length: 18}, (_, i) => HZ + 8 + Math.pow(i / 17, 1.7) * (1920 - HZ + 40));
  return (
    <g transform={lift ? `translate(0,${lift})` : undefined}>
      {SKY}
      <rect x={0} y={-lift - 10} width={W} height={HZ + lift + 20} fill="url(#svSky)" />
      <circle cx={190} cy={HZ - 34} r={420} fill="url(#svSun)" />
      <circle cx={190} cy={HZ - 34} r={44} fill="#FFE6C2" opacity={0.95} />
      <path d={ridge} fill="#7A6070" opacity={0.75} />
      {treeLayer(5, 9, 0.025, HZ - 1, HZ + 3, 10, 18, '#5E4A58', 2400)}
      <rect x={0} y={HZ} width={W} height={1920 - HZ + 10} fill="url(#svGround)" />
      <rect x={0} y={HZ - 60} width={W} height={140} fill="url(#svHaze)" />
      {treeLayer(8, 6, 0.09, HZ + 10, HZ + 24, 40, 70, '#4A3842', 2600)}
      {rows.map((y, ri) => {
        const d = (y - HZ) / (GROUND - HZ);
        const tile = 1400;
        const off = wrap(camX * s * d, tile);
        const G = rng(100 + ri);
        const trail = Math.min(900, perFrame * d * 0.8); // motion smear length
        const n = Math.round(12 + 26 * Math.min(1, d));
        const tufts = Array.from({length: n}, () => ({x: G() * tile, h: (5 + G() * 11) * d, w: (6 + G() * 12) * d, dy: (G() - 0.5) * 16 * d, light: G()}));
        const soil = Array.from({length: 4}, () => ({x: G() * tile, w: (40 + G() * 140) * d, dy: (G() - 0.5) * 12 * d}));
        return (
          <g key={ri} opacity={y > GROUND + 120 ? 0.55 : 1}>
            {soil.flatMap((p, i) => [0, -tile, tile].map((k) => {
              const x = p.x - off + k;
              if (x < -p.w - 200 - trail || x > W + p.w + 200) return null;
              return <ellipse key={`s${i}${k}`} cx={x + trail / 2} cy={y + p.dy} rx={p.w + trail / 2} ry={p.w * 0.06 + 1} fill="#2a1c15" opacity={0.22} />;
            }))}
            {tufts.flatMap((p, i) => [0, -tile, tile].map((k) => {
              const x = p.x - off + k;
              if (x < -60 - trail || x > W + 60) return null;
              const by = y + p.dy;
              const c = p.light > 0.55 ? '#D7A676' : p.light > 0.25 ? '#A57A58' : '#6E4E3A';
              if (trail > p.w * 0.8) {
                // seen at speed, a tuft is a streak: brighter head, fading tail
                const len = trail + p.w;
                return <g key={`t${i}${k}`}>
                  <rect x={x - p.w / 2} y={by - p.h * 0.75} width={len} height={p.h * 0.75} rx={p.h * 0.35} fill={c} opacity={Math.max(0.12, 0.6 * p.w / len)} />
                  <rect x={x - p.w / 2} y={by - p.h * 0.55} width={len * 0.35} height={p.h * 0.5} rx={p.h * 0.25} fill={c} opacity={0.25} />
                </g>;
              }
              return <path key={`t${i}${k}`} d={`M${x - p.w / 2},${by} Q${x - p.w * 0.3},${by - p.h * 0.6} ${x - p.w * 0.45},${by - p.h} L${x - p.w * 0.1},${by - p.h * 0.35} L${x + p.w * 0.05},${by - p.h * 1.15} L${x + p.w * 0.2},${by - p.h * 0.4} L${x + p.w * 0.55},${by - p.h * 0.9} Q${x + p.w * 0.4},${by - p.h * 0.3} ${x + p.w / 2},${by}Z`} fill={c} opacity={0.8} />;
            }))}
          </g>
        );
      })}
    </g>
  );
};
