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
  {id: 'human', name: 'Human', kind: 'You are here', m: 1.7, L: 0.6, zone: 'land', y: -0.12, ref: 'you'},
  {id: 'croc', name: 'Saltwater crocodile', kind: 'Lolong · longest croc ever measured', m: 6.17, L: 6.17, zone: 'land', y: 0, ref: 'a crocodile'},
  {id: 'python', name: 'Reticulated python', kind: 'Medusa · longest snake in captivity', m: 7.67, L: 7.67, zone: 'land', y: 0, ref: 'a python'},
  {id: 'rex', name: 'T. rex', kind: '"Sue" · Field Museum', m: 12.3, L: 12.3, zone: 'land', y: -0.55, ref: 'a T. rex'},
  {id: 'spino', name: 'Spinosaurus', kind: 'Longest meat-eating dinosaur', m: 14, L: 14, approx: true, zone: 'land', y: -1.0, ref: 'Spinosaurus'},
  {id: 'meg', name: 'Megalodon', kind: 'Estimate from fossils', m: 16, L: 16, approx: true, zone: 'sea', y: -3.3, ref: 'megalodon'},
  {id: 'ws', name: 'Whale shark', kind: 'Biggest fish alive', m: 18.8, L: 18.8, zone: 'sea', y: -7.6, ref: 'a whale shark'},
  {id: 'whale', name: 'Blue whale', kind: 'Biggest animal ever · but not the longest', m: 29.9, L: 29.9, zone: 'sea', y: -12.6, ref: 'a blue whale'},
  {id: 'argo', name: 'Argentinosaurus', kind: 'Longer than a blue whale', m: 35, L: 35, approx: true, zone: 'land', y: -1.2, ref: 'Argentinosaurus'},
  {id: 'jelly', name: "Lion's mane jellyfish", kind: 'Longer than all of them', m: 36.6, L: 36.6, zone: 'sea', y: -18.5, ref: 'all of them'},
];

// 30 fps. Cold open 54 frames (1.8 s), then a new animal lands every 144 frames = 3 bars of 1.6 s (150 BPM).
// Each one arrives over the last 48 frames of its slot, so it lands on a downbeat.
export const COLD = 54;
export const T = {fps: 30, slot: 144, trans: 48, lastHold: 150};
export const X0 = 90; // screen x of the ruler's zero
export const SPAN = 900; // px the current longest animal fills
export const WY = 1040; // waterline (screen y) in the main scene
export const pxPerM = (g: Giant, i: number) => (i === 0 ? 250 : SPAN / g.L);
