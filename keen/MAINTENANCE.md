# Crust Quest — Maintenance and Refactoring Guide

**Current baseline:** October 18, 2026, after the merge of the three vertical bakery worlds.
**Working branch:** `refactor/keen-maintenance`. Do not merge to `main` until regression checks pass.

## Shipped entry point

- `keen/index.html` is the production game loaded by `/cooking-diary/keen/`.
- Production defaults to `window.__crustCameraDemo = true`, which currently selects the 105-column × 56-row vertical levels (32 px tiles). The variable name is historical; this is **not** merely a demo.
- `keen/art/vertical-bakery{1,2,3}-layout.js` own the three active authored vertical layouts. Each defines platform spans, yeast cultures, checkpoints, hazards, enemies, power-ups, sections and the oven destination.
- `keen/art/vertical-parallax.js` renders the three-layer parallax backgrounds.
- `keen/index.html` still embeds renderer, physics, camera, state, input, codex and the Web Audio engine together.
- Horizontal/classic comparison mode is still selectable in the UI. Do **not** remove `bakery1-layout.js`, `authored-bakeries-2-3.js`, or horizontal-mode logic before explicitly retiring that mode.

## Files directly loaded by production

**Scripts (order matters):**

```
art/phase3-bg.js
art/bakery1-layout.js
art/vertical-bakery1-layout.js
art/vertical-bakery2-layout.js
art/vertical-bakery3-layout.js
art/checkpoint-flags-generated.js
art/vertical-parallax.js
art/authored-bakeries-2-3.js
art/baker-reimagined.js
art/environment-gameplay-atlas.js
```

**Runtime images:** `bioluminescent-mushroom-city.webp`, `moonlit-bakery-city.webp`, `clockwork-oven.webp`; `bakery{1,2,3}-parallax-{far,mid,near}.webp`; `dough-gremlins-primary.png`, `dough-gremlins-expressions.png`, and `baker-ai-stable.png`, all under `keen/art/`.

The embedded data-URI images and script-generated image atlases also belong to the production path; avoid deleting them based only on filename search.

## Historical preview inventory

There were 27 standalone HTML preview / diagnostic pages at the start of this branch. None is referenced by a direct script/image load in the production `keen/index.html`. That alone does **not** rule out external deep links or historical value.

- **Keep during refactoring:** `phase3-vertical-bakery1-preview.html`, `phase4-vertical-bakery2-preview.html`, `phase5-vertical-bakery3-preview.html`. These are comparison snapshots for regression testing, not sources of truth.
- **Candidates for retirement:** older sprite iteration, animation cadence, ghosting, floor-contact, pixel-scaling, background, and horizontal-layout previews. They should not be merged back over current production code.
- Git history preserves deleted prototypes. Do not move or rename the live `keen/index.html`; keep production URLs stable.

Some `art/` JavaScript files are not directly loaded by `keen/index.html`, including `background-polish.js`, `baker-outline-polish.js`, `baker-rig-clean.js`, and `baker-rig.js`. Keep these until references in surviving preview pages and scripts have been checked.

## Refactoring sequence (behavior-preserving)

1. Establish a production baseline: desktop keyboard + touch input, three bakery transitions, five required yeast pickups per world, ledge grab, pogo, shooting, hazards, enemies, checkpoints/respawn, map, codex unlock persistence, mute, and game restart.
2. Separate audio from `index.html` behind the existing `AudioKit.start/effect/toggle` API; preserve first-user-gesture audio initialization and music mute semantics.
3. Extract camera/parallax orchestration, then HUD/menus/rendering, then player physics and state. Small changes with a playable preview after each commit.
4. Retire horizontal/classic comparison mode only as an explicit decision and after replacements for any still-used logic are confirmed.
5. Update level-design plans against the vertical data models, then improve gameplay in separate feature branches.

## Known technical debt

- The term `CameraDemo` names the shipping vertical mode and misleads maintainers.
- Classic/horizontal map generation and authored vertical maps coexist in one entry point.
- There is one global 148 BPM, 32-step procedural composition across all three worlds; no stage-specific soundtrack yet.
- The three vertical layouts share an intentionally similar ascent–crest–descent structure. A future design pass should diversify them, **not** silently do so during refactoring.
- The production HTML carries substantial embedded artwork, making reviews and diffs harder than necessary.

## Regression gate

For each refactoring pull request: compare against `main`, load the game from an isolated branch preview, confirm no missing assets or console errors, exercise all three vertical stages and classic mode (while supported), and verify recipe/codex persistence. No gameplay balance or visual design changes in maintenance-only PRs.
