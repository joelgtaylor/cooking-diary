# Pre-expansion polish audit — October 22, 2026

Baseline: `abfd9b9` (main, including Joel and Vance's end credits).
Branch: `polish/keen-pre-expansion`. Documentation only; no gameplay changes.

## Assessment and coverage

The strongest next step is a small integration/reliability pass, followed by a focused visual and device playtest. No normal-play P0 was observed. This is an initial audit and prioritized plan, **not release certification or six complete playthroughs**.

- Ran the requested complete regression command: **385 passed, zero failed**. Tests cover progression, bosses, geometry, character selection, Vance's doorway, rendering, independent input ownership, interruption handling and approved soundtrack preservation.
- Browser: actively exercised both heroes in Moonlit Bakery, movement/jump/shoot, pause, character switching and persistence across navigations. Inspected Fungal Caverns grotto and Clockwork oven-hall scenes; observed both selected character states across scenes. Recovered Clockwork gameplay through Return to checkpoint and exercised movement/jump.
- Browser preview scenes expose an integration defect that prevents direct scene playtesting. This limits meaningful encounter coverage in worlds 2 and 3; do not represent these scene inspections as complete playthroughs.
- Inspected current shell, character selection, world lifecycle, relay, HUD/map, audio, rendering performance tests and environment preview source.
- Touch overlay was inspected at the cloud desktop viewport; actual phone size, physical multitouch, rotation and OS interruption remain unverified. Automated input tests pass but cannot substitute for device testing.
- Fullscreen request returned the supported “unavailable” notice and preserved pause. Native fullscreen could not be verified in this browser.
- Audio scheduler, effects bounds, pause, visibility and composition identity pass automated tests. No subjective listening or real-device audio certification is claimed.
- Cloud monitor samples included cavern preview 20 FPS / 41.9 ms CPU and Clockwork play 28 FPS / 27.3 ms CPU. These are uncontrolled remote-browser samples, affected by capture/automation and preview state; they are **not evidence of a phone regression** or grounds for an optimization commit.
- Inspected console entries were extension metadata errors, not attributable to game code. No game exception was observed during ordinary browser actions.

## Prioritized findings

### F1 — P1, conditional: save data is parsed without schema validation

**Location:** `index.html` bootstrap; `world.js` completion; `shell.js` recipes.

**Evidence:** Source inspection and existing VM harness with saved `crustQuestCodex` values `null` and `{}`. JSON parsing succeeds; `unlocked.includes(0)` throws respectively “Cannot read properties of null” and “unlocked.includes is not a function”. A JSON string also passes parsing although it is not the intended array.

**Reproduce:** In a disposable harness/profile, load a valid JSON non-array as recipe-save data, then open recipes. Completion also calls `unlocked.includes(ri)`; this path is source-confirmed, not a reproduced boss-to-completion browser run. Separately, the best-score read is outside a try/catch; denied localStorage access can abort bootstrap before startup error reporting (source finding).

**Expected/actual:** Unusable saves should fall back safely while retaining valid recipe IDs; instead invalid shapes reach array operations and storage access can abort initialization.

**Impact:** Conditional crash in recipe viewing or progression; no evidence that normal gameplay writes this malformed data. This is resilience work, not a claim of ongoing save corruption.

**Fix:** Guard storage reads; validate array type and integer recipe IDs in range; normalize finite best score. Preserve existing keys and valid saves. Add corrupt/denied-storage regression cases.

**Risk:** Low–medium (save compatibility). **Approval:** Include in proposed first implementation batch; no save migration or reset without need.

### F2 — P2: scene previews restore a legacy pause state

**Location:** environment preview helpers, `initGameShell()`, `shellResume()`.

**Observed reproduction:** Open `/keen/?scene=environment-grotto&touch=1` or `/keen/?scene=environment-ovenhall&perf=1`; press Play. The shell disappears but the canvas displays PAUSED. P opens the new menu; Resume restores the same legacy pause. Return to checkpoint recovers active Clockwork play but loses the inspection position.

**Expected/actual:** Play should start the scene at its authored inspection position; instead `prepare*EnvironmentPreview()` sets `state='pause'`, `initGameShell()` captures it via `shellPause()`, and Resume restores it unchanged.

**Impact:** Blocks focused playtesting and produces misleading “Press P to resume” guidance. Not a normal entry-point progression blocker.

**Fix:** Normalize the legacy preview pause at the shell boundary while preserving scene position, camera and intended initial menu. Test each supported scene with the production shell.

**Risk:** Low. **Approval:** Proposed first batch.

### F3 — P2: dialogue Escape instruction disagrees with input

**Location:** Sporekeeper dialogue, `mycelium.js` and `shell.js` keydown handler.

**Reproduce:** Talk to Sporekeeper, read “E / Enter / Esc or Continue to return”, press Escape. The shell handles Escape before its dialogue branch, opening pause. Resume returns to dialogue. This transition was reproduced through the production-shell test fixture (`state` remains `dialogue` after Escape → Resume).

**Expected/actual:** The advertised Escape action should close dialogue, or its text should explicitly describe pausing.

**Impact:** A needless menu round trip and inconsistent keyboard feedback; E/Enter still works.

**Fix:** Let Escape dismiss dialogue before global pause handling, or change the instruction. Prefer consistent dismissal if approved.

**Risk:** Low. **Approval:** Proposed first batch.

### F4 — P2, editorial: Sporekeeper's solved response assumes puzzle completion

**Location:** `drawMyceliumUI()` solved dialogue.

**Reproduce:** As Vance, shoot the root door, then talk to Sporekeeper. Both routes intentionally set `s.solved`; dialogue selects the same response, “The old mycelium still remembers.” Source-confirmed selection; not browser-played through the relay in this audit.

**Expected/actual:** Feedback should acknowledge a valid direct approach; the solved text currently describes the puzzle interpretation regardless of solution. Calling the character “baker” can fit the world, so that alone is not a defect.

**Impact:** Small personality/continuity mismatch. This is an editorial preference, not broken progression.

**Fix:** Use neutral solved wording, or a small recorded solution tag for distinct responses. Prefer neutral wording to avoid adding state solely for one line. Preserve the common progression state and Vance's shortcut.

**Risk:** Low for wording; medium for new state. **Approval:** Required for editorial choice.

### F5 — P3: current controls omit the mute shortcut

**Location:** visible Controls & display help in `index.html`; shell key handling.

**Reproduce:** Expand current controls help. It lists other shortcuts but omits M. The older hidden guide lists M, and M toggles sound in play. In the pause menu, M returns before the mute branch; the visible Sound button works.

**Expected/actual:** Help should match supported shortcuts and their scope.

**Impact:** Discoverability only.

**Fix:** Add M to current help, optionally support M in menus when focus is not in an input. No change to approved compositions.

**Risk:** Low. **Approval:** Optional polish batch.

### F6 — P3: maintenance documentation describes obsolete production architecture

**Location:** `MAINTENANCE.md`.

**Reproduce:** Read current baseline, script inventory and technical debt. It still says October 18, single global composition and stage-specific soundtrack pending, despite current three-theme audio and new shell/characters.

**Expected/actual:** Maintenance guidance should reflect shipped modules and current regression command.

**Impact:** Future development can target retired assumptions. No direct player defect.

**Fix:** Refresh source inventory, audio ownership, character/shell boundaries and preview guidance; clearly mark historical notes.

**Risk:** Low. **Approval:** Documentation cleanup within polish scope.

## Recommended implementation sequence for Joel's review

1. **Integration batch:** F1–F3, isolated commits with meaningful regressions. Preserve all physics, geometry, timings, compositions and character-specific progression.
2. **Complete encounter audit:** With scene playback repaired, inspect all authored districts and each boss approach as both heroes; play both relay solutions and finishing-oven/credits paths. Capture specific visual defects rather than preselecting art replacements.
3. **Presentation batch:** Agree on F4 wording; F5 and F6 are small follow-ups. Do not replace character art or repaint worlds on the evidence collected so far.
4. **Device gate:** Physical Android landscape/fullscreen and multitouch, pause/restart/selection, interruption and return, small-screen dialogue/relay/map readability; desktop keyboard and fullscreen. Explicitly check non-color hazard and state cues.
5. **Performance decision:** Measure repeatable live scenes after warm-up on target hardware. Compare environment layers on/off through existing diagnostics, profile actual hotspots, then optimize only demonstrated costs. Re-run identical scenes and the full regression suite.

No boss balancing, level redesign, soundtrack rewrite or expansion is recommended by this audit. Merge remains subject to Joel's explicit approval.

## Future expansion note

Current needs justify a reliable shared scene-preview entry point and production-shell transition tests. Later, consider consolidating district inspection metadata and adding route/collision validation across every world and character solution. Defer world registration and asset-manifest refactors until a concrete new world requires them. Do not invent future world designs.


## Implementation follow-up — October 22, 2026

F1–F6 addressed on the polish branch: guarded/schema-validated save reads; legacy preview pause normalization; dialogue Escape dismissal; solution-neutral Sporekeeper response; documented mute shortcut available in play and pause; refreshed maintenance guidance. No new solution state, geometry, physics, boss balance or soundtrack changes. Production-shell regressions exercise corrupt/denied storage, all 14 environment scenes, dialogue dismissal and mute behavior. Physical-device and full encounter coverage limits above still apply.
