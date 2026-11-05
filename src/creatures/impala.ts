import {Spec} from './rig';
import {PRONGHORN} from './pronghorn';
import {crease, light, line} from './detail';

// Impala ram: the pronghorn rig re-dressed (shoulder ~0.9 m). Two-tone coat, black rump stripes, lyre-shaped horns.
const WHITE = '#efe3d2';
const BLACK = '#120c0a';
export const IMPALA: Spec = {
  ...PRONGHORN,
  stride: 2.8,
  tail: {...PRONGHORN.tail!, pts: [[-0.6, 0.92], [-0.68, 0.88], [-0.74, 0.8]], ws: [0.06, 0.07, 0.03], color: '#f2e6d6'},
  shapes: [
    crease('torso', [[0.3, 1.0], [0.36, 0.84], [0.46, 0.7]], 0.025, 0.35),
    crease('torso', [[-0.3, 0.96], [-0.34, 0.8], [-0.4, 0.68]], 0.03, 0.3),
    light('torso', [[-0.55, 0.96], [0.0, 0.98], [0.35, 1.02], [0.2, 0.9], [-0.3, 0.88]], 0.2),
    // fawn flank band below the red-brown saddle, white belly
    {frame: 'torso', fill: '#d6a46c', opacity: 0.75, clip: true, soft: 'mid', pts: [[0.5, 0.86], [0.0, 0.88], [-0.5, 0.88], [-0.5, 0.74], [0.0, 0.76], [0.5, 0.74]]},
    {frame: 'torso', fill: WHITE, opacity: 0.92, clip: true, soft: 'fine', pts: [[0.5, 0.71], [0.2, 0.73], [-0.2, 0.75], [-0.5, 0.74], [-0.5, 0.55], [0.5, 0.55]]},
    // white rump with a black stripe down each buttock
    {frame: 'torso', fill: WHITE, opacity: 0.85, clip: true, soft: 'fine', pts: [[-0.66, 0.92], [-0.56, 0.9], [-0.53, 0.75], [-0.58, 0.64], [-0.66, 0.66]]},
    {frame: 'torso', fill: BLACK, opacity: 0.85, clip: true, soft: 'fine', pts: [[-0.55, 0.95], [-0.51, 0.94], [-0.49, 0.78], [-0.52, 0.66], [-0.55, 0.7], [-0.535, 0.8]]},
    // head: pale throat and chin, eye ring, dark nose
    {frame: 'head', fill: WHITE, opacity: 0.8, clip: true, soft: 'fine', pts: [[0.55, 0.92], [0.62, 1.12], [0.72, 1.17], [0.7, 1.1], [0.62, 0.9]]},
    {frame: 'head', fill: WHITE, opacity: 0.55, clip: true, soft: 'fine', pts: [[0.74, 1.33], [0.83, 1.33], [0.84, 1.26], [0.76, 1.26]]},
    {frame: 'head', fill: '#2a1a12', opacity: 0.7, clip: true, soft: 'fine', pts: [[0.92, 1.18], [0.98, 1.12], [0.96, 1.07], [0.9, 1.1]]},
    line('head', [[0.93, 1.14], [0.955, 1.15]], 0.007, 0.8, BLACK, 'over'),
    line('head', [[0.9, 1.09], [0.95, 1.095]], 0.005, 0.6, BLACK, 'over'),
    // long ears, black-tipped
    {frame: 'head', fill: '#b47a48', pts: [[0.66, 1.34], [0.52, 1.46], [0.55, 1.49], [0.72, 1.38]]},
    {frame: 'head', fill: BLACK, opacity: 0.8, pts: [[0.54, 1.45], [0.52, 1.46], [0.55, 1.49], [0.58, 1.47]]},
    // lyre-shaped ridged horns sweeping up, back and out
    {frame: 'head', fill: '#1a1210', pts: [[0.69, 1.37], [0.64, 1.46], [0.6, 1.56], [0.63, 1.66], [0.69, 1.74], [0.7, 1.8], [0.68, 1.85], [0.705, 1.86], [0.73, 1.8], [0.715, 1.72], [0.66, 1.64], [0.65, 1.56], [0.69, 1.47], [0.75, 1.38]]},
    ...[1.42, 1.48, 1.54, 1.6].map((y) => line('head', [[y < 1.5 ? 0.655 : 0.615, y], [y < 1.5 ? 0.72 : 0.67, y + 0.012]], 0.008, 0.55, '#6b5240', 'over')),
  ],
  colors: {top: '#a9653a', mid: '#8f5431', bottom: '#4a3022', far: '#3a261b', rim: '#ffc28c', limb: '#b07a4a', limbFar: '#36251b'},
};
