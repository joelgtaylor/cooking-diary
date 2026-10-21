# Foreman movement and head-guard audition

Explicit opt-in: ?foreman=pilot&scene=foreman. The scene initializes the actual Bakery 1 forecourt with normal health/ammo, checkpoint3, no granted cultures and no progress writes. It starts paused: tap Pause / Resume. Use foreman=off with the same scene to compare the original approved encounter. Normal starts and all other bosses remain unchanged. This branch also contains the previously approved all-B1 enemy artwork review.

## Design

The original boss was vulnerable only in recovery but granted a full -11 pogo bounce in every phase, allowing sustained camping above his head. The pilot adds a non-damaging guarded-head deflection with horizontal velocity magnitude7 and upward velocity -8. Open recovery still accepts pogo and shots under the existing 36-tick brief hit guard. The visual brace and closed shield identify protection; separated shield halves identify the recovery opening. No spikes, surprise contact damage, extra health or faster attacks.

He walks at .45px/tick during idle/recovery inside a ±64px envelope around his authored center. He reverses at the boundary and does not step toward a player within100px. Recovery starts with a step away from the attack direction. He parks during wind-up/sweep/toss, preserving direction-locked readable attacks. Body, sweep, projectile origins, labels and defeat drawing all follow the same moving center. Reset/retry restores his home position. His six HP, 60-tick warnings, 18-tick sweep, 24-tick toss, damage rules and projectile behavior remain unchanged. Recovery grows from120 to150 ticks to compensate for the moving target.

Art: art/foreman-walk.png, 2172×724 RGBA. Built-in generation based on the existing foreman-concept.png, preserving face, apron, peel and proportions. Three walk poses plus a dedicated stationary hand-on-crown brace. Runtime crop rectangles select the original image without destructive raster edits. Feet use the original floor anchor and 154×132 draw rectangle. Existing sweep and defeated artwork remain intact. The original standing artwork is the loading/failure fallback. No soundtrack or sound-effect changes.

## Validation and limits

Eight added tests cover bounded walking/parked attacks, damage-free head deflection and valid recovery pogo, preserved warnings and longer openings, existing shooting strategy with no worse health/ammo, a viable zero-ammo steered-pogo strategy, paused render purity/reset behavior, scoped safe preview initialization, and atlas/physical guard state checks. Full game/audio suite: 296 tests.

The deterministic shooting comparison and steered-pogo checks both beat the pilot; these are balance guardrails, not a substitute for human difficulty review. The objective is a more mobile and expressive fight with a response to head camping, not greater difficulty. Human desktop/mobile playtest remains the approval gate. Main remains unchanged. Before a production merge, version the modified foreman/architecture scripts with the release's other dependencies to avoid cached mixed builds.
