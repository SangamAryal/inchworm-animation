import {V, add, ik, lerp, rot, rotAbout, smooth, sub, frac, TAU} from './geom';

// All rig coordinates are metres, y up, origin on the ground under the body centre, facing +x.

export type Limb = {
  side: 'near' | 'far';
  attach: 'front' | 'rear';
  pivot: V; // top joint (elbow / stifle / hip / shoulder) in torso coords
  a: number; b: number; // upper and lower segment lengths
  wa: [number, number]; wb: [number, number]; // widths at the ends of each segment
  bend: 1 | -1; // which way the middle joint bulges (+1 forward, -1 back)
  foot: 'hoof' | 'paw' | 'shoe' | 'pad' | 'hand';
  footH: number; footL: number; footW: number;
  phase: number; // when the stance starts, in stride cycles
  reach: number; // stance centre, x relative to the pivot
  sweep: number; // how far the foot travels backward while planted
  lift: number; // swing height
  curl: number; // foot rotation during swing (rad)
  fwd0?: number; // fraction of the swing spent folding before the foot moves forward
  liftAt?: number; // where in the swing the foot is highest (0..1)
  swing?: {base: number; amp: number; elbow: number; elbowAmp: number}; // arms: driven by angles, not feet
  color?: string;
};

export type Shape = {
  frame: 'torso' | 'head';
  pts: V[];
  fill: string;
  opacity?: number;
  clip?: boolean; // clip to the part it is attached to
  open?: boolean; stroke?: number; // open stroke instead of fill
  layer?: 'under' | 'over'; // drawn before or after the near limbs
  soft?: boolean; // blurred edge
};

export type Spec = {
  stride: number; // strides per second at top speed
  duty: number; // fraction of the stride a foot is planted
  torso: V[];
  flex: {amp: number; phase: number; x: number; y: number};
  bob: {amp: number; phase: number};
  pitch: {amp: number; phase: number; base?: number};
  head: {pivot: V; outline: V[]; nod: number; nodPhase: number; base?: number; eye?: V; eyeR?: number};
  tail?: {root: V; pts: V[]; ws: number[]; wave: number; phase: number; frame?: 'torso'};
  trunk?: {root: V; pts: V[]; ws: number[]; wave: number; phase: number};
  limbs: Limb[];
  shapes?: Shape[];
  colors: {top: string; mid: string; bottom: string; far: string; rim: string; limb?: string; limbFar?: string};
  height: number; // overall height in metres, for gradients
};

export type Pose = {
  torso: V[];
  head: V[];
  headMap: (p: V) => V;
  torsoMap: (p: V) => V;
  limbs: {limb: Limb; pivot: V; joint: V; ankle: V; toe: V; footAng: number; planted: boolean}[];
  tail?: V[];
  trunk?: V[];
};

const ease = (u: number) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);

export const solve = (S: Spec, t: number): Pose => {
  const p = frac(t * S.stride);
  const bob = S.bob.amp * Math.cos(TAU * (p - S.bob.phase));
  const pitch = (S.pitch.base ?? 0) + S.pitch.amp * Math.sin(TAU * (p - S.pitch.phase));
  const phi = S.flex.amp * Math.cos(TAU * (p - S.flex.phase));
  const fc: V = [S.flex.x, S.flex.y];
  const torsoMap = (q: V): V => {
    const w = smooth(S.flex.x - 0.25, S.flex.x + 0.25, q[0]);
    const flexed = rotAbout(q, fc, phi * (0.5 - w));
    const pitched = rotAbout(flexed, fc, pitch);
    return [pitched[0], pitched[1] + bob];
  };
  const nod = (S.head.base ?? 0) + S.head.nod * Math.sin(TAU * (p - S.head.nodPhase));
  const hp = torsoMap(S.head.pivot);
  const frontAng = pitch - phi * 0.5; // rotation of the front of the body
  const headMap = (q: V): V => add(hp, rot(sub(q, S.head.pivot), frontAng + nod));

  const limbs = S.limbs.map((L) => {
    const piv = torsoMap(L.pivot);
    if (L.swing) {
      const sw = L.swing;
      const ang = sw.base + sw.amp * Math.sin(TAU * (p - L.phase)) + frontAng;
      const joint = add(piv, rot([0, -L.a], ang));
      const elb = sw.elbow + sw.elbowAmp * Math.sin(TAU * (p - L.phase) + 0.6);
      const ankle = add(joint, rot([0, -L.b], ang + elb));
      const toe = add(ankle, rot([0, -L.footL], ang + elb));
      return {limb: L, pivot: piv, joint, ankle, toe, footAng: ang + elb, planted: false};
    }
    const q = frac(p - L.phase);
    const cx = L.pivot[0] + L.reach;
    let gx: number, gy: number, fa: number, planted: boolean;
    if (q < S.duty) {
      const u = q / S.duty;
      gx = cx + L.sweep / 2 - u * L.sweep; gy = 0; planted = true;
      fa = -0.35 * smooth(0.6, 1, u); // heel lifts / hoof rolls at the end of stance
    } else {
      const u = (q - S.duty) / (1 - S.duty);
      const f0 = L.fwd0 ?? 0, la = L.liftAt ?? 0.45;
      gx = cx - L.sweep / 2 + L.sweep * ease(Math.min(1, Math.max(0, (u - f0) / (1 - f0))));
      const uu = u < la ? 0.5 * (u / la) : 0.5 + 0.5 * ((u - la) / (1 - la));
      gy = L.lift * Math.pow(Math.sin(Math.PI * uu), 1.1);
      fa = -0.35 + (-L.curl + 0.35) * Math.sin(Math.PI * Math.min(1, u * 1.15));
      planted = false;
    }
    const ground: V = [gx, gy];
    // ankle sits above the contact point; the foot rotates about the contact point
    const ankle0 = add(ground, rot([-L.footL * 0.15, L.footH], fa));
    const {j, end} = ik(piv, ankle0, L.a, L.b, L.bend);
    const toe = add(end, rot([L.footL * 0.85, -L.footH], fa));
    return {limb: L, pivot: piv, joint: j, ankle: end, toe, footAng: fa, planted};
  });

  const tail = S.tail && S.tail.pts.map((q, i) => {
    const k = i / (S.tail!.pts.length - 1);
    const w = S.tail!.wave * k * Math.sin(TAU * (p - S.tail!.phase) - k * 2.2);
    return torsoMap(add(rotAbout(q, S.tail!.root, w), [0, 0]));
  });
  const trunk = S.trunk && S.trunk.pts.map((q, i) => {
    const k = i / (S.trunk!.pts.length - 1);
    const w = S.trunk!.wave * k * Math.sin(TAU * (p - S.trunk!.phase) - k * 1.5);
    return headMap(rotAbout(q, S.trunk!.root, w));
  });

  return {torso: S.torso.map(torsoMap), head: S.head.outline.map(headMap), headMap, torsoMap, limbs, tail, trunk};
};

// When each foot touches down, for the sound track: times in seconds within [t0, t1).
export const footfalls = (S: Spec, t0: number, t1: number) => {
  const out: {t: number; limb: Limb}[] = [];
  for (const L of S.limbs) {
    if (L.swing) continue;
    const k0 = Math.floor(t0 * S.stride - L.phase) - 1;
    for (let k = k0; ; k++) {
      const t = (k + L.phase) / S.stride;
      if (t >= t1) break;
      if (t >= t0) out.push({t, limb: L});
    }
  }
  return out.sort((a, b) => a.t - b.t);
};

export const mirrorLerp = lerp;
