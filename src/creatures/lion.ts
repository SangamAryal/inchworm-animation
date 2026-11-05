import {Spec} from './rig';
import {CHEETAH} from './cheetah';
import {blob, crease, light, line, strands} from './detail';
import {scaleSpec} from './derive';

// Male lion: the cheetah gallop rig scaled up (shoulder ~1.15 m, body ~2 m), heavier limbs, big head and mane.
const MANE = '#5a3218';
const MANE_D = '#2e1a0f';
export const LION: Spec = scaleSpec({
  ...CHEETAH,
  stride: 2.5,
  fur: {len: 0.012, rough: 0.006, grain: 0.06, round: 0.18},
  flex: {...CHEETAH.flex, amp: 0.22},
  torso: [
    [-0.56, 0.66], [-0.47, 0.8], [-0.26, 0.82], [-0.04, 0.8], [0.16, 0.83], [0.32, 0.9], [0.46, 0.84],
    [0.55, 0.66], [0.52, 0.48], [0.4, 0.39], [0.2, 0.4], [0.02, 0.44], [-0.15, 0.5], [-0.3, 0.53], [-0.44, 0.52], [-0.55, 0.55],
  ],
  head: {
    pivot: [0.44, 0.72], base: 0.0, nod: -0.05, nodPhase: 0.25, eye: [0.745, 0.865], eyeR: 0.011,
    outline: [
      [0.26, 0.86], [0.5, 0.95], [0.64, 0.96], [0.74, 0.93], [0.82, 0.87], [0.87, 0.8], [0.88, 0.75], [0.85, 0.71],
      [0.78, 0.69], [0.72, 0.7], [0.65, 0.66], [0.58, 0.58], [0.5, 0.52], [0.38, 0.55],
    ],
  },
  tail: {root: [-0.58, 0.74], pts: [[-0.58, 0.74], [-0.74, 0.66], [-0.9, 0.56], [-1.04, 0.5], [-1.12, 0.52]], ws: [0.06, 0.045, 0.04, 0.045, 0.07], wave: 0.2, phase: 0.2, color: '#8a5a30'},
  limbs: CHEETAH.limbs.map((L) => ({...L, wa: [L.wa[0] * 1.3, L.wa[1] * 1.45] as [number, number], wb: [L.wb[0] * 1.45, L.wb[1] * 1.5] as [number, number], footW: L.footW * 1.4, footL: L.footL * 1.2})),
  shapes: [
    crease('torso', [[0.3, 0.86], [0.36, 0.66], [0.46, 0.5]], 0.025, 0.38),
    crease('torso', [[-0.28, 0.78], [-0.34, 0.62], [-0.42, 0.54]], 0.03, 0.34),
    crease('torso', [[0.1, 0.78], [0.0, 0.62], [-0.06, 0.48]], 0.025, 0.22),
    light('torso', [[-0.5, 0.78], [0.0, 0.8], [0.35, 0.88], [0.2, 0.74], [-0.3, 0.72]], 0.22),
    {frame: 'torso', fill: '#ead2a8', opacity: 0.3, clip: true, soft: true, pts: [[0.5, 0.5], [0.2, 0.44], [-0.2, 0.52], [-0.2, 0.47], [0.2, 0.38], [0.5, 0.42]]},
    // mane: a dark shaggy mass over the neck and back of the head, lighter around the face
    {frame: 'head', fill: MANE_D, soft: 'fine', pts: [[0.24, 0.62], [0.2, 0.8], [0.3, 0.98], [0.46, 1.06], [0.6, 1.04], [0.68, 0.98], [0.66, 0.86], [0.68, 0.74], [0.64, 0.62], [0.56, 0.5], [0.44, 0.46], [0.32, 0.5]]},
    {frame: 'head', fill: MANE, opacity: 0.9, soft: 'mid', pts: [[0.42, 0.98], [0.56, 1.02], [0.66, 0.97], [0.68, 0.84], [0.66, 0.7], [0.6, 0.58], [0.54, 0.66], [0.58, 0.8], [0.5, 0.92]]},
    ...strands('head', [[0.22, 0.66], [0.21, 0.74], [0.22, 0.84], [0.26, 0.92], [0.32, 0.98], [0.4, 1.03]], [-0.85, 0.2], 0.09, MANE_D, 0.95),
    ...strands('head', [[0.48, 1.05], [0.56, 1.05], [0.64, 1.01]], [0.1, 1], 0.06, MANE_D, 0.9),
    ...strands('head', [[0.36, 0.48], [0.46, 0.46], [0.56, 0.5]], [0.05, -1], 0.08, MANE_D, 0.9),
    // face: brow, muzzle, nose, mouth, ear peeking from the mane
    {frame: 'head', fill: '#a0703c', pts: [[0.62, 0.97], [0.65, 1.02], [0.69, 0.97]]},
    crease('head', [[0.7, 0.9], [0.77, 0.9], [0.82, 0.86]], 0.014, 0.35),
    blob('head', [[0.79, 0.79], [0.87, 0.79], [0.885, 0.74], [0.85, 0.705], [0.78, 0.71]], '#ead6b4', 0.65),
    {frame: 'head', fill: '#2a1712', pts: [[0.855, 0.81], [0.882, 0.795], [0.876, 0.765], [0.85, 0.78]]},
    line('head', [[0.84, 0.725], [0.81, 0.735], [0.77, 0.725]], 0.006, 0.7, '#140a07', 'over'),
    line('head', [[0.79, 0.86], [0.82, 0.81]], 0.006, 0.4, '#140a07', 'over'),
  ],
  colors: {top: '#c9965a', mid: '#a87842', bottom: '#5e4126', far: '#4a3320', rim: '#ffd09a', limb: '#ab7a45', limbFar: '#443020'},
}, 1.45, 1.35);
