import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Aircraft} from '../../aircraft/Aircraft';
import {AIRCRAFT} from '../../aircraft/specs';

const IDS = ['wright', 'spirit', 'spitfire', 'b747', 'concorde', 'sr71', 'x15', 'shuttle'];
export const AircraftTest: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#5A4A68, #E0A584)'}}>
      <svg width={1080} height={1920}>
        {IDS.map((id, i) => {
          const S = AIRCRAFT[id];
          const s = Math.min(110, 820 / S.L);
          return <Aircraft key={id} spec={S} x={540} g={150 + i * 230} s={s * 0.8} t={f / 30} v={100} id={'a' + i} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};
