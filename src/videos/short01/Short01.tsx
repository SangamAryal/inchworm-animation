import React from 'react';
import {Audio, staticFile} from 'remotion';
import {Comparison} from '../../engine/Comparison';
import {SHORT01_ITEMS, SHORT01_TIMING} from './items';

// Music is made by audio/make_beat.py with 1.9 s bars starting at 3.4 s, so every
// camera move (one object per 3.8 s) lands on a downbeat.
export const Short01: React.FC = () => (
  <>
    <Comparison items={SHORT01_ITEMS} timing={SHORT01_TIMING} title={['From a neutron star', 'to the biggest black hole']} />
    <Audio src={staticFile('audio/short01-music.wav')} volume={0.8} />
  </>
);
