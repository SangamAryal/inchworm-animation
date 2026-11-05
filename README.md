# inchworm-animation

Code-animated 2.5D size and speed comparisons of space objects, rendered with Remotion.
Look: "Dusk horizon" - objects rest on the ground at dusk, lit by a low warm sun, with parallax hills.

## Commands
- `npm install`
- `npm run studio` - live preview
- `npm run render:short01` - render Short 01 (1080x1920). Uses WebGL, so `--gl=swangle` is required in headless/cloud renders.
- `npm run music` - regenerate the ambient music bed (numpy + scipy)

In the cloud, set `REMOTION_CHROME=/opt/pw-browsers/chromium_headless_shell-*/chrome-headless-shell-linux64/chrome-headless-shell` before rendering.

## Layout
- `src/engine/` - comparison timeline, camera and layout (`layout.ts`, `Comparison.tsx`)
- `src/look/Dusk.tsx` - sky, hills, ground shadows, labels, multiplier, scale bar
- `src/bodies/` - WebGL bodies: textured Earth/Moon, procedural Mars/Jupiter/Neptune, Sun, red supergiant, neutron star, ray-traced black holes
- `src/videos/short01/` - Short 01 data (objects, sizes, timing)
- `audio/make_music.py` - code-made music, no samples
- `media/sources.md` - image and fact sources (put credits in the video description)

No voiceover: Shorts use on-screen labels and music only.
