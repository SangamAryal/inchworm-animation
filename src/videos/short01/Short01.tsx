import React from 'react';
import {Audio, staticFile} from 'remotion';
import {Comparison} from '../../engine/Comparison';
import {SHORT01_ITEMS, SHORT01_TIMING} from './items';

export const Short01: React.FC = () => (
  <>
    <Comparison items={SHORT01_ITEMS} timing={SHORT01_TIMING} title={['From a neutron star', 'to the biggest black hole']} />
    <Audio src={staticFile('audio/short01-music.wav')} volume={0.8} />
  </>
);
