import {V} from './geom';
import {Shape, Spec} from './rig';

// Scale a whole rig (all lengths in metres) by kx along the body and ky in height.
export const scaleSpec = (S: Spec, kx: number, ky = kx): Spec => {
  const p = (q: V): V => [q[0] * kx, q[1] * ky];
  const k = Math.sqrt(kx * ky);
  const sh = (s: Shape): Shape => ({...s, pts: s.pts.map(p), stroke: s.stroke === undefined ? undefined : s.stroke * k});
  return {
    ...S,
    height: S.height * ky,
    torso: S.torso.map(p),
    flex: {...S.flex, x: S.flex.x * kx, y: S.flex.y * ky},
    bob: {...S.bob, amp: S.bob.amp * ky},
    head: {...S.head, pivot: p(S.head.pivot), outline: S.head.outline.map(p), eye: S.head.eye && p(S.head.eye), eyeR: S.head.eyeR && S.head.eyeR * k},
    tail: S.tail && {...S.tail, root: p(S.tail.root), pts: S.tail.pts.map(p), ws: S.tail.ws.map((w) => w * k)},
    limbs: S.limbs.map((L) => ({
      ...L, pivot: p(L.pivot), a: L.a * ky, b: L.b * ky, wa: [L.wa[0] * k, L.wa[1] * k], wb: [L.wb[0] * k, L.wb[1] * k],
      footH: L.footH * ky, footL: L.footL * kx, footW: L.footW * kx, reach: L.reach * kx, sweep: L.sweep * kx, lift: L.lift * ky,
    })),
    shapes: S.shapes?.map(sh),
    fur: S.fur && {...S.fur, len: S.fur.len * k, rough: S.fur.rough * k},
  };
};
