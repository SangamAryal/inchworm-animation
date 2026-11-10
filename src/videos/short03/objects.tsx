import React from 'react';
import {rng} from '../../engine/noise';

// Every object is drawn in metres with its base centre at (0, 0) and y going up
// (P() flips y for SVG). The low sun is on the left, so left faces are lit and
// right faces fall into violet shade, matching the Dusk horizon look.

type Pt = [number, number];
const P = (pts: Pt[], close = true) => 'M' + pts.map(([x, y]) => `${+x.toFixed(3)},${+(-y).toFixed(3)}`).join(' L') + (close ? 'Z' : '');
const mirror = (pts: Pt[]): Pt[] => [...pts, ...pts.slice().reverse().map(([x, y]) => [-x, y] as Pt)];
const R = (x0: number, y0: number, x1: number, y1: number) => P([[x0, y0], [x1, y0], [x1, y1], [x0, y1]]);

const H = (id: string, stops: [number, string][], vertical = false) => (
  <linearGradient id={id} x1="0" y1="0" x2={vertical ? 0 : 1} y2={vertical ? 1 : 0}>
    {stops.map(([o, c], i) => <stop key={i} offset={o} stopColor={c} />)}
  </linearGradient>
);

export const TallDefs: React.FC = () => (
  <defs>
    {H('mSkin', [[0, '#F2C6A0'], [0.5, '#C98E6E'], [1, '#6E4A4A']])}
    {H('mHair', [[0, '#6A4636'], [1, '#1E1418']])}
    {H('mJacket', [[0, '#C9876A'], [0.45, '#8C4E45'], [1, '#3A2230']])}
    {H('mJeans', [[0, '#7C8FB0'], [0.5, '#4B5B7D'], [1, '#232840']])}
    {H('mShoe', [[0, '#E8DCCF'], [1, '#6B6068']])}
    {H('mGir', [[0, '#F4D3A0'], [0.5, '#D9A86E'], [1, '#7A5448']])}
    {H('mGirLeg', [[0, '#F0D0A4'], [1, '#8A6656']])}
    {H('mSoap', [[0, '#FBE6D0'], [0.45, '#CFC3BC'], [1, '#6D6474']])}
    {H('mSoapPed', [[0, '#E9CDB4'], [0.5, '#A79A98'], [1, '#4E4652']])}
    {H('mCopper', [[0, '#B7DCC4'], [0.4, '#73A894'], [1, '#2B4A4C']])}
    {H('mGranite', [[0, '#E8C3A4'], [0.5, '#A08A86'], [1, '#463C48']])}
    {H('mFort', [[0, '#C9A68E'], [1, '#4A3E46']])}
    {H('mBark', [[0, '#D88A62'], [0.4, '#9A5440'], [1, '#3E2228']])}
    {H('mLeafA', [[0, '#8FA266'], [0.5, '#4F6A46'], [1, '#22302C']])}
    {H('mLeafB', [[0, '#6E8656'], [1, '#1C2826']])}
    {H('mSandL', [[0, '#F6CF9E'], [1, '#D9A47A']])}
    {H('mSandR', [[0, '#8A6266'], [1, '#55404E']])}
    {H('mIron', [[0, '#C98A66'], [0.5, '#6E4A40'], [1, '#2C1E26']])}
    {H('mLime', [[0, '#F2D6BA'], [0.6, '#BFA9A0'], [1, '#8C7A80']])}
    {H('mLimeSide', [[0, '#6E5E6C'], [1, '#3E3446']])}
    {H('mGlass', [[0, '#F8D6B6'], [0.35, '#C7A3A6'], [0.7, '#7C7A9A'], [1, '#3C3A58']])}
    {H('mGlassSide', [[0, '#4C4868'], [1, '#2A2840']])}
    {H('mRock', [[0, '#9C8290'], [0.5, '#6A5468'], [1, '#3C3048']])}
    {H('mRockShade', [[0, '#4A3C56'], [1, '#2A2236']])}
    {H('mSnow', [[0, '#FFF1E2'], [0.6, '#F2D6CC'], [1, '#C7B4C4']])}
    {H('mSnowShade', [[0, '#9E9AB8'], [1, '#6E6A8E']])}
    {H('mAO', [[0, '#000000'], [1, '#000000']], true)}
    <linearGradient id="mFade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#140F16" stopOpacity="0" />
      <stop offset="1" stopColor="#140F16" stopOpacity="0.45" />
    </linearGradient>
    <linearGradient id="mHaze" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#E9B9A0" stopOpacity="0" />
      <stop offset="1" stopColor="#E9B9A0" stopOpacity="0.32" />
    </linearGradient>
    <pattern id="mLattice" patternUnits="userSpaceOnUse" width="7" height="7">
      <path d="M0,0 L7,7 M7,0 L0,7 M0,0 L7,0" stroke="#2C1E26" strokeWidth="0.55" fill="none" />
    </pattern>
    <pattern id="mLatticeLit" patternUnits="userSpaceOnUse" width="7" height="7">
      <path d="M0,0 L7,7 M7,0 L0,7 M0,0 L7,0" stroke="#D9946C" strokeWidth="0.45" fill="none" />
    </pattern>
  </defs>
);

// ---------------------------------------------------------------- person, seen from behind, looking up
const Person: React.FC = () => (
  <g>
    <path d={P([[-0.16, 0.05], [-0.03, 0.05], [-0.02, 0.9], [-0.19, 0.92]])} fill="url(#mJeans)" />
    <path d={P([[0.03, 0.05], [0.16, 0.05], [0.19, 0.92], [0.02, 0.9]])} fill="url(#mJeans)" />
    <path d={P([[-0.18, 0], [-0.02, 0], [-0.02, 0.07], [-0.16, 0.08]])} fill="url(#mShoe)" />
    <path d={P([[0.02, 0], [0.18, 0], [0.16, 0.08], [0.02, 0.07]])} fill="url(#mShoe)" />
    {/* jacket */}
    <path d={P([[-0.21, 0.82], [0.21, 0.82], [0.23, 1.2], [0.22, 1.38], [0.12, 1.45], [-0.12, 1.45], [-0.22, 1.38], [-0.23, 1.2]])} fill="url(#mJacket)" />
    <path d={P([[-0.22, 1.38], [-0.27, 1.3], [-0.29, 1.02], [-0.27, 0.82], [-0.22, 0.82], [-0.21, 1.02], [-0.2, 1.25]])} fill="url(#mJacket)" />
    <path d={P([[0.22, 1.38], [0.27, 1.3], [0.29, 1.02], [0.27, 0.82], [0.22, 0.82], [0.21, 1.02], [0.2, 1.25]])} fill="#4A2A34" />
    <ellipse cx={-0.26} cy={-0.79} rx={0.035} ry={0.05} fill="url(#mSkin)" />
    <ellipse cx={0.26} cy={-0.79} rx={0.035} ry={0.05} fill="#7A5050" />
    <path d={P([[0, 1.45], [0, 0.85]], false)} stroke="#3A2230" strokeWidth={0.008} opacity={0.6} />
    <path d={P([[-0.2, 0.9], [0.2, 0.9]], false)} stroke="#2A1824" strokeWidth={0.02} opacity={0.5} />
    {/* neck and head, tilted back a little to look up */}
    <path d={P([[-0.05, 1.42], [0.05, 1.42], [0.05, 1.5], [-0.05, 1.5]])} fill="url(#mSkin)" />
    <ellipse cx={0} cy={-1.59} rx={0.095} ry={0.115} fill="url(#mSkin)" />
    <path d={P([[-0.1, 1.55], [-0.09, 1.66], [-0.04, 1.71], [0.04, 1.71], [0.09, 1.66], [0.1, 1.55], [0.07, 1.5], [-0.07, 1.5]])} fill="url(#mHair)" />
    <ellipse cx={-0.097} cy={-1.58} rx={0.014} ry={0.03} fill="#D9A182" />
  </g>
);

// ---------------------------------------------------------------- giraffe, side view facing right
const GIR_BODY: Pt[] = [[-1.05, 2.85], [-0.95, 3.02], [-0.5, 3.12], [0.15, 3.3], [0.55, 3.46], [0.85, 3.42], [1.05, 3.05], [1.05, 2.7], [0.9, 2.3], [0.65, 2.08], [0.0, 2.02], [-0.6, 2.08], [-0.95, 2.35]];
const GIR_NECK: Pt[] = [[0.45, 3.4], [1.36, 5.0], [1.62, 5.16], [1.85, 4.98], [1.75, 4.78], [1.1, 2.85], [0.9, 2.55]];
const GIR_HEAD: Pt[] = [[1.42, 5.0], [1.5, 5.2], [1.66, 5.3], [1.86, 5.24], [2.18, 5.08], [2.34, 4.94], [2.33, 4.84], [2.2, 4.8], [1.9, 4.84], [1.62, 4.84]];
const girLeg = (x: number, top: number, w: number, fill: string) => (
  <path d={P([[x - w * 0.6, top], [x + w * 0.6, top], [x + w * 0.45, 1.2], [x + w * 0.55, 1.05], [x + w * 0.35, 0.12], [x + w * 0.5, 0], [x - w * 0.5, 0], [x - w * 0.35, 0.12], [x - w * 0.5, 1.05], [x - w * 0.4, 1.2]])} fill={fill} />
);
const Giraffe: React.FC<{id: string}> = ({id}) => {
  const Rn = rng(41);
  const patches: React.ReactNode[] = [];
  for (let gy = 1.95; gy < 5.4; gy += 0.3) for (let gx = -1.2; gx < 2.4; gx += 0.3) {
    const cx = gx + (Rn() - 0.5) * 0.08 + ((gy * 10) % 2 ? 0.15 : 0), cy = gy + (Rn() - 0.5) * 0.08;
    const pts: Pt[] = Array.from({length: 6}, (_, i) => {
      const a = (i / 6) * Math.PI * 2 + Rn() * 0.5, rr = 0.11 + Rn() * 0.03;
      return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.95];
    });
    patches.push(<path key={patches.length} d={P(pts)} fill="#8A4A2C" opacity={0.9} />);
  }
  return (
    <g>
      <clipPath id={`gc${id}`}><path d={P(GIR_BODY) + P(GIR_NECK) + P(GIR_HEAD)} /></clipPath>
      {/* far legs */}
      {girLeg(-0.8, 2.4, 0.22, '#8A6656')}
      {girLeg(0.56, 2.3, 0.21, '#8A6656')}
      {/* tail */}
      <path d={P([[-1.02, 2.9], [-1.14, 2.4], [-1.18, 1.85]], false)} stroke="#7A5448" strokeWidth={0.05} fill="none" />
      <ellipse cx={-1.18} cy={-1.78} rx={0.06} ry={0.16} fill="#2A1A1A" />
      <path d={P(GIR_BODY)} fill="url(#mGir)" />
      <path d={P(GIR_NECK)} fill="url(#mGir)" />
      <path d={P(GIR_HEAD)} fill="url(#mGir)" />
      <g clipPath={`url(#gc${id})`}>
        {patches}
        <path d={P([[-1.2, 1.9], [2.4, 1.9], [2.4, 2.5], [-1.2, 2.5]])} fill="#2A1820" opacity={0.25} />
        <path d={P([[0.9, 2.2], [2.4, 4.6], [2.4, 1.9]])} fill="#2A1820" opacity={0.2} />
        <path d={P([[1.5, 5.3], [2.4, 5.3], [2.4, 4.7], [1.95, 4.75]])} fill="#F2D2A6" opacity={0.6} />
      </g>
      {/* mane */}
      <path d={P([[0.4, 3.42], [1.32, 5.02], [1.36, 4.98], [0.52, 3.38]])} fill="#5A2E22" />
      {/* near legs */}
      {girLeg(-0.62, 2.45, 0.23, 'url(#mGirLeg)')}
      {girLeg(0.76, 2.35, 0.22, 'url(#mGirLeg)')}
      {[-0.62, 0.76].map((x) => <path key={x} d={R(x - 0.09, 0, x + 0.09, 0.08)} fill="#2A1A1A" />)}
      {/* ossicones, ear, eye, muzzle */}
      <path d={P([[1.58, 5.26], [1.54, 5.44]], false)} stroke="#7A5448" strokeWidth={0.05} />
      <path d={P([[1.68, 5.28], [1.66, 5.46]], false)} stroke="#9A6E58" strokeWidth={0.05} />
      <circle cx={1.54} cy={-5.46} r={0.04} fill="#2A1A1A" />
      <circle cx={1.66} cy={-5.48} r={0.04} fill="#2A1A1A" />
      <path d={P([[1.5, 5.18], [1.32, 5.28], [1.46, 5.12]])} fill="#C99A6E" />
      <circle cx={1.8} cy={-5.12} r={0.035} fill="#1A1014" />
      <path d={P([[2.18, 4.98], [2.3, 4.92]], false)} stroke="#3A2228" strokeWidth={0.02} />
    </g>
  );
};

// ---------------------------------------------------------------- Christ the Redeemer: 8 m pedestal, 30 m statue, 28 m arm span
const Christ: React.FC = () => (
  <g>
    <path d={R(-5, 0, 5, 7)} fill="url(#mSoapPed)" />
    <path d={R(-5.6, 7, 5.6, 8)} fill="url(#mSoapPed)" />
    <path d={R(-5, 2.6, 5, 3)} fill="#3E3644" opacity={0.35} />
    {/* robe */}
    <path d={P([[-2.2, 8], [2.2, 8], [2.7, 14], [3.2, 22], [3.4, 27], [3.7, 29.6], [-3.7, 29.6], [-3.4, 27], [-3.2, 22], [-2.7, 14]])} fill="url(#mSoap)" />
    {/* arms and hanging sleeves */}
    <path d={P([[-14, 29.4], [-14, 31], [-3.5, 31.6], [3.5, 31.6], [14, 31], [14, 29.4], [12.8, 29.2], [8, 28.6], [6.5, 26.6], [4.6, 25.6], [3.6, 26], [-3.6, 26], [-4.6, 25.6], [-6.5, 26.6], [-8, 28.6], [-12.8, 29.2]])} fill="url(#mSoap)" />
    <path d={P([[-14, 29.4], [-14.6, 29.9], [-14.6, 30.6], [-14, 31]])} fill="#F2DCC6" />
    <path d={P([[14, 29.4], [14.6, 29.9], [14.6, 30.6], [14, 31]])} fill="#8A8090" />
    {/* folds */}
    {[-1.6, -0.5, 0.6, 1.7].map((x, i) => <path key={i} d={P([[x * 0.8, 8.2], [x * 1.1, 18], [x * 1.25, 26]], false)} stroke="#5E5666" strokeWidth={0.18} opacity={0.35} fill="none" />)}
    <path d={P([[-3.5, 29.4], [0, 27.6], [3.5, 29.4]], false)} stroke="#5E5666" strokeWidth={0.2} opacity={0.35} fill="none" />
    {/* neck, head and hair */}
    <path d={R(-0.9, 31.4, 0.9, 32.6)} fill="url(#mSoap)" />
    <ellipse cx={0} cy={-34.6} rx={1.45} ry={2.0} fill="url(#mSoap)" />
    <path d={P([[-1.5, 34.6], [-1.35, 36.0], [-0.6, 36.7], [0.6, 36.7], [1.35, 36.0], [1.5, 34.6], [1.2, 35.6], [0, 36.1], [-1.2, 35.6]])} fill="#B8ACAA" />
    <path d={P([[-1.0, 33.6], [-0.4, 32.7], [0.4, 32.7], [1.0, 33.6], [0.6, 33.2], [-0.6, 33.2]])} fill="#8E8490" opacity={0.6} />
  </g>
);

// ---------------------------------------------------------------- Statue of Liberty on its pedestal and Fort Wood
const Liberty: React.FC = () => (
  <g>
    {/* star fort walls, seen from the side */}
    <path d={P([[-34, 0], [34, 0], [33, 6.5], [22, 7.5], [-22, 7.5], [-33, 6.5]])} fill="url(#mFort)" />
    <path d={R(-34, 6.2, 34, 6.8)} fill="#2A2230" opacity={0.3} />
    {/* foundation and pedestal */}
    <path d={P([[-14, 7.5], [14, 7.5], [13, 20], [-13, 20]])} fill="url(#mGranite)" />
    <path d={P([[-10.5, 20], [10.5, 20], [9.6, 34], [10.4, 35], [10.4, 37], [9, 38], [9, 44], [9.8, 45], [9.8, 47], [-9.8, 47], [-9.8, 45], [-9, 44], [-9, 38], [-10.4, 37], [-10.4, 35], [-9.6, 34]])} fill="url(#mGranite)" />
    {[-5.5, -2, 2, 5.5].map((x) => <path key={x} d={R(x - 1, 22, x + 1, 32.5)} fill="#3A3040" opacity={0.35} />)}
    {[-5.5, -2, 2, 5.5].map((x) => <path key={'c' + x} d={R(x - 0.9, 38.5, x + 0.9, 43.5)} fill="#3A3040" opacity={0.3} />)}
    {/* robe */}
    <path d={P([[-6, 47], [6, 47], [5.4, 52], [5.6, 60], [5.2, 68], [4.6, 74], [4.4, 78.5], [2.6, 80.5], [-2.8, 80.5], [-4.6, 78.6], [-4.8, 74], [-5.4, 66], [-5.8, 56]])} fill="url(#mCopper)" />
    {[-3.6, -1.6, 0.4, 2.4, 4].map((x, i) => <path key={i} d={P([[x, 47.4], [x * 0.95 + 0.3, 60], [x * 0.85, 76]], false)} stroke="#1E3436" strokeWidth={0.3} opacity={0.45} fill="none" />)}
    <path d={P([[-5.4, 66], [1.5, 70], [4.6, 74]], false)} stroke="#1E3436" strokeWidth={0.35} opacity={0.4} fill="none" />
    {/* tablet held by the left arm (viewer's right) */}
    <path d={P([[3.6, 63], [7.0, 64.4], [6.0, 72.4], [2.6, 71.0]])} fill="url(#mCopper)" />
    <path d={P([[3.6, 63], [7.0, 64.4], [6.0, 72.4], [2.6, 71.0]])} fill="none" stroke="#1E3436" strokeWidth={0.25} opacity={0.6} />
    {/* raised right arm (viewer's left) and torch */}
    <path d={P([[-4.6, 78.6], [-3.0, 79.6], [-3.7, 84], [-4.2, 88.2], [-5.3, 88.2], [-5.4, 84], [-5.6, 80]])} fill="url(#mCopper)" />
    <path d={P([[-5.5, 88], [-4.0, 88], [-4.1, 89.4], [-5.4, 89.4]])} fill="url(#mCopper)" />
    <path d={P([[-6.0, 89.4], [-3.5, 89.4], [-3.7, 90.4], [-5.8, 90.4]])} fill="#C9A060" />
    <path d={P([[-5.6, 90.4], [-3.9, 90.4], [-4.0, 91.6], [-4.75, 93.0], [-5.5, 91.6]])} fill="#F6C46A" />
    <path d={P([[-5.1, 90.6], [-4.4, 90.6], [-4.75, 92.3]])} fill="#FFF0C8" />
    {/* head and crown */}
    <path d={R(-1.1, 80.2, 1.1, 81.6)} fill="url(#mCopper)" />
    <ellipse cx={-0.1} cy={-83.2} rx={1.55} ry={2.2} fill="url(#mCopper)" />
    <path d={P([[-1.8, 84.2], [1.6, 84.2], [1.5, 85.2], [-1.7, 85.2]])} fill="#5F9583" />
    {[-60, -35, -12, 12, 35, 60, 82, -82].map((a, i) => {
      const r = (a * Math.PI) / 180, bx = -0.1 + Math.sin(r) * 1.4, by = 85;
      const tx = bx + Math.sin(r) * 2.4, ty = by + Math.cos(r) * 2.4;
      return <path key={i} d={P([[bx - 0.25, by], [bx + 0.25, by], [tx, ty]])} fill={a < 0 ? '#9CCBB4' : '#4F7E70'} />;
    })}
  </g>
);

// ---------------------------------------------------------------- Hyperion, a coast redwood
const Hyperion: React.FC = () => {
  const Rn = rng(77);
  const clumps: React.ReactNode[] = [];
  for (let y = 28; y < 114; y += 3.2) {
    const u = (y - 28) / 86; // 0 at the bottom of the crown, 1 at the top
    const w = 10.5 * Math.sin(Math.PI * Math.min(1, 0.25 + u * 0.85)) * (1 - u * 0.55) + 1.5;
    const n = 2 + Math.round(w / 3);
    for (let i = 0; i < n; i++) {
      const side = i % 2 ? 1 : -1;
      const x = side * (0.6 + Rn() * w);
      const rx = 2.2 + Rn() * 2.4, ry = 1.4 + Rn() * 1.4;
      clumps.push(<ellipse key={clumps.length} cx={x} cy={-(y + (Rn() - 0.5) * 2)} rx={rx} ry={ry} fill={x < 0 ? 'url(#mLeafA)' : 'url(#mLeafB)'} opacity={0.96} />);
    }
  }
  return (
    <g>
      <path d={P([[-3.8, 0], [3.8, 0], [2.4, 3], [1.9, 20], [1.3, 60], [0.7, 100], [0.3, 116], [-0.3, 116], [-0.7, 100], [-1.3, 60], [-1.9, 20], [-2.4, 3]])} fill="url(#mBark)" />
      {[-1.2, -0.3, 0.7].map((x, i) => <path key={i} d={P([[x * 1.6, 0.5], [x * 1.1, 20], [x * 0.6, 60]], false)} stroke="#2E1A20" strokeWidth={0.22} opacity={0.5} fill="none" />)}
      {/* a few bare branch stubs low on the trunk */}
      <path d={P([[-1.6, 30], [-5, 33]], false)} stroke="#5A3030" strokeWidth={0.5} />
      <path d={P([[1.5, 36], [5.5, 39]], false)} stroke="#4A2830" strokeWidth={0.5} />
      {clumps}
      <path d={P([[-0.4, 113], [0, 116], [0.4, 113]])} fill="#4F6A46" />
    </g>
  );
};

// ---------------------------------------------------------------- Great Pyramid, seen corner-on (base 230 m, now 138.5 m tall)
const Pyramid: React.FC = () => {
  const apexL: Pt = [-12, 138.5], apexR: Pt = [-2, 138.5];
  const left: Pt[] = [[-115, 0], [-28, -4], apexR, apexL];
  const right: Pt[] = [[-28, -4], [115, 0], apexR];
  const courses: React.ReactNode[] = [];
  for (let y = 4; y < 138; y += 4.2) {
    const u = y / 138.5;
    const lx0 = -115 + (-12 + 115) * u, fx = -28 + (-2 + 28) * u, rx = 115 + (-2 - 115) * u;
    const fy = -4 + 4 * u;
    courses.push(<path key={'l' + y} d={P([[lx0, y * (1 - 0.0) + 0], [fx, y + fy * (1 - u)]], false)} stroke="#B98760" strokeWidth={0.5} opacity={0.35} />);
    courses.push(<path key={'r' + y} d={P([[fx, y + fy * (1 - u)], [rx, y]], false)} stroke="#2E2434" strokeWidth={0.5} opacity={0.3} />);
  }
  return (
    <g>
      <path d={P(left)} fill="url(#mSandL)" />
      <path d={P(right)} fill="url(#mSandR)" />
      {courses}
      <path d={P([[-28, -4], [-2, 138.5]], false)} stroke="#FFE4BE" strokeWidth={0.8} opacity={0.55} />
      <path d={P([apexL, [-7, 140.5], apexR])} fill="#E8BE90" />
      {/* worn casing near the top, darker gaps along the base */}
      <path d={P([[-115, 0], [-28, -4], [115, 0], [115, 3], [-28, -1], [-115, 3]])} fill="#2A2028" opacity={0.25} />
    </g>
  );
};

// ---------------------------------------------------------------- Eiffel Tower (330 m with antennas, base 125 m)
const EIFFEL_OUT: Pt[] = [[-62, 0], [-50, 20], [-38, 45], [-34, 57], [-24, 80], [-18, 115], [-13, 150], [-9, 200], [-6, 250], [-4.5, 276], [-3.5, 282], [-2, 300], [-0.6, 312], [-0.3, 330]];
const Eiffel: React.FC<{id: string}> = ({id}) => {
  const out = mirror(EIFFEL_OUT);
  const arch: Pt[] = [[-40, 0], [-36, 14], [-28, 28], [-15, 36], [0, 38.5], [15, 36], [28, 28], [36, 14], [40, 0]];
  const mid: Pt[] = [[-27, 64], [-19, 90], [-14, 115], [14, 115], [19, 90], [27, 64]];
  return (
    <g>
      <clipPath id={`ec${id}`}><path d={P(out) + P(arch.concat([[40, -1], [-40, -1]]))} clipRule="evenodd" /></clipPath>
      <g clipPath={`url(#ec${id})`}>
        <path d={P(out)} fill="#3A2830" opacity={0.55} />
        <rect x={-70} y={-340} width={70} height={340} fill="url(#mLatticeLit)" opacity={0.85} />
        <rect x={0} y={-340} width={70} height={340} fill="url(#mLattice)" />
        <path d={P(mid)} fill="#E9B08E" opacity={0.1} />
      </g>
      {/* corner girders */}
      <path d={P(EIFFEL_OUT, false)} stroke="#D9946C" strokeWidth={1.6} fill="none" />
      <path d={P(EIFFEL_OUT.map(([x, y]) => [-x, y] as Pt), false)} stroke="#3A2630" strokeWidth={1.6} fill="none" />
      <path d={P([[-40, 0], [-30, 30], [-22, 60], [-16, 115], [-8, 220], [-4, 276]], false)} stroke="#B87A5A" strokeWidth={1.1} fill="none" opacity={0.8} />
      <path d={P([[40, 0], [30, 30], [22, 60], [16, 115], [8, 220], [4, 276]], false)} stroke="#2E2028" strokeWidth={1.1} fill="none" />
      <path d={P(arch, false)} stroke="#8E5E48" strokeWidth={1.4} fill="none" />
      {/* platforms */}
      <path d={R(-37, 57, 37, 64)} fill="url(#mIron)" />
      <path d={R(-37, 63.4, 37, 64)} fill="#F2B48A" opacity={0.6} />
      <path d={R(-21, 115, 21, 119)} fill="url(#mIron)" />
      <path d={R(-6.5, 276, 6.5, 282)} fill="url(#mIron)" />
      <path d={R(-37, 59, 37, 60.5)} fill="#FFD9A0" opacity={0.35} />
    </g>
  );
};

// ---------------------------------------------------------------- Empire State Building (443 m to the antenna tip)
const ESB_TIERS: [number, number, number][] = [[0, 25, 62], [25, 88, 46], [88, 118, 36], [118, 300, 28], [300, 322, 21], [322, 345, 16], [345, 368, 12], [368, 381, 9]];
const Empire: React.FC = () => {
  const Rn = rng(5);
  const els: React.ReactNode[] = [];
  ESB_TIERS.forEach(([y0, y1, w], i) => {
    const side = Math.min(14, w * 0.4);
    els.push(<path key={'s' + i} d={P([[w, y0], [w + side, y0 + side * 0.25], [w + side, y1 + side * 0.25], [w, y1]])} fill="url(#mLimeSide)" />);
    els.push(<path key={'f' + i} d={R(-w, y0, w, y1)} fill="url(#mLime)" />);
    els.push(<path key={'t' + i} d={P([[-w, y1], [w, y1], [w + side, y1 + side * 0.25], [-w + side, y1 + side * 0.25]])} fill="#E8C8AE" opacity={0.8} />);
    // window columns, with some lights already on at dusk
    for (let x = -w + 2.2; x < w - 1.5; x += 3.1) {
      els.push(<path key={`c${i}_${x}`} d={R(x, y0 + 1.5, x + 1.3, y1 - 1)} fill="#4E4058" opacity={0.55} />);
      for (let y = y0 + 2; y < y1 - 2; y += 3.6) if (Rn() < 0.09) els.push(<path key={`w${i}_${x}_${y}`} d={R(x, y, x + 1.3, y + 2.4)} fill="#FFD08A" opacity={0.85} />);
    }
  });
  return (
    <g>
      {els}
      {/* mooring mast and antenna */}
      <path d={P([[-6, 381], [6, 381], [4.5, 400], [3, 412], [1.2, 420], [-1.2, 420], [-3, 412], [-4.5, 400]])} fill="url(#mLime)" />
      {[-4, -1.3, 1.3].map((x) => <path key={x} d={R(x, 384, x + 1.4, 404)} fill="#4E4058" opacity={0.5} />)}
      <path d={P([[-0.9, 420], [0.9, 420], [0.35, 443], [-0.35, 443]])} fill="#8C7A80" />
      <circle cx={0} cy={-443} r={1.2} fill="#FF6A5A" opacity={0.9} />
    </g>
  );
};

// ---------------------------------------------------------------- Burj Khalifa (828 m): Y-plan tiers stepping back in a spiral
const Burj: React.FC = () => {
  const left: [number, number][] = [[0, 34], [110, 31], [200, 27.5], [290, 24], [370, 20.5], [440, 17], [500, 13.5], [550, 10.5], [590, 8]];
  const right: [number, number][] = [[0, 34], [150, 30], [245, 26], [330, 22.5], [405, 19], [470, 15.5], [525, 12], [570, 9.5], [600, 7.5]];
  const prof = (steps: [number, number][], sign: number): Pt[] => {
    const pts: Pt[] = [];
    steps.forEach(([y, w], i) => {
      const yn = i + 1 < steps.length ? steps[i + 1][0] : 640;
      pts.push([sign * w, y], [sign * w, yn]);
    });
    return pts;
  };
  const L = prof(left, -1), Rr = prof(right, 1);
  const spire: Pt[] = [[-6, 640], [-4, 680], [-2.6, 730], [-1.4, 780], [-0.5, 828], [0.5, 828], [1.4, 780], [2.6, 730], [4, 680], [6, 640]];
  const outline: Pt[] = [...L, ...spire, ...Rr.slice().reverse()];
  return (
    <g>
      <path d={P(outline)} fill="url(#mGlass)" />
      {/* central core with a lit edge, side wings in shade */}
      <path d={P([[-9, 0], [9, 0], [8, 640], [-8, 640]])} fill="#F6CFAE" opacity={0.18} />
      <path d={P([[9, 0], [34, 0], [30, 150], [9, 150]])} fill="#2A2840" opacity={0.18} />
      {Array.from({length: 13}, (_, i) => -27 + i * 4.5).map((x, i) => <path key={i} d={P([[x, 0], [x * 0.25, 640]], false)} stroke="#2A2840" strokeWidth={0.5} opacity={0.25} />)}
      {left.map(([y, w], i) => <path key={'ls' + i} d={P([[-w, y], [-9, y]], false)} stroke="#FFE2C4" strokeWidth={1} opacity={0.6} />)}
      {right.map(([y, w], i) => <path key={'rs' + i} d={P([[9, y], [w, y]], false)} stroke="#1E1C30" strokeWidth={1} opacity={0.5} />)}
      <circle cx={0} cy={-828} r={1.6} fill="#FF6A5A" opacity={0.9} />
    </g>
  );
};

// ---------------------------------------------------------------- Mount Everest, with Lhotse behind on the right
const EV: Pt[] = [[-4300, 0], [-3600, 900], [-3000, 1900], [-2500, 3000], [-2000, 4200], [-1500, 5200], [-1050, 6300], [-700, 7300], [-380, 8150], [-120, 8650], [0, 8849], [160, 8700], [450, 8450], [800, 8200], [1150, 7950], [1500, 7800], [2000, 7900], [2500, 8150], [2900, 8516], [3300, 8150], [3900, 7300], [4600, 6100], [5600, 4600], [6800, 3000], [8200, 1500], [9800, 0]];
// ridge dropping from the summit toward the viewer: left of it is lit, right of it in shade
const RIDGE: Pt[] = [[0, 8849], [150, 7900], [420, 6900], [600, 5800], [900, 4600], [1300, 3200], [1800, 1600], [2300, 0]];
const LH_RIDGE: Pt[] = [[2900, 8516], [3050, 7400], [3400, 6200], [3900, 4800], [4600, 3000], [5400, 0]];
const Everest: React.FC<{id: string}> = ({id}) => {
  const Rn = rng(3);
  // jagged snow line: high on the steep lit face, lower in the shaded couloirs
  const snowEdge: Pt[] = [];
  for (let x = -4300; x <= 9800; x += 120) {
    const base = 5600 + 500 * Math.sin(x / 900) + (Rn() - 0.5) * 500;
    snowEdge.push([x, base + ((x / 120) % 2 ? 350 : -150)]);
  }
  const ribs: React.ReactNode[] = [];
  for (let i = 0; i < 34; i++) { // dark rock ribs running down the lit face
    const t = Rn();
    const x0 = -1300 + t * 1300, top = 8500 - t * 900 - Rn() * 600;
    const len = 900 + Rn() * 1500, w = 50 + Rn() * 70;
    ribs.push(<path key={i} d={P([[x0, top], [x0 - len * 0.42, top - len], [x0 - len * 0.42 + w, top - len], [x0 + w * 0.5, top]])} fill="#6E5868" opacity={0.5} />);
  }
  for (let i = 0; i < 22; i++) {
    const x0 = 300 + Rn() * 3200, top = 8300 - Rn() * 1600, len = 700 + Rn() * 1400, w = 60 + Rn() * 80;
    ribs.push(<path key={'r' + i} d={P([[x0, top], [x0 + len * 0.35, top - len], [x0 + len * 0.35 + w, top - len], [x0 + w * 0.5, top]])} fill="#2C2440" opacity={0.45} />);
  }
  return (
    <g>
      <clipPath id={`ev${id}`}><path d={P(EV)} /></clipPath>
      <path d={P(EV)} fill="url(#mRock)" />
      <g clipPath={`url(#ev${id})`}>
        <path d={P([...snowEdge, [9800, 9200], [-4300, 9200]])} fill="url(#mSnow)" />
        {ribs}
        {/* shaded faces right of the ridges */}
        <path d={P([...RIDGE, [9800, 0], [9800, 9200], [0, 9200]])} fill="#2E2848" opacity={0.5} />
        <path d={P([...LH_RIDGE, [9800, 0], [9800, 9200], [2900, 9200]])} fill="#2A2440" opacity={0.3} />
        {/* lit edge along the ridge and the west shoulder */}
        <path d={P(RIDGE.slice(0, 5), false)} stroke="#FFF1E2" strokeWidth={50} opacity={0.55} fill="none" />
        <path d={P([[0, 8849], [-380, 8150], [-700, 7300], [-1050, 6300]], false)} stroke="#FFE2C8" strokeWidth={70} opacity={0.5} fill="none" />
        {/* haze at the foot */}
        <rect x={-4300} y={-3600} width={14100} height={3600} fill="url(#mHaze)" />
      </g>
    </g>
  );
};

export const TallObject: React.FC<{id: string; uid: string}> = ({id, uid}) => {
  switch (id) {
    case 'person': return <Person />;
    case 'giraffe': return <Giraffe id={uid} />;
    case 'christ': return <Christ />;
    case 'liberty': return <Liberty />;
    case 'hyperion': return <Hyperion />;
    case 'pyramid': return <Pyramid />;
    case 'eiffel': return <Eiffel id={uid} />;
    case 'empire': return <Empire />;
    case 'burj': return <Burj />;
    case 'everest': return <Everest id={uid} />;
    default: return null;
  }
};
