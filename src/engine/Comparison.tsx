import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {Item, Timing} from './types';
import {makeLayout} from './layout';
import {fmtRatio, fmtSize} from './format';
import {GLBody} from '../bodies/GLBody';
import {DuskBackground, DuskDefs, DuskGround, DuskLabel, DuskMultiplier, DuskScaleBar, DuskTitle, FLOOR, GroundGlow} from '../look/Dusk';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const niceBar = (s: number) => {
  for (let exp = 0; exp < 13; exp++) for (const m of [1, 2, 5]) {
    const km = m * 10 ** exp;
    if (km * s >= 140) return {km, len: km * s};
  }
  return {km: 1e13, len: 1e13 * s};
};

export const Comparison: React.FC<{items: Item[]; timing: Timing; title: [string, string]}> = ({items, timing, title}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const L = makeLayout(items, timing);
  const p = L.progress(f);
  const {s, cx} = L.camera(p);
  const t = f / fps;

  const vis = items.map((it, i) => {
    const x = 540 + (L.centers[i] - cx) * s;
    const r = (it.km / 2) * s;
    const vw = r * it.ext;
    if (x + vw < -40 || x - vw > 1120) return null;
    const intro = i === 0 ? interpolate(f, [4, 30], [0, 1], clamp) : 1;
    const y = FLOOR - r * it.lift;
    const labOp = interpolate(r, [3, 9], [0, 1], clamp) * intro * interpolate(p - i, [0.15, 0.55], [1, 0], clamp) * (i === 0 ? interpolate(f, [18, 40], [0, 1], clamp) : 1);
    return {it, i, x, y, r, intro, labOp};
  }).filter(Boolean) as {it: Item; i: number; x: number; y: number; r: number; intro: number; labOp: number}[];

  const kF = Math.max(0, Math.min(Math.floor(p), L.NP - 1));
  const inTrans = p >= 0 && p !== Math.floor(p);
  const e = p - Math.floor(p);
  const curK = p < 0 ? 0 : inTrans ? (e < 0.5 ? kF : kF + 1) : kF;
  const multOp = interpolate(p, [-0.4, 0], [0, 1], clamp) * (inTrans ? Math.abs(e - 0.5) * 2 : 1);
  const titleOp = interpolate(f, [0, 12], [0, 1], clamp) * interpolate(p, [-1, -0.6], [1, 0], clamp);
  const bar = niceBar(s);
  const endFade = interpolate(f, [L.duration - 12, L.duration - 1], [1, 0], clamp);

  return (
    <AbsoluteFill style={{background: '#231C26', opacity: endFade}}>
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <DuskDefs />
        <DuskBackground drift={p} />
        {vis.map((v) => <g key={'g' + v.i} opacity={v.intro}><DuskGround item={v.it} x={v.x} r={v.r} y={v.y} /></g>)}
        {vis.map((v) => <g key={'h' + v.i} opacity={v.intro}><GroundGlow item={v.it} x={v.x} r={v.r} /></g>)}
        {vis.map((v) => v.r < 1.5 && <circle key={'d' + v.i} cx={v.x} cy={v.y} r={1.5} fill={v.it.glow ?? '#ddd'} opacity={v.intro} />)}
      </svg>
      {vis.map((v) => v.r >= 1.5 && (
        <div key={v.it.name} style={{position: 'absolute', inset: 0, opacity: v.intro}}>
          <GLBody kind={v.it.body} x={v.x} y={v.y} r={v.r} ext={v.it.ext} t={t}
            maxRes={v.it.body === 'blackhole' ? 640 : 1024}
            params={v.it.params as never} />
        </div>
      ))}
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        {vis.map((v) => v.labOp > 0.01 && <DuskLabel key={'l' + v.i} item={v.it} x={v.x} opacity={v.labOp} highlight={v.i === curK + 1 || (p < 0 && v.i === 0)} />)}
        {titleOp > 0.01 && <DuskTitle lines={title} opacity={titleOp} />}
        {multOp > 0.01 && <DuskMultiplier value={fmtRatio(items[curK + 1].km / items[curK].km)} opacity={multOp} />}
        <g opacity={interpolate(f, [20, 40], [0, 1], clamp)}><DuskScaleBar len={bar.len} text={fmtSize(bar.km)} /></g>
      </svg>
    </AbsoluteFill>
  );
};
