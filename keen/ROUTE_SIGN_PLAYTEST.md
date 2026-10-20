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
