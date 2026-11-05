import React from 'react';
import {AbsoluteFill} from 'remotion';
import {SpaceSky} from '../look/SpaceSky';
import {GLBody} from '../bodies/GLBody';
import {ACC, CREAM, DuskBackground, DuskDefs, MUTE} from '../look/Dusk';

// Thumbnail and Shorts cover for Short 01. Built from the same sky, ground and
// bodies as the video. Sizes here are for impact, not to scale.
type V = {w: number; h: number; horizon: number};

const Ground: React.FC<V> = ({w, horizon}) => (
  <svg width={w} height={2000} style={{position: 'absolute', left: 0, top: 0}}>
    <DuskDefs />
    <g transform={`translate(0,${horizon - 1260}) scale(${w / 1080},1)`}>
      <DuskBackground drift={2.3} />
    </g>
  </svg>
);

const Small: React.FC<{x: number; ground: number; r: number; kind: 'sun' | 'earth'; label: string; size: number}> = ({x, ground, r, kind, label, size}) => (
  <>
    <GLBody kind={kind} x={x} y={ground - r} r={r} ext={kind === 'sun' ? 1.7 : 1.1} t={3} params={{spin: 4.4}} />
    <div style={{position: 'absolute', left: x - 100, width: 200, top: ground + 10, textAlign: 'center', fontFamily: 'Inter', fontWeight: 600, fontSize: size, color: CREAM}}>{label}</div>
  </>
);

export const Thumb01: React.FC = () => {
  const v = {w: 1280, h: 720, horizon: 560};
  return (
    <AbsoluteFill style={{background: '#0B0A10', overflow: 'hidden'}}>
      <SpaceSky t={6} drift={1.2} w={v.w} h={v.h} horizon={v.horizon} />
      <Ground {...v} />
      <GLBody kind="blackhole" x={930} y={v.horizon - 72 * 3.2} r={72} ext={6.4} t={6} maxRes={900} params={{incl: 1.38, tint: [1, 1.15, 1]}} />
      <Small x={590} ground={v.horizon} r={13} kind="sun" label="Sun" size={22} />
      <Small x={500} ground={v.horizon} r={3} kind="earth" label="Earth" size={18} />
      <div style={{position: 'absolute', left: 64, top: 70, fontFamily: 'Inter', color: CREAM}}>
        <div style={{fontWeight: 500, fontSize: 24, letterSpacing: 6, color: ACC}}>SIZE COMPARISON</div>
        <div style={{fontWeight: 600, fontSize: 78, lineHeight: 1.04, marginTop: 14, textShadow: '0 2px 18px rgba(0,0,0,.6)'}}>How big is<br />the biggest<br /><span style={{color: ACC}}>black hole?</span></div>
      </div>
      <div style={{position: 'absolute', right: 40, bottom: 34, fontFamily: 'IBM Plex Mono', fontWeight: 500, fontSize: 24, color: MUTE}}>TON 618 · 240 billion km</div>
    </AbsoluteFill>
  );
};

export const Cover01: React.FC = () => {
  const v = {w: 1080, h: 1920, horizon: 1260};
  return (
    <AbsoluteFill style={{background: '#0B0A10', overflow: 'hidden'}}>
      <SpaceSky t={6} drift={1.2} w={v.w} h={v.h} horizon={v.horizon} />
      <Ground {...v} />
      <GLBody kind="blackhole" x={600} y={v.horizon - 90 * 3.2} r={90} ext={6.4} t={6} maxRes={1100} params={{incl: 1.38, tint: [1, 1.15, 1]}} />
      <Small x={205} ground={v.horizon} r={18} kind="sun" label="Sun" size={30} />
      <Small x={95} ground={v.horizon} r={4} kind="earth" label="Earth" size={26} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 230, textAlign: 'center', fontFamily: 'Inter', color: CREAM}}>
        <div style={{fontWeight: 300, fontSize: 92, lineHeight: 1.1}}>Size comparison of</div>
        <div style={{fontWeight: 600, fontSize: 92, lineHeight: 1.1}}>cosmic objects</div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1420, textAlign: 'center', fontFamily: 'Inter', fontWeight: 500, fontSize: 38, color: MUTE}}>From a neutron star to TON 618</div>
    </AbsoluteFill>
  );
};
