# Bakery 1 rollout review

The approved art now covers all six walkers, three hoppers and two slingers in Bakery 1 by default on the review branch. Earlier opening-only/first-slinger scope below is historical. Use `enemies=off&slinger=off` for original enemy art. Bakery 2/3 are unchanged. See MOONLIT_ENEMY_ROLLOUT.md for current validation and scope.

# Dough Slinger art pilot

Review URL: keen/index.html?slinger=pilot&scene=slinger. Starts paused on the real column-26, row-40 shelf before the first Bakery 1 thrower (column30 / floor40). Tap Pause / Resume to begin. Shoot, jump or mixer-pogo using existing controls; reload to reset. Use slinger=off with the same scene for the original rendering. Omit scene for a normal start; the art still changes only the first B1 thrower when slinger=pilot is explicit.

No enemy placement, patrol, collision, health, projectile, attack timing or audio changes. The 36-tick wind-up, direction lock, range/sight/camera checks, 150-tick recovery cooldown and 2.3px/tick shot remain authoritative. The four poses read ready, wind-up, release and scooping recovery. Release feedback is recorded only after an actual shot via a WeakMap keyed to the enemy; it lasts six simulation ticks then shows recovery for eighteen ticks. Losing eligibility cancels wind-up as before; a previously released pose does not remain stuck when its cooldown is offscreen. Pausing freezes tick-based feedback. New actors after restart do not inherit old feedback.

Only the first Moonlit thrower is changed. The second B1 thrower and all B2/B3 enemies retain their original art. The new wind-up uses a dark-backed outlined triangle plus the existing 36-tick progress line; no color-only meaning. Loading, failed and disabled paths preserve original artwork and warning text. Feet use the same enemy foot anchor; the throwing arm remains within 46px total width, comparable to the existing body-plus-hand cue.

Asset: art/moonlit-dough-slinger.png, 2172×724 RGBA. Built-in image generation from the approved concept: four right-facing poses, bowl at hip, raised dough hand, empty release hand and scoop recovery, consistent apron/bandana, transparent background, no text or detached projectile. Original PNG retained; source rectangles are measured at runtime-design time without destructive raster editing. Pose heights are about35px, source-scaled consistently.

Validation: six tests cover exact scope, loading/off fallback, event-based state progression, cancellation, 400-tick simulation/projectile/damage equivalence, render purity, anchors/facing/wind-up warning, crop bounds and a safe paused scene with no progress writes. Full game/audio suite: 284 passing tests. Main remains unchanged pending playable review. Before eventual production integration, update the shared script release version to refresh changed render/architecture/thrower dependencies together.
