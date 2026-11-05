import {Spec} from './rig';
import {blob, crease, light, line} from './detail';

// Asian elephant at its fastest "amble": a lateral-sequence gait that never has all four feet off the ground.
// Shoulder ~2.7 m, body ~3 m.
const pad = {foot: 'pad' as const, footH: 0.16, footL: 0.3, footW: 0.44};
export const ELEPHANT: Spec = {
  stride: 1.5, duty: 0.52, height: 3.05,
  torso: [
    [-1.45, 1.85], [-1.38, 2.25], [-1.15, 2.55], [-0.6, 2.78], [0.0, 2.8], [0.5, 2.72], [0.95, 2.55], [1.22, 2.25],
    [1.3, 1.85], [1.18, 1.45], [0.7, 1.28], [0.0, 1.22], [-0.6, 1.28], [-1.05, 1.42], [-1.35, 1.58],
  ],
  flex: {amp: 0.015, phase: 0.1, x: 0, y: 2},
  bob: {amp: 0.045, phase: 0.1},
  pitch: {amp: 0.015, phase: 0.3},
  head: {
    pivot: [1.05, 2.3], base: 0, nod: 0.04, nodPhase: 0.3, eye: [1.72, 2.42], eyeR: 0.028,
    outline: [
      [0.9, 2.6], [1.15, 2.88], [1.38, 3.02], [1.58, 2.98], [1.74, 2.82], [1.9, 2.55], [1.98, 2.25], [1.95, 2.0],
      [1.82, 1.86], [1.62, 1.8], [1.45, 1.88], [1.25, 1.9], [1.05, 1.95],
    ],
  },
  trunk: {root: [1.9, 2.15], pts: [[1.9, 2.15], [1.98, 1.75], [2.02, 1.35], [2.0, 0.98], [1.95, 0.68], [2.02, 0.48]], ws: [0.36, 0.3, 0.24, 0.19, 0.15, 0.12], wave: 0.12, phase: 0.2},
  tail: {root: [-1.4, 2.25], pts: [[-1.4, 2.25], [-1.55, 2.0], [-1.6, 1.75], [-1.62, 1.55]], ws: [0.1, 0.06, 0.05, 0.08], wave: 0.25, phase: 0.1},
  fur: {len: 0.025, rough: 0.004, grain: 0.06, round: 0.3},
  limbs: [
    {side: 'near', attach: 'rear', pivot: [-0.95, 1.62], a: 0.82, b: 0.62, wa: [0.62, 0.38], wb: [0.36, 0.34], bend: 1, ...pad, phase: 0, reach: 0.0, sweep: 1.35, lift: 0.28, curl: 0.4, liftAt: 0.5},
    {side: 'near', attach: 'front', pivot: [0.8, 1.6], a: 0.78, b: 0.64, wa: [0.55, 0.37], wb: [0.36, 0.34], bend: 1, ...pad, phase: 0.24, reach: 0.12, sweep: 1.35, lift: 0.32, curl: 0.5, liftAt: 0.5},
    {side: 'far', attach: 'rear', pivot: [-0.9, 1.62], a: 0.82, b: 0.62, wa: [0.6, 0.38], wb: [0.36, 0.34], bend: 1, ...pad, phase: 0.5, reach: 0.0, sweep: 1.35, lift: 0.28, curl: 0.4, liftAt: 0.5},
    {side: 'far', attach: 'front', pivot: [0.85, 1.6], a: 0.78, b: 0.64, wa: [0.55, 0.37], wb: [0.36, 0.34], bend: 1, ...pad, phase: 0.74, reach: 0.12, sweep: 1.35, lift: 0.32, curl: 0.5, liftAt: 0.5},
  ],
  shapes: [
    crease('torso', [[0.8, 2.6], [0.95, 2.2], [1.05, 1.7]], 0.06, 0.3),
    crease('torso', [[-0.8, 2.6], [-0.95, 2.2], [-1.0, 1.7]], 0.06, 0.25),
    light('torso', [[-1.1, 2.5], [-0.3, 2.78], [0.6, 2.72], [0.3, 2.5], [-0.6, 2.4]], 0.18, '#d7c3b8'),
    crease('head', [[1.62, 2.52], [1.72, 2.36], [1.82, 2.34]], 0.02, 0.45),
    crease('head', [[1.3, 2.9], [1.45, 2.78], [1.6, 2.86]], 0.03, 0.3),
    {frame: 'head', fill: '#e8dccb', layer: 'over', pts: [[1.72, 1.92], [1.86, 1.86], [2.08, 1.74], [2.12, 1.7], [2.06, 1.71], [1.86, 1.8], [1.72, 1.86]]},
    line('head', [[1.66, 1.86], [1.76, 1.84]], 0.02, 0.6, '#140c0c', 'over'),
    // ear (Asian elephants have small ears), a couple of skin folds
    {frame: 'head', fill: '#4e4544', layer: 'over', pts: [[1.42, 2.72], [1.22, 2.66], [1.12, 2.35], [1.18, 2.02], [1.3, 1.92], [1.44, 2.1], [1.5, 2.45]]},
    {frame: 'head', fill: '#2b2424', opacity: 0.5, open: true, stroke: 0.025, layer: 'over', pts: [[1.44, 2.66], [1.5, 2.4], [1.45, 2.1]]},
    {frame: 'torso', fill: '#2b2424', opacity: 0.35, open: true, stroke: 0.03, pts: [[-1.0, 2.4], [-1.1, 2.0], [-1.0, 1.6]]},
    {frame: 'torso', fill: '#2b2424', opacity: 0.3, open: true, stroke: 0.03, pts: [[0.85, 2.4], [0.95, 2.0], [0.9, 1.6]]},
    {frame: 'torso', fill: '#a3999a', opacity: 0.2, clip: true, soft: true, pts: [[-1.2, 2.55], [-0.4, 2.8], [0.6, 2.75], [0.9, 2.5], [0.0, 2.45], [-1.0, 2.35]]},
  ],
  colors: {top: '#80777A', mid: '#5f5759', bottom: '#2b2526', far: '#262021', rim: '#f6bd94', limb: '#5a5254', limbFar: '#231d1f'},
};
