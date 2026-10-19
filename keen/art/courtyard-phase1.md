# Bakery 1 courtyard/workshop prototype

Phase 1 changes only columns 4–21, rows 44–52 in Moonlit Bakery. Existing geometry outside that rectangle, other bakeries, enemy definitions, hazards, powerups, recipes, physics and music are unchanged.

The original five repeated ledges become courtyard steps, a solid workshop roof with open three-tile-high side doorways, an interior yeast shelf and a rooftop stair tower. The tower reconnects with the existing upper branch. Held normal jumps traverse the main steps and tower; pogo can jump from outside the doorway onto the roof. The first culture moves into the workshop and the first checkpoint moves down to the courtyard landing. There are still five required cultures: the interior is a detour from the roof route, not a sixth or optional completion requirement.

`architecture.js` draws only the rear wall, windows, workbench, sign and lintel trim; collision comes exclusively from the layout. Doors are openings, with no new interaction or loading mechanic.

Tests verify doorway passage, yeast collection, six route segments with actual player physics, safe checkpoint respawn, bounded geometry edits and unchanged enemies/other worlds. The original layout is frozen in `tests/fixtures/bakery1-original.js` for the historical 4,320-frame physics regression; production geometry has separate route tests. Render snapshots intentionally change only Bakery 1. Test harness native-canvas/Image overrides support visual inspection without changing production code.

Pending user play-testing. Later phases place and vary encounters; no additional enemies are introduced here.
