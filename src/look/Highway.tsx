import React from 'react';
import {rng} from '../engine/noise';

// Dusk horizon look, desert-highway version: violet-to-peach sky, low sun, mesas, telephone poles,
// a two-lane road seen side-on, scrub and gravel that streak with speed.
export const HZ = 1060; // horizon
export const GROUND = 1300; // reference plane (depth 1)
export const ROAD = {far: 1222, mid: 1309, near: 1394}; // road edges and lane divider
const W = 1440, X0 = -360;

const wrap = (x: number, w: number) => ((x % w) + w) % w;
const depth = (y: number) => (y - HZ) / (GROUND - HZ);

const DEFS = (
  <defs>
    <linearGradient id="hwSky" gradientUnits="userSpaceOnUse" x1="0" y1="-10" x2="0" y2="1070">
      <stop offset="0" stopColor="#2F2C44" />
      <stop offset="0.3" stopColor="#5A4A68" />
      <stop offset="0.48" stopColor="#A3757E" />
      <stop offset="0.56" stopColor="#E0A584" />
      <stop offset="0.6" stopColor="#F2C29A" />
    </linearGradient>
    <radialGradient id="hwSun" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stopColor="#FFE2B8" stopOpacity="0.85" />
      <stop offset="0.25" stopColor="#FFC58E" stopOpacity="0.35" />
      <stop offset="1" stopColor="#FFB070" stopOpacity="0" />
    </radialGradient>
    <linearGradient id="hwGround" x1="0" y1={HZ} x2="0" y2="1920" gradientUnits="userSpaceOnUse">
      <stop offset="0" stopColor="#A47A62" />
      <stop offset="0.12" stopColor="#865F48" />
      <stop offset="0.3" stopColor="#664634" />
      <stop offset="1" stopColor="#24170F" />
    </linearGradient>
    <linearGradient id="hwRoad" x1="0" y1={ROAD.far} x2="0" y2={ROAD.near} gradientUnits="userSpaceOnUse">
      <stop offset="0" stopColor="#5d4a4c" />
      <stop offset="0.45" stopColor="#3e3236" />
      <stop offset="1" stopColor="#2a2226" />
    </linearGradient>
    <linearGradient id="hwSheen" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stopColor="#ffcf9e" stopOpacity="0.28" />
      <stop offset="0.35" stopColor="#ffcf9e" stopOpacity="0.06" />
      <stop offset="1" stopColor="#ffcf9e" stopOpacity="0" />
    </linearGradient>
    <linearGradient id="hwHaze" x1="0" y1={HZ - 60} x2="0" y2={HZ + 80} gradientUnits="userSpaceOnUse">
      <stop offset="0" stopColor="#F2C29A" stopOpacity="0" />
      <stop offset="0.5" stopColor="#F2C29A" stopOpacity="0.35" />
      <stop offset="1" stopColor="#F2C29A" stopOpacity="0" />
    </linearGradient>
  </defs>
);

// flat-topped mesa or butte with a talus slope
const mesa = (x: number, w: number, h: number, seed: number) => {
  const R = rng(seed);
  const cap = w * (0.45 + R() * 0.3), y = HZ + 1;
  const l = x - w / 2, r = x + w / 2, cl = x - cap / 2 + (R() - 0.5) * w * 0.1, cr = cl + cap;
  return `M${l},${y} C${l + w * 0.12},${y - h * 0.25} ${cl - w * 0.06},${y - h * 0.55} ${cl},${y - h * 0.72} L${cl + w * 0.02},${y - h} L${cr - w * 0.02},${y - h * (0.97 + R() * 0.05)} L${cr},${y - h * 0.7} C${cr + w * 0.08},${y - h * 0.5} ${r - w * 0.1},${y - h * 0.2} ${r},${y}Z`;
};

// camX: camera position (m). s: px per metre at depth 1. v: camera speed (m/s).
export const Highway: React.FC<{camX: number; s: number; v: number; fps: number}> = ({camX, s, v, fps}) => {
  const perFrame = (v * s) / fps;
  const blur = (d: number) => Math.min(1100, perFrame * d * 0.85); // motion-smear length at depth d

  let ridge = `M${X0 - 40},${HZ}`;
  const rOff = wrap(camX * s * 0.004, 1600);
  for (let x = X0 - 40; x <= W + 40; x += 20) {
    const wx = x + rOff;
    const h = 22 * Math.max(0, Math.sin(wx / 300) * Math.sin(wx / 111 + 1)) + 8 * Math.sin(wx / 61) ** 2 + 5;
    ridge += ` L${x},${HZ - h}`;
  }
  ridge += ` L${W + 40},${HZ + 2} L${X0 - 40},${HZ + 2}Z`;

  const mesas = (seed: number, n: number, par: number, hMin: number, hMax: number, fill: string, tile: number) => {
    const M = rng(seed);
    const items = Array.from({length: n}, () => ({x: M() * tile, h: hMin + M() * (hMax - hMin), w: 0, seed: Math.floor(M() * 1e6)})).map((m) => ({...m, w: m.h * (2.2 + rng(m.seed)() * 3)}));
    const off = wrap(camX * s * par, tile);
    return <g fill={fill}>{items.flatMap((m, i) => [0, -tile, tile].map((k) => {
      const x = m.x - off + k;
      if (x < X0 - m.w || x > W + m.w) return null;
      return <path key={i + '_' + k} d={mesa(x, m.w, m.h, m.seed)} />;
    }))}</g>;
  };

  // telephone poles along the far side of the road
  const poleY = HZ + 26, pd = depth(poleY), gap = 55 * s * pd, ph = 10 * s * pd;
  const pOff = wrap(camX * s * pd, gap);
  const poles = Array.from({length: Math.ceil((W - X0) / gap) + 3}, (_, i) => X0 - gap + i * gap - pOff);
  const pTrail = blur(pd);
  const sag = ph * 0.05;

  // scrub rows above and below the road
  const rowsAbove = Array.from({length: 7}, (_, i) => HZ + 8 + Math.pow(i / 6, 1.5) * (ROAD.far - 8 - HZ - 8));
  const rowsBelow = Array.from({length: 9}, (_, i) => ROAD.near + 14 + Math.pow(i / 8, 1.4) * (1980 - ROAD.near));
  const scrub = (y: number, ri: number, dense: number, size = 1) => {
    const d = depth(y), tile = 1500, off = wrap(camX * s * d, tile), G = rng(300 + ri), trail = blur(d);
    const n = Math.round((8 + 18 * Math.min(1.4, d)) * dense);
    const items = Array.from({length: n}, () => ({x: G() * tile, h: (6 + G() * 14) * d * size, w: (10 + G() * 22) * d * size, dy: (G() - 0.5) * 14 * d, c: G(), rock: G() < 0.3}));
    const pebbles = Array.from({length: 5}, () => ({x: G() * tile, w: (30 + G() * 120) * d, dy: (G() - 0.5) * 10 * d}));
    return (
      <g key={'r' + ri}>
        {pebbles.flatMap((p, i) => [0, -tile, tile].map((k) => {
          const x = p.x - off + k;
          if (x < X0 - p.w - trail - 200 || x > W + p.w + 200) return null;
          return <ellipse key={`p${i}${k}`} cx={x + trail / 2} cy={y + p.dy} rx={p.w + trail / 2} ry={p.w * 0.05 + 1} fill="#2a1c15" opacity={0.13} />;
        }))}
        {items.flatMap((p, i) => [0, -tile, tile].map((k) => {
          const x = p.x - off + k;
          if (x < X0 - 60 - trail || x > W + 60) return null;
          const by = y + p.dy;
          const c = p.rock ? (p.c > 0.5 ? '#7a5f52' : '#5a4339') : p.c > 0.6 ? '#8f8064' : p.c > 0.3 ? '#6e6249' : '#544634';
          if (trail > p.w * 0.6) {
            const len = trail + p.w;
            return <rect key={`t${i}${k}`} x={x - p.w / 2} y={by - p.h * 0.7} width={len} height={p.h * 0.7} rx={p.h * 0.35} fill={c} opacity={Math.max(0.08, 0.45 * p.w / len)} />;
          }
          if (p.rock) return <path key={`t${i}${k}`} d={`M${x - p.w / 2},${by} Q${x - p.w * 0.35},${by - p.h * 0.7} ${x},${by - p.h * 0.75} Q${x + p.w * 0.4},${by - p.h * 0.6} ${x + p.w / 2},${by}Z`} fill={c} />;
          // sagebrush: a rounded clump of small leaves
          return <g key={`t${i}${k}`} fill={c} opacity={0.9}>
            <ellipse cx={x} cy={by - p.h * 0.45} rx={p.w * 0.5} ry={p.h * 0.5} />
            <ellipse cx={x - p.w * 0.25} cy={by - p.h * 0.7} rx={p.w * 0.25} ry={p.h * 0.32} />
            <ellipse cx={x + p.w * 0.2} cy={by - p.h * 0.75} rx={p.w * 0.28} ry={p.h * 0.3} />
          </g>;
        }))}
      </g>
    );
  };

  // lane markings: dashes 3 m long every 12 m on the divider, solid edge lines
  const dd = depth(ROAD.mid), dPer = 12 * s * dd, dLen = 3 * s * dd, dOff = wrap(camX * s * dd, dPer), dTrail = blur(dd);
  const dashes = Array.from({length: Math.ceil((W - X0) / dPer) + 3}, (_, i) => X0 - dPer + i * dPer - dOff);

  // asphalt texture: patches and tar seams in three depth bands
  const asphalt = [ROAD.far + 20, ROAD.mid - 22, ROAD.mid + 26, ROAD.near - 16].map((y, bi) => {
    const d = depth(y), tile = 1300, off = wrap(camX * s * d, tile), A = rng(900 + bi), trail = blur(d);
    const items = Array.from({length: 7}, () => ({x: A() * tile, w: (40 + A() * 180) * d, h: (2 + A() * 5) * d, dy: (A() - 0.5) * 22 * d, dark: A() < 0.6}));
    return <g key={'a' + bi}>{items.flatMap((p, i) => [0, -tile, tile].map((k) => {
      const x = p.x - off + k;
      if (x < X0 - p.w - trail - 50 || x > W + p.w + 50) return null;
      return <rect key={`${i}_${k}`} x={x} y={y + p.dy} width={p.w + trail} height={p.h} rx={p.h / 2} fill={p.dark ? '#1d1619' : '#6e5a58'} opacity={p.dark ? 0.35 : 0.18} />;
    }))}</g>;
  });

  return (
    <g>
      {DEFS}
      <rect x={X0} y={-400} width={W - X0} height={HZ + 410} fill="url(#hwSky)" />
      <circle cx={190} cy={HZ - 34} r={420} fill="url(#hwSun)" />
      <circle cx={190} cy={HZ - 34} r={44} fill="#FFE6C2" opacity={0.95} />
      <path d={ridge} fill="#8A6A78" opacity={0.6} />
      {mesas(4, 6, 0.008, 40, 90, '#76596A', 2600)}
      {mesas(9, 5, 0.018, 24, 54, '#634A5A', 2300)}
      <rect x={X0} y={HZ} width={W - X0} height={1920 - HZ + 300} fill="url(#hwGround)" />
      <rect x={X0} y={HZ - 60} width={W - X0} height={140} fill="url(#hwHaze)" />
      {rowsAbove.map((y, i) => scrub(y, i, 0.8))}
      {/* telephone poles and wires */}
      <g opacity={0.85 * Math.max(0, 1 - pTrail / 30)}>
        {poles.map((x, i) => <g key={i}>
          {pTrail < gap * 0.6 && <path d={`M${x},${poleY - ph * 0.92} Q${x + gap / 2},${poleY - ph * 0.92 + sag} ${x + gap},${poleY - ph * 0.92} M${x},${poleY - ph * 0.82} Q${x + gap / 2},${poleY - ph * 0.82 + sag} ${x + gap},${poleY - ph * 0.82}`} fill="none" stroke="#3b2c34" strokeWidth={1} opacity={0.7} />}
          <rect x={x - 1.6} y={poleY - ph} width={3.2 + pTrail} height={ph} fill="#3b2c34" opacity={Math.max(0.15, 3.2 / (3.2 + pTrail))} />
          <rect x={x - ph * 0.12} y={poleY - ph * 0.94} width={ph * 0.24 + pTrail} height={2.2} fill="#3b2c34" opacity={Math.max(0.15, 3.2 / (3.2 + pTrail))} />
        </g>)}
      </g>
      {/* gravel shoulder, road, markings */}
      <rect x={X0} y={ROAD.far - 10} width={W - X0} height={10} fill="#7a604e" />
      <rect x={X0} y={ROAD.far} width={W - X0} height={ROAD.near - ROAD.far} fill="url(#hwRoad)" />
      <rect x={X0} y={ROAD.far} width={900} height={ROAD.near - ROAD.far} fill="url(#hwSheen)" />
      {asphalt}
      <rect x={X0} y={ROAD.far + 3} width={W - X0} height={3} fill="#e8dccb" opacity={0.75} />
      <rect x={X0} y={ROAD.near - 7} width={W - X0} height={5} fill="#e8dccb" opacity={0.8} />
      {dashes.map((x, i) => <rect key={i} x={x} y={ROAD.mid - 2} width={dLen + dTrail} height={4.5} fill="#efe3cf" opacity={0.85 * Math.max(0.55, dLen / (dLen + dTrail))} />)}
      <rect x={X0} y={ROAD.near} width={W - X0} height={14} fill="#6a503f" />
      {rowsBelow.map((y, i) => scrub(y, 20 + i, 0.55, 0.6))}
    </g>
  );
};
