# Deep Plunge route-sign playtest

Approved direction: integrated root-grown plaques. Joel explicitly requested removal of OPTIONAL. The new artwork contains no words: upper up-arrow and warning triangle; lower down-arrow and starter-jar silhouette. The two destinations match the existing canopy/main-descent fork at tile (61,31).

## Preview URLs

- `keen/index.html?pickups=pilot&signs=pilot&scene=plunge`: start at the real fork with new pickup artwork and text-free signs.
- `keen/index.html?pickups=pilot&signs=off&scene=plunge`: same start and state, original route signs.
- `keen/index.html?pickups=pilot&signs=pilot`: full game from Bakery 1, with signs changed only at this Bakery 2 fork.

The explicit scene shortcut starts Bakery 2 on the existing tile-31 platform, opens the preceding relay, marks its first two cultures collected and selects checkpoint 1. It does not write recipe or best-score storage. Without both the exact scene parameter and an explicit signs mode, normal initialization is unchanged. Restart/return-to-checkpoint retain their existing behavior.

## Rendering

`keen/art/plunge-route-sign.png` is the approved concept converted to a transparent 1105×1423 RGBA PNG. Built-in image generation was used. Prompt: extract only the right-hand root signpost; remove all words including OPTIONAL; upper up-arrow/warning triangle and lower down-arrow/cloth-lidded starter-jar glyph; dark slate centers, cream symbols, textured roots and small mushrooms; no background, ground or extra panels.

The source is retained without destructive edits. `architecture.js` draws its own lower root texture to the original support point, then the full plaque artwork at 140×180 above the fork. The sign draws behind collision terrain, enemies, collectibles and the player. The plaques finish above the initial canopy ledge. No geometry, interaction, enemies, hazards, pickups, checkpoints or audio rules are changed by enabling the sign rendering. Default and loading/error paths retain the original readable text signs.

## Validation

All 228 tests passed locally with:

`node --test keen/tests/*.test.cjs previews/audio/audio.test.cjs`

Seven added checks cover atlas dimensions, opt-in parsing, loading/failure fallback, text-free loaded rendering, unchanged world state, drawing before terrain, world scope and the explicit shortcut's safe starting support/storage behavior. Existing render baselines are unchanged.

Desktop browser inspection and mobile player review remain required before acceptance. Keep the branch unmerged until Joel approves.

## Clockwork Ovens addition

Approved metal-plate adaptation: up + warning, right + culture jar, right continuation arrow, left + service stairs, left + checkpoint pennant, down + oven. No text appears on the new plaques. Existing flags themselves are untouched.

- `keen/index.html?pickups=pilot&signs=pilot&scene=clockwork`: start at the authored Clockwork fork with the first two cultures collected.
- `keen/index.html?pickups=pilot&signs=pilot&scene=clockwork-return`: start on the existing return-route shelf with four cultures collected.
- Change `signs=pilot` to `signs=off` for the original labels at the same starting point. Omit `scene` for normal progression from Bakery 1.

Neither shortcut grants recipes or writes storage. Both preserve the existing enemies, boss and audio. Scene start support and collision safety are tested.

Production asset: `keen/art/clockwork-route-plates.png`, generated with built-in image generation from the approved board, six cropped plates in a 1536×1024 RGBA atlas. Prompt: six text-free riveted dark-enamel/copper plaques; top row up/warning, right/culture jar, right arrow; bottom row left/stairs, left/pennant, down/oven; large cream glyphs, straight-on pixel art, no scenery, no labels. Original generated source retained without destructive edits. Runtime cropping excludes the surrounding gutters.

Fork plates sit above the authored fork ledge and canopy landing. The continuation arrow is raised clear of the existing summit checkpoint flag. Return plaques hang below real ledges so their glyphs are not hidden by collision tiles. Rendering stays behind terrain and actors.

Validation for the Clockwork addition: all 234 tests passed locally, including six new checks for atlas source rectangles, direction/order, return markers, fallback artwork, safe scene shortcuts, unchanged gameplay state/storage and unchanged checkpoint rendering. Existing default render baselines pass without changes. Browser and player review pending.
