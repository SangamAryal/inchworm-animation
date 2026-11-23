import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';
import '@fontsource/inter/300.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/ibm-plex-mono/500.css';
import {fbm1} from '../../engine/noise';
import {Sky, SkyFront} from '../../look/Sky';
import {Streak, StreakDefs, StreakKind} from '../../anime/Streaks';

// Short 08: fastest anime characters. Speeds and sources in media/sources.md. Each character is an original
// streak (no likenesses); names are text only. tag: 'show' = said in the show, 'fan' = the fan estimate most
// people quote.
type Char = {id: string; name: string; sub: string; kmh: number; mach?: number; approx?: boolean; tag: 'show' | 'fan'; kind: StreakKind; alt: number; ref: string};
export const CHARS: Char[] = [
  {id: 'zenitsu', name: 'Zenitsu', sub: 'Thunderclap and Flash · Demon Slayer', kmh: 172, tag: 'show', kind: 'thunder', alt: 0, ref: 'Zenitsu'},
  {id: 'punch', name: 'Rocket Punch', sub: 'Mach 2 · Mazinger Z', kmh: 2470, mach: 2, tag: 'show', kind: 'fist', alt: 0.05, ref: 'a Rocket Punch'},
  {id: 'jet', name: 'Jet Scrander', sub: 'Mach 4.5 · Mazinger Z', kmh: 5560, mach: 4.5, tag: 'show', kind: 'jet', alt: 0.12, ref: 'the Jet Scrander'},
  {id: '002', name: 'Jet Link (002)', sub: 'Mach 5 · Cyborg 009', kmh: 6170, mach: 5, tag: 'show', kind: 'ribbon', alt: 0.2, ref: '002'},
  {id: 'killua', name: 'Killua', sub: 'Godspeed · Hunter x Hunter', kmh: 720000, approx: true, tag: 'fan', kind: 'sparks', alt: 0.4, ref: 'Killua'},
  {id: 'saitama', name: 'Saitama', sub: 'Moon-to-Earth jump · One Punch Man', kmh: 72000000, approx: true, tag: 'fan', kind: 'comet', alt: 0.85, ref: 'Saitama'},
  {id: 'goku', name: 'Goku', sub: 'Super Saiyan · Dragon Ball Z', kmh: 540000000, approx: true, tag: 'fan', kind: 'aura', alt: 0.95, ref: 'Goku'},
  {id: 'kizaru', name: 'Kizaru', sub: 'Speed of light · One Piece', kmh: 1079252849, tag: 'show', kind: 'light', alt: 1, ref: 'Kizaru'},
];

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const CREAM = '#F6ECDF', MUTE = '#D9C4B4', ACC = '#F6B985';
const shadow = {filter: 'drop-shadow(0 2px 10px rgba(10,6,20,0.8))'};
const ease = Easing.inOut(Easing.cubic);
const group = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
const fmtRatio = (r: number) => (r < 1.995 ? r.toFixed(2) : r < 10 ? r.toFixed(1) : group(r));

// beat grid as Shorts 06 and 07: 150 BPM, cold open 54 frames, a new character every 144 frames
export const COLD = 54;
const T = {fps: 30, intro: 48, move: 48, hold: 96, end: 150};
const N = CHARS.length;
const arrive = (k: number) => T.intro + T.move + (k - 1) * (T.hold + T.move);
const RUN_END = arrive(N - 1) + T.hold;
const DUR = RUN_END + T.end;
const progress = (f: number) => {
  for (let k = 1; k < N; k++) {
    const a = arrive(k);
    if (f < a - T.move) return k - 1;
    if (f < a) return k - 1 + ease((f - (a - T.move)) / T.move);
  }
  return N - 1;
};
// background speed on screen (px per frame): real speeds span 6 million times, so this squeezes them
// (kmh^0.33) into a 6 to ~1,050 px/frame range, and each character's trail grows with it
const vis = (kmh: number) => 6 * Math.pow(kmh / 172, 0.33);
const at = (p: number, get: (c: Char) => number, geo = false) => {
  const k = Math.floor(p), u = p - k;
  const a = get(CHARS[k]), b = get(CHARS[Math.min(k + 1, N - 1)]);
  return geo ? a * Math.pow(b / a, u) : a + (b - a) * u;
};
const spfAt = (f: number) => (f >= RUN_END ? 0.15 * vis(CHARS[N - 1].kmh) * interpolate(f, [RUN_END, RUN_END + 20], [1, 0.05], clamp) : at(progress(f), (c) => vis(c.kmh), true));
// cumulative background scroll, summed frame by frame (cached)
const BGX: number[] = [];
const bgX = (f: number) => {
  if (BGX.length === 0) { let x = 0; for (let i = 0; i <= DUR + 2; i++) { BGX.push(x); x += spfAt(i); } }
  return BGX[Math.max(0, Math.min(BGX.length - 1, Math.round(f)))];
};
const trailLen = (kmh: number) => Math.min(1500, 110 + 60 * Math.log10(kmh / 100));
const LANES = [990, 1110];

const Tag: React.FC<{tag: 'show' | 'fan'; y: number}> = ({tag, y}) => {
  const text = tag === 'show' ? 'SAID IN THE SHOW' : 'FAN ESTIMATE';
  const w = text.length * 13.5 + 36;
  return (
    <g>
      <rect x={540 - w / 2} y={y - 26} width={w} height={36} rx={18} fill={tag === 'show' ? '#F6B985' : 'none'} stroke="#F6B985" strokeWidth={2} opacity={0.95} />
      <text x={540} y={y - 1} textAnchor="middle" fontFamily="Inter" fontWeight={600} fontSize={18} letterSpacing={2.5} fill={tag === 'show' ? '#2A1A14' : '#F6B985'}>{text}</text>
    </g>
  );
};
const Label: React.FC<{c: Char; opacity: number}> = ({c, opacity}) => (
  <g opacity={opacity} style={shadow}>
    <Tag tag={c.tag} y={1430} />
    <text x={540} y={1500} textAnchor="middle" fontFamily="Inter" fontWeight={600} fontSize={c.name.length > 13 ? 56 : 62} fill={CREAM}>{c.name}</text>
    <text x={540} y={1544} textAnchor="middle" fontFamily="Inter" fontWeight={500} fontSize={22} letterSpacing={2} fill={MUTE}>{c.sub.toUpperCase()}</text>
    <text x={540} y={1622} textAnchor="middle" fontFamily="IBM Plex Mono" fontWeight={500} fontSize={c.kmh > 1e8 ? 54 : 62} fill={ACC}>{c.approx ? '~' : ''}{group(c.kmh)}<tspan fontSize={32} dx={10}>km/h</tspan></text>
    <text x={540} y={1666} textAnchor="middle" fontFamily="IBM Plex Mono" fontWeight={500} fontSize={26} fill={MUTE}>{c.approx ? '~' : ''}{group(c.kmh / 1.609344)} mph</text>
  </g>
);
const Top: React.FC<{big: React.ReactNode; small: string; opacity: number}> = ({big, small, opacity}) => (
  <g opacity={opacity} style={shadow}>
    <text x={540} y={320} textAnchor="middle" fontFamily="Inter" fontWeight={300} fontSize={big && String(big).length > 9 ? 110 : 140} fill={CREAM} letterSpacing={-4}>{big}</text>
    <text x={540} y={388} textAnchor="middle" fontFamily="Inter" fontWeight={500} fontSize={28} letterSpacing={4} fill={CREAM}>{small.toUpperCase()}</text>
  </g>
);

const Scene: React.FC<{f: number; t: number; cold?: boolean}> = ({f, t, cold}) => {
  const p = cold ? N - 1 : progress(Math.min(f, RUN_END));
  const k = Math.floor(p), u = p - k;
  const alt = at(p, (c) => c.alt);
  const spf = cold ? vis(CHARS[N - 1].kmh) * 0.5 : spfAt(f);
  const X = cold ? f * spf : bgX(f);
  const cur = u < 0.5 ? k : k + 1;
  const labOp = (u === 0 ? 1 : Math.abs(u - 0.5) * 2) * (cold ? 0 : interpolate(f, [0, 8], [0, 1], clamp));
  const end = cold ? 0 : interpolate(f, [RUN_END, RUN_END + 18], [0, 1], clamp);
  const jit = (s: number) => 4 * fbm1(t * 3, s);
  // streaks: the current one holds the centre; during a move the newcomer surges in from the left on the
  // other lane and the old one falls back off the left edge
  const streaks: {c: Char; x: number; y: number; len: number; op: number}[] = [];
  const e = u;
  const push = (i: number, x: number, op: number) => {
    if (i < 0 || i >= N || op <= 0.01) return;
    const c = CHARS[i];
    streaks.push({c, x, y: LANES[i % 2] + jit(i), len: trailLen(c.kmh) * (c.kind === 'light' ? 2.2 : 1), op});
  };
  if (cold) {
    // the gold flash crosses the frame in a couple of frames, Zenitsu hangs nearly still beside it
    push(0, 560 + 2 * f, 1);
    push(N - 1, interpolate(f, [6, 12], [-200, 1400], clamp), interpolate(f, [6, 7], [0, 1], clamp));
  } else {
    push(k, 640 - 1500 * Math.pow(e, 1.6), 1 - interpolate(e, [0.7, 1], [0, 1], clamp));
    if (u > 0) push(k + 1, -150 + 790 * Easing.out(Easing.cubic)(e), 1);
  }
  const fade = cold ? 1 : interpolate(f, [DUR - 14, DUR - 1], [1, 0], clamp);
  const flash = !cold && k === N - 1 ? interpolate(f, [arrive(N - 1) - 6, arrive(N - 1), arrive(N - 1) + 14], [0, 0.55, 0], clamp) : cold ? interpolate(f, [6, 9, 20], [0, 0.6, 0], clamp) : 0;
  const silver = end > 0 ? interpolate(f, [RUN_END + 30, RUN_END + 46], [-300, 1500], clamp) : -999;
  return (
    <AbsoluteFill style={{background: '#16121c', opacity: fade}}>
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <StreakDefs />
        <g transform={`translate(${jit(9) * 0.6},${jit(11) * 0.6})`}>
          <Sky bgX={X} spf={spf} alt={alt} t={t} />
          {streaks.map((s) => (
            <g key={s.c.id} transform={`translate(${s.x},${s.y}) scale(${s.c.kind === 'light' ? 1 : 1.6})`} opacity={s.op * (1 - 0.6 * end * (s.c.id === 'kizaru' ? 0 : 1))}><Streak kind={s.c.kind} t={t} len={s.len} /></g>
          ))}
          {silver > -300 && <g transform={`translate(${silver},${LANES[1] - 260}) scale(1.5)`}><Streak kind="silver" t={t} len={900} /></g>}
          <SkyFront bgX={X} spf={spf} alt={alt} />
        </g>
        <rect width={1080} height={1920} fill="#FFF6D8" opacity={flash} />
        <rect y={0} width={1080} height={480} fill="url(#k8Top)" />
        <rect y={1330} width={1080} height={590} fill="url(#k8Bot)" />
        <defs>
          <linearGradient id="k8Top" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#120c1c" stopOpacity="0.55" /><stop offset="1" stopColor="#120c1c" stopOpacity="0" /></linearGradient>
          <linearGradient id="k8Bot" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#120c1c" stopOpacity="0" /><stop offset="0.3" stopColor="#120c1c" stopOpacity="0.5" /><stop offset="1" stopColor="#120c1c" stopOpacity="0.72" /></linearGradient>
        </defs>
        {cold ? (
          <Top big={<>6 million<tspan fill={ACC}>×</tspan></>} small="Faster than Zenitsu?" opacity={interpolate(f, [0, 5], [0, 1], clamp)} />
        ) : (
          <>
            <Label c={CHARS[cur]} opacity={labOp * (1 - end)} />
            {cur === 0 && <Top big="Fastest" small="Anime characters" opacity={labOp} />}
            {cur > 0 && <Top big={<>{fmtRatio(CHARS[cur].kmh / CHARS[cur - 1].kmh)}<tspan fill={ACC}>×</tspan></>} small={`Faster than ${CHARS[cur - 1].ref}`} opacity={labOp * (1 - end)} />}
            {end > 0 && (
              <g opacity={end} style={shadow}>
                <Top big="Faster than light?" small="" opacity={1} />
                <text x={540} y={1480} textAnchor="middle" fontFamily="Inter" fontWeight={600} fontSize={52} fill={CREAM}>Ultra Instinct Goku</text>
                <text x={540} y={1544} textAnchor="middle" fontFamily="Inter" fontWeight={500} fontSize={30} fill={MUTE}>Fans rate him faster than light.</text>
                <text x={540} y={1588} textAnchor="middle" fontFamily="Inter" fontWeight={500} fontSize={30} fill={MUTE}>Nobody agrees by how much.</text>
              </g>
            )}
          </>
        )}
      </svg>
    </AbsoluteFill>
  );
};

const Main: React.FC = () => {
  const f = useCurrentFrame();
  return <Scene f={f} t={(f + COLD) / T.fps} />;
};
const Cold: React.FC = () => {
  const f = useCurrentFrame();
  return <Scene f={f} t={f / T.fps} cold />;
};

export const Short08: React.FC<{audio?: string; only?: 'cold' | 'main'}> = ({audio, only}) => (
  <AbsoluteFill style={{background: '#16121c', filter: 'contrast(1.04)'}}>
    {only !== 'main' && <Sequence durationInFrames={COLD}><Cold /></Sequence>}
    {only !== 'cold' && <Sequence from={only === 'main' ? 0 : COLD}><Main /></Sequence>}
    {audio && <Audio src={staticFile(audio)} />}
  </AbsoluteFill>
);

export const short08Duration = () => COLD + DUR;
