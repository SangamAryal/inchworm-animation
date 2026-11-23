import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';
import '@fontsource/inter/300.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/ibm-plex-mono/500.css';
import {fbm1, rng} from '../../engine/noise';
import {cumulus} from '../../look/DaySky';
import {GiantDefs, Human} from '../../giants/Animals';
import {fmtFt} from '../short03/Short03';
import {ContainerShip, Eiffel, Ford, Icon, Jetty, Prelude, Rowboat, SantaMaria, ShipDefs, Tanker, Titanic, Victory} from '../../ships/Ships';

// Short 09: biggest ships ever, to scale (length overall). Sources in media/sources.md.
type Ship = {id: string; name: string; kind: string; m: number; L: number; H: number; approx?: boolean; ref: string};
const SHIPS: Ship[] = [
  {id: 'you', name: 'You', kind: 'You are here', m: 1.7, L: 2.4, H: 2.9, ref: 'you'},
  {id: 'row', name: 'Rowboat', kind: 'Small rowing boat', m: 4, L: 4, H: 1.2, approx: true, ref: 'a rowboat'},
  {id: 'santa', name: 'Santa María', kind: "Columbus's ship · 1492", m: 18, L: 23, H: 26, approx: true, ref: 'the Santa María'},
  {id: 'victory', name: 'HMS Victory', kind: 'Launched 1765 · still afloat', m: 69.3, L: 69.3, H: 62, ref: 'HMS Victory'},
  {id: 'titanic', name: 'Titanic', kind: 'Biggest ship of 1912', m: 269.1, L: 269.1, H: 64, ref: 'the Titanic'},
  {id: 'ford', name: 'USS Gerald R. Ford', kind: 'Biggest warship ever', m: 337, L: 341, H: 62, ref: 'the USS Ford'},
  {id: 'icon', name: 'Icon of the Seas', kind: 'Biggest cruise ship', m: 364.75, L: 364.75, H: 82, ref: 'Icon of the Seas'},
  {id: 'ever', name: 'Ever Alot', kind: 'Biggest container ship', m: 399.99, L: 399.99, H: 62, ref: 'Ever Alot'},
  {id: 'seawise', name: 'Seawise Giant', kind: 'Longest ship ever built', m: 458.45, L: 458.45, H: 54, ref: 'Seawise Giant'},
  {id: 'prelude', name: 'Prelude FLNG', kind: 'Biggest floating object ever', m: 488, L: 488, H: 124, ref: 'Seawise Giant'},
];

const Draw: React.FC<{id: string; t: number}> = ({id, t}) => {
  switch (id) {
    case 'you': return <Jetty><g transform="translate(-0.17,0)"><Human t={t} /></g></Jetty>;
    case 'row': return <Rowboat t={t} />;
    case 'santa': return <SantaMaria t={t} />;
    case 'victory': return <Victory />;
    case 'titanic': return <Titanic />;
    case 'ford': return <Ford />;
    case 'icon': return <Icon />;
    case 'ever': return <ContainerShip />;
    case 'seawise': return <Tanker />;
    case 'prelude': return <Prelude />;
    default: return null;
  }
};

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const CREAM = '#F6ECDF', MUTE = '#D9C4B4', ACC = '#F6B985';
const shadow = {filter: 'drop-shadow(0 2px 10px rgba(8,18,34,0.75))'};
const ease = Easing.inOut(Easing.cubic);
const group = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
const fmtM = (g: Ship) => `${g.approx ? '~' : ''}${g.m < 10 ? g.m.toFixed(1) : g.m >= 100 ? group(g.m) : (Math.round(g.m * 10) / 10).toString()}`;

export const COLD = 54;
const T = {fps: 30, intro: 48, move: 48, hold: 96, outro: 120};
const N = SHIPS.length;
const WY = 1150; // waterline on screen
const LABEL_Y = 1560;
const arrive = (k: number) => T.intro + T.move + (k - 1) * (T.hold + T.move);
const DUR = arrive(N - 1) + T.hold + T.outro;
const progress = (f: number) => {
  for (let k = 1; k < N; k++) {
    const a = arrive(k);
    if (f < a - T.move) return k - 1;
    if (f < a) return k - 1 + ease((f - (a - T.move)) / T.move);
  }
  return N - 1;
};
// px per metre while ship i is highlighted: about 640 px long, but tall ships are kept under 720 px high
const pairScale = (i: number) => (i === 0 ? 380 / 1.75 : Math.min((i >= 4 ? 880 : 680) / SHIPS[i].L, 720 / SHIPS[i].H));

// ---------------------------------------------------------------- clear day at sea
const PAL = ['#2C6FC2', '#3F86D3', '#62A2E0', '#8DBDEA', '#BCD8F0', '#E4EEF2'];
const OFF = [0, 0.3, 0.55, 0.75, 0.92, 1];
const Sea: React.FC<{wy: number; t: number; pan: number}> = ({wy, t, pan}) => {
  const hz = wy - 80;
  const wrap = (x: number, w: number) => ((x % w) + w) % w;
  const G = rng(31);
  const clouds = Array.from({length: 8}, (_, i) => ({x: G() * 1600, y: 520 + G() * Math.max(60, hz - 700), w: 170 + G() * 280, seed: 300 + i * 37, par: 0.03 + G() * 0.05}));
  const W = rng(8);
  const waves = Array.from({length: 90}, () => ({x: W() * 1400, y: hz + 6 + Math.pow(W(), 1.6) * (1920 - hz), w: 10 + W() * 40}));
  return (
    <g>
      <defs>
        <linearGradient id="s9Sky" x1="0" y1="0" x2="0" y2="1">{PAL.map((c, i) => <stop key={i} offset={OFF[i]} stopColor={c} />)}</linearGradient>
        <radialGradient id="s9Sun" cx="0.12" cy="0.1" r="0.6"><stop offset="0" stopColor="#FFF8E6" stopOpacity="0.85" /><stop offset="1" stopColor="#FFF8E6" stopOpacity="0" /></radialGradient>
        <linearGradient id="s9Sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7DB4D2" /><stop offset="0.12" stopColor="#3E8EBC" /><stop offset="0.5" stopColor="#1F6A9C" /><stop offset="1" stopColor="#0F4470" /></linearGradient>
        <filter id="dsCloudEdge" x="-5%" y="-10%" width="110%" height="120%"><feGaussianBlur stdDeviation="1.6" /></filter>
      </defs>
      <rect width={1080} height={hz + 4} fill="url(#s9Sky)" />
      <rect width={1080} height={hz} fill="url(#s9Sun)" />
      {clouds.map((c, i) => cumulus({x: wrap(c.x - pan * c.par - t * 4, 1600) - 250, y: c.y, w: c.w, h: c.w * 0.38, seed: c.seed}, `s9c${i}`, 1, 0.95, 0.15))}
      <rect y={hz} width={1080} height={1920 - hz} fill="url(#s9Sea)" />
      <rect y={hz} width={1080} height={3} fill="#E4F2F8" opacity={0.7} />
      {waves.map((w, i) => {
        const k = 0.4 + (w.y - hz) / 500, x = wrap(w.x - pan * (0.1 + (w.y - hz) / 1200) + 6 * Math.sin(t + i), 1400) - 160;
        return <path key={i} d={`M${x},${w.y} q${w.w * k / 2},${-3 * k} ${w.w * k},0`} stroke="#DDF2FA" strokeOpacity={0.35} strokeWidth={1.5} fill="none" />;
      })}
    </g>
  );
};
// water in front of the hulls so they sit in the sea, and foam along the waterline
const SeaFront: React.FC<{wy: number; t: number; spans: [number, number][]}> = ({wy, t, spans}) => (
  <g>
    <defs><linearGradient id="s9Haze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3E8EBC" stopOpacity="0.55" /><stop offset="0.3" stopColor="#1F6A9C" stopOpacity="0.85" /><stop offset="1" stopColor="#0F4470" stopOpacity="1" /></linearGradient></defs>
    <rect y={wy + 2} width={1080} height={1920 - wy} fill="url(#s9Haze)" />
    {spans.map(([a, b], i) => {
      let d = `M${a - 10},${wy}`;
      for (let x = a - 10; x <= b + 14; x += 12) d += ` L${x},${(wy + 2 * Math.sin(x / 9 + t * 4)).toFixed(1)}`;
      return <path key={i} d={d} stroke="#FFFFFF" strokeOpacity={0.85} strokeWidth={3} fill="none" />;
    })}
  </g>
);

const CenterLabel: React.FC<{g: Ship; opacity: number}> = ({g, opacity}) => (
  <g opacity={opacity} style={shadow}>
    <text x={540} y={LABEL_Y} textAnchor="middle" fontFamily="Inter" fontWeight={500} fontSize={22} letterSpacing={3.5} fill={MUTE}>{g.kind.toUpperCase()}</text>
    <text x={540} y={LABEL_Y + 62} textAnchor="middle" fontFamily="Inter" fontWeight={600} fontSize={g.name.length > 15 ? 52 : 60} fill={CREAM}>{g.name}</text>
    <text x={540} y={LABEL_Y + 128} textAnchor="middle" fontFamily="IBM Plex Mono" fontWeight={500} fontSize={54} fill={ACC}>{fmtM(g)}<tspan fontSize={30} dx={10}>m</tspan><tspan fontSize={26} fill={MUTE} dx={18}>{g.approx ? '~' : ''}{fmtFt(g.m)}</tspan></text>
  </g>
);
const Top: React.FC<{big: React.ReactNode; small: string; opacity: number}> = ({big, small, opacity}) => (
  <g opacity={opacity} style={shadow}>
    <text x={540} y={330} textAnchor="middle" fontFamily="Inter" fontWeight={300} fontSize={140} fill={CREAM} letterSpacing={-4}>{big}</text>
    <text x={540} y={398} textAnchor="middle" fontFamily="Inter" fontWeight={500} fontSize={28} letterSpacing={4} fill={CREAM}>{small.toUpperCase()}</text>
  </g>
);
const ScaleBar: React.FC<{s: number; opacity: number}> = ({s, opacity}) => {
  const m = [0.5, 1, 2, 5, 10, 20, 50, 100].find((v) => v * s >= 120) ?? 100;
  const len = m * s;
  return (
    <g opacity={opacity * 0.85}>
      <text x={540} y={1800} textAnchor="middle" fontFamily="IBM Plex Mono" fontWeight={500} fontSize={24} fill={CREAM}>{m} m</text>
      <line x1={540 - len / 2} x2={540 + len / 2} y1={1822} y2={1822} stroke={CREAM} strokeWidth={2} />
      <line x1={540 - len / 2} x2={540 - len / 2} y1={1812} y2={1832} stroke={CREAM} strokeWidth={2} />
      <line x1={540 + len / 2} x2={540 + len / 2} y1={1812} y2={1832} stroke={CREAM} strokeWidth={2} />
    </g>
  );
};

const Main: React.FC = () => {
  const f = useCurrentFrame();
  const t = (f + COLD) / T.fps;
  const p = progress(f), k = Math.floor(p), u = p - k;
  const sA = pairScale(k), sB = pairScale(Math.min(k + 1, N - 1));
  const s = u > 0 ? sA * Math.pow(sB / sA, u) : sA;
  const sway = {x: 3 * fbm1(f / 80, 1), y: 2 * fbm1(f / 95, 3)};
  // all ships in one row in world metres; the camera keeps the highlighted one centred, the previous on its left
  const X: number[] = [];
  SHIPS.forEach((g, i) => X.push(i === 0 ? 0 : X[i - 1] + SHIPS[i - 1].L + Math.max(0.6, 0.06 * g.L)));
  const ctr = (i: number) => X[i] + SHIPS[i].L / 2;
  const camX = u > 0 && k + 1 < N ? ctr(k) + (ctr(k + 1) - ctr(k)) * u : ctr(k);
  const bob = (i: number) => 0.4 * Math.sin(t * 1.2 + i) * Math.min(1, 4 / SHIPS[i].L);
  const show = SHIPS.map((g, i) => ({g, i, x: 540 + (X[i] - camX) * s})).filter((o) => o.x + o.g.L * s > -40 && o.x < 1120);
  const cur = u < 0.5 ? k : k + 1;
  const curG = SHIPS[cur];
  const labOp = u === 0 ? 1 : Math.abs(u - 0.5) * 2;
  const endFade = interpolate(f, [DUR - 12, DUR - 1], [1, 0], clamp);
  return (
    <AbsoluteFill style={{background: '#16141c', opacity: endFade}}>
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <GiantDefs />
        <ShipDefs />
        <g transform={`translate(${sway.x},${sway.y})`}>
          <Sea wy={WY} t={t} pan={p * 300} />
          {show.slice().reverse().map(({g, i, x}) => (
            <g key={g.id} transform={`translate(${x},${WY - bob(i) * s}) scale(${s})`}><Draw id={g.id} t={t + i} /></g>
          ))}
          <SeaFront wy={WY} t={t} spans={show.filter((o) => o.g.id !== 'you').map((o) => [o.x, o.x + o.g.L * s] as [number, number])} />
        </g>
        <rect y={0} width={1080} height={520} fill="url(#s9Top)" />
        <defs><linearGradient id="s9Top" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0c2238" stopOpacity="0.55" /><stop offset="1" stopColor="#0c2238" stopOpacity="0" /></linearGradient></defs>
        <CenterLabel g={curG} opacity={labOp} />
        {cur === 0 && <Top big="Biggest ships" small="Ever built, to scale" opacity={labOp * interpolate(f, [0, 10], [0, 1], clamp)} />}
        <ScaleBar s={s} opacity={interpolate(f, [10, 30], [0, 1], clamp)} />
      </svg>
    </AbsoluteFill>
  );
};

// Cold open: Seawise Giant tips up onto its stern beside the Eiffel Tower and stands taller than it.
const Cold: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / T.fps, s = 2.35, wy = 1560;
  const tip = interpolate(f, [2, 30], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const textOp = interpolate(f, [0, 6], [0, 1], clamp);
  return (
    <AbsoluteFill style={{background: '#16141c'}}>
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <ShipDefs />
        <Sea wy={wy} t={t} pan={0} />
        {/* a strip of quay on the left for the tower */}
        <path d={`M-10,${wy - 30} L520,${wy - 30} L540,${wy} L-10,${wy}Z`} fill="#B8AE9A" />
        <rect x={-10} y={wy - 34} width={530} height={6} fill="#D8D0C0" />
        <g transform={`translate(270,${wy - 34}) scale(${s})`}><Eiffel /></g>
        <g transform={`translate(${720 + 200 * (1 - tip)},${wy}) rotate(${-90 * tip}) scale(${s})`}><Tanker /></g>
        <SeaFront wy={wy} t={t} spans={[[600, 1080]]} />
        <rect y={0} width={1080} height={520} fill="url(#s9TopC)" />
        <defs><linearGradient id="s9TopC" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0c2238" stopOpacity="0.6" /><stop offset="1" stopColor="#0c2238" stopOpacity="0" /></linearGradient></defs>
        <g opacity={textOp} style={shadow}>
          <text x={540} y={190} textAnchor="middle" fontFamily="Inter" fontWeight={600} fontSize={86} fill={CREAM}>Taller than the</text>
          <text x={540} y={290} textAnchor="middle" fontFamily="Inter" fontWeight={600} fontSize={86} fill={CREAM}>Eiffel Tower<tspan fill={ACC}>?</tspan></text>
          <text x={540} y={350} textAnchor="middle" fontFamily="Inter" fontWeight={500} fontSize={28} letterSpacing={4} fill={CREAM}>A SHIP, STOOD ON ITS END</text>
        </g>
        <g opacity={interpolate(f, [26, 34], [0, 1], clamp)} style={shadow}>
          <text x={270} y={wy - 34 - 330 * s - 22} textAnchor="middle" fontFamily="IBM Plex Mono" fontWeight={500} fontSize={34} fill={CREAM}>330 m</text>
          <text x={650} y={wy - 458 * s + 30} textAnchor="end" fontFamily="IBM Plex Mono" fontWeight={500} fontSize={34} fill={CREAM}>458 m</text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

export const Short09: React.FC<{audio?: string; only?: 'cold' | 'main'}> = ({audio, only}) => (
  <AbsoluteFill style={{background: '#16141c', filter: 'contrast(1.04)'}}>
    {only !== 'main' && <Sequence durationInFrames={COLD}><Cold /></Sequence>}
    {only !== 'cold' && <Sequence from={only === 'main' ? 0 : COLD}><Main /></Sequence>}
    {audio && <Audio src={staticFile(audio)} />}
  </AbsoluteFill>
);

export const short09Duration = () => COLD + DUR;
