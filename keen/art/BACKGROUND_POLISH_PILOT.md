# Background pixel polish — Bakery 2 pilot

## Purpose
A restrained improvement to the **mushroom forest shown in the user's
screenshot** (Bakery 2). Bakery 1 and 3 remain unchanged pending approval.

## What changes (and what does not)
- The top of existing violet, rose, and blue mushroom caps has a crisp pastel
  highlight; the underside has a deeper matching shadow. The existing oval
  outline pixels are recolored, never extended.
- A one-pixel inset ramp adds shape to existing caps.
- Mint stems get a subtle one-pixel light-facing and shade-facing side.
- Nearby purple tower silhouettes get a quiet one-pixel internal edge.
- The distant sky gradient, stars, moon, layout, prop placement, parallax,
  collision, movement, music, sprite drawing and game mechanics **do not change**.
- Original sprite data and `phase3-bg.js` are not overwritten. The processor
  returns an unchanged image for stages other than Bakery 2.

## Implementation
`keen/art/background-polish.js` lazily creates an offscreen 960×540 canvas
once for an existing loaded stage-2 background image, then caches it via
`WeakMap`. There are no repeated pixel-processing loops per animation frame.

The proposed `keen/index.html` uses the cleaned backdrop only while playing
Bakery 2. The processor is deployed as an inert script on `main` to support
the isolated preview; it has no gameplay effect until explicitly called.

## Preview / controls
**https://joelgtaylor.github.io/cooking-diary/keen/mushroom-background-preview.html**

The preview starts in Bakery 2 with the refined background enabled.

- **B**: background polish ON/OFF (direct before/after).
- **K**: independently toggle the existing baker outline polish.
- **J**: original/restored feet (existing comparison).
- **H**: fixed/old ground physics. Keep the fixed mode on.

Below the game is a 2× static original/refined backdrop detail.

## Exporting an actual static PNG
Install `Pillow` and `numpy`, then run:
```sh
python keen/art/tools/bake_mushroom_background.py
```
This decodes the untouched embedded backdrop and creates
`keen/art/phase3-stage-2-polished.png`. The shipped browser uses the equivalent
reproducible Canvas operation instead of loading an additional image file.

## Acceptance criteria
Visibly more intentional pixel clusters, preserved depth and readability,
no new artifacts, no performance regressions after first-load caching.
Do not merge until visually reviewed in a real browser. Extend the style to
Bakery 1/3 only after Bakery 2 is accepted.
