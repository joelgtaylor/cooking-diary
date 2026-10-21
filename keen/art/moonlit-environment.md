# Moonlit Bakery environmental architecture

October 21, 2026. Based on the approved four-section environmental concept.
The initial pass changed Bakery 1 rendering only. The subsequent approved
fitting correction adds five one-way end cells to complete two-tile bridge
bays; all existing landing heights, physics, enemies, bosses, indicators,
checkpoint state, music and recipes remain unchanged. Bakery 2 and Bakery 3 retain their approved presentation.

`moonlit-architecture.png` is a 1536 × 1024 transparent production atlas created
with built-in image generation. `moonlit-environment.js` owns its reviewed crop
rectangles and the architectural composition. The original architecture and
terrain are the complete fallback while it loads, if it fails, or with
`?environment=off`. It also respects the existing world-art off switch.

The workshop and Proofing Hall use timber framing and warm bakery windows.
Roof landings gain slate fascia; open timber trusses distinguish pass-through
platforms. High Towers receive narrow recessed foundations and stepped stone
corbels. The descent uses heavier masonry and an oven portal behind the
Foreman. Recessed facades are darkened without making the stone translucent.
The existing bright terrain/flat coping defines playable surfaces; decorative
supports do not create collision. No railing or foreground art covers actors.

Platform spans come from contiguous `=` cells in the applied production map,
not the older combined platform metadata. All front fascia stays within its
authored tile row; open trusses and muted corbels extend below as backing.
Solid cells remain opaque beneath any alpha-bearing detail. The two solid
towers receive facade art within their existing rectangular footprints.

## Review links

Use the branch or a commit-specific raw.githack URL ending in `/keen/index.html`.
Normal starts run the complete game with the new architecture enabled.
Section shortcuts start paused, with no yeast or recipe progress granted:

- `?scene=environment-courtyard`
- `?scene=environment-hall`
- `?scene=environment-towers`
- `?scene=environment-forecourt`

Append `&environment=off` to compare. Press P or Pause / Resume to play.

## Generation specification

Reference: the approved four-panel Moonlit Bakery environmental concept.
Production prompt: transparent, orthographic side-on detailed pixel-art atlas
in the same moonlit gothic bakery style, with dark blue-violet stone, brown
timber, muted copper and warm amber windows. Six separate components: a timber
bakery facade; a narrow stone tower facade; a monumental oven arch; a flat
coping/slate roof fascia; an open wooden truss bridge with no railing; and an
arched warm window. No characters, scenery, text, ground plane or exterior
shadows. Recessed facades should remain darker than gameplay edges. The output
was inspected and cropped by source rectangle in the renderer rather than
assuming a regular grid. The window component is reserved for future sections.

## Validation

Run `node --test keen/tests/*.test.cjs previews/audio/audio.test.cjs`.
The additional checks cover atlas bounds, loading/off fallback, stage isolation,
actual landing alignment, pure rendering, deterministic gameplay with art on
and off, and preview shortcuts without progress writes. Bakery 1 world render
traces include the five added tiles (including their minimap marks); Bakery 2
and Bakery 3 traces remain unchanged. The kit has its own preservation checks.
Four section compositions were rendered with native Canvas and visually
inspected, including enemy/flag/pickup visibility and the Foreman arena.

## Proportional fitting correction

Whole facade panels and bridges previously stretched to arbitrary spans.
Facade bays now repeat at their source aspect ratio over masonry infill. Solid
tower fronts fit uniformly within their existing footprints. Roof strips keep
their proportions; bridge end bays crop the right half of a truss instead of
squeezing a whole truss.

The user authorized small layout adjustments to fit the art. Exactly five
formerly empty cells now contain one-way platforms: `(32,45)`, `(39,42)`,
`(61,33)`, `(70,29)`, `(72,27)`. All other collision cells are identical. The
last bridge extends left, keeping its right edge out of the descent section.
A frozen pre-fitting layout is retained only as a regression fixture. Tests
verify the exact delta, unchanged encounter/progression data, complete bridge
bays, and proportional source/destination rectangles. All 322 tests pass,
including existing normal-jump, pogo, recovery and descent route checks.
