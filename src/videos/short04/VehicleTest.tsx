import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Vehicle} from '../../vehicles/Vehicle';
import {VEHICLES} from '../../vehicles/specs';

const IDS = ['benz', 'modelT', 'beetle', 'f40', 'f1', 'mclaren', 'chiron'];
export const VehicleTest: React.FC<{speed: number}> = ({speed}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: '#b89484'}}>
      <svg width={1080} height={1920}>
        {IDS.map((id, i) => <g key={id}><line x1={0} x2={1080} y1={230 + i * 230} y2={230 + i * 230} stroke="#5a4038" strokeWidth={2} />
          <Vehicle spec={VEHICLES[id]} x={540} g={230 + i * 230} s={170} t={f / 30} v={speed} id={'v' + i} /></g>)}
        <Vehicle spec={VEHICLES.thrust} x={600} g={1880} s={55} t={f / 30} v={speed} id="vt" />
      </svg>
    </AbsoluteFill>
  );
};
