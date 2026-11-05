# inchworm-animation

Code-animated 2.5D size and speed comparisons, rendered with Remotion.
Look: objects rest on a rocky ground under a deep-space sky (Milky Way, parallax stars), lit by a low warm sun. Music with a soft beat, synced so each move lands on a downbeat.

## Commands
- `npm install`
- `npm run studio` - live preview
- `npm run render:short01` - render Short 01 (1080x1920). Thumbnail and cover: `npx remotion still src/index.ts thumb01|cover01 out/x.png --gl=swangle`. Uses WebGL, so `--gl=swangle` is required in headless/cloud renders.
- `npm run render:short02` - Short 02 (mammal speeds). Make its sound first with `npm run sound:short02` (footsteps + beat, numpy/scipy).
- `npm run music` - make the beat (numpy + scipy). Run it before rendering; the wav is not committed.

In the cloud, set `REMOTION_CHROME=/opt/pw-browsers/chromium_headless_shell-*/chrome-headless-shell-linux64/chrome-headless-shell` before rendering.

## Layout
- `src/engine/` - comparison timeline, camera and layout (`layout.ts`, `Comparison.tsx`)
- `src/look/Dusk.tsx` - sky, hills, ground shadows, labels, multiplier, scale bar
- `src/bodies/` - WebGL bodies: textured Earth/Moon, procedural Mars/Jupiter/Neptune, Sun, red supergiant, neutron star, ray-traced black holes
- `src/videos/short01/` - Short 01 data (objects, sizes, timing)
- `src/creatures/` - code-drawn rigged animals: `rig.ts` (gait cycle, spine flex, 2-bone IK legs), `Creature.tsx` (shading, rim light, cast shadow), one spec file per animal, `Bat.tsx` (3D-projected flapping wings)
- `src/look/Savanna.tsx` - dusk savanna with parallax acacias and speed-smeared grass
- `src/videos/short02/` - Short 02 timeline, labels and the 3-second race finale
- `scripts/events02.ts` + `audio/make_steps.py` - footfall times exported from the rig, then footsteps synthesised by body mass (hoof, paw, shoe, elephant pad, bat wingbeats)
- `audio/make_beat.py` - code-made music with beats, no samples (`make_music.py`: calm ambient pad, `make_sfx.py`: whoosh, both unused for now)
- `media/sources.md` - image and fact sources (put credits in the video description)

No voiceover: Shorts use on-screen labels and music only.
