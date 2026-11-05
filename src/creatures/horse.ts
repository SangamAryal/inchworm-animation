import {Spec} from './rig';

// Thoroughbred in a transverse gallop (right lead). Metres, origin under the girth.
// Proportions: withers 1.65 m, body 1.7 m point-of-shoulder to buttock.
const hoof = {foot: 'hoof' as const, footH: 0.17, footL: 0.13, footW: 0.105};
export const HORSE: Spec = {
  stride: 2.3, duty: 0.3, height: 2.2,
  torso: [
    [-0.9, 1.36], [-0.82, 1.53], [-0.64, 1.63], [-0.36, 1.61], [-0.05, 1.55], [0.25, 1.57], [0.45, 1.67], [0.62, 1.6],
    [0.82, 1.38], [0.9, 1.2], [0.83, 1.02], [0.64, 0.9], [0.3, 0.84], [0.0, 0.86], [-0.3, 0.93], [-0.46, 1.0], [-0.6, 0.96], [-0.76, 1.02], [-0.87, 1.18],
  ],
  flex: {amp: 0.06, phase: 0.05, x: -0.05, y: 1.25},
  bob: {amp: 0.05, phase: 0.85},
  pitch: {amp: 0.035, phase: 0.2},
  head: {
    pivot: [0.55, 1.35], base: -0.2, nod: 0.1, nodPhase: 0.45, eye: [1.2, 1.97], eyeR: 0.022,
    outline: [
      [0.38, 1.66], [0.7, 1.86], [0.96, 2.02], [1.1, 2.1], [1.2, 2.07], [1.36, 1.9], [1.5, 1.72], [1.56, 1.64], [1.55, 1.58],
      [1.49, 1.55], [1.42, 1.58], [1.3, 1.66], [1.2, 1.74], [1.1, 1.78], [0.97, 1.6], [0.88, 1.36], [0.84, 1.12], [0.55, 1.15],
    ],
  },
  tail: {root: [-0.86, 1.5], pts: [[-0.86, 1.5], [-1.02, 1.5], [-1.2, 1.42], [-1.36, 1.28], [-1.46, 1.1]], ws: [0.09, 0.14, 0.16, 0.14, 0.04], wave: 0.14, phase: 0.3},
  limbs: [
    {side: 'far', attach: 'rear', pivot: [-0.62, 1.16], a: 0.6, b: 0.38, wa: [0.3, 0.085], wb: [0.07, 0.075], bend: -1, ...hoof, phase: 0, reach: 0.05, sweep: 0.95, lift: 0.38, curl: 1.2, liftAt: 0.4},
    {side: 'near', attach: 'rear', pivot: [-0.59, 1.16], a: 0.6, b: 0.38, wa: [0.32, 0.085], wb: [0.07, 0.075], bend: -1, ...hoof, phase: 0.1, reach: 0.05, sweep: 0.95, lift: 0.38, curl: 1.2, liftAt: 0.4},
    {side: 'far', attach: 'front', pivot: [0.5, 1.12], a: 0.56, b: 0.32, wa: [0.24, 0.085], wb: [0.065, 0.075], bend: 1, ...hoof, phase: 0.32, reach: 0.22, sweep: 1.0, lift: 0.5, curl: 1.9, fwd0: 0.25, liftAt: 0.35},
    {side: 'near', attach: 'front', pivot: [0.54, 1.12], a: 0.56, b: 0.32, wa: [0.25, 0.085], wb: [0.065, 0.075], bend: 1, ...hoof, phase: 0.44, reach: 0.22, sweep: 1.0, lift: 0.5, curl: 1.9, fwd0: 0.25, liftAt: 0.35},
  ],
  shapes: [
    // mane along the crest, ear, nostril, cheek
    {frame: 'head', fill: '#1b1113', pts: [[0.42, 1.68], [0.7, 1.89], [0.97, 2.06], [1.12, 2.13], [1.06, 2.02], [0.9, 1.92], [0.75, 1.84], [0.6, 1.74], [0.45, 1.6]]},
    {frame: 'head', fill: '#4e2d20', pts: [[1.07, 2.08], [1.0, 2.25], [1.16, 2.1]]},
    {frame: 'head', fill: '#120a0b', opacity: 0.6, pts: [[1.5, 1.63], [1.53, 1.66], [1.54, 1.62]]},
    {frame: 'head', fill: '#2a1712', opacity: 0.35, clip: true, soft: true, pts: [[1.12, 1.78], [1.24, 1.86], [1.32, 1.72], [1.2, 1.64]]},
    // muscle light on the shoulder and quarters
    {frame: 'torso', fill: '#c48a62', opacity: 0.12, clip: true, soft: true, pts: [[0.3, 1.5], [0.55, 1.58], [0.78, 1.36], [0.7, 1.1], [0.45, 1.15]]},
    {frame: 'torso', fill: '#c48a62', opacity: 0.1, clip: true, soft: true, pts: [[-0.82, 1.42], [-0.55, 1.58], [-0.32, 1.42], [-0.42, 1.08], [-0.75, 1.08]]},
  ],
  colors: {top: '#80503a', mid: '#5f3727', bottom: '#2b1b17', far: '#241519', rim: '#f4b383', limb: '#4a2b22', limbFar: '#1f1316'},
};
