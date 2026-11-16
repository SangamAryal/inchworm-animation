export const rng = (seed: number) => {
  let a = (seed * 2654435761) >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

// Smooth 1D value noise in -1..1 (cubic-interpolated random values at integer points). Unlike a sine it never
// repeats, so drifts and camera sway built from it do not read as a machine-made loop.
export const noise1 = (x: number, seed = 0) => {
  const h = (i: number) => {
    let a = (i * 374761393 + seed * 668265263) | 0;
    a = Math.imul(a ^ (a >>> 13), 1274126177);
    return (((a ^ (a >>> 16)) >>> 0) / 4294967296) * 2 - 1;
  };
  const i = Math.floor(x), u = x - i, s = u * u * (3 - 2 * u);
  return h(i) + (h(i + 1) - h(i)) * s;
};
// two octaves, roughly -1..1
export const fbm1 = (x: number, seed = 0) => 0.7 * noise1(x, seed) + 0.3 * noise1(x * 2.3 + 17, seed + 1);
