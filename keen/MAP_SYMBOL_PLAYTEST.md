# World map symbol playtest

Opt in with `map=pilot` on the design branch. Open World map (Q) using the existing toolbar or shortcut. Combine with the existing `pickups=pilot`, `signs=pilot` and scene shortcuts as desired. No query keeps the reviewed original map rendering.

The new canvas map uses matching silhouettes in legend and world: chef head for the baker, cloth-lidded jar for remaining cultures, outlined/unfilled pennants for unvisited checkpoints, filled pennants for reached checkpoints, a double base for the current checkpoint, a warning triangle for hazards and an arch for the oven. The terrain uses solid neutral masonry and thin ledge strokes; spikes no longer share the platform colour-block treatment. Labels name meanings, not colours.

Symbols are drawn from code-native canvas shapes to match the existing map implementation. No gameplay sprites, animated flags, level geometry, physics, pickups, enemies, bosses or audio change. Oven coordinates use the existing released-oven target after the Devourer fight. Collected cultures disappear as before.

Nearby symbols are separated by a small presentation-only offset with leader lines back to their original map positions. This prevents the Fungal checkpoint near its second culture from hiding the culture symbol. Marker positions stay within the map area. The map uses a minimum displayed width of 840px and a horizontal scroll wrapper so mobile users can inspect symbols instead of shrinking the whole map into an unreadable strip.

Six regression tests cover opt-in/default behavior, all-world legend presentation, authored objective/pickup state, crowded marker separation, distinct geometry without colour styles, current/reached/unvisited checkpoint state and unchanged gameplay/audio/storage. Existing default render baselines are not rewritten. Desktop browser verification and mobile user review are required before acceptance. Do not merge without Joel's approval.
