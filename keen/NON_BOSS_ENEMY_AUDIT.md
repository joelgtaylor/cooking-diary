# Ordinary enemy audit

Baseline: design/keen-world-polish at 7c9a730. Source and runtime-data audit; no enemy, placement, artwork, boss, audio or gameplay changes in this audit. Recommendations below require a visual concept and isolated playable review before rollout.

## Live inventory

| World | Walkers | Hoppers | Throwers | Total |
|---|---:|---:|---:|---:|
| Moonlit Bakery | 6 | 3 | 2 | 11 |
| Fungal Caverns | 2 | 4 | 2 | 8 |
| Clockwork Ovens | 3 | 4 | 3 | 10 |
| Total | 11 | 11 | 7 | 29 |

All 22 moving enemies use authored encounter bounds. Seven stationary throwers use line-of-sight/range/camera gating. The chaser and legacy unbounded hopper/walker branches in combat.js are not instantiated by any current authored level. Do not treat them as shipped archetypes or expand/refactor them as part of an art pilot.

## Rules and counterplay

| Archetype | Current behavior | Existing counterplay | Readability issue |
|---|---|---|---|
| Walker | 25×25 body; horizontal speed magnitude 1.1 px/tick; reverses at explicit bounds or solid obstruction; no gravity in bounded walker update | Shoot, descending mixer pogo, jump over or wait for patrol | Same body as other worlds; role is mainly inferred from movement. Reverse has no anticipation; retain simple predictable patrol as the introductory enemy |
| Hopper | Same horizontal patrol; gravity .5 px/tick², launch -7.5 px/tick, fall cap 10; initial timers authored at 50–70 ticks, then 50 + random×40; launch waits for support | Observe, pass during airborne window, shoot or pogo from above | No grounded pre-jump crouch. Moving bounds reverse even in flight. Launch height is about 60 px in the sampled simulation; distinguish intention from airborne motion |
| Thrower | Stationary; initial/reacquisition delay at least 90 ticks; 36-tick wind-up; 150-tick post-shot delay; facing locks when wind-up begins | Leave sightline to cancel, jump over slow shot, approach behind cover, shoot or pogo | Existing raised hand, ! panel and filling line are useful but body artwork shares the hopper expression atlas. All worlds fire the same small dough blob |

Times are simulation ticks (60/s), not wall-clock guarantees. Hopper random interval is roughly .83–1.5 s; wind-up .6 s; post-shot delay 2.5 s. Do not increase speeds, damage or health to manufacture variety.

Thrower checks: horizontal center separation ≤256 px, vertical center separation ≤55 px; full body inside camera with 24px horizontal and 46px top margins; horizontal solid-obstruction sampling every 8px. Loss of eligibility clears wind-up and restores at least 90 ticks before starting again. Shots travel horizontally at 2.3px/tick, expire after 150 ticks, collide with solid terrain, and disappear when their owner dies. This is valuable protection against surprise offscreen fire; preserve it. Shots already in flight are not culled solely because they leave the camera.

All ordinary enemies die to one player projectile (+100 score) or a qualifying mixer pogo (+150). Pogo requires descending velocity >1 and player feet above enemy y+14; bounce is -11 with four ticks of hit stop. Ordinary jumping onto an enemy without mixer mode damages the player. Contact and enemy shots use the shared damage function: one health, 90 invulnerability ticks; a basket shield absorbs a hit and grants 60 invulnerability ticks. Do not imply armor, extra health, ordinary stomp safety or a new vulnerable phase through new art.

Player projectiles currently iterate over all overlapping live enemies even after being marked dead, and solid-hit marking precedes that loop. This is an existing edge case to evaluate separately before changing projectile rules; no alteration proposed in this audit.

Checkpoint recovery clears projectiles and resets bosses, but does not reconstruct ordinary enemies. Full init/restart reconstructs them. Preserve this distinction.

## Authored encounter placements

Coordinates below are spawn column / supporting floor row in 32px tiles, derived from runtime entities. These are not player coordinates or decorative placements.

| Source section | Walkers | Hoppers | Throwers | Design implication |
|---|---|---|---|---|
| B1 Bakery Entry (0–22) | 19/54 | 16/48 | — | Good two-enemy introduction: floor patrol and separate roof hop; checkpoint recovery already tested safe |
| B1 Moonlit Ascension (23–52) | 27/45, 42/38 | 40/32 | 30/40 | First ranged encounter follows initial melee introductions; retain readable cover and launch windows |
| B1 High Towers (53–77) | 60/26, 71/19 | 64/23 | 73/19 | Walker and caster share summit floor; inspect combined silhouettes and wind-up visibility before adjusting timing |
| B1 Oven Descent (78–104) | 85/24 | — | — | Light ordinary-enemy pressure before approved Foreman; do not add enemies to the boss approach by default |
| B2 Mycelium Foothills (0–23) | 18.5/54 | — | — | First fungal walker can teach the world's new silhouette alone |
| B2 Sporelit Stairways (24–55) | — | 26/45 | — | Single early spring-cap hopper, separate from dialogue/puzzle complexity |
| B2 The Deep Plunge (56–79) | — | 67/22, 77.5/22, 70/31 | 72/19, 76/30 | Upper optional canopy and required descent both contain threats; do not assume the whole cluster is optional. Check vertical view entry and landing choices |
| B2 Cavern Floor (80–104) | 81/26 | — | — | One elevated patrol before Bloomrot; preserve the boss's clear arena |
| B3 Ashen Boilerworks (0–25) | 23/49 | 15/49 | 24/43 | Safe lower maintenance passage; combat is on roof/exit ledges. Strong candidate for later mechanical-role introduction |
| B3 Copper Lift Shafts (26–52) | 30/39 | 50/34 | — | Separate patrol and hopper challenges before central fork |
| B3 Clockwork Skybridge (53–77) | — | 64/19 | 58/28, 68/19 | Summit hopper/caster combination rewards observation; keep warning visible against gears |
| B3 Grand Oven Descent (78–104) | 86/25 | 92/28 | — | Elevated encounters precede Devourer; keep service shelter and approved fight intact |

Sections use current source metadata, not the earlier suggested artistic names. Spawn columns do not describe each enemy's full patrol span; explicit bounds remain authoritative.

## Artwork and animation

All worlds load the same two 128×128 atlases: dough-gremlins-primary.png and dough-gremlins-expressions.png, each with 32px cells. Walkers use primary; hoppers and throwers use expressions. At normal settings each cell draws at 42×42 over a 25×25 collision body; contact-shadow and per-frame foot offsets align supported animation. New art must preserve feet and make the body/edge readable rather than exaggerating apparent collision reach.

Animation selects idle row 0, movement row 1, or row 2 for an airborne hopper (|vy|>1) / winding-up thrower. Four frames cycle at 18/9/7 ticks respectively. Thus the hopper briefly returns to movement row near its apex; thrower wind-up loops a generic expression row rather than using a phase-matched throwing sequence. This should inform the new sprite design. Rendering is driven by actor animation state without advancing AI.

Fallbacks use the old items atlas or a rectangle, plus small colored role tabs; those tabs alone cannot serve as accessible differentiation. Ordinary death is immediate removal and particles, without a persistent defeat pose. Avoid adding death poses that look alive or suggest a lingering collision body.

## Recommended art family: three roles, three world treatments

| Role | Moonlit Bakery | Fungal Caverns | Clockwork Ovens | Shared recognition |
|---|---|---|---|---|
| Walker | Flour-dusted apron gremlin, low working stance | Broad mushroom-cap walker, short root feet | Squat gearling, low chassis and visible feet | Low steady silhouette and clear foot contact |
| Hopper | Soft baker cap, compressing dough body | Tall spring-cap with accordion stem | Piston servant with telescoping leg | Tall/elastic silhouette; visible compression before launch |
| Thrower | Rolled sleeves, raised dough hand and bowl | Bulbous spore sac with visible aiming pose | Loading arm and single delivery nozzle | Held projectile/loading shape; direction and attack pose distinct from hopper |

These are proposed identities, not approved assets. Use cream outlines/dark separation, silhouette and pose; no red/green distinction. Fungal glow and ember effects are secondary. Do not draw hazardous-looking spikes on stompable tops. Keep projectile collision size, trajectory and timing readable across skins. Spore clouds and burning floor zones would be new mechanics and are deferred.

## Small first pilot

Recommend the existing Bakery 1 opening only: floor walker at 19/54 and roof hopper at 16/48. First show a concept sheet for their two silhouettes and idle/walk/compress/airborne poses at native game scale. Then build an art-only playable comparison using the original bounds, hitboxes, speed, hop timing and rewards. The lower walker already supports safe shooting from the culture approach, and checkpoint recovery/roof approach have regression coverage.

If that visual pilot is approved, a second focused change can map a short crouch to the final grounded ticks of the existing hop countdown. That would add anticipation before the existing launch, without extending the interval or changing launch speed. Review the actual timing separately; do not introduce it silently as sprite polish. A later thrower pilot should map its full existing 36-tick warning onto a readable arm/spore/loading pose before proposing new behavior.

Keep bosses, audio, pickup indicators, approved flags, geometry and enemy count untouched. Broader encounter rearrangement belongs after role artwork and telegraphs are established.

## Verification and limits

Inspected combat.js, throwers.js, characters.js, render.js, assets.js, world.js, all three authored layouts, both actual gremlin atlases, and existing encounter/thrower tests. Runtime inventories generated through game-harness.cjs. A 900-tick enemy-only simulation per world (deterministic random .5, player outside engagement range) retained all 29 enemies; every moving enemy stayed inside bounds; walkers stayed vertically fixed and all hoppers traversed about 60px vertically. This checks bounds/support survival, not player encounter balance or a full playthrough.

No new behavior implemented; no new tests needed for this documentation-only audit. The integration baseline passed all 261 game/audio tests. Desktop/mobile combat observations and native-scale art review remain required for the future pilot.
