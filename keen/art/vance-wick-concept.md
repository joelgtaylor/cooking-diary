# Vance Wick — first character concept

The existing original baker is named **Loafy**. **Vance Wick** is the new hero
whose design is based on parent-provided reference photos. This delivery adds
the roster/selector and a concept preview; it deliberately does not present
the concept sheet as a finished playable animation atlas.

Design: tousled dark brown hair with short sides, expressive eyebrows, gray
hoodie, dark scarf, tan/brown camouflage vest with a Canadian flag patch, charcoal trousers with gray
lower legs and light footwear. The dark gunmetal blaster follows the
reference prop and launches the game's existing dough projectiles. The four
poses are idle, horizontal aim, running and mixer-pogo.

Generated with the built-in image-generation tool using the supplied photos
as identity/outfit references and `baker-grunge-actions.png` as the style
reference. The source photos are not part of the repository. The project asset
is a lossless WebP conversion; decoded RGBA bytes were checked against the
generated PNG, including its alpha channel. No per-frame image processing is
introduced.

Prompt: Create a four-pose transparent Vance Wick concept sheet in the current
chunky outlined, textured 16-bit platformer style. Preserve the boy's youthful
face, dark hair, eyebrows, gray hoodie, camo vest, dark scarf and trousers.
Show three-quarter idle, right-facing toy-like dough blaster aim, dynamic run
and spring-mixer pogo. Match Loafy's proportions and art treatment; retain
Vance's own outfit, without the chef hat, blond hair or red scarf. No text,
scenery, other characters, gore or muzzle flash.

Next production step: derive a consistent action atlas for idle, run,
jump/fall, hang/climb, mixer-pogo, horizontal fire and upward fire. Use the
same physics, projectile hitboxes and movement timings as Loafy. Enable Vance
in the playable roster only once those states and loading fallbacks are ready.

## Playable integration

Vance is now selectable and uses `vance-wick-actions.webp`, a packed 1024×2048 atlas with 32 isolated action crops. Shares Loafy’s animation state selection, physics and projectiles. Body anchors compensate for weapon width; feet and hanging hands stay aligned. A missing/loading atlas safely uses Loafy until ready.

Action prompt (built-in image generation): Preserve the approved Vance identity, Canadian flag vest patch and dark gunmetal barrel. Produce four columns by eight rows covering idle, run, jump/fall, hang, mixer pogo/climb, horizontal and upward fire, airborne and running fire. Transparent background, no text. Packed offline; no per-frame processing.
