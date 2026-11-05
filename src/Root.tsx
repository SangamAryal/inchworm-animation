import React from 'react';
import {Composition} from 'remotion';
import {Short01} from './videos/short01/Short01';
import {makeLayout} from './engine/layout';
import {SHORT01_ITEMS, SHORT01_TIMING} from './videos/short01/items';

const dur = makeLayout(SHORT01_ITEMS, SHORT01_TIMING).duration;

export const Root: React.FC = () => (
  <Composition id="short01" component={Short01} width={1080} height={1920} fps={30} durationInFrames={dur} />
);
