import React from 'react';
import {Pt, smooth, tube} from '../giants/geom';
import {fbm1, rng} from '../engine/noise';

// Short 07 subjects: divers, deep-diving animals, wrecks and a submersible, code-drawn in screen pixels
// (y down), each centred on (0, 0) and facing right. They are not to scale with each other: the video
// compares depth, so every subject is drawn at a readable size. Light comes from above (the surface),
// so tops are lit and bellies fall into shadow. t is seconds.

export type SubjectProps = {t: number};
// Catmull-Rom outline in y-down pixels (geom.smooth is written for y up, so flip on the way in)
const sm = (pts: Pt[], closed = true) => smooth(pts.map(([x, y]) => [x, -y] as Pt), closed);
const NS = {vectorEffect: 'non-scaling-stroke' as const};

const lin = (id: string, stops: [number, string, number?][], dir: 'v' | 'h' = 'v') => (
  <linearGradient key={id} id={id} x1="0" y1="0" x2={dir === 'h' ? 1 : 0} y2={dir === 'v' ? 1 : 0}>
    {stops.map(([o, c, a], i) => <stop key={i} offset={o} stopColor={c} stopOpacity={a ?? 1} />)}
  </linearGradient>
);

export const DeepDefs: React.FC = () => (
  <defs>
    {/* light from the surface: a cool sheen on top, a soft core shadow underneath */}
    {lin('dForm', [[0, '#DFF4FF', 0.22], [0.25, '#DFF4FF', 0.04], [0.55, '#000', 0], [0.82, '#020812', 0.25], [1, '#020812', 0.45]])}
    {lin('dSuit', [[0, '#3A4A5C'], [0.5, '#1E2834'], [1, '#10161E']])}
    {lin('dTank', [[0, '#F2D37A'], [0.45, '#D9A83A'], [1, '#7A5A18']])}
    {lin('dSteel', [[0, '#E8EEF2'], [0.45, '#AEB8C0'], [1, '#5C666E']])}
    {lin('dSkin', [[0, '#E8B696'], [1, '#9A6650']])}
    {lin('dPengBack', [[0, '#3A4450'], [1, '#12161C']])}
    {lin('dTurtle', [[0, '#4A525C'], [0.5, '#2A3038'], [1, '#14181E']])}
    {lin('dSperm', [[0, '#6E6A6E'], [0.45, '#4E4A50'], [1, '#2A282E']])}
    {lin('dSeal', [[0, '#9A8E80'], [0.5, '#6E6458'], [1, '#4A4038']])}
    {lin('dBeak', [[0, '#C9C2B6'], [0.35, '#8E8880'], [1, '#4A4644']], 'h')}
    {lin('dRust', [[0, '#8A4A2A'], [0.5, '#5E3020'], [1, '#2E1810']])}
    {lin('dGrey', [[0, '#8C969C'], [0.5, '#5E686E'], [1, '#30383E']])}
    {lin('dMud', [[0, '#5C5648'], [1, '#2A2620']])}
    {lin('dSnail', [[0, '#FBE6E2', 0.95], [0.6, '#EBC2BE', 0.85], [1, '#C89894', 0.75]])}
    {lin('dSub', [[0, '#F4F6F6'], [0.5, '#C8D0D4'], [1, '#6E7A82']])}
    {lin('dSquid', [[0, '#D87A5A'], [1, '#8A3A2A']])}
    <radialGradient id="dBeam" cx="0" cy="0.5" r="1"><stop offset="0" stopColor="#FFF6DA" stopOpacity="0.55" /><stop offset="1" stopColor="#FFF6DA" stopOpacity="0" /></radialGradient>
    <filter id="dSoft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3" /></filter>
    <filter id="dBlur8" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="8" /></filter>
    {/* subtle mottled skin, kept faint (strong texture looked like camo in Short 06) */}
    <filter id="dTex" x="0" y="0" width="1" height="1" colorInterpolationFilters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.09" numOctaves={3} seed={7} result="n" />
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.05  0 0 0 0 0.05  0 0 0 0 0.07  -1.4 0 0 0 0.82" result="d" />
      <feComposite in="d" in2="SourceAlpha" operator="in" />
    </filter>
  </defs>
);

const Shade: React.FC<{d: string}> = ({d}) => <path d={d} fill="url(#dForm)" />;
const Rim: React.FC<{d: string; o?: number}> = ({d, o = 0.5}) => <path d={d} fill="none" stroke="#DFF6FF" strokeOpacity={o} strokeWidth={1.5} />;

// a few rising bubbles from (x, y)
const Bubbles: React.FC<{x: number; y: number; t: number; n?: number; seed?: number}> = ({x, y, t, n = 7, seed = 1}) => {
  const R = rng(seed);
  return (
    <g>
      {Array.from({length: n}, (_, i) => {
        const ph = R(), sp = 40 + R() * 40, r = 1.6 + R() * 3.2;
        const u = (t * sp / 120 + ph) % 1;
        return <circle key={i} cx={x + 8 * Math.sin(t * 3 + i) + (R() - 0.5) * 10} cy={y - u * 120} r={r * (1 - 0.3 * u)} fill="none" stroke="#E6FAFF" strokeOpacity={0.7 * (1 - u)} strokeWidth={1.2} />;
      })}
    </g>
  );
};

// ---------------------------------------------------------------- a person in a swimming pose
// Prone, facing right (head at +x), back up. kick 0..1 is how hard the legs move.
type Gear = 'none' | 'scuba' | 'tech';
const Swimmer: React.FC<{t: number; gear: Gear; armsFwd?: boolean; kick?: number}> = ({t, gear, armsFwd = false, kick = 1}) => {
  const k1 = 7 * kick * Math.sin(t * 3.4), k2 = -k1;
  const torso = tube([[0, 0], [22, -1], [44, -2], [64, -3]], [30, 32, 34, 30]);
  const leg = (k: number): Pt[] => tube([[2, 2], [-22, 3 + k * 0.4], [-44, 4 + k * 0.7], [-66, 3 + k], [-86, 2 + k * 1.3]], [24, 21, 15, 13, 9]);
  const fin = (k: number): Pt[] => [[-84, -4 + k * 1.3], [-100, -7 + k * 1.8], [-132, -10 + k * 2.4], [-138, 2 + k * 2.4], [-128, 10 + k * 2.2], [-98, 8 + k * 1.6], [-84, 7 + k * 1.3]];
  const arm: Pt[] = armsFwd ? [[60, 6], [84, 10], [108, 10], [126, 8]] : [[58, 6], [42, 14], [24, 14], [10, 10]];
  const head = sm([[70, -14], [84, -17], [95, -11], [99, 0], [94, 10], [82, 13], [72, 8], [68, -3]]);
  return (
    <g>
      {/* far side */}
      <path d={sm(leg(k2))} fill="#141A22" />
      <path d={sm(fin(k2))} fill={gear === 'none' ? '#1A2430' : '#2E3A46'} />
      {/* near side */}
      <path d={sm(leg(k1))} fill="url(#dSuit)" />
      <path d={sm(fin(k1))} fill={gear === 'none' ? '#24364A' : '#E0B23C'} />
      <path d={sm(fin(k1))} fill="url(#dForm)" opacity={0.7} />
      <path d={sm(torso)} fill="url(#dSuit)" />
      <Shade d={sm(torso)} />
      <Rim d={sm(torso.slice(0, 4), false)} o={0.35} />
      {/* head in a hood, mask on the face */}
      <path d={head} fill="#1A222C" />
      <path d={sm([[86, -8], [97, -7], [100, 1], [96, 7], [87, 5]])} fill="#2C3E4E" stroke="#0C1218" strokeWidth={1.5} />
      <path d={sm([[89, -5], [95, -4], [97, 1], [94, 4], [89, 3]])} fill="#7FC4DA" opacity={0.8} />
      <path d={sm(tube(arm, [12, 11, 9, 8]))} fill="url(#dSuit)" />
      {armsFwd && <ellipse cx={128} cy={8} rx={7} ry={5} fill="#3A4A5A" />}
      {gear === 'scuba' && (
        <g>
          <rect x={6} y={-34} width={54} height={18} rx={9} fill="url(#dTank)" />
          <rect x={56} y={-32} width={8} height={14} rx={2} fill="#555E66" />
          <path d="M62,-26 C74,-30 90,-20 92,6" fill="none" stroke="#1A1E22" strokeWidth={3} />
          <ellipse cx={93} cy={8} rx={5} ry={4} fill="#22282E" />
        </g>
      )}
      {gear === 'tech' && (
        <g>
          {/* twin tanks on the back and four stage tanks clipped along the side */}
          <rect x={2} y={-38} width={60} height={16} rx={8} fill="url(#dSteel)" />
          <rect x={2} y={-28} width={60} height={14} rx={7} fill="url(#dSteel)" opacity={0.9} />
          {[0, 1, 2, 3].map((i) => (
            <g key={i} transform={`translate(${-10 + i * 18},${14 + (i % 2) * 7})`}>
              <rect x={0} y={0} width={46} height={12} rx={6} fill={['#E8E2D2', '#D8C060', '#E8E2D2', '#C8D8E0'][i]} />
              <rect x={0} y={0} width={46} height={12} rx={6} fill="url(#dForm)" />
              <rect x={44} y={3} width={6} height={6} rx={1} fill="#4E565E" />
            </g>
          ))}
          <path d="M62,-30 C76,-30 90,-20 92,6" fill="none" stroke="#1A1E22" strokeWidth={3} />
          <ellipse cx={93} cy={8} rx={5} ry={4} fill="#22282E" />
        </g>
      )}
    </g>
  );
};

// You, treading water at the surface: head and shoulders above the waterline (y = 0), body below.
export const SurfaceSwimmer: React.FC<SubjectProps> = ({t}) => {
  const bob = 3 * Math.sin(t * 1.7);
  const sw = (s: number) => 10 * Math.sin(t * 2.2 + s);
  return (
    <g transform={`translate(0,${bob})`}>
      {/* legs and arms sculling under water, a little blurred and blue */}
      <g opacity={0.8}>
        <path d={sm(tube([[-10, 70], [-16 + sw(0), 120], [-12 + sw(0) * 1.3, 168]], [26, 20, 13]))} fill="#3E5A72" />
        <path d={sm(tube([[10, 70], [16 - sw(0), 120], [20 - sw(0) * 1.3, 166]], [26, 20, 13]))} fill="#4E6E88" />
        <path d={sm(tube([[-26, 2], [-56, 18 + sw(1)], [-80, 26 + sw(1)]], [14, 12, 10]))} fill="#B98A72" opacity={0.85} />
        <path d={sm(tube([[26, 2], [56, 18 - sw(1)], [80, 26 - sw(1)]], [14, 12, 10]))} fill="#C99A80" opacity={0.85} />
        <path d={sm(tube([[0, -6], [0, 30], [0, 72]], [58, 54, 46]))} fill="#2E6A8E" />
        <path d={sm(tube([[0, -6], [0, 30], [0, 72]], [58, 54, 46]))} fill="url(#dForm)" />
      </g>
      {/* head above the water */}
      <path d={sm([[-6, -10], [-2, -28], [0, -46], [-6, -64], [4, -84], [24, -90], [40, -78], [42, -60], [47, -50], [42, -44], [42, -32], [30, -24], [18, -12]])} fill="url(#dSkin)" />
      <path d={sm([[-8, -50], [-6, -72], [6, -90], [28, -96], [44, -82], [40, -70], [24, -74], [10, -70], [2, -56]])} fill="#3A2820" />
      <ellipse cx={34} cy={-60} rx={3} ry={2.4} fill="#2A1C16" />
      <path d="M-34,-4 C-20,-14 30,-14 44,-4" fill="#C99A80" />
      <path d="M-30,0 C-20,-10 28,-10 40,0 L40,6 L-30,6Z" fill="#2E6A8E" opacity={0.6} />
      {/* ripple ring where the body breaks the surface */}
      <ellipse cx={4} cy={2} rx={70 + 6 * Math.sin(t * 2)} ry={7} fill="none" stroke="#FFFFFF" strokeOpacity={0.8} strokeWidth={2} />
    </g>
  );
};

export const ScubaDiver: React.FC<SubjectProps> = ({t}) => (
  <g transform="rotate(28) translate(-10,0)">
    <Swimmer t={t} gear="scuba" />
    <g transform="rotate(-28)"><Bubbles x={80} y={-40} t={t} seed={3} /></g>
  </g>
);

// Freediver heading straight down on a weighted sled that rides a guide cable; one breath, no tank.
export const Freediver: React.FC<SubjectProps> = ({t}) => (
  <g>
    <line x1={0} y1={-900} x2={0} y2={600} stroke="#E6F2F6" strokeOpacity={0.55} strokeWidth={2} />
    <g transform="translate(-14,-40) rotate(90)"><Swimmer t={t * 0.4} gear="none" armsFwd kick={0.15} /></g>
    {/* sled: a weight with a handle bar, below the diver's hands */}
    <rect x={-26} y={92} width={52} height={10} rx={3} fill="#C8CED2" />
    <rect x={-14} y={102} width={28} height={54} rx={5} fill="url(#dSteel)" />
    <rect x={-14} y={102} width={28} height={54} rx={5} fill="url(#dForm)" />
    <rect x={-6} y={156} width={12} height={10} rx={2} fill="#D24A3A" />
  </g>
);

export const TechDiver: React.FC<SubjectProps> = ({t}) => (
  <g transform="rotate(40) translate(-10,0)">
    <Swimmer t={t * 0.7} gear="tech" kick={0.6} />
    <g transform="rotate(-40)"><Bubbles x={70} y={-40} t={t} seed={5} n={9} /></g>
  </g>
);

// ---------------------------------------------------------------- emperor penguin, diving head first
export const Penguin: React.FC<SubjectProps> = ({t}) => {
  const fl = 14 * Math.sin(t * 6);
  const body: Pt[] = [[-90, 4], [-70, -12], [-30, -26], [20, -30], [60, -24], [88, -12], [104, -2], [88, 10], [60, 22], [10, 30], [-40, 24], [-76, 14]];
  return (
    <g transform="rotate(42)">
      <path d={sm([[-92, 2], [-112, -6], [-108, 6]])} fill="#14181E" />
      <path d={sm(body)} fill="url(#dPengBack)" />
      {/* white belly and the orange-yellow ear patch */}
      <path d={sm([[-76, 12], [-40, 10], [10, 12], [56, 10], [86, 6], [88, 10], [60, 22], [10, 30], [-40, 24]])} fill="#EEECE6" />
      <path d={sm([[56, -6], [70, -14], [80, -6], [70, 6], [60, 6]])} fill="#F2B33C" opacity={0.9} />
      <path d={sm([[80, 2], [70, 8], [76, 12], [90, 8]])} fill="#F6D9A0" opacity={0.8} />
      <path d={sm([[100, -6], [126, -2], [104, 3]])} fill="#262A30" />
      <path d={sm([[106, 0], [122, -1], [106, 2]])} fill="#E8884A" />
      <circle cx={88} cy={-8} r={2.6} fill="#0A0C10" />
      <path d={sm(body)} fill="url(#dForm)" />
      {/* flipper swept back, beating */}
      <path d={sm([[30, -6], [0, -2 + fl * 0.3], [-40, 6 + fl], [-50, 12 + fl], [-36, 14 + fl * 0.8], [10, 8], [32, 4]])} fill="#1E242C" />
      <path d={sm([[-78, 18], [-96, 26], [-84, 30], [-70, 22]])} fill="#2A2A2E" />
      <g transform="rotate(-42)"><Bubbles x={-70} y={-60} t={t} seed={8} n={10} /></g>
    </g>
  );
};

// ---------------------------------------------------------------- leatherback turtle
export const Turtle: React.FC<SubjectProps> = ({t}) => {
  const fl = Math.sin(t * 1.8);
  const shell: Pt[] = [[-120, 6], [-90, -22], [-30, -42], [40, -40], [92, -24], [116, -6], [112, 12], [70, 26], [0, 32], [-70, 24], [-110, 16]];
  const R = rng(4);
  return (
    <g transform="rotate(18)">
      {/* far front flipper */}
      <path d={sm([[60, 4], [30, -20 - 20 * fl], [-30, -50 - 40 * fl], [-60, -56 - 44 * fl], [-30, -30 - 26 * fl], [20, 10]])} fill="#1A1E24" />
      <path d={sm([[-100, 12], [-140, 22], [-150, 34], [-118, 30], [-92, 20]])} fill="#1E2228" />
      <path d={sm([[104, -2], [134, -12], [154, -6], [162, 6], [150, 16], [124, 16], [104, 12]])} fill="#2E343C" />
      <circle cx={146} cy={-2} r={2.6} fill="#06080A" />
      <path d={sm(shell)} fill="url(#dTurtle)" />
      <path d={sm(shell)} filter="url(#dTex)" fill="#000" />
      {/* the leatherback's seven ridges, five on this side */}
      {[-30, -18, -6, 6, 18].map((y, i) => <path key={i} d={`M-110,${8 + y * 0.35} C-60,${y - 6} 40,${y - 8} 108,${y * 0.5}`} fill="none" stroke="#5E6670" strokeOpacity={0.6} strokeWidth={2} />)}
      {Array.from({length: 26}, (_, i) => <circle key={i} cx={-100 + R() * 200} cy={-30 + R() * 50} r={1 + R() * 1.6} fill="#D8DEE2" opacity={0.45} />)}
      <Shade d={sm(shell)} />
      <Rim d={sm(shell.slice(0, 6), false)} o={0.3} />
      {/* near front flipper, long as the shell */}
      <path d={sm([[70, 14], [40, 30 + 18 * fl], [-20, 66 + 40 * fl], [-70, 84 + 50 * fl], [-40, 54 + 34 * fl], [20, 24]])} fill="#2A3038" />
      <path d={sm([[-60, 22], [-96, 40], [-100, 52], [-72, 42], [-50, 26]])} fill="#262A32" />
    </g>
  );
};

// ---------------------------------------------------------------- sperm whale with a giant squid
export const SpermWhale: React.FC<SubjectProps> = ({t}) => {
  const fk = 8 * Math.sin(t * 1.3);
  const body: Pt[] = [[-200, 0 + fk], [-170, -14 + fk * 0.7], [-110, -36], [-40, -52], [30, -60], [100, -66], [170, -66], [196, -56], [204, -20], [200, 20], [180, 40], [110, 46], [40, 44], [-40, 30], [-120, 14], [-176, 8 + fk * 0.7]];
  const R = rng(9);
  return (
    <g transform="rotate(30)">
      {/* giant squid trailing below the jaw, tentacles drifting */}
      <g transform="translate(150,96) rotate(-18)">
        {Array.from({length: 8}, (_, i) => <path key={i} d={`M0,0 C${-30 - i * 4},${10 + 6 * Math.sin(t * 1.5 + i)} ${-60 - i * 6},${-4 + i * 4 + 8 * Math.sin(t + i)} ${-96 - i * 8},${4 + i * 5}`} fill="none" stroke="#B85A40" strokeWidth={3 - i * 0.2} strokeLinecap="round" />)}
        <path d={sm([[0, -10], [40, -14], [86, -6], [100, 0], [86, 6], [40, 14], [0, 10]])} fill="url(#dSquid)" />
        <circle cx={10} cy={-2} r={5} fill="#F2E2C8" /><circle cx={11} cy={-2} r={2.6} fill="#1A0E0A" />
      </g>
      <path d={sm([[-196, 0 + fk], [-236, -26 + fk * 1.6], [-250, -20 + fk * 1.6], [-224, 2 + fk * 1.2], [-250, 22 + fk * 1.6], [-234, 26 + fk * 1.6]])} fill="#3A3840" />
      <path d={sm(body)} fill="url(#dSperm)" />
      <path d={sm(body)} filter="url(#dTex)" fill="#000" />
      {/* wrinkled skin behind the head */}
      {Array.from({length: 18}, (_, i) => {
        const x = -150 + i * 16 + R() * 8, y = -20 + R() * 30;
        return <path key={i} d={`M${x},${y} q6,${8 + R() * 8} 0,${16 + R() * 10}`} fill="none" stroke="#2A282E" strokeOpacity={0.35} strokeWidth={1.4} />;
      })}
      {/* the narrow lower jaw and a small eye near the corner of the mouth */}
      <path d={sm([[60, 44], [120, 50], [180, 44], [190, 40], [180, 36], [110, 40], [60, 38]])} fill="#D8D2CA" opacity={0.85} />
      <ellipse cx={86} cy={20} rx={4} ry={3} fill="#0E0C10" />
      <path d="M-60,-50 q14,-10 30,-6" fill="none" stroke="#3A3840" strokeWidth={6} strokeLinecap="round" />
      <Shade d={sm(body)} />
      <Rim d={sm(body.slice(1, 8), false)} o={0.3} />
      <path d={sm([[0, 34], [-24, 52 + fk * 0.4], [-36, 54 + fk * 0.4], [-20, 36]])} fill="#3A3840" />
    </g>
  );
};

// ---------------------------------------------------------------- southern elephant seal
export const ElephantSeal: React.FC<SubjectProps> = ({t}) => {
  const w = 6 * Math.sin(t * 1.6);
  const body: Pt[] = [[-120, 2 + w], [-90, -18], [-30, -34], [40, -36], [92, -28], [120, -14], [132, 0], [124, 14], [96, 24], [40, 32], [-30, 30], [-90, 18]];
  return (
    <g transform="rotate(26)">
      <path d={sm([[-112, 0 + w], [-150, -22 + w * 1.6], [-162, -12 + w * 1.6], [-138, 2 + w * 1.2], [-162, 18 + w * 1.6], [-150, 24 + w * 1.6]])} fill="#4A4038" />
      <path d={sm(body)} fill="url(#dSeal)" />
      <path d={sm(body)} filter="url(#dTex)" fill="#000" />
      <path d={sm([[132, 0], [146, 4], [140, 12], [124, 14]])} fill="#5A5048" />
      <ellipse cx={108} cy={-8} rx={6} ry={5} fill="#0A0808" />
      <circle cx={110} cy={-10} r={1.6} fill="#E8F4F8" />
      {[0, 1, 2].map((i) => <path key={i} d={`M134,${4 + i * 2} l18,${-4 + i * 4}`} stroke="#E2DCD2" strokeOpacity={0.6} strokeWidth={1} />)}
      <Shade d={sm(body)} />
      <Rim d={sm(body.slice(1, 7), false)} o={0.3} />
      <path d={sm([[60, 20], [40, 44 + w], [24, 46 + w], [40, 22]])} fill="#5A5048" />
    </g>
  );
};

// ---------------------------------------------------------------- Cuvier's beaked whale (pale head, scars)
export const BeakedWhale: React.FC<SubjectProps> = ({t}) => {
  const fk = 7 * Math.sin(t * 1.4);
  const body: Pt[] = [[-170, 0 + fk], [-140, -12 + fk * 0.6], [-60, -30], [20, -36], [90, -32], [140, -20], [160, -10], [176, -2], [160, 6], [130, 16], [60, 24], [-20, 22], [-110, 10], [-150, 6 + fk * 0.6]];
  const R = rng(12);
  return (
    <g transform="rotate(22)">
      <path d={sm([[-166, 0 + fk], [-200, -22 + fk * 1.6], [-212, -16 + fk * 1.6], [-190, 2 + fk * 1.2], [-212, 20 + fk * 1.6], [-200, 24 + fk * 1.6]])} fill="#3E3C3C" />
      <path d={sm(body)} fill="url(#dBeak)" />
      <path d={sm(body)} filter="url(#dTex)" fill="#000" />
      {/* long white scars from rival males' teeth */}
      {Array.from({length: 14}, (_, i) => {
        const x = -110 + R() * 210, y = -24 + R() * 34, l = 18 + R() * 34;
        return <path key={i} d={`M${x},${y} l${l},${(R() - 0.5) * 10}`} stroke="#F2EEE6" strokeOpacity={0.55} strokeWidth={1.4} strokeLinecap="round" />;
      })}
      <path d="M-70,-28 l16,-18 l14,16" fill="#4A4644" />
      <ellipse cx={128} cy={-6} rx={3.4} ry={2.6} fill="#0C0A0A" />
      <path d="M150,4 q10,2 22,-2" fill="none" stroke="#3A3434" strokeWidth={1.4} />
      <Shade d={sm(body)} />
      <Rim d={sm(body.slice(1, 8), false)} o={0.3} />
      <path d={sm([[90, 16], [70, 32 + fk * 0.3], [58, 32 + fk * 0.3], [72, 16]])} fill="#4A4644" />
    </g>
  );
};

// a mound of sediment under a wreck or the trench floor
export const Mud: React.FC<{w: number; seed: number}> = ({w, seed}) => {
  const R = rng(seed);
  const pts: Pt[] = [[-w / 2, 30]];
  for (let i = 0; i <= 10; i++) pts.push([-w / 2 + (w * i) / 10, -4 - 10 * Math.sin((Math.PI * i) / 10) - R() * 6]);
  pts.push([w / 2, 30]);
  return (
    <g>
      <path d={sm(pts)} fill="url(#dMud)" />
      <path d={sm(pts.slice(1, -1), false)} fill="none" stroke="#8A8270" strokeOpacity={0.5} strokeWidth={2} />
    </g>
  );
};

// ---------------------------------------------------------------- Titanic bow section on the seabed
export const Titanic: React.FC<SubjectProps> = ({t}) => {
  const R = rng(19);
  const hull: Pt[] = [[-220, -40], [-210, -78], [-196, -70], [-186, -92], [-170, -84], [-150, -96], [100, -100], [180, -110], [228, -122], [212, -60], [196, 10], [-220, 10]];
  return (
    <g>
      <Mud w={520} seed={3} />
      <path d={`M${hull.map((p) => p.join(',')).join(' L')}Z`} fill="url(#dRust)" />
      <path d={`M${hull.map((p) => p.join(',')).join(' L')}Z`} filter="url(#dTex)" fill="#000" />
      {/* hull plating, portholes, the anchor */}
      {[-70, -40].map((y) => <path key={y} d={`M-206,${y} L210,${y - 12}`} stroke="#2A140C" strokeOpacity={0.6} strokeWidth={2} />)}
      {Array.from({length: 22}, (_, i) => <circle key={i} cx={-190 + i * 17} cy={-84 + i * -0.4} r={2.4} fill="#1A0A06" />)}
      <path d="M176,-74 l0,22 m-9,-6 q9,10 18,0" stroke="#3A1E12" strokeWidth={4} fill="none" />
      {/* the bow railing */}
      <path d="M40,-102 L226,-124" stroke="#5E3624" strokeWidth={2} />
      {Array.from({length: 14}, (_, i) => <line key={i} x1={44 + i * 13} y1={-102 - i * 1.5} x2={44 + i * 13} y2={-114 - i * 1.5} stroke="#5E3624" strokeWidth={1.6} />)}
      <path d="M40,-114 L226,-136" stroke="#6E4230" strokeWidth={2.2} />
      {/* deck fittings: the fallen foremast and a cargo crane */}
      <path d="M-40,-100 L120,-140" stroke="#4A2618" strokeWidth={5} strokeLinecap="round" />
      <rect x={-120} y={-118} width={40} height={20} fill="#4E2A1C" />
      <rect x={-20} y={-116} width={22} height={16} fill="#4E2A1C" />
      {/* rusticles hanging off the hull */}
      {Array.from({length: 30}, (_, i) => {
        const x = -200 + R() * 400, y = -98 + R() * 60, l = 6 + R() * 16;
        return <path key={i} d={`M${x - 2},${y} L${x + 2},${y} L${x},${y + l}Z`} fill="#A2562E" opacity={0.75} />;
      })}
      <path d={`M${hull.map((p) => p.join(',')).join(' L')}Z`} fill="url(#dForm)" />
      <Mud w={520} seed={4} />
      {Array.from({length: 40}, (_, i) => <circle key={i} cx={-240 + R() * 480} cy={-10 + R() * 16} r={1 + R()} fill="#9A9280" opacity={0.4 + 0.2 * Math.sin(t + i)} />)}
    </g>
  );
};

// ---------------------------------------------------------------- USS Samuel B. Roberts (DE-413), upright
export const DestroyerEscort: React.FC<SubjectProps> = ({t}) => {
  const R = rng(23);
  const hull: Pt[] = [[-226, -36], [-210, -48], [180, -52], [232, -66], [218, -20], [196, 12], [-214, 12]];
  return (
    <g>
      <Mud w={540} seed={7} />
      <path d={`M${hull.map((p) => p.join(',')).join(' L')}Z`} fill="url(#dGrey)" />
      <path d={`M${hull.map((p) => p.join(',')).join(' L')}Z`} filter="url(#dTex)" fill="#000" />
      {/* superstructure, funnel, mast and the two 5-inch gun mounts */}
      <path d="M40,-52 L40,-82 L70,-82 L70,-98 L110,-98 L118,-82 L132,-82 L132,-52Z" fill="#6E787E" />
      <path d="M-10,-52 L-6,-86 L22,-86 L26,-52Z" fill="#5E686E" />
      <path d="M90,-98 L92,-150 M74,-132 L110,-130" stroke="#4E585E" strokeWidth={3} />
      <path d="M150,-56 L150,-70 L176,-70 L182,-58Z" fill="#5A6468" />
      <line x1={176} y1={-64} x2={206} y2={-70} stroke="#4A5458" strokeWidth={4} />
      <path d="M-170,-48 L-170,-64 L-144,-64 L-138,-50Z" fill="#5A6468" />
      <line x1={-170} y1={-58} x2={-200} y2={-62} stroke="#4A5458" strokeWidth={4} />
      <text x={168} y={-26} fontFamily="Inter" fontWeight={600} fontSize={22} fill="#E8ECEE" opacity={0.75}>413</text>
      {/* rust streaks and sediment dust on deck */}
      {Array.from({length: 18}, (_, i) => {
        const x = -200 + R() * 390;
        return <path key={i} d={`M${x},-44 l2,${10 + R() * 26}`} stroke="#7A4A2E" strokeOpacity={0.5} strokeWidth={2} />;
      })}
      <path d="M-210,-50 L180,-54" stroke="#B8B0A0" strokeOpacity={0.5} strokeWidth={3} />
      <path d={`M${hull.map((p) => p.join(',')).join(' L')}Z`} fill="url(#dForm)" />
      <Mud w={540} seed={8} />
      {Array.from({length: 30}, (_, i) => <circle key={i} cx={-250 + R() * 500} cy={-8 + R() * 14} r={1 + R()} fill="#9A9280" opacity={0.4 + 0.2 * Math.sin(t + i)} />)}
    </g>
  );
};

// ---------------------------------------------------------------- hadal snailfish, pale and see-through
export const Snailfish: React.FC<SubjectProps> = ({t}) => {
  const u = (x: number) => 7 * Math.sin(t * 3 - x / 30) * Math.max(0, (60 - x) / 200);
  const body: Pt[] = [[-150, u(-150)], [-110, -8 + u(-110)], [-50, -20 + u(-50)], [10, -34], [56, -40], [92, -30], [108, -8], [104, 14], [80, 30], [30, 30], [-50, 16 + u(-50)], [-110, 8 + u(-110)]];
  return (
    <g transform="rotate(-6)">
      {/* long soft fins along the back and belly */}
      <path d={sm([[-150, u(-150)], [-100, -22 + u(-100)], [-30, -40 + u(-30)], [20, -44], [10, -32], [-50, -20 + u(-50)], [-110, -6 + u(-110)]])} fill="#F6DCD8" opacity={0.5} />
      <path d={sm([[-150, u(-150)], [-100, 22 + u(-100)], [-30, 36 + u(-30)], [20, 38], [20, 28], [-50, 16 + u(-50)], [-110, 8 + u(-110)]])} fill="#F6DCD8" opacity={0.5} />
      <path d={sm(body)} fill="url(#dSnail)" />
      <path d={sm(body)} fill="url(#dForm)" opacity={0.6} />
      {/* see-through: a faint spine and organs */}
      <path d={`M-140,${u(-140)} C-60,${-4 + u(-60)} 0,-12 50,-14`} fill="none" stroke="#C88A86" strokeOpacity={0.5} strokeWidth={2} />
      <ellipse cx={40} cy={4} rx={20} ry={12} fill="#D89A92" opacity={0.45} />
      {/* wing-like pectoral fin */}
      <path d={sm([[60, 10], [30, 40 + 6 * Math.sin(t * 4)], [0, 54 + 8 * Math.sin(t * 4)], [10, 30], [40, 14]])} fill="#FBE8E4" opacity={0.65} />
      <circle cx={88} cy={-12} r={4.4} fill="#2A1818" />
      <circle cx={89} cy={-13} r={1.4} fill="#FFFFFF" opacity={0.8} />
      <Rim d={sm(body.slice(2, 7), false)} o={0.45} />
    </g>
  );
};

// ---------------------------------------------------------------- a deep submersible with its lights on
export const Submersible: React.FC<SubjectProps> = ({t}) => (
  <g>
    <path d="M60,-30 L360,-130 L360,90 L60,10Z" fill="url(#dBeam)" opacity={0.6 + 0.08 * fbm1(t, 2)} />
    <rect x={-80} y={-60} width={140} height={70} rx={20} fill="url(#dSub)" />
    <rect x={-80} y={-60} width={140} height={70} rx={20} fill="url(#dForm)" />
    <rect x={-70} y={-82} width={70} height={24} rx={8} fill="#2E6E9E" />
    <circle cx={40} cy={-24} r={16} fill="#1A2C3A" stroke="#E8EEF0" strokeWidth={3} />
    <circle cx={36} cy={-28} r={5} fill="#9AD6F2" opacity={0.7} />
    <rect x={-96} y={-30} width={18} height={26} rx={4} fill="#3A4248" />
    <circle cx={60} cy={-6} r={6} fill="#FFF6DA" />
    <rect x={-70} y={10} width={120} height={8} rx={2} fill="#4A5258" />
  </g>
);

// Mount Everest, upside down: summit (tip) at y = h px below its base, base on y = 0, half width hw px.
export const EverestUpsideDown: React.FC<{h: number; hw: number}> = ({h, hw}) => {
  const R = rng(41);
  const n = 14;
  const L: Pt[] = [], Rt: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const v = i / n, y = v * h;
    const k = Math.pow(1 - v, 0.9);
    L.push([-hw * k - (i > 0 && i < n ? R() * hw * 0.08 : 0), y]);
    Rt.push([hw * k * 0.86 + (i > 0 && i < n ? R() * hw * 0.08 : 0), y]);
  }
  const outline = [...L, ...Rt.reverse()];
  const d = 'M' + outline.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' L') + 'Z';
  // snow and ice near the summit (the tip, now at the bottom), with a ragged edge, plus streaks of snow up the gullies
  const edge = (v: number) => {
    const k = Math.pow(1 - v, 0.9);
    return [-hw * k, hw * k * 0.86];
  };
  const snow: Pt[] = [];
  const S = rng(43);
  for (let i = 0; i <= 12; i++) {
    const v = 0.78 + (0.22 * i) / 12;
    snow.push([edge(v)[0], v * h]);
  }
  for (let i = 0; i <= 10; i++) {
    const x = edge(0.78)[1] - ((edge(0.78)[1] - edge(0.78)[0]) * i) / 10;
    snow.push([x, (0.78 - (i % 2 ? 0.04 + S() * 0.05 : S() * 0.02)) * h]);
  }
  snow.splice(13, 0, ...Array.from({length: 12}, (_, i) => [edge(1 - (0.22 * (i + 1)) / 12)[1], (1 - (0.22 * (i + 1)) / 12) * h] as Pt));
  const sd = 'M' + snow.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' L') + 'Z';
  const gullies = Array.from({length: 9}, (_, i) => {
    const x0 = (-0.8 + 0.2 * i + (S() - 0.5) * 0.08) * hw, v0 = 0.35 + S() * 0.35;
    const k0 = Math.pow(1 - v0, 0.9), xa = x0 * k0;
    return `M${xa.toFixed(1)},${(v0 * h).toFixed(1)} L${(xa * 0.35 + 3).toFixed(1)},${(0.8 * h).toFixed(1)} L${(xa * 0.35 - 3).toFixed(1)},${(0.8 * h).toFixed(1)}Z`;
  });
  return (
    <g>
      <defs>
        <linearGradient id="evRock" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#9A9288" /><stop offset="0.5" stopColor="#6E665E" /><stop offset="1" stopColor="#3E3832" /></linearGradient>
        <linearGradient id="evSnow" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#FFFFFF" /><stop offset="1" stopColor="#B8C8D6" /></linearGradient>
      </defs>
      <path d={d} fill="url(#evRock)" />
      {/* rock bands (Everest's pale Yellow Band sits just below the summit pyramid) */}
      <clipPath id="evClip"><path d={d} /></clipPath>
      <g clipPath="url(#evClip)">
        {[0.3].map((v, i) => <path key={i} d={`M${-hw},${v * h} C${-hw * 0.3},${(v + 0.03) * h} ${hw * 0.3},${(v - 0.02) * h} ${hw},${(v + 0.01) * h}`} stroke="#2E2822" strokeOpacity={0.22} strokeWidth={h * 0.025} fill="none" />)}
        <path d={`M${-hw},${0.68 * h} C${-hw * 0.3},${0.7 * h} ${hw * 0.3},${0.66 * h} ${hw},${0.69 * h}`} stroke="#C8B07A" strokeOpacity={0.55} strokeWidth={h * 0.035} fill="none" />
        <path d={`M${-hw * 0.9},0 L0,${h}`} stroke="#F2F4F6" strokeOpacity={0.25} strokeWidth={3} />
        <path d={`M${hw * 0.5},0 L0,${h}`} stroke="#1E1A16" strokeOpacity={0.4} strokeWidth={3} />
        <rect x={0} y={0} width={hw} height={h} fill="#0A0C14" opacity={0.25} />
      </g>
      <path d={sd} fill="url(#evSnow)" />
      <path d={d} fill="none" stroke="#F2F6F8" strokeOpacity={0.5} strokeWidth={1.5} />
    </g>
  );
};
