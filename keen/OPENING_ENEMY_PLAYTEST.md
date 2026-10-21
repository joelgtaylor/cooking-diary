# Moonlit opening enemy art pilot

Use `keen/index.html?enemies=pilot` for a normal Bakery 1 start with the approved flour patroller and proofing hopper at the existing opening encounters (runtime enemy slots 3 and 4). Other enemies retain their original art. `enemies=off` or omitting the parameter retains the comparison artwork.

Use `?enemies=pilot&scene=gremlins-roof` to begin on the safe workshop roof at column 12, floor row 48, before the hopper's left bound. Replace pilot with off for a matching before view. No pickup, enemy or collision placement is changed. Scene shortcuts do not grant cultures or write storage. Reload to reset; normal mission restart follows existing initialization.

Art-only scope: the floor walker gets four boot-step poses; the hopper gets rest, rising, apex and descending poses selected from actual support and velocity. There is no crouch, added delay, health, speed, damage, projectile, reward or encounter change. The soft hats do not imply armor. The atlas is generated from the approved concept with the built-in image tool; each source pose is selected using render-time crops, without destructive raster processing. Both enemies remain within the prior 42px artwork envelope, feet anchored to the existing collision body; collision remains 25×25. The taller hat uses more of the hopper's visual height while the patroller stays broad.

Source: art/moonlit-opening-enemies.png, 1536×1024 RGBA, four columns/two rows. Prompt: four looping patroller walk poses, four hopper poses (rest/rise/apex/descent), matching aprons and caps, facing right, transparent background, no text or effects. A follow-up extraction request removes atmospheric background/halo without redesigning the sprites. Failed/loading art retains the current gremlin rendering.

Five added tests verify scope, fallback, velocity-based poses, 42px bounds, render purity, unchanged simulation and safe shortcut initialization. The combined game/audio suite has 266 tests. Review feet, facing direction, scale and hitbox readability; shoot and mixer-pogo both characters. Bosses and audio are untouched. No merge without approval.
