# Crust Quest — Complete three-bakery background art

> Historical art-integration notes. Standalone comparison pages were retired during maintenance; use [the current game](../index.html) and [MAINTENANCE.md](../MAINTENANCE.md) for current behavior. Earlier verification notes below describe their original integration.
All three bakeries now use generated pixel-art-inspired backgrounds, without
altering gameplay or overwriting the previous painted backdrops.

| Bakery | Theme | New image |
| --- | --- | --- |
| 1 | Moonlit Bakery / city skyline | `keen/art/moonlit-bakery-city.webp` |
| 2 | Fungal Proofing Caves / glowing mushroom city | `keen/art/bioluminescent-mushroom-city.webp` (unchanged from PR #10) |
| 3 | Clockwork Oven / glowing steampunk factory | `keen/art/clockwork-oven.webp` |

## Rendering and fallback

`keen/index.html` preloads each image once as an `Image` asset and picks
the appropriate image according to `bakery` in `draw()`. It draws to the
existing 960×540 canvas with `imageSmoothingEnabled=false`. If an image
has not loaded (or fails to load), the original matching `phase3` backdrop
is used automatically. The old source backdrops in `phase3-bg.js` stay
unchanged and committed for rollback.

The newly generated assets were resized from 1672×941 to 960×540 (the
native game viewport) and WebP-encoded for fast browser loading. No game
physics, hitboxes, camera, level geometry, parallax decoration, collectibles,
recipes, enemy behavior or audio logic is changed.

## Live A/B test

Open the current game to review the trilogy backgrounds. The standalone comparison page has been retired.

- Buttons or keys **1 / 2 / 3** jump between bakeries.
- **B** switches generated vs original background art.
- All existing gameplay controls continue to work.

## Verification

- Both image files decoded as 960×540 WebP and their exact binary blobs
  are committed to GitHub.
- The complete game script passes JS parsing.
- In a simulated browser gameplay test, the real stage selection buttons
  and background toggle produced the correct image draw for all three
  bakeries (original and generated) with no JS errors.
- Visual play-testing in a real browser is still useful after deployment.
