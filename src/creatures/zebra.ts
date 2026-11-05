import {V} from './geom';
import {Shape, Spec} from './rig';
import {HORSE} from './horse';
import {crease, light, line, strands} from './detail';
import {scaleSpec} from './derive';

// Plains zebra: the horse rig at 0.82 scale (shoulder ~1.35 m), stockier neck, upright mane and stripes.
const INK = '#16110f';
// a stripe band following a centre line, width tapering from w0 to w1
const band = (frame: 'torso' | 'head', c: V[], w0: number, w1: number, opacity = 0.92): Shape => {
  const L: V[] = [], R: V[] = [];
  c.forEach((p, i) => {
    const a = c[Math.max(0, i - 1)], b = c[Math.min(c.length - 1, i + 1)];
    const dx = b[0] - a[0], dy = b[1] - a[1], n = Math.hypot(dx, dy) || 1;
    const w = (w0 + (w1 - w0) * (i / (c.length - 1))) / 2;
    L.push([p[0] - (dy / n) * w, p[1] + (dx / n) * w]);
    R.push([p[0] + (dy / n) * w, p[1] - (dx / n) * w]);
  });
  return {frame, pts: [...L, ...R.reverse()], fill: INK, opacity, clip: true};
};

const bodyStripes: Shape[] = [];
// barrel: near-vertical stripes curving back toward the belly
for (let x = 0.78; x > -0.42; x -= 0.115) {
  const lean = 0.08 + (0.78 - x) * 0.04;
  bodyStripes.push(band('torso', [[x, 1.75], [x - lean * 0.4, 1.4], [x - lean, 1.1], [x - lean * 1.6, 0.82]], 0.055, 0.02));
}
// haunch: broad bands sweeping from the croup down the hindquarters
for (let k = 0; k < 4; k++) {
  const y = 1.62 - k * 0.15;
  bodyStripes.push(band('torso', [[-0.42, y + 0.06], [-0.6, y], [-0.78, y - 0.06], [-0.95, y - 0.16]], 0.06, 0.045));
}
// neck: bands across the neck, then thin face stripes and a dark muzzle
const neckStripes: Shape[] = [];
for (let k = 0; k < 7; k++) {
  const u = k / 6, cx = 0.56 + u * 0.44, cy = 1.4 + u * 0.56;
  neckStripes.push(band('head', [[cx - 0.24, cy + 0.2], [cx, cy], [cx + 0.24, cy - 0.2]], 0.06, 0.045));
}
for (let k = 0; k < 5; k++) {
  const x = 1.16 + k * 0.07;
  neckStripes.push(band('head', [[x - 0.06, 2.1 - k * 0.07], [x, 1.95 - k * 0.07], [x + 0.06, 1.78 - k * 0.07]], 0.028, 0.02, 0.85));
}

const base = HORSE.shapes ?? [];
export const ZEBRA: Spec = scaleSpec({
  ...HORSE,
  stride: 2.4,
  fur: {len: 0.01, rough: 0.004, grain: 0.03},
  head: {...HORSE.head, base: -0.14},
  tail: {...HORSE.tail!, pts: [[-0.86, 1.52], [-1.0, 1.48], [-1.12, 1.36], [-1.18, 1.2], [-1.2, 1.08]], ws: [0.08, 0.07, 0.06, 0.06, 0.1], color: '#2a2422'},
  limbs: HORSE.limbs.map((L) => ({...L, wa: [L.wa[0] * 1.08, L.wa[1] * 1.12] as [number, number], wb: [L.wb[0] * 1.12, L.wb[1] * 1.12] as [number, number]})),
  shapes: [
    ...base.slice(0, 11), // muscle forms
    ...bodyStripes,
    ...neckStripes,
    light('torso', [[-0.6, 1.0], [0.2, 0.92], [0.6, 0.98], [0.2, 1.1], [-0.5, 1.12]], 0.25, '#fff4e4'),
    {frame: 'head', fill: '#1d1715', opacity: 0.9, clip: true, soft: 'fine', pts: [[1.36, 1.92], [1.6, 1.68], [1.58, 1.5], [1.4, 1.54], [1.28, 1.7]]},
    crease('head', [[1.12, 1.94], [1.2, 1.86], [1.32, 1.8]], 0.022, 0.3),
    line('head', [[1.5, 1.63], [1.53, 1.65], [1.555, 1.62]], 0.014, 0.85, '#050303', 'over'),
    // big ears with dark tips
    {frame: 'head', fill: '#d9d0c3', pts: [[1.06, 2.08], [0.96, 2.32], [1.02, 2.34], [1.17, 2.11]]},
    {frame: 'head', fill: INK, opacity: 0.85, pts: [[0.98, 2.27], [0.96, 2.32], [1.02, 2.34], [1.04, 2.27]]},
    {frame: 'head', fill: '#3a312c', opacity: 0.5, pts: [[1.08, 2.1], [1.01, 2.26], [1.12, 2.12]]},
    // short upright mane, striped
    {frame: 'head', fill: INK, opacity: 0.92, soft: 'fine', pts: [[0.4, 1.64], [0.36, 1.72], [0.58, 1.88], [0.8, 2.03], [1.0, 2.16], [1.1, 2.18], [1.1, 2.1], [0.98, 2.04], [0.82, 1.94], [0.62, 1.8]]},
    ...[[0.46, 1.74], [0.58, 1.82], [0.7, 1.9], [0.82, 1.98], [0.94, 2.06]].map(([x, y]) => band('head', [[x, y - 0.06], [x - 0.04, y + 0.06]], 0.045, 0.04, 0.9)).map((b) => ({...b, fill: '#e3dbcf', clip: false})),
  ],
  colors: {top: '#efe7da', mid: '#d6ccbd', bottom: '#5f5853', far: '#2f2a28', rim: '#ffdcb4', limb: '#cfc5b7', limbFar: '#26211f'},
  stripes: {color: INK, period: 0.075},
}, 0.82);
