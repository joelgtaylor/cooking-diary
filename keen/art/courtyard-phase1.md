# Bakery 1 courtyard/workshop prototype

Phase 1 changes only columns 4–21, rows 44–52 in Moonlit Bakery. Existing geometry outside that rectangle, other bakeries, enemy definitions, hazards, powerups, recipes, physics and music are unchanged.

The original five repeated ledges become courtyard steps, a solid workshop roof with open three-tile-high side doorways, an interior yeast shelf and a rooftop stair tower. The tower reconnects with the existing upper branch. Held normal jumps traverse the main steps and tower; pogo can jump from outside the doorway onto the roof. The first culture moves into the workshop and the first checkpoint moves down to the courtyard landing. There are still five required cultures: the interior is a detour from the roof route, not a sixth or optional completion requirement.

`architecture.js` draws only the rear wall, windows, workbench, sign and lintel trim; collision comes exclusively from the layout. Doors are openings, with no new interaction or loading mechanic.

Tests verify doorway passage, yeast collection, six route segments with actual player physics, safe checkpoint respawn, bounded geometry edits and unchanged enemies/other worlds. The original layout is frozen in `tests/fixtures/bakery1-original.js` for the historical 4,320-frame physics regression; production geometry has separate route tests. Render snapshots intentionally change only Bakery 1. Test harness native-canvas/Image overrides support visual inspection without changing production code.

Pending user play-testing. Later phases place and vary encounters; no additional enemies are introduced here.

## Phase 2: workshop encounters

Add two enemies without changing the approved geometry: a ground-level patroller in the right-hand workshop bay, and a roof hopper beyond the first landing. Explicit encounter bounds keep them away from the courtyard checkpoint, doorway approach and roof entry. Their original speeds, hopper launch strength/cadence, hitboxes, shooting rewards and pogo-stomp behaviour are retained. Existing enemy placements remain unchanged; Bakery 1 now has five enemies.

The old hopper branch uses a 620px cleanup limit and does not land on one-way platforms. New authored encounters use world-height cleanup and support-aware landing, leaving the legacy path unchanged for the historical regression fixture. Tests run 900 enemy frames for survival/bounds, verify safe checkpoint recovery, shooting from the approach and the existing pogo reward. The preview compares encounters against the approved Phase 1 layout with the two new enemies omitted.

## Phase 3: stationary dough thrower

One thrower stands at column 30 on the existing row-40 ledge, beyond the approved opening. No geometry or earlier encounters change. A blue apron, raised dough ball, warning marker and wind-up meter distinguish it. Its startup delay is 90 simulation ticks, wind-up 36 ticks, cooldown 150 ticks and projectile speed 2.3px/tick (slower than the baker's 3.6px/tick run). Shots travel straight in the direction chosen when the wind-up begins; they do not home.

Attacks require the enemy to be on screen, within 256px horizontally and 55px vertically, with no solid wall between it and the baker. Losing that opportunity cancels the wind-up and restores the startup delay. Shots expire after 150 ticks, stop at solid walls, deal normal damage once, and disappear when their owner is defeated or the baker respawns/restarts. Ordinary shooting and pogo stomps retain their existing rewards. All timing advances in the fixed simulation, not the renderer.

Tests cover full warning duration, locked direction, offscreen/range/cover gating, dodging, single-hit damage, wall collision, cleanup and ordinary defeat. Render snapshots include warning/projectile states. The preview starts at an isolated thrower approach, with an option to play the full level from the beginning. Awaiting difficulty play-test.

## Phase 4a: Moonlit Ascension

Rebuild columns 23–52, rows 28–48 around a Proofing Hall. A lower balcony leads through three-tile-high open side doors to an interior shelf holding culture two. Exterior steps lead to the solid hall roof and a high bridge; a pogo jump from the entrance balcony shortcuts those steps. The lower exit has a continuous landing before its upward jumps. Both paths reconnect at the existing High Towers climb, column 52 onward.

Move checkpoint two to the balcony outside the hall. Relocate the old unsupported middle walker into a bounded interior patrol, and add one bounded rooftop hopper beyond the initial roof landing. The opening's two encounters and the column-30 thrower stay unchanged. Powerups, hazards, the other three cultures and later level geometry are retained. The lower path is a yeast detour; all five cultures remain required.

Eleven route checks use actual player physics to validate ordinary jumps, interior shelf access, the pogo shortcut and both rejoins. Tests also verify passage/culture collection, continuous exit footing, safe checkpoint recovery, enemy survival and exact preservation outside the section. The approved workshop layout is frozen as a comparison fixture. All 75 tests pass; only Bakery 1 render snapshots change. Native-canvas scene inspected with loaded art. Pending difficulty/play-flow review before expanding to High Towers.

## Phase 4b: High Towers

Rebuild only columns 53–77, rows 16–37. A lower bridge patroller and upper-ledge hopper form the first pair, guarding the existing third culture. A clear landing separates this encounter from a watchtower rooftop patroller/thrower pair. Existing enemy speeds, damage, hop timing and thrower warning/projectile settings remain unchanged. A short jump can catch the four-tile tower lip with the original ledge-grab mechanic; a longer pogo approach reaches its upper bridge directly.

Recovery balconies below the crossings reconnect to the climb. A solid parapet at column 75 blocks the upper thrower's line of sight to checkpoint three, moved to the sheltered summit landing at column 76. The exit reconnects to the untouched Oven Descent at column 78 onward. All cultures and powerups retain their Ascension positions. Approved opening and Ascension geometry/enemies are frozen in the comparison fixture and protected by exact boundary tests.

Tests cover twelve jump/recovery/rejoin segments, a real short-jump ledge grab and climb, 900 frames of checkpoint protection and patrol-bound checks, and delayed upper-pair projectile pressure. All 80 tests pass. Only Bakery 1 render snapshots change. Native-canvas composition inspected with loaded artwork. Preview starts at the tower entrance with previous-layout and full-level options. Pending difficulty play-test.

## Mini-boss step 1: Oven Descent and Foreman scale

Replace only columns 78–104, rows 20–53. Broad terraces descend east through cultures four and five, then turn west toward a foyer and the forecourt. Ten walking/drop segments are tested without jumping; eight normal-jump segments verify the route back to both cultures. Relocate the existing last walker to a supported, bounded early terrace, leaving the arena free of ordinary enemies. Remove the two old arena-floor spikes, relocate checkpoint four to the ground-level entrance at column 88, and keep the forecourt open for retreat. The oven now rests on the row-54 forecourt rather than the old row-52 ledge; its existing completion trigger still works.

`foreman-concept.png` is the approved image-generation concept copied byte-for-byte into the project. The runtime crops transparent export padding (source rectangle 16,18,1314,1131) and renders it at 154×132px, feet on the row-54 floor. An anchored contact shadow grounds the body. The image is culled outside the viewport. No physics actor, collision box, attacks, health bar, boss reward or new completion gate exists in this step.

All 84 tests pass, including frozen-layout boundary checks, ten drop segments, eight return jumps, safe checkpoint, empty forecourt and render-only state preservation. Only Bakery 1 snapshots change; specific descent/Foreman states are included. The approved High Towers fixture is retained for comparison. Native-canvas scene inspected with loaded artwork. Preview-only scene controls supply the first three cultures at the descent entrance, or all five in the scale scene; production progression is unchanged. Pending layout/scale play-test before the peel-sweep attack.

## Mini-boss step 2: peel-sweep timing trial

The Foreman now has an isolated stationary attack cycle: 90-tick initial grace, 60-tick raised-peel warning, 18 active sweep ticks and 120 recovery ticks. Direction locks when the warning starts. A low 132×30px attack rectangle matches the visible blade; ordinary jumping clears it. A sweep deals normal damage at most once per cycle. Retreat out of range cancels the cycle, and checkpoint recovery resets it while preserving yeast. The checkpoint is outside attack activation range. No body-contact damage, boss health, player damage to the boss, defeat reward or boss completion gate exists yet.

A newly generated low-sweep key pose matches the approved character. The renderer aligns body/head scale and foot centre with the original pose, mirroring both pose and hit area together. A warning label, timer and dashed floor strip announce the reach; recovery has a separate label. These are key poses for timing review; fuller transition animations follow later.

All 90 tests pass, including full warning/recovery timing, a real-physics jump dodge, one-hit-per-cycle behaviour, direction lock, retreat/respawn/reset, pause/render isolation and equal attack simulation at 30/60/120 render fps. Original movement regression remains unchanged. Only Bakery 1 render snapshots change, with explicit wind-up/sweep/recovery cases. Native-canvas sweep composition inspected. Browser ZIP initializes and advances the trial in the bundled runtime check; it is now the primary play-test delivery because the in-chat HTML viewer showed source text.
