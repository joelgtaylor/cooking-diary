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
