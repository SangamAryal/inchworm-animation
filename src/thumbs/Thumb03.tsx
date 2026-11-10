import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Background, FLOOR} from '../videos/short03/Short03';
import {TallDefs, TallObject} from '../videos/short03/objects';

// Thumbnail and Shorts cover for Short 03, drawn from the video's own scene.
// Hook: Everest next to the Burj Khalifa, both at true scale (Everest is 11x taller).
const CREAM = '#F4E9DC', MUTE = '#C9B8B0', ACC = '#F2B48A';
const shadow = '0 2px 18px rgba(20,10,16,.6)';

const Obj: React.FC<{id: string; x: number; s: number}> = ({id, x, s}) => (
  <>
    <g filter="url(#tShadow)" opacity={0.9}>
      <g transform={`translate(${x},${FLOOR}) matrix(1,0,-1.5,0.1,0,0) scale(${s})`}><TallObject id={id} uid={'ts' + id} /></g>
    </g>
    <g transform={`translate(${x},${FLOOR}) scale(${s})`}><TallObject id={id} uid={'t' + id} /></g>
  </>
);

// scene in video coordinates (1080 wide, ground at 1260), placed with a transform
const Scene: React.FC<{tf: string; w: number; h: number; s: number; burjX: number; evX: number}> = ({tf, w, h, s, burjX, evX}) => (
  <svg width={w} height={h} style={{position: 'absolute', left: 0, top: 0}}>
    <filter id="tShadow" colorInterpolationFilters="sRGB">
      <feColorMatrix type="matrix" values="0 0 0 0 0.08  0 0 0 0 0.06  0 0 0 0 0.09  0 0 0 0.7 0" />
    </filter>
    <TallDefs />
    <g transform={tf}>
      <Background drift={0.4} />
      <Obj id="everest" x={evX} s={s} />
      <Obj id="burj" x={burjX} s={s} />
      {/* marker so the tiny tower reads at thumbnail size */}
      <path d={`M${burjX - 9},${FLOOR - 828 * s - 30} L${burjX + 9},${FLOOR - 828 * s - 30} L${burjX},${FLOOR - 828 * s - 14}Z`} fill={ACC} />
    </g>
  </svg>
);

const Tag: React.FC<{x: number; y: number; name: string; m: string; size: number; hi?: boolean}> = ({x, y, name, m, size, hi}) => (
  <div style={{position: 'absolute', left: x - 300, width: 600, top: y, textAlign: 'center', textShadow: shadow}}>
    <div style={{fontFamily: 'Inter', fontWeight: 600, fontSize: size * 0.62, color: CREAM}}>{name}</div>
    <div style={{fontFamily: 'IBM Plex Mono', fontWeight: 500, fontSize: size, color: hi ? ACC : MUTE, marginTop: -4}}>{m}<span style={{fontSize: size * 0.5}}> m</span></div>
  </div>
);

export const Thumb03: React.FC = () => {
  const s = 400 / 8849;
  return (
    <AbsoluteFill style={{background: '#1B1620', overflow: 'hidden'}}>
      <Scene w={1280} h={720} tf={`translate(640,590) scale(1.2) translate(-540,${-FLOOR})`} s={s} burjX={500} evX={760} />
      <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(40,32,52,.75) 0%, rgba(40,32,52,.35) 34%, rgba(40,32,52,0) 52%)'}} />
      <div style={{position: 'absolute', left: 56, top: 52, fontFamily: 'Inter', color: CREAM, textShadow: shadow}}>
        <div style={{fontWeight: 500, fontSize: 24, letterSpacing: 6, color: ACC}}>HEIGHT COMPARISON</div>
        <div style={{fontWeight: 300, fontSize: 150, lineHeight: 1, marginTop: 14, letterSpacing: -4}}>11<span style={{color: ACC}}>×</span></div>
        <div style={{fontWeight: 600, fontSize: 52, lineHeight: 1.1, marginTop: 6}}>taller than the<br />Burj Khalifa</div>
      </div>
      <Tag x={470} y={604} name="Burj Khalifa" m="828" size={34} />
      <Tag x={910} y={604} name="Mount Everest" m="8,849" size={44} hi />
    </AbsoluteFill>
  );
};

export const Cover03: React.FC = () => {
  const s = 640 / 8849;
  return (
    <AbsoluteFill style={{background: '#1B1620', overflow: 'hidden'}}>
      <Scene w={1080} h={1920} tf="translate(0,0)" s={s} burjX={230} evX={640} />
      <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(40,32,52,.5) 0%, rgba(40,32,52,.35) 28%, rgba(40,32,52,0) 45%)'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 210, textAlign: 'center', fontFamily: 'Inter', color: CREAM, textShadow: shadow}}>
        <div style={{fontWeight: 500, fontSize: 32, letterSpacing: 8, color: ACC}}>HEIGHT COMPARISON · TO SCALE</div>
        <div style={{fontWeight: 300, fontSize: 190, lineHeight: 1, marginTop: 26, letterSpacing: -6}}>11<span style={{color: ACC}}>×</span></div>
        <div style={{fontWeight: 600, fontSize: 76, lineHeight: 1.1, marginTop: 10}}>taller than the<br />Burj Khalifa</div>
      </div>
      <Tag x={250} y={1350} name="Burj Khalifa" m="828" size={60} />
      <Tag x={700} y={1350} name="Mount Everest" m="8,849" size={76} hi />
    </AbsoluteFill>
  );
};
