# Grand Devourer — tactical player kit prototype

The boss and shelter remain isolated behind `startDevourerPreview()`. Normal Bakery 3 geometry is unchanged. The user-approved faster firing, upward aim and stored kefir controls are shared by all three worlds; regular movement speed, jump physics, camera, music, recipes and existing layouts remain intact. `leaveDevourerPreview()` restores the authored level with the new player controls.

## Battle and shelter

Approaching within205px transforms the oven with no warning text. First takeoff locks its destination; later leaps retain the48-tick visible target warning,160px travel cap,60-tick cooling phase,30-tick landing pause, five-boule barrage and108-tick recovery (24pressure-release,60open,24sealed). Health stays12. No barrage or damage reduction.

The leap now rises380px instead of190. Ascent speed is retained by doubling ascent time:24ticks for the ambush,36 for repeats. Descent takes34/51ticks, giving about70% of the former average downward speed. Total flights58/87ticks. An above-screen cue and landing stripe maintain readability when the massive sprite leaves the viewport. The collision body remains112×148. The exposed furnace is93×96 and accepts horizontal shots through its door or upward shots through the leg gap while open; closed armor still blocks both. The door is open throughout ascent and descent, closes on landing, and reopens in recovery. Airborne defeats fall to the floor rather than freezing in midair.

A solid steel roof at columns100..103,row50 provides a96px-high service shelter, open on the left. Baker38px fits; boss148px cannot. Landing/body bounds stop the boss outside the opening. Real solid-tile collision blocks boules and player bullets through the roof. The shelter contains a kefir bottle. Preview start/retry supplies at least one stored charge and65ammo. No invulnerability is granted by the shelter or dash.

## Shared player controls

- Fire period26/3ticks (8/9-tick spacing), exactly50% faster than13ticks. A shot can fire immediately when ready; release/restart cannot accumulate burst credit.
- Holding jump+shoot fires straight up. Release jump to shoot horizontally while airborne; normal jump physics are unchanged. Upward bullets hit solid tiles, enemies and boss weak points and expire above the map.
- Kefir pickups add stored charges and do not start a boost. V or the contextual touch button consumes one charge for the existing480-tick duration. Speed is8.1px/tick,50% above the previous5.4; ordinary speed stays3.6. Pausing does not consume charges/time; repeated activation cannot stack the active boost. Death ends the active boost and preserves unused charges.

Kefir spray, precision pogo weak point, enrage tuning, final defeat animation and full level integration are still deferred. The pale ceramic cap is artwork, not an active target yet.

## Artwork

`devourer-forms.png`, original2007×784 RGBA built-in imagegen output, transparency preserved. Canvas crops: disguised[160,160,560,590], transformed[950,0,965,755]. Rendered190px and260px tall, respectively. Wide gutters prevent neighboring sprite fragments. The open furnace/door effect and boules are provisional native pixel-art overlays; dedicated firing/door poses can follow mechanics playtesting.

Reference: approved side-by-side Grand Devourer chamber concept (`exec-5b5e72d0-2d99-4684-a73e-c77e833f55fa.png`), based on existing Bakery3 parallax and oven art. Existing parallax supplies the trial background; the concept's baked characters are never used as a backdrop.

Exact built-in imagegen prompt:

> Use case: precise-object-edit. Production sprite atlas from the approved Grand Devourer design in the reference. TRANSPARENT BACKGROUND, opaque bodies. ONE horizontal row, TWO distinct sprites, equally sized half-canvas cells with wide clear transparent gutters. LEFT: complete disguised oven, same handsome cast iron and brass oven from reference left panel, upright copper twin chimneys, loaf medallion, closed arched oven door, pressure gauge, pale ceramic top pressure cap, no arms or legs or face. RIGHT: full transformed clockwork mimic from reference right panel, retain SAME oven identity, sloped twin copper chimneys, closed armored arched oven door, loaf medallion, small pale ceramic pressure cap on top, powerful piston legs and iron claw arms, amber hot vent slits. Facing LEFT in three-quarter sideview, feet on same horizontal baseline as disguised oven base. Entire sprites visible with margin ALL sides, no overlaps. Both roughly same overall height in the sheet, active monster wider and more muscular. Preserve richly detailed late1990s DOS pixelart, dark indigo outlines, worn brass rivets, strong silhouettes. No background, NO floor, NO baker, NO shadow, NO labels or text, NO projectiles, NO checkerboard. Clean fully isolated game sprites.

## Validation and packaging

162 tests pass. The21 combined boss/player-kit tests cover isolation, high asymmetric arc, target locks, repeat pacing, exact firing rate, upward controls/door damage, stored/activated kefir with keyboard/touch/pause/death, actual shelter clearance/boule protection, bullet admission from both directions, real airborne horizontal shooting, defeat with starting ammo, and equal30/60/120fps battle timing.

Ten isolated Devourer render cases are reviewed in both baselines; all prior non-Devourer render traces remain unchanged. All4320 historical-layout simulation frames are re-reviewed for the explicitly requested global firing/aim changes. Re-running the prior player modules reproduced every previous hash before updating the baseline; the historical levels and default movement constants are unchanged. These traces no longer claim pre-extraction combat equivalence.

Build: `python keen/tools/package-devourer-preview.py /absolute/output.zip`. All scripts and literal art URLs embed in `Bakery-3.html`. Native canvas QA renders the actual embedded HTML and rejects external asset URLs. Toolbar is above the game. Do not merge until approved.
