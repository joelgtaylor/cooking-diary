# Current Rider — isolated encounter review

Next aquatic archetype after the approved Bubble Puffer. Reuses the water arena, both heroes, fullscreen/touch shell and approved World 4 soundtrack, while keeping the Puffer encounter and production worlds unchanged.

The lavender shrimp stalks at 1.9 px/tick, coils for 44 ticks, locks its aim for the final 20, then dashes at 9.2 px/tick for at most 34 ticks. It never steers after committing. A stable dashed lane and growing wind-up arc announce the attack without flashing. Dodge across the lane instead of swimming away along it. Ordinary recovery lasts 46 ticks; a collision with masonry produces a 66-tick wall stun. Every phase is vulnerable; three successful shots defeat it, with an 18-tick enemy hit guard. Fixed 64×32 body collision is independent of antennae, tail extension and sprite rotation.

Dash movement tests every pixel against terrain and the player, preventing tunnelling. Body/dash share the established 90-tick player immunity. No projectile attacks, forced player currents, oxygen timers, or armor. Wakes are bounded to eight short-lived marks, cleared on defeat/retry. Dead shrimp rise and fade for 48 ticks and cannot damage. Dry, distant or occluded players do not start unseen attacks. The visible oven plinth remains solid, providing a wall-stun opportunity and route geometry.

## Artwork

`rider-frames.png`: original transparent PNG generated with the built-in image-generation tool, using the approved lavender shrimp in `keen/art/sunken-patisserie/aquatic-enemies-concept.png` as identity reference. Four right-facing swim, coil, streamlined dash and recovery poses. Source pixels are sampled with per-pose body anchors and a constant .22 scale; no pixel editing or background keying. Antennae and tail are visual extensions, not collision.

Prompt: four separate right-facing lavender shrimp frames in a horizontal transparent sheet; cream markings, segmented body, rostrum, long violet antennae and fan tail; detailed DOS pixel art matching the approved reference; coiled windup and streamlined dash; no text, labels, baked speed lines, background or other enemies. Generated October 23, 2026.

## Review and checks

Run `node previews/current-rider/build.cjs` to rebuild the isolated page. Open `index.html` on a static server; Face the Rider. Pause menu supports both heroes, checkpoint retry and mission restart. No saved recipe or score keys are written.

`node --test keen/tests/*.test.cjs previews/audio/audio.test.cjs previews/sunken-audio/*.test.cjs previews/flooded-entrance/audio.test.cjs previews/puffer/*.test.cjs previews/current-rider/*.test.cjs`

Tests cover wind-up/aim lock, committed trajectory, swept player/wall collision, wall stun, shared damage immunity, vulnerability/defeat, inactive target isolation, bounds/wake budget, both heroes, player-shot sweep, supported plinth and checkpoint reset. Difficulty and visual timing await human playtest approval.

## Approved encounter and placement constraint

Joel approved the Current Rider on October 23, 2026, finding it tricky and annoying in an enjoyable, limited role. Preserve the reviewed behavior. **Place exactly one Current Rider in the full World 4 map**, at a deliberate key encounter point; do not use it as a repeated patrol or add more elsewhere in the level. Choose geometry with readable dash lanes, perpendicular dodge space and masonry that supports the approved wall-stun counterplay. Review its final placement during world construction.
