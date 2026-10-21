# Clockwork Ovens environmental architecture

October 21, 2026. Implements the approved Ashen Boilerworks, Copper Lift Shafts,
Clockwork Skybridge and Grand Oven Descent concept. This pass changes rendering
only: Bakery 3's collision map, layout, physics, enemy spawns/AI/timing, bosses,
checkpoints, supplies, indicators, audio, camera follow and recipe progression
are unchanged. The approved Bakery 1 and Bakery 2 environments remain intact.

## Assets and rendering

`clockwork-environment.png` is the transparent 1536 × 1024 production atlas,
created with built-in image generation. `clockwork-environment.js` owns its
reviewed source crops and the architectural composition: riveted decks, open
steel framing, recessed copper pipe bays, boiler housings, a huge flywheel and
a furnace-hall arch with a transparent opening. Source proportions are retained
throughout. Long supports repeat fixed-scale structural bays; short deck ends
crop the end plate at the same scale as full bays rather than compressing it.

One-way platform runs come from the applied production map. Flat pale metal
coping sits exactly on the authored landing height; all trusses remain below
it. Solid cells retain opaque original terrain beneath flush, cell-clipped
trim. Machinery, support shafts and room panels are rear scenery. Existing
doorways, storage and route plates, checkpoint flags and foreground actors
remain in front, including all loading/error text fallbacks.

Boilerworks machinery rests on the existing ground. Recessed service bays fill
the three authored rooms; structural posts connect the service platforms to
lower factory foundations. A large dim flywheel anchors the high route. The
grand furnace frame surrounds the existing Devourer/disguised oven, with no
new door or fire painted in its opening. Boss attacks, defeat posture, shelter,
ammo cache and the released real oven render afterward and remain visible.
The existing animated parallax cogs, steam, vents and pistons are unchanged.
A restrained background tint increases silhouette contrast behind world art.

The kit is gated on Bakery 3, the correctly sized and fully loaded atlas,
the existing world-art switch and `environment=off`. Existing terrain and room
art remain the complete loading/error/disabled fallback. No other world's
render traces were changed.

## Review shortcuts

Use the branch/commit URL ending in `/keen/index.html` with one of these:

- `?scene=environment-boilerworks`
- `?scene=environment-shafts`
- `?scene=environment-skybridge`
- `?scene=environment-descent`
- `?scene=environment-ovenhall`

Shortcuts start paused; press P or Pause / Resume. They grant no cultures,
recipes or boss progress and write no saved progress. Append `&environment=off`
to compare. The unmodified URL plays the full three-world game normally.

## Generation specification

Reference: approved Clockwork Ovens four-panel concept. Production prompt:
transparent orthographic side-on detailed 16-bit pixel-art architecture atlas
with six isolated components: a wide flat-topped riveted catwalk with open
trusses and no railing; a tall narrow X-braced structural column; a recessed
copper service wall with dark brick and pipe circuits; a boiler housing;
a huge copper flywheel; and a monumental furnace arch with empty transparent
opening. Blackened indigo steel, soot masonry, muted copper, restrained amber
recesses, pale warm landing coping only. No characters, text, external scenery,
steam, projecting props above decks or new interactive controls. Source crops
were inspected individually rather than assuming the generated grid.

## Validation

`node --test keen/tests/*.test.cjs previews/audio/audio.test.cjs` passes all
337 tests. New checks cover RGBA/crop bounds, stage/fallback isolation, exact
landing alignment, preserved source proportions, render purity, identical
Devourer attacks and oven-release motion with art on/off, draw order behind
the boss and defeat posture, and shortcuts without progress grants. Existing
route, shelter, ammo-cache, boss/defeat/oven and audio checks pass. Native Canvas
renders of all five review locations were visually inspected with loaded actor,
sign and pickup artwork. Player playtesting remains the final acceptance step.
