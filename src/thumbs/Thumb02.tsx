import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Savanna} from '../look/Savanna';
import {Creature} from '../creatures/Creature';
import {Bat} from '../creatures/Bat';
import {SPECS} from '../creatures';
import {ACC, CREAM, MUTE} from '../videos/short02/Labels';

// Thumbnail and Shorts cover for Short 02. Same savanna, rigs and lighting as the video.
// Hook: the cheetah is not the fastest mammal, a bat is. Sizes here are for impact, not to scale.
const T = 0.31; // a mid-stride pose that reads well
const shadow = '0 2px 18px rgba(20,10,8,.6)';

const Tag: React.FC<{x: number; y: number; name: string; kmh: string; size: number; hi?: boolean}> = ({x, y, name, kmh, size, hi}) => (
  <div style={{position: 'absolute', left: x - 300, width: 600, top: y, textAlign: 'center', textShadow: shadow}}>
    <div style={{fontFamily: 'Inter', fontWeight: 600, fontSize: size * 0.62, color: CREAM}}>{name}</div>
    <div style={{fontFamily: 'IBM Plex Mono', fontWeight: 500, fontSize: size, color: hi ? ACC : MUTE, marginTop: -4}}>{kmh}<span style={{fontSize: size * 0.5}}> km/h</span></div>
  </div>
);

// scene in video coordinates (1080 wide, ground at 1300), placed with a transform
const Scene: React.FC<{tf: string; w: number; h: number; cheetahX: number; batX: number; batY: number; s: number}> = ({tf, w, h, cheetahX, batX, batY, s}) => (
  <svg width={w} height={h} style={{position: 'absolute', left: 0, top: 0}}>
    <g transform={tf}>
      <Savanna camX={40} s={200} v={26} fps={30} />
      <Creature spec={SPECS.cheetah} t={T} x={cheetahX} g={1330} s={s} id="tc" />
      <Bat t={0.05} x={batX} y={batY} s={s * 3.2} id="tb" groundY={1330} />
    </g>
  </svg>
);

export const Thumb02: React.FC = () => (
  <AbsoluteFill style={{background: '#1b1418', overflow: 'hidden'}}>
    <Scene w={1280} h={720} tf="translate(640,600) scale(1.2) translate(-540,-1250)" cheetahX={420} batX={960} batY={1000} s={330} />
    <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(40,28,48,.82) 0%, rgba(40,28,48,.45) 30%, rgba(40,28,48,0) 52%)'}} />
    <div style={{position: 'absolute', left: 56, top: 48, fontFamily: 'Inter', color: CREAM, textShadow: shadow}}>
      <div style={{fontWeight: 500, fontSize: 24, letterSpacing: 6, color: ACC}}>SPEED COMPARISON</div>
      <div style={{fontWeight: 600, fontSize: 70, lineHeight: 1.05, marginTop: 12}}>The cheetah isn't<br />the <span style={{color: ACC}}>fastest mammal</span></div>
    </div>
    <Tag x={150} y={606} name="Cheetah" kmh="93" size={44} />
    <Tag x={1000} y={360} name="Bat" kmh="160" size={56} hi />
  </AbsoluteFill>
);

export const Cover02: React.FC = () => (
  <AbsoluteFill style={{background: '#1b1418', overflow: 'hidden'}}>
    <Scene w={1080} h={1920} tf="translate(540,1250) scale(1.25) translate(-560,-1250)" cheetahX={450} batX={760} batY={860} s={340} />
    <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(40,28,48,.55) 0%, rgba(40,28,48,.5) 30%, rgba(40,28,48,0) 52%)'}} />
    <div style={{position: 'absolute', left: 0, right: 0, top: 250, textAlign: 'center', fontFamily: 'Inter', color: CREAM, textShadow: shadow}}>
      <div style={{fontWeight: 500, fontSize: 32, letterSpacing: 8, color: ACC}}>11 MAMMALS · REAL SPEEDS</div>
      <div style={{fontWeight: 300, fontSize: 96, lineHeight: 1.1, marginTop: 26}}>The cheetah isn't</div>
      <div style={{fontWeight: 600, fontSize: 96, lineHeight: 1.1}}>the fastest mammal</div>
    </div>
    <Tag x={470} y={1420} name="Cheetah" kmh="93" size={68} />
    <Tag x={350} y={650} name="Free-tailed bat" kmh="160" size={84} hi />
  </AbsoluteFill>
);
