# Clockwork enemy pilot

Based on main after approved Fungal Caverns merge, bf900fff. The mechanical family concept is approved; this isolated art pilot is not merged.

Enable `clockwork=pilot`; compare `clockwork=off`. Paused scene shortcuts: `scene=mechanical-gearling`, `mechanical-piston`, `mechanical-ember`. They use existing entrance roof/catwalk support with no overlapping actor, culture grants, puzzle completion or save writes. Reload resets. Normal starts retain existing Bakery 3 artwork until rollout approval.

## Audit and scope

Current vertical-bakery3-layout.js contains ten enemies: three walkers, four hoppers, three stationary throwers. Entrance: hopper15/49, walker23/49, thrower24/43. Ascent: walker30/39, hoppers50/34 and64/19, throwers58/28 and68/19. Finale: walker86/25 and hopper92/28. Coordinates are spawn column/support row, not new placements. Existing source sections remain Ashen Boilerworks, Copper Lift Shafts, Clockwork Skybridge and Grand Oven Descent.

All ten select the approved Gearling, Piston Hopper or Ember Thrower identity when enabled. No AI, placement, collision, health, damage, rewards or cooldown changes. Walkers retain1.1px/tick patrols. Hoppers retain original launch/gravity/countdown, with visible mechanical compression during the final ten supported countdown ticks. Throwers retain36-tick wind-up,90-tick ready/reacquisition minimum,150-tick post-shot delay, line-of-sight/camera protections and slow2.3px/tick9×9 shot. Loading pose uses the actual wind-up; release is triggered by projectile creation, followed by6-tick release and18-tick recovery art. The ember reskins the original projectile without a lingering fire zone.

The three profiles distinguish roles without colour: low round gearling, tall piston, side-facing loading arm/nozzle. Smooth crowns preserve pogo readability; no armor rules. Original artwork is a loading/error fallback. Draw routines do not advance AI. A WeakMap keeps release animation isolated by actor/restart.

Generated production source: `art/clockwork-enemies.png`,1536×1024 RGBA, immutable crops in `clockwork-enemies.js`. Built-in image-generation prompt: preserve the approved ivory/brass three-role concept, produce three rows of four walk/compress/launch/load/release/recovery poses with transparent margins; no raster post-processing. Source/blob hash checked before publication.

Validation:314 game/audio tests pass, including exact3/4/3 role coverage, explicit opt-in and world exclusion,900-tick simulation/audio equivalence in every world, phase timing and actor isolation, crop bounds, real supported preview spawns, render purity and fallback. Browser checks follow publication. Real-device touch review remains required.

The Devourer, all other bosses, Bakery1/2 enemies, audio, flags, authored geometry and progression are unchanged. Do not add a mechanical flyer without a separate encounter proposal. First review the existing entrance actors, then assess whole-level clarity before rollout.
