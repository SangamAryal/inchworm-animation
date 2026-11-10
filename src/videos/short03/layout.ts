import {Easing} from 'remotion';
import {Tall, T03} from './data';

// Pair k shows items k (left) and k+1 (right); pair -1 is item 0 alone.
// Each pair is scaled so the taller item is maxH pixels tall, then both are
// centred with at least minSep pixels between their bases (room for labels).
export const makeTallLayout = (items: Tall[], t = T03, o = {maxH: 760, introH: 430, maxW: 980, gap: 60, minSep: 420}) => {
  const N = items.length, NP = N - 1;
  const pairS = (k: number) => {
    if (k < 0) return o.introH / items[0].m;
    const a = items[k], b = items[k + 1];
    const byH = o.maxH / b.m;
    const byW = (o.maxW - o.gap) / (a.l + a.r + b.l + b.r); // only matters for wide things like the pyramid
    return Math.min(byH, Math.max(byW, byH * 0.55));
  };
  const xs: {l: number; r: number; sep: number}[] = [];
  const centers = [0];
  for (let k = 0; k < NP; k++) {
    const s = pairS(k), a = items[k], b = items[k + 1];
    const sep = Math.max(a.r * s + o.gap + b.l * s, o.minSep);
    const span = a.l * s + sep + b.r * s;
    const l = 540 - span / 2 + a.l * s;
    xs.push({l, r: l + sep, sep});
    centers.push(centers[k] + sep / s);
  }
  const ease = Easing.inOut(Easing.cubic);
  const pairStart = (k: number) => t.intro + t.move + k * (t.hold + t.move);
  const duration = pairStart(NP - 1) + t.hold + t.outro;
  const progress = (f: number) => {
    if (f < t.intro) return -1;
    if (f < t.intro + t.move) return -1 + ease((f - t.intro) / t.move);
    for (let k = 0; k < NP - 1; k++) {
      const s = pairStart(k) + t.hold;
      if (f < s) return k;
      if (f < s + t.move) return k + ease((f - s) / t.move);
    }
    return NP - 1;
  };
  const lerpLog = (a: number, b: number, e: number) => Math.exp(Math.log(a) * (1 - e) + Math.log(b) * e);
  // camera: s = pixels per metre, cx = world x (m) at screen x 540
  const camera = (p: number) => {
    if (p < 0) {
      const e = p + 1, s = lerpLog(pairS(-1), pairS(0), e);
      const ax = 540 * (1 - e) + xs[0].l * e;
      return {s, cx: centers[0] - (ax - 540) / s};
    }
    const k = Math.min(Math.floor(p), NP - 1), e = p - k;
    if (k >= NP - 1) return {s: pairS(NP - 1), cx: centers[NP] - (xs[NP - 1].r - 540) / pairS(NP - 1)};
    const s = lerpLog(pairS(k), pairS(k + 1), e);
    const ax = xs[k].r * (1 - e) + xs[k + 1].l * e;
    return {s, cx: centers[k + 1] - (ax - 540) / s};
  };
  const sepAt = (p: number) => (p < 0 ? 1000 : xs[Math.min(Math.round(p), NP - 1)].sep);
  return {centers, progress, camera, duration, pairStart, NP, sepAt};
};
