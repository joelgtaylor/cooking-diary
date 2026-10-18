# Crust Quest — Level Design Notes (Historical Baseline)

> **Historical design document, originally written October 17, 2026.** This plan describes the old 105 × 17 horizontal levels and the intended future vertical redesign. The vertical bakery worlds were merged on October 18, 2026, and are now the default production mode. The implementation is defined by `art/vertical-bakery1-layout.js`, `art/vertical-bakery2-layout.js`, and `art/vertical-bakery3-layout.js`. For present-day architecture, active dependencies, and regression requirements, see [MAINTENANCE.md](MAINTENANCE.md). **Do not apply the implementation sequence below to the production vertical worlds without revising its assumptions.**

---

# Crust Quest — Level Design Refresh

**Status:** Planning baseline, 2026-10-17. No gameplay modifications in this document.

## Approved visual baseline

The current `main` game already contains the replacement Moonlit City,
Fungal/Mushroom City, and Clockwork Oven backgrounds, animated dough gremlins,
larger gremlin presentation (42 px), and the compact hazard / prop / platform atlas
(PRs #10–#14). Preserve the merged stable ground-contact physics fix (#6).
Existing audio, level transitions, recipes/unlocks, mobile controls and all art
assets must keep working.

Do not merge the old procedural mushroom recoloring PR #9: it was superseded
by the generated environment image. Earlier unmerged sprite art PRs #7–#8
are older than these changes; assess/port them independently instead of
merging an obsolete `keen/index.html` over current production.

## Diagnosis — why levels feel assembled

Current `keen/index.html` has a **105 × 17 tile world** (32 px per tile,
3360 px wide, 540 px view). Each level's terrain comes from:
- repeating floor gaps chosen by modular formulas on `x`,
- a small fixed list of horizontal platform segments,
- floor spikes placed every 11 columns at a fixed offset,
- five yeast collectibles, mostly defined by hard-coded coordinates,
- six enemies positioned via hard-coded tile columns,
- repeating decorations keyed to modular tile positions.

The artwork is now richly authored, while the actual traversal is almost
uniform. The screenshot shows identical spike/crate/prop patterns without
visual purpose, terrain that doesn't frame a challenge, and decoration
competing with pickups or hazards.

## Design principles

1. **One clear route.** From spawn to glowing oven, every mandatory yeast
   collectible must be obtainable using normal movement; optional pogo paths
   should reward exploration, not be required without warning.
2. **Introduce → practice → combine → mastery.** Each new hazard is introduced
   in safety before being combined with gaps, enemies or vertical climbs.
3. **Readable gameplay foreground.** Spikes must silhouette against the floor;
   props must not camouflage danger; pickups must visibly stand apart from
   the detailed background; platform tops are always legible.
4. **Rhythm, not modulo.** Alternate calm landing areas, focused traversal
   challenges, vertical sections, combat arenas, and payoff/reward moments.
5. **Fairness.** The player should see a jump's destination before committing
   where possible. Avoid surprises at a blind camera edge; never spawn enemy
   and spike collisions together in a way that cannot be anticipated.
6. **Mobile first.** Level layout should be playable with on-screen buttons,
   not depend on millisecond-perfect reactions.
7. **Visual identity.** Bakery 1 = city rooftops and chimney bridges;
   Bakery 2 = glowing fungal growth, terraces and bounce/pogo opportunities;
   Bakery 3 = gears, furnace corridors and demanding but telegraphed gauntlets.

## Phase 0 — tools and measurement (before altering level maps)

- Extract level data to a dedicated, human-readable module rather than mixing
  all tile, spike, enemy and pickup placement into `init()`.
- Add a developer-only level overlay (tile/grid, hazard collision boxes,
  spawn and exit, checkpoint/collectible locations, jump-path hints) and a
  quick `1/2/3` bakery switch in a non-production preview.
- Measure normal running jump range, maximum vertical rise, pogo arc and
  acceleration from the existing physics at normal game speed. In the current
  code, base movement target is 3.6 px per update, jump begins around -10.7
  and gravity is +0.49; **do not treat these as verified reachable distances**
  until simulated against live collisions and ledge grabs.
- Automated validations should check every mandatory collectible is reachable,
  legal spawn points, no hazards on spawn or immediate landing zones, and
  accessible exit after collecting five yeast jars.

## Phase 1 — Bakery 1: Moonlit City (first playable redesign)

Build four sequences rather than one repeating span:

1. **Welcome / tutorial (~0–20%).** Safe launch platform, easy short gap,
   first jar in plain sight, one isolated stationary/walking gremlin, room to
   learn the enlarged baker and gremlin silhouettes.
2. **Rooftop hop (~20–45%).** Distinct roof heights, two safe landing ledges,
   a clearly visible isolated spike, second jar above a forgiving jump.
3. **Chimney route (~45–75%).** A meaningful high optional route and a safer
   longer low route; a readable gremlin patrol and a useful powerup.
   Third/fourth jars guide movement through the route.
4. **Oven approach (~75–100%).** Short deliberate escalation combining a gap
   and a clearly telegraphed spike, then a recovery space before fifth jar
   and an unmistakable oven finish.

Each segment should have a recognizable silhouette in the full-level map.
Use city-themed props as storytelling and landmarks, not mechanically
meaningless tile-by-tile repetition.

## Phase 2 — Bakery 2: Fungal Proofing Caves

- More verticality and curved *composition* built with the existing rectangular
  collision tiles; visually supported mushroom/terrace platforms.
- Two explicit routes: lower safe walking route and a higher pogo-assisted
  challenge with bonus reward (not a required yeast jar).
- Use magenta/blue crystal spikes as contrasting set pieces sparingly, not
  at a fixed interval.
- Introduce hoppers in an open area before coupling them to elevation changes.
- Rest platforms between tall climbs; avoid hiding collectibles behind
  decorative mushrooms.
- The final fifth jar sits near the unmistakable level exit.

## Phase 3 — Bakery 3: Clockwork Oven

- Industrial progression: engine-room entrance → gearworks vertical test →
  conveyor-like platform gauntlet (visual first; moving surfaces only if
  separately designed/tested) → final furnace approach.
- Metallic/heat hazards have warning signs and safe observation points.
- Chasers and hoppers are introduced separately before being combined.
- Higher difficulty comes from clearer, intentional sequences, **not** tiny
  hitboxes or unseen spikes.
- Give the last section a strong oven visual landmark and a guaranteed safe
  recovery platform before the exit.

## Phase 4 — systems and polish (after all levels play well)

- Add checkpoint/safe rest zones if playtesting indicates repeated long
  traversal after a late mistake. Scope save/reset rules explicitly.
- Give yeast pickups a small arrival flourish and stronger contrast against
  city windows / purple mushroom lighting.
- Fix misleading decorative props: crates drawn directly over danger,
  lamps sitting inside jump clearance, spikes whose art overhangs hitboxes.
- Add subtle landmark cues/route indicators without cluttering the canvas.
- Profile FPS on Android and desktop with the new background art and sprites.

## Acceptance tests for every bakery

- 5/5 yeast jars physically accessible and exit reachable.
- Normal jump route validated for mandatory progress; pogo is an intentional
  option with a tutorial cue.
- No unfair mandatory blind leap, surprise spike immediately upon landing,
  or enemy overlapping a guaranteed landing area.
- Player and enemy collision geometry match the visible hazards and surfaces.
- Reset, pause, music, ammo, invulnerability, powerups, and recipes unchanged.
- Full run on desktop keyboard and mobile touch controls.
- Side-by-side old/new top-down layout screenshots and a playable A/B preview.
- Each stage completed without debug cheats on at least one mobile and
  one desktop test.

## Implementation sequence / pull requests

1. **PR A: Dev overlay and measurements.** No map changes.
2. **PR B: Bakery 1 authored map and route playtest.** Keep other bakeries
   exactly as they are. Ship preview, not main, until approved.
3. **PR C: Bakery 2 map and pogo path.** Reuse authored-layout pipeline.
4. **PR D: Bakery 3 map, difficulty progression and oven finale.**
5. **PR E: Accessibility, telegraphing, checkpoints, optimization.**

Prefer one functional map per bakery, explicit metadata for hazards and
collectibles, and deterministic validation. Avoid reintroducing the old
tile-modulo formulas when designing new sections.
