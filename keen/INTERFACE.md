# Game interface

The approved interface is live at `/keen/`. Its presentation and input modules are
`input-model.js`, `shell.js` and `shell.css`. The renderer remains 960×540 and the
levels, physics, camera, artwork, audio and progress rules remain shared.

The start/pause menu provides character selection, sound, fullscreen, map, recipes,
checkpoint recovery and confirmed restarts. Controls support independent keyboard
and pointer sources, direction sliding, brief taps, and simultaneous movement,
jump and fire. Settings retain the POC storage key so approved preferences carry
over. Orientation, fullscreen changes and focus loss clear held inputs and pause.

Phone acceptance: Joel verified smooth multitouch and native-feeling fullscreen
in the isolated POC before promotion. The preview remains available for reference.

Validation: `node --test keen/tests/*.test.cjs previews/audio/audio.test.cjs`.
The simulation regression harness uses `tests/fixtures/legacy-interface.html` to
retain the prior input contract while loading current game modules. Production
shell tests explicitly load `/keen/index.html` with the richer DOM adapter,
including a 150-frame equivalence check against that legacy contract.
