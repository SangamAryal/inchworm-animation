import React from 'react';
import '@fontsource/inter/300.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/ibm-plex-mono/500.css';
import {GROUND} from '../../look/Savanna';
import {Runner} from './data';

export const CREAM = '#F6ECDF', MUTE = '#D9C4B4', ACC = '#F6B985';
const shadow = {filter: 'drop-shadow(0 2px 6px rgba(20,10,8,0.55))'};

export const SpeedLabel: React.FC<{r: Pick<Runner, 'kind' | 'name' | 'kmh' | 'mph'>; opacity: number; y?: number}> = ({r, opacity, y = GROUND + 150}) => (
  <g opacity={opacity} style={shadow}>
    <text x={540} y={y} textAnchor="middle" fontFamily="Inter" fontWeight={500} fontSize={22} letterSpacing={3.5} fill={MUTE}>{r.kind.toUpperCase()}</text>
    <text x={540} y={y + 62} textAnchor="middle" fontFamily="Inter" fontWeight={600} fontSize={54} fill={CREAM}>{r.name}</text>
    <text x={540} y={y + 140} textAnchor="middle" fontFamily="IBM Plex Mono" fontWeight={500} fontSize={64} fill={ACC}>{fmt(r.kmh)}<tspan fontSize={34} dx={10}>km/h</tspan></text>
    <text x={540} y={y + 188} textAnchor="middle" fontFamily="IBM Plex Mono" fontWeight={500} fontSize={28} fill={MUTE}>{fmt(r.mph)} mph</text>
  </g>
);

export const fmt = (n: number) => (Math.round(n * 10) / 10).toLocaleString('en-US');

export const Multiplier: React.FC<{value: number; than: string; opacity: number}> = ({value, than, opacity}) => (
  <g opacity={opacity} style={shadow}>
    <text x={540} y={330} textAnchor="middle" fontFamily="Inter" fontWeight={300} fontSize={140} fill={CREAM} letterSpacing={-4}>{value.toFixed(value < 1.1 ? 2 : 1)}<tspan fill={ACC}>×</tspan></text>
    <text x={540} y={398} textAnchor="middle" fontFamily="Inter" fontWeight={500} fontSize={28} letterSpacing={4} fill={MUTE}>{`FASTER THAN ${than.toUpperCase()}`}</text>
  </g>
);

export const Title: React.FC<{lines: [string, string]; opacity: number}> = ({lines, opacity}) => (
  <g opacity={opacity} style={shadow}>
    <text x={540} y={310} textAnchor="middle" fontFamily="Inter" fontWeight={300} fontSize={70} fill={CREAM}>{lines[0]}</text>
    <text x={540} y={396} textAnchor="middle" fontFamily="Inter" fontWeight={600} fontSize={70} fill={CREAM}>{lines[1]}</text>
  </g>
);

export const ScaleBar: React.FC<{len: number; text: string; opacity: number}> = ({len, text, opacity}) => (
  <g opacity={opacity * 0.85}>
    <text x={540} y={1800} textAnchor="middle" fontFamily="IBM Plex Mono" fontWeight={500} fontSize={22} fill={CREAM}>{text}</text>
    <line x1={540 - len / 2} x2={540 + len / 2} y1={1820} y2={1820} stroke={CREAM} strokeWidth={2} />
    <line x1={540 - len / 2} x2={540 - len / 2} y1={1811} y2={1829} stroke={CREAM} strokeWidth={2} />
    <line x1={540 + len / 2} x2={540 + len / 2} y1={1811} y2={1829} stroke={CREAM} strokeWidth={2} />
  </g>
);
