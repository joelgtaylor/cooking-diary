# Grand Devourer — tactical player kit prototype

The boss and shelter remain isolated behind `startDevourerPreview()`. Normal Bakery 3 geometry is unchanged. The user-approved faster firing, upward aim and stored kefir controls are shared by all three worlds; regular movement speed, jump physics, camera, music, recipes and existing layouts remain intact. `leaveDevourerPreview()` restores the authored level with the new player controls.

## Battle and shelter

Approaching within205px transforms the oven with no warning text. First takeoff locks its destination; later leaps retain the48-tick visible target warning,160px travel cap,60-tick cooling phase,30-tick landing pause, alternating boule/kefir barrage and108-tick recovery (24pressure-release,60open,24sealed). Health stays12. No barrage or damage reduction.

The leap now rises380px instead of190. Ascent speed is retained by doubling ascent time:24ticks for the ambush,36 for repeats. Descent takes34/51ticks, giving about70% of the former average downward speed. Total flights58/87ticks. An above-screen cue and landing stripe maintain readability when the massive sprite leaves the viewport. The collision body remains112×148. The exposed furnace is93×96 and accepts horizontal shots through its door or upward shots through the leg gap while open; closed armor still blocks both. The door is open throughout ascent and descent, closes on landing, and reopens in recovery. Airborne defeats fall to the floor rather than freezing in midair.

A solid steel roof at columns100..103,row50 provides a96px-high service shelter, open on the left. Baker38px fits; boss148px cannot. Landing/body bounds stop the boss outside the opening. Real solid-tile collision blocks boules and player bullets through the roof. The shelter contains a kefir bottle and a clearly labeled ammo cache (+25,5-second refresh, visible countdown, no score reward). It resets ready on retry; cooldown runs only during play and continues through ordinary ledge handling. Preview start/retry supplies at least one stored charge and65ammo. No invulnerability is granted by the shelter or dash.

## Shared player controls

- Fire period26/3ticks (8/9-tick spacing), exactly50% faster than13ticks. A shot can fire immediately when ready; release/restart cannot accumulate burst credit.
- Holding jump+shoot fires straight up. Release jump to shoot horizontally while airborne; normal jump physics are unchanged. Upward bullets hit solid tiles, enemies and boss weak points and expire above the map.
- Kefir pickups add stored charges and do not start a boost. V or the contextual touch button consumes one charge for the existing480-tick duration. Speed is8.1px/tick,50% above the previous5.4; ordinary speed stays3.6. Pausing does not consume charges/time; repeated activation cannot stack the active boost. Death ends the active boost and preserves unused charges.

## Remaining boss systems

Odd cycles replace the five-boule barrage with a seven-droplet contaminated kefir fan, fired7ticks apart across the same50-tick attack slot. The30-tick landing phase warns of the valve charge and locks facing at spray start. Droplets are smaller than boules, stop at solid tiles, and may leave at most two24px puddles for60ticks outside the service shelter. The pressure vent clears both droplets and puddles before the shooting opening. No extra attack is stacked into the cycle; health, leap, door, cooling and boule parameters remain as approved.

The small ceramic cap is now a20×8 pogo target, aligned to the generated sprite and mirrored facing. Only descending crossings from above count. A correct pogo rebounds with normal12.3 velocity and deals one hit through the existing18-tick boss protection; the surrounding armor clangs/rebounds without damage. The first8 transformation ticks hide/disable the cap until its sprite reaches the correct scale. A real-control test reaches the cap from the maintenance shelf.

Defeat clears all hostile effects, falls to the floor if airborne, impacts once, buckles over24ticks, vents twice, then uses the dedicated cold-wreck sprite. The grounded sequence lasts120ticks; rewards remain once per attempt. Enrage and full level integration remain deferred so they do not disturb the approved difficulty. Next work is the Bakery3 route redesign.

## Artwork

`devourer-forms.png`, original2007×784 RGBA built-in imagegen output, transparency preserved. Canvas crops: disguised[160,160,560,590], transformed[950,0,965,755]. Rendered190px and260px tall, respectively. Wide gutters prevent neighboring sprite fragments. The open furnace/door effect and boules are provisional native pixel-art overlays; dedicated firing/door poses can follow mechanics playtesting.

Reference: approved side-by-side Grand Devourer chamber concept (`exec-5b5e72d0-2d99-4684-a73e-c77e833f55fa.png`), based on existing Bakery3 parallax and oven art. Existing parallax supplies the trial background; the concept's baked characters are never used as a backdrop.

Exact built-in imagegen prompt:

> Use case: precise-object-edit. Production sprite atlas from the approved Grand Devourer design in the reference. TRANSPARENT BACKGROUND, opaque bodies. ONE horizontal row, TWO distinct sprites, equally sized half-canvas cells with wide clear transparent gutters. LEFT: complete disguised oven, same handsome cast iron and brass oven from reference left panel, upright copper twin chimneys, loaf medallion, closed arched oven door, pressure gauge, pale ceramic top pressure cap, no arms or legs or face. RIGHT: full transformed clockwork mimic from reference right panel, retain SAME oven identity, sloped twin copper chimneys, closed armored arched oven door, loaf medallion, small pale ceramic pressure cap on top, powerful piston legs and iron claw arms, amber hot vent slits. Facing LEFT in three-quarter sideview, feet on same horizontal baseline as disguised oven base. Entire sprites visible with margin ALL sides, no overlaps. Both roughly same overall height in the sheet, active monster wider and more muscular. Preserve richly detailed late1990s DOS pixelart, dark indigo outlines, worn brass rivets, strong silhouettes. No background, NO floor, NO baker, NO shadow, NO labels or text, NO projectiles, NO checkerboard. Clean fully isolated game sprites.

## Validation and packaging

170 tests pass. The29 combined boss/player-kit tests cover isolation, high asymmetric arc, target locks, repeat pacing, exact firing rate, upward controls/door damage, stored/activated kefir with keyboard/touch/pause/death, actual shelter clearance/boule protection, bullet admission from both directions, real airborne horizontal shooting, defeat with starting ammo, and equal30/60/120fps battle timing. New coverage checks alternating spray cadence, bounded/cleared puddles, actual pogo cap hits versus armor, real shelf-to-cap movement, pause/fatal-puddle cleanup and once-only grounded defeat effects.

Sixteen isolated Devourer render cases are reviewed in both baselines; all prior non-Devourer render traces remain unchanged. All4320 historical-layout simulation frames are re-reviewed for the explicitly requested global firing/aim changes. Re-running the prior player modules reproduced every previous hash before updating the baseline; the historical levels and default movement constants are unchanged. These traces no longer claim pre-extraction combat equivalence.

Build: `python keen/tools/package-devourer-preview.py /absolute/output.zip`. All scripts and literal art URLs embed in `Bakery-3.html`. Native canvas QA renders the actual embedded HTML and rejects external asset URLs. Toolbar is above the game. Do not merge until approved.

## Defeat art provenance

`devourer-defeated.png`:1536×1024 RGBA, original built-in imagegen output, alpha preserved. Canvas crop[70,170,1438,754], rendered340×178 at rest. Reference: `devourer-forms.png`. Exact prompt:

> Use case: precise-object-edit. Production game sprite. Create ONE complete DEFEATED pose of the transformed oven monster from the RIGHT side of reference. Preserve its exact Grand Devourer identity: heavy indigo cast-iron rectangular oven torso with riveted brass trim, loaf medallion, two copper chimneys, pressure gauge, small pale ceramic pressure cap, articulated claw arms and piston legs. It has collapsed into a squat wide wreck on the floor: piston legs folded and buckled outward, arms limp, torso slumped low, chimneys bent sideways, armored door hanging open a little with DARK cold soot interior, no glowing eyes or fire. Recognizable oven, not abstract scrap heap. No organic parts or gore. Entire subject visible with generous transparent margin on all sides, facing LEFT, weight resting on a single flat baseline. Rich detailed late1990s DOS pixel art matching reference exactly, strong opaque surfaces and crisp dark outline. Genuine transparent background. No shadow, no floor, no smoke, no steam, no sparks, no detached floating objects, no other poses, no text, no checkerboard.
