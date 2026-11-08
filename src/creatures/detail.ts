import {V} from './geom';
import {Shape} from './rig';

// Painterly anatomy helpers: soft dark creases between muscles and soft light on the tops of forms.
export const crease = (frame: 'torso' | 'head', pts: V[], w = 0.035, opacity = 0.35, color = '#140a08'): Shape =>
  ({frame, pts, fill: color, open: true, stroke: w * 1.8, opacity: opacity * 0.85, soft: 'mid', clip: true});
export const light = (frame: 'torso' | 'head', pts: V[], opacity = 0.18, color = '#f0b98a'): Shape =>
  ({frame, pts, fill: color, opacity, soft: true, clip: true});
export const line = (frame: 'torso' | 'head', pts: V[], w = 0.012, opacity = 0.8, color = '#120a08', layer: 'under' | 'over' = 'under'): Shape =>
  ({frame, pts, fill: color, open: true, stroke: w, opacity, soft: 'fine', layer});
export const blob = (frame: 'torso' | 'head', pts: V[], fill: string, opacity = 1, clip = true, layer: 'under' | 'over' = 'under'): Shape =>
  ({frame, pts, fill, opacity, clip, soft: 'fine', layer});
// hair strands fanning from a base line (manes, tails, fur tufts)
export const strands = (frame: 'torso' | 'head', base: V[], dir: V, len: number, fill: string, opacity = 1, layer: 'under' | 'over' = 'over'): Shape[] =>
  base.map((b, i) => {
    const l = len * (0.7 + 0.6 * ((i * 37) % 10) / 10);
    const tip: V = [b[0] + dir[0] * l, b[1] + dir[1] * l];
    const n: V = [-dir[1] * len * 0.12, dir[0] * len * 0.12];
    return {frame, pts: [[b[0] + n[0], b[1] + n[1]], tip, [b[0] - n[0], b[1] - n[1]]] as V[], fill, opacity, layer, soft: 'fine' as const};
  });
