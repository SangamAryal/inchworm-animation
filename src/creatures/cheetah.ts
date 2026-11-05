import {V} from './geom';
import {Shape, Spec} from './rig';
import {rng} from '../engine/noise';

// Cheetah in a rotary gallop with a very flexible spine. Shoulder ~0.8 m, body 1.2 m.
const paw = {foot: 'paw' as const, footH: 0.06, footL: 0.1, footW: 0.06};

const spots = (seed: number, n: number, box: [number, number, number, number], r: number, frame: 'torso' | 'head'): Shape[] => {
  const R = rng(seed);
  return Array.from({length: n}, () => {
    const cx = box[0] + R() * (box[2] - box[0]), cy = box[1] + R() * (box[3] - box[1]);
    const rr = r * (0.6 + R() * 0.6), a = R() * 3;
    const pts: V[] = Array.from({length: 7}, (_, i) => {
      const t = (i / 7) * Math.PI * 2;
      return [cx + Math.cos(t + a) * rr * (1 + 0.25 * Math.sin(3 * t)), cy + Math.sin(t + a) * rr * 0.85];
    });
    return {frame, pts, fill: '#21140c', opacity: 0.7, clip: true};
  });
};

export const CHEETAH: Spec = {
  stride: 3.0, duty: 0.22, height: 0.98,
  torso: [
    [-0.55, 0.68], [-0.46, 0.79], [-0.26, 0.81], [-0.04, 0.79], [0.16, 0.81], [0.32, 0.87], [0.46, 0.81],
    [0.54, 0.66], [0.5, 0.5], [0.4, 0.41], [0.2, 0.41], [0.02, 0.47], [-0.15, 0.55], [-0.3, 0.57], [-0.42, 0.53], [-0.54, 0.56],
  ],
  flex: {amp: 0.32, phase: 0.98, x: -0.05, y: 0.66},
  bob: {amp: 0.035, phase: 0.75},
  pitch: {amp: 0.04, phase: 0.25},
  head: {
    pivot: [0.44, 0.7], base: 0.02, nod: -0.05, nodPhase: 0.25, eye: [0.78, 0.83], eyeR: 0.012,
    outline: [
      [0.26, 0.84], [0.5, 0.9], [0.66, 0.89], [0.76, 0.87], [0.84, 0.82], [0.88, 0.77], [0.88, 0.73], [0.84, 0.71],
      [0.77, 0.7], [0.7, 0.72], [0.64, 0.7], [0.57, 0.62], [0.5, 0.56], [0.4, 0.58],
    ],
  },
  tail: {root: [-0.58, 0.74], pts: [[-0.58, 0.74], [-0.76, 0.68], [-0.96, 0.62], [-1.14, 0.6], [-1.3, 0.64]], ws: [0.07, 0.055, 0.05, 0.05, 0.05], wave: 0.25, phase: 0.2},
  limbs: [
    {side: 'far', attach: 'rear', pivot: [-0.42, 0.68], a: 0.37, b: 0.27, wa: [0.17, 0.055], wb: [0.045, 0.04], bend: -1, ...paw, phase: 0, reach: 0.12, sweep: 0.75, lift: 0.22, curl: 1.0, liftAt: 0.4},
    {side: 'near', attach: 'rear', pivot: [-0.4, 0.68], a: 0.37, b: 0.27, wa: [0.18, 0.055], wb: [0.045, 0.04], bend: -1, ...paw, phase: 0.08, reach: 0.12, sweep: 0.75, lift: 0.22, curl: 1.0, liftAt: 0.4},
    {side: 'near', attach: 'front', pivot: [0.36, 0.66], a: 0.35, b: 0.24, wa: [0.12, 0.05], wb: [0.042, 0.04], bend: 1, ...paw, phase: 0.48, reach: 0.18, sweep: 0.8, lift: 0.26, curl: 1.4, fwd0: 0.2, liftAt: 0.35},
    {side: 'far', attach: 'front', pivot: [0.38, 0.66], a: 0.35, b: 0.24, wa: [0.12, 0.05], wb: [0.042, 0.04], bend: 1, ...paw, phase: 0.58, reach: 0.18, sweep: 0.8, lift: 0.26, curl: 1.4, fwd0: 0.2, liftAt: 0.35},
  ],
  shapes: [
    // pale belly and throat
    {frame: 'torso', fill: '#e8cfa4', opacity: 0.35, clip: true, soft: true, pts: [[0.5, 0.5], [0.2, 0.46], [-0.2, 0.56], [-0.2, 0.5], [0.2, 0.4], [0.5, 0.42]]},
    ...spots(4, 110, [-0.56, 0.45, 0.5, 0.86], 0.013, 'torso'),
    ...spots(9, 10, [0.62, 0.78, 0.8, 0.88], 0.008, 'head'),
    // ear, tear line, nose
    {frame: 'head', fill: '#8c6034', pts: [[0.62, 0.88], [0.64, 0.94], [0.69, 0.89]]},
    {frame: 'head', fill: '#120a07', open: true, stroke: 0.012, pts: [[0.785, 0.815], [0.8, 0.77], [0.82, 0.73]], layer: 'over'},
    {frame: 'head', fill: '#120a07', pts: [[0.86, 0.79], [0.885, 0.775], [0.875, 0.75]]},
  ],
  colors: {top: '#c38d4e', mid: '#a5713c', bottom: '#5e3d23', far: '#4d321f', rim: '#ffcf96', limb: '#a06c3a', limbFar: '#463021'},
};
