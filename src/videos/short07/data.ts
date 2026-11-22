// Short 07: how deep can we go? Depths in metres below the sea surface. Sources in media/sources.md.
export type Dive = {
  id: string;
  name: string;
  kind: string; // small caps line above the name
  d: number; // depth (m)
  approx?: boolean;
  ref: string; // "deeper than ..."
  size: number; // drawing scale when highlighted
};

export const DIVES: Dive[] = [
  {id: 'you', name: 'You', kind: 'At the surface', d: 0, ref: 'you', size: 1.1},
  {id: 'scuba', name: 'Scuba diver', kind: 'Normal recreational limit', d: 40, ref: 'a scuba diver', size: 1.25},
  {id: 'nitsch', name: 'Herbert Nitsch', kind: 'Deepest dive on one breath', d: 214, ref: 'Herbert Nitsch', size: 1.15},
  {id: 'gabr', name: 'Ahmed Gabr', kind: 'Deepest scuba dive', d: 332.35, ref: 'Ahmed Gabr', size: 1.2},
  {id: 'penguin', name: 'Emperor penguin', kind: 'Deepest diving bird', d: 564, ref: 'a penguin', size: 1.25},
  {id: 'turtle', name: 'Leatherback turtle', kind: 'Deepest diving reptile', d: 1280, ref: 'a leatherback', size: 1.1},
  {id: 'sperm', name: 'Sperm whale', kind: 'Hunting giant squid', d: 2000, approx: true, ref: 'a sperm whale', size: 0.95},
  {id: 'seal', name: 'Elephant seal', kind: 'Deepest diving seal', d: 2388, ref: 'an elephant seal', size: 1.15},
  {id: 'beaked', name: "Cuvier's beaked whale", kind: 'Deepest diving mammal', d: 2992, ref: 'a beaked whale', size: 1.05},
  {id: 'titanic', name: 'Titanic', kind: 'Wreck · sank 1912', d: 3800, ref: 'the Titanic', size: 0.95},
  {id: 'sammy', name: 'USS Samuel B. Roberts', kind: 'Deepest shipwreck found', d: 6865, ref: 'the deepest wreck', size: 0.9},
  {id: 'snail', name: 'Snailfish', kind: 'Deepest fish ever filmed', d: 8336, ref: 'a snailfish', size: 1.3},
  {id: 'deep', name: 'Challenger Deep', kind: 'Deepest point on Earth', d: 10935, ref: 'a snailfish', size: 1},
];

export const EVEREST = 8849;

// 30 fps, same beat grid as Short 06: 150 BPM, a bar is 1.6 s = 48 frames. Cold open 54 frames; the surface
// alone for 48, then each move takes 48 frames and each depth holds 96, so a new one lands every 3 bars.
// The last hold is long: Everest drops into the trench.
export const COLD = 54;
export const T = {fps: 30, intro: 48, move: 48, hold: 96, outro: 150};
export const SURF = 560; // sea surface on screen once we are under way
export const CUR_Y = 1230; // where the highlighted depth sits
export const LABEL_Y = 1540;
