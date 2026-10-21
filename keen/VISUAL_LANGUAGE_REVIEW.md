# Crust Quest — Visual Language Review
## Current review status
Branch: `design/keen-world-polish`; main remains unchanged. The original audit and rejected first entry audition below are historical. Later approvals supersede their proposed treatments:

- Preserve the original animated checkpoint flags completely.
- Approved culture jar and distinct lightning kefir bottle; culture YEAST badge removed in the pickup pilot.
- Approved wordless Fungal and Clockwork fork/return signs; do not reintroduce OPTIONAL.
- Approved shape-based map, supply artwork/recharge segments, and oven readiness plaques.
- Clockwork entrance crate/up and steps/up concepts approved for implementation. Keep its kefir control tutorial and maintenance place name.
- Boss captions, puzzle dialogue, controls and enemy behavior remain outside this indicator pass.

All artwork remains behind explicit pilot query switches pending final integrated review. Current browser/runtime verification and tests are recorded in the individual playtest documents. Earlier statements that no browser/runtime was available describe only the original audit session.

## Original audit (historical)
Status at initial audit: concept direction approved; first entry pilot rejected and reverted. No gameplay changes were made during that initial audit.

## Evidence and limits
Source audit of main: render.js, hud.js, architecture.js, interactables.js, mycelium.js, ovens.js, foreman.js, bloomrot.js, devourer.js, throwers.js, world.js, gameplay.js, index.html, and all three vertical layouts. Published URL retrieval failed. No cloud browser or usable execution environment is exposed in this session. No visual playthrough, mobile verification or node tests claimed. Inventory below covers the inspected communication families; image-baked lettering and exact on-screen overlap still require browser inspection.
MAINTENANCE.md is stale: it still names the refactor branch, describes one global composition, and omits newer modules. Current source and AUDIO_INTEGRATION.md should govern subsequent implementation.

## Communication inventory
“Learned” describes a proposed teaching sequence, not measured player understanding.

| Current cue | Location / meaning | Essential information? | Visual treatment / learning | Concern / text policy |
|---|---|---|---|---|
| STARTER WORKSHOP | B1 (16.5,49), room identity | Flavor | Keep place name; pair with a small loaf seal | Not an instruction; no need to erase all words |
| PROOFING HALL | B1 room near (40,33) | Flavor | Keep architectural name | Avoid mistaking room name for route |
| YEAST badges; floating jar, halo, glints | Five cultures per world | Yes: required pickup | Preserve jar; teach with first jar and five-slot HUD | Do not replace actual jar with abstract collectible diamond |
| CHECKPOINT / SAVED / PASSED; flag and corner burst | Four authored flags per world | Yes: recovery state | Folded pennant → unfurled check-mark pennant; current flag has double foot ring, passed has one | Flag animation/colour alone insufficient; first activation keeps SAVED |
| +25 AMMO / AMMO Ns | Refreshing B3 arena supply | Yes: resource and refill time | Shot cartridge silhouette + segmented recharge ring | Retain numeric amount/time in optional labels; ring must not imply a new mechanic |
| Supply artwork and pickup floaters | Kefir, rye, banneton, cache | Yes: different effects | Bottle, heart-marked bread, basket shield, open cartridge crate | Kefir stores an action, rye heals, checkpoint need not heal; never combine these promises |
| KEFIR STORED · V TO DASH / KEFIR DASH | Pickup/use, all applicable worlds | Yes: action learned | Bottle with motion tail plus existing key/touch prompt | Keep first teaching text and control name |
| Maintenance / kefir reserve; STORE NOW · V / KEFIR TO DASH | B3 entrance (14–14.5,50–52) | Place name optional; action essential | Bottle recess and supply pictogram | Keep control tutorial until learned |
| SUPPLIES ↑ / LIFT SHAFT ↑ | B3 (17,48), (23,44) | Yes: destination | Supply silhouette or route chevron with arrow | “Lift” must not promise a moving lift |
| MAIN → / CULTURES; BONUS ↑ / DANGER; DESCENT → | B3 (55,27), (55,26), (76,17) | Yes: fork semantics | Solid route arrow + jar; split-tail optional arrow + warning triangle | Direction and optional status must survive monochrome |
| SERVICE STAIRS ← / CHECKPOINT ← / OVEN FLOOR ↓ | B3 (98,32), (83,33), (79,38) | Yes: return route | Arrow + destination pictogram | Never point through collision or away from actual recovery path |
| MAIN DESCENT ↓ / BONUS / DANGER ↑ | B2 plunge fork (61,31), signs above fork | Yes: mandatory descent vs optional canopy | Same main/optional grammar as B3 | Keep first-fork short captions until understood |
| SPOREKEEPER · E; Talk/Continue | B2 near (29.4,38) | Yes: interaction | Speech bubble + contextual E / Talk | Proximity/control cue stays; do not rely on keyboard only |
| THE ROOTS ANSWER; relay hints; dialogue | B2 grotto / top overlay | Yes: sequence puzzle and state | Numbered/patterned nodes and connecting roots supplement text | Preserve dialogue, remembered-order instruction, retry guidance; not part of first pilot |
| ! + filling bar + raised dough hand | Thrower windup | Yes: imminent attack | Retain body pose; warning triangle may replace tiny ! panel later | Existing 36-tick timing unchanged; no telegraph timing redesign |
| Foreman attack/opening/guard labels | B1 boss | Yes: counterplay | Warning vs broken guard shapes, paired with existing poses | Keep all approved boss labels in pilot; proposed vocabulary only |
| Bloomrot charge/spores/opening | B2 boss | Yes | Same warning/opening grammar; organic treatment | No boss readability or difficulty change without separate review |
| Boss name/health, defeated, oven recovered | Three boss arenas | Yes: status; some flavor | Preserve health and celebration text | Replacing numeric health is outside scope |
| Oven artwork and five-culture readiness messages | World destination / Foreman aftermath | Yes: gate conditions | Oven arch + five jar sockets; shutter closed/open | Never imply “ready” while boss/culture gate remains locked |
| HUD HEALTH/YEAST/AMMO/SCORE/BEST/BAKERY | Screen top | Yes: quantities | Small matching pictograms may supplement | Keep numbers and readable labels in initial pilot |
| Map colour-name legend; coloured rectangles | World map | Yes: navigation | Flag, jar, spike triangle, baker head, oven arch + written names | Current colour-only legend is accessibility debt; platforms/spikes also need separate forms |
| Pause, recipes, controls, toolbar, touch buttons, status | HTML and overlays | Yes: controls and text content | Keep semantic labels/aria names; icons can supplement | Tiny world symbols cannot teach keys; touch controls remain labeled |
| Combo, score, powerup, checkpoint floaters | Event feedback | Useful | Short-lived confirmation with matching icon | Avoid stacking with permanent badges; preserve first-use help |
| Diagnostic grid/readout | Debug only | No gameplay meaning | Exclude from production symbol language | Not a player instruction |

## Proposed vocabulary: ten meanings
Common grammar: cream/light core on dark separation; fixed silhouette across worlds; surface material changes, symbol does not. Route arrows remain literal arrows. No rune memorization.

| Meaning | Shape / behavior | Placement and teaching | World treatment: Moonlit / Fungal / Clockwork | Text availability |
|---|---|---|---|---|
| 1 Main route | Broad solid single arrow; jar inset only when leading toward required culture | At real decision points; static | Carved wood or flour stencil / root-grown border / riveted plate | First fork caption; labels in help |
| 2 Optional challenge | Split-tail outlined arrow with small warning triangle | At optional entrance and rejoin, never on required path | Notched wood / branching roots / perforated metal | First appearance “Optional challenge” |
| 3 Hazard | Upright triangle with jagged internal slash; static warning edge | Beside actual hazard, outside landing surface | Scored timber / thorn rim / diagonal hazard hatching | Short contextual explanation if needed |
| 4 Interact | Speech bubble for talk, inset hand for actionable object; brackets only when actionable | Only existing interactions; no symbol on scenery | Chalk medallion / pale cap plaque / enamel button plate | Actual E / Talk prompt remains |
| 5 Checkpoint | Pennant; folded before activation, check-mark cloth after; double base ring for current | Existing flag/support only; brief activation unfurl | Cloth / leaf cloth / heatproof fabric | First SAVED confirmation; optional labels |
| 6 Supplies | Open crate with actual item silhouette inset; bottle, heart-bread, shield basket, cartridges | Existing supplies; static except actual refill state | Pantry crate / woven root basket / metal locker | First pickup effect and all resource numbers remain |
| 7 Required culture | Existing stoppered jar, three bubbles; five matching HUD sockets | Existing five pickups and objective display | Ceramic/glass / mycelial glass / strapped heatproof glass | First “Collect five cultures”; optional YEAST badges |
| 8 Attack incoming | Triangle above enemy plus existing attack pose; contracting marks follow existing windup only | Active threats only, never decorative machinery | Dough-hand / swelling spore / cocked mechanism | Boss captions retained until separately reviewed |
| 9 Vulnerable opening | Broken shield with separated halves; brief outward settle | Only genuinely vulnerable existing phase | Cracked crust / split cap / separated armor | Boss text stays in first milestone; no misleading generic cue |
| 10 Goal / gate | Oven arch with five jar sockets; visible closed shutter vs open interior | Actual oven or final approach | Brick / root-grown stone / iron furnace | Keep missing-culture and boss-lock conditions readable |

Reduced motion: static silhouettes and state changes communicate everything; pulses/unfurls supplementary. Do not add decorative copies of gameplay symbols. Keep each marker near its referent, with dark backing where necessary. Evaluate at native 960×540 and the actual CSS mobile size, including grayscale; proposed small marks need pixel-size proof before acceptance.

## Visual direction alternatives
A — Integrated maker marks (recommended): constant cream symbols carved/painted into wood, root-edged tablets and riveted metal. Minimal local animation. Fits existing architectural rendering and keeps a strong common shape.
B — Hanging guild plaques: same symbols on larger suspended plaques. Stronger visibility, but more clutter and potential actor overlap.
Concept sheet should show A across all three worlds and a small A/B comparison. These are art proposals, not production-ready sprites.

## Bakery 1 pilot recommendation
Use Bakery Entry, columns 4–22 and rows 48–54: first ledges, checkpoint (8,51), workshop (11,48,11,6), first culture (16,50), ground walker and roof hopper remain identical.
This is an honest limited test: B1 opening has few instructional signs. Its best targets are repeated YEAST and CHECKPOINT/SAVED badges, not a dense route-sign replacement. Keep STARTER WORKSHOP as a place name.
Before: YEAST badge over first jar; CHECKPOINT then SAVED over first flag; named workshop.
Proposed after: recognizable jar without permanent YEAST badge; folded/unfurled check flag without permanent checkpoint badge; one-time “Checkpoint saved”; workshop name plus discreet bakery seal. Add at most one solid route chevron only if browser inspection demonstrates a real navigation need. Do not invent a “safe refuge” sign beside existing enemies.
Compare A/B screenshots at identical camera, game state and scale, including inactive and active flag states and grayscale. Concept compositions are not screenshots.
After concept approval, build a rendering-only, opt-in branch preview using shared production sources and a scoped pilot switch; no duplicated game page or stale snapshot. Preserve every collision tile, pickup position, hazard, encounter, input, checkpoint rule, boss and soundtrack.
Future implementation gate: node --test keen/tests/*.test.cjs; rendering expectations reviewed deliberately; desktop and real touch checks; marker overlap at both states; no merge before user approval.
Playable pilot and source-based before/after screenshots are pending approval and a working browser/runtime. No playable preview is claimed in this design-only delivery.

## Review decision
Approve or adjust direction A and the ten meanings before rendering changes. Then implement only the entry checkpoint/culture pilot. Do not start enemy/world redesign.


## Authoritative pilot review correction
The entry pilot was rejected. Preserve existing animated checkpoint flags and their distinctive activation change completely; checkpoint concept sketches above are not authorization to replace them. Restore original culture artwork and badge for now: removing a single badge was not a meaningful visual comparison. The entry pilot recommendation above is superseded. Next candidate is an existing text-heavy route fork in B2/B3, with explicit before/after review before artwork implementation. Do not extend the rejected pilot. See ENTRY_INDICATOR_PILOT.md.
