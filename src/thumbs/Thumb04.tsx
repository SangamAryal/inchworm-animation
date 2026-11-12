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

export const Thumb04: React.FC = () => (
  <AbsoluteFill style={{background: '#1b1418', overflow: 'hidden'}}>
    <Scene w={1280} h={720} tf="translate(640,470) scale(1.15) translate(-540,-1250)" benzX={230} jetX={800} sb={120} sj={42} />
    <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(40,28,48,.82) 0%, rgba(40,28,48,.45) 30%, rgba(40,28,48,0) 52%)'}} />
    <div style={{position: 'absolute', left: 56, top: 44, fontFamily: 'Inter', color: CREAM, textShadow: shadow}}>
      <div style={{fontWeight: 500, fontSize: 24, letterSpacing: 6, color: ACC}}>SPEED COMPARISON</div>
      <div style={{fontWeight: 600, fontSize: 70, lineHeight: 1.05, marginTop: 12}}>The first car vs<br />the <span style={{color: ACC}}>fastest car ever</span></div>
    </div>
    <Tag x={250} y={600} name="The first car" kmh="16" size={42} />
    <Tag x={900} y={590} name="ThrustSSC" kmh="1,228" size={50} hi />
  </AbsoluteFill>
);

export const Cover04: React.FC = () => (
  <AbsoluteFill style={{background: '#1b1418', overflow: 'hidden'}}>
    <Scene w={1080} h={1920} tf="translate(540,1250) scale(1.9) translate(-540,-1300)" benzX={360} jetX={560} sb={72} sj={33} />
    <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(40,28,48,.55) 0%, rgba(40,28,48,.5) 30%, rgba(40,28,48,0) 52%)'}} />
    <div style={{position: 'absolute', left: 0, right: 0, top: 250, textAlign: 'center', fontFamily: 'Inter', color: CREAM, textShadow: shadow}}>
      <div style={{fontWeight: 500, fontSize: 32, letterSpacing: 8, color: ACC}}>8 CARS · REAL TOP SPEEDS</div>
      <div style={{fontWeight: 300, fontSize: 96, lineHeight: 1.1, marginTop: 26}}>How fast can</div>
      <div style={{fontWeight: 600, fontSize: 96, lineHeight: 1.1}}>a car go?</div>
    </div>
    <Tag x={540} y={830} name="ThrustSSC" kmh="1,228" size={92} hi />
    <Tag x={540} y={1440} name="The first car" kmh="16" size={72} />
  </AbsoluteFill>
);
