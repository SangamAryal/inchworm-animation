// Short 02: mammal top speeds. Sources in media/sources.md.
export type Runner = {
  id: string; // creature spec id
  name: string;
  ref: string; // in a sentence: "a horse"
  kind: string; // small caps line
  kmh: number;
  mph: number;
  kg: number; // body mass used for footstep weight
  sound: 'pad' | 'shoe' | 'paw' | 'hoof' | 'wing';
  zoom?: number; // drawn larger than the shared scale
};

export const RUNNERS: Runner[] = [
  {id: 'elephant', name: 'Asian elephant', ref: 'an elephant', kind: 'Heaviest runner · 4 tonnes', kmh: 24, mph: 15, kg: 4000, sound: 'pad'},
  {id: 'human', name: 'Human', ref: 'a human', kind: 'Fastest sprinter ever', kmh: 44.7, mph: 27.8, kg: 94, sound: 'shoe'},
  {id: 'zebra', name: 'Plains zebra', ref: 'a zebra', kind: 'Wild GPS record', kmh: 49.7, mph: 30.9, kg: 300, sound: 'hoof'},
  {id: 'bear', name: 'Grizzly bear', ref: 'a grizzly', kind: 'Up to 320 kg', kmh: 56, mph: 35, kg: 250, sound: 'paw'},
  {id: 'impala', name: 'Impala', ref: 'an impala', kind: 'Wild GPS record', kmh: 63.7, mph: 39.6, kg: 60, sound: 'hoof'},
  {id: 'greyhound', name: 'Greyhound', ref: 'a greyhound', kind: 'Fastest dog · record', kmh: 67.3, mph: 41.8, kg: 32, sound: 'paw'},
  {id: 'horse', name: 'Racehorse', ref: 'a racehorse', kind: 'Thoroughbred · record', kmh: 70.4, mph: 43.7, kg: 500, sound: 'hoof'},
  {id: 'lion', name: 'Lion', ref: 'a lion', kind: 'Wild GPS record', kmh: 74.2, mph: 46.1, kg: 190, sound: 'paw'},
  {id: 'pronghorn', name: 'Pronghorn', ref: 'a pronghorn', kind: 'Fastest in North America', kmh: 88.5, mph: 55, kg: 50, sound: 'hoof'},
  {id: 'cheetah', name: 'Cheetah', ref: 'a cheetah', kind: 'Fastest land animal', kmh: 93, mph: 58, kg: 50, sound: 'paw'},
  {id: 'bat', name: 'Free-tailed bat', ref: 'a bat', kind: 'Fastest mammal in flight', kmh: 160, mph: 99, kg: 0.012, sound: 'wing', zoom: 4},
];

export const T = {fps: 30, intro: 60, hold: 144, trans: 75, race: 300, outro: 30};
export const PX_PER_M = 200;
