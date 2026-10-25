# Bakery 2 mobile rendering pass

Baseline: `af4baccbfe8f9e32649584eb06a8eea74dc792b8`.

The cavern scenery previously rebuilt faded stem/cliff joins and applied
brightness filters for every draw. Platform backing and faces independently
rescanned the complete 105 × 72 map every rendered frame.

## Changes

- Cache rendered stems, cliffs and shaded platform/architecture pieces in an
  LRU limited to 524,288 retained RGBA pixels (2 MiB), with at most 128 entries.
  This is separate from the original image assets and canvas implementation overhead.
- Reject whole offscreen stems/cliffs before constructing their clips or joins.
  Include a camera-rounding/shake margin.
- Reuse platform and exposed-ground runs until geometry changes. Map identity
  handles restarts; relay completion, opened cellar hatches and changed Bloomrot
  gates explicitly invalidate cached runs.
- Only write changed text, visibility, accessibility state and shell attributes
  to the DOM. Countdown text still refreshes when its displayed second changes.
- Keep direct rendering when stamp creation is unavailable or fails. Use
  `fungalCache=off` to compare against that path; it retains geometry caching
  and whole-object culling.
- Refresh production script versions and show stamp count/memory under `perf=1`.

No changes to geometry, collision, combat timing, either hero's relay solution,
controls, atmosphere, music, recipes or stored progress.

## Verification

`node --test keen/tests/*.test.cjs`: 448 passing tests, including cache reuse,
memory bounds, geometry invalidation, render purity and unchanged-control DOM writes.

Native Canvas comparisons use the actual production atlas and the original
renderer. Run:

```sh
node keen/tools/profile-fungal.cjs /path/to/original/fungal-environment.js
```

The tool uses `@napi-rs/canvas` (also used by `profile-moonlit.cjs`), resolving
from `CODEX_PRIMARY_RUNTIME_NODE_MODULES` when set. Omit the argument to compare
the current direct and cached rendering paths. Set `PROFILE_IMAGES` to an
existing output directory to save comparison PNGs.

Warm scenery submissions, excluding other world rendering:

| Scene | Original image draws | Cached image draws | Original brightness-filtered draws | Cached brightness-filtered draws |
| --- | ---: | ---: | ---: | ---: |
| Foothills | 72 | 27 | 72 | 0 |
| Grotto | 82 | 27 | 82 | 0 |
| Canopy | 210 | 20 | 210 | 0 |
| Deep Plunge | 325 | 28 | 325 | 0 |
| Bloomrot approach | 105 | 20 | 105 | 0 |
| Cellar | 22 | 21 | 22 | 0 |

Repeated scenery frames perform zero map-cell reads instead of approximately
25,000. Cache misses are expected on first exposure or after LRU eviction;
stationary warm frames allocate no stamps in all tested scenes.

Compared seven camera positions, including fractional coordinates, using actual
native canvas pixels; also inspected full-scene Foothills, Grotto and Deep Plunge
renders. Flattened alpha and nearest-neighbour resampling introduce small texture
sampling differences: aggregate RMS channel error remained below 1.24/255, and
under 0.5% of channel samples differed by more than 2/255. The profiler checks
both bounds; individual edge texels can differ more. Geometry and landing lines
are unchanged.

These are operation counts and native rendering checks, not phone FPS results.
Local Chromium installation was unavailable; a cloud Chrome smoke test verified
startup/rendering in all three bakeries and movement/jumping in Bakery 2.
GitHub Actions also passed. Physical-phone testing of traversal, fullscreen/
multitouch, relay/hatches, boss retry and saved recipes remains the final release check. Compare the Deep Plunge using `perf=1`
and `scene=environment-plunge`; use Play to resume from that camera shortcut.
Do not merge into main before Joel's review.

