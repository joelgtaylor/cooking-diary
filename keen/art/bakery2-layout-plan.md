# Bakery 2 — descending cavern with optional canopy

The approved opening and Sporekeeper relay remain intact. The route now pivots downward after the relay instead of repeating Bakery1's mandatory ascent. All five required cultures stay on the main route; the upper middle is an optional enemy gauntlet.

## Playtest: relay fork and first plunge

Every map tile west of column56, the keeper/relay metadata, and the first two checkpoints/cultures are unchanged. A permanent labelled fork points down for the main descent and up for BONUS / DANGER. The main route drops from row31 toward row54 (23 tiles /736 pixels), with offset landing shelves and a left-side recovery ladder. The geometry uses the existing jump, ledge and pogo physics; no new fall damage or camera mode.

Cultures3 and4 move from the old mandatory canopy to63,38 and72,42. Culture5 remains98,46, above the new lower oven approach. Later checkpoints move to77,46 and90,51, both supported by safe main-route platforms. Remove the two ground spikes below the former descent and retain a visible floor hazard farther along the lower approach. Missed culture3 remains reachable from the floor via recovery ledges.

## Optional upper loop

The canopy climb contains three bounded hoppers, one bounded patroller and two existing wind-up throwers. Two supply caches each grant500 score and15 ammo once per level attempt, without changing culture progression. A banneton shield supports the optional route; the health pickup moves onto the lower main approach. The loop descends back to the first main landing, before culture3, so bonus exploration does not strand required collectibles behind the rejoin. Bonus throwers do not target the lower descent.

Caches use a small native pixel-art crate with a distinct brass latch. All other enemy art, behaviors, rewards and movement constants are unchanged. The approved cavern backgrounds and parallax remain intact.

## Verification

123 tests pass. Seven new tests verify exact preservation west of the fork, required culture/checkpoint placement, eight main-route movement segments, four recovery jumps, nine bonus ascent/return segments, the mixed encounter roster, once-only cache rewards and safe checkpoints. Existing mission and foothills tests continue covering the approved local systems. All4320 historical movement regression frames remain unchanged. Only Bakery2 render traces change, including fork/lower/bonus views. Native canvas frames and the standalone ZIP shortcuts/full-level start are verified.

## Next review

Playtest the fork, sense of depth, landing visibility and bonus difficulty first. The lower route is a playable connection to the oven; more cavern-floor architecture and encounter pacing can follow after the descent direction is approved. Do not merge without explicit approval.
