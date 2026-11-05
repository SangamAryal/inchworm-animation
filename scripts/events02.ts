// Export footfall / wingbeat events for the Short 02 sound track.
// Usage: npx tsx scripts/events02.ts '<ids json>' race(0|1) intro out.json
import {writeFileSync} from 'fs';
import {makeTimeline} from '../src/videos/short02/timeline';
import {SPECS} from '../src/creatures';
import {footfalls} from '../src/creatures/rig';
import {T} from '../src/videos/short02/data';
import {raceEvents} from '../src/videos/short02/raceData';
import {BAT_FLAP} from '../src/creatures/Bat';

const ids: string[] = JSON.parse(process.argv[2]);
const race = process.argv[3] === '1';
const intro = Number(process.argv[4] ?? T.intro);
const TL = makeTimeline(ids, {race, intro});
const ev: {t: number; id: string; kg: number; sound: string; side: string; pan: number; gain: number}[] = [];
TL.list.forEach((r, i) => {
  const S = SPECS[r.id] ?? {stride: BAT_FLAP};
  for (let f = 0; f < TL.runEnd; f++) {
    const x = TL.screenX(i, f);
    if (x === null) continue;
    const off = i * 0.37; // must match Short02's per-runner time offset
    const t0 = f / T.fps, t1 = (f + 1) / T.fps;
    const vis = Math.max(0, Math.min(1, (x + 300) / 500)); // fade while entering from / leaving off the left
    if (r.sound === 'wing') {
      const k0 = Math.ceil((t0 + off) * S.stride), k1 = (t1 + off) * S.stride;
      for (let k = k0; k < k1; k++) ev.push({t: k / S.stride - off, id: r.id, kg: r.kg, sound: 'wing', side: 'near', pan: (x - 540) / 540, gain: vis});
      continue;
    }
    for (const e of footfalls(S as typeof SPECS['horse'], t0 + off, t1 + off)) ev.push({t: e.t - off, id: r.id, kg: r.kg, sound: r.sound, side: e.limb.side, pan: (x - 540) / 540, gain: vis});
  }
});
if (race) ev.push(...raceEvents(TL));
const speed = Array.from({length: TL.duration}, (_, f) => (f < TL.runEnd ? TL.camSpeed(f) : 0));
const music = [TL.duration / T.fps, (T.hold + T.trans) / T.fps / 2, TL.holdEnd(0) / T.fps]; // length, bar, first downbeat = first pass
writeFileSync(process.argv[5], JSON.stringify({music, fps: T.fps, duration: TL.duration / T.fps, runEnd: TL.runEnd / T.fps, events: ev.sort((a, b) => a.t - b.t), speed}));
console.log('events', ev.length, 'duration', TL.duration / T.fps);
