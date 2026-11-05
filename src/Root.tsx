import React from 'react';
import {Composition, Still} from 'remotion';
import {Cover01, Thumb01} from './thumbs/Thumb01';
import {Short01} from './videos/short01/Short01';
import {makeLayout} from './engine/layout';
import {SHORT01_ITEMS, SHORT01_TIMING} from './videos/short01/items';

const dur = makeLayout(SHORT01_ITEMS, SHORT01_TIMING).duration;

export const Root: React.FC = () => (
  <>
    <Composition id="short01" component={Short01} width={1080} height={1920} fps={30} durationInFrames={dur} />
    <Still id="thumb01" component={Thumb01} width={1280} height={720} />
    <Still id="cover01" component={Cover01} width={1080} height={1920} />
  </>
);
