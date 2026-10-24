# The Master of the Deep — lame review

Isolated Milestone 6.1. Run `node previews/octopus/build.cjs`, then serve the repository and open this directory. Reuses approved free swimming, both heroes, underwater music, startup artwork gate, mobile controls, fullscreen and pause lifecycle. No campaign integration or save writes. Route preview remains separate.

Fixed 960×540 arena keeps the whole tool and warning visible on landscape phones. Ninety-tick opening; 60-tick wind-up tracks for its first half, then locks for 30 ticks. A steady outlined ribbon is wider than the damaging 36-pixel razor sweep. Twenty-two-tick committed sweep, then 100-tick exposed-mantle recovery. Eight health, 24-tick hit immunity; no overlapping attacks, no damage from decorative limbs. Four player hearts. Retry resets the isolated fight. Defeat immediately disarms the attack and plays a four-second, six-pose theatrical sequence before completion. Both tools drop harmlessly, arms tangle in the apron, the cap collapses and the Master bows before settling into a persistent exhausted pose.

Review dodging, tool readability and vulnerability timing first. Bench scraper, ink, anchor mobility, route completion wait for subsequent reviews. No special boss music added; uses approved underwater track.

`node --test previews/octopus/*.test.cjs` checks warning/lock timing, swept hit detection, safe lanes, vulnerability/invulnerability, defeat disarm, both heroes, retry, stationary pressure and a complete damage-free encounter using real movement/shooting.

## Artwork provenance

Built-in image-generation skill used; reference: `keen/art/sunken-patisserie/octopus-baker-concept.png`. Current outputs: `previews/octopus/pixel-master.png` and `previews/octopus/pixel-lame.png` (original alpha preserved). `master-frames.png` is superseded and no longer loaded. Runtime samples three aligned body expressions and three matching textured tentacle/grip poses through `boss-art.js`. The tentacle extends between explicit anchors; the gripping hand and small lame keep uniform scale. All limb drawing uses bitmap sprites; warning lines remain HUD geometry. Native smoothing is disabled. Art-only revision preserves the approved simulation module unchanged. No animation frame changes collision.

Prompt: Three equal cells in one horizontal transparent sprite row, detailed pixel art of the same violet octopus baker with pale suckers, tall cream cap, stained apron, copper buckles and tool belt, facing left. Composed, angry wind-up, exhausted recovery expressions; same scale and body center. Resting arm holds bench scraper; separate small wooden-handle scoring razor beside each pose. No background, labels or swooshes. Preserve approved concept identity. Full prompt is recorded in this development conversation.

## Pixel-art revision prompts

Body: Three equal horizontal transparent cells, same violet octopus baker identity, cream cap/apron, copper toolbelt, resting scraper; idle, angry wind-up and exhausted recovery. Missing active front arm for separate animation. Approximately 96 by 128 logical pixels per character; coarse nearest-neighbour square clusters, stepped outlines, limited palette and three-step shading. No painterly texture, gradients or antialiasing.

Attack: Three equal horizontal transparent cells containing detached violet tentacles, thick root at right and gripping hand with small wooden-handled silver scoring lame at left. Slack wind-up, tense strike and curved follow-through; consistent anchors, pink suckers. Approximately 96 by 32 logical pixels, coarse pixel clusters, hard stepped outlines and limited palette matching the body; no vector curves or painted texture.

## Generated inbetween revision

Current body: `joined-master.png`, edited with built-in image generation to replace the hollow front shoulder sockets with continuous solid violet skin. Current attack atlas: `lame-inbetweens.png`, eight individually generated coiled/wind-up/quarter/half/three-quarter/full/recoil/tucked poses in two columns and four rows. Earlier `pixel-master.png` and `pixel-lame.png` remain historical assets and are no longer loaded.

Every attack pose is drawn at the same uniform 1.15 scale. No affine limb stretching, per-axis scaling or generated-vector tentacles remain. Source blade anchors follow the original simulated sweep position exactly. Poses are chosen by reach; excess coiled length sits behind the torso, and the continuous shoulder masks the root. Recovery selects the generated curled poses. The original `master-of-deep.js` behavior is unchanged.

Generation prompts: preserve the three-body pixel atlas and repair only the upper-left circular socket into uninterrupted rounded purple skin. Generate eight separate pixel tentacles with a fixed right muscle root and progressively leftward razor positions: tightly coiled, raised wind-up, initial extension, half extension, three-quarter extension, full S-curve extension, curling recoil and tucked return. Match violet shading, pale pink round suckers, small wooden-handled scoring razor, hard square clusters and genuine transparency. Refine all eight into slender tapered limbs with consistent sucker/tool sizes and solid rounded roots, no cut cross-sections. Assets generated through the built-in image tool; original alpha retained. Runtime only crops, rotates and places the generated poses.

## Slender-limb art refinement

`lame-slender.png` refines the intermediate atlas to match the body: slimmer tentacle cross-sections, smaller suction cups, finer outlines and a smaller scoring lame. Generated through the built-in image tool using the previous atlas and joined body as references. Prompt: preserve all eight poses, layout, centerlines, lengths and blade/root anchors; halve tentacle thickness, sucker diameter, razor blade and handle size; keep pixel clusters, colors and transparency. This changes the loaded bitmap only, preserving frame selection, uniform render scale, shoulder layering and approved attack simulation.

## Theatrical defeat review

`defeat-frames.png` contains six generated poses: shock, release, apron tangle, apron knot/collapsed cap, deep bow and settled exhaustion. Body scale and source baselines are registered separately for each row, with a smooth descent to the real arena floor. The final sprite remains opaque; no disappearing boss. Dropped lame and scraper reuse approved tool artwork and have no hitboxes. The original attack timings, health and damage windows remain unchanged. Completion waits for all 240 simulation ticks; pause freezes the simulation and retry resets the sequence.

Open `index.html?scene=defeat` for a direct review without combat. Choose Watch the Defeat, then use Pause / Retry to replay. The plain URL still offers the normal fight and triggers the same animation on the final hit. No production progression or save writes.

Generated via built-in image generation using `joined-master.png` as the identity/style reference. Prompt: six equal cells, three columns and two rows, the same violet pixel-art octopus baker at consistent scale/base; startled recoil with empty hands, drooping arms, tentacles curling into the apron, apron knot and collapsed cap, theatrical deep forward bow, then a relaxed exhausted but comically offended final pose. All tools drop separately; preserve costume/toolbelt and transparent background. No held weapons, no gore, no smooth illustration or vector substitutes.

## Milestone 6.2 — isolated bench scraper

Open `index.html?attack=scraper`. The plain URL preserves the approved lame fight; `?scene=defeat` preserves the approved bow review. These are independent attack reviews, not a combined encounter.

The scraper faces broadside during a 72-tick wind-up and holds a fixed, wide lane centered at y300. After an eight-tick visible shove it releases one left-moving crescent at six pixels per tick. A hit costs one heart and adds a 20-tick, 64-pixel maximum leftward displacement; per-pixel wall checks prevent embedding, and directional controls remain active. Contact follows the curved crest rather than the transparent corners. Escape above or below. Decorative arms have no contact damage. Only one wave exists, it cannot be shot away, and the recovery window exposes the same mantle for 112 ticks. Defeat clears the wave/impulse and reuses the approved four-second animation. Retry clears all temporary state.

Artwork: `scraper-frames.png`, four generated whole-body poses (broadside preparation, half push, committed shove, recovery) with connected arms; and `scraper-wake.png`, four generated rippling pressure-wave frames. Built-in image generation used with `joined-master.png` as character reference. Body prompt preserves violet octopus, cream cap/apron/toolbelt, constant body scale/anchors and slender integrated arm, one rectangular steel scraper with wooden top handle, crisp pixel clusters and transparent alpha. Wave prompt specifies a tall narrow left-moving hollow cyan/cream crescent, four same-sized foam/bubble poses, stepped pixels, transparent gaps and no flashing or bloom. Original image alpha is preserved. Runtime registration aligns the body per pose without scaling its arm.

Tests cover warning/release timing, crescent contact, safe routes, single-hit waves, bounded wall-safe displacement, defeat cleanup, both heroes/retry, and a complete damage-free encounter through actual swimming/shooting controls.

## Milestone 6.3 — ink at the camera

Open `index.html?attack=ink`. After a 72-tick cheek-puff warning, ink travels toward the camera and expands over the foreground in 18 ticks. It holds near-black across much of the playfield, then fades smoothly over the last 54 of its 240 ticks. It has no collision, damage or movement effects. Twenty-four ticks after release, an approved lame or scraper wind-up begins; the follow-ups alternate each cycle. Ink remains during their active frames. This is the ink/follow-up review, not final boss phase balancing or route integration.

FULL mode covers the player, warning lanes and incoming tool/wave attacks with the foreground ink. It has no player-centered opening or above-mask redraw: rely on remembered timing during the brief obstruction. A separate moving gap, arena outline, HUD and controls remain visible. REDUCED mode retains the player opening and above-mask local warnings and threats. This full-mode behavior was explicitly requested by Joel after the first ink review. The foreground mask uses a single reusable native-resolution canvas, no blur/filter or screen flashes. Rendering never updates attack timing. Pause freezes both effect and gameplay, retry clears all active ink, and defeat immediately clears ink and wave before the approved bow.

The pause/start menu exposes **Ink obstruction: FULL / REDUCED**. Reduced opacity is 28% of full and provides a 100-pixel player opening. This preview-only preference uses `crustQuestPreviewInkReduced`; it does not alter production settings or recipe progress. All review modes for the approved lame, scraper and defeat remain available.

Built-in generated assets: `ink-frames.png` (four aligned cheek inhale, puff, front-facing spray and exhale poses, reference `joined-master.png`) and `ink-cloud.png` (camera-facing irregular black splatter with pixel-edged lobes, droplets and transparent holes). Prompts require the existing violet pixel baker, cream cap/apron, copper toolbelt, naturally connected slender limbs and no held attacking tool; the jet is foreshortened toward the viewer. The cloud prompt specifies a mostly opaque black organic foreground mass with dark blue/violet pixel texture, no rectangular background, labels, smooth vector strokes, bloom or flashing. Original alpha is preserved.

Coverage includes harmless warning/spit, alternating attacks under ink, arrival/hold/fade, clear player/navigation openings, reduced obstruction, defeat cleanup, above-mask player rendering for both heroes, persisted preference/retry, pause and a complete damage-free combat run with actual swimming/shooting controls.

Full obstruction revision: Joel approved stronger concealment of the player and warning lanes on October 24, 2026. This supersedes the original always-readable player/local-warning ink proposal for FULL mode; REDUCED retains those aids. Obstruction timing, damage and physics are unchanged.
