# Crust Quest environment art upgrade

This feature uses a **256×256 transparent pixel-art atlas** (4 columns × 4 rows, 64×64 per source cell) curated from three generated concept sheets:

- `neon_platformer_hazard_sprite_sheet.png` — pink, blue, iron, and baked-gold spikes
- `whimsical_mushroom_bakery_dungeon_tileset.png` — crates, signs, sconces, ovens, jars, stone tiles and mushrooms
- `magical_bakery_fantasy_sprite_atlas.png` — yeast jars, loaves, spark effects

The runtime asset is `keen/art/environment-gameplay-atlas.js`, a compact PNG stored as a base64 data URI for deterministic GitHub Pages loading. It contains 32-color quantized sprites with transparent backgrounds, *not* the large original concept sheets.

| Cell | Source art | Gameplay role |
| --- | --- | --- |
| 0 | Pink crystal spike | Bakery 2 spike |
| 1 | Blue crystal spike | Alternate |
| 2 | Metal furnace spike | Bakery 3 spike |
| 3 | Fermentation jar | Yeast pickups and decoration |
| 4 | Wooden crate | Decorative flour/crate stacks |
| 5 | Mushroom crate | Bakery 2 crates |
| 6 | Hanging lamp | Wall and platform lighting |
| 7 | Glowing oven | Future exit sprite |
| 8 | Loaf of bread | Rye power-up |
| 9 | Furnace | Future decoration |
| 10 | Purple stone | Structural terrain tile |
| 11 | Luminous mushrooms | Future decoration |
| 12 | Warning sign | Future props |
| 13 | Spark | Shield power-up |
| 14 | Blue yeast jar | Kefir power-up / fermentation vat |
| 15 | Golden baked spike | Bakery 1 spike |

Game integration changes **draw calls only**. The original tile map, collision checks, spike positions and damage, collectible collection and power-up mechanics, enemy behavior, physics, recipe unlocks, music, and level progression are not modified.

Source asset sheets and the original environment art remain untouched; the game checks image readiness and falls back to the previous drawing code when the atlas is not ready or disabled.

## Preview

https://joelgtaylor.github.io/cooking-diary/keen/world-elements-preview.html

- **E** toggles new artwork / original (render-only).
- **B** switches Bakery 1 → 2 → 3 without changing game logic.

## Verification

The preview executed 50 frames in a simulated browser and explicitly confirmed that the new 256px atlas draw calls stopped at E OFF and resumed at E ON, without JavaScript errors. A separate 105-frame simulation checked all three bakery scene switches and the entire update/render cycle.

Actual published GitHub Pages appearance still requires browser playtesting.
