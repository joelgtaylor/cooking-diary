# Character grounding and animation continuity

No atlas artwork, sprite sizes, physics, hitboxes or frame durations changed.

- The stable baker atlas has its idle/run/landing baseline at source y=100.
  An 84 × 96 draw therefore uses y=-86 relative to rounded physical feet,
  rather than y=-96 relative to feet+2 minus an additional sine bob.
  Pogo uses the source y=103 tool baseline. The existing hanging-hand origin
  is preserved. Airborne poses retain their authored shape and sequence.
- Idle/run sprites no longer receive a second procedural vertical bob.
- Gremlin idle/run frames have different transparent bottom margins. Their
  measured alpha bottoms (source pixels, exclusive) are recorded in render.js;
  supported frames align these to physical feet. Airborne poses keep a fixed
  anchor rather than being individually stretched or normalized.
- Gremlin animation no longer depends on x position. Actor-local clocks retain
  the original 18/9/7-tick idle/run/jump frame durations. The baker's existing
  per-state cadences and frame sequences remain unchanged.
- A WeakMap holds rendering-only clock state by actor identity; restart creates
  fresh state, and decreasing ticks resets an existing clock. No animation
  metadata is written into gameplay actors.
- Short pixel contact shadows appear only at supporting # or = surfaces within
  1.5px of physical feet. Each strip is clipped to the supporting tiles, so it
  cannot bridge a gap or hang beyond a platform end. Airborne baker shadows
  are suppressed; unsupported gremlins receive no contact shadow.

The render baselines intentionally changed for anchors and contact shadows.
Loaded-art snapshots now also exercise actual 128px gremlin atlases, which the
older mock dimensions bypassed. Pre-change snapshots remain in git history.
