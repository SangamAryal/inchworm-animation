import React from 'react';
import {AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {Savanna, GROUND} from '../../look/Savanna';
import {Creature} from '../../creatures/Creature';
import {SPECS} from '../../creatures';
import {PX_PER_M, T} from './data';
import {lane, makeTimeline, ms} from './timeline';
import {Multiplier, ScaleBar, SpeedLabel, Title} from './Labels';
import {Bat} from '../../creatures/Bat';
import {Race} from './race';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export type Short02Props = {ids: string[]; race: boolean; intro?: number; audio?: string};

export const Short02: React.FC<Short02Props> = ({ids, race, intro, audio}) => {
  const f = useCurrentFrame();
  const TL = makeTimeline(ids, {race, intro});
  const fr = Math.min(f, TL.duration);
  const p = TL.phase(f);
  const cur = Math.floor(p), u = p - cur;
  const s = PX_PER_M;
  const v = TL.camSpeed(Math.min(f, TL.runEnd));
  const camX = TL.camX[fr];
  const t = f / T.fps;

  const visible = TL.list.map((r, i) => ({r, i, x: TL.screenX(i, f)})).filter((o) => o.x !== null) as {r: typeof TL.list[0]; i: number; x: number}[];
  // far lane first
  visible.sort((a, b) => lane(a.i).d - lane(b.i).d);
  const cam = TL.camera(Math.min(f, TL.duration - 1));
  const camT = `translate(540,1000) scale(${cam.z}) translate(${-cam.fx},${-cam.fy})`;

  const labelOp = (i: number) => {
    const inT = p - i; // 0 at hold
    return interpolate(inT, [-0.35, -0.05], [0, 1], clamp) * interpolate(inT, [0.05, 0.3], [1, 0], clamp) * (i === 0 ? interpolate(f, [(intro ?? T.intro) - 20, (intro ?? T.intro)], [0, 1], clamp) : 1);
  };
  const titleOp = interpolate(f, [0, 10], [0, 1], clamp) * interpolate(f, [(intro ?? T.intro) - 14, (intro ?? T.intro)], [1, 0], clamp);
  const multI = u > 0.5 ? cur + 1 : cur;
  const multOp = multI > 0 ? (u === 0 ? 1 : Math.abs(u - 0.5) * 2) * interpolate(p - multI, [-0.5, -0.2], [0, 1], clamp) : 0;
  const zoom = (r: typeof TL.list[0]) => r.zoom ?? 1;
  const mainOp = race ? interpolate(f, [TL.runEnd, TL.runEnd + 14], [1, 0], clamp) : 1;
  const endFade = interpolate(f, [TL.duration - 14, TL.duration - 1], [1, 0], clamp);

  return (
    <AbsoluteFill style={{background: '#1b1418', opacity: endFade}}>
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <g transform={camT}>
          <Savanna camX={camX} s={s} v={v} fps={T.fps} />
          <g opacity={mainOp}>
            {visible.map(({r, i, x}) => r.id === 'bat'
              ? <Bat key={r.id} t={t + i * 0.37} x={x} y={GROUND - 300} s={s * zoom(r)} id={`a${i}`} groundY={GROUND} />
              : <Creature key={r.id} spec={SPECS[r.id]} t={t + i * 0.37} x={x} g={lane(i).y} s={s * lane(i).d} id={`a${i}`} />)}
          </g>
        </g>
        <g opacity={mainOp}>
          {visible.map(({r, i}) => labelOp(i) > 0.01 && <SpeedLabel key={'l' + i} r={r} opacity={labelOp(i)} y={1505} />)}
          {titleOp > 0.01 && <Title lines={['How fast can', 'mammals run?']} opacity={titleOp} />}
          {multOp > 0.01 && <Multiplier value={TL.list[multI].kmh / TL.list[multI - 1].kmh} than={TL.list[multI - 1].ref} opacity={multOp} />}
        </g>
        {(() => {
          const batK = TL.list.findIndex((r) => r.id === 'bat');
          const bz = batK < 0 ? 0 : interpolate(p, [batK - 0.6, batK - 0.4], [0, 1], clamp);
          const base = interpolate(f, [20, 40], [0, 1], clamp) * interpolate(f, [TL.runEnd, TL.runEnd + 10], [1, 0], clamp);
          return <>
            {bz < 1 && <ScaleBar len={s * lane(Math.round(p)).d * cam.z} text="1 m" opacity={base * (1 - bz)} />}
            {bz > 0 && <ScaleBar len={s * 4 * 0.2 * cam.z} text="20 cm · bat shown 4× larger" opacity={base * bz} />}
          </>;
        })()}
        {race && <Race TL={TL} f={f} />}
      </svg>
      {audio && <Audio src={staticFile(audio)} />}
    </AbsoluteFill>
  );
};

export const short02Duration = (p: Short02Props) => makeTimeline(p.ids, {race: p.race, intro: p.intro}).duration;
export {ms};
