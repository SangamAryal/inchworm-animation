// Short 05: how fast can a flying machine go? Speeds and sources in media/sources.md.
export type Craft = {
  id: string; // aircraft spec id
  name: string;
  ref: string; // in a sentence: "a Spitfire"
  kind: string; // small caps line
  kmh: number;
  mph: number;
  alt: number; // background altitude, 0 = dusk sky, 1 = orbit
};

export const CRAFT: Craft[] = [
  {id: 'wright', name: 'Wright Flyer', ref: 'the Wright Flyer', kind: 'First powered flight · 1903', kmh: 48, mph: 30, alt: 0},
  {id: 'spirit', name: 'Spirit of St. Louis', ref: "Lindbergh's plane", kind: 'First solo Atlantic flight · 1927', kmh: 214, mph: 133, alt: 0},
  {id: 'spitfire', name: 'Spitfire Mk IX', ref: 'a Spitfire', kind: 'WWII fighter · 1942', kmh: 657, mph: 408, alt: 0.05},
  {id: 'b747', name: 'Boeing 747', ref: 'a 747', kind: 'Jumbo jet cruise · Mach 0.85', kmh: 907, mph: 564, alt: 0.18},
  {id: 'concorde', name: 'Concorde', ref: 'Concorde', kind: 'Supersonic airliner · Mach 2.04', kmh: 2180, mph: 1354, alt: 0.42},
  {id: 'sr71', name: 'SR-71 Blackbird', ref: 'an SR-71', kind: 'Jet speed record · 1976', kmh: 3529.6, mph: 2193.2, alt: 0.64},
  {id: 'x15', name: 'X-15', ref: 'the X-15', kind: 'Fastest crewed plane · Mach 6.7', kmh: 7274, mph: 4520, alt: 0.82},
  {id: 'shuttle', name: 'Space Shuttle', ref: 'the Shuttle', kind: 'Speed in orbit · 1981–2011', kmh: 28000, mph: 17500, alt: 1},
];

// Same pacing as Short 04 v3: a 54-frame cold open, then each craft leads for 100 frames and the next overtakes
// over 62, so a new one arrives every 162 frames = 3 bars of 1.8 s (133 BPM). The first leads only 54 frames.
export const COLD = 54;
export const T = {fps: 30, intro: -46, hold: 100, trans: 62, outro: 36};
// each craft is drawn at its own scale so it fills the frame; the scale bar shows the change
export const pxPerM = (L: number) => Math.min(125, 820 / L);
