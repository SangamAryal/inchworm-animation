import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Creature} from '../../creatures/Creature';
import {SPECS} from '../../creatures';

// Contact sheet: 6 poses through one stride, for checking a rig.
export const RigTest: React.FC<{animal: string; scale?: number; single?: boolean}> = ({animal, scale = 140, single = false}) => {
  const f = useCurrentFrame();
  const S = SPECS[animal];
  return (
    <AbsoluteFill style={{background: '#8f7a78'}}>
      <svg width={1080} height={1920}>
        {(single ? [0, 3] : [0, 1, 2, 3, 4, 5]).map((i) => {
          const g = single ? 900 + (i ? 900 : 0) : 330 + i * 300;
          return (
            <g key={i}>
              <line x1={0} x2={1080} y1={g} y2={g} stroke="#3b2f2f" />
              <Creature spec={S} t={f / 30 + i / 6 / S.stride} x={540} g={g} s={scale} id={`c${i}`} />
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
