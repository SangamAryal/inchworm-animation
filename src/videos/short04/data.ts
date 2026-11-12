// Short 04: how fast can a car go? Speeds in media/sources.md.
export type Car = {
  id: string; // vehicle spec id
  name: string;
  ref: string; // in a sentence: "the first car"
  kind: string; // small caps line
  kmh: number;
  mph: number;
};

export const CARS: Car[] = [
  {id: 'benz', name: 'Benz Motorwagen', ref: 'the first car', kind: 'The first car · 1886', kmh: 16, mph: 10},
  {id: 'modelT', name: 'Ford Model T', ref: 'a Model T', kind: 'First mass-made car · 1908', kmh: 72, mph: 45},
  {id: 'beetle', name: 'VW Beetle', ref: 'a Beetle', kind: 'Classic 1200 · 1960s', kmh: 115, mph: 71},
  {id: 'f40', name: 'Ferrari F40', ref: 'an F40', kind: 'Supercar · 1987', kmh: 324, mph: 201},
  {id: 'f1', name: 'Formula 1 car', ref: 'an F1 car', kind: 'Fastest F1 race speed', kmh: 372.5, mph: 231.5},
  {id: 'mclaren', name: 'McLaren F1', ref: 'a McLaren F1', kind: 'Road car record · 1998', kmh: 386.4, mph: 240.1},
  {id: 'chiron', name: 'Bugatti Chiron 300+', ref: 'a Bugatti', kind: 'Fastest road car · 2019', kmh: 490.5, mph: 304.8},
  {id: 'thrust', name: 'ThrustSSC', ref: 'a jet car', kind: 'Land speed record · Mach 1.02', kmh: 1228, mph: 763},
];

export const T = {fps: 30, intro: 60, hold: 144, trans: 75, outro: 36};
export const PX_PER_M = 145; // shared scale
export const PX_PER_M_JET = 48; // the camera pulls back for the 16.5 m jet car
