import {Spec} from './rig';

// A sprinter at top speed: ~2.3 strides per second, very short ground contact. Height 1.95 m.
const shoe = {foot: 'shoe' as const, footH: 0.08, footL: 0.27, footW: 0.1};
export const HUMAN: Spec = {
  stride: 2.3, duty: 0.2, height: 2.0,
  torso: [
    [-0.12, 0.86], [-0.165, 0.98], [-0.135, 1.12], [-0.11, 1.25], [-0.135, 1.38], [-0.13, 1.5], [-0.08, 1.57], [0.02, 1.59],
    [0.09, 1.54], [0.13, 1.43], [0.135, 1.3], [0.1, 1.16], [0.11, 1.0], [0.08, 0.88],
  ],
  flex: {amp: 0.0, phase: 0, x: 0, y: 1.1},
  bob: {amp: 0.035, phase: 0.35},
  pitch: {amp: 0.02, phase: 0.1, base: -0.2},
  head: {
    pivot: [0.0, 1.56], base: 0.14, nod: 0.02, nodPhase: 0.2, eye: [0.085, 1.79], eyeR: 0.009,
    outline: [
      [-0.045, 1.54], [-0.05, 1.67], [-0.095, 1.73], [-0.09, 1.83], [-0.035, 1.895], [0.045, 1.9], [0.1, 1.855], [0.115, 1.79],
      [0.14, 1.75], [0.13, 1.725], [0.12, 1.705], [0.122, 1.68], [0.09, 1.65], [0.05, 1.64], [0.045, 1.55],
    ],
  },
  limbs: [
    // far arm and leg are drawn behind; arms swing opposite to the legs
    {side: 'far', attach: 'front', pivot: [0.0, 1.45], a: 0.31, b: 0.28, wa: [0.09, 0.07], wb: [0.065, 0.05], bend: 1, foot: 'hand', footH: 0, footL: 0.09, footW: 0.07, phase: 0.25, reach: 0, sweep: 0, lift: 0, curl: 0, swing: {base: 0.1, amp: 1.0, elbow: 1.35, elbowAmp: 0.35}},
    {side: 'far', attach: 'rear', pivot: [0.0, 0.98], a: 0.47, b: 0.46, wa: [0.17, 0.1], wb: [0.095, 0.06], bend: 1, ...shoe, phase: 0.5, reach: 0.0, sweep: 0.75, lift: 0.55, curl: 0.5, fwd0: 0.18, liftAt: 0.32},
    {side: 'near', attach: 'rear', pivot: [0.0, 0.98], a: 0.47, b: 0.46, wa: [0.18, 0.1], wb: [0.095, 0.06], bend: 1, ...shoe, phase: 0, reach: 0.0, sweep: 0.75, lift: 0.55, curl: 0.5, fwd0: 0.18, liftAt: 0.32},
    {side: 'near', attach: 'front', pivot: [0.0, 1.45], a: 0.31, b: 0.28, wa: [0.095, 0.07], wb: [0.065, 0.05], bend: 1, foot: 'hand', footH: 0, footL: 0.09, footW: 0.07, phase: 0.75, reach: 0, sweep: 0, lift: 0, curl: 0, swing: {base: 0.1, amp: 1.0, elbow: 1.35, elbowAmp: 0.35}},
  ],
  shapes: [
    // singlet, shorts, short hair
    {frame: 'torso', fill: '#3C566E', clip: true, pts: [[-0.2, 1.08], [0.2, 1.08], [0.2, 1.6], [0.03, 1.62], [-0.02, 1.5], [-0.2, 1.6]]},
    {frame: 'torso', fill: '#1E2530', clip: true, pts: [[-0.2, 0.84], [0.2, 0.84], [0.2, 1.08], [-0.2, 1.08]]},
    {frame: 'head', fill: '#120c0a', clip: true, pts: [[-0.12, 1.74], [-0.1, 1.92], [0.08, 1.93], [0.12, 1.84], [0.06, 1.86], [-0.02, 1.84], [-0.05, 1.76]]},
  ],
  colors: {top: '#8a5a40', mid: '#6a4532', bottom: '#2c1d16', far: '#2a1b14', rim: '#ffc392', limb: '#6a4532', limbFar: '#2a1b14'},
};
