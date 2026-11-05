import React from 'react';
import {V, add, capsule, closedPath, rot, strip, sub} from './geom';
import {Limb, Pose, Shape, Spec, solve} from './rig';

type Props = {
  spec: Spec; t: number; x: number; g: number; s: number; id: string;
  opacity?: number; shadow?: number; rim?: number; flip?: boolean;
};

const ellipsePts = (c: V, rx: number, ry: number, n = 14, ang = 0): V[] =>
  Array.from({length: n}, (_, i) => add(c, rot([Math.cos((i / n) * Math.PI * 2) * rx, Math.sin((i / n) * Math.PI * 2) * ry], ang)));

const footLocal = (L: Limb): V[] => {
  const H = L.footH, W = L.footW, Lf = L.footL;
  switch (L.foot) {
    case 'hoof': return [[-0.32 * W, H], [0.22 * W, H], [0.62 * W, 0.0], [-0.5 * W, 0.0]];
    case 'pad': return [[-0.5 * W, H], [0.5 * W, H], [0.58 * W, 0.02], [0.45 * W, 0], [-0.5 * W, 0], [-0.58 * W, 0.02]];
    case 'shoe': return [[-0.22 * Lf, H], [0.25 * Lf, H * 0.95], [0.75 * Lf, H * 0.35], [0.88 * Lf, 0.08 * H], [0.8 * Lf, 0], [-0.2 * Lf, 0], [-0.26 * Lf, H * 0.4]];
    case 'paw': return [[-0.25 * Lf, H], [0.3 * Lf, H * 0.9], [0.75 * Lf, H * 0.45], [0.85 * Lf, 0.12 * H], [0.6 * Lf, 0], [-0.15 * Lf, 0], [-0.3 * Lf, H * 0.4]];
    default: return ellipsePts([0, -Lf * 0.35], W * 0.5, Lf * 0.5, 10);
  }
};

export const Creature: React.FC<Props> = ({spec: S, t, x, g, s, id, opacity = 1, shadow = 0.55, rim = 2.6, flip = false}) => {
  const P: Pose = solve(S, t);
  const sc = (q: V): V => [x + (flip ? -1 : 1) * q[0] * s, g - q[1] * s];
  const torsoD = closedPath(P.torso.map(sc));
  const headD = closedPath(P.head.map(sc));

  const limbPaths = (side: 'near' | 'far') => P.limbs.filter((l) => l.limb.side === side).map((l) => {
    const L = l.limb;
    const ds: string[] = [];
    const up = sub(l.pivot, l.joint), ul = Math.hypot(up[0], up[1]) || 1;
    const top = add(l.pivot, [up[0] / ul * 0.14, up[1] / ul * 0.14]);
    const m1: V = [(l.pivot[0] + l.joint[0]) / 2, (l.pivot[1] + l.joint[1]) / 2];
    const m2: V = [(l.joint[0] + l.ankle[0]) / 2, (l.joint[1] + l.ankle[1]) / 2];
    ds.push(strip([top, l.pivot, m1, l.joint, m2, l.ankle].map(sc),
      [L.wa[0] * 1.05, L.wa[0], (L.wa[0] * 0.45 + L.wa[1] * 0.55), Math.max(L.wa[1], L.wb[0]) * 1.08, L.wb[0] * 0.92, L.wb[1]].map((w) => w * s)));
    if (L.swing) {
      ds.push(closedPath(footLocal(L).map((q) => sc(add(l.ankle, rot(q, l.footAng))))));
    } else {
      const contact = sub(l.ankle, rot([-L.footL * 0.15, L.footH], l.footAng));
      ds.push(closedPath(footLocal(L).map((q) => sc(add(contact, rot(q, l.footAng)))), L.foot === 'hoof' || L.foot === 'pad' ? 0.04 : 1 / 6));
    }
    return {L, ds};
  });
  const far = limbPaths('far'), near = limbPaths('near');
  const tailD = P.tail && S.tail ? strip(P.tail.map(sc), S.tail.ws.map((w) => w * s)) : null;
  const trunkD = P.trunk && S.trunk ? strip(P.trunk.map(sc), S.trunk.ws.map((w) => w * s)) : null;

  const shapeD = (sh: Shape) => {
    const m = sh.frame === 'torso' ? P.torsoMap : P.headMap;
    const pts = sh.pts.map((q) => sc(m(q)));
    if (sh.open) {
      let d = `M${pts[0][0]},${pts[0][1]}`;
      for (let i = 1; i < pts.length; i++) d += ` L${pts[i][0].toFixed(1)},${pts[i][1].toFixed(1)}`;
      return d;
    }
    return closedPath(pts);
  };
  const shapes = (layer: 'under' | 'over') => (S.shapes ?? []).filter((sh) => (sh.layer ?? 'under') === layer).map((sh, i) => (
    <path key={layer + i} d={shapeD(sh)} fill={sh.open ? 'none' : sh.fill} stroke={sh.open ? sh.fill : undefined}
      strokeWidth={sh.open ? (sh.stroke ?? 0.02) * s : undefined} strokeLinecap="round" opacity={sh.opacity ?? 1}
      clipPath={sh.clip ? `url(#${id}-${sh.frame}clip)` : undefined} filter={sh.soft ? `url(#${id}-soft)` : undefined} />
  ));

  const top = g - S.height * s;
  const body = `url(#${id}-body)`, limbFill = `url(#${id}-limb)`;
  const silhouette = (fill: string) => (
    <g fill={fill}>
      {far.map((l, i) => l.ds.map((d, k) => <path key={`f${i}${k}`} d={d} />))}
      {tailD && <path d={tailD} />}
      <path d={torsoD} /><path d={headD} />
      {trunkD && <path d={trunkD} />}
      {near.map((l, i) => l.ds.map((d, k) => <path key={`n${i}${k}`} d={d} />))}
    </g>
  );
  // the low sun sits behind-left, so shadows fall forward and toward the camera
  const k = 0.9, sy = 0.16;
  return (
    <g opacity={opacity}>
      <defs>
        <linearGradient id={`${id}-body`} gradientUnits="userSpaceOnUse" x1={0} y1={top} x2={0} y2={g}>
          <stop offset="0" stopColor={S.colors.top} />
          <stop offset="0.5" stopColor={S.colors.mid} />
          <stop offset="1" stopColor={S.colors.bottom} />
        </linearGradient>
        <linearGradient id={`${id}-limb`} gradientUnits="userSpaceOnUse" x1={0} y1={top} x2={0} y2={g}>
          <stop offset="0.3" stopColor={S.colors.limb ?? S.colors.mid} />
          <stop offset="1" stopColor={S.colors.bottom} />
        </linearGradient>
        <clipPath id={`${id}-torsoclip`}><path d={torsoD} /></clipPath>
        <clipPath id={`${id}-headclip`}><path d={headD} /></clipPath>
        <clipPath id={`${id}-bodyclip`}><path d={torsoD} /><path d={headD} /></clipPath>
        <filter id={`${id}-soft`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation={s * 0.035} /></filter>
        <filter id={`${id}-in`} x="-10%" y="-10%" width="120%" height="120%">
          <feComponentTransfer in="SourceAlpha" result="inv"><feFuncA type="table" tableValues="1 0" /></feComponentTransfer>
          <feOffset in="inv" dx={s * 0.025} dy={s * 0.04} result="off" />
          <feGaussianBlur in="off" stdDeviation={s * 0.05} result="blur" />
          <feFlood floodColor="#0b0608" floodOpacity={0.6} />
          <feComposite in2="blur" operator="in" result="shade" />
          <feComposite in="shade" in2="SourceAlpha" operator="in" result="inner" />
          <feMerge><feMergeNode in="SourceGraphic" /><feMergeNode in="inner" /></feMerge>
        </filter>
        <filter id={`${id}-sh`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation={Math.max(1.5, s * 0.03)} /></filter>
      </defs>
      {shadow > 0 && (
        <g transform={`matrix(1,0,${-k},${-sy},${k * g},${g * (1 + sy)})`} filter={`url(#${id}-sh)`} opacity={shadow}>
          {silhouette('#120c10')}
        </g>
      )}
      <g transform={`translate(${-rim},${-rim * 0.7})`}>{silhouette(S.colors.rim)}</g>
      <g fill={S.colors.limbFar ?? S.colors.far} filter={`url(#${id}-in)`}>
        {far.map((l, i) => l.ds.map((d, k2) => <path key={`f${i}${k2}`} d={d} />))}
      </g>
      <g filter={`url(#${id}-in)`}>
        {near.map((l, i) => l.ds.map((d, k2) => <path key={`n${i}${k2}`} d={d} fill={l.L.color ?? limbFill} />))}
        {tailD && <path d={tailD} fill={body} />}
        <path d={torsoD} fill={body} />
        <path d={headD} fill={body} />
        {trunkD && <path d={trunkD} fill={body} />}
        {shapes('under')}
        {shapes('over')}
      </g>
      {S.head.eye && (() => {
        const e = sc(P.headMap(S.head.eye));
        const r = (S.head.eyeR ?? 0.02) * s;
        return <ellipse cx={e[0]} cy={e[1]} rx={r * 1.25} ry={r * 0.85} fill="#0b0708" opacity={0.9} />;
      })()}
    </g>
  );
};
