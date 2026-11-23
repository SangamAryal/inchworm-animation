import React from 'react';
import {Pt, poly, smooth} from '../giants/geom';
import {rng} from '../engine/noise';

// Short 09 ships, code-drawn side views facing right, in metres with y up: stern at x = 0, bow at x = L,
// waterline at y = 0 (hulls go below it to their draft). Clear midday light from the upper left, so tops
// and the left of each block are lit. Proportions follow each ship's real profile; details (windows,
// containers, guns) are drawn at their real size, so they read as texture when the ship is far away.

const NS = {vectorEffect: 'non-scaling-stroke' as const};
// a rectangle in metres, y up (x, y = lower-left corner)
const R: React.FC<{x: number; y: number; w: number; h: number; fill: string; o?: number; rx?: number}> = ({x, y, w, h, fill, o, rx}) => (
  <rect x={x} y={-y - h} width={w} height={h} fill={fill} opacity={o} rx={rx} />
);
const L: React.FC<{pts: Pt[]; c: string; w?: number; o?: number}> = ({pts, c, w = 1.2, o = 1}) => (
  <path d={poly(pts, false)} fill="none" stroke={c} strokeWidth={w} strokeOpacity={o} strokeLinecap="round" {...NS} />
);
const lin = (id: string, stops: [number, string, number?][], dir: 'v' | 'h' = 'v') => (
  <linearGradient key={id} id={id} x1="0" y1="0" x2={dir === 'h' ? 1 : 0} y2={dir === 'v' ? 1 : 0}>
    {stops.map(([o, c, a], i) => <stop key={i} offset={o} stopColor={c} stopOpacity={a ?? 1} />)}
  </linearGradient>
);
// soft top light and bottom shade laid over any block
const Shade: React.FC<{d: string}> = ({d}) => (
  <g>
    <path d={d} fill="url(#shForm)" />
  </g>
);

export const ShipDefs: React.FC = () => (
  <defs>
    {lin('shForm', [[0, '#FFFFFF', 0.22], [0.2, '#FFFFFF', 0.04], [0.6, '#000', 0], [1, '#0A1420', 0.28]])}
    {lin('shWood', [[0, '#A87A4E'], [0.5, '#7E5634'], [1, '#4E3420']])}
    {lin('shSail', [[0, '#FBF4E2'], [1, '#D8CBAE']], 'h')}
    {lin('shBlack', [[0, '#3A3E44'], [0.4, '#1C1F24'], [1, '#0C0E12']])}
    {lin('shWhite', [[0, '#FFFFFF'], [1, '#D6DEE4']])}
    {lin('shGrey', [[0, '#9AA4AC'], [0.5, '#7C868E'], [1, '#56606A']])}
    {lin('shRed', [[0, '#B5402E'], [1, '#6E2018']])}
    {lin('shGreen', [[0, '#3F6A52'], [0.5, '#2C5040'], [1, '#1A3428']])}
    {lin('shBlue', [[0, '#2C5C9A'], [1, '#183660']])}
    {lin('shBuff', [[0, '#E8B868'], [1, '#B8843A']], 'h')}
    {lin('shSteel', [[0, '#C8CCD0'], [0.5, '#9AA0A6'], [1, '#6A7076']])}
  </defs>
);

// ------------------------------------------------------------------ you, on a little wooden jetty
export const JETTY_L = 2.4;
export const Jetty: React.FC<{children?: React.ReactNode}> = ({children}) => (
  <g>
    {[0.15, 1.15, 2.15].map((x) => <R key={x} x={x} y={-1.2} w={0.16} h={2.3} fill="#5A3E26" />)}
    <R x={0} y={0.9} w={2.4} h={0.2} fill="url(#shWood)" />
    {[0.4, 0.8, 1.2, 1.6, 2.0].map((x) => <L key={x} pts={[[x, 0.9], [x, 1.1]]} c="#3E2A18" w={0.8} o={0.6} />)}
    <g transform="translate(1.1,-1.1)">{children}</g>
  </g>
);

// ------------------------------------------------------------------ rowboat, 4 m, with oars
export const ROW_L = 4;
export const Rowboat: React.FC<{t: number}> = ({t}) => {
  const a = 0.25 * Math.sin(t * 1.6);
  const hull: Pt[] = [[0.05, 0.55], [0.5, 0.58], [2, 0.5], [3.4, 0.62], [4, 0.9], [3.6, 0.1], [3, -0.2], [1.5, -0.25], [0.3, -0.15], [0, 0.2]];
  return (
    <g>
      <path d={smooth(hull)} fill="url(#shWhite)" />
      <path d={smooth([[0.05, 0.42], [2, 0.36], [3.6, 0.48], [3.96, 0.78], [3.98, 0.66], [3.5, 0.36], [2, 0.26], [0.05, 0.3]])} fill="#2E6E9A" />
      <Shade d={smooth(hull)} />
      <L pts={[[0.05, 0.55], [2, 0.5], [3.4, 0.62], [4, 0.9]]} c="#8A5A34" w={2} />
      <path d={poly([[1.6, 0.5], [2.4 + Math.cos(a) * 1.6, -0.25 + Math.sin(a) * 0.3], [2.5 + Math.cos(a) * 1.6, -0.2 + Math.sin(a) * 0.3], [1.65, 0.56]])} fill="#9A6A40" />
      <R x={1.55} y={0.5} w={0.12} h={0.12} fill="#555" />
    </g>
  );
};

// ------------------------------------------------------------------ Santa María, carrack, ~18 m hull
export const SANTA_L = 18;
export const SantaMaria: React.FC<{t: number}> = ({t}) => {
  const b = 0.25 * Math.sin(t * 1.3);
  const hull: Pt[] = [[0, 5.2], [3.8, 5.2], [4, 3.6], [11.5, 3.2], [12, 4.6], [15.5, 4.8], [18, 5.2], [16.6, 1], [14, -1.8], [5, -2.2], [1, -1.4], [0.2, 1.5]];
  const sail = (x: number, y0: number, w: number, h: number, bulge: number) => (
    <g>
      <path d={smooth([[x - w / 2, y0 + h], [x + w / 2, y0 + h], [x + w / 2 + bulge, y0 + h / 2], [x + w / 2, y0], [x - w / 2, y0], [x - w / 2 + bulge, y0 + h / 2]])} fill="url(#shSail)" />
      <path d={smooth([[x - w / 2, y0 + h], [x + w / 2, y0 + h], [x + w / 2 + bulge, y0 + h / 2], [x + w / 2, y0], [x - w / 2, y0], [x - w / 2 + bulge, y0 + h / 2]])} fill="url(#shForm)" />
    </g>
  );
  return (
    <g>
      {/* masts and rigging */}
      <L pts={[[9, 3], [9, 26]]} c="#4E3420" w={2.4} />
      <L pts={[[14, 4.5], [14.4, 19]]} c="#4E3420" w={2} />
      <L pts={[[3.6, 5], [3.4, 15]]} c="#4E3420" w={1.8} />
      <L pts={[[17, 5], [23, 9]]} c="#4E3420" w={1.6} />
      {[[9, 26, 0.5, 5], [9, 26, 17, 5], [14.4, 19, 22, 8], [3.4, 15, 0.2, 5.2]].map(([x1, y1, x2, y2], i) => <L key={i} pts={[[x1, y1], [x2, y2]]} c="#3A2A1A" w={0.7} o={0.7} />)}
      {sail(9 + b, 8, 10, 11, 0.8)}
      {sail(9.2 + b, 20, 5.4, 4.6, 0.4)}
      {sail(14.3 + b, 9, 7, 8.5, 0.6)}
      <path d={poly([[3.5, 7], [3.5, 14], [8, 7]])} fill="url(#shSail)" />
      {/* red cross of the Castilian crown on the main sail */}
      <path d={`M${9.6 + b},-11 L${9.6 + b},-17 M${7.4 + b},-14 L${11.8 + b},-14`} stroke="#B02A22" strokeWidth={3} {...NS} />
      <path d={smooth(hull)} fill="url(#shWood)" />
      <Shade d={smooth(hull)} />
      {[0.6, 1.6, 2.6].map((y) => <L key={y} pts={[[0.4, y], [16, y + 0.4]]} c="#3A2614" w={1} o={0.6} />)}
      <L pts={[[0, 5.2], [3.8, 5.2], [4, 3.6], [11.5, 3.2], [12, 4.6], [15.5, 4.8], [18, 5.2]]} c="#D8B07A" w={1.4} o={0.7} />
    </g>
  );
};

// ------------------------------------------------------------------ HMS Victory, 69 m overall (with bowsprit)
export const VICTORY_L = 69.3;
export const Victory: React.FC = () => {
  const hull: Pt[] = [[2, 16], [5, 16.5], [8, 13.5], [40, 12.5], [50, 13], [56, 14.5], [58, 13], [57, 6], [54, 0], [50, -6.5], [10, -6.5], [4, -4], [1.5, 4], [1, 12]];
  const mast = (x: number, top: number, yards: [number, number][]) => (
    <g>
      <L pts={[[x, 12], [x, top]]} c="#6E4A2A" w={3} />
      {yards.map(([y, w], i) => <L key={i} pts={[[x - w / 2, y], [x + w / 2, y]]} c="#3A2614" w={1.8} />)}
      {yards.map(([y, w], i) => <path key={'s' + i} d={smooth([[x - w / 2, y - 0.3], [x + w / 2, y - 0.3], [x + w / 2 - 0.5, y - 1.6], [x - w / 2 + 0.5, y - 1.6]])} fill="#E8DFC8" />)}
    </g>
  );
  return (
    <g>
      {/* rigging first, behind the masts */}
      {[[18, 52, 3, 15], [18, 52, 40, 13], [35, 62, 22, 13], [35, 62, 54, 14], [50, 55, 42, 13], [50, 55, 66, 20], [66, 20, 35, 62]].map(([x1, y1, x2, y2], i) => <L key={i} pts={[[x1, y1], [x2, y2]]} c="#2A1E14" w={0.8} o={0.6} />)}
      {mast(18, 52, [[24, 18], [36, 14], [46, 9]])}
      {mast(35, 62, [[26, 26], [41, 21], [53, 13], [59, 8]])}
      {mast(50, 55, [[25, 22], [38, 18], [48, 11]])}
      <L pts={[[55, 15], [69.3, 21]]} c="#6E4A2A" w={2.4} />
      <path d={smooth(hull)} fill="url(#shBlack)" />
      {/* Nelson chequer: yellow-ochre bands along the gun decks, black port lids */}
      {[3.2, 6.6, 9.6].map((y, k) => (
        <g key={y}>
          <path d={poly([[3, y], [56, y + 0.3], [56, y + 1.9], [3, y + 1.6]])} fill="#D8A64A" />
          {Array.from({length: 15 - k}, (_, i) => <R key={i} x={8 + i * 3.1 + k * 1.2} y={y + 0.4} w={1.1} h={1} fill="#1A1A1A" />)}
        </g>
      ))}
      <R x={1.5} y={12} w={6} h={3.4} fill="#D8A64A" o={0.85} />
      {[2.2, 3.6, 5].map((x) => <R key={x} x={x} y={12.6} w={0.9} h={2} fill="#3A4A5A" />)}
      <path d={smooth([[50, -6.5], [54, 0], [57, 6], [58, 13], [56, 14.5], [55, 10], [53, 2], [49, -3]])} fill="#2A2A2E" />
      <Shade d={smooth(hull)} />
      <path d={poly([[3, -1], [52, -1], [50, -6.5], [10, -6.5], [4, -4]])} fill="#B87A3A" opacity={0.7} />
    </g>
  );
};

// ------------------------------------------------------------------ Titanic, 269 m
export const TITANIC_L = 269.1;
export const Titanic: React.FC = () => {
  const hull: Pt[] = [[0, 15], [6, 18.5], [262, 19.5], [269.1, 21], [266, 4], [262, -10.5], [14, -10.5], [4, -6], [0.5, 4]];
  const funnel = (x: number, dummy = false) => (
    <g key={x}>
      <path d={poly([[x, 28], [x + 12, 28], [x + 18, 52], [x + 6, 52]])} fill="url(#shBuff)" />
      <path d={poly([[x + 15.3, 45], [x + 18, 52], [x + 6, 52], [x + 4, 45]])} fill="#1A1A1A" />
      <path d={poly([[x, 28], [x + 12, 28], [x + 18, 52], [x + 6, 52]])} fill="url(#shForm)" />
      {!dummy && <path d={`M${x + 12},-56 q8,-10 2,-22 q-6,-8 4,-16`} fill="none" stroke="#C8C8C8" strokeOpacity={0.25} strokeWidth={6} {...NS} />}
    </g>
  );
  return (
    <g>
      <L pts={[[40, 26], [36, 62]]} c="#5A4A3A" w={2} />
      <L pts={[[218, 24], [222, 64]]} c="#5A4A3A" w={2} />
      <L pts={[[36, 62], [222, 64]]} c="#3A3A3A" w={0.8} o={0.6} />
      {/* white superstructure decks */}
      <path d={poly([[30, 19], [228, 19.5], [226, 26], [190, 26], [190, 28], [44, 28], [44, 26], [30, 25]])} fill="url(#shWhite)" />
      <R x={190} y={26} w={14} h={4.5} fill="#F2F4F4" />
      {Array.from({length: 46}, (_, i) => <R key={i} x={34 + i * 4.2} y={21} w={1.6} h={1.6} fill="#2A3440" />)}
      {Array.from({length: 16}, (_, i) => <R key={'b' + i} x={50 + i * 9.5} y={28} w={6} h={1.6} fill="#E8ECEE" />)}
      {[62, 104, 146, 188].map((x, i) => funnel(x, i === 3))}
      <path d={smooth(hull)} fill="url(#shBlack)" />
      <path d={poly([[6, 18.4], [262, 19.4], [262, 19.9], [6, 18.9]])} fill="#F4F0E6" />
      {[16, 13.6, 11.2].map((y) => Array.from({length: 64}, (_, i) => <circle key={y + '-' + i} cx={14 + i * 3.8} cy={-y} r={0.45} fill="#C8C2A8" opacity={0.7} />))}
      <path d={poly([[3, -1.5], [264, -1.5], [262, -10.5], [14, -10.5], [4, -6]])} fill="url(#shRed)" />
      <path d={poly([[3, -0.4], [264, -0.4], [264, -1.6], [3, -1.6]])} fill="#F4F0E6" opacity={0.9} />
      <Shade d={smooth(hull)} />
    </g>
  );
};

// ------------------------------------------------------------------ USS Gerald R. Ford (CVN-78), 337 m
export const FORD_L = 337;
export const Ford: React.FC = () => {
  const hull: Pt[] = [[0, 19], [337, 20.5], [330, 8], [318, -12], [20, -12], [6, -8], [2, 6]];
  const jet = (x: number, k: number) => (
    <g key={x} transform={`translate(${x},${-20.8}) scale(${k},1)`}>
      <path d={poly([[0, 0], [16, 0], [18, 1.4], [6, 2.2], [2, 4.6], [0, 4.2]].map(([a, b]) => [a, b] as Pt))} fill="#8A949C" transform="scale(1,-1)" />
    </g>
  );
  return (
    <g>
      {/* flight deck overhang and the island with its mast and radar faces */}
      <path d={poly([[-4, 19.5], [341, 21], [339, 23.5], [-6, 22]])} fill="url(#shGrey)" />
      <path d={poly([[196, 23], [226, 23.5], [224, 40], [214, 46], [200, 46], [197, 40]])} fill="url(#shGrey)" />
      <path d={poly([[196, 23], [226, 23.5], [224, 40], [214, 46], [200, 46], [197, 40]])} fill="url(#shForm)" />
      <path d={poly([[202, 36], [210, 36], [209, 42], [203, 42]])} fill="#5A646C" />
      <L pts={[[208, 46], [208, 62]]} c="#5A646C" w={2.4} />
      <L pts={[[203, 56], [213, 56]]} c="#5A646C" w={1.6} />
      {Array.from({length: 6}, (_, i) => <R key={i} x={200 + i * 3.6} y={42.5} w={2} h={1} fill="#1E2A34" />)}
      {[30, 70, 110, 150, 250, 290].map((x, i) => jet(x, i % 2 ? 1 : -1))}
      <path d={smooth(hull)} fill="url(#shGrey)" />
      <Shade d={smooth(hull)} />
      {[60, 110, 160, 240, 280].map((x) => <R key={x} x={x} y={10} w={14} h={7} fill="#3A444C" o={0.8} />)}
      <text x={318} y={-12} fontFamily="Inter" fontWeight={700} fontSize={9} fill="#F4F6F6" opacity={0.85}>78</text>
      <path d={poly([[3, -1.5], [333, -1.5], [318, -12], [20, -12], [6, -8]])} fill="url(#shRed)" opacity={0.95} />
    </g>
  );
};

// ------------------------------------------------------------------ Icon of the Seas, 365 m
export const ICON_L = 364.75;
export const Icon: React.FC = () => {
  const hull: Pt[] = [[0, 14], [350, 15], [364.75, 17], [360, 4], [352, -9], [14, -9], [3, -4]];
  const top: Pt[] = [[14, 12], [345, 14], [356, 30], [352, 56], [340, 62], [40, 62], [22, 58], [12, 40]];
  const R1 = rng(5);
  return (
    <g>
      <path d={poly(top)} fill="url(#shWhite)" />
      {/* rows of balconies */}
      {Array.from({length: 11}, (_, r) => <R key={r} x={22} y={17 + r * 3.6} w={326 - r * 1.5} h={1.5} fill="#3C5C78" o={0.85} />)}
      {Array.from({length: 11}, (_, r) => <R key={'g' + r} x={22} y={17 + r * 3.6 + 1.5} w={326 - r * 1.5} h={0.35} fill="#AFC4D4" o={0.8} />)}
      {/* the glass dome at the bow and the waterpark up top */}
      <path d={smooth([[300, 62], [312, 72], [330, 74], [346, 66], [350, 58], [300, 58]])} fill="#8FC8E8" opacity={0.85} />
      <path d={smooth([[300, 62], [312, 72], [330, 74], [346, 66], [350, 58], [300, 58]])} fill="url(#shForm)" />
      {Array.from({length: 7}, (_, i) => {
        const x = 60 + i * 22, c = ['#F2A23A', '#E44A6A', '#3AB8E0', '#F2D23A', '#6AD07A'][i % 5];
        return <path key={i} d={`M${x},-62 C${x + 6},${-74 - R1() * 6} ${x + 14},${-70 - R1() * 4} ${x + 18},-62`} fill="none" stroke={c} strokeWidth={3} {...NS} />;
      })}
      <path d={poly([[140, 62], [176, 62], [174, 76], [144, 76]])} fill="url(#shWhite)" />
      <path d={poly([[144, 76], [174, 76], [170, 82], [148, 82]])} fill="#1E3C6A" />
      <path d={smooth(hull)} fill="#1E3C6A" />
      <path d={poly([[4, 6], [356, 7], [360, 10], [4, 9]])} fill="#2E7AC0" />
      <Shade d={smooth(top)} />
      <Shade d={smooth(hull)} />
      {Array.from({length: 18}, (_, i) => <R key={i} x={26 + i * 18} y={8.8} w={10} h={3} fill="#F2A23A" o={0.85} rx={1} />)}
    </g>
  );
};

// ------------------------------------------------------------------ Ever Alot, 400 m container ship
export const EVER_L = 399.99;
export const ContainerShip: React.FC = () => {
  const hull: Pt[] = [[0, 16], [12, 16.5], [388, 17], [399.99, 20], [395, 4], [386, -16], [18, -16], [4, -10], [1, 4]];
  const C = rng(11);
  const cols = ['#B5402E', '#2F6EA8', '#E0A63A', '#3E8A5A', '#C8CCD0', '#7A4A8A', '#D86A2A', '#4A5A6A'];
  const bays: React.ReactElement[] = [];
  for (let x = 22; x < 380; x += 12.4) {
    if (x > 274 && x < 300) continue; // bridge house
    if (x > 40 && x < 54) continue; // engine casing and funnel
    const h = x < 40 ? 4 : x > 360 ? 6 : 9 + Math.floor(C() * 2);
    for (let k = 0; k < h; k++) bays.push(<R key={x + '-' + k} x={x} y={17 + k * 2.6} w={12} h={2.5} fill={cols[Math.floor(C() * cols.length)]} />);
  }
  return (
    <g>
      {bays}
      {/* bridge house well forward, engine casing and funnel aft */}
      <path d={poly([[276, 17], [298, 17], [298, 62], [272, 62], [272, 58], [276, 58]])} fill="url(#shWhite)" />
      {Array.from({length: 13}, (_, i) => <R key={i} x={278} y={21 + i * 3.1} w={18} h={1.2} fill="#3A4C5C" o={0.85} />)}
      <R x={266} y={60} w={38} h={2.2} fill="#E8ECEE" />
      <path d={poly([[41, 17], [53, 17], [53, 44], [42, 44]])} fill="url(#shWhite)" />
      <path d={poly([[44, 44], [52, 44], [52, 52], [45, 52]])} fill="#2C5040" />
      <path d={smooth(hull)} fill="url(#shGreen)" />
      <path d={poly([[3, -2], [391, -2], [386, -16], [18, -16], [4, -10]])} fill="url(#shRed)" />
      <path d={poly([[3, -0.6], [392, -0.6], [392, -2], [3, -2]])} fill="#F2F2EE" opacity={0.85} />
      <Shade d={smooth(hull)} />
    </g>
  );
};

// ------------------------------------------------------------------ Seawise Giant, 458 m supertanker
export const SEAWISE_L = 458.45;
export const Tanker: React.FC = () => {
  const hull: Pt[] = [[0, 8], [10, 9], [440, 9.5], [458.45, 11], [452, 0], [440, -24.6], [16, -24.6], [4, -18], [1, -4]];
  return (
    <g>
      {/* deck pipework, catwalk and the accommodation block with funnel at the stern */}
      <L pts={[[40, 11], [440, 11.5]]} c="#7A7E82" w={1.6} />
      <L pts={[[40, 12.4], [440, 12.9]]} c="#9AA0A6" w={1} />
      {Array.from({length: 18}, (_, i) => <R key={i} x={60 + i * 21} y={9.5} w={2.2} h={3.4} fill="#6A7076" />)}
      <path d={poly([[10, 9], [46, 9], [46, 34], [40, 40], [16, 40], [12, 34]])} fill="url(#shWhite)" />
      {Array.from({length: 7}, (_, i) => <R key={i} x={14} y={12 + i * 3.6} w={30} h={1.3} fill="#3A4C5C" o={0.85} />)}
      <R x={8} y={38} w={40} h={2} fill="#E8ECEE" />
      <path d={poly([[20, 40], [32, 40], [30, 54], [22, 54]])} fill="#2A3A4A" />
      <path d={poly([[20, 50], [30.6, 50], [30, 54], [22, 54]])} fill="#1A1A1A" />
      <path d={smooth(hull)} fill="url(#shBlack)" />
      <path d={poly([[2, -2], [449, -2], [440, -24.6], [16, -24.6], [4, -18]])} fill="url(#shRed)" />
      <Shade d={smooth(hull)} />
    </g>
  );
};

// ------------------------------------------------------------------ Prelude FLNG, 488 m floating gas plant
export const PRELUDE_L = 488;
export const Prelude: React.FC = () => {
  const hull: Pt[] = [[0, 20], [488, 20], [488, -20], [0, -20]];
  const P = rng(23);
  const mods: React.ReactElement[] = [];
  for (let x = 70; x < 420; x += 26) {
    const h = 16 + P() * 22;
    mods.push(
      <g key={x}>
        <R x={x} y={20} w={22} h={h} fill="url(#shSteel)" />
        {[0.3, 0.6].map((u) => <L key={u} pts={[[x, 20 + h * u], [x + 22, 20 + h * u]]} c="#5A6068" w={0.8} o={0.7} />)}
        {P() > 0.5 && <R x={x + 6} y={20 + h} w={4} h={10 + P() * 18} fill="#B8BEC4" />}
        {P() > 0.6 && <R x={x + 14} y={20 + h} w={6} h={6} fill="#E0A63A" />}
      </g>,
    );
  }
  return (
    <g>
      {/* flare tower at the bow, turret, process modules, living quarters at the stern */}
      <path d={poly([[452, 20], [460, 20], [458, 120], [455, 120]])} fill="#8A9096" />
      {Array.from({length: 10}, (_, i) => <L key={i} pts={[[452 + (i % 2) * 8, 20 + i * 10], [460 - (i % 2) * 8, 30 + i * 10]]} c="#6A7076" w={0.8} />)}
      <circle cx={456.5} cy={-123} r={2.4} fill="#FFB050" opacity={0.9} />
      <R x={420} y={20} w={26} h={30} fill="url(#shGrey)" />
      {mods}
      <path d={poly([[6, 20], [56, 20], [56, 58], [10, 58]])} fill="url(#shWhite)" />
      {Array.from({length: 9}, (_, i) => <R key={i} x={10} y={24 + i * 3.6} w={42} h={1.3} fill="#3A4C5C" o={0.85} />)}
      <path d={poly([[20, 58], [44, 58], [44, 62], [20, 62]])} fill="#E8ECEE" />
      <circle cx={32} cy={-64} r={4} fill="none" stroke="#E0A63A" strokeWidth={1.2} {...NS} />
      <path d={poly(hull)} fill="url(#shGrey)" />
      <path d={poly([[0, -2], [488, -2], [488, -20], [0, -20]])} fill="url(#shRed)" />
      <Shade d={poly(hull)} />
    </g>
  );
};

// ------------------------------------------------------------------ Eiffel Tower, 330 m (cold open only)
export const Eiffel: React.FC = () => {
  // centred on x = 0, base on y = 0; tapering legs, three platforms, the lattice suggested by cross lines
  const leg = (s: number): Pt[] => [[s * 62, 0], [s * 40, 0], [s * 22, 57], [s * 14, 115], [s * 5, 276], [s * 3.5, 276], [s * 9, 115], [s * 12, 57], [s * 26, 0]];
  const L1 = leg(1), L2 = leg(-1);
  return (
    <g>
      <path d={poly(L1)} fill="#6E5A48" />
      <path d={poly(L2)} fill="#8A7460" />
      <path d={smooth([[-40, 0], [-30, 30], [0, 42], [30, 30], [40, 0], [26, 0], [18, 24], [0, 32], [-18, 24], [-26, 0]])} fill="#7A6654" />
      <R x={-30} y={57} w={60} h={4} fill="#5E4C3C" />
      <R x={-17} y={115} w={34} h={3.4} fill="#5E4C3C" />
      <R x={-6} y={276} w={12} h={4} fill="#5E4C3C" />
      <path d={poly([[-3, 280], [3, 280], [1.2, 330], [-1.2, 330]])} fill="#6E5A48" />
      {Array.from({length: 18}, (_, i) => {
        const y = 4 + i * 15, w = 40 - (y / 276) * 34;
        return <L key={i} pts={[[-w, y], [w, y + 12]]} c="#4A3A2C" w={0.7} o={0.5} />;
      })}
    </g>
  );
};
