// Path helpers for vehicles, drawn in metres (y up, x forward). Points are [x, y] (smooth) or [x, y, 0] (sharp corner).
export type P = [number, number] | [number, number, number];

const f = (n: number) => n.toFixed(3);

// Catmull-Rom spline through the points; a sharp point keeps both its handles at the point.
const spline = (pts: P[], closed: boolean, k = 1 / 6) => {
  const n = pts.length;
  const at = (i: number) => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
  const sharp = (p: P) => p.length === 3;
  let d = `M${f(pts[0][0])},${f(pts[0][1])}`;
  const segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
    const c1 = sharp(p1) ? [p1[0], p1[1]] : [p1[0] + (p2[0] - p0[0]) * k, p1[1] + (p2[1] - p0[1]) * k];
    const c2 = sharp(p2) ? [p2[0], p2[1]] : [p2[0] - (p3[0] - p1[0]) * k, p2[1] - (p3[1] - p1[1]) * k];
    d += ` C${f(c1[0])},${f(c1[1])} ${f(c2[0])},${f(c2[1])} ${f(p2[0])},${f(p2[1])}`;
  }
  return closed ? d + 'Z' : d;
};
export const shape = (pts: P[], k?: number) => spline(pts, true, k);
export const line = (pts: P[], k?: number) => spline(pts, false, k);
export const poly = (pts: [number, number][]) => 'M' + pts.map((p) => `${f(p[0])},${f(p[1])}`).join(' L') + 'Z';
export const rect = (x0: number, y0: number, x1: number, y1: number, r = 0) => r <= 0
  ? poly([[x0, y0], [x1, y0], [x1, y1], [x0, y1]])
  : `M${f(x0 + r)},${f(y0)} L${f(x1 - r)},${f(y0)} Q${f(x1)},${f(y0)} ${f(x1)},${f(y0 + r)} L${f(x1)},${f(y1 - r)} Q${f(x1)},${f(y1)} ${f(x1 - r)},${f(y1)} L${f(x0 + r)},${f(y1)} Q${f(x0)},${f(y1)} ${f(x0)},${f(y1 - r)} L${f(x0)},${f(y0 + r)} Q${f(x0)},${f(y0)} ${f(x0 + r)},${f(y0)}Z`;
export const circle = (cx: number, cy: number, r: number) => `M${f(cx - r)},${f(cy)} a${f(r)},${f(r)} 0 1,0 ${f(2 * r)},0 a${f(r)},${f(r)} 0 1,0 ${f(-2 * r)},0Z`;
export const ellipse = (cx: number, cy: number, rx: number, ry: number) => `M${f(cx - rx)},${f(cy)} a${f(rx)},${f(ry)} 0 1,0 ${f(2 * rx)},0 a${f(rx)},${f(ry)} 0 1,0 ${f(-2 * rx)},0Z`;
// a solid band between two curves (outer forward, inner backward), e.g. a fender
export const band = (outer: P[], inner: P[]) => {
  const o = line(outer), i = line([...inner].reverse());
  return o + ' L' + i.slice(1) + 'Z';
};
