# Crust Quest — Maintenance and Refactoring Guide

**Current baseline:** October 18, 2026, after the merge of the three vertical bakery worlds.
**Working branch:** `refactor/keen-maintenance`. Do not merge to `main` until regression checks pass.

## Shipped entry point

- `keen/index.html` is the production game loaded by `/cooking-diary/keen/`.
- Production exclusively uses the 105-column × 56-row vertical levels (32 px tiles). Classic mode and the historical `__crustCameraDemo` flag have been retired.
- `keen/art/vertical-bakery{1,2,3}-layout.js` own the three active authored vertical layouts. Each defines platform spans, yeast cultures, checkpoints, hazards, enemies, power-ups, sections and the oven destination.
- `keen/art/vertical-parallax.js` renders the three-layer parallax backgrounds.
- `keen/index.html` retains asset loading, recipes, shared game state, physics and startup. Audio, camera follow, world lifecycle, input and rendering are external scripts.
- Classic mode was explicitly retired after the vertical-world playtest. `bakery1-layout.js` and `authored-bakeries-2-3.js` are no longer production dependencies; retained historical preview pages still reference them. Keep those snapshot dependencies until their preview pages are retired together.

## Files directly loaded by production

**Scripts (order matters):**

```
art/phase3-bg.js
art/vertical-bakery1-layout.js
art/vertical-bakery2-layout.js
art/vertical-bakery3-layout.js
art/checkpoint-flags-generated.js
art/vertical-parallax.js
art/baker-reimagined.js
art/environment-gameplay-atlas.js
audio.js
camera.js
world.js
input.js
characters.js
hud.js
render.js
```

**Runtime images:** `bioluminescent-mushroom-city.webp`, `moonlit-bakery-city.webp`, `clockwork-oven.webp`; `bakery{1,2,3}-parallax-{far,mid,near}.webp`; `dough-gremlins-primary.png`, `dough-gremlins-expressions.png`, and `baker-ai-stable.png`, all under `keen/art/`.

The embedded data-URI images and script-generated image atlases also belong to the production path; avoid deleting them based only on filename search.

## Historical preview inventory

There were 27 standalone HTML preview / diagnostic pages at the start of this branch; four superseded sprite/animation previews have since been retired. None is referenced by a direct script/image load in the production `keen/index.html`. That alone does **not** rule out external deep links or historical value.

- **Keep during refactoring:** `phase3-vertical-bakery1-preview.html`, `phase4-vertical-bakery2-preview.html`, `phase5-vertical-bakery3-preview.html`. These are comparison snapshots for regression testing, not sources of truth.
- **Candidates for retirement:** older sprite iteration, animation cadence, ghosting, floor-contact, pixel-scaling, background, and horizontal-layout previews. They should not be merged back over current production code.
- Git history preserves deleted prototypes. Do not move or rename the live `keen/index.html`; keep production URLs stable.

Some `art/` JavaScript files are not directly loaded by `keen/index.html`, including `background-polish.js`, `baker-outline-polish.js`, `baker-rig-clean.js`, and `baker-rig.js`. Keep these until references in surviving preview pages and scripts have been checked.

## Refactoring sequence (behavior-preserving)

1. Establish a production baseline: desktop keyboard + touch input, three bakery transitions, five required yeast pickups per world, ledge grab, pogo, shooting, hazards, enemies, checkpoints/respawn, map, codex unlock persistence, mute, and game restart.
2. **Completed (static extraction):** Audio now lives in `keen/audio.js` behind the existing `AudioKit.start/effect/toggle` API. Browser regression testing is still required to confirm first-user-gesture initialization and mute semantics.
3. Extract camera/parallax orchestration, then HUD/menus/rendering, then player physics and state. Small changes with a playable preview after each commit.
4. **Completed:** retire classic mode, its selector, generation, camera, completion path and exclusive scenery. Historical preview snapshots remain separate.
5. Update level-design plans against the vertical data models, then improve gameplay in separate feature branches.

## Known technical debt

- There is one global 148 BPM, 32-step procedural composition across all three worlds; no stage-specific soundtrack yet.
- The three vertical layouts share an intentionally similar ascent–crest–descent structure. A future design pass should diversify them, **not** silently do so during refactoring.
- The Web Audio engine has now been extracted to `keen/audio.js`, retaining its existing API. The production HTML still carries substantial embedded artwork, making reviews and diffs harder than necessary.

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
