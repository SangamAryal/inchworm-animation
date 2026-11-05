import {BAT_FLAP} from '../../creatures/Bat';
import {SPECS} from '../../creatures';
import {footfalls} from '../../creatures/rig';
import {T} from './data';
import {Timeline} from './timeline';

export const RACE = {fadeIn: 24, run: 90, s: 45, startX: 70, pxPerM: 960 / 140};
export const noseX = (kmh: number, rt: number) => RACE.startX + (kmh / 3.6) * rt * RACE.pxPerM;

export const raceEvents = (TL: Timeline) => {
  const ev: {t: number; id: string; kg: number; sound: string; side: string; pan: number; gain: number}[] = [];
  const t0 = (TL.runEnd + RACE.fadeIn) / T.fps, t1 = t0 + RACE.run / T.fps;
  TL.list.forEach((r, i) => {
    const pan = (rt: number) => Math.min(1, (noseX(r.kmh, Math.min(RACE.run / T.fps, rt)) - 540) / 540);
    if (r.sound === 'wing') {
      for (let k = Math.ceil(t0 * BAT_FLAP); k < t1 * BAT_FLAP; k++) ev.push({t: k / BAT_FLAP, id: r.id, kg: r.kg, sound: 'wing', side: 'near', pan: pan(k / BAT_FLAP - t0), gain: 0.5});
      return;
    }
    const off = i * 0.37;
    for (const e of footfalls(SPECS[r.id], t0 + off, t1 + off)) {
      const tt = e.t - off;
      if (tt < t0) continue;
      const fade = 0.6;
      ev.push({t: tt, id: r.id, kg: r.kg, sound: r.sound, side: e.limb.side, pan: pan(tt - t0), gain: fade});
    }
  });
  return ev;
};
