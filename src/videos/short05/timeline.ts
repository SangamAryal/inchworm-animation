import {Easing} from 'remotion';
import {AIRCRAFT} from '../../aircraft/specs';
import {CRAFT, Craft, T, pxPerM} from './data';

const ease = Easing.inOut(Easing.cubic);
const smooth = (u: number) => u * u * (3 - 2 * u);
const cl = (u: number) => Math.min(1, Math.max(0, u));
export const ms = (r: Craft) => r.kmh / 3.6;
// background speed on screen (px per frame). Real speeds span 580x, which no screen can show linearly, so this
// keeps a ~115x spread (v^0.75): the Wright Flyer drifts at ~8 px/frame, the Shuttle tears past at ~1,000.
export const vis = (v: number) => 1.2 * Math.pow(v, 0.75);

// Two flight levels: each new craft passes the last one on the other level.
export const LANES = [{y: 900, d: 0.9}, {y: 1045, d: 1.1}]; // far, near (d = depth scale)
export const lane = (i: number) => LANES[i % 2];

export const makeTimeline = (ids: string[], opts: {intro?: number}) => {
  const list = ids.map((id) => CRAFT.find((r) => r.id === id)!);
  const intro = opts.intro ?? T.intro;
  const holdStart = (i: number) => (i === 0 ? 0 : intro + T.hold + (i - 1) * (T.hold + T.trans) + T.trans);
  const holdEnd = (i: number) => (i === 0 ? intro + T.hold : holdStart(i) + T.hold);
  const runEnd = holdEnd(list.length - 1);
  const duration = runEnd + T.outro;

  const phase = (f: number) => {
    for (let i = 0; i < list.length; i++) {
      if (f < holdEnd(i)) return i;
      if (i < list.length - 1 && f < holdStart(i + 1)) return i + (f - holdEnd(i)) / T.trans;
    }
    return list.length - 1;
  };
  const blend = (f: number, get: (r: Craft) => number, geo = false) => {
    const p = phase(f), i = Math.floor(p), u = p - i;
    const a = get(list[i]), b = get(list[Math.min(i + 1, list.length - 1)]);
    const e = ease(cl((u - 0.15) / 0.75));
    return geo ? a * Math.pow(b / a, e) : a + (b - a) * e;
  };
  const camSpeed = (f: number) => blend(f, ms, true);
  const alt = (f: number) => blend(Math.min(f, runEnd), (r) => r.alt);
  const scale = (f: number) => blend(Math.min(f, runEnd), (r) => pxPerM(AIRCRAFT[r.id].L), true);
  const bgX: number[] = [0];
  for (let f = 1; f <= duration; f++) bgX.push(bgX[f - 1] + vis(camSpeed(Math.min(f, runEnd))));

  const holdX = (i: number, f: number) => {
    const h0 = holdStart(i), h1 = holdEnd(i);
    return 470 + 110 * smooth(cl((f - h0) / (h1 - h0)));
  };
  const screenX = (i: number, f: number): number | null => {
    if (f >= holdStart(i) && f < holdEnd(i)) return holdX(i, f);
    if (i > 0 && f >= holdEnd(i - 1) && f < holdStart(i)) { // catching up and passing craft i-1
      const u = (f - holdEnd(i - 1)) / T.trans;
      return -700 + (470 + 700) * smooth(u);
    }
    if (f >= holdEnd(i) && i < list.length - 1) { // being passed, then dropping back out of shot
      const u = (f - holdEnd(i)) / T.trans;
      const x = 580 - 1500 * Math.pow(u, 1.7);
      return x < -1100 ? null : x;
    }
    return null;
  };

  const camera = (f: number) => {
    const p = phase(f), i = Math.floor(p), u = p - i;
    const sway = {x: 14 * Math.sin(f / 37), y: 12 * Math.sin(f / 29 + 1)};
    const yOf = (k: number) => lane(k).y;
    if (f >= runEnd || u === 0) {
      const k = Math.min(i, list.length - 1);
      const x = screenX(k, Math.min(f, runEnd - 1)) ?? 540;
      const h0 = holdStart(k), h1 = holdEnd(k);
      const e = smooth(cl((f - h0) / (h1 - h0)));
      return {z: 1.0 + 0.1 * e, fx: 540 + (x - 540) * 0.55 + sway.x, fy: 1000 + (yOf(k) - 1000) * 0.6 * e + sway.y};
    }
    const a = screenX(i, f) ?? 540, b = screenX(i + 1, f) ?? 540;
    const mid = (a + b) / 2;
    const out = Math.sin(Math.PI * u);
    const z = (1.1 - 0.1 * smooth(u)) - 0.1 * out;
    const fx = 540 + ((1 - smooth(u)) * (a - 540) * 0.55 + smooth(u) * (b - 540) * 0.55) * (1 - out) + (mid - 540) * 0.35 * out + sway.x;
    const fy = 1000 + (yOf(i) - 1000) * 0.6 * (1 - smooth(u)) * (1 - out) + 20 * out + sway.y;
    return {z, fx, fy};
  };
  return {list, scale, alt, holdStart, holdEnd, runEnd, duration, phase, camSpeed, bgX, screenX, camera};
};
