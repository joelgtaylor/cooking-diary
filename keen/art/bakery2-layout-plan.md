# Bakery 2 layout passes

The Sporekeeper/Mycelium Relay mission has been playtested and approved. Develop the remaining route in small, separately playable sections; keep the relay stable and do not merge until requested.

## 1. Mycelium Foothills and keeper approach — implemented for playtest

Replace the uniform staircase within columns4–31, rows38–53 with a solid entry step, low root passage under a culture balcony, alternating terraces, and a switchback to the keeper shelf. The first culture retains its location and can be collected from the balcony. The sheltered lower route allows ground traversal and ranged counterplay; the upper route bypasses the lower patroller. A bounded hopper guards an upper shelf with a clear landing margin. The keeper refuge remains peaceful.

Replace the old walker at27,45 with a bounded lower walker and upper hopper, using the existing encounter simulation. Preserve the original distant81,30 walker and its direction/timing. No new enemy types, movement constants, music, recipes, hazards, checkpoints or collectible locations. Backing under the balcony is translucent so the detailed cavern remains visible.

Validation:116 tests pass. Five new tests verify local geometry bounds, exact preservation of the approved relay/keeper/later route, all eight jump/traversal segments using existing physics, the full-height player through the passage, culture pickup, encounter support/bounds over900 ticks, checkpoint safety, and shooting/pogo counterplay. All4320 historical movement regression frames remain unchanged. Reviewed only Bakery2 render-command differences, including three dedicated foothills views. Native canvas before/after/approach frames and the self-contained ZIP preview are verified.

## 2. Fungal Canopy — next

Shape a distinct ascent after the relay, with broader landing rests, shorter exposed crossings and a more deliberate culture detour. Introduce a complementary encounter pairing using existing enemies. Reuse cavern terrain and root architecture; preserve the tested relay exit connection and third checkpoint. Provide a focused playtest before extending the pass.

## 3. Luminous Descent — later

Vary the descent with sheltered landings, a clear lower route and a more purposeful final culture approach. Build toward the proofing oven without repeating Bakery1's boss. Review encounter intensity and completion pacing separately; a new finale mechanic would need its own proposal.
