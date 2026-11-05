import React from 'react';
import {V, closedPath} from './geom';

// Brazilian free-tailed bat, seen from the side and a little above, so both wings show.
// Model units are metres: body ~9 cm, wingspan ~30 cm (narrow, pointed wings for fast flight).
export const BAT_FLAP = 7.5; // wingbeats per second shown (and heard)

type P3 = [number, number, number];
const ELEV = 0.5; // camera looks down a little
const proj = (p: P3): V => [p[0] + p[2] * 0.22, p[1] * Math.cos(ELEV) - p[2] * Math.sin(ELEV)];

// wing outline in the wing plane: (x along the body, span outward)
const WING: [number, number][] = [[0.02, 0.0], [0.034, 0.04], [0.016, 0.085], [-0.01, 0.13], [-0.042, 0.175], [-0.03, 0.135], [-0.052, 0.105], [-0.045, 0.078], [-0.062, 0.045], [-0.05, 0.0]];
const BONES: [number, number][][] = [[[0.02, 0.0], [0.034, 0.04], [0.016, 0.085], [-0.042, 0.175]], [[0.016, 0.085], [-0.052, 0.105]], [[0.016, 0.085], [-0.062, 0.045]]];

export const Bat: React.FC<{t: number; x: number; y: number; s: number; id: string; groundY: number}> = ({t, x, y, s, id, groundY}) => {
  const ph = t * BAT_FLAP * Math.PI * 2;
  const theta = 0.15 + 0.85 * Math.sin(ph); // wing elevation, + is up
  const fold = 0.82 + 0.18 * Math.sin(ph + 1.2); // wings partly fold on the upstroke
  const bob = -Math.sin(ph) * 0.006;
  const sc = (p: P3): [number, number] => { const q = proj(p); return [x + q[0] * s, y - (q[1] + bob) * s]; };
  const wing = (side: 1 | -1, pts: [number, number][]) => pts.map(([wx, sp]): P3 => {
    const span = sp * fold;
    return [wx - span * 0.05, span * Math.sin(theta), side * span * Math.cos(theta)];
  });
  const far = wing(-1, WING).map(sc), near = wing(1, WING).map(sc);
  const body: V[] = [[0.05, 0.004], [0.04, 0.012], [0.015, 0.014], [-0.02, 0.012], [-0.045, 0.006], [-0.05, -0.002], [-0.03, -0.011], [0.0, -0.013], [0.03, -0.01], [0.048, -0.004]];
  const bodyS = body.map(([bx, by]) => sc([bx, by, 0]));
  const head: V[] = [[0.042, 0.01], [0.046, 0.03], [0.055, 0.013], [0.068, 0.007], [0.074, 0.0], [0.063, -0.007], [0.048, -0.007]];
  const tail: V[] = [[-0.045, 0.002], [-0.075, -0.004], [-0.074, -0.007], [-0.045, -0.004]];
  const flat = (pts: V[]) => pts.map(([bx, by]) => sc([bx, by, 0]));
  const bones = (side: 1 | -1) => BONES.map((b, i) => {
    const pts = wing(side, b).map(sc);
    return <polyline key={side + '_' + i} points={pts.map((p) => p.join(',')).join(' ')} fill="none" stroke="#1a0f0d" strokeWidth={Math.max(1, s * 0.0025)} strokeLinecap="round" opacity={0.7} />;
  });
  const lift = groundY - y;
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-mem`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5a3c33" /><stop offset="1" stopColor="#2a1a17" />
        </linearGradient>
        <filter id={`${id}-sh`}><feGaussianBlur stdDeviation={18} /></filter>
      </defs>
      {/* soft shadow far below on the ground */}
      <ellipse cx={x + lift * 0.6} cy={groundY + 18} rx={s * 0.09} ry={s * 0.012} fill="#120c10" opacity={0.35} filter={`url(#${id}-sh)`} />
      <g transform="translate(-2.2,-1.6)" fill="#ffc28f">
        <path d={closedPath(far, 0.08)} /><path d={closedPath(bodyS)} /><path d={closedPath(flat(head))} /><path d={closedPath(near, 0.08)} />
      </g>
      <path d={closedPath(far, 0.08)} fill="#22140f" opacity={0.92} />
      {bones(-1)}
      <path d={closedPath(flat(tail))} fill="#2a1a15" />
      <path d={closedPath(bodyS)} fill="#4a3027" />
      <path d={closedPath(flat(head))} fill="#3b2620" />
      {(() => { const e = sc([0.06, 0.006, 0.004]); return <circle cx={e[0]} cy={e[1]} r={Math.max(1.2, s * 0.0022)} fill="#080404" />; })()}
      <path d={closedPath(near, 0.08)} fill={`url(#${id}-mem)`} opacity={0.95} />
      {bones(1)}
    </g>
  );
};
