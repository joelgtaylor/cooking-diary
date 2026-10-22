# Moonlit enemy scale audition

Branch: polish/moonlit-enemy-scale, building on the Vance firing-alignment preview.

Approved scaling now runs by default in production. Use `?enemyScale=off` for the original-size diagnostic comparison; `?enemyScale=pilot` remains supported by isolated test fixtures.

- Six walkers, three hoppers and two slingers: artwork 1.6×, bodies 40 × 54 rather than 25 × 25. Bodies now follow the taller visible silhouettes and intersect both heroes' horizontal firing lines.
- Feet retain their authored support height. Wider patrol bodies stay inside the original support envelopes; maximum left-edge bounds shrink to account for width.
- Hopper anticipation retains its ten-tick timing and grounded anchor. Compression reduces height by at most 15% in this audition, keeping the enlarged cap visible at the firing line.
- Speeds, hop launch velocity/countdowns, one-hit defeats, rewards and pogo bounce velocity are unchanged. Larger contact bodies intentionally affect collision clearance and patrol turning points.
- Slingers release dough from the enlarged throwing hand, with terrain checks between body and hand. Their perception distances use the original footprint so resizing does not expand activation range. Wind-up/recovery, projectile speed, damage and rewards are unchanged; projectile elevation now matches the hand. Warning markers sit above the larger head.
- Bosses, Fungal Caverns and Clockwork Ovens remain unchanged.
- Loading/error fallbacks reflect the larger bodies.

Validation: 401 regression tests pass. New checks cover authored spawn clearance, support envelopes, unchanged vertical motion/hop cadence for 240 ticks, both characters shooting both target types from either side while stationary/running, pogo kills/contact damage, and grounded squash alignment. This does not replace a full encounter playthrough or physical phone testing.
