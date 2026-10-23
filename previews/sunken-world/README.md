# The Sunken Patisserie — four-section route preview

Milestone 5, October 23, 2026. A reviewable connected level using approved movement, aquatic enemy behavior, masonry and music. Stops at the octopus boss approach: no boss, fourth recipe, campaign registry or merge yet. Unlimited ammunition remains enabled for route/encounter tuning, as in the earlier isolated previews. Hero swimming still uses the approved concept-derived temporary poses rather than final animation sheets.

## Route

105×56 tiles. Solid roof, floor and chamber divides constrain free swimming. The main path descends, climbs and returns to air rather than crossing a flat empty pool.

| Section | Route and landmark | Culture / encounter |
| --- | --- | --- |
| Flooded Entrance | Warm oven landing, safe water entry, submerged arch and deep exit slot | Culture 1; first bounded reef patrol |
| Coral Proofing Gardens | Fermentation loft, two offset baffles, descent into the lower rotunda | Culture 2; one aggressive Puffer and reef patrol; optional healing/kefir loft |
| Pressure Kitchens | Pump gallery, lower service cache, upward current shaft, dry copper kitchen, pressure doorway | Culture 3 in dry pocket; exactly one Current Rider; required crab passage |
| Abyssal Patisserie | Oven nave, descending left flue, bottom crossing, far rise and final dry landing | Cultures 4 and 5; another Puffer/reef encounter; optional healing side visit; boss approach |

Main-route symbols reuse pale directional arrows. Five cloth-covered culture jars use the approved production identity art. Optional branches offer healing, kefir and score rather than extra required cultures. Four forward checkpoints plus the initial landing use the established animated flags. Checkpoints resupply at least three hearts.

Pump: Interact/E or shoot its wheel to reverse the local horizontal current. Both heroes share the same immediate interaction; no puzzle chain. The current is bounded and escapable in either direction. The shaft bubble vent provides the existing bounded upward flow. No flooding/oxygen system.

The crab's 96×96 body fills the sole kitchen-to-abyss aperture through every living/open/death frame; the divider connects floor to roof. Defeat clears a real route. Checkpoint recovery retains collected cultures, consumed supplies, pump direction and defeated enemies (including the crab and sole Rider). Living enemies reset to their original state and positions. Restart mission resets the attempt. Production recipe/score saves are not written.

Pause → World map, or Q, shows actual collision, culture positions, a suggested main route and the player. The final landing requires all five cultures to show **ROUTE COMPLETE · OCTOPUS ENCOUNTER COMES NEXT**. No false level-complete/recipe-unlock flow is presented.

## Implementation and assets

- `layout.js`: central authored collision, districts, water regions, cultures, checkpoints, optional supplies, current pump and enemy placements.
- `world.js`: preview lifecycle, collision adapter, combat dispatch, item/checkpoint rules, pump, rendering and map.
- `enemy-art.js`: reviewed sprites, telegraphs and claw-grab presentation reused with the original pure archetype modules. Fixed collision remains in those modules.
- `build.cjs`: derives the existing fullscreen/touch shell and approved audio adapter.
- Small preview-only hooks expose the existing swim regions/current arrays and Flooded Entrance artwork helpers. Defaults preserve all prior preview layouts and tuning.

No new generated artwork. Reuses the approved Sunken concept skyline, architecture kit, continuous masonry, enemy sheets, culture/supply identities, checkpoint flag and World 4 score. The three production worlds load none of this level adapter.

This first route pass deliberately reuses the environmental kit. Final district art variety, encounter spacing and mobile difficulty await review; the full boss encounter remains a separate milestone.

## Validation

Build with `node previews/sunken-world/build.cjs`.

`node --test keen/tests/*.test.cjs previews/audio/audio.test.cjs previews/sunken-audio/*.test.cjs previews/flooded-entrance/audio.test.cjs previews/puffer/*.test.cjs previews/current-rider/*.test.cjs previews/pot-crab/*.test.cjs previews/sunken-world/*.test.cjs`

Route tests verify wet-body connectivity to every culture, the full-height non-bypassable crab gate, one Rider only, safe checkpoint bodies, checkpoint/restart persistence, both pump inputs, a real-control traversal from the entrance through all five cultures and the final dry exit, actual fire defeating the integrated crab, both hero renders and the map. The traversal test isolates movement by disabling enemies; existing archetype suites cover combat. These checks do not substitute for human review of the combined placements or a physical-phone playthrough.

## Water / scenery coherence review

Joel's phone screenshots exposed a dry kitchen drawn like open ocean, plus floating masonry from a misidentified “coral” crop. The kitchen is now an explicitly enclosed, warm pressure chamber: opaque tiled back wall, roof/floor-connected copper frames, visible permeable air seals at the actual x=54 and x=64 mode boundaries, oven heat, and an AIR POCKET marker/HUD state. Its bounds and surrounding water rectangles share layout metadata. Water surfaces are not drawn through solid floors, and ambient bubbles use the same water regions as movement and never enter the air pocket or masonry.

Removed the floating pillar fragments rather than disguising them as plants. Furnishings and facade metadata now live with collision layout; tests verify their bases/panels have real solid support. The route, culture locations, dry/swim tuning and approved enemy mechanics are unchanged.

Inspection links: `?scene=kitchen` and `?scene=garden-floor` start at the two screenshot locations for visual review. They do not change ordinary mission startup or save progress. Additional checks scan all reachable submerged space for rendering/movement region agreement and move through both kitchen seals in both directions.
