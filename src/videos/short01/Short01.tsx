import React from 'react';
import {Audio, Sequence, staticFile} from 'remotion';
import {Comparison} from '../../engine/Comparison';
import {makeLayout} from '../../engine/layout';
import {SHORT01_ITEMS, SHORT01_TIMING} from './items';

const T = SHORT01_TIMING;
const L = makeLayout(SHORT01_ITEMS, T);
// frames where the camera starts moving to the next object
const MOVES = [T.intro, ...Array.from({length: L.NP - 1}, (_, k) => L.pairStart(k) + T.hold)];

export const Short01: React.FC = () => (
  <>
    <Comparison items={SHORT01_ITEMS} timing={T} title={['From a neutron star', 'to the biggest black hole']} />
    <Audio src={staticFile('audio/short01-music.wav')} volume={0.7} />
    {MOVES.map((f) => (
      <React.Fragment key={f}>
        <Sequence from={Math.max(0, f - 3)} durationInFrames={48}>
          <Audio src={staticFile('audio/whoosh.wav')} volume={0.35} />
        </Sequence>
        <Sequence from={f + T.move - 4} durationInFrames={75}>
          <Audio src={staticFile('audio/arrive.wav')} volume={0.18} />
        </Sequence>
      </React.Fragment>
    ))}
  </>
);
