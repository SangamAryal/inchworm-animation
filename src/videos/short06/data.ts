// Short 06: the longest animals ever, to scale. Lengths and sources in media/sources.md.
export type Giant = {
  id: string;
  name: string;
  kind: string; // small caps line above the name
  m: number; // length shown on screen (m)
  L: number; // drawing length (m)
  approx?: boolean; // estimate: shown with "~"
  zone: 'land' | 'sea';
  y: number; // land: height of the drawing's ground line (m, negative = wading); sea: depth of its centre line
  ref: string; // "longer than ..."
};

export const GIANTS: Giant[] = [
  {id: 'human', name: 'Human', kind: 'You are here', m: 1.7, L: 0.34, zone: 'land', y: -0.06, ref: 'you'},
  {id: 'croc', name: 'Saltwater crocodile', kind: 'Lolong · record croc', m: 6.17, L: 6.17, zone: 'land', y: 0, ref: 'a crocodile'},
  {id: 'python', name: 'Reticulated python', kind: 'Medusa · record snake', m: 7.67, L: 7.67, zone: 'land', y: 0, ref: 'a python'},
  {id: 'rex', name: 'T. rex', kind: '"Sue" · Field Museum', m: 12.3, L: 12.3, zone: 'land', y: -0.55, ref: 'a T. rex'},
  {id: 'spino', name: 'Spinosaurus', kind: 'Longest meat-eater', m: 14, L: 14, approx: true, zone: 'land', y: -1.0, ref: 'Spinosaurus'},
  {id: 'meg', name: 'Megalodon', kind: 'Estimate from fossils', m: 16, L: 16, approx: true, zone: 'sea', y: -2.7, ref: 'megalodon'},
  {id: 'ws', name: 'Whale shark', kind: 'Biggest fish alive', m: 18.8, L: 18.8, zone: 'sea', y: -2.6, ref: 'a whale shark'},
  {id: 'whale', name: 'Blue whale', kind: 'Biggest animal ever', m: 29.9, L: 29.9, zone: 'sea', y: -2.4, ref: 'a blue whale'},
  {id: 'argo', name: 'Argentinosaurus', kind: 'Biggest dinosaur · estimate', m: 35, L: 35, approx: true, zone: 'land', y: -1.2, ref: 'Argentinosaurus'},
  {id: 'jelly', name: "Lion's mane jellyfish", kind: 'Bell to tentacle tip · 1870', m: 36.6, L: 36.6, zone: 'sea', y: -2.2, ref: 'Argentinosaurus'},
];

// 30 fps. Laid out like Short 01: a pair at a time, the new animal on the right, the camera sliding and
// zooming out to it. Cold open 54 frames (1.8 s); the human alone for 48, then each move takes 48 frames and
// each pair holds 96, so a new animal lands every 144 frames = 3 bars of 1.6 s (150 BPM), on a downbeat.
export const COLD = 54;
export const T = {fps: 30, intro: 48, move: 48, hold: 96, outro: 120};
export const WY = 1120; // waterline (screen y)
export const LABEL_Y = 1430; // labels under the animals
