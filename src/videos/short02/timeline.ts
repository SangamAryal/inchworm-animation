import {Easing} from 'remotion';
import {RUNNERS, Runner, T} from './data';

const ease = Easing.inOut(Easing.cubic);
export const ms = (r: Runner) => r.kmh / 3.6;

// Each runner is "current" from holdStart(i) to holdStart(i)+hold, then a transition to i+1.
export const makeTimeline = (ids: string[], opts: {race: boolean; intro?: number}) => {
  const list = ids.map((id) => RUNNERS.find((r) => r.id === id)!);
  const intro = opts.intro ?? T.intro;
  const holdStart = (i: number) => (i === 0 ? 0 : intro + T.hold + (i - 1) * (T.hold + T.trans) + T.trans);
  const holdEnd = (i: number) => (i === 0 ? intro + T.hold : holdStart(i) + T.hold);
  const runEnd = holdEnd(list.length - 1);
  const duration = runEnd + (opts.race ? T.race : 0) + T.outro;

  // phase: i + u, u in [0,1) during the transition from i to i+1
  const phase = (f: number) => {
    for (let i = 0; i < list.length; i++) {
      if (f < holdEnd(i)) return i;
      if (i < list.length - 1 && f < holdStart(i + 1)) return i + ease((f - holdEnd(i)) / T.trans);
    }
    return list.length - 1;
  };
  const camSpeed = (f: number) => {
    const p = phase(f), i = Math.floor(p), u = p - i;
    const a = ms(list[i]), b = ms(list[Math.min(i + 1, list.length - 1)]);
    return a + (b - a) * u;
  };
  // camera position in metres, integrated per frame
  const camX: number[] = [0];
  for (let f = 1; f <= duration; f++) camX.push(camX[f - 1] + camSpeed(Math.min(f, runEnd)) / T.fps);

  // where runner i is on screen (x of body centre), or null if off
  const screenX = (i: number, f: number) => {
    const p = phase(f);
    if (p <= i - 1 || p >= i + 1) return null;
    if (p < i) { // entering, overtaking i-1
      const u = p - (i - 1);
      return -520 + 1060 * Easing.out(Easing.cubic)(Math.min(1, u * 1.05));
    }
    if (p === i) return 540;
    const u = p - i; // leaving, overtaken
    return 540 - 1000 * Easing.in(Easing.quad)(u);
  };
  return {list, holdStart, holdEnd, runEnd, duration, phase, camSpeed, camX, screenX};
};
export type Timeline = ReturnType<typeof makeTimeline>;
