import React from 'react';
import {AbsoluteFill} from 'remotion';
import {SpaceSky} from '../look/SpaceSky';
import {GLBody} from '../bodies/GLBody';
import {ACC, CREAM, DuskBackground, DuskDefs, MUTE} from '../look/Dusk';

// The mark: an inchworm arched mid-step over a ruler, the way it "measures"
// the ground. Segments are shaded spheres so it reads as 2.5D at any size.
export const Inchworm: React.FC<{size: number; ruler?: boolean}> = ({size, ruler = true}) => {
  const n = 21, segR = 0.064;
  // a rounded arch (feet on the ruler, body looped up), resampled so the
  // segments are evenly spaced along the body
  const dense = Array.from({length: 400}, (_, i) => {
    const t = i / 399;
    return {x: -0.34 + t * 0.68, y: 0.17 - Math.pow(Math.sin(Math.PI * t), 0.62) * 0.5};
  });
  const acc = [0];
  for (let i = 1; i < dense.length; i++) acc.push(acc[i - 1] + Math.hypot(dense[i].x - dense[i - 1].x, dense[i].y - dense[i - 1].y));
  const total = acc[acc.length - 1];
  const pts = Array.from({length: n}, (_, i) => {
    const target = (i / (n - 1)) * total;
    let j = acc.findIndex((a) => a >= target);
    if (j < 0) j = dense.length - 1;
    return {...dense[j], t: i / (n - 1)};
  });
  const s = size;
  return (
    <svg width={s} height={s} viewBox="-0.5 -0.5 1 1" style={{overflow: 'visible'}}>
      <defs>
        <radialGradient id="seg" cx="0.35" cy="0.3" r="0.75">
          <stop offset="0" stopColor="#FFE3C8" />
          <stop offset="0.45" stopColor={ACC} />
          <stop offset="1" stopColor="#B3603A" />
        </radialGradient>
        <radialGradient id="segShade" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0.7" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.25" />
        </radialGradient>
      </defs>
      {ruler && (
        <g>
          <line x1={-0.44} x2={0.44} y1={0.245} y2={0.245} stroke={CREAM} strokeWidth={0.014} strokeLinecap="round" />
          {Array.from({length: 17}, (_, i) => {
            const x = -0.4 + i * 0.05;
            const h = i % 4 === 0 ? 0.06 : 0.03;
            return <line key={i} x1={x} x2={x} y1={0.245} y2={0.245 + h} stroke={CREAM} strokeOpacity={0.75} strokeWidth={0.008} strokeLinecap="round" />;
          })}
        </g>
      )}
      {/* soft contact shadows under the two feet */}
      <ellipse cx={-0.34} cy={0.236} rx={0.08} ry={0.012} fill="#000" opacity={0.35} />
      <ellipse cx={0.34} cy={0.236} rx={0.08} ry={0.012} fill="#000" opacity={0.35} />
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={segR * (i === n - 1 ? 1.12 : 1)} fill="url(#seg)" />
          <circle cx={p.x} cy={p.y} r={segR * (i === n - 1 ? 1.12 : 1)} fill="url(#segShade)" />
        </g>
      ))}
      {/* head (last segment): an eye and two small antennae */}
      {(() => {
        const h = pts[n - 1];
        return (
          <g>
            <circle cx={h.x + 0.028} cy={h.y - 0.02} r={0.014} fill="#2A1E26" />
            <circle cx={h.x + 0.032} cy={h.y - 0.025} r={0.004} fill="#fff" />
            <path d={`M${h.x + 0.01},${h.y - 0.075} q0.01,-0.06 0.05,-0.08`} stroke="#B3603A" strokeWidth={0.012} fill="none" strokeLinecap="round" />
            <path d={`M${h.x + 0.045},${h.y - 0.06} q0.03,-0.04 0.075,-0.04`} stroke="#B3603A" strokeWidth={0.012} fill="none" strokeLinecap="round" />
          </g>
        );
      })()}
    </svg>
  );
};

export const Profile: React.FC = () => (
  <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 38%, #3A2E45 0%, #1C1622 62%, #120E16 100%)'}}>
    <div style={{position: 'absolute', left: 80, top: 110}}>
      <Inchworm size={640} />
    </div>
  </AbsoluteFill>
);

export const Banner: React.FC = () => {
  const w = 2560, h = 1440, horizon = 900;
  return (
    <AbsoluteFill style={{background: '#0B0A10', overflow: 'hidden'}}>
      <SpaceSky t={4} drift={0.6} w={w} h={h} horizon={horizon} />
      <svg width={w} height={1600} style={{position: 'absolute', left: 0, top: 0}}>
        <DuskDefs />
        <g transform={`translate(0,${horizon - 1260}) scale(${w / 1080},1)`}><DuskBackground drift={1.7} /></g>
        {/* a ruler running along the horizon, the channel's measuring line */}
        <line x1={0} x2={w} y1={horizon + 2} y2={horizon + 2} stroke={CREAM} strokeOpacity={0.35} strokeWidth={2} />
        {Array.from({length: 129}, (_, i) => (
          <line key={i} x1={i * 20} x2={i * 20} y1={horizon + 2} y2={horizon + (i % 5 === 0 ? 22 : 11)} stroke={CREAM} strokeOpacity={0.3} strokeWidth={2} />
        ))}
      </svg>
      {/* a few things being measured, growing to the right (outside the text safe area on phones) */}
      <GLBody kind="moon" x={1900} y={horizon - 26} r={26} ext={1.03} t={2} />
      <GLBody kind="earth" x={1985} y={horizon - 48} r={48} ext={1.1} t={2} params={{spin: 4.4}} />
      <GLBody kind="jupiter" x={2250} y={horizon - 150} r={150} ext={1.03} t={2} params={{spin: 0.3}} />
      <GLBody kind="sun" x={2950} y={horizon - 330} r={330} ext={1.7} t={2} />
      {/* the inchworm stands on the ruler; its feet sit on the horizon line */}
      <div style={{position: 'absolute', left: 560, top: horizon - 0.745 * 300, width: 300, height: 300}}>
        <Inchworm size={300} ruler={false} />
      </div>
      <div style={{position: 'absolute', left: 900, top: 620, fontFamily: 'Inter', color: CREAM}}>
        <div style={{fontWeight: 600, fontSize: 140, letterSpacing: -3, lineHeight: 1}}>Inchworm</div>
        <div style={{fontWeight: 500, fontSize: 44, color: MUTE, marginTop: 18}}>How big? How fast? <span style={{color: ACC}}>Everything, compared.</span></div>
      </div>
    </AbsoluteFill>
  );
};
