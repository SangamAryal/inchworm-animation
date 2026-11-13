import React from 'react';
import {AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Sky, SkyFront} from '../../look/Sky';
import {Aircraft} from '../../aircraft/Aircraft';
import {AIRCRAFT} from '../../aircraft/specs';
import {COLD, T, pxPerM} from './data';
import {lane, makeTimeline, ms, vis} from './timeline';
import {ACC, CREAM, Multiplier, ScaleBar, SpeedLabel, Title} from '../short02/Labels';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const ALL05 = ['wright', 'spirit', 'spitfire', 'b747', 'concorde', 'sr71', 'x15', 'shuttle'];
export const TITLE05: [string, string] = ['Aircraft', 'speed comparison'];
const LABEL_Y = 1430;

// a round scale-bar length (m) that is 120-300 px long at this scale
const barMetres = (pxm: number) => [1, 2, 5, 10, 20, 50].find((m) => m * pxm >= 120) ?? 50;

export type Short05Props = {ids: string[]; intro?: number; audio?: string};

const Main: React.FC<Short05Props> = ({ids, intro}) => {
  const f = useCurrentFrame();
  const TL = makeTimeline(ids, {intro});
  const fr = Math.min(f, TL.duration);
  const p = TL.phase(f);
  const cur = Math.floor(p), u = p - cur;
  const s = TL.scale(f);
  const v = TL.camSpeed(Math.min(f, TL.runEnd));
  const t = f / T.fps;
  const i0 = intro ?? T.intro;

  const visible = TL.list.map((r, i) => ({r, i, x: TL.screenX(i, f)})).filter((o) => o.x !== null) as {r: typeof TL.list[0]; i: number; x: number}[];
  visible.sort((a, b) => lane(a.i).d - lane(b.i).d);
  const cam = TL.camera(Math.min(f, TL.duration - 1));
  const camT = `translate(540,1000) scale(${cam.z}) translate(${-cam.fx},${-cam.fy})`;

  const labelOp = (i: number) => {
    const inT = p - i;
    return interpolate(inT, [-0.35, -0.05], [0, 1], clamp) * interpolate(inT, [0.05, 0.3], [1, 0], clamp) * (i === 0 ? interpolate(f, [i0 - 20, i0], [0, 1], clamp) : 1);
  };
  const multI = u > 0.5 ? cur + 1 : cur;
  const multOp = multI > 0 ? (u === 0 ? 1 : Math.abs(u - 0.5) * 2) * interpolate(p - multI, [-0.5, -0.2], [0, 1], clamp) : 0;
  const endFade = interpolate(f, [TL.duration - 14, TL.duration - 1], [1, 0], clamp);
  const barOp = interpolate(f, [20, 40], [0, 1], clamp) * interpolate(f, [TL.runEnd, TL.runEnd + 10], [1, 0], clamp);
  const k = Math.round(Math.min(p, TL.list.length - 1));
  const barM = barMetres(pxPerM(AIRCRAFT[TL.list[k].id].L));

  return (
    <AbsoluteFill style={{background: '#1b1418', opacity: endFade}}>
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <g transform={camT}>
          <Sky bgX={TL.bgX[fr]} spf={vis(v)} alt={TL.alt(f)} t={t} />
          {visible.map(({r, i, x}) => (
            <Aircraft key={r.id} spec={AIRCRAFT[r.id]} t={t + i * 0.37} x={x} g={lane(i).y} s={s * lane(i).d} v={ms(r)} id={`a${i}`} />
          ))}
          <SkyFront bgX={TL.bgX[fr]} spf={vis(v)} alt={TL.alt(f)} />
        </g>
        <rect x={0} y={1280} width={1080} height={640} fill="url(#scrim05)" />
        <defs><linearGradient id="scrim05" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1b1220" stopOpacity="0" /><stop offset="0.3" stopColor="#1b1220" stopOpacity="0.5" /><stop offset="1" stopColor="#1b1220" stopOpacity="0.75" /></linearGradient></defs>
        {visible.map(({r, i}) => labelOp(i) > 0.01 && <SpeedLabel key={'l' + i} r={r} opacity={labelOp(i)} y={LABEL_Y} />)}
        {multOp > 0.01 && <Multiplier value={TL.list[multI].kmh / TL.list[multI - 1].kmh} than={TL.list[multI - 1].ref} opacity={multOp} />}
        <ScaleBar len={s * barM * lane(Math.round(p)).d * cam.z} text={`${barM} m`} opacity={barOp} />
      </svg>
    </AbsoluteFill>
  );
};

// Cold open: the fastest machine first, so the payoff is promised in the first second.
const Cold: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / T.fps, v = 7778;
  const x = 545 - 30 * Math.sin((f / COLD) * Math.PI);
  const shadow = {filter: 'drop-shadow(0 2px 6px rgba(20,10,8,0.55))'};
  const pop = interpolate(f, [0, 6], [0.9, 1], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: '#1b1418'}}>
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <g transform="translate(540,1000) scale(1.05) translate(-540,-1040)">
          <Sky bgX={vis(v) * f + 3000} spf={vis(v)} alt={1} t={t} />
          <Aircraft spec={AIRCRAFT.shuttle} t={t} x={x} g={1080} s={pxPerM(37.24) * 1.02} v={v} id="cold" />
        </g>
        <Title lines={TITLE05} opacity={1} />
        <g style={shadow} transform={`translate(540,560) scale(${pop}) translate(-540,-560)`}>
          <text x={540} y={580} textAnchor="middle" fontFamily="Inter" fontWeight={600} fontSize={104} fill={CREAM}>48 <tspan fill={ACC}>→</tspan> 28,000</text>
          <text x={540} y={640} textAnchor="middle" fontFamily="Inter" fontWeight={500} fontSize={30} letterSpacing={5} fill={CREAM}>KM/H · 8 FLYING MACHINES</text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

export const Short05: React.FC<Short05Props> = ({ids, intro, audio}) => (
  <AbsoluteFill style={{background: '#1b1418', filter: 'contrast(1.08) saturate(1.15)'}}>
    <Sequence durationInFrames={COLD}><Cold /></Sequence>
    <Sequence from={COLD}><Main ids={ids} intro={intro} /></Sequence>
    {audio && <Audio src={staticFile(audio)} />}
  </AbsoluteFill>
);

export const short05Duration = (p: Short05Props) => COLD + makeTimeline(p.ids, {intro: p.intro}).duration;
