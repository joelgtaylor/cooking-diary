# Battle-worn baker and piping bag

Approved direction: cocky teenage action-hero baker with battered toque, spiky blond hair, flour/soot, rolled sleeves, patched trousers and scuffed boots. Piping bag fires small dough blobs; the mixer remains the pogo tool.

The approved baker is enabled by default on this branch. Use baker=off for the prior character/projectile appearance; baker=pilot remains an explicit equivalent of default. `?baker=pilot&scene=baker-workshop` starts at the existing safe floor approach to the first patroller, at column 16. Normal starts do not activate the scene or grant progress. Keyboard X/K or Shoot fires; Jump + Shoot fires upward, as before.

## Rendering

baker-pilot.js owns the new immutable atlas, draw crops, per-state pose choice and a WeakMap of successful-shot visual events. Shooting poses last seven simulation ticks with a three-tick squeeze/recoil. Only actual successful shots trigger these events: no ammo or held input without a shot produces no squeeze. Existing cooldown reset also clears this visual state. Running legs continue to alternate; airborne aiming has separate poses. Hanging and mixer pogo take visual precedence, retaining the same combat behavior while active. Invulnerability blink remains intact.

Eight rows/four poses: idle, run, rise/fall, hanging, mixer/climb completion, horizontal piping bag, upward piping bag, running horizontal/upward. All source poses share a common scale based on the standing model; feet anchor to the actor's foot, hanging hands align with the actual ledge top. Width/height remain within the former 84×96 image footprint. The original atlas remains the loading/failure fallback. Separate landing/hurt animation wiring remains deferred; existing blink is preserved.

Art: art/baker-grunge-actions.png, generated with the built-in image tool from the approved grungy concept. Prompt: consistent right-facing full-body poses, eight rows/four columns, cream triangular canvas piping bag in standing/running/airborne horizontal/upward squeeze poses, compact mixer for pogo, no text/scenery. Runtime rectangles select the actual returned PNG layout; no destructive raster processing. A follow-up art adjustment lowers horizontal firing hands/bag to match the established shot height.

Player shots draw as warm cream dough blobs in the same projectile rectangle. Spawn origins, velocity, dimensions, ammo use, firing cadence, damage, scores, collision handling, player hitbox, movement and input rules remain unchanged. No audio changes.

## Validation

Seven new tests cover default/disabled/loading paths, all 32 crops and size bounds, successful-shot event gating and expiry, moving/airborne aiming and action precedence, pure rendering/foot and hand anchors/facing/blink, exact 180-tick combat equivalence plus upward projectile equivalence, and immutable blob rendering/safe review scene. Full game/audio suite: 277 passing tests. Existing physics, grounding, boss and player-kit checks also pass.

Browser review should check the normal start, both aim directions, left/right, moving/airborne shots, feet and hat scale, and existing touch controls. The legacy view remains available with baker=off for regression comparisons.
