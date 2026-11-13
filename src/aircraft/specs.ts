// Side profiles of the eight flying machines in Short 05, in metres, from published lengths and heights.
// Tail at x = 0, nose at x = L, fuselage centre line at y = 0. No airline or squadron markings.
import {ASpec} from './types';
import {circle, ellipse, line, poly, rect, shape} from '../vehicles/path';

const WOOD = '#6b4a30', WIRE = '#3b2c28', TILE = '#1a171b';
const dots = (x0: number, x1: number, step: number, y: number, r: number, fill: string) =>
  Array.from({length: Math.floor((x1 - x0) / step) + 1}, (_, i) => ({d: ellipse(x0 + i * step, y, r * 0.8, r), fill}));

// a thin cambered surface seen edge-on (wing, elevator) from trailing edge x0 to leading edge x1
const foil = (x0: number, x1: number, y: number, th: number, camber: number) => shape([
  [x0, y, 0], [x0 + (x1 - x0) * 0.45, y + camber + th * 0.5], [x1 - (x1 - x0) * 0.1, y + camber * 0.7 + th * 0.6], [x1, y + th * 0.3],
  [x1 - (x1 - x0) * 0.08, y - th * 0.3], [x0 + (x1 - x0) * 0.45, y + camber - th * 0.4],
]);

// Wright Flyer, 1903: 6.43 m long (21 ft 1 in), biplane with a 1.83 m wing gap, front elevator, twin rear rudders,
// two 2.6 m pusher propellers driven by chains, pilot lying on the lower wing.
const wright: ASpec = {
  L: 6.43, top: 1.1, bot: -1.4, bob: 0.05,
  paint: ['#f4ead6', '#d9c7a6', '#9c8668'],
  body: foil(1.9, 3.88, 0.95, 0.06, 0.1), // upper wing
  parts: [
    // booms to the rudders and the elevator outriggers
    {d: line([[0.45, 0.95], [1.95, 0.98]]), stroke: WOOD, sw: 0.04, solid: true, layer: 'back'},
    {d: line([[0.45, -0.72], [1.95, -0.86]]), stroke: WOOD, sw: 0.04, solid: true, layer: 'back'},
    {d: line([[3.85, 0.98, 0], [5.7, 0.62, 0]]), stroke: WOOD, sw: 0.04, solid: true, layer: 'back'},
    {d: line([[3.85, -0.86, 0], [5.7, -0.22, 0]]), stroke: WOOD, sw: 0.04, solid: true, layer: 'back'},
    // skids
    {d: line([[1.9, -1.32], [4.5, -1.32], [5.8, -1.3], [6.25, -1.1], [6.3, -0.55]]), stroke: WOOD, sw: 0.06, solid: true, layer: 'back'},
    {d: line([[2.2, -0.86, 0], [2.2, -1.32, 0]]), stroke: WOOD, sw: 0.035, layer: 'back'},
    {d: line([[3.6, -0.86, 0], [3.6, -1.32, 0]]), stroke: WOOD, sw: 0.035, layer: 'back'},
    // rudders (two, seen as one)
    {d: shape([[0.0, -0.72, 0], [0.55, -0.72, 0], [0.55, 1.02, 0], [0.0, 1.02, 0]]), fill: 'paint', solid: true, layer: 'back'},
    {d: line([[0.02, -0.7, 0], [0.02, 1.0, 0]]), stroke: WOOD, sw: 0.03, layer: 'back'},
    // lower wing, struts and bracing wires
    {d: foil(1.9, 3.88, -0.88, 0.06, 0.1), fill: 'paint', solid: true},
    ...[2.0, 2.55, 3.15, 3.75].map((x) => ({d: line([[x, -0.84, 0], [x, 0.98, 0]]), stroke: WOOD, sw: 0.035, solid: true})),
    {d: line([[2.0, -0.84, 0], [2.55, 0.98, 0], [3.15, -0.84, 0], [3.75, 0.98, 0]]), stroke: WIRE, sw: 0.012, op: 0.7},
    {d: line([[2.0, 0.98, 0], [2.55, -0.84, 0], [3.15, 0.98, 0], [3.75, -0.84, 0]]), stroke: WIRE, sw: 0.012, op: 0.7},
    // ribs seen through the fabric
    ...[2.2, 2.6, 3.0, 3.4].map((x) => ({d: line([[x, 0.98, 0], [x + 0.25, 1.04, 0]]), stroke: '#b8a07e', sw: 0.015, op: 0.6})),
    // engine and chain drive
    {d: rect(2.25, -0.84, 2.85, -0.42, 0.04), fill: '#3a3438', solid: true},
    {d: rect(2.3, -0.42, 2.8, -0.32, 0.02), fill: '#6a5f5a'},
    {d: line([[2.3, -0.6], [1.8, -0.05]]), stroke: '#2a2224', sw: 0.025},
    // pilot lying prone, head forward
    {d: shape([[2.85, -0.83, 0], [3.0, -0.6], [3.5, -0.56], [3.9, -0.58], [4.0, -0.7], [3.9, -0.83, 0]]), fill: '#2c2a30', solid: true},
    {d: circle(4.06, -0.62, 0.11), fill: '#3a2a22', solid: true},
    {d: circle(4.1, -0.65, 0.07), fill: '#c99a7a'},
    // front elevator (biplane), with its struts
    {d: foil(5.6, 6.43, 0.62, 0.05, 0.06), fill: 'paint', solid: true, layer: 'front'},
    {d: foil(5.6, 6.43, -0.2, 0.05, 0.06), fill: 'paint', solid: true, layer: 'front'},
    {d: line([[5.75, -0.2, 0], [5.75, 0.64, 0]]), stroke: WOOD, sw: 0.03, layer: 'front'},
    {d: line([[6.25, -0.18, 0], [6.25, 0.66, 0]]), stroke: WOOD, sw: 0.03, layer: 'front'},
  ],
  props: [{x: 1.72, y: 0.06, r: 1.3, blades: 2, color: '#5a3f2a'}],
};

// Ryan NYP "Spirit of St. Louis", 1927: 8.41 m long, high wing, silver fabric, aluminium nose, fixed gear.
const spirit: ASpec = {
  L: 8.41, top: 1.3, bot: -2.1, bob: 0.06,
  paint: ['#efeae6', '#b6afb2', '#6a6468'],
  paint2: ['#fbf6f0', '#c9c2c0', '#77707a'],
  body: shape([[0.2, 0.12, 0], [2.0, 0.3], [4.4, 0.58], [6.4, 0.66], [7.4, 0.62, 0], [7.4, -0.58, 0], [6.4, -0.62], [4.4, -0.55], [2.0, -0.24], [0.2, -0.06, 0]]),
  parts: [
    // fin, rudder and tailplane
    {d: shape([[0.0, 0.0, 0], [0.05, 0.9], [0.4, 1.28], [0.85, 1.12], [1.15, 0.3], [1.3, 0.16, 0]]), fill: 'paint', solid: true, layer: 'back'},
    {d: line([[0.55, 0.1, 0], [0.62, 1.22, 0]]), stroke: '#8a8286', sw: 0.02, layer: 'back'},
    {d: foil(0.0, 1.5, 0.12, 0.06, 0.02), fill: '#9a9296', solid: true, layer: 'front'},
    // landing gear and tail skid
    {d: line([[5.6, -0.5, 0], [6.15, -1.7, 0]]), stroke: '#4a4448', sw: 0.07, solid: true, layer: 'back'},
    {d: line([[6.6, -0.6, 0], [6.15, -1.7, 0]]), stroke: '#4a4448', sw: 0.07, solid: true, layer: 'back'},
    {d: circle(6.15, -1.74, 0.34), fill: '#151214', solid: true, layer: 'back'},
    {d: circle(6.15, -1.74, 0.16), fill: '#6c666a', layer: 'back'},
    {d: line([[0.6, -0.08, 0], [0.35, -0.32, 0]]), stroke: '#4a4448', sw: 0.05, solid: true, layer: 'back'},
    // high wing with its struts
    {d: foil(4.5, 6.75, 0.7, 0.26, 0.08), fill: 'paint2', solid: true, layer: 'front'},
    {d: line([[5.8, -0.45, 0], [4.9, 0.72, 0]]), stroke: '#5a5458', sw: 0.05, solid: true},
    {d: line([[5.8, -0.45, 0], [6.4, 0.72, 0]]), stroke: '#5a5458', sw: 0.05, solid: true},
    // aluminium nose: engine-turned cowling and the radial engine's cylinders
    {d: shape([[6.3, 0.66, 0], [7.4, 0.66], [7.95, 0.52], [8.0, -0.5], [7.4, -0.62], [6.3, -0.62, 0]]), fill: 'metal', solid: true},
    ...[0, 1, 2, 3, 4].map((i) => ({d: rect(7.95, -0.48 + i * 0.22, 8.12, -0.36 + i * 0.22, 0.03), fill: '#3a3438'})),
    {d: shape([[8.1, 0.22, 0], [8.41, 0.02], [8.1, -0.18, 0]]), fill: 'metal', solid: true},
    // side window, door seam, exhaust
    {d: rect(4.0, 0.12, 4.55, 0.45, 0.05), fill: 'glass'},
    {d: line([[5.2, -0.5, 0], [5.2, 0.6, 0]]), stroke: '#8a8286', sw: 0.015},
    {d: line([[6.9, -0.6], [6.3, -0.75]]), stroke: '#3a3438', sw: 0.06},
  ],
  props: [{x: 8.25, y: 0.02, r: 1.33, blades: 2, color: '#b6b0b2'}],
};

// Supermarine Spitfire Mk IX: 9.47 m long, Merlin engine, bubble canopy, gear up. RAF day-fighter grey and green.
const spitfire: ASpec = {
  L: 9.47, top: 1.6, bot: -0.8, bob: 0.07,
  paint: ['#77806a', '#5a6350', '#a3a8ac'],
  body: shape([[0.3, 0.26, 0], [2.0, 0.36], [3.9, 0.52], [5.9, 0.5, 0], [6.6, 0.48], [8.6, 0.44], [9.1, 0.32, 0], [9.1, -0.3, 0], [8.6, -0.42], [7.0, -0.5], [5.4, -0.62], [4.4, -0.56], [2.0, -0.32], [0.3, -0.1, 0]]),
  parts: [
    // elliptical fin and rudder
    {d: shape([[0.0, 0.1, 0], [0.05, 0.9], [0.35, 1.48], [0.75, 1.5], [1.1, 1.0], [1.35, 0.32, 0]]), fill: 'paint', solid: true, layer: 'back'},
    {d: line([[0.42, 0.2, 0], [0.48, 1.45, 0]]), stroke: '#3e4436', sw: 0.015, layer: 'back'},
    // camouflage: dark green wave over the grey
    {d: shape([[0.3, 0.4, 0], [1.5, 0.05], [2.6, 0.3], [3.8, -0.05], [5.0, 0.2], [6.5, -0.1], [8.0, 0.18], [9.1, 0.0, 0], [9.1, 0.6, 0], [0.3, 0.6, 0]]), fill: '#3f4a36', op: 0.8, clip: true},
    {d: rect(0, -0.8, 9.5, -0.18), fill: '#a7acb0', op: 0.85, clip: true},
    // sky band, roundel and fin flash
    {d: rect(1.15, -0.4, 1.45, 0.6), fill: '#b9c4a8', clip: true},
    {d: circle(3.3, 0.04, 0.4), fill: '#e2b43a'},
    {d: circle(3.3, 0.04, 0.34), fill: '#2b3a63'},
    {d: circle(3.3, 0.04, 0.22), fill: '#ece6da'},
    {d: circle(3.3, 0.04, 0.13), fill: '#a3302c'},
    {d: rect(0.6, 0.55, 0.78, 0.95), fill: '#a3302c', layer: 'front'},
    {d: rect(0.78, 0.55, 0.84, 0.95), fill: '#ece6da', layer: 'front'},
    {d: rect(0.84, 0.55, 1.02, 0.95), fill: '#2b3a63', layer: 'front'},
    // canopy and windscreen
    {d: shape([[4.0, 0.52, 0], [4.4, 0.78], [5.1, 0.9], [5.6, 0.84], [6.0, 0.5, 0]]), fill: 'glass', solid: true},
    {d: line([[5.55, 0.86, 0], [5.6, 0.5, 0]]), stroke: '#2a2a2a', sw: 0.025},
    // wing seen edge-on, radiator under it, tailplane
    {d: foil(4.2, 6.6, -0.5, 0.18, 0.04), fill: 'paint', solid: true, layer: 'front'},
    {d: shape([[4.6, -0.6, 0], [4.9, -0.84], [5.9, -0.86], [6.2, -0.62, 0]]), fill: '#8f9498', solid: true, layer: 'front'},
    {d: foil(0.0, 1.6, 0.14, 0.07, 0.02), fill: 'paint', solid: true, layer: 'front'},
    // exhaust stubs along the Merlin cowling, panel lines
    ...[0, 1, 2, 3, 4, 5].map((i) => ({d: rect(7.0 + i * 0.24, 0.1, 7.16 + i * 0.24, 0.2, 0.02), fill: '#2a2224', layer: 'front' as const})),
    {d: line([[6.6, -0.48, 0], [6.6, 0.48, 0]]), stroke: '#2f3628', sw: 0.012, op: 0.7},
    {d: line([[8.6, -0.42, 0], [8.6, 0.44, 0]]), stroke: '#2f3628', sw: 0.012, op: 0.7},
    // spinner
    {d: shape([[9.05, 0.33, 0], [9.47, 0.0, 0], [9.05, -0.31, 0]]), fill: '#3e4436', solid: true, layer: 'front'},
  ],
  props: [{x: 9.18, y: 0.01, r: 1.62, blades: 4}],
};

// Boeing 747-400: 70.66 m long, hump with the upper deck, four engines under swept wings, winglets. Plain livery.
const b747: ASpec = {
  L: 70.66, top: 12, bot: -6, bob: 0.25,
  paint: ['#f8f4f1', '#dcd5d4', '#8e8890'],
  paint2: ['#4a5878', '#2d3a5a', '#1a2238'],
  body: shape([[0.0, 1.0, 0], [4.0, 2.6], [12.0, 3.2], [44.0, 3.25], [50.0, 3.6], [57.0, 4.65], [63.5, 4.55], [67.6, 3.0], [69.8, 1.2], [70.66, -0.4], [70.2, -1.4], [68.0, -2.5], [62.0, -3.2], [20.0, -3.25], [13.0, -2.6], [5.0, -0.7], [0.0, 0.6, 0]]),
  parts: [
    // fin (dark blue, no airline markings) and tailplane
    {d: shape([[14.5, 3.0, 0], [6.5, 9.0], [3.6, 12.0, 0], [1.6, 12.0, 0], [0.9, 7.0], [1.0, 2.0, 0]]), fill: 'paint2', solid: true, layer: 'back'},
    {d: shape([[11.0, 1.6, 0], [3.0, 2.4], [0.4, 2.7, 0], [0.6, 2.2, 0], [4.0, 1.6], [11.0, 1.2, 0]]), fill: '#c9c2c4', solid: true, layer: 'front'},
    // far-side engines, partly hidden
    {d: rect(37.0, -5.3, 43.2, -3.3, 1.0), fill: '#59545e', layer: 'back'},
    // belly shading and a cheatline
    {d: rect(0, -4, 72, -1.7), fill: '#b9b1b4', op: 0.55, clip: true},
    {d: rect(0, -0.2, 72, 0.15), fill: '#2d3a5a', op: 0.85, clip: true},
    // windows: main deck, upper deck, cockpit; doors
    ...dots(9, 66, 0.55, 0.95, 0.16, '#2a2632'),
    ...dots(51, 62.5, 0.55, 3.35, 0.16, '#2a2632'),
    {d: poly([[67.6, 2.0], [69.0, 1.4], [69.3, 0.9], [67.7, 1.2]]), fill: '#1a1620'},
    ...[11, 25, 38, 52, 64].map((x) => ({d: rect(x, -1.1, x + 1.1, 1.8, 0.3), fill: 'none', stroke: '#a69ea2', sw: 0.08})),
    // near wing (swept away from us) with winglet, wing-body fairing
    {d: shape([[45.0, -2.4, 0], [33.0, -0.3], [24.6, 1.0, 0], [23.0, 1.1, 0], [27.0, -0.6], [33.0, -2.2, 0]]), fill: '#cfc8ca', solid: true, layer: 'front'},
    {d: shape([[24.6, 1.0, 0], [23.6, 3.0, 0], [22.6, 3.0, 0], [23.0, 1.1, 0]]), fill: 'paint2', solid: true, layer: 'front'},
    {d: shape([[30, -3.25, 0], [36, -3.9], [46, -3.6], [48, -3.0, 0]]), fill: '#b8b0b4', layer: 'front'},
    // near engines on pylons
    {d: poly([[38.5, -2.5], [41.5, -2.8], [41.0, -3.4], [38.5, -3.4]]), fill: '#9a9296', layer: 'front'},
    {d: poly([[31.0, -1.2], [34.0, -1.4], [33.5, -2.0], [31.0, -2.0]]), fill: '#9a9296', layer: 'front'},
    {d: shape([[36.6, -3.2, 0], [43.6, -3.1], [44.0, -4.5], [43.6, -5.9], [36.6, -5.4, 0]]), fill: 'metal', solid: true, layer: 'front'},
    {d: ellipse(43.8, -4.5, 0.25, 1.35), fill: '#1c1a20', layer: 'front'},
    {d: shape([[29.4, -1.95, 0], [36.4, -1.85], [36.8, -3.2], [36.4, -4.55], [29.4, -4.1, 0]]), fill: 'metal', solid: true, layer: 'front'},
    {d: ellipse(36.6, -3.2, 0.25, 1.35), fill: '#1c1a20', layer: 'front'},
  ],
  trails: [[36.6, -4.3], [29.4, -3.0]],
};

// Concorde: 61.66 m long, slender fuselage, ogival delta wing, four engines in two boxes, tall swept fin, nose up for cruise.
const concorde: ASpec = {
  L: 61.66, top: 9.5, bot: -3.6, bob: 0.2,
  paint: ['#fcf9f6', '#ddd7d6', '#8c8890'],
  body: shape([[0.0, 0.7, 0], [3.0, 1.2], [10.0, 1.45], [52.0, 1.45], [55.5, 1.25], [58.0, 0.7], [61.66, -0.05, 0], [58.5, -0.75], [54.0, -1.35], [20.0, -1.45], [8.0, -1.2], [0.0, 0.3, 0]]),
  parts: [
    {d: shape([[17.0, 1.4, 0], [8.0, 6.0], [4.8, 9.2, 0], [3.2, 9.2, 0], [1.4, 5.0], [0.8, 1.2, 0]]), fill: 'paint', solid: true, layer: 'back'},
    {d: line([[3.0, 9.0, 0], [1.6, 1.4, 0]]), stroke: '#b8b0b4', sw: 0.06, layer: 'back'},
    // delta wing edge-on, with elevons
    {d: shape([[42.0, -1.35, 0], [24.0, -1.75], [3.5, -2.0, 0], [3.0, -1.6, 0], [20.0, -1.3, 0]]), fill: '#d6d0d0', solid: true, layer: 'front'},
    // engine boxes and intakes
    {d: poly([[3.6, -1.9], [18.5, -1.85], [17.0, -3.5], [3.6, -3.5]]), fill: 'metal', layer: 'front'},
    {d: poly([[16.6, -1.95], [18.4, -1.95], [16.9, -3.4], [16.2, -3.4]]), fill: '#2a2630', layer: 'front'},
    {d: rect(3.0, -3.3, 3.8, -2.1, 0.1), fill: '#3a3438', layer: 'front'},
    // window row, cockpit, panel line
    ...dots(14, 51, 0.62, 0.35, 0.11, '#2a2632'),
    {d: poly([[56.0, 1.15], [57.6, 0.75], [57.7, 0.5], [56.0, 0.85]]), fill: '#1a1620'},
    {d: line([[58.0, 0.7, 0], [57.7, -0.8, 0]]), stroke: '#a69ea2', sw: 0.05},
  ],
  trails: [[3.2, -2.4], [3.2, -3.0]],
};

// Lockheed SR-71 Blackbird: 32.74 m long, flat chined fuselage, engine nacelles with inlet spikes, canted fins. Black.
const sr71: ASpec = {
  L: 32.74, top: 4.6, bot: -1.4, bob: 0.12, rim: 3.6,
  paint: ['#5a5466', '#26232e', '#0c0b10'],
  body: shape([[0.0, 0.35, 0], [6.0, 0.85], [16.0, 0.95], [21.0, 0.85], [23.4, 1.2], [25.6, 1.2], [29.0, 0.5], [32.74, 0.0, 0], [31.0, -0.15], [26.0, -0.45], [16.0, -0.95], [6.0, -0.8], [0.0, -0.25, 0]]),
  parts: [
    // nacelle with inlet spike and exhaust
    {d: shape([[1.2, 1.0, 0], [6.0, 1.15], [19.5, 1.0], [21.0, 0.75, 0], [21.0, -0.95, 0], [19.5, -1.15], [6.0, -1.25], [1.2, -1.0, 0]]), fill: 'paint', solid: true, layer: 'mid'},
    {d: shape([[21.0, 0.7, 0], [23.6, 0.05, 0], [21.0, -0.9, 0]]), fill: '#2a2632', solid: true, layer: 'mid'},
    {d: rect(0.5, -0.95, 1.3, 0.85, 0.15), fill: '#151218', layer: 'mid'},
    // canted fin above the nacelle
    {d: shape([[10.0, 1.0, 0], [4.6, 4.4, 0], [2.6, 4.4, 0], [3.0, 1.0, 0]]), fill: 'paint', solid: true, layer: 'front'},
    // chine highlight and canopy
    {d: line([[31.5, -0.06], [26.0, 0.0], [20.0, 0.05]]), stroke: '#5a5464', sw: 0.05, op: 0.8, layer: 'front'},
    {d: shape([[23.5, 1.15, 0], [24.2, 1.4], [25.6, 1.38], [26.6, 1.1, 0]]), fill: 'glass', solid: true, layer: 'front'},
    {d: line([[25.0, 1.4, 0], [25.0, 1.12, 0]]), stroke: '#111', sw: 0.04, layer: 'front'},
    // small red stencil line
    {d: line([[27.0, 0.25, 0], [28.6, 0.2, 0]]), stroke: '#a3302c', sw: 0.06, op: 0.8, layer: 'front'},
  ],
  flame: [{x: 0.5, y: -0.05, r: 0.85, len: 9, kind: 'jet'}],
};

// North American X-15 (X-15A-2 as flown at Mach 6.7, white ablative coating): 15.45 m long, rocket powered,
// side fairings, wedge-shaped upper and lower fins, short wings.
const x15: ASpec = {
  L: 15.45, top: 2.7, bot: -2.1, bob: 0.08,
  paint: ['#fbf7f2', '#ded6cf', '#958d8a'],
  body: shape([[0.0, 0.62, 0], [8.0, 0.66], [11.4, 0.66], [12.6, 0.55], [14.4, 0.25], [15.45, 0.0, 0], [14.4, -0.25], [12.6, -0.55], [11.0, -0.66], [0.0, -0.62, 0]]),
  parts: [
    {d: shape([[4.4, 0.6, 0], [1.9, 2.6, 0], [0.15, 2.6, 0], [0.15, 0.6, 0]]), fill: 'paint', solid: true, layer: 'back'},
    {d: shape([[4.0, -0.6, 0], [1.7, -2.0, 0], [0.15, -2.0, 0], [0.15, -0.6, 0]]), fill: 'paint', solid: true, layer: 'back'},
    // side tunnel fairing
    {d: rect(1.8, -0.24, 11.6, 0.16, 0.1), fill: '#cfc6be', layer: 'mid'},
    // short wing, edge-on, and the all-moving tailplane with anhedral
    {d: foil(3.4, 7.6, -0.18, 0.14, 0.02), fill: '#c4bcb6', solid: true, layer: 'front'},
    {d: poly([[0.3, -0.1], [2.8, 0.05], [2.8, -0.12], [0.3, -0.42]]), fill: '#b8b0aa', solid: true, layer: 'front'},
    // canopy, nozzle, scorch near the nose
    {d: shape([[11.2, 0.64, 0], [11.6, 0.9], [12.3, 0.88], [12.7, 0.56, 0]]), fill: 'glass', solid: true},
    {d: rect(-0.15, -0.45, 0.15, 0.45, 0.05), fill: '#2a2428', solid: true},
    {d: shape([[13.4, 0.42, 0], [15.45, 0.0, 0], [13.4, -0.42, 0]]), fill: '#8a6a5a', op: 0.35, clip: true},
    ...[3.0, 6.0, 9.0].map((x) => ({d: line([[x, -0.62, 0], [x, 0.64, 0]]), stroke: '#b9b0a8', sw: 0.025})),
  ],
  flame: [{x: -0.15, y: 0.0, r: 0.5, len: 11, kind: 'rocket'}],
};

// Space Shuttle orbiter: 37.24 m long, white upper surface, black heat-shield tiles underneath, delta wing,
// OMS pods either side of the fin, three main engines. Coasting in orbit, so no flame.
const shuttle: ASpec = {
  L: 37.24, top: 11.6, bot: -2.4, bob: 0.1,
  paint: ['#f8f5f0', '#d8d3ce', '#8c8789'],
  body: shape([[0.6, -1.2, 0], [0.6, 3.0, 0], [4.0, 3.1], [30.0, 3.1], [32.5, 2.75], [34.5, 2.0], [36.4, 0.9], [37.24, -0.5], [36.6, -1.4], [34.0, -1.9], [10.0, -2.0], [2.0, -1.9, 0]]),
  parts: [
    // fin with rudder/speed brake line
    {d: shape([[9.0, 3.0, 0], [5.4, 7.6], [4.4, 11.4, 0], [2.6, 11.4, 0], [1.0, 6.0], [0.7, 3.0, 0]]), fill: 'paint', solid: true, layer: 'back'},
    {d: line([[2.8, 11.2, 0], [1.2, 3.4, 0]]), stroke: '#a8a2a2', sw: 0.07, layer: 'back'},
    // main engine bells and body flap
    ...[1.9, -0.1].map((y) => ({d: poly([[0.6, y + 0.55], [-1.9, y + 1.05], [-1.9, y - 1.05], [0.6, y - 0.55]]), fill: 'dark', solid: true, layer: 'back' as const})),
    {d: rect(-0.9, -2.0, 1.2, -1.45, 0.1), fill: TILE, solid: true},
    // OMS pod
    {d: shape([[0.6, 2.6, 0], [0.6, 4.1, 0], [3.0, 4.2], [8.5, 3.4], [10.5, 3.05, 0]]), fill: 'paint', solid: true},
    // black tiles: belly, wing glove and nose cap; payload bay door line; windows
    {d: rect(-1, -3, 38, -1.15), fill: TILE, clip: true},
    {d: shape([[33.5, 3.2, 0], [36.4, 0.9], [37.4, -0.6], [36.8, -1.6], [34.6, -2.2, 0]]), fill: TILE, clip: true},
    {d: line([[8.5, 3.1, 0], [30.5, 3.1, 0]]), stroke: '#a8a2a2', sw: 0.06},
    {d: line([[8.5, 2.4, 0], [30.0, 2.4, 0]]), stroke: '#c2bcba', sw: 0.04},
    {d: poly([[31.6, 2.85], [33.2, 2.5], [33.5, 2.05], [31.7, 2.25]]), fill: '#121014'},
    {d: poly([[33.5, 2.45], [34.4, 2.0], [34.5, 1.65], [33.6, 2.0]]), fill: '#121014'},
    // delta wing edge-on, black leading edge
    {d: shape([[24.0, -1.7, 0], [12.0, -2.1], [2.0, -2.35, 0], [2.0, -1.8, 0], [14.0, -1.6, 0]]), fill: '#d2ccc8', solid: true, layer: 'front'},
    {d: shape([[24.0, -1.7, 0], [14.0, -2.05], [12.0, -2.15, 0], [16.0, -1.85, 0]]), fill: TILE, layer: 'front'},
  ],
};

export const AIRCRAFT: Record<string, ASpec> = {wright, spirit, spitfire, b747, concorde, sr71, x15, shuttle};
