# Oven readiness pilot

Use `goals=pilot` to enable plaques; omit it or use `goals=off` for the original presentation.

Review scenes: `scene=oven-missing-1`, `oven-locked-1`, `oven-ready-1` (replace final digit with 2 or 3).

Each scene initializes a temporary game state without unlocking recipes or writing saves. Reload to reset. Restart mission restores normal level initialization.

Five jar slots show collected cultures through filled versus outline silhouettes. The seal is a closed padlock until all existing completion predicates pass, then a radiant loaf. Wood, rooted stone and riveted metal frames retain the same arrangement. The existing oven fire and loaf animations remain intact. Clockwork only displays the plaque on the landed real oven; its original REAL OVEN label remains the loading/error fallback.

No changes to collision, pickups, flags, boss mechanics, progression checks or audio compositions. Preview scenes invoke the existing release effects when staging the real Clockwork oven.

Validation: all 253 game and audio tests pass, including five new tests covering preview safety, exact jar counts, readiness gates, loading fallback and render purity.
