import React from 'react';
import {Composition, Still} from 'remotion';
import {Cover01, Thumb01} from './thumbs/Thumb01';
import {Banner, Profile} from './thumbs/ChannelArt';
import {Short01} from './videos/short01/Short01';
import {Short02, short02Duration} from './videos/short02/Short02';
import {RigTest} from './videos/short02/RigTest';
import {makeLayout} from './engine/layout';
import {SHORT01_ITEMS, SHORT01_TIMING} from './videos/short01/items';

const ALL02 = ['elephant', 'human', 'zebra', 'bear', 'impala', 'greyhound', 'horse', 'lion', 'pronghorn', 'cheetah', 'bat'];
const dur = makeLayout(SHORT01_ITEMS, SHORT01_TIMING).duration;

export const Root: React.FC = () => (
  <>
    <Composition id="short01" component={Short01} width={1080} height={1920} fps={30} durationInFrames={dur} />
    <Still id="thumb01" component={Thumb01} width={1280} height={720} />
    <Still id="cover01" component={Cover01} width={1080} height={1920} />
    <Still id="profile" component={Profile} width={800} height={800} />
    <Still id="banner" component={Banner} width={2560} height={1440} />
    <Composition id="sample02" component={Short02} width={1080} height={1920} fps={30}
      durationInFrames={short02Duration({ids: ['horse', 'cheetah'], race: false, intro: 40})}
      defaultProps={{ids: ['horse', 'cheetah'], race: false, intro: 40, audio: 'audio/sample02.wav'}} />
    <Composition id="short02" component={Short02} width={1080} height={1920} fps={30}
      durationInFrames={short02Duration({ids: ALL02, race: false})}
      defaultProps={{ids: ALL02, race: false, audio: 'audio/short02.wav'}} />
    <Composition id="rigtest" component={RigTest} width={1080} height={1920} fps={30} durationInFrames={300} defaultProps={{animal: 'horse', scale: 140}} />
  </>
);
