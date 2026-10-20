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
