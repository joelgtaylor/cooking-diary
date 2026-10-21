# Main character visual and animation audit

Baseline: main merge 480462d3693ee22bf96e04f5c217ca3423f6a44c (PR #30). Follow-up branch: design/keen-baker-polish. Audit only: no player artwork, physics, inputs, combat, audio or animation-selection changes.

## Assessment

The baker remains recognizable through a tall chef hat, white coat, neckerchief, dark trousers and hand mixer. Keep those identity anchors. The new ordinary enemies have stronger material shading, cleaner role silhouettes and more consistent shapes; the baker's older atlas now varies visibly in facial detail, proportions, outline density and pose scale. Improve consistency and action readability before adding decorative equipment or enlarging the character.

## Active assets and renderer

- Production asset: art/baker-ai-solid.png, 960×896 RGBA, 96×112 cells. Rendered as an 84×96 image rectangle centered on the player, with transparent padding inside; the visible body is smaller than that rectangle. Do not confuse render dimensions with collision dimensions.
- Runtime body: 29×38, initialized in world.js. All movement, ledge reach, projectile origins, stomp tests and platform navigation rely on this body. Preserve it during visual work.
- Grounded drawing uses source foot y100 (destination -86 with 96/112 vertical scaling), rounded world anchor at player foot; pogo uses source foot y103. Hanging uses its own top offset -96 to retain hand placement.
- actorAnimation resets on animation-row changes or tick reset, and advances from game ticks rather than redraw count. Keep this pause-safe, state-driven structure.
- Current ready check accepts any nonzero image width, rather than the atlas's expected dimensions. Consider an exact dimensions check with existing fallbacks during a later implementation; not changed here.
- Fallback chain: baked reimagined atlas, older phase4 atlas, rectangle. The production atlas is an immutable repaired image: sprite-repair.js is not loaded in production. Preserve the repaired silhouette/opacity work; do not reintroduce runtime image readback or transparent holes.

## Current animation coverage

| Player condition | Actual production row / frames | Assessment |
|---|---|---|
| Idle | Row 0, five frames, 14 ticks each | Character identity is clear; refine face/hat consistency and keep feet stable |
| Running | Row 1, four frames played 0-1-2-3-2-1; cadence based on speed | Existing clock is useful; stronger arm/leg opposition and consistent head size would improve weight |
| Jump rising | Row 2, four frames, advances once at five ticks/frame then holds | Preserve a clear takeoff/rising silhouette and visible hands |
| Falling | Row 3, four frames, advances once at seven ticks/frame then holds | Several expressive poses; aim for a controlled readable descent rather than changing character proportions |
| Ordinary landing | No dedicated landing trigger in drawPlayer | Landing particles exist in physics, but normal ground contact selects idle/run. Row 4 is not selected by actual landing |
| Ledge hang | Row 5, four frames looping at ten ticks/frame | Preserve hand anchor; current art includes ledge fragments/vertical marks and a small stray numeral near the last cell. These need per-cell cleanup review |
| Ledge climb completion | Legacy state row 7 maps to production row 4, four landing frames | Land art currently stands in for climbing. player.climb lasts ten ticks; a four-frame sequence at four ticks/frame cannot normally finish in that window |
| Mixer pogo mode | Row 6, three frames looping every seven ticks | Strong distinctive tool concept; changing pose/scale makes contact less consistent. Ground shadow is intentionally omitted in pogo mode |
| Hurt/invulnerability | Blink condition: visible only when tick%8<4 | Hurt row 7 has two supplied frames, but drawPlayer never selects it. Preserve blink as state information even if a short hurt pose is added |
| Horizontal / upward shooting | No separate animation selection | Projectile can fire while idle/running/airborne, but body does not indicate direction of aim. Improve without moving projectile origin or blocking movement |
| Stored kefir dash / shield | No dedicated pose in character renderer | Existing mechanical states are independent of the atlas. Any new visual treatment must reflect real state, not imply armor or invulnerability |

The legacy row-to-production mapping is [0,1,4,2,3,5,6,4]. Legacy row 2 is not assigned by the current selector; production row 7 is unreachable. There are 30 supplied frame slots across the eight production rows; file width also contains unused cells. Do not mistake an atlas's unused space for missing gameplay frames.

## Art observations

The actual PNG was inspected, including its alpha channel and occupied bounds of every selected cell. Some variation is legitimate action motion; not all bounding-box changes are bugs. Nevertheless:

- Idle/run visible feet consistently end at source y100, a valuable existing constraint covered by grounding tests.
- Face direction, eye placement, hat volume and clothing detail vary more than in the approved enemy designs. A clean model sheet should lock these before producing animation.
- Hanging frames bake pieces of environment into character art and contain stray marks. Separate the actor silhouette from scenery and validate all cell boundaries at native display size.
- Pogo frames vary in body height and hat/head presentation; mixer, grip and contact point need a stable model. The tool must remain unmistakable at mobile scale.
- Bright coat/hat already separate the baker from dark masonry. Preserve this light core, dark outline and contrast against both luminous fungi and orange furnaces. Red neckwear must never carry meaning alone.
- Do not blindly match the enemies' heavy angry eyes: keep a friendly, determined protagonist with a distinct face and upright silhouette.

## Priority and proposed scope

1. **Identity/model sheet for review:** existing baker reinterpreted with the same pixel density, warm material shading and coherent outlines as the new enemies. Show front-three-quarter and side silhouettes; idle, run stride, rise, fall, hang and mixer pogo. Include real native-size comparisons against a 42px enemy and all three backgrounds. The current visual footprint and interaction anchors remain the reference.
2. **Small art-only pilot:** idle and running first, with foot baseline and head proportions locked; existing physics and animation durations unchanged. This tests whether fidelity and consistency solve the perceived gap without hiding controls or hitboxes.
3. **Movement atlas:** rise/fall/hang/pogo next; inspect hand/foot/mixer anchors individually and both facings. Keep input response and authored ledge routes unchanged.
4. **Animation wiring as a separate change:** true brief landing and hurt poses, climb completion distinct from landing, then readable shooting/up-aim. Define precedence so shooting never masks pogo, hurt feedback or ledge grip. These can change apparent response and require their own playable review.

No additional weapons, health, speed, body size, jumping power, audio or boss changes are proposed. Broader enemy rollout can resume after the protagonist's visual standard is established.

## Verification plan and evidence limits

Source inspected: characters.js, assets.js, world.js, physics.js, gameplay.js, combat.js and player render call path. Actual baker atlas inspected. Grounding, sprite-repair, physics, timing and player-kit tests are existing safeguards. The merge passed all 270 game/audio tests. Native screenshots from the reviewed gameplay previews show the current baker alongside both new opening enemies.

Future pilot needs: exact frame dimensions and crop validation; opaque body/no stray neighboring pixels; draw purity; grounded foot positions; hanging hand and pogo contact alignment; unchanged movement/shot/stomp results; pause and restart clocks; left/right facing; bright/dark backgrounds; desktop keyboard and actual mobile touch readability. This audit does not claim a full fresh playthrough or a player redesign implementation.
