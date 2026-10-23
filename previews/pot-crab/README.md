# Copper Pot Crab — guarded-passage encounter

A calmer counterbalance to the Bubble Puffer and Current Rider, per Joel's direction. The crab stays put, makes a short warned claw jab, and must be defeated to pass. Reuses approved water physics, both heroes, shell/touch/fullscreen and World 4 music. Other encounters and production worlds are unchanged.

## Behavior and route

Closed shelter 54 ticks → lid rattle 28 → exposed opening 72 → tuck 18. Only the open phase accepts damage. Three hits, with 18-tick damage immunity. Armor consumes shots and produces a small stable impact mark. Every opening includes a 24-tick claw warning followed by a 12-tick, 60-pixel jab. Safe range is outside the short reach; no projectiles, pursuit or body-contact damage. Dry/distant players do not advance an unseen attack countdown.

A full-height, three-tile-wide masonry divide separates the rooms; its only aperture is exactly the crab's fixed 96×96 solid footprint. The same body remains solid while the lid is raised, through hit immunity, and throughout the 48-tick defeat tumble. Defeat then removes the body and exposes a real traversable opening. There is no invisible kill trigger or remote switch. Roof and floor connect to the divider, so swimming above/below, dry-form traversal, kefir boosts and player invulnerability cannot bypass it. Collision is independent of animation frames.

The pressure-door jamb and fixed rim indicate the blocked space. During combat, player motion uses the body collision; bullets use terrain collision and swept enemy tests, allowing shots to reach the pot without passing through adjacent stone. Retry restores the crab and blocked aperture. In the full world, place this guardian at a deliberate required passage, with clear firing space and no simultaneous high-pressure enemies; don't multiply it into repetitive waiting gates.

## Asset

`crab-frames.png`: built-in image-generation tool using the approved copper-pot crab in `keen/art/sunken-patisserie/aquatic-enemies-concept.png` as identity reference. Original transparent image, four front-facing closed, rattling, open and tipped-pot defeat frames; runtime samples alpha without image editing.

Prompt: copper cooking-pot crab with teal shell, patina, cream grumpy eyes and pink exposed face; detailed DOS pixel art matching the approved reference; four separate horizontal cells with consistent body centre, closed shelter, rattling lid, lifted lid and dazed defeat; no labels, background, projectiles or other enemies. Generated October 23, 2026.

## Checks

Build: `node previews/pot-crab/build.cjs`.

`node --test keen/tests/*.test.cjs previews/audio/audio.test.cjs previews/sunken-audio/*.test.cjs previews/flooded-entrance/audio.test.cjs previews/puffer/*.test.cjs previews/current-rider/*.test.cjs previews/pot-crab/*.test.cjs`

Coverage includes armor/open timing, hit guard, short warning/damage reach, persistent obstruction during open/death frames, full-height wet/dry bypass scans, actual boosted/invulnerable swimming into the barrier, post-defeat crossing, swept bullets versus adjacent masonry, both heroes and checkpoint resets. Human review remains the approval for encounter feel.

## Mechanics approved; claw-grab visual revision

Joel approved the mechanics, requesting that the attack actually read as a claw grab. `claw-animation.js` is a read-only visual timing adapter: during the existing 24-tick warning, full-size open pincers reach out; during the existing 12-tick damage window, they close and hold; during the following 14 harmless ticks, they release and retract. Tips coincide with the unchanged 60-pixel attack boundary. The former line glyph is removed. No health, damage, collision, passage, or vulnerability timings change.

`claw-grab.png` was made with the built-in image-generation tool, referencing the existing approved crab frames: isolated right-facing copper/teal forearm and pincer, open / half-closed / shut, matching chunky pixel art, transparent background, consistent joint, no body/pot/text/effects. Original alpha is preserved. Runtime uses a common vertical crop and fixed draw size so closing the jaws reduces their opening rather than stretching them. Left claw mirrors the same frames. Additional tests compare visual reach/closure against every warning and damaging tick and ensure the visual adapter never mutates gameplay state.
