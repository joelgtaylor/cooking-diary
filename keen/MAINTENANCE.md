# Crust Quest — Maintenance Guide

**Current baseline:** October 22, 2026, pre-expansion polish. See `CREATIVE_CHARTER.md` for creative boundaries and `PRE_EXPANSION_AUDIT.md` for findings and coverage limits.

**Working branch:** `polish/keen-pre-expansion`. Merge requires Joel's approval.

## Shipped architecture

`keen/index.html` is the production entry point. It loads classic scripts in dependency order; shared lexical game state still lives in its final inline bootstrap. Preserve the script order in the current HTML rather than copying historical inventories.

- `world.js` owns initialization, checkpoints, completion and three-world advancement; `physics.js`, `collision.js`, `combat.js` and `gameplay.js` own simulation behavior.
- `art/vertical-bakery{1,2,3}-layout.js` own the authored 105-column, 56-row worlds. The approved discovery geometry and districts must remain intact.
- `characters.js`, `baker-pilot.js`, `vance-wick.js` and `character-select.js` own rendering and the two-hero roster. Both heroes share physics. Vance's root-door shot intentionally uses the same solved relay state as Loafy's puzzle.
- `shell.js`, `shell.css` and `input-model.js` provide the production pause/menu/fullscreen/touch interface. `input.js` is the older adapter used by the legacy simulation fixture, not the production input binding.
- `render.js`, `architecture.js`, `atmosphere.js`, the three environment modules and `cavern-discovery-art.js` compose world presentation. `assets.js` registers images; some art scripts retain intentional embedded fallbacks.
- `audio.js` is the gesture/state facade; `audio-engine.js` contains the three approved world compositions and bounded effect/scheduler lifecycle. Preserve the scores.
- `foreman.js`, `mycelium.js`, `bloomrot.js`, `devourer.js` and `cavern-exploration.js` implement special encounters and discovery. Preserve their balance and progression contracts.
- Final credits are presented through the shell and retain both creators' credits, recipe access and replay.

## Save handling

Best score and recipe unlocks use the existing `crustQuestBest` and `crustQuestCodex` keys. Bootstrap guards unavailable storage and normalizes recipe data to unique integer IDs 0–2. Valid progress is retained; reads do not overwrite or clear stored data. Character and control preferences use their existing independent keys. Checkpoints remain in-session; this pass does not add level-save persistence.

## Validation and focused previews

Run from the repository root:

```sh
node --test keen/tests/*.test.cjs previews/audio/audio.test.cjs
```

`tests/game-harness.cjs` defaults to the legacy input fixture for simulation compatibility. `tests/shell.test.cjs` explicitly loads the production HTML and exercises real shell state transitions with DOM stubs. Both are needed. Stubbed canvas/audio and simulated pointers do not certify physical phone multitouch, visual quality or native fullscreen.

Existing `?scene=environment-NAME` links select inspection positions: courtyard, hall, towers, forecourt; foothills, grotto, canopy, plunge, bloomrot; boilerworks, shafts, skybridge, descent, ovenhall. The shell normalizes their old pause state so Play runs the scene in place. These links are inspection tools, not substitutes for full progression playthroughs. `?touch=1` exposes controls; `?perf=1` exposes local frame samples without telemetry. Measure warmed-up scenes on target hardware before optimizing.

Check desktop and physical mobile input, both heroes, both relay solutions, checkpoint recovery, all three bosses, finishing oven, credits, recipes, audio interruption and fullscreen. Confirm collisions and attack timing remain unchanged after presentation work. Critical cues must not depend on red/green color differences alone.

## Historical maintenance record

The following sections record the October 18 extraction work. Their dated branch links, inventories and incomplete-work notes are historical; current source and tests take precedence.

## Historical preview inventory

All 23 remaining standalone preview/diagnostic pages were retired after the gameplay/rendering extractions. They contained divergent copies of the game, including horizontal-mode and early vertical prototypes. Six preview-only scripts were removed with them: `authored-bakeries-2-3.js`, `bakery1-layout.js`, `background-polish.js`, `baker-outline-polish.js`, `baker-rig-clean.js`, and `baker-rig.js`.

The pre-cleanup snapshots remain in Git history at `b481e2b`. Use the commit-specific playable previews and automated baseline checks instead of copying old HTML back over production. Existing deep links to retired pages will no longer resolve after merge. `keen/index.html` and its production URL are unchanged.

## Refactoring sequence (behavior-preserving)

1. Establish a production baseline: desktop keyboard + touch input, three bakery transitions, five required yeast pickups per world, ledge grab, pogo, shooting, hazards, enemies, checkpoints/respawn, map, codex unlock persistence, mute, and game restart.
2. **Completed (static extraction):** Audio now lives in `keen/audio.js` behind the existing `AudioKit.start/effect/toggle` API. Browser regression testing is still required to confirm first-user-gesture initialization and mute semantics.
3. Extract camera/parallax orchestration, then HUD/menus/rendering, then player physics and state. Small changes with a playable preview after each commit.
4. **Completed:** retire classic mode, its selector, generation, camera, completion path and exclusive scenery. Historical previews and their exclusive dependencies were subsequently retired.
5. Update level-design plans against the vertical data models, then improve gameplay in separate feature branches.

## Historical technical-debt notes (October 18; superseded)

- Superseded: the former global composition has been replaced by three approved world-specific themes in `audio-engine.js`. Do not use this historical note to plan audio replacement.
- The three vertical layouts share an intentionally similar ascent–crest–descent structure. A future design pass should diversify them, **not** silently do so during refactoring.
- The Web Audio engine has now been extracted to `keen/audio.js`, retaining its existing API. Image registration now lives in `assets.js`; older fallback art scripts still contain data URIs.

## Regression gate

For each refactoring pull request: compare against `main`, load the game from an isolated branch preview, confirm no missing assets or console errors, exercise all three vertical stages, and verify recipe/codex persistence. No gameplay balance or visual design changes in maintenance-only PRs.

## Branch preview and camera checks

Branch preview: https://raw.githack.com/joelgtaylor/cooking-diary/refactor/keen-maintenance/keen/index.html

This third-party proxy serves the branch independently of production. It may show an initial “Open the page” interstitial and cache files; use a commit-specific URL for reproducible reviews. Its origin has separate recipe/best-score storage from production.

Camera follow lives in `camera.js`; it deliberately retains shared game-state bindings until state ownership is refactored. Run `node --test keen/tests/*.test.cjs` from the repository root. The headless harness checks initialization and render execution for all three worlds, checkpoint activation/recovery, actual collectible pickup logic, completion, and persisted recipe unlocks. Canvas and audio are stubbed: these checks do not replace browser/visual/audio playtesting. Browser rendering was confirmed for production and the branch baseline; full control, audio and progression regression remains pending after the cloud-browser transport disconnected.

Classic retirement does not change authored vertical layouts, physics constants, musical compositions, artwork, controls, or recipe storage keys.

## World lifecycle

`world.js` owns initialization/restart, authored-layout selection, checkpoint support and recovery, completion, recipe/best-score writes, and advancement to the next bakery or final win. Keyboard Enter and canvas tap share `advanceBakery()`; only the clear state permits advancement. The render/update loop calls `updateWorldProgress()`, and rendering reads `checkpointState` for flags/map markers. These replace the historical `tickPhase3` and `phase3State` names in production.

This is a classic-script extraction, like `camera.js`: functions use the existing shared lexical game state, and are invoked only after setup. Storage loading and codex presentation remain in `index.html`; storage keys and save-failure behavior are unchanged. The authored layouts, collision routines, input mappings and audio engine are unchanged.

## Input

`input.js` binds keyboard, canvas, touch/pen/mouse controls and UI buttons once via `bindInput()` after UI setup. M controls mute; Q controls the map (the old capture listener intercepted M before mute). Non-movement shortcuts ignore key repeats. Letter controls accept either case, while arrow-key names remain compatible with the physics loop.

Held on-screen controls use Pointer Events with pointer capture and per-button pointer IDs, replacing overlapping pointer/touch/mouse listeners. Release, cancellation, capture loss, window blur and page hiding clear held input. The existing jump click buffer and physics-driven C pogo toggle remain intact. Tests cover these paths with DOM/audio stubs; real touch devices still need playtesting.

## Rendering

- `render.js`: `draw()` orchestrates world rendering followed by the screen-space HUD. `drawWorld()` draws parallax/backgrounds, terrain, pickups, enemies, particles, the baker, oven and checkpoint flags. It preserves the original camera transform, save/restore ordering and layer order.
- `characters.js`: `drawPlayer()` retains baker animation state selection, frame timing, mirroring and sprite fallback paths. It runs inside the world transform. Enemy artwork stays with world drawing for now.
- `hud.js`: HUD and pause/clear/win overlays, recipe codex, world map, camera diagnostic grid/readout and camera/parallax button presentation. Input and gameplay logic remain separate.

The renderer still reads shared state; this extraction does not introduce an ES-module migration or a new render model. `tests/render-baseline.json` contains SHA-256 hashes of canvas-command traces captured from commit `0d4c399` before extraction: 39 cases covering all three bakeries, loaded/fallback artwork, baker animation states, menus, map and diagnostic overlays. `rendering.test.cjs` verifies exact command ordering/arguments against that baseline. These are command-level checks with stubbed canvas/images, not pixel comparisons or a substitute for visual playtesting. Existing gameplay/input tests use the shared `tests/game-harness.cjs`.

## Physics and combat

- `collision.js`: tile queries, solid/spike tests, one-way platform crossings and rectangle overlap.
- `physics.js`: `updatePlayer()` owns movement, acceleration, gravity, buffered/coyote jumps, ground support, ledge grabs/climbs and pogo. `togglePogo()` is also here; input only requests it. A ledge-handling frame returns without updating timers, combat, effects or pickups, preserving the original early returns.
- `combat.js`: `damage()`, hazard checks, projectile updates, enemy movement and pogo stomps. Original constants and enemy behavior are retained, including existing height-dependent rules.
- `gameplay.js`: `update()` preserves frame order: player movement, timers, hazards/projectiles, enemies, particles/floaters and pickups. Shared particle/floater creation helpers live here too. World completion, camera and drawing still follow in the outer loop.

The modules continue using shared classic-script state; this pass changes ownership/location, not gameplay rules. `tests/physics-baseline.json` was captured from `c871345` before extraction: 18 deterministic simulations, 240 frames each, across all three bakeries. The comparison includes player/enemy/projectile state, effects, pickups, timers, checkpoint/progression state, camera and audio-effect events. Additional checks cover one-way crossings, ledge early returns/climb timing, shields, invulnerability and ammunition. Run all checks with `node --test keen/tests/*.test.cjs`.

## Asset cleanup

`assets.js` registers the same production images in the same order. The fallback PNG files are byte-identical to the former HTML data URIs: three retro-stage backgrounds, the phase-4 baker atlas, tiles, original background and items. The never-read `bakerPhase2` and `baker` registrations were removed. Modern primary artwork and compositions are unchanged.

`tests/fallback-assets.json` records SHA-256 values captured from the embedded bytes before extraction. `assets.test.cjs` verifies those bytes, script paths, registered image paths and the absence of image data in HTML. The render harness normalizes only the newly extracted fallback image paths to their former data-URI identities, so the existing render baseline remains unchanged. External fallback files load asynchronously like the existing file-backed art; the renderer's primitive fallbacks remain available while they load.
