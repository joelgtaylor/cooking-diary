# Grand Devourer — isolated first fight prototype

Enabled only by `startDevourerPreview()`. Normal Bakery 3 layout, all existing world render traces, player physics/camera/input/music/recipes remain unchanged. No normal-player prototype buttons. `leaveDevourerPreview()` restores the authored level.

The apparently safe grand oven has no boss health banner. Approaching within 205px launches the transformation/slam immediately, with no warning text. Takeoff locks the player's horizontal position, bounded to the arena. A 24-tick sine flight rises190px, then impacts with a112×148 body box; a landing stripe and shadow show the locked target. Existing movement from rest can narrowly escape. Repeat slams get a24-tick piston cue.

After a10-tick landing, five flaming boules fire10 ticks apart. They arc under gravity, bounce once, collide with solid walls, expire and respect player invulnerability. A60-tick recovery follows; the door opens for the first36ticks. Shots can travel through the outer body to the exposed mouth; armor elsewhere consumes them with a clang. Mouth requires a jump or the96px maintenance shelves. Boss12HP,18-tick hit protection. Three player hearts,65ammo. Retry checkpoint outside entry restores ammo and resets fight/projectiles. Defeat opens entry and gives2000points once per attempt; final defeat animation follows in pass3.

The prototype deliberately excludes kefir spray, the small top pogo weak point, enrage tuning and level integration. The pale ceramic cap is visible artwork, not yet an active target. No half-health modifiers yet.

## Artwork

`devourer-forms.png`, original2007×784 RGBA built-in imagegen output, transparency preserved. Canvas crops: disguised[160,160,560,590], transformed[950,0,965,755]. Rendered190px and260px tall, respectively. Wide gutters prevent neighboring sprite fragments. The open furnace/door effect and boules are provisional native pixel-art overlays; dedicated firing/door poses can follow mechanics playtesting.

Reference: approved side-by-side Grand Devourer chamber concept (`exec-5b5e72d0-2d99-4684-a73e-c77e833f55fa.png`), based on existing Bakery3 parallax and oven art. Existing parallax supplies the trial background; the concept's baked characters are never used as a backdrop.

Exact built-in imagegen prompt:

> Use case: precise-object-edit. Production sprite atlas from the approved Grand Devourer design in the reference. TRANSPARENT BACKGROUND, opaque bodies. ONE horizontal row, TWO distinct sprites, equally sized half-canvas cells with wide clear transparent gutters. LEFT: complete disguised oven, same handsome cast iron and brass oven from reference left panel, upright copper twin chimneys, loaf medallion, closed arched oven door, pressure gauge, pale ceramic top pressure cap, no arms or legs or face. RIGHT: full transformed clockwork mimic from reference right panel, retain SAME oven identity, sloped twin copper chimneys, closed armored arched oven door, loaf medallion, small pale ceramic pressure cap on top, powerful piston legs and iron claw arms, amber hot vent slits. Facing LEFT in three-quarter sideview, feet on same horizontal baseline as disguised oven base. Entire sprites visible with margin ALL sides, no overlaps. Both roughly same overall height in the sheet, active monster wider and more muscular. Preserve richly detailed late1990s DOS pixelart, dark indigo outlines, worn brass rivets, strong silhouettes. No background, NO floor, NO baker, NO shadow, NO labels or text, NO projectiles, NO checkerboard. Clean fully isolated game sprites.

## Validation and packaging

149 tests pass, including8 new battle tests: isolation/trigger, fixed takeoff target/flight, damage versus real-movement escape, exact boule cadence/door duration, actual moving bullets from both directions, projectile/fatal-respawn cleanup, checkpoint/restart/defeat and render purity/identical30/60/120fps timing. Five new isolated Devourer trace cases are reviewed in both baselines; all prior traces unchanged, historical4320 movement frames unchanged.

Build: `python keen/tools/package-devourer-preview.py /absolute/output.zip`. All scripts and literal art URLs embed in `Bakery-3.html`. Native canvas QA renders the actual embedded HTML and rejects external asset URLs; disguise, flight, boules and door checked. Preview toolbar is above the game to avoid hiding the floor. Readme documents scope and controls. Do not merge until approved.
