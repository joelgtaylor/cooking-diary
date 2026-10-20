# Simulation and rendering cadence

The game previously advanced once per requestAnimationFrame callback. At 30fps
that halved movement, gravity, animation clocks and other tick-based behavior.
The loop now uses a 60Hz fixed-step accumulator. Rendering at 30fps advances two
original simulation steps per frame; at 120fps some frames render without a
new step. No movement constants, physics equations or per-tick behavior change.
World progression and the camera advance with each simulation step; drawing,
HUD, diagnostic UI and minimap run once per rendered frame.

Catch-up is limited to eight steps after a stall. Hidden-tab time is discarded
and visibility changes reset the clock, avoiding a long simulation jump when
returning. Startup seeds the clock after the existing initial draw.

Tests compare actual movement, jumping, camera and sound events at 30/60/120fps,
plus clock reset/catch-up behavior and the unchanged 4,320-frame physics baseline.
The repaired baker also loads as a static PNG rather than a software canvas;
see baker-transparency.md. Actual render-rate improvement requires device testing.
