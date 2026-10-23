# The Sunken Patisserie — design review

Status: movement, all four enemy archetypes and World 4 music are approved. Milestone 5 connected four-section route and its visual corrections are approved. Milestone 6.1 isolated octopus lame behavior and refined slender pixel artwork are approved. A six-pose theatrical defeat is implemented in previews/octopus/ for review; scraper, ink and the combined encounter remain pending. Final boss development, final hero animation/art polish, production progression/recipe integration and merge remain pending. Earlier milestone descriptions below retain their historical context.
Baseline: main c0d42c1601adef0f4fb9978f66050b0ee546813d, October 22, 2026.
Branch: feature/keen-sunken-patisserie.
Authority: CREATIVE_CHARTER.md. This document changes no production behavior.

## Recommended direction

A grand old bakery swallowed by the sea: copper plumbing, cream ceramic, coral-encrusted arches and immense cold ovens. The water has become the building's circulation system. Marine life inhabits the ruins; most creatures do not need culinary costumes.

Contrast warm dry rooms against spacious deep-blue water. Crisp pale masonry edges describe actual collision, while distant structures remain subdued. Teal, navy, cream, copper and restrained lavender/amber coral establish the palette. Critical cues use shape, luminance, motion and established symbols, never red/green alone.

Three parallax layers: distant bakery city; monumental ovens/arches and coral gardens; sparse nearby kelp and particles. Reserve the clearest water for combat. Kelp and rays must not camouflage silhouettes or warnings. Water surfaces are horizontal, visibly animated boundaries, with different lighting above and below.

Concept art status: generated successfully on October 22, 2026. Boards and review decisions are in [the concept handoff](art/sunken-patisserie/README.md). All enemies and boss appearance approved; revised horizontal swimming poses approved. Environment approval has not yet been explicitly recorded.

## Movement comparison and recommendation

**Approved decision — October 22, 2026:** Joel played both presets and selected free swimming: “Free swim feels a little less natural but easier so let's go with that.” Use free directional swimming in water and the established platforming in dry rooms. Retain the prototype tuning; carry the naturalness feedback into later animation/presentation polish. The prototype comparison selector is retired.

| Model | Strength | Main drawback | Decision |
|---|---|---|---|
| Free directional swimming | Responsive exploration across both axes | Open water can bypass authored routes | Use in explicit submerged regions with solid room boundaries |
| Buoyant platforming | Familiar jump rhythm and controls | Can feel like slow airborne platforming; weak deliberate descent | Keep as a comparison preset inside the isolated prototype |
| Region hybrid | Free swimming in water; established platforming in dry rooms | Surface transitions and control context need careful testing | Recommended world model |

Both heroes use identical physics. Start with short acceleration, strong release braking and very gentle passive rise. Initial *tuning hypotheses*, not approved constants: reach cruise in roughly 0.15 seconds, stop in roughly 0.12 seconds; swim cruise near the current dry horizontal speed of 3.6 pixels per simulation tick; passive rise capped around 0.2 pixels/tick. Normalize diagonal input. Up/down have equal deliberate control authority. Currents add a separate bounded velocity; ordinary currents remain escapable.

Review update: Joel requested natural horizontal human swimming and approved the revised concept sheet. This supersedes the original upright/diagonal pose and unchanged 29-by-38 underwater-body proposal. Use a stable horizontal water-specific collision body shared by both heroes; determine dimensions in the isolated prototype. Retain the original collision body on land. Validate safe entry/exit clearance and shallow-water transitions without embedding either body in solids. Collision must never change with individual animation frames.

Use authored water rectangles and a stable torso probe with a small entry/exit hysteresis. Test corners, shallow water, overlapping regions and high-speed crossings. A small upward surface breach lets the player exit toward reachable ledges; dry gravity resumes on exit. Entering water clamps inherited falling speed; swimming never accumulates dry jump buffer or ledge-grab state. Clear stale input/state at transitions, checkpoints and restart.

### Proposed controls

| Action | Keyboard in water | Touch in water |
|---|---|---|
| Swim | Arrows / WASD | Expand the existing left movement area to a four-direction pad supporting diagonal holds/sliding |
| Fire facing left/right | X / K | Existing Shoot button |
| Fire upward | Space + X/K | Existing Jump button relabeled Aim Up + Shoot |
| Mixer | C | Existing Mixer toggle |
| Kefir / interact | V / E | Existing controls |

Up/W is swim ascent, *not* the upward-fire modifier underwater. The separate Space/Jump modifier permits rising while shooting horizontally and aiming upward while stationary or descending. In dry rooms all established controls return. The touch pad expansion is a proposed, reviewable extension of the approved interface, not an approved production change.

Initial mixer adaptation: hold the mixer downward as a tool; a deliberate descending contact can rebound from an enemy or marked pad. No automatic floor bouncing underwater. Keep it out of required routes until its feel is reviewed. Kefir retains its existing consumable/timer model with a bounded swim-speed boost; introduce no additional dash button.

Keep initial projectiles straight and at the existing cadence/speed, with bubbles as visual feedback. Establish trustworthy aim before testing drag or current influence. Both heroes need pose-specific muzzle metadata and a rock-blocked spawn path. No oxygen timer.

## Character animation concepts

Preserve Loafy's chef cap, red scarf, cream jacket, dark patched trousers, boots and piping bag. Preserve Vance's brown hair, grey hoodie, scarf, camouflage vest/Canadian patch, dark trousers, trainers and dough blaster. No scuba costume is needed.

| State | Loafy | Vance Wick |
|---|---|---|
| Idle | Small sculling hands and occasional comic frog kick | Compact, steady tread and alert posture |
| Horizontal swim | Alternating broad kicks; scarf trails | Short energetic kicks, decisive lean |
| Rise / descend | Reach and tuck / controlled feet-first descent | Streamlined reach / compact descending brace |
| Turn | Brief tucked pivot with scarf lag | Quick shoulder-led pivot |
| Fire | One-handed scull around stable piping-bag pose | Braced weapon and compact kick |
| Enter / exit | Cap wobble, scarf lag, small splash | Tucked entry and decisive ledge recovery |
| Current push | Strained reach, trailing legs | Forward brace, scarf streaming |
| Hurt | Brief recoil, readable recovery pose | Compact flinch, quick recovery |

Animation is selected from movement state, never the reverse. Use stable torso anchors in water; retain existing foot anchors on land. Frame/crop/muzzle metadata belongs with each hero. Shooting and hurt take precedence without resetting locomotion needlessly. These are pose briefs, not completed animation sheets. The approved horizontal concept sheet in art/sunken-patisserie/ supersedes the original upright posture assumption; use natural prone gliding/strokes with legs trailing behind.

## Aquatic roster

| Archetype | Silhouette and role | Anticipation and counterplay |
|---|---|---|
| Reef Patroller | Round-bodied fish, broad tail, pale stripe; bounded patrol | Turns visibly at patrol ends; safe first contact/combat lesson |
| Bubble Puffer | Round/spiny silhouette; stationary or slow hover | Inflates before releasing a few slow bubbles; clear recovery gap |
| Current Rider | Slim finned shrimp; rapid directional commitment | Coils and faces one lane, then dashes without homing |
| Armoured Crustacean | Low wide crab in scavenged copper cookware | Closed shell blocks shots; front opens during a clearly signaled action/recovery |

Only the Reef Patroller enters the first environmental slice, after movement approval. Puffer follows. Rider and crab wait for current and vulnerability tests. Give defeats distinct short dissolves/tumbles, never persistent damaging corpses. Size encounters around the approved hero muzzle heights and actual movement corridors.

## Route topology

This is a connectivity proposal, not a measured tile layout:

~~~mermaid
flowchart TD
  E["Flooded Entrance: dry landing and safe pool"] --> C1["Culture 1: submerged arch"]
  C1 --> G["Coral Gardens: split vertical passages"]
  G --> C2["Culture 2: fermentation rotunda"]
  G --> O1["Optional coral loft: supplies"]
  O1 --> C2
  C2 --> K["Pressure Kitchens: current shaft and dry pocket"]
  K --> C3["Culture 3: pump gallery"]
  K --> O2["Optional service loop: treasure"]
  O2 --> C3
  C3 --> C4["Culture 4: descending oven flue"]
  C4 --> A["Abyssal Patisserie: monumental oven nave"]
  A --> C5["Culture 5 and final checkpoint"]
  C5 --> B["Octopus arena and finishing oven"]
~~~

Cultures 1–5 are on the intended progression route; optional loops offer supplies, score and vistas. Checkpoints at entrance, gardens exit, pressure-kitchen exit and boss approach; use broad safe alcoves, initially dry where possible. Include an underwater checkpoint test even if final placement uses dry pockets.

Solid walls/ceilings enclose swim routes. One-way platforms alone cannot constrain a swimmer. Every required passage has generous clearance and return access; missing a ledge costs time rather than a life. No culture behind a one-way boss lock. The finishing oven requires five cultures and boss defeat.

Start with fixed water regions and a pump that redirects a current. Changing actual water level is deferred: it introduces substantially more collision, visual and checkpoint state. Required pump interaction should be immediate and legible, without an extended puzzle. Later, a reachable valve and shootable actuator can share one progression state for the two heroes, subject to review.

## The Master of the Deep

A proud violet octopus baker with pale suction cups, a tall cream chef cap, stained apron, copper buckles and tool belt. Two arms work the tools, others brace on arches, copper counters and oven pillars. Large expressive brows communicate theatrical outrage.

The lame is a small scoring razor on a slim handle, not a sword. Give it a narrow, precise silhouette and a pronounced raised-arm preparation. The bench scraper is a broad rectangular steel blade with a wooden handle; its flat push creates a wide water wake and bounded knockback.

| Beat | Warning | Active action | Opportunity |
|---|---|---|---|
| Lame | Raised tentacle traces a visible lane | Committed scoring sweep | Tool sticks briefly in a counter; exposed mantle |
| Scraper | Scraper turns broadside, arm retracts | Broad shove/water wake | Dodge above/below, then approach during reset |
| Ink | Cheeks inflate, cap lifts, dark bubbles gather | Brief drifting scalloped patches | Reposition using visible landmarks |
| Reposition | Bracing arms reach toward next anchor | Body pulls between fixed structures | No hidden contact damage from decorative arms |

Start with approximately 0.7–1.0-second tool warnings and a roughly two-second ink event; all are tuning proposals. Show the entire attacking tool and warning area on a small landscape phone display. Avoid opening the encounter with overlapping attacks.

Ink is a bounded world-space effect: draw cloudy backdrop obstruction, then restore player, immediate collision edges, projectile threats and damage warnings over it. Keep a clear player-centered area and stable arena landmark visible. Reduced obstruction makes clouds faint outlines while preserving their timing. No flashes, uniform black overlay or invisible hitboxes.

The final phase combines previously learned patterns with recovery gaps, rather than increasing health or attack frequency excessively. Exact health waits for arena playtesting. Defeat: tools settle safely, the octopus tangles gently in its own apron, cap deflates, then it gives an indignant exhausted bow and opens the finishing oven. No production boss work before isolated attack review.

## Technical impact assessment

Inspected production source, not only historical notes:

| Area | Current constraint | Proposed bounded change |
|---|---|---|
| index.html / world.js | MAXBAKERY=3, three-layout lookup, fixed width, hard-coded initial spawn, support-derived checkpoints | Small world registry with stable IDs, layout, spawn, checkpoints, recipe, audio and presentation hooks; preserve old entries |
| physics.js / gameplay.js | updatePlayer returns shoot/aimUp; ledge handling can skip the frame | Explicit water movement adapter returning the same contract; unchanged dry execution path |
| shell.js / input-model.js / shell.css | Left/right pointer group, Up/W mapped to jump, one action per source | Region-aware action mapping and water direction-vector ownership; retain capture, cancellation and multi-pointer release semantics |
| collision.js | # is solid; =/M are downward one-way crossings | Reuse solids for swim chambers; consciously define submerged one-way behavior; currents cannot tunnel through tiles |
| combat.js | aimUp comes from jump; one-hit generic enemy deaths; dry damage knockback | Water aim resolver, muzzle metadata and region-aware bounded knockback; later enemy-specific hit/vulnerability dispatch |
| characters.js / baker-pilot.js / vance-wick.js | Animation keyed to dry ground/air and foot anchoring | Water pose selection before dry fall selection; stable water anchor; original dry art untouched |
| camera.js | Shared horizontal/vertical dead zones and fall-biased follow | Begin with current follow; review bidirectional water traversal before adding water-only tuning |
| render.js / architecture.js / atmosphere.js / art/vertical-parallax.js | World-specific branches and three environments | World 4 render hooks; water/background/actors/foreground/essential-visibility ordering; cull and cap effects |
| assets.js / loading.js | Eager startup gate contains primary three-world artwork | Register prototype assets explicitly; later load World 4 before entry with the approved gate; do not reveal fallbacks |
| ovens.js / hud.js | Three-frame oven/goal art, /3 label, three map titles | Registry-driven count/title/goal presentation, new oven assets; keep five-culture HUD |
| audio.js / audio-engine.js | Facade clamps to 3; three themes | Registry-selected bakery4 only after audition; preserve scheduler, voice caps, gesture unlock, mute/pause |
| Saves / credits | Codex filters integer IDs below MAXBAKERY; three recipe entries; three-bakery credits copy | Preserve IDs 0–2 and keys; append recipe ID 3; accept mixed old/new saves without resetting; update final completion/credits |

A registry is a small classic-script configuration addition, not an ES-module migration or general engine rewrite. In the isolated prototype, use existing world dimensions and a preview-only layout; defer production progression changes until movement and direction approval.

## Small movement prototype, after approval

A separate preview entry using production simulation/input/render modules with a narrowly scoped water adapter. No fourth-world entry in the released campaign yet.

Five linked test spaces:
1. Dry landing and shallow safe basin: walk, enter, tread and return.
2. Broad chamber: up/down, diagonals, reverse and shoot target markers.
3. Submerged arch and tight bend: collision, ceilings and stable hitbox.
4. Current shaft: escapable lateral flow and a bubble vent.
5. Surface exit ledge and dry pocket: breach, land and repeat.

Both heroes, pause/fullscreen/touch settings, unlimited retry and reset. No oxygen, boss, mandatory mixer skill, puzzle chain or new soundtrack. Include two movement presets for direct comparison: recommended free swim and buoyant-platforming reference. Water feedback can be simple explicit prototype rendering; do not present temporary land poses as completed swimming animation.

Prototype tests: dry deterministic baselines identical; acceleration/reversal/diagonal cap; solid collisions and currents; no surface chatter or stored jump; water entry from a fall; surface exit and dry jump; checkpoint restore while submerged; aim independent of ascent; both hero muzzle paths; simultaneous touch direction/fire/aim; release on pause, blur, rotation and capture loss. Physical phone review remains required.

Success gate: Joel and Vance can steer, stop, descend, fire and leave water comfortably on desktop and phone, with no accidental upward firing and no dry-world regressions. Only then author the Flooded Entrance art/enemy slice.

## Audio brief for later audition

Superseded by the approved **Where the Starter Sleeps**, audition revision 04: 104 BPM, 4/4, E Dorian, open-water opening/return and underwater mix. Integrated in the Flooded Entrance and connected route previews. See ../previews/sunken-audio/README.md.

Rounded bass, soft FM-inspired bells, sparse bubbling percussion and spacious, slightly mysterious phrases. Sketch an original lilting 6/8 candidate to contrast the existing worlds; audition before committing. Keep stroke and bubble effects sparse and voice-budgeted, with no continuous noisy blanket. Preserve the three approved scores and all lifecycle behavior.

## Validation and review boundary

Baseline command run:
node --test keen/tests/*.test.cjs previews/audio/audio.test.cjs

Result: 416 passed, 0 failed. Canvas/audio stubs do not validate visual quality, phone performance, native fullscreen or physical multitouch. No gameplay changes were made.

Prototype validation: 432 tests passed, 0 failed, including 16 swimming tests and the unchanged three-world regression suite. Browser review confirmed startup, both horizontal hero poses and touch-control presentation.

Milestone 3 validation: 440 tests passed, 0 failed. The isolated Flooded Entrance adds new architectural art, a single bounded reef patroller, safe checkpoint recovery and both-hero course coverage while retaining the approved free-swim tuning.

Next review: environmental readability, water/air contrast, the first patroller encounter and physical phone performance. The slice is in previews/flooded-entrance/. Full level construction, further enemies, production integration and merge still require their later reviews.

## Approved Current Rider placement — October 23, 2026

The isolated Current Rider encounter is approved. Joel's placement direction: it is tricky and annoying, so use **one Current Rider total in the full World 4 map**, at a key point that keeps the player alert. Do not repeat it across sections or include multiple simultaneous Riders. Preserve its reviewed dash/telegraph/recovery behavior. Final location remains a world-construction decision; provide clear dash lanes, perpendicular escape space and wall-stun opportunities, then review the placement in context.

## Milestone 5 connected route — October 23, 2026

The crab and final claw animation are approved. The connected route preview reuses all approved archetypes: three reef patrols, two Puffers, exactly one Current Rider in the pressure shaft, and one required crab passage. Five cultures, four forward checkpoints, optional supply branches, a shared shootable/Interact pump, dry pockets, vertical baffles and an actual route map are implemented. Checkpoint retry retains cultures, supplies, pump state and defeated enemies. The ending is explicitly the boss approach, with no recipe/campaign completion. Review ../previews/sunken-world/README.md and play the route before broader placement/art polish or boss development.
