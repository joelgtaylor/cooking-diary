# Three-world visual polish review

Builds on the approved Bakery 1 scale and graphical audit. The combined scale is approved for release and enabled by default in production. Use `enemyScale=off` for the original-size diagnostic comparison. Joel approved merging this work.

## Implemented

- Bakery 2 and 3 ordinary ground roles use 1.6× artwork with 40 × 54 collision bodies, grounded to the authored support. Wider patrol bounds remain inside the original support envelope. The Sporewing uses a smaller 1.4× art increase and a 35 × 35 body, with preserved perception footprint, dive warning timing, safe reset and bounded flight region.
- Ranged enemies reuse the enlarged release-point/terrain checks; health, projectile speed, attack timing and rewards are retained. Boss art and behavior remain unchanged.
- Original animated checkpoint assemblies render before either hero, preserving cloth animation, anchors and saved-state indications while removing player occlusion.
- Cavern relic progress uses a compact upper-right HUD slot, clear of the bottom action pad and the left relay hint.
- Cavern trunk/cliff samples overlap with a short feathered join instead of abrupt flipped texture boundaries. Canopy platforms use the mushroom crown rather than the original crop's complete short stem/root foot; the separate continuous support extends behind the crown. This removes the false flared foot partway down tall stems. No map geometry changes.
- No P3 background/contrast tuning.

## Validation

407 regression tests pass. Added checks for collision-free later-world spawns and 600 ticks of solid-terrain clearance, both heroes hitting every ground role from either side, enlarged flyer reset and repeated dive recovery, checkpoint draw order for both heroes in all worlds, and the relic HUD's reserved position. Existing render-command snapshots were refreshed for the intentional checkpoint layer order and HUD placement; focused behavioral checks remain separate from those snapshots.

Browser checks confirmed the cavern canopy enemy scale/HUD and the relay checkpoint with both heroes. The browser became unavailable during the final crown-crop screenshot, so that last refinement and the enlarged Clockwork presentation still need visual confirmation. Physical phone multitouch/fullscreen and full playthroughs remain user/device checks.
