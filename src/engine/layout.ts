import {Easing} from 'remotion';
import {Item, Timing} from './types';

// Pair k shows items k (left) and k+1 (right). Pair -1 shows item 0 alone.
export const makeLayout = (items: Item[], t: Timing, opts = {maxD: 440, maxW: 760, gap: 70}) => {
  const N = items.length, NP = N - 1;
  // screen diameter of the larger item in each pair, limited so its glow/disk fits
  const pairD = (k: number) => Math.min(opts.maxD, opts.maxW / items[k + 1].ext);
  const pairS = (k: number) => (k < 0 ? Math.min(opts.maxD, opts.maxW / items[0].ext) / items[0].km : pairD(k) / items[k + 1].km);
  const half = (i: number, s: number) => (items[i].ext * items[i].km * s) / 2;
  const xs: {l: number; r: number}[] = [];
  const centers = [0];
  for (let k = 0; k < NP; k++) {
    const s = pairS(k), wl = half(k, s), wr = half(k + 1, s);
    const total = 2 * wl + opts.gap + 2 * wr;
    const l = 540 - total / 2 + wl, r = l + wl + opts.gap + wr;
    xs.push({l, r});
    centers.push(centers[k] + (r - l) / s);
  }
  const ease = Easing.inOut(Easing.cubic);
  const pairStart = (k: number) => t.intro + t.move + k * (t.hold + t.move); // pair k fully in place
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
  return {centers, progress, camera, duration, pairStart, NP};
};
