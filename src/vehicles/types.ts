// A vehicle drawn side-on in metres: x from the rear bumper (0) to the nose (L), y up from the road (0).
export type WheelStyle = 'wire' | 'wood' | 'steel' | 'star5' | 'f1' | 'multi' | 'turbine' | 'disc';
export type Wheel = {x: number; r: number; rim: number; style: WheelStyle; y?: number; far?: boolean; hidden?: boolean; caliper?: string; well?: boolean};
// fill: a colour, or 'paint' | 'paint2' | 'glass' | 'chrome' | 'brass' | 'dark' | 'interior'
export type Part = {
  d: string; fill?: string; stroke?: string; sw?: number; op?: number; blur?: number;
  clip?: boolean; // clip to the painted body
  solid?: boolean; // part of the silhouette (cast shadow and rim light)
  layer?: 'back' | 'mid' | 'front';
};
export type Paint = [string, string, string]; // top (sky reflection), mid, bottom
export type VSpec = {
  L: number; H: number;
  body: string; // main painted shell
  paint: Paint; paint2?: Paint;
  belt?: number; // height of the horizon reflection line on the paint
  parts: Part[];
  wheels: Wheel[];
  head?: [number, number]; tail?: [number, number][];
  bounce: number; // suspension jiggle amplitude (m)
  flame?: {x: number; y: number; r: number; len: number}; // afterburner nozzle
  dust?: boolean;
};
