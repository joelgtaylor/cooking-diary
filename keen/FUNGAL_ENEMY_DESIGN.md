# Fungal Caverns enemy proposal

Status: concept review after the approved Bakery 1 release, main ab1c5cec. No runtime changes. The current authored layout and combat code remain authoritative.

## Source audit

Bakery 2 has eight enemies: two bounded walkers, four bounded hoppers, two stationary throwers. All moving bodies are 25×25, speed magnitude 1.1; all die to one shot or a descending mixer pogo. Ordinary contact costs one health through the existing shield/invulnerability rules. No enemy armor or protected crown is proposed.

| Section | Existing encounters (spawn column/support row) | Design role |
|---|---|---|
| Mycelium Foothills | walker 18.5/54 | Teach low, broad fungal silhouette alone |
| Sporelit Stairways | hopper 26/45 | Teach compressed stem before a jump; keep keeper and relay peaceful |
| The Deep Plunge | hoppers 67/22, 77.5/22, 70/31; throwers 72/19, 76/30 | Inspect warnings during vertical camera entry and optional canopy/main descent transitions |
| Cavern Floor | walker 81/26 | Familiar patrol before Bloomrot; leave boss arena unchanged |

Bounded hoppers retain launch -7.5, gravity .5, fall cap 10 and reset interval 50–90 ticks. Use the last ten supported countdown ticks for visible stem compression; preserve actual launch timing. Existing reversals happen at bounds/solid obstructions, including in flight.

Throwers retain 36-tick wind-up, direction lock, 150-tick post-shot delay and 90-tick reacquisition minimum. Preserve 256px horizontal/55px vertical eligibility, full-body camera margins and terrain occlusion. Existing shots are 9×9 bodies moving horizontally at 2.3px/tick, life 150, removed on solid impact or owner death. A fungal pearl can reskin this shot; a lingering cloud would change mechanics and is deferred.

## Proposed visual family

| Role | Silhouette and motion | Counterplay communication |
|---|---|---|
| Cap Walker | Low broad smooth cap, root boots, worn worker apron; steady alternating steps | Clearly alive against mushroom scenery; simple predictable patrol; smooth stompable cap |
| Springcap | Tall narrow cap and flexible accordion stem; compress, stretch, tuck, land | Compression predicts the existing launch; feet stay aligned to support and body remains readable |
| Spore Caster | Round puffball, root feet and directional mouth; swell/aim, one pearl release, deflate | Full existing warning is visible in body pose, with existing warning symbol retained; readable quiet interval after firing |

Use dark outlines, cream edge contrast, cyan gills and violet caps. Meaning depends on profile and pose, never hue alone. Keep glow restrained so enemies stand apart from the bright cavern mushrooms. No spikes, armor or effects suggesting pogo immunity, extra health or a new damage zone.

## Pilot sequence

1. Approve the three-role concept sheet.
2. Build opening walker/hopper art pilot at the existing 18.5/54 and 26/45 encounters, with paused desktop/mobile shortcuts and original-art comparison. Keep geometry, bounds, damage and timers unchanged.
3. Review spore caster at an existing canopy placement, retaining sightline and camera gating. Drive release pose from actual projectile creation, not a speculative animation timer.
4. Roll approved artwork across the eight actors only after playable approval. Verify grayscale readability, native-scale silhouette/body alignment, fallback art, rendering purity, repeated init, B1/B3 exclusion and deterministic simulation equivalence. Run node --test keen/tests/*.test.cjs plus the audio regression suite.

Bloomrot, all bosses, approved flags, level geometry, puzzle/route indicators, soundtrack/effects and recipe storage are outside this change. No broader enemy AI or area-control mechanic is included in the first pilot.
