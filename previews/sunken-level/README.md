# The Sunken Patisserie — complete-level review

Build with `node previews/sunken-level/build.cjs`, serve the repository root, and open this directory. One game loop and the existing startup gate, shared physics, audio scene, fullscreen/touch shell and pause lifecycle are used throughout.

## Playable flow

Explore the approved four-section route and collect all five cultures. Exactly one Current Rider remains, with the approved reef fish, puffers and physical crab passage. The last dry landing leads into the Master of the Deep's arena only after all cultures are collected. Entry clears stale controls/projectiles, carries score and kefir, and resupplies to at least four hearts. The arena uses the approved three-stage fight and FULL ink by default, with REDUCED retained as a preference.

A boss retry restores the arena's clear opening directly, preserving cultures, score, remaining kefir, collected route supplies, pump state and defeated route enemies. After the entire four-second bow, the boss remains defeated and a warm, pressure-sealed finishing-oven pocket opens on the arena's left. Swim through its visible seal, return to dry movement, and enter the oven to complete World 4. The 1500 completion bonus is awarded once per run. Restart resets the whole level; retry after the bow preserves the victory. Pause/map work in route and arena scenes.

The scene boundary is an intentional one-way doorway to a self-contained boss chamber, preserving the reviewed arena's dimensions and timings. A shared dispatcher mounts the two existing installers; no duplicate game loop or copied boss state machine. Route and boss individual reviews remain available.

## Review shortcuts

- `index.html` — complete level from the Flooded Entrance.
- `index.html?scene=boss` — all cultures marked collected, direct full-fight review.
- `index.html?scene=oven` — defeated boss and open finishing oven for art/transition review.

Shortcuts are preview-only and write no recipe/best/progression saves. Production campaign/world registry and fourth recipe unlock are still a separate integration step after full-level approval; no merge is performed here. Existing preferences remain intact.

## Verification

`node --test previews/sunken-level/*.test.cjs`

Checks culture gating, one Rider, both heroes, preserved progress and resources, direct boss retry, complete defeat gating, wet/dry finishing-room collision, one-time completion, map/pause/restart, and an end-to-end run using real movement through the route, real shooting through the crab gate, the real full boss fight and finishing oven. Roaming enemies are disabled only in the automated traversal continuity case; their combat remains covered by the approved archetype suites and is active in the playable level.

No new bitmap assets: all route, boss, tool, ink, defeat and oven art is reused from approved work. Canonical water boundaries agree with the finishing room's visible pressure seal, roof and floor.
