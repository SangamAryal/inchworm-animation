export type V = [number, number];

export const add = (a: V, b: V): V => [a[0] + b[0], a[1] + b[1]];
export const sub = (a: V, b: V): V => [a[0] - b[0], a[1] - b[1]];
export const mul = (a: V, k: number): V => [a[0] * k, a[1] * k];
export const len = (a: V) => Math.hypot(a[0], a[1]);
export const rot = (a: V, ang: number): V => [a[0] * Math.cos(ang) - a[1] * Math.sin(ang), a[0] * Math.sin(ang) + a[1] * Math.cos(ang)];
export const rotAbout = (p: V, c: V, ang: number): V => add(c, rot(sub(p, c), ang));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smooth = (e0: number, e1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};
export const frac = (x: number) => x - Math.floor(x);
export const TAU = Math.PI * 2;

// Closed Catmull-Rom spline through points (already in screen space).
export const closedPath = (pts: V[], k = 1 / 6) => {
  const n = pts.length;
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    const c1: V = [p1[0] + (p2[0] - p0[0]) * k, p1[1] + (p2[1] - p0[1]) * k];
    const c2: V = [p2[0] - (p3[0] - p1[0]) * k, p2[1] - (p3[1] - p1[1]) * k];
    d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d + 'Z';
};

// Open spline used for strokes (tails, manes).
export const openPath = (pts: V[], k = 1 / 6) => {
  const n = pts.length;
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < n - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(n - 1, i + 2)];
    const c1: V = [p1[0] + (p2[0] - p0[0]) * k, p1[1] + (p2[1] - p0[1]) * k];
    const c2: V = [p2[0] - (p3[0] - p1[0]) * k, p2[1] - (p3[1] - p1[1]) * k];
    d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d;
};

// A tapered limb segment from a (width wa) to b (width wb) with round ends, as a closed outline.
export const capsule = (a: V, b: V, wa: number, wb: number) => {
  const dir = sub(b, a), l = len(dir) || 1e-6;
  const n: V = [-dir[1] / l, dir[0] / l];
  const ra = wa / 2, rb = wb / 2;
  const p1 = add(a, mul(n, ra)), p2 = add(b, mul(n, rb)), p3 = sub(b, mul(n, rb)), p4 = sub(a, mul(n, ra));
  const f = (v: V) => `${v[0].toFixed(1)},${v[1].toFixed(1)}`;
  return `M${f(p1)} L${f(p2)} A${rb.toFixed(1)},${rb.toFixed(1)} 0 0 0 ${f(p3)} L${f(p4)} A${ra.toFixed(1)},${ra.toFixed(1)} 0 0 0 ${f(p1)}Z`;
};

// A tapered strip along a polyline (tails, trunks), widths per point.
export const strip = (pts: V[], ws: number[]) => {
  const L: V[] = [], R: V[] = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    const d = sub(b, a), l = len(d) || 1e-6;
    const n: V = [-d[1] / l, d[0] / l];
    L.push(add(pts[i], mul(n, ws[i] / 2)));
    R.push(sub(pts[i], mul(n, ws[i] / 2)));
  }
  return closedPath([...L, ...R.reverse()]);
};

// Two-bone IK. bend=+1 puts the joint on the counter-clockwise side of pivot->target.
export const ik = (p: V, t: V, a: number, b: number, bend: number) => {
  const d0 = sub(t, p);
  let d = len(d0);
  const base = Math.atan2(d0[1], d0[0]);
  d = Math.min(Math.max(d, Math.abs(a - b) + 1e-4), a + b - 1e-4);
  const cosA = (a * a + d * d - b * b) / (2 * a * d);
  const al = Math.acos(Math.min(1, Math.max(-1, cosA)));
  const j: V = add(p, [Math.cos(base + bend * al) * a, Math.sin(base + bend * al) * a]);
  const end: V = add(p, [Math.cos(base) * d, Math.sin(base) * d]);
  return {j, end};
};
