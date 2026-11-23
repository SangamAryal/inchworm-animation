import React from 'react';
import {Composition, Still} from 'remotion';
import {Cover01, Thumb01} from './thumbs/Thumb01';
import {Cover02, Thumb02} from './thumbs/Thumb02';
import {Cover03, Thumb03} from './thumbs/Thumb03';
import {Cover04, Thumb04} from './thumbs/Thumb04';
import {Cover05, Thumb05} from './thumbs/Thumb05';
import {Banner, Profile} from './thumbs/ChannelArt';
import {Short01} from './videos/short01/Short01';
import {Short02, short02Duration} from './videos/short02/Short02';
import {Short03, short03Duration} from './videos/short03/Short03';
import {VehicleTest} from './videos/short04/VehicleTest';
import {Short04, short04Duration, ALL04} from './videos/short04/Short04';
import {AircraftTest} from './videos/short05/AircraftTest';
import {Short05, short05Duration, ALL05} from './videos/short05/Short05';
import {Short06, short06Duration} from './videos/short06/Short06';
import {Short07, short07Duration} from './videos/short07/Short07';
import {Short08, short08Duration} from './videos/short08/Short08';
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
    <Still id="thumb02" component={Thumb02} width={1280} height={720} />
    <Still id="cover02" component={Cover02} width={1080} height={1920} />
    <Composition id="sample02" component={Short02} width={1080} height={1920} fps={30}
      durationInFrames={short02Duration({ids: ['horse', 'cheetah'], race: false, intro: 40})}
      defaultProps={{ids: ['horse', 'cheetah'], race: false, intro: 40, audio: 'audio/sample02.wav'}} />
    <Composition id="short02" component={Short02} width={1080} height={1920} fps={30}
      durationInFrames={short02Duration({ids: ALL02, race: false})}
      defaultProps={{ids: ALL02, race: false, audio: 'audio/short02.wav'}} />
    <Still id="thumb03" component={Thumb03} width={1280} height={720} />
    <Still id="cover03" component={Cover03} width={1080} height={1920} />
    <Composition id="short03" component={Short03} width={1080} height={1920} fps={30}
      durationInFrames={short03Duration()} defaultProps={{audio: 'audio/short03.wav'}} />
    <Composition id="short03silent" component={Short03} width={1080} height={1920} fps={30}
      durationInFrames={short03Duration()} defaultProps={{}} />
    <Still id="thumb04" component={Thumb04} width={1280} height={720} />
    <Still id="cover04" component={Cover04} width={1080} height={1920} />
    <Composition id="short04" component={Short04} width={1080} height={1920} fps={30}
      durationInFrames={short04Duration({ids: ALL04})} defaultProps={{ids: ALL04, audio: 'audio/short04.wav'}} />
    <Composition id="short04silent" component={Short04} width={1080} height={1920} fps={30}
      durationInFrames={short04Duration({ids: ALL04})} defaultProps={{ids: ALL04}} />
    <Composition id="vtest" component={VehicleTest} width={1080} height={1920} fps={30} durationInFrames={60} defaultProps={{speed: 2}} />
    <Still id="thumb05" component={Thumb05} width={1280} height={720} />
    <Still id="cover05" component={Cover05} width={1080} height={1920} />
    <Still id="thumb05day" component={Thumb05} width={1280} height={720} defaultProps={{day: true}} />
    <Still id="cover05day" component={Cover05} width={1080} height={1920} defaultProps={{day: true}} />
    <Composition id="short05" component={Short05} width={1080} height={1920} fps={30}
      durationInFrames={short05Duration({ids: ALL05})} defaultProps={{ids: ALL05, audio: 'audio/short05.wav'}} />
    <Composition id="short05silent" component={Short05} width={1080} height={1920} fps={30}
      durationInFrames={short05Duration({ids: ALL05})} defaultProps={{ids: ALL05}} />
    <Composition id="short05day" component={Short05} width={1080} height={1920} fps={30}
      durationInFrames={short05Duration({ids: ALL05})} defaultProps={{ids: ALL05, audio: 'audio/short05.wav', day: true}} />
    <Composition id="short05daysilent" component={Short05} width={1080} height={1920} fps={30}
      durationInFrames={short05Duration({ids: ALL05})} defaultProps={{ids: ALL05, day: true}} />
    <Composition id="short06" component={Short06} width={1080} height={1920} fps={30}
      durationInFrames={short06Duration()} defaultProps={{audio: 'audio/short06.wav'}} />
    <Composition id="short06silent" component={Short06} width={1080} height={1920} fps={30}
      durationInFrames={short06Duration()} defaultProps={{}} />
    <Composition id="short07" component={Short07} width={1080} height={1920} fps={30}
      durationInFrames={short07Duration()} defaultProps={{audio: 'audio/short07.wav'}} />
    <Composition id="short07silent" component={Short07} width={1080} height={1920} fps={30}
      durationInFrames={short07Duration()} defaultProps={{}} />
    <Composition id="short08" component={Short08} width={1080} height={1920} fps={30}
      durationInFrames={short08Duration()} defaultProps={{audio: 'audio/short08.wav'}} />
    <Composition id="short08silent" component={Short08} width={1080} height={1920} fps={30}
      durationInFrames={short08Duration()} defaultProps={{}} />
    <Composition id="atest" component={AircraftTest} width={1080} height={1920} fps={30} durationInFrames={60} />
    <Composition id="rigtest" component={RigTest} width={1080} height={1920} fps={30} durationInFrames={300} defaultProps={{animal: 'horse', scale: 140}} />
  </>
);
