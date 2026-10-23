# Bubble Puffer — aggressive encounter audition

Isolated playable archetype review. Reuses Flooded Entrance art, approved free swimming, both heroes, mobile/fullscreen shell and the approved World 4 music. No production world changes or campaign progression.

The puffer closes distance in both axes, inflates for 48 simulation ticks, locks its predictive aim for the final 14, then fires two three-bubble spreads 14 ticks apart. Projectiles travel at 2.9 px/tick, gently rise, never home, collide with walls and expire after 156 ticks. Growing inflation arc and short dashed aim lanes communicate the attack without flashing. Pursuit speed is capped at 2.25 horizontally / 2.05 vertically, slower than deliberate player swimming. A 38-tick recovery and 32-tick pursuit separate attacks; no unseen attack countdown through walls or from dry rooms.

Four successful hits defeat him; an 18-tick damage guard prevents overlapping shots from deleting him instantly. Every phase remains vulnerable. Player bullets pop bubbles, allowing an aggressive player to carve an escape lane. Body and bubbles share the existing 90-tick player damage immunity. No damage scales with inflation frames: fixed 60×56 body, fixed 20×20 bubble boxes. Defeat clears all projectiles immediately, then the dizzy fish rises and fades for 48 ticks. Checkpoint/restart reset the complete encounter and clear hazards.

The pool removes the slice's narrow choke, retaining collision on the visible oven plinth for this encounter review. The original Flooded Entrance and three campaign worlds are unchanged. Pause → Return to checkpoint / Restart mission to retry; character selection is in the same menu. Initial player immunity lasts 60 ticks. No oxygen timer.

## Asset

`puffer-frames.png`: built-in image-generation tool, using `keen/art/sunken-patisserie/aquatic-enemies-concept.png` as the approved identity reference. Four transparent right-facing frames, each 543×724 source pixels. Runtime samples the original alpha without image editing. Swim, inflation, firing and dizzy recovery; restrained scaling during inflation, fixed body anchor/collision. Prompt: golden puffer with cream cheeks and violet spikes; same approved detailed DOS pixel art; four equal horizontal cells, same body centre, aggressive eyes, no labels/background/detached projectiles. Generated October 23, 2026.

## Validation

`node --test keen/tests/*.test.cjs previews/audio/audio.test.cjs previews/sunken-audio/*.test.cjs previews/flooded-entrance/audio.test.cjs previews/puffer/*.test.cjs`

Tests cover attack timing/aim lock, projectile budget/lifetime/walls, pursuit, vulnerability, pops, shared player immunity, harmless defeat, both heroes, swept shots and checkpoint recovery. Human difficulty tuning remains the purpose of this isolated preview.
