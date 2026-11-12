import React from 'react';
import {AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {Highway} from '../../look/Highway';
import {Vehicle} from '../../vehicles/Vehicle';
import {VEHICLES} from '../../vehicles/specs';
import {T} from './data';
import {lane, makeTimeline, ms} from './timeline';
import {Multiplier, ScaleBar, SpeedLabel, Title} from '../short02/Labels';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const ALL04 = ['benz', 'modelT', 'beetle', 'f40', 'f1', 'mclaren', 'chiron', 'thrust'];

export type Short04Props = {ids: string[]; intro?: number; audio?: string};

export const Short04: React.FC<Short04Props> = ({ids, intro, audio}) => {
  const f = useCurrentFrame();
  const TL = makeTimeline(ids, {intro});
  const fr = Math.min(f, TL.duration);
  const p = TL.phase(f);
  const cur = Math.floor(p), u = p - cur;
  const s = TL.scale(f);
  const v = TL.camSpeed(Math.min(f, TL.runEnd));
  const camX = TL.camX[fr];
  const t = f / T.fps;
  const i0 = intro ?? T.intro;

  const visible = TL.list.map((r, i) => ({r, i, x: TL.screenX(i, f)})).filter((o) => o.x !== null) as {r: typeof TL.list[0]; i: number; x: number}[];
  visible.sort((a, b) => lane(a.i).d - lane(b.i).d); // far lane first
  const cam = TL.camera(Math.min(f, TL.duration - 1));
  const camT = `translate(540,1000) scale(${cam.z}) translate(${-cam.fx},${-cam.fy})`;

  const labelOp = (i: number) => {
    const inT = p - i;
    return interpolate(inT, [-0.35, -0.05], [0, 1], clamp) * interpolate(inT, [0.05, 0.3], [1, 0], clamp) * (i === 0 ? interpolate(f, [i0 - 20, i0], [0, 1], clamp) : 1);
  };
  const titleOp = interpolate(f, [0, 10], [0, 1], clamp) * interpolate(f, [i0 - 14, i0], [1, 0], clamp);
  const multI = u > 0.5 ? cur + 1 : cur;
  const multOp = multI > 0 ? (u === 0 ? 1 : Math.abs(u - 0.5) * 2) * interpolate(p - multI, [-0.5, -0.2], [0, 1], clamp) : 0;
  const endFade = interpolate(f, [TL.duration - 14, TL.duration - 1], [1, 0], clamp);
  const barOp = interpolate(f, [20, 40], [0, 1], clamp) * interpolate(f, [TL.runEnd, TL.runEnd + 10], [1, 0], clamp);
  // scale bar: 1 m, or 5 m once the camera has pulled back for the jet car
  const wide = s < 80;
  const barM = wide ? 5 : 1;

  return (
    <AbsoluteFill style={{background: '#1b1418', opacity: endFade}}>
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <g transform={camT}>
          <Highway camX={camX} s={s} v={v} fps={T.fps} />
          {visible.map(({r, i, x}) => (
            <Vehicle key={r.id} spec={VEHICLES[r.id]} t={t + i * 0.37} x={x} g={lane(i).y} s={s * lane(i).d} v={ms(r)} id={`v${i}`} />
          ))}
        </g>
        {visible.map(({r, i}) => labelOp(i) > 0.01 && <SpeedLabel key={'l' + i} r={r} opacity={labelOp(i)} y={1505} />)}
        {titleOp > 0.01 && <Title lines={['Automobiles', 'speed comparison']} opacity={titleOp} />}
        {multOp > 0.01 && <Multiplier value={TL.list[multI].kmh / TL.list[multI - 1].kmh} than={TL.list[multI - 1].ref} opacity={multOp} />}
        <ScaleBar len={s * barM * lane(Math.round(p)).d * cam.z} text={`${barM} m`} opacity={barOp} />
      </svg>
      {audio && <Audio src={staticFile(audio)} />}
    </AbsoluteFill>
  );
};

export const short04Duration = (p: Short04Props) => makeTimeline(p.ids, {intro: p.intro}).duration;
