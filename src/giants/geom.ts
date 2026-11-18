// Geometry helpers for the Short 06 animals. Shapes are written in metres with y going up;
// the path builders flip y for SVG, so a parent <g> only needs translate + scale(px per metre).
export type Pt = [number, number];

const f = (n: number) => +n.toFixed(4);

// Catmull-Rom through the points, as cubic Beziers (closed or open).
export const smooth = (pts: Pt[], closed = true, k = 1): string => {
  const n = pts.length;
  if (n < 2) return '';
  const at = (i: number): Pt => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
  let d = `M${f(pts[0][0])},${f(-pts[0][1])}`;
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
    const c1: Pt = [p1[0] + ((p2[0] - p0[0]) / 6) * k, p1[1] + ((p2[1] - p0[1]) / 6) * k];
    const c2: Pt = [p2[0] - ((p3[0] - p1[0]) / 6) * k, p2[1] - ((p3[1] - p1[1]) / 6) * k];
    d += ` C${f(c1[0])},${f(-c1[1])} ${f(c2[0])},${f(-c2[1])} ${f(p2[0])},${f(-p2[1])}`;
  }
  return d + (closed ? 'Z' : '');
};

// straight segments
export const poly = (pts: Pt[], closed = true) => 'M' + pts.map(([x, y]) => `${f(x)},${f(-y)}`).join(' L') + (closed ? 'Z' : '');

// scale a shape written in fractions of the body length
export const sc = (pts: Pt[], L: number): Pt[] => pts.map(([x, y]) => [x * L, y * L]);

// y of a polyline (sorted by x) at x
export const yAt = (pts: Pt[], x: number) => {
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[i + 1];
    if ((x >= x0 && x <= x1) || (x <= x0 && x >= x1)) return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0 || 1);
  }
  return pts[pts.length - 1][1];
};

// rotate points about a pivot (degrees, counter-clockwise in y-up space)
export const rotAbout = (pts: Pt[], [px, py]: Pt, deg: number): Pt[] => {
  const a = (deg * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a);
  return pts.map(([x, y]) => [px + (x - px) * c - (y - py) * s, py + (x - px) * s + (y - py) * c]);
};

export const mapPts = (pts: Pt[], fn: (p: Pt) => Pt) => pts.map(fn);

// a tube along a centreline with widths, as a closed outline (top edge then bottom edge back)
export const tube = (c: Pt[], w: number[]): Pt[] => {
  const top: Pt[] = [], bot: Pt[] = [];
  for (let i = 0; i < c.length; i++) {
    const a = c[Math.max(0, i - 1)], b = c[Math.min(c.length - 1, i + 1)];
    let nx = -(b[1] - a[1]), ny = b[0] - a[0];
    const l = Math.hypot(nx, ny) || 1;
    nx /= l; ny /= l;
    top.push([c[i][0] + (nx * w[i]) / 2, c[i][1] + (ny * w[i]) / 2]);
    bot.push([c[i][0] - (nx * w[i]) / 2, c[i][1] - (ny * w[i]) / 2]);
  }
  return [...top, ...bot.reverse()];
};
