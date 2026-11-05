export type BodyKind = 'earth' | 'moon' | 'mars' | 'jupiter' | 'neptune' | 'sun' | 'redgiant' | 'neutron' | 'blackhole';

export type Item = {
  name: string;
  ref?: string; // how the object reads in a sentence, e.g. "the Moon" (defaults to name)
  kindLabel: string; // small caps line above the name
  km: number; // diameter (event-horizon diameter for black holes)
  note?: string; // small line under the size, e.g. "event horizon"
  body: BodyKind;
  ext: number; // visual half-size in body radii (glow, disk, beams)
  lift: number; // how high the centre sits above the ground, in body radii
  glow?: string; // light colour thrown on the ground by luminous objects
  params?: Record<string, number | number[]>; // shader parameters
};

export type Timing = {intro: number; hold: number; move: number; outro: number};
