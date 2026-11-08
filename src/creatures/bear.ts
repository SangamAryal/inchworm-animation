import {V} from './geom';
import {Spec} from './rig';
import {blob, crease, light, line} from './detail';
import {rng} from '../engine/noise';

// Grizzly bear in a gallop. Shoulder hump ~1.1 m, body ~1.9 m.
const paw = {foot: 'paw' as const, footH: 0.08, footL: 0.22, footW: 0.13};
// shaggy underside: jitter points along the belly line
const R = rng(31);
const belly: V[] = Array.from({length: 11}, (_, i) => {
  const x = 0.5 - i * 0.12;
  const y = 0.47 + 0.05 * Math.sin(i * 0.6) + (i % 2 ? -0.035 : 0.01) + (R() - 0.5) * 0.02;
  return [x, y];
});
export const BEAR: Spec = {
  stride: 2.4, duty: 0.3, height: 1.3,
  torso: [
    [-0.9, 0.76], [-0.82, 0.95], [-0.62, 1.03], [-0.3, 1.02], [0.0, 1.03], [0.28, 1.14], [0.48, 1.1], [0.64, 0.94],
    [0.68, 0.74], [0.6, 0.55], ...belly, [-0.82, 0.56], [-0.9, 0.64],
  ],
  flex: {amp: 0.14, phase: 0.02, x: -0.1, y: 0.8},
  bob: {amp: 0.05, phase: 0.85},
  pitch: {amp: 0.05, phase: 0.2},
  head: {
    pivot: [0.55, 0.86], base: -0.06, nod: 0.08, nodPhase: 0.4, eye: [0.93, 0.9], eyeR: 0.016,
    outline: [
      [0.4, 1.08], [0.66, 1.03], [0.82, 1.0], [0.92, 0.96], [1.02, 0.88], [1.12, 0.83], [1.18, 0.79], [1.17, 0.73],
      [1.08, 0.7], [0.99, 0.68], [0.88, 0.69], [0.76, 0.64], [0.63, 0.56], [0.5, 0.58],
    ],
  },
  fur: {len: 0.035, rough: 0.03, grain: 0.07, round: 0.2},
  limbs: [
    {side: 'far', attach: 'rear', pivot: [-0.62, 0.7], a: 0.38, b: 0.22, wa: [0.32, 0.14], wb: [0.13, 0.12], bend: -1, ...paw, phase: 0, reach: 0.08, sweep: 0.75, lift: 0.22, curl: 0.9, liftAt: 0.4},
    {side: 'near', attach: 'rear', pivot: [-0.58, 0.7], a: 0.38, b: 0.22, wa: [0.34, 0.14], wb: [0.13, 0.12], bend: -1, ...paw, phase: 0.1, reach: 0.08, sweep: 0.75, lift: 0.22, curl: 0.9, liftAt: 0.4},
    {side: 'far', attach: 'front', pivot: [0.42, 0.66], a: 0.34, b: 0.22, wa: [0.26, 0.14], wb: [0.13, 0.12], bend: 1, ...paw, phase: 0.36, reach: 0.18, sweep: 0.8, lift: 0.26, curl: 1.2, fwd0: 0.2, liftAt: 0.35},
    {side: 'near', attach: 'front', pivot: [0.46, 0.66], a: 0.34, b: 0.22, wa: [0.27, 0.14], wb: [0.13, 0.12], bend: 1, ...paw, phase: 0.47, reach: 0.18, sweep: 0.8, lift: 0.26, curl: 1.2, fwd0: 0.2, liftAt: 0.35},
  ],
  shapes: [
    crease('torso', [[0.36, 1.08], [0.42, 0.85], [0.5, 0.62]], 0.04, 0.35),
    crease('torso', [[-0.45, 0.98], [-0.5, 0.78], [-0.58, 0.6]], 0.045, 0.3),
    crease('head', [[0.84, 0.97], [0.92, 0.94], [0.98, 0.9]], 0.018, 0.4),
    line('head', [[1.0, 0.705], [1.08, 0.715], [1.13, 0.73]], 0.008, 0.7, '#120a07', 'over'),
    blob('head', [[1.02, 0.86], [1.14, 0.82], [1.16, 0.76], [1.06, 0.76]], '#a88563', 0.35),
    // grizzled silver tips over the hump and back, small round ears, dark nose
    {frame: 'torso', fill: '#C6A47E', opacity: 0.3, clip: true, soft: true, pts: [[-0.7, 1.0], [-0.2, 1.05], [0.3, 1.18], [0.55, 1.05], [0.4, 0.95], [-0.1, 0.92], [-0.6, 0.92]]},
    {frame: 'head', fill: '#C6A47E', opacity: 0.25, clip: true, soft: true, pts: [[0.6, 1.05], [0.85, 1.0], [0.95, 0.92], [0.75, 0.9]]},
    {frame: 'head', fill: '#6a4a32', pts: [[0.76, 0.98], [0.75, 1.07], [0.8, 1.1], [0.85, 1.06], [0.84, 0.99]]},
    {frame: 'head', fill: '#120b08', pts: [[1.13, 0.81], [1.18, 0.8], [1.19, 0.75], [1.15, 0.75]]},
  ],
  colors: {top: '#8A6343', mid: '#5E3F28', bottom: '#2A1B12', far: '#24170f', rim: '#ffbf86', limb: '#4f3421', limbFar: '#22160f'},
};
