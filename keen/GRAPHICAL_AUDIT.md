# Crust Quest — Graphical audit

Reviewed October 22, 2026. Baseline: `646ff61535eb04f4a263f60e8f698a48a42e7547`, the all-enemy Bakery 1 scale preview, with `enemyScale=pilot` for Bakery 1. This includes the unmerged Vance muzzle alignment and approved enemy-scale audition. Main alone is not this visual baseline.

## Overall assessment

Preserve the existing art direction. All three worlds have distinct identities, most platform tops remain readable, and the larger Bakery 1 enemies fit the characters substantially better. This audit does not justify replacing the environments or boss art.

No P0 visual blocker was observed. Four actionable findings and one optional art-direction refinement follow. Only V1 crosses into combat behavior; keep that change separate from purely graphical fixes.

## Coverage and limitations

Inspected the deployed review build in the Work browser at a 1363 × 936 viewport, with a 960 × 540 internal canvas. Reviewed all 14 existing environment scenes:

| World | Scenes | Character seen |
| --- | --- | --- |
| Moonlit Bakery | courtyard, hall, towers, forecourt | Vance at towers; Loafy at courtyard, hall, forecourt |
| Fungal Caverns | foothills, grotto, canopy, plunge, bloomrot | Vance at canopy; Loafy at foothills, grotto, plunge, bloomrot |
| Clockwork Ovens | boilerworks, shafts, skybridge, descent, ovenhall | Vance at skybridge/descent; Loafy at boilerworks, shafts, ovenhall |

Also inspected the prepared `oven-ready-3&goals=pilot` state: the defeated Devourer and released finishing oven both render. This checks a prepared end-state, not the complete live defeat animation. The Foreman and Bloomrot approach scenes displayed their boss art and health indicators. Full boss fights, every animation frame, every discovery-room interior, physical phone dimensions, actual multitouch and OS fullscreen were not certified here.

Touched the character selector to compare both heroes, and inspected the cavern with `touch=1` to reveal interface interactions. This was a desktop-sized touch overlay, not mobile emulation.

Source inspection covered environment construction, render ordering, checkpoints, discovery HUD, enemy renderers, projectile origins and goal artwork. The latest baseline regression suite passed 401 tests before this documentation-only audit; no code or art changed during the audit.

## Findings

### V1 — P1: later-world enemy scale and Vance's firing line disagree

**Location:** Bakery 2 and 3 ordinary ground enemies; especially canopy and Clockwork pressure/service galleries. `fungal-enemies.js`, `clockwork-enemies.js`, authored bodies and `vance-wick.js`.

**Observed:** Later-world enemies are visibly much smaller than Vance and the approved Bakery 1 enemies. Their bodies remain 25 × 25; most displayed silhouettes are approximately 30–42 pixels high. Vance's horizontal muzzle is approximately 43–49 pixels above his feet. This is a visual-scale inconsistency with a reproducible targeting consequence.

**Reproduce:** Load the canopy or skybridge environment scene as Vance to compare proportions. In the game harness, initialize world 2 or 3 with normal art enabled; keep one walker, hopper or thrower, place it on an unobstructed shared floor at x=800, and put the player at x=640 on that floor. Fire once horizontally and advance projectiles 30 ticks without moving either actor. For all six world/type combinations, Loafy's shot hits and Vance's standing shot misses. This is a controlled source/harness reproduction, not a claim that every live encounter is impossible; terrain height, pogo and moving targets affect real encounters.

**Expected / actual:** Both heroes should have useful, visually honest combat against the ordinary roster. Actual flat-ground horizontal fire travels above the smaller targets for Vance.

**Impact:** Smaller threats look secondary after Bakery 1; Vance's basic firing is less useful against them.

**Suggested fix:** Audition role-specific scale/body adjustments in worlds 2 and 3, using the approved Bakery 1 proportions as a reference rather than making every silhouette identical. Audit caster release points, warning offsets, flyer dive clearance and hopper support separately. Preserve bosses, attack timings, health and world identities. Do not enlarge the flyer automatically just because ground enemies change.

**Risk:** Medium: contact bodies, headroom and projectile elevation need encounter regressions and playtesting. **Approval:** Required for the later-world scale rollout; approval so far covers Bakery 1 only.

### V2 — P2: checkpoint foreground hides the player

**Location:** Checkpoint positions across all worlds. Especially obvious at cavern grotto/Bloomrot approach, Moonlit courtyard/Hall, and Clockwork boilerworks/shafts. `render.js`, `interactables.js::drawCheckpoints()`.

**Reproduce:** Load an environment preview at one of those checkpoints, press Play and stand at the pole; or return to a checkpoint. Loafy can be almost completely masked by the ornate pole, cloth and base. The grotto screenshot shows this without damage blinking being necessary. The same ordering applies to Vance.

**Expected / actual:** The hero's silhouette should remain legible at the retry/activation point. `drawPlayer()` currently runs before `drawCheckpoints()`, so the entire flag assembly paints over the character.

**Impact:** Momentary loss of player location exactly where players resume or activate a save.

**Suggested fix:** Draw the flag assembly behind the player, or split its base/pole and limited foreground detail. Keep the approved animated flag, its cloth motion, source art, support anchor and checkpoint behavior. Do not replace it with a new design.

**Risk:** Low: draw order only, but check player/oven layering and all checkpoint poses. **Approval:** Recommended visual-fix batch.

### V3 — P2: relic counter conflicts with the touch action area

**Location:** Fungal Caverns, any scene with touch controls shown. `cavern-exploration.js::drawCavernDiscoveryUI()` and shell control layout.

**Reproduce:** Open `?scene=environment-canopy&touch=1` or `?scene=environment-grotto&touch=1`, press Play. `RELICS 0/3` occupies the same lower-right visual area as the Kefir/Interact secondary buttons. It is visible through/around the controls instead of having a clear reserved position.

**Expected / actual:** Persistent progress text should sit outside control footprints. The counter is fixed at canvas `(W-14,H-13)` regardless of the DOM action pad; the canvas and DOM layers do not reserve space for each other.

**Impact:** Relic progress and button labels compete. Physical-phone severity still needs checking, but the overlap already reproduces at the audited viewport.

**Suggested fix:** Give relic progress a compact, consistent HUD slot or a touch-aware safe anchor. Account for control-size settings and portrait/landscape layout. Preserve the overall approved fullscreen interface and non-color cues.

**Risk:** Low–medium: responsive placement across HUD states. **Approval:** Recommended visual-fix batch.

### V4 — P2: cavern canopy stems reveal repeated texture joins

**Location:** Fungal canopy and deep plunge. Most visible below the canopy landing near x≈67.5 tiles, and on the narrow vertical backing strips in the plunge. `fungal-environment.js::fungalStem()` and `fungalCliff()`.

**Observed reproduction:** Open the canopy scene and inspect the tall supports below the bright caps. Some stem segments end in abrupt straight horizontal boundaries, change texture width/appearance at a join, or repeat a flared shape midway down the support. The plunge view also exposes flat crop boundaries on long texture strips.

**Expected / actual:** The supports should read as continuous organic trunks. Repeated body samples and the terminal root-foot transition are visibly assembled in these long exposed spans.

**Impact:** Noticeable environmental-art discontinuity. This is an observed seam with an aesthetic judgment about its prominence, not a collision defect. The bright landing rims themselves remain aligned and readable.

**Suggested fix:** Adjust body/foot join placement, clip overlap within the support and use a quiet connector texture or narrow seam mask. Preserve authored collision geometry, cap tops, route space and world palette. Start with the most visible supports rather than repainting the cavern.

**Risk:** Low–medium: localized rendering/crop changes, with visual regressions against platform edges. **Approval:** Recommended environmental-polish batch after V2/V3.

### V5 — P3, subjective: Clockwork background competes with small combat silhouettes

**Location:** Skybridge/pressure gallery, boilerworks and descent.

**Observed:** Warm machinery, windows, lamps and effects occupy much of the same contrast range as the bronze enemies. Cream platform rims and hero silhouettes remain clear; small mechanical enemies are less immediately prominent than the Bakery 1 roster.

**Expected / actual:** Gameplay threats should attract attention before distant industrial detail. The current detailed factory sometimes competes with those threats. No specific invisible projectile or unfair hit was established by this audit.

**Suggested fix:** Re-evaluate after V1. If still needed, slightly quiet local backdrop contrast or add restrained enemy separation at the existing silhouettes. Keep the approved dramatic parallax, massive gears and industrial palette. Do not darken the whole world by default or alter hitboxes to address contrast.

**Risk:** Low for a reversible contrast audition. **Approval:** Optional art-direction choice, not a confirmed defect requiring a fix.

## Strengths to preserve

- Moonlit masonry, roofs and timber supports form a coherent architectural language. Enlarged Bakery 1 enemies read well without competing with the Foreman.
- Fungal flat luminous landing rims distinguish real supports from the detailed organic background. Relay runes have distinct shapes; route signs use arrows and symbols rather than red/green alone.
- Clockwork cream deck tops, structural framing and dark service-room interiors give the player useful depth cues despite the dense factory scenery.
- Culture jars and the slim lightning-marked kefir bottles are visually distinct. Existing pickup glints, flag state badges and goal icons generally communicate their roles.
- No widespread stretched-tile or missing-environment problem appeared in the 14 sampled scenes. Keep the fixed-scale strip/cropping approach.
- Foreman and Bloomrot approach art is present. The prepared Devourer defeat pose and real finishing oven are present and visually coherent. Leave boss design and balance intact.

## Recommended order

1. **Pure visual fixes:** V2 checkpoint layering and V3 relic HUD placement. Small focused changes, reviewed as both heroes with touch shown/hidden.
2. **Character/enemy consistency:** V1, as separate Bakery 2 and Bakery 3 scale auditions. This is the highest-impact issue but crosses into collision/combat, so keep it separately reviewable.
3. **Environment integration:** V4, targeting the visible cavern seams only.
4. **Optional depth tuning:** V5 only if enemy resizing still leaves a visibility problem.

Use the existing 401-test baseline and add focused checks where draw order or responsive anchors change. Visual confirmation must still include real scenes; a stubbed canvas test cannot prove a seam or contrast issue is fixed. No art, gameplay or merge changes were made by this audit.
