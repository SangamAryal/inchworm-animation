// Side profiles of the eight vehicles in Short 04, in metres, from published dimensions
// (overall length, height, wheelbase, tyre size). Rear bumper at x = 0, nose at x = L.
import {VSpec} from './types';
import {band, circle, ellipse, line, poly, rect, shape} from './path';

const DARK = '#141012';

// Benz Patent-Motorwagen, 1886: 2.7 m long, three wire wheels, rear engine with a horizontal flywheel, tiller steering.
const benz: VSpec = {
  L: 2.7, H: 1.4, bounce: 0.012,
  paint: ['#7a6a62', '#3a2a24', '#160f0c'],
  body: shape([[0.9, 0.74, 0], [1.56, 0.74, 0], [1.6, 0.98, 0], [1.0, 1.0], [0.92, 1.32], [0.84, 1.34, 0], [0.8, 0.98]]), // seat and backrest
  parts: [
    // frame tubes
    {d: line([[0.05, 0.62], [1.7, 0.62], [2.02, 0.68], [2.2, 0.98]]), stroke: '#1e1a1c', sw: 0.04, solid: true, layer: 'back'},
    {d: line([[0.62, 0.57], [1.5, 0.5], [1.92, 0.56], [2.18, 0.9]]), stroke: '#1e1a1c', sw: 0.03, solid: true, layer: 'back'},
    {d: line([[2.2, 0.98, 0], [2.3, 0.37, 0]]), stroke: '#1e1a1c', sw: 0.035, solid: true, layer: 'front'},
    {d: line([[2.16, 1.0, 0], [2.26, 1.0, 0]]), stroke: '#1e1a1c', sw: 0.05, layer: 'front'},
    // engine block, cylinder fins, water tank, flywheel lying flat
    {d: rect(0.12, 0.64, 0.68, 0.86, 0.03), fill: '#2b2a2e', solid: true},
    ...[0.2, 0.28, 0.36, 0.44].map((x) => ({d: rect(x, 0.66, x + 0.035, 0.84), fill: '#4a474c'})),
    {d: rect(0.2, 0.86, 0.46, 1.12, 0.05), fill: 'brass', solid: true},
    {d: rect(0.0, 0.57, 0.92, 0.615, 0.015), fill: '#3a3536', solid: true},
    {d: rect(0.52, 0.78, 0.66, 0.92, 0.02), fill: 'brass'},
    // chain drive to the rear wheel
    {d: line([[0.62, 0.62], [1.05, 0.6], [1.08, 0.5], [0.62, 0.52]]), stroke: '#29231f', sw: 0.018},
    // seat cushion, floor board, tiller with handle
    {d: rect(0.92, 0.96, 1.6, 1.03, 0.03), fill: '#5c3324'},
    {d: rect(1.56, 0.6, 2.05, 0.66), fill: '#5b3a24', solid: true},
    {d: line([[1.82, 0.64, 0], [1.86, 1.26, 0], [1.66, 1.3, 0]]), stroke: '#1e1a1c', sw: 0.028, solid: true, layer: 'front'},
    {d: circle(1.65, 1.3, 0.03), fill: '#c9a25a', layer: 'front'},
    // brass lamp
    {d: rect(2.05, 0.98, 2.16, 1.1, 0.02), fill: 'brass', layer: 'front'},
  ],
  wheels: [
    {x: 0.62, r: 0.57, rim: 0.535, style: 'wire', far: true, well: false},
    {x: 0.62, r: 0.57, rim: 0.535, style: 'wire', well: false},
    {x: 2.3, r: 0.37, rim: 0.34, style: 'wire', well: false},
  ],
};

// Ford Model T touring car: 3.4 m long, 2.54 m wheelbase, 30-inch wooden wheels, brass radiator, folding top.
const modelT: VSpec = {
  L: 3.42, H: 1.9, bounce: 0.01,
  paint: ['#8a8394', '#1c1a1f', '#08070a'], belt: 0.9,
  body: shape([[0.1, 0.56, 0], [0.1, 1.04], [0.22, 1.13, 0], [2.2, 1.13, 0], [2.52, 1.21, 0], [3.18, 1.17, 0], [3.18, 0.62, 0], [2.55, 0.56, 0]]),
  parts: [
    // folding top, bows and rear curtain
    {d: shape([[2.58, 1.8, 0], [2.58, 1.9, 0], [0.62, 1.92, 0], [0.36, 1.84], [0.1, 1.18, 0], [0.22, 1.16, 0], [0.5, 1.74], [0.7, 1.8, 0]]), fill: '#17151a', solid: true, layer: 'mid'},
    {d: line([[1.1, 1.13, 0], [1.1, 1.85, 0]]), stroke: '#17151a', sw: 0.025, layer: 'back'},
    {d: line([[2.0, 1.13, 0], [2.0, 1.85, 0]]), stroke: '#17151a', sw: 0.025, layer: 'back'},
    // seat backs and steering wheel seen through the open sides
    {d: shape([[0.3, 1.13, 0], [0.34, 1.42], [0.5, 1.46], [0.9, 1.44, 0], [0.92, 1.13, 0]]), fill: '#3b2620', layer: 'back'},
    {d: shape([[1.45, 1.13, 0], [1.48, 1.4], [1.62, 1.44], [1.98, 1.42, 0], [2.0, 1.13, 0]]), fill: '#3b2620', layer: 'back'},
    {d: line([[2.42, 1.0, 0], [2.22, 1.38, 0]]), stroke: '#111', sw: 0.025, layer: 'back'},
    {d: line([[2.12, 1.32, 0], [2.3, 1.46, 0]]), stroke: '#111', sw: 0.035, layer: 'back'},
    // windscreen, edge on
    {d: rect(2.5, 1.2, 2.58, 1.84), fill: 'glass', op: 0.8, layer: 'mid'},
    {d: rect(2.53, 1.2, 2.56, 1.86), fill: 'brass', layer: 'mid'},
    // fenders and running board
    {d: band([[0.0, 0.52], [0.18, 0.8], [0.62, 0.92], [1.02, 0.82], [1.14, 0.52]], [[0.06, 0.52], [0.22, 0.76], [0.62, 0.87], [0.98, 0.78], [1.08, 0.52]]), fill: 'paint', solid: true, layer: 'front'},
    {d: rect(1.08, 0.47, 2.62, 0.52), fill: '#121014', solid: true, layer: 'front'},
    {d: band([[2.55, 0.52], [2.78, 0.8], [3.08, 0.88], [3.34, 0.8], [3.44, 0.6]], [[2.62, 0.52], [2.83, 0.76], [3.08, 0.83], [3.3, 0.76], [3.38, 0.6]]), fill: 'paint', solid: true, layer: 'front'},
    // hood louvres, door line, handle
    ...[2.7, 2.78, 2.86, 2.94].map((x) => ({d: rect(x, 0.78, x + 0.03, 1.02, 0.01), fill: '#050406', op: 0.7, layer: 'mid' as const})),
    {d: line([[1.45, 0.6, 0], [1.45, 1.12, 0]]), stroke: '#000', sw: 0.012, op: 0.7, layer: 'mid'},
    {d: line([[2.05, 0.6, 0], [2.05, 1.12, 0]]), stroke: '#000', sw: 0.012, op: 0.7, layer: 'mid'},
    {d: line([[0.1, 1.12, 0], [2.2, 1.12, 0]]), stroke: '#c9a25a', sw: 0.012, op: 0.6, layer: 'mid'},
    // brass radiator and lamps
    {d: rect(3.17, 0.56, 3.31, 1.27, 0.03), fill: 'brass', solid: true, layer: 'mid'},
    {d: rect(3.2, 1.27, 3.28, 1.34, 0.02), fill: 'brass', layer: 'mid'},
    {d: rect(3.3, 0.94, 3.44, 1.1, 0.04), fill: 'brass', solid: true, layer: 'front'},
    {d: rect(2.42, 1.05, 2.52, 1.16, 0.02), fill: 'brass', layer: 'front'},
  ],
  wheels: [
    {x: 0.62, r: 0.38, rim: 0.3, style: 'wood', well: false},
    {x: 3.1, r: 0.38, rim: 0.3, style: 'wood', well: false},
  ],
};

// Volkswagen Beetle, 1960s: 4.08 m long, 1.5 m tall, 2.4 m wheelbase, 15-inch steel wheels.
const beetle: VSpec = {
  L: 4.1, H: 1.5, bounce: 0.008,
  paint: ['#e3eef0', '#86aec0', '#2d4553'], belt: 0.96,
  body: shape([[0.16, 0.4, 0], [0.06, 0.62], [0.14, 0.88], [0.4, 1.16], [0.8, 1.38], [1.3, 1.49], [1.85, 1.5], [2.22, 1.46], [2.44, 1.38, 0], [2.78, 1.04, 0], [3.2, 0.97], [3.62, 0.86], [3.9, 0.72], [4.02, 0.56], [3.96, 0.4, 0]], 0.17),
  parts: [
    // fenders
    {d: shape([[0.14, 0.42, 0], [0.2, 0.66], [0.42, 0.86], [0.8, 0.92], [1.1, 0.84], [1.3, 0.62], [1.36, 0.42, 0]]), fill: 'paint', solid: true, layer: 'mid'},
    {d: shape([[2.7, 0.4, 0], [2.78, 0.66], [3.02, 0.86], [3.38, 0.9], [3.72, 0.82], [3.94, 0.64], [4.0, 0.42, 0]]), fill: 'paint', solid: true, layer: 'mid'},
    {d: rect(1.3, 0.35, 2.74, 0.42, 0.01), fill: '#1a1a1d', solid: true, layer: 'mid'},
    // windows with chrome trim
    {d: shape([[1.62, 1.07, 0], [2.42, 1.07, 0], [2.36, 1.32], [2.14, 1.42], [1.66, 1.44, 0]]), fill: 'chrome', layer: 'mid'},
    {d: shape([[1.65, 1.09, 0], [2.39, 1.09, 0], [2.33, 1.31], [2.13, 1.4], [1.68, 1.42, 0]]), fill: 'glass', layer: 'mid'},
    {d: shape([[0.92, 1.08, 0], [1.52, 1.08, 0], [1.52, 1.42, 0], [1.2, 1.38], [0.98, 1.24]]), fill: 'chrome', layer: 'mid'},
    {d: shape([[0.95, 1.1, 0], [1.5, 1.1, 0], [1.5, 1.4, 0], [1.2, 1.36], [1.0, 1.23]]), fill: 'glass', layer: 'mid'},
    // door shut lines, handle, engine-lid louvres
    {d: line([[1.56, 0.45, 0], [1.56, 1.06, 0]]), stroke: '#1d2f3a', sw: 0.012, layer: 'mid'},
    {d: line([[2.5, 0.45, 0], [2.6, 1.0, 0]]), stroke: '#1d2f3a', sw: 0.012, layer: 'mid'},
    {d: rect(1.64, 0.96, 1.78, 0.985, 0.01), fill: 'chrome', layer: 'mid'},
    ...[0.98, 1.03, 1.08, 1.13].map((y, i) => ({d: line([[0.36 + i * 0.04, y, 0], [0.5 + i * 0.05, y + 0.05, 0]]), stroke: '#1d2f3a', sw: 0.015, layer: 'mid' as const})),
    {d: line([[0.2, 0.8], [0.5, 1.15], [1.0, 1.42]]), stroke: '#ffffff', sw: 0.01, op: 0.35, layer: 'mid'},
    // headlight in the front fender, taillight, chrome bumpers
    {d: ellipse(3.88, 0.74, 0.05, 0.1), fill: 'chrome', layer: 'mid'},
    {d: ellipse(3.9, 0.74, 0.03, 0.08), fill: '#fff4d8', layer: 'mid'},
    {d: ellipse(0.24, 0.72, 0.04, 0.07), fill: '#c0302a', layer: 'mid'},
    {d: rect(-0.04, 0.42, 0.3, 0.48, 0.02), fill: 'chrome', solid: true, layer: 'front'},
    {d: rect(3.82, 0.43, 4.12, 0.49, 0.02), fill: 'chrome', solid: true, layer: 'front'},
  ],
  wheels: [
    {x: 0.8, r: 0.325, rim: 0.19, style: 'steel'},
    {x: 3.2, r: 0.325, rim: 0.19, style: 'steel'},
  ],
  head: [3.92, 0.74], tail: [[0.22, 0.72]],
};

// Ferrari F40, 1987: 4.36 m long, 1.13 m tall, 2.45 m wheelbase, big rear wing, louvred engine cover.
const f40: VSpec = {
  L: 4.36, H: 1.15, bounce: 0.003,
  paint: ['#f2a08e', '#c3182a', '#3e070e'], belt: 0.62,
  body: shape([[0.04, 0.3, 0], [0.0, 0.62], [0.03, 0.9, 0], [0.4, 0.96], [1.0, 1.0], [1.55, 1.06], [1.9, 1.12], [2.3, 1.13, 0], [2.6, 1.02], [2.98, 0.86, 0], [3.4, 0.78], [3.85, 0.68], [4.2, 0.56], [4.36, 0.47, 0], [4.32, 0.3], [4.1, 0.24, 0], [0.3, 0.25, 0]]),
  parts: [
    // rear wing on its end plates
    {d: shape([[0.06, 0.9, 0], [0.34, 0.96, 0], [0.3, 1.16, 0], [0.04, 1.16, 0]], 0.1), fill: 'paint', solid: true, layer: 'front'},
    {d: rect(-0.06, 1.1, 0.5, 1.17, 0.02), fill: '#9e1222', solid: true, layer: 'front'},
    // louvres on the engine cover, side intake, NACA duct
    ...[0.4, 0.55, 0.7, 0.85, 1.0, 1.15, 1.3].map((x) => ({d: line([[x, 0.97, 0], [x + 0.08, 1.02, 0]]), stroke: '#2a0408', sw: 0.025, layer: 'mid' as const})),
    {d: shape([[1.32, 0.55, 0], [1.82, 0.62], [1.86, 0.86, 0], [1.5, 0.84], [1.34, 0.72]]), fill: '#140608', layer: 'mid'},
    {d: shape([[2.25, 0.6, 0], [2.6, 0.64, 0], [2.6, 0.7, 0]]), fill: '#2a0408', layer: 'mid'},
    // glass
    {d: shape([[1.92, 0.9, 0], [2.86, 0.87, 0], [2.4, 1.08], [2.0, 1.09, 0]]), fill: 'glass', layer: 'mid'},
    {d: line([[1.9, 0.9, 0], [2.88, 0.86, 0]]), stroke: '#1a0306', sw: 0.015, layer: 'mid'},
    // door line, black sill, mirror
    {d: line([[1.95, 0.3, 0], [1.9, 0.88, 0]]), stroke: '#3a050c', sw: 0.012, layer: 'mid'},
    {d: line([[2.92, 0.3, 0], [2.95, 0.84, 0]]), stroke: '#3a050c', sw: 0.012, layer: 'mid'},
    {d: rect(1.28, 0.24, 2.98, 0.3), fill: '#1a1416', layer: 'mid'},
    {d: shape([[2.72, 0.88, 0], [2.86, 0.9], [2.88, 0.98], [2.76, 0.99]]), fill: 'paint', solid: true, layer: 'front'},
    {d: line([[1.0, 1.0], [1.7, 1.08], [2.25, 1.12]]), stroke: '#ffd9cc', sw: 0.012, op: 0.5, layer: 'mid'},
    // lights
    {d: rect(4.14, 0.52, 4.3, 0.57, 0.02), fill: '#f5e8d2', layer: 'mid'},
    {d: circle(0.04, 0.74, 0.05), fill: '#d02a26', layer: 'mid'},
  ],
  wheels: [
    {x: 0.94, r: 0.335, rim: 0.215, style: 'star5', caliper: '#c8b25a'},
    {x: 3.39, r: 0.315, rim: 0.215, style: 'star5', caliper: '#c8b25a'},
  ],
  head: [4.3, 0.54], tail: [[0.03, 0.74]],
};

// Formula 1 car, current rules: about 5.6 m long, 3.6 m wheelbase, 18-inch wheels with covers, halo, no team livery.
const f1: VSpec = {
  L: 5.64, H: 0.97, bounce: 0.002,
  paint: ['#8e8ea0', '#2a2b36', '#0b0b10'], paint2: ['#f6e6d2', '#d8c0aa', '#6a5648'], belt: 0.4,
  body: shape([[0.55, 0.22, 0], [0.56, 0.4, 0], [0.95, 0.52], [1.5, 0.7], [2.05, 0.9], [2.4, 0.98, 0], [2.55, 0.95, 0], [2.62, 0.77, 0], [3.2, 0.73], [3.75, 0.66], [4.4, 0.53], [5.0, 0.38], [5.45, 0.22], [5.53, 0.15, 0], [5.3, 0.13, 0], [4.4, 0.24], [3.7, 0.14, 0], [0.7, 0.13, 0]]),
  parts: [
    // floor and sidepod
    {d: rect(0.45, 0.03, 4.0, 0.09, 0.02), fill: '#121217', solid: true, layer: 'back'},
    {d: shape([[1.25, 0.12, 0], [3.35, 0.12, 0], [3.3, 0.46], [2.7, 0.55], [1.9, 0.46], [1.3, 0.3]]), fill: 'paint', solid: true, layer: 'mid'},
    {d: shape([[3.1, 0.2, 0], [3.34, 0.2, 0], [3.32, 0.44, 0], [3.12, 0.47]]), fill: '#060608', layer: 'mid'},
    // cream livery sweep along the side
    {d: band([[1.0, 0.42], [1.8, 0.5], [2.8, 0.6], [3.8, 0.6], [4.6, 0.44], [5.3, 0.24]], [[1.1, 0.38], [1.9, 0.43], [2.8, 0.52], [3.8, 0.52], [4.6, 0.38], [5.3, 0.2]]), fill: 'paint2', clip: true, layer: 'mid'},
    {d: line([[2.42, 0.96], [2.0, 0.86], [1.4, 0.64]]), stroke: '#f6b985', sw: 0.03, clip: true, layer: 'mid'},
    // driver's helmet and halo
    {d: circle(2.86, 0.82, 0.13), fill: '#f0b444', layer: 'mid'},
    {d: line([[2.74, 0.86], [2.86, 0.93], [2.98, 0.9]]), stroke: '#ffffff', sw: 0.02, op: 0.5, layer: 'mid'},
    {d: shape([[2.88, 0.82, 0], [2.99, 0.84], [2.98, 0.9, 0], [2.86, 0.88]]), fill: '#121218', layer: 'mid'},
    {d: line([[3.3, 0.72], [3.08, 0.88], [2.78, 0.94], [2.6, 0.91]]), stroke: '#1a1a20', sw: 0.05, solid: true, layer: 'front'},
    {d: line([[3.15, 0.74, 0], [3.15, 0.86, 0], [3.22, 0.88, 0]]), stroke: '#1a1a20', sw: 0.02, layer: 'front'},
    // airbox opening
    {d: shape([[2.4, 0.86, 0], [2.52, 0.86, 0], [2.5, 0.94, 0], [2.42, 0.95]]), fill: '#050506', layer: 'mid'},
    // front wing
    {d: shape([[4.9, 0.08, 0], [5.66, 0.06, 0], [5.66, 0.12, 0], [5.0, 0.2]]), fill: '#1b1b22', solid: true, layer: 'front'},
    {d: shape([[5.05, 0.12, 0], [5.6, 0.13, 0], [5.55, 0.18, 0], [5.1, 0.25]]), fill: '#2c2c38', solid: true, layer: 'front'},
    {d: rect(5.2, 0.04, 5.62, 0.3, 0.03), fill: '#15151b', solid: true, layer: 'front'},
    // rear wing, beam wing, end plate
    {d: rect(0.0, 0.3, 0.5, 0.96, 0.04), fill: '#15151b', solid: true, layer: 'mid'},
    {d: rect(-0.02, 0.72, 0.52, 0.8, 0.03), fill: '#2e2e3a', solid: true, layer: 'mid'},
    {d: rect(0.02, 0.84, 0.5, 0.92, 0.03), fill: '#2e2e3a', solid: true, layer: 'mid'},
    {d: rect(0.06, 0.08, 0.36, 0.26, 0.04), fill: '#15151b', solid: true, layer: 'mid'},
    {d: line([[0.18, 0.92], [0.24, 0.98]]), stroke: '#f6b985', sw: 0.025, layer: 'mid'},
    // suspension arms
    {d: line([[3.85, 0.42, 0], [4.37, 0.38, 0]]), stroke: '#18181e', sw: 0.025, layer: 'front'},
    {d: line([[3.8, 0.2, 0], [4.37, 0.32, 0]]), stroke: '#18181e', sw: 0.025, layer: 'front'},
    {d: line([[1.1, 0.4, 0], [0.76, 0.42, 0]]), stroke: '#18181e', sw: 0.025, layer: 'front'},
    {d: line([[1.1, 0.18, 0], [0.76, 0.3, 0]]), stroke: '#18181e', sw: 0.025, layer: 'front'},
    // mirror
    {d: line([[3.3, 0.7, 0], [3.34, 0.84, 0]]), stroke: '#15151b', sw: 0.02, layer: 'mid'},
    {d: rect(3.26, 0.83, 3.42, 0.9, 0.02), fill: 'paint', solid: true, layer: 'mid'},
  ],
  wheels: [
    {x: 0.75, r: 0.36, rim: 0.23, style: 'f1', well: false},
    {x: 4.37, r: 0.36, rim: 0.23, style: 'f1', well: false},
  ],
  tail: [[0.04, 0.5]],
};

// McLaren F1, 1998 record car: 4.29 m long, 1.14 m tall, 2.72 m wheelbase, roof snorkel, dihedral doors.
const mclaren: VSpec = {
  L: 4.29, H: 1.21, bounce: 0.003,
  paint: ['#f2eff4', '#9c99a4', '#2e2d34'], belt: 0.66,
  body: shape([[0.06, 0.3, 0], [0.0, 0.6], [0.04, 0.88, 0], [0.16, 0.93, 0], [0.6, 0.98], [1.1, 1.06], [1.55, 1.12], [1.9, 1.14], [2.25, 1.13, 0], [2.62, 1.0], [2.96, 0.85, 0], [3.36, 0.76], [3.8, 0.66], [4.14, 0.54], [4.29, 0.43, 0], [4.24, 0.28], [3.95, 0.23, 0], [0.3, 0.25, 0]]),
  parts: [
    // roof snorkel
    {d: shape([[1.68, 1.13, 0], [1.74, 1.2], [1.98, 1.21, 0], [2.02, 1.14, 0]]), fill: 'paint', solid: true, layer: 'mid'},
    {d: rect(1.97, 1.15, 2.01, 1.2), fill: '#0b0b0e', layer: 'mid'},
    // big side intake behind the door, door cut, glass
    {d: shape([[1.3, 0.5, 0], [1.86, 0.54], [1.92, 0.86, 0], [1.6, 0.84], [1.38, 0.7]]), fill: '#0d0d10', layer: 'mid'},
    {d: line([[1.92, 0.3], [1.96, 0.6], [1.94, 0.9]]), stroke: '#3e3d46', sw: 0.012, layer: 'mid'},
    {d: line([[2.95, 0.3, 0], [2.97, 0.84, 0]]), stroke: '#3e3d46', sw: 0.012, layer: 'mid'},
    {d: shape([[1.98, 0.9, 0], [2.88, 0.86, 0], [2.6, 0.99], [2.25, 1.09], [2.0, 1.1, 0]]), fill: 'glass', layer: 'mid'},
    {d: line([[0.6, 0.98], [1.3, 1.08], [1.9, 1.13]]), stroke: '#ffffff', sw: 0.012, op: 0.5, layer: 'mid'},
    {d: line([[3.0, 0.84], [3.6, 0.72], [4.1, 0.56]]), stroke: '#ffffff', sw: 0.01, op: 0.4, layer: 'mid'},
    // mirror, lights
    {d: shape([[2.78, 0.88, 0], [2.9, 0.9], [2.92, 0.97], [2.8, 0.98]]), fill: 'paint', solid: true, layer: 'front'},
    {d: shape([[3.95, 0.6, 0], [4.18, 0.52, 0], [4.2, 0.56], [4.0, 0.64]]), fill: '#f5ead6', layer: 'mid'},
    {d: rect(0.0, 0.7, 0.06, 0.78, 0.02), fill: '#d02a26', layer: 'mid'},
    {d: rect(0.05, 0.25, 0.4, 0.34), fill: '#1a1a1e', layer: 'mid'},
  ],
  wheels: [
    {x: 0.78, r: 0.33, rim: 0.215, style: 'multi', caliper: '#3a3a40'},
    {x: 3.5, r: 0.315, rim: 0.215, style: 'multi', caliper: '#3a3a40'},
  ],
  head: [4.17, 0.56], tail: [[0.02, 0.74]],
};

// Bugatti Chiron Super Sport 300+: 4.79 m longtail, 1.2 m tall, 2.71 m wheelbase, two-tone paint split by the C-line.
const chiron: VSpec = {
  L: 4.79, H: 1.22, bounce: 0.002,
  paint: ['#b9cdea', '#2e5ea6', '#0c1a36'], paint2: ['#6a6f80', '#15171e', '#040508'], belt: 0.72,
  body: shape([[0.04, 0.32, 0], [-0.02, 0.62], [0.05, 0.84, 0], [0.4, 0.92], [0.9, 1.02], [1.4, 1.14], [1.9, 1.2], [2.35, 1.19, 0], [2.76, 1.05], [3.22, 0.88, 0], [3.62, 0.82], [4.1, 0.75], [4.52, 0.64], [4.76, 0.5, 0], [4.7, 0.3], [4.4, 0.23, 0], [0.25, 0.26, 0]]),
  parts: [
    // rear section and roof in black, behind the C-line
    {d: shape([[-0.2, 0.2, 0], [1.6, 0.2, 0], [1.42, 0.4], [1.36, 0.72], [1.5, 1.0], [1.88, 1.22], [2.4, 1.3, 0], [-0.2, 1.3, 0]]), fill: 'paint2', clip: true, layer: 'mid'},
    // the C-line in polished metal
    {d: line([[2.3, 1.18], [1.9, 1.16], [1.52, 0.98], [1.38, 0.7], [1.44, 0.42], [1.66, 0.32], [2.2, 0.3], [2.9, 0.3]]), stroke: 'chrome', sw: 0.028, clip: true, layer: 'mid'},
    // side intake inside the C, glass
    {d: shape([[1.5, 0.5, 0], [1.78, 0.52], [1.86, 0.9, 0], [1.62, 0.86], [1.5, 0.7]]), fill: '#07080c', layer: 'mid'},
    {d: shape([[1.98, 0.93, 0], [3.1, 0.9, 0], [2.7, 1.06], [2.3, 1.15], [2.02, 1.15, 0]]), fill: 'glass', layer: 'mid'},
    {d: line([[3.08, 0.32, 0], [3.12, 0.86, 0]]), stroke: '#0c1a36', sw: 0.012, layer: 'mid'},
    {d: line([[3.3, 0.86], [3.9, 0.78], [4.5, 0.64]]), stroke: '#ffffff', sw: 0.012, op: 0.45, layer: 'mid'},
    {d: line([[0.5, 0.93], [1.0, 1.03], [1.5, 1.15]]), stroke: '#ffffff', sw: 0.01, op: 0.3, layer: 'mid'},
    // horseshoe grille edge, quad headlights, light bar, diffuser
    {d: shape([[4.6, 0.3, 0], [4.72, 0.32], [4.74, 0.5, 0], [4.62, 0.48]]), fill: 'chrome', layer: 'mid'},
    ...[0, 1, 2, 3].map((i) => ({d: rect(4.36 + i * 0.07, 0.64 - i * 0.025, 4.41 + i * 0.07, 0.68 - i * 0.025, 0.01), fill: '#eaf2ff', layer: 'mid' as const})),
    {d: rect(-0.02, 0.74, 0.06, 0.79, 0.01), fill: '#ff3a2e', layer: 'mid'},
    {d: rect(0.0, 0.26, 0.6, 0.36), fill: '#0a0b0e', layer: 'mid'},
    {d: shape([[2.88, 0.9, 0], [3.02, 0.92], [3.04, 0.99], [2.9, 1.0]]), fill: 'paint', solid: true, layer: 'front'},
  ],
  wheels: [
    {x: 1.05, r: 0.355, rim: 0.245, style: 'turbine', caliper: '#2a62c0'},
    {x: 3.76, r: 0.345, rim: 0.245, style: 'turbine', caliper: '#2a62c0'},
  ],
  head: [4.5, 0.62], tail: [[0.02, 0.76]],
};

// ThrustSSC, 1997: 16.5 m long, two Rolls-Royce Spey jet engines either side of the cockpit, tail fin, solid aluminium wheels.
const thrust: VSpec = {
  L: 16.5, H: 3.0, bounce: 0.004, dust: true,
  paint: ['#7c7a88', '#1d1c22', '#060608'], belt: 0.9,
  flame: {x: 9.05, y: 0.98, r: 0.5, len: 4.2},
  body: shape([[0.1, 0.42, 0], [0.0, 0.78], [0.1, 1.18, 0], [3.4, 1.26], [7.0, 1.34], [9.6, 1.5], [10.4, 1.62, 0], [11.9, 1.6], [13.4, 1.38], [15.2, 1.05], [16.5, 0.72, 0], [15.4, 0.48], [13.8, 0.32], [9.5, 0.28], [6.0, 0.36], [2.0, 0.38]], 0.18),
  parts: [
    // tail fin
    {d: shape([[0.25, 1.15, 0], [0.55, 3.0, 0], [1.45, 3.0, 0], [3.4, 1.24, 0]], 0.1), fill: 'paint', solid: true, layer: 'back'},
    {d: line([[0.62, 2.9, 0], [1.4, 2.9, 0]]), stroke: '#c8c2cc', sw: 0.04, op: 0.5, layer: 'back'},
    // canopy
    {d: shape([[10.2, 1.58, 0], [10.6, 1.86], [11.2, 1.94], [11.9, 1.62, 0]]), fill: 'glass', solid: true, layer: 'mid'},
    // near-side jet engine nacelle with intake and nozzle
    {d: shape([[8.95, 0.42, 0], [8.95, 1.52, 0], [10.2, 1.62], [13.2, 1.6], [14.1, 1.5, 0], [14.1, 0.36, 0], [13.2, 0.3], [10.2, 0.32]], 0.12), fill: 'paint', solid: true, layer: 'mid'},
    {d: ellipse(14.12, 0.93, 0.1, 0.56), fill: '#050506', layer: 'mid'},
    {d: ellipse(14.15, 0.93, 0.06, 0.6), fill: 'none', stroke: '#8a8794', sw: 0.05, layer: 'mid'},
    {d: rect(8.85, 0.46, 9.08, 1.48, 0.06), fill: '#3a3438', layer: 'mid'},
    {d: line([[9.6, 1.55], [11.5, 1.6], [13.6, 1.52]]), stroke: '#ffffff', sw: 0.04, op: 0.35, layer: 'mid'},
    {d: line([[9.2, 0.52], [13.8, 0.48]]), stroke: '#000', sw: 0.05, op: 0.35, layer: 'mid'},
    {d: line([[10.0, 0.4, 0], [10.0, 1.6, 0]]), stroke: '#2e2c34', sw: 0.025, layer: 'mid'},
    {d: line([[12.6, 0.36, 0], [12.6, 1.6, 0]]), stroke: '#2e2c34', sw: 0.025, layer: 'mid'},
    // white nose stripe and panel lines on the rear body
    {d: line([[14.4, 1.18], [15.4, 0.98], [16.3, 0.76]]), stroke: '#ffffff', sw: 0.05, op: 0.55, layer: 'mid'},
    {d: line([[3.4, 1.22], [6.0, 1.28], [8.8, 1.4]]), stroke: '#ffffff', sw: 0.035, op: 0.3, layer: 'mid'},
    ...[2.4, 4.6, 6.8].map((x) => ({d: line([[x, 0.4, 0], [x, 1.28, 0]]), stroke: '#2e2c34', sw: 0.025, layer: 'mid' as const})),
    // wheel fairings
    {d: shape([[1.0, 0.2, 0], [1.2, 0.6], [2.6, 0.62], [2.8, 0.2, 0]]), fill: 'paint', solid: true, layer: 'front'},
  ],
  wheels: [
    {x: 1.9, r: 0.46, rim: 0.4, style: 'disc', well: false, far: true},
    {x: 12.4, r: 0.46, rim: 0.4, style: 'disc', well: false, far: true},
    {x: 13.5, r: 0.46, rim: 0.4, style: 'disc', well: false, far: true},
  ],
};

export const VEHICLES: Record<string, VSpec> = {benz, modelT, beetle, f40, f1, mclaren, chiron, thrust};
export {DARK, poly};
