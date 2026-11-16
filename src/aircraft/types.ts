// An aircraft drawn side-on in metres: x from the tail (0) to the nose (L), y up from the fuselage centre line (0).
// fill: a colour, or 'paint' | 'paint2' | 'glass' | 'metal' | 'dark'
export type APart = {
  d: string; fill?: string; stroke?: string; sw?: number; op?: number;
  clip?: boolean; // clip to the painted body
  solid?: boolean; // part of the silhouette (rim light)
  layer?: 'back' | 'mid' | 'front';
  text?: {s: string; x: number; y: number; size: number; weight?: number; spacing?: number}; // a painted marking (d unused)
};
export type Paint = [string, string, string]; // top, mid, bottom
export type Prop = {x: number; y: number; r: number; blades: number; color?: string};
export type ASpec = {
  L: number; top: number; bot: number; // extent in metres (for paint gradients)
  body: string; // main painted shell
  paint: Paint; paint2?: Paint;
  parts: APart[];
  props?: Prop[];
  flame?: {x: number; y: number; r: number; len: number; kind: 'jet' | 'rocket'}[];
  trails?: [number, number][]; // contrail / wingtip-vortex start points
  bob: number;
  rim?: number;
  fuse?: [number, number]; // fuselage centre y and half-height (m), for the cylindrical sheen
  seams?: [number, number, number]; // panel seams: from x, to x, spacing (m) // rim-light width in px (dark aircraft need more) // gentle up/down drift amplitude (m)
};
