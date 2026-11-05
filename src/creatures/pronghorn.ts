import {Spec} from './rig';

// Pronghorn in a transverse gallop. Shoulder ~0.9 m, body ~1.3 m.
const hoof = {foot: 'hoof' as const, footH: 0.09, footL: 0.07, footW: 0.06};
const WHITE = '#EADBC6';
export const PRONGHORN: Spec = {
  stride: 2.9, duty: 0.24, height: 1.65,
  torso: [
    [-0.62, 0.84], [-0.52, 0.97], [-0.25, 0.99], [0.08, 0.97], [0.3, 1.03], [0.46, 0.96], [0.55, 0.8], [0.47, 0.63],
    [0.16, 0.58], [-0.18, 0.62], [-0.36, 0.67], [-0.48, 0.63], [-0.6, 0.7],
  ],
  flex: {amp: 0.1, phase: 0.02, x: -0.05, y: 0.8},
  bob: {amp: 0.035, phase: 0.85},
  pitch: {amp: 0.04, phase: 0.2},
  head: {
    pivot: [0.42, 0.88], base: -0.12, nod: 0.08, nodPhase: 0.45, eye: [0.79, 1.3], eyeR: 0.016,
    outline: [
      [0.24, 1.0], [0.48, 1.16], [0.63, 1.31], [0.72, 1.38], [0.8, 1.35], [0.92, 1.2], [0.97, 1.13], [0.95, 1.08],
      [0.88, 1.09], [0.77, 1.17], [0.67, 1.2], [0.59, 1.04], [0.55, 0.84], [0.4, 0.8],
    ],
  },
  tail: {root: [-0.6, 0.92], pts: [[-0.6, 0.92], [-0.66, 0.9], [-0.7, 0.86]], ws: [0.06, 0.06, 0.03], wave: 0.2, phase: 0.3},
  limbs: [
    {side: 'far', attach: 'rear', pivot: [-0.44, 0.78], a: 0.43, b: 0.33, wa: [0.18, 0.05], wb: [0.035, 0.035], bend: -1, ...hoof, phase: 0, reach: 0.08, sweep: 0.8, lift: 0.28, curl: 1.2, liftAt: 0.4},
    {side: 'near', attach: 'rear', pivot: [-0.42, 0.78], a: 0.43, b: 0.33, wa: [0.19, 0.05], wb: [0.035, 0.035], bend: -1, ...hoof, phase: 0.1, reach: 0.08, sweep: 0.8, lift: 0.28, curl: 1.2, liftAt: 0.4},
    {side: 'far', attach: 'front', pivot: [0.36, 0.74], a: 0.37, b: 0.31, wa: [0.12, 0.045], wb: [0.034, 0.034], bend: 1, ...hoof, phase: 0.34, reach: 0.18, sweep: 0.85, lift: 0.36, curl: 1.8, fwd0: 0.22, liftAt: 0.35},
    {side: 'near', attach: 'front', pivot: [0.38, 0.74], a: 0.37, b: 0.31, wa: [0.13, 0.045], wb: [0.034, 0.034], bend: 1, ...hoof, phase: 0.45, reach: 0.18, sweep: 0.85, lift: 0.36, curl: 1.8, fwd0: 0.22, liftAt: 0.35},
  ],
  shapes: [
    // white belly and flank, white rump patch, throat bands, dark mask, horns and ear
    {frame: 'torso', fill: WHITE, opacity: 0.85, clip: true, pts: [[0.5, 0.74], [0.3, 0.76], [0.0, 0.78], [-0.3, 0.8], [-0.5, 0.78], [-0.5, 0.55], [0.5, 0.55]]},
    {frame: 'torso', fill: WHITE, opacity: 0.9, clip: true, pts: [[-0.66, 0.95], [-0.5, 0.94], [-0.45, 0.8], [-0.52, 0.66], [-0.66, 0.68]]},
    {frame: 'head', fill: WHITE, opacity: 0.85, clip: true, pts: [[0.5, 1.02], [0.62, 1.14], [0.7, 1.12], [0.58, 0.98]]},
    {frame: 'head', fill: WHITE, opacity: 0.85, clip: true, pts: [[0.57, 0.9], [0.62, 1.0], [0.68, 0.98], [0.62, 0.86]]},
    {frame: 'head', fill: '#1d1310', opacity: 0.85, clip: true, pts: [[0.82, 1.3], [0.92, 1.2], [1.0, 1.12], [0.96, 1.04], [0.86, 1.08], [0.8, 1.2]]},
    {frame: 'head', fill: '#120c0b', pts: [[0.7, 1.37], [0.745, 1.37], [0.765, 1.47], [0.81, 1.5], [0.765, 1.52], [0.755, 1.59], [0.71, 1.64], [0.685, 1.61], [0.715, 1.57], [0.705, 1.48]]},
    {frame: 'head', fill: '#8a5e38', pts: [[0.66, 1.36], [0.6, 1.47], [0.7, 1.39]]},
  ],
  colors: {top: '#BC8752', mid: '#9C6B3E', bottom: '#4D3422', far: '#3f2b1e', rim: '#ffc996', limb: '#a87545', limbFar: '#3a281c'},
};
