import React from 'react';
import {interpolate} from 'remotion';
import {Creature} from '../../creatures/Creature';
import {Bat} from '../../creatures/Bat';
import {SPECS} from '../../creatures';
import {T} from './data';
import {Timeline, ms} from './timeline';
import {RACE, noseX} from './raceData';
import {ACC, CREAM, MUTE, fmt} from './Labels';

// Finale: every runner side by side, true common scale, 5 seconds at top speed.
const LANES: Record<string, number> = {bat: 590, cheetah: 720, pronghorn: 845, horse: 990, bear: 1110, human: 1250, elephant: 1440};
const LENGTH: Record<string, number> = {bat: 0.07, cheetah: 0.55, pronghorn: 0.97, horse: 1.56, bear: 1.18, human: 0.14, elephant: 2.0}; // nose ahead of body origin, m

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const raceTime = (TL: Timeline, f: number) => Math.min(RACE.run, Math.max(0, f - TL.runEnd - RACE.fadeIn)) / T.fps;

export const Race: React.FC<{TL: Timeline; f: number}> = ({TL, f}) => {
  const k = f - TL.runEnd;
  if (k < 0) return null;
  const op = interpolate(k, [0, RACE.fadeIn], [0, 1], clamp);
  const rt = raceTime(TL, f);
  const tStart = (TL.runEnd + RACE.fadeIn) / T.fps;
  const t = Math.min(Math.max(f / T.fps, tStart), tStart + RACE.run / T.fps); // frozen before the start and at the finish
  const done = interpolate(k, [RACE.fadeIn + RACE.run, RACE.fadeIn + RACE.run + 15], [0, 1], clamp);
  return (
    <g opacity={op}>
      <rect width={1080} height={1920} fill="#140d12" opacity={0.55} />
      <text x={540} y={300} textAnchor="middle" fontFamily="Inter" fontWeight={300} fontSize={62} fill={CREAM}>Race for</text>
      <text x={540} y={380} textAnchor="middle" fontFamily="Inter" fontWeight={600} fontSize={62} fill={CREAM}>5 seconds</text>
      <text x={540} y={450} textAnchor="middle" fontFamily="IBM Plex Mono" fontWeight={500} fontSize={40} fill={ACC}>{rt.toFixed(1)} s</text>
      <line x1={RACE.startX} x2={RACE.startX} y1={520} y2={1470} stroke={CREAM} strokeOpacity={0.35} strokeWidth={2} strokeDasharray="6 8" />
      {[100, 200].map((m) => (
        <g key={m}>
          <line x1={RACE.startX + m * RACE.pxPerM} x2={RACE.startX + m * RACE.pxPerM} y1={520} y2={1470} stroke={CREAM} strokeOpacity={0.15} strokeWidth={2} />
          <text x={RACE.startX + m * RACE.pxPerM} y={1505} textAnchor="middle" fontFamily="IBM Plex Mono" fontSize={22} fill={MUTE}>{m} m</text>
        </g>
      ))}
      {TL.list.map((r, i) => {
        const g = LANES[r.id];
        const nx = noseX(r.kmh, rt);
        const x = nx - LENGTH[r.id] * RACE.s * (r.zoom ?? 1);
        const dist = (r.kmh / 3.6) * rt;
        const right = nx < 520;
        return (
          <g key={r.id}>
            {r.id !== 'bat' && <line x1={0} x2={1080} y1={g} y2={g} stroke="#E8B08A" strokeOpacity={0.18} strokeWidth={1.5} />}
            {r.id === 'bat'
              ? <Bat t={t} x={x} y={g - 40} s={RACE.s * 4} id={`rb${i}`} groundY={g + 2000} />
              : <Creature spec={SPECS[r.id]} t={t + i * 0.37} x={x} g={g} s={RACE.s} id={`r${i}`} shadow={0.35} rim={1.4} />}
            <g opacity={0.35 + 0.65 * done}>
              <text x={right ? nx + 16 : x - LENGTH[r.id] * 0 - 70} y={g - 34} textAnchor={right ? 'start' : 'end'} fontFamily="Inter" fontWeight={600} fontSize={26} fill={CREAM}>{r.name}</text>
              <text x={right ? nx + 16 : x - 70} y={g - 4} textAnchor={right ? 'start' : 'end'} fontFamily="IBM Plex Mono" fontWeight={500} fontSize={24} fill={ACC}>{fmt(dist)} m</text>
            </g>
          </g>
        );
      })}
    </g>
  );
};

export {ms};
