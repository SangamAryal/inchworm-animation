import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Highway} from '../look/Highway';
import {Vehicle} from '../vehicles/Vehicle';
import {VEHICLES} from '../vehicles/specs';
import {ACC, CREAM, MUTE} from '../videos/short02/Labels';

// Thumbnail and Shorts cover for Short 04: the first car (1886) against the fastest car ever (ThrustSSC, 1997).
// Same road, cars and lighting as the video. Sizes here are for impact, not to scale.
const shadow = '0 2px 18px rgba(20,10,8,.6)';

const Tag: React.FC<{x: number; y: number; name: string; kmh: string; size: number; hi?: boolean}> = ({x, y, name, kmh, size, hi}) => (
  <div style={{position: 'absolute', left: x - 300, width: 600, top: y, textAlign: 'center', textShadow: shadow}}>
    <div style={{fontFamily: 'Inter', fontWeight: 600, fontSize: size * 0.62, color: CREAM}}>{name}</div>
    <div style={{fontFamily: 'IBM Plex Mono', fontWeight: 500, fontSize: size, color: hi ? ACC : MUTE, marginTop: -4}}>{kmh}<span style={{fontSize: size * 0.5}}> km/h</span></div>
  </div>
);

const Scene: React.FC<{tf: string; w: number; h: number; benzX: number; jetX: number; sb: number; sj: number}> = ({tf, w, h, benzX, jetX, sb, sj}) => (
  <svg width={w} height={h} style={{position: 'absolute', left: 0, top: 0}}>
    <g transform={tf}>
      <Highway camX={40} s={145} v={6} fps={30} />
      <Vehicle spec={VEHICLES.thrust} t={0.4} x={jetX} g={1268} s={sj} v={340} id="tj" />
      <Vehicle spec={VEHICLES.benz} t={0.4} x={benzX} g={1350} s={sb} v={4} id="tb" />
    </g>
  </svg>
);

const grade = {filter: 'contrast(1.1) saturate(1.2)'};
const Hook: React.FC<{size: number; align?: 'left' | 'center'}> = ({size, align = 'center'}) => (
  <div style={{fontFamily: 'Inter', fontWeight: 700, fontSize: size, lineHeight: 1, color: CREAM, textAlign: align, letterSpacing: -2}}>
    16 <span style={{color: ACC}}>→</span> 1,228<span style={{fontSize: size * 0.32, fontWeight: 600, letterSpacing: 2, marginLeft: size * 0.12}}>KM/H</span>
  </div>
);

export const Thumb04: React.FC = () => (
  <AbsoluteFill style={{background: '#1b1418', overflow: 'hidden', ...grade}}>
    <Scene w={1280} h={720} tf="translate(640,520) scale(1.35) translate(-540,-1300)" benzX={235} jetX={720} sb={110} sj={40} />
    <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(36,24,44,.9) 0%, rgba(36,24,44,.6) 32%, rgba(36,24,44,0) 55%)'}} />
    <div style={{position: 'absolute', left: 56, top: 40, color: CREAM, textShadow: shadow}}>
      <div style={{fontFamily: 'Inter', fontWeight: 600, fontSize: 44, letterSpacing: 1}}>Automobiles speed comparison</div>
      <div style={{marginTop: 14}}><Hook size={128} align="left" /></div>
    </div>
  </AbsoluteFill>
);

export const Cover04: React.FC = () => (
  <AbsoluteFill style={{background: '#1b1418', overflow: 'hidden', ...grade}}>
    <Scene w={1080} h={1920} tf="translate(540,1330) scale(2.4) translate(-540,-1310)" benzX={400} jetX={540} sb={55} sj={24} />
    <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(36,24,44,.75) 0%, rgba(36,24,44,.55) 30%, rgba(36,24,44,0) 50%)'}} />
    <div style={{position: 'absolute', left: 0, right: 0, top: 230, textAlign: 'center', color: CREAM, textShadow: shadow}}>
      <div style={{fontFamily: 'Inter', fontWeight: 300, fontSize: 84, lineHeight: 1.1}}>Automobiles</div>
      <div style={{fontFamily: 'Inter', fontWeight: 600, fontSize: 84, lineHeight: 1.1}}>speed comparison</div>
      <div style={{marginTop: 60}}><Hook size={150} /></div>
      <div style={{fontFamily: 'Inter', fontWeight: 500, fontSize: 32, letterSpacing: 6, color: MUTE, marginTop: 22}}>THE FIRST CAR VS THE FASTEST EVER</div>
    </div>
  </AbsoluteFill>
);
