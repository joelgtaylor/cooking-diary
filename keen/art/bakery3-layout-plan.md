# Bakery 3 — factory entrance, step 1

The approved Grand Devourer trial remains separate and unchanged. This step
rebuilds only columns 4–25, rows 43–53 in the normal Bakery 3 layout.

A sheltered ground-level maintenance passage contains culture one and an early
kefir bottle. A permanent sign explains that kefir is stored and activated with
V or the Kefir touch button. Both side doors are three tiles high; the floor is
continuous. The passage is free of enemies and hazards, with checkpoint one
outside the entrance at column 6. Dash is optional and no traversal is timed.

Exterior steps reach a solid riveted service roof. A hopper guards an
optional supply cache (+500 score / +15 ammo once per attempt). The roof rejoins
the exit catwalk, where a bounded walker precedes a stationary dough thrower
on the upper landing. The thrower retains the existing visibility checks,
90-tick startup, 36-tick direction-locked warning and slow straight projectile.
Normal held jumps climb the exit to the original column-28 / row-39 ledge.
The intermediate row-52 step also supports shorter jumps.

The old spike at column 24 is removed from beneath this introductory climb.
The unsupported old entrance walker is relocated to the bounded catwalk patrol.
Later tiles, cultures, checkpoints, powerups and enemies are preserved;
the original first culture/checkpoint are relocated, with five cultures total.
Bakery 1/2, physics, camera, music and boss tuning are unchanged. Recessed wall
panels, pipework and signs are non-colliding backing drawn before terrain and
actors. Solid geometry remains exclusively in the layout.

The historical Bakery 3 layout is frozen for the 4,320-frame regression, as
already done for Bakery 1/2. Dedicated tests cover the new map boundary, ten
route segments, safe passage, actual culture/kefir pickup, optional cache,
checkpoint protection, bounded encounters and warned thrower counterplay.
Rendering reviews include passage, roof and exit views. All 175 tests pass.
Bakery 1/2 render traces are exact; Bakery 3 traces intentionally include the
new entrance and updated overview map/checkpoint metadata. The isolated boss
mechanics and visible arena artwork are unchanged. Awaiting playtest.

`tools/package-factory-preview.py OUTPUT_DIR` prepares isolated HTML/save-key
overrides for a copy of the `keen` subtree hosted at `previews/factory/`.


## Step 2 — Clockwork ascent

Columns 26–77, rows 16–53 now alternate open catwalks with two riveted
maintenance halls. The approved entrance and original final descent are exact.
Culture two is on the Copper Service Hall shelf; culture three is inside the
Pressure Gallery. Both are on the main route. Checkpoints sit on the hall's
approach balcony and beyond a solid summit parapet. The unsupported old middle
walker is moved to a supported entrance patrol. A hopper and a warned thrower
pressure the exposed central climb, with the two interiors offering quieter
spaces. Existing enemy behaviors, movement, camera, audio and boss tuning stay
unchanged.

An explicitly marked optional roof loop climbs above the Pressure Gallery.
A shield precedes a bounded hopper / thrower pairing. Two once-only supply
caches provide ammo and score, without cultures. The roof drops to the main
landing outside the gallery's right door. A player who skipped culture three
can walk back through the door to retrieve it. No dash or pogo is mandatory.
Recovery shelves lead from the lower floor back to the first hall and central
catwalk. The normal jumps, door clearances, bonus return, actual culture pickup,
checkpoint protection and enemy bounds have dedicated tests.

The first entrance implementation is retained as a comparison fixture. Its
historical boundary test uses that fixture; current entrance route and encounter
tests still run against the production layout. Bakery 1/2 render traces remain
exact. Bakery 3's overview map and offscreen checkpoint commands intentionally
change, alongside four new ascent render cases. Reviewed loaded-art views cover
both halls, the central bridge and bonus roof. All 183 tests pass.

`tools/package-ascent-preview.py OUTPUT_DIR` prepares namespaced preview
HTML/save overrides for `previews/ascent/`. It starts at the second checkpoint
with culture one banked; buttons offer the bonus roof and full Bakery 3.
Awaiting difficulty and flow playtest. The final descent and boss integration
remain the next phase.


## Step 3 — final descent and the grand oven

The last section now spirals through cultures four and five on broad descending
terraces, guarded by a bounded patroller and hopper. A continuous return bridge
leads west into a quiet service stairwell and the fourth checkpoint. Alternating
one-way steps can be descended without a jump and climbed again with ordinary
jumps. Two new stair landings occupy previously empty columns 76–77 below row
36; every other tile west of column 78 is exact, including the approved summit.
The old upper walker and arena-floor spikes are removed. The existing health
pickup moves to the descent. First three cultures/checkpoints and all earlier
encounters/powerups are preserved.

The floor-level checkpoint restores at least three hearts, 65 ammo and one
stored kefir charge, on first activation and retry. It is outside the boss's
activation range. The right shelter, refreshable ammo, pogo shelf, floor and
right wall match the approved isolated arena exactly. All overhead descent
platforms are above the boss's maximum leap silhouette. Crossing those terraces
cannot reveal the oven: engagement now requires proximity at oven-floor height.

The Grand Devourer uses the same twelve health, attack cadence, leap arc,
landing lock, door openings, precision pogo target and defeat sequence as the
approved trial. It now guards normal Bakery 3 completion. The final recipe
requires five cultures, the completed collapse, and proximity to the wreck.
Defeat opens the entry gate so missed cultures remain recoverable. The normal
mission restart returns to the factory entrance; isolated practice still restarts
its arena. Regular checkpoint flags remain visible; the separate ordinary oven
is suppressed to avoid a duplicate finish point.

Ten new tests cover preserved layout boundaries, thirteen descent/walking
segments, nine recovery jumps, actual culture collection, overhead engagement,
checkpoint resupply/clean retry, identical arena cells, enemy counterplay, real
shooting to twelve-health defeat, recipe gating and both restart paths. The
historical ascent boundary test uses its frozen approved fixture; current route
tests run against the new complete layout. Reviewed loaded-art views cover the
terraces, service stairs, checkpoint and settled wreck. All 193 tests pass,
including the unchanged 4,320-frame movement regression. Only Bakery 3 render
traces change, with five dedicated finale states and the updated overview map.

`tools/package-finale-preview.py OUTPUT_DIR` builds isolated save-key overrides
for `previews/finale/`. It starts at the summit with three cultures banked. A
final-checkpoint shortcut banks all five for immediate integrated boss testing;
Full Bakery 3 starts the complete mission. Awaiting playtest; do not merge the
feature branch until approved.


### The recovered finish oven

The Devourer now ejects the real Bakery 3 oven 30 grounded ticks into his
collapse. A 48-tick arc lands it in a clear bay on the opposite side of the
wreck, away from the pogo shelf and shelter roof. It uses the existing oven
atlas, gains its familiar fire when ready, and carries an explicit finish label.
The completion target and map marker follow this real oven rather than the
wreck. The original 120-tick collapse, battle tuning and 2,000-point reward are
unchanged. Completion still requires five cultures and a finished collapse, plus
the oven having landed. Retry removes the recovered oven and resets the fight.
A preview-only Replay oven reveal button demonstrates the entire sequence.

Three new tests cover one-time release/landing, both unobstructed landing bays,
completion timing and location, reset, pause and the real oven draw path.
All 196 tests pass; reviewed rendering differences are confined to Bakery 3
ending states. Loaded artwork inspected with the wreck and recovered oven.
