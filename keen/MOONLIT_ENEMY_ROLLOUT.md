# Bakery 1 enemy artwork rollout

All eleven existing Moonlit enemies now use approved role artwork by default on the review branch: six flour patrollers, three proofing hoppers and two dough slingers. This extends the reviewed pilots without adding enemies or moving encounters. Bakery 2 and 3 keep their existing artwork and behavior.

Normal review: keen/index.html (no query needed). Before comparison: ?enemies=off&slinger=off. Each family still supports its explicit pilot/off setting. Hopper anticipation can be separately compared with anticipation=off.

Fast summit review: ?enemies=pilot&scene=moonlit-summit. This initializes Bakery 1 at the existing row19 summit shelf, starts paused, grants no progress and retains real encounter placement. Tap Pause / Resume to begin; reload to reset. The earlier slinger shortcut remains available with ?slinger=pilot&scene=slinger.

Walker/hopper role selection now uses existing enemy type rather than two opening array indices. Slinger selection covers both existing B1 throwers, each with independent event-based release/recovery feedback. All hoppers read their existing countdown for the same ten-tick visual compression. Every asset retains original loading/error fallback. The unchanged collision body, original foot anchor, rewards, input, attack timing, shot trajectories, checkpoints, bosses and soundtrack remain authoritative.

All six affected script URLs share the moonlit-enemies-20261020 release version to prevent stale mixed caches. The test harness deliberately keeps the legacy art comparison for existing render snapshots, with explicit normal-start rollout tests.

Validation: all 288 game/audio tests pass. New rollout coverage asserts one approved renderer for each of eleven actors, excludes B2/B3, compares 900 ticks of exact simulation state in every world, checks both slingers' independent state/reset behavior, and verifies safe paused summit initialization with no storage/progress writes. Existing art crop/fallback, hopper timing, thrower cancellation, projectile, damage, physics and boss checks remain in place.

Historical pilot notes in OPENING_ENEMY_PLAYTEST.md and DOUGH_SLINGER_PLAYTEST.md are superseded in scope by this rollout. Main remains unchanged pending the full-level review.
