import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Sky} from '../look/Sky';
import {Aircraft} from '../aircraft/Aircraft';
import {AIRCRAFT} from '../aircraft/specs';
import {ACC, CREAM, MUTE} from '../videos/short02/Labels';

// Thumbnail and Shorts cover for Short 05: the first plane (1903) against the Space Shuttle in orbit,
// over the same sky as the video, high enough that the Earth curves. Sizes here are for impact, not to scale.
const shadow = '0 2px 18px rgba(10,6,20,.7)';
const grade = {filter: 'contrast(1.1) saturate(1.2)'};

const Scene: React.FC<{tf: string; w: number; h: number; wx: number; wy: number; ws: number; sx: number; sy: number; ss: number}> = ({tf, w, h, wx, wy, ws, sx, sy, ss}) => (
  <svg width={w} height={h} style={{position: 'absolute', left: 0, top: 0}}>
    <g transform={tf}>
      <Sky bgX={2600} spf={0} alt={0.9} t={0.4} />
      <Aircraft spec={AIRCRAFT.shuttle} t={0.4} x={sx} g={sy} s={ss} v={7000} id="ts" />
      <Aircraft spec={AIRCRAFT.wright} t={0.4} x={wx} g={wy} s={ws} v={13} id="tw" />
    </g>
  </svg>
);

const Hook: React.FC<{size: number; align?: 'left' | 'center'}> = ({size, align = 'center'}) => (
  <div style={{fontFamily: 'Inter', fontWeight: 700, fontSize: size, lineHeight: 1, color: CREAM, textAlign: align, letterSpacing: -2}}>
    48 <span style={{color: ACC}}>→</span> 28,000<span style={{fontSize: size * 0.32, fontWeight: 600, letterSpacing: 2, marginLeft: size * 0.12}}>KM/H</span>
  </div>
);

export const Thumb05: React.FC = () => (
  <AbsoluteFill style={{background: '#1b1418', overflow: 'hidden', ...grade}}>
    <Scene w={1280} h={720} tf="translate(640,400) scale(0.75) translate(-540,-1250)" wx={70} wy={1350} ws={40} sx={860} sy={1270} ss={22} />
    <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(10,8,24,.85) 0%, rgba(10,8,24,.5) 30%, rgba(10,8,24,0) 52%)'}} />
    <div style={{position: 'absolute', left: 56, top: 40, color: CREAM, textShadow: shadow}}>
      <div style={{fontFamily: 'Inter', fontWeight: 600, fontSize: 44, letterSpacing: 1}}>Aircraft speed comparison</div>
      <div style={{marginTop: 14}}><Hook size={124} align="left" /></div>
    </div>
  </AbsoluteFill>
);

export const Cover05: React.FC = () => (
  <AbsoluteFill style={{background: '#1b1418', overflow: 'hidden', ...grade}}>
    <Scene w={1080} h={1920} tf="translate(540,1240) scale(1.25) translate(-540,-1180)" wx={330} wy={1345} ws={62} sx={560} sy={1130} ss={24} />
    <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(10,8,24,.75) 0%, rgba(10,8,24,.5) 30%, rgba(10,8,24,0) 48%)'}} />
    <div style={{position: 'absolute', left: 0, right: 0, top: 230, textAlign: 'center', color: CREAM, textShadow: shadow}}>
      <div style={{fontFamily: 'Inter', fontWeight: 300, fontSize: 84, lineHeight: 1.1}}>Aircraft</div>
      <div style={{fontFamily: 'Inter', fontWeight: 600, fontSize: 84, lineHeight: 1.1}}>speed comparison</div>
      <div style={{marginTop: 60}}><Hook size={140} /></div>
      <div style={{fontFamily: 'Inter', fontWeight: 500, fontSize: 32, letterSpacing: 6, color: MUTE, marginTop: 22}}>THE FIRST PLANE VS THE SPACE SHUTTLE</div>
    </div>
  </AbsoluteFill>
);
