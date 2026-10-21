# Clockwork entrance signs

Approved concept: metal plaques with a literal up arrow and either the existing supply crate silhouette or rising steps. The two plaques replace only SUPPLIES and LIFT SHAFT labels. MAINTENANCE / KEFIR RESERVE and STORE NOW · V / KEFIR TO DASH remain readable.

Review `keen/index.html?pickups=pilot&supplies=pilot&signs=pilot&scene=entrance`. Use `signs=off` for the same starting state and original signs. The shortcut requires both an exact scene and explicit signs mode. It initializes Bakery 3 at the existing safe ground approach, retaining every authored pickup, enemy, collision tile, checkpoint and boss. Reload to retry; mission restart follows normal world initialization.

The supply plate sits above the real optional cache at column 17. The ascent plate sits between the fixed exit platforms at column 23. Neither plate intersects collision tiles. Plates are drawn in the architectural pass behind gameplay actors. Original labels remain while art is loading, failed or disabled.

Asset: art/clockwork-entrance-plates.png, 1536×1024 RGBA. Built-in image generation extracted the two approved plaques from the concept board: up arrow with open wooden cartridge crate; up arrow with three rising steps; matching copper/iron frames; no text. Runtime crops [18,298,740,392] and [780,298,740,392], rendered at 112×56 without destructive image processing.

Validation includes exact label scope, loading/failure fallback, opt-in parsing, safe preview spawn, unchanged authored state/saves, render purity and collision clearance. All 258 game and audio tests pass. Existing keyboard and touch control tests are included; mobile hardware playtest remains a user review step.
