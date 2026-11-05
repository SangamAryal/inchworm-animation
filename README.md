# inchworm-animation

Code-animated 2.5D size and speed comparisons of space objects, rendered with Remotion.
Look: objects rest on a rocky ground under a deep-space sky (Milky Way, parallax stars), lit by a low warm sun. Music with a soft beat, synced so each move lands on a downbeat.

## Commands
- `npm install`
- `npm run studio` - live preview
- `npm run render:short01` - render Short 01 (1080x1920). Thumbnail and cover: `npx remotion still src/index.ts thumb01|cover01 out/x.png --gl=swangle`. Uses WebGL, so `--gl=swangle` is required in headless/cloud renders.
- `npm run music` - make the beat (numpy + scipy). Run it before rendering; the wav is not committed.

In the cloud, set `REMOTION_CHROME=/opt/pw-browsers/chromium_headless_shell-*/chrome-headless-shell-linux64/chrome-headless-shell` before rendering.

## Layout
- `src/engine/` - comparison timeline, camera and layout (`layout.ts`, `Comparison.tsx`)
- `src/look/Dusk.tsx` - sky, hills, ground shadows, labels, multiplier, scale bar
- `src/bodies/` - WebGL bodies: textured Earth/Moon, procedural Mars/Jupiter/Neptune, Sun, red supergiant, neutron star, ray-traced black holes
- `src/videos/short01/` - Short 01 data (objects, sizes, timing)
- `audio/make_beat.py` - code-made music with beats, no samples (`make_music.py`: calm ambient pad, `make_sfx.py`: whoosh, both unused for now)
- `media/sources.md` - image and fact sources (put credits in the video description)

No voiceover: Shorts use on-screen labels and music only.
