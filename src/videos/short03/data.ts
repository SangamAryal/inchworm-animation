// Short 03: the tallest things on Earth, from a person to Mount Everest.
// Heights in metres. l / r: how far the drawing reaches left / right of its base centre (m),
// used to space the pairs so neither drawing nor label overlaps.
export type Tall = {
  id: string;
  name: string;
  ref: string; // how it reads in "taller than ..."
  kind: string; // small caps line above the name
  m: number;
  l: number;
  r: number;
  note?: string;
};

export const TALL: Tall[] = [
  {id: 'person', name: 'You', ref: 'you', kind: 'Average adult', m: 1.7, l: 0.3, r: 0.3},
  {id: 'giraffe', name: 'Giraffe', ref: 'a giraffe', kind: 'Tallest animal', m: 5.5, l: 1.3, r: 2.5},
  {id: 'christ', name: 'Christ the Redeemer', ref: 'Christ the Redeemer', kind: 'Statue · Rio de Janeiro', m: 38, l: 14, r: 14},
  {id: 'liberty', name: 'Statue of Liberty', ref: 'the Statue of Liberty', kind: 'Statue · New York', m: 93, l: 24, r: 24, note: 'ground to torch'},
  {id: 'hyperion', name: 'Hyperion', ref: 'the tallest tree', kind: 'Tallest living tree', m: 116, l: 11, r: 11, note: 'coast redwood'},
  {id: 'pyramid', name: 'Great Pyramid', ref: 'the Great Pyramid', kind: 'Giza · 4,500 years old', m: 138.5, l: 115, r: 115},
  {id: 'eiffel', name: 'Eiffel Tower', ref: 'the Eiffel Tower', kind: 'Paris', m: 330, l: 62, r: 62},
  {id: 'empire', name: 'Empire State', ref: 'the Empire State', kind: 'Skyscraper · New York', m: 443, l: 60, r: 70},
  {id: 'burj', name: 'Burj Khalifa', ref: 'the Burj Khalifa', kind: 'Tallest building', m: 828, l: 40, r: 40},
  {id: 'everest', name: 'Mount Everest', ref: 'Everest', kind: 'Tallest mountain', m: 8849, l: 4300, r: 4300, note: 'above sea level'},
];

// Frames at 30 fps. One object every 150 frames (5 s = two 2.5 s bars at 96 bpm).
export const T03 = {fps: 30, intro: 75, hold: 96, move: 54, outro: 60};
