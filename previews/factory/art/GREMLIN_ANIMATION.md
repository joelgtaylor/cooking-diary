# Crust Quest — Animated Dough Gremlins

> Historical art-integration notes. Standalone comparison pages were retired during maintenance; use [the current game](../index.html) and [MAINTENANCE.md](../MAINTENANCE.md) for current behavior. Earlier verification notes below describe their original integration.
This update reuses the two AI-generated dough-monster sprite sheets as a compact, transparent, pixel-art gameplay animation atlas. The source images are still available in the project conversation; the files here are **game-ready 128×128 PNG atlases** with 16 frames each (4 columns × 4 rows of 32×32 sprites), extracted from the generated illustrations.

Assets:
- `dough-gremlins-primary.png`: expressive angry-dough walking enemy
- `dough-gremlins-expressions.png`: alternate expressive/hopping enemy
- Original `assets.items` sprite remains as runtime fallback.

Atlas rows:
- Row 0: idle / expression
- Row 1: walk / run (4 frames)
- Row 2: hop / airborne (4 frames)
- Row 3: special/stunned poses (reserved for future interactions)

Rendering:
- Use 32×32 unfiltered pixel frames, feet anchored to existing enemy collision rectangle bottom.
- Flip artwork to face the movement direction.
- Hoppers use the alternate sheet; other types use the primary sheet.
- Animation clocks run from existing game tick, so pausing stops the cycle.
- The original eyes/blink overlay is only drawn when the new asset is unavailable, avoiding doubled facial features.
- All enemy AI, spawn logic, collision boxes, damage, physics, levels, collectibles and music are unchanged.

The standalone G/B comparison page has been retired. Production enemy rendering is in `../render.js`; the source atlases and fallback art remain available.
