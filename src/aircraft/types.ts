// An aircraft drawn side-on in metres: x from the tail (0) to the nose (L), y up from the fuselage centre line (0).
// fill: a colour, or 'paint' | 'paint2' | 'glass' | 'metal' | 'dark'
export type APart = {
  d: string; fill?: string; stroke?: string; sw?: number; op?: number;
  clip?: boolean; // clip to the painted body
  solid?: boolean; // part of the silhouette (rim light)
  layer?: 'back' | 'mid' | 'front';
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
  rim?: number; // rim-light width in px (dark aircraft need more) // gentle up/down drift amplitude (m)
};
