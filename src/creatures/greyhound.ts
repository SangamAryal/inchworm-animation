import {Shape, Spec} from './rig';
import {CHEETAH} from './cheetah';
import {crease, light, line} from './detail';
import {scaleSpec} from './derive';

// Greyhound in a rotary gallop: the cheetah rig at 0.86 scale (shoulder ~0.72 m), long narrow head, thin whip tail, brindle coat.
const W = '#e9e4df';
export const GREYHOUND: Spec = scaleSpec({
  ...CHEETAH,
  stride: 3.5,
  fur: {len: 0.006, rough: 0, grain: 0.03, round: 0.14},
  torso: [
    [-0.55, 0.68], [-0.46, 0.8], [-0.26, 0.83], [-0.04, 0.81], [0.16, 0.81], [0.32, 0.86], [0.46, 0.8],
    [0.54, 0.64], [0.5, 0.46], [0.4, 0.36], [0.2, 0.36], [0.02, 0.44], [-0.15, 0.56], [-0.3, 0.6], [-0.42, 0.55], [-0.54, 0.57],
  ],
  head: {
    pivot: [0.44, 0.7], base: 0.08, nod: -0.04, nodPhase: 0.25, eye: [0.705, 0.925], eyeR: 0.01,
    outline: [
      [0.26, 0.84], [0.44, 0.93], [0.56, 0.975], [0.64, 0.985], [0.71, 0.965], [0.8, 0.91], [0.9, 0.85], [0.95, 0.82], [0.955, 0.79],
      [0.92, 0.765], [0.84, 0.76], [0.76, 0.775], [0.68, 0.8], [0.6, 0.76], [0.54, 0.66], [0.48, 0.56], [0.38, 0.56],
    ],
  },
  tail: {root: [-0.56, 0.75], pts: [[-0.56, 0.75], [-0.68, 0.66], [-0.76, 0.54], [-0.8, 0.44], [-0.76, 0.36]], ws: [0.045, 0.03, 0.022, 0.016, 0.01], wave: 0.2, phase: 0.2},
  limbs: CHEETAH.limbs.map((L) => ({...L, a: L.a * 1.05, b: L.b * 1.08, wa: [L.wa[0] * 0.92, L.wa[1] * 0.85] as [number, number], wb: [L.wb[0] * 0.85, L.wb[1] * 0.85] as [number, number]})),
  shapes: [
    crease('torso', [[0.3, 0.84], [0.36, 0.64], [0.46, 0.48]], 0.02, 0.35),
    crease('torso', [[-0.3, 0.78], [-0.34, 0.64], [-0.4, 0.57]], 0.025, 0.32),
    crease('torso', [[0.24, 0.72], [0.1, 0.6], [0.0, 0.5]], 0.02, 0.25),
    light('torso', [[-0.5, 0.8], [0.0, 0.82], [0.35, 0.86], [0.2, 0.74], [-0.3, 0.72]], 0.2),
    // white chest and throat
    {frame: 'torso', fill: W, opacity: 0.85, clip: true, soft: 'fine', pts: [[0.56, 0.66], [0.5, 0.42], [0.36, 0.34], [0.3, 0.4], [0.4, 0.5], [0.46, 0.66]]},
    {frame: 'head', fill: W, opacity: 0.8, clip: true, soft: 'fine', pts: [[0.6, 0.78], [0.56, 0.66], [0.48, 0.56], [0.5, 0.66], [0.56, 0.8]]},
    // folded rose ear, nose, mouth line
    {frame: 'head', fill: '#2a1d16', pts: [[0.64, 0.975], [0.56, 1.0], [0.47, 0.985], [0.5, 0.96], [0.58, 0.955]]},
    {frame: 'head', fill: '#0d0b0e', pts: [[0.935, 0.83], [0.958, 0.815], [0.955, 0.785], [0.93, 0.795]]},
    line('head', [[0.93, 0.78], [0.84, 0.775], [0.74, 0.8]], 0.006, 0.7, '#0d0b0e', 'over'),
    // brindle: faint dark streaks over the fawn coat
    ...Array.from({length: 16}, (_, i) => -0.5 + i * 0.065).map((x, i): Shape => ({frame: 'torso', clip: true, soft: 'fine', fill: '#2a1a12', opacity: 0.32,
      pts: [[x, 0.9], [x + 0.022, 0.9], [x - 0.02 - (i % 3) * 0.01, 0.6], [x - 0.04, 0.42], [x - 0.05, 0.42], [x - 0.04 - (i % 3) * 0.01, 0.6]]})),
    crease('head', [[0.66, 0.94], [0.74, 0.92], [0.8, 0.88]], 0.012, 0.3),
  ],
  colors: {top: '#9a7558', mid: '#7a5940', bottom: '#3a2a20', far: '#2e2119', rim: '#ffd2b0', limb: '#86664c', limbFar: '#2b1f18'},
}, 0.86);
