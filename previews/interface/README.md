# Crust Quest interface POC

Isolated playtest at `/previews/interface/`; production `/keen/` is unchanged.
Uses the current 960×540 renderer, levels, artwork, audio and save rules.
Only this preview replaces input bindings and adds a game shell.

- Start screen and intentional Play/audio activation.
- Viewport-fitting presentation, landscape overlay controls and portrait fallback.
- Optional fullscreen, reliable failure fallback, explicit pause on transitions.
- Stable touch zones: directional slide transfer, independent fingers, quick-tap
  jump/fire buffering, fixed mixer/kefir/context slots, control size/opacity settings.
- Selection/context-menu/drag protection on the game region, with normal menu
  controls and scrollable map/recipes/settings. No global zoom-disabling meta tag.
- Pause menu owns character, map, recipes, sound, checkpoint/restart confirmations.
- App/window loss, orientation change and fullscreen transitions release input
  and pause. Returning never resumes automatically. Safe recovery clears input.
- Keyboard shortcuts: A/D or arrows, Space/W/up, X/K, C, V, E, P/Escape, F, Q, T.
- P resumes a paused session; Escape opens pause or returns a subpage to pause.
- Settings stored under `crustQuestShellSettings`, independent of game progress.

`devices.html` provides 844×390, 390×844 and 1100×700 frame checks. `?touch=1`
forces controls for review, `?touch=0` hides them. These are layout fixtures,
not real phone emulation. Phone long-press, edge gestures, real multi-finger
comfort and platform fullscreen support require device playtesting.

Validation: `node --test keen/tests/*.test.cjs previews/audio/audio.test.cjs previews/interface/shell.test.cjs`.
378 passing tests, including source ownership, simultaneous touch, sliding/cancel,
short taps, keyboard/touch coexistence, focus loss, menus/confirmation, rotation,
fullscreen failure and 150 frames of identical gameplay against shipped controls.
