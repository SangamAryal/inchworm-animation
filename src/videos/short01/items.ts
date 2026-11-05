import {Item, Timing} from '../../engine/types';

// Diameters: NASA planetary fact sheets (equatorial); black holes use the
// event-horizon (Schwarzschild) diameter 4GM/c^2 = 5.906 km per solar mass.
const horizon = (solarMasses: number) => solarMasses * 5.906;

export const SHORT01_ITEMS: Item[] = [
  {name: 'Neutron star', kindLabel: 'Collapsed star core', km: 20, body: 'neutron', ext: 6, lift: 1, glow: '#9CC4FF', params: {seed: 0.4}},
  {name: 'The Moon', kindLabel: "Earth's moon", km: 3475, body: 'moon', ext: 1.03, lift: 1, params: {spin: 0}},
  {name: 'Mars', kindLabel: 'Planet', km: 6792, body: 'mars', ext: 1.06, lift: 1, params: {spin: 1.2}},
  {name: 'Earth', kindLabel: 'Planet', km: 12756, body: 'earth', ext: 1.1, lift: 1, params: {spin: 4.4}},
  {name: 'Neptune', kindLabel: 'Ice giant', km: 49528, body: 'neptune', ext: 1.06, lift: 1, params: {spin: 0.5}},
  {name: 'Jupiter', kindLabel: 'Gas giant', km: 142984, body: 'jupiter', ext: 1.03, lift: 1, params: {spin: 0.3}},
  {name: 'The Sun', kindLabel: 'Our star', km: 1391400, body: 'sun', ext: 1.7, lift: 1, glow: '#FFB070'},
  {name: 'Sagittarius A*', kindLabel: 'Black hole · Milky Way centre', km: horizon(4.3e6), note: 'event horizon', body: 'blackhole', ext: 6.4, lift: 6.2, glow: '#FF9A4A', params: {incl: 0.55, spin: -0.5, tint: [1, 0.85, 1]}},
  {name: 'Betelgeuse', kindLabel: 'Red supergiant', km: 764 * 1391400, body: 'redgiant', ext: 1.55, lift: 1, glow: '#FF7A45'},
  {name: 'M87*', kindLabel: 'Black hole · galaxy M87', km: horizon(6.5e9), note: 'event horizon', body: 'blackhole', ext: 6.4, lift: 6.2, glow: '#FF9A4A', params: {incl: 0.3, spin: 1.57, tint: [1, 0.8, 1]}},
  {name: 'TON 618', kindLabel: 'Quasar black hole', km: horizon(4.07e10), note: 'event horizon', body: 'blackhole', ext: 6.4, lift: 3.4, glow: '#FFD9A8', params: {incl: 1.38, tint: [1, 1.15, 1]}},
];

export const SHORT01_TIMING: Timing = {intro: 60, hold: 72, move: 42, outro: 45};
