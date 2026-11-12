import {Easing} from 'remotion';
import {CARS, Car, T, PX_PER_M, PX_PER_M_JET} from './data';

const ease = Easing.inOut(Easing.cubic);
const smooth = (u: number) => u * u * (3 - 2 * u);
const cl = (u: number) => Math.min(1, Math.max(0, u));
export const ms = (r: Car) => r.kmh / 3.6;

// Two lanes, like a race: runners alternate lanes so each new runner passes the last one side by side.
export const LANES = [{y: 1268, d: 0.88}, {y: 1350, d: 1.2}]; // far, near (d = depth scale)
export const lane = (i: number) => LANES[i % 2];

export const makeTimeline = (ids: string[], opts: {intro?: number}) => {
  const list = ids.map((id) => CARS.find((r) => r.id === id)!);
  const intro = opts.intro ?? T.intro;
  const holdStart = (i: number) => (i === 0 ? 0 : intro + T.hold + (i - 1) * (T.hold + T.trans) + T.trans);
  const holdEnd = (i: number) => (i === 0 ? intro + T.hold : holdStart(i) + T.hold);
  const runEnd = holdEnd(list.length - 1);
  const duration = runEnd + T.outro;

  // phase: i during runner i's hold, i + u while runner i+1 overtakes it
  const phase = (f: number) => {
    for (let i = 0; i < list.length; i++) {
      if (f < holdEnd(i)) return i;
      if (i < list.length - 1 && f < holdStart(i + 1)) return i + (f - holdEnd(i)) / T.trans;
    }
    return list.length - 1;
  };
  const camSpeed = (f: number) => {
    const p = phase(f), i = Math.floor(p), u = p - i;
    const a = ms(list[i]), b = ms(list[Math.min(i + 1, list.length - 1)]);
    return a + (b - a) * ease(cl((u - 0.15) / 0.75));
  };
  const camX: number[] = [0];
  for (let f = 1; f <= duration; f++) camX.push(camX[f - 1] + camSpeed(Math.min(f, runEnd)) / T.fps);

  // runner position in world-screen space (before the camera transform)
  const holdX = (i: number, f: number) => { // drifts forward a little while it leads: the camera pans with it
    const h0 = holdStart(i), h1 = holdEnd(i);
    return 470 + 110 * smooth(cl((f - h0) / (h1 - h0)));
  };
  const screenX = (i: number, f: number): number | null => {
    if (f >= holdStart(i) && f < holdEnd(i)) return holdX(i, f);
    if (i > 0 && f >= holdEnd(i - 1) && f < holdStart(i)) { // catching up and passing runner i-1
      const u = (f - holdEnd(i - 1)) / T.trans;
      return -480 + (470 + 480) * smooth(u);
    }
    if (f >= holdEnd(i) && i < list.length - 1) { // being passed, then dropping back out of shot
      const u = (f - holdEnd(i)) / T.trans;
      const x = 580 - 980 * Math.pow(u, 1.7);
      return x < -900 ? null : x;
    }
    return null;
  };

  // camera: push in while one runner leads, pull back to frame both during a pass, gentle drift throughout
  const camera = (f: number) => {
    const p = phase(f), i = Math.floor(p), u = p - i;
    const sway = {x: 14 * Math.sin(f / 37), y: 9 * Math.sin(f / 29 + 1)};
    const yOf = (k: number) => lane(k).y - 170 * lane(k).d;
    if (f >= runEnd || u === 0) {
      const k = Math.min(i, list.length - 1);
      const x = screenX(k, Math.min(f, runEnd - 1)) ?? 540;
      const h0 = holdStart(k), h1 = holdEnd(k);
      const e = smooth(cl((f - h0) / (h1 - h0)));
      return {z: 1.0 + 0.1 * e, fx: 540 + (x - 540) * 0.55 + sway.x, fy: 1000 + (yOf(k) - 1000) * 0.6 * e + sway.y};
    }
    const a = screenX(i, f) ?? 540, b = screenX(i + 1, f) ?? 540;
    const mid = (a + b) / 2;
    const out = Math.sin(Math.PI * u); // most zoomed out mid-pass
    const zEnd = 1.0, zStart = 1.1;
    const z = (zStart + (zEnd - zStart) * smooth(u)) - 0.1 * out;
    const fx = 540 + ((1 - smooth(u)) * (a - 540) * 0.55 + smooth(u) * (b - 540) * 0.55) * (1 - out) + (mid - 540) * 0.35 * out + sway.x;
    const fy = 1000 + (yOf(i) - 1000) * 0.6 * (1 - smooth(u)) * (1 - out) + 60 * out + sway.y;
    return {z, fx, fy};
  };
  // shared scale (px per metre); pulls back while the 16.5 m jet car arrives so it fits the frame
  const jet = list.findIndex((r) => r.id === 'thrust');
  const scale = (f: number) => {
    if (jet < 0) return PX_PER_M;
    const u = smooth(cl((phase(f) - (jet - 1) + 0.05) / 0.5));
    return PX_PER_M * Math.pow(PX_PER_M_JET / PX_PER_M, u);
  };
  return {list, scale, holdStart, holdEnd, runEnd, duration, phase, camSpeed, camX, screenX, camera};
};
export type Timeline = ReturnType<typeof makeTimeline>;
