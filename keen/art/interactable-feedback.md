# Checkpoint and yeast feedback

Existing flag and jar artwork is retained. interactables.js owns rendering-only
presentation; collection/scoring remains in gameplay.js and checkpoint/progression
rules remain in world.js. No physical coordinates, trigger thresholds, frame
intervals, sounds, particles or gameplay RNG calls change.

Checkpoint poles, lanterns and pedestals use frame 0. Cloth retains the original
four-frame 10-tick inactive / 8-tick active cycle but no longer receives extra
horizontal translations. Frame-0 source alpha baselines (117 inactive, 112
active) anchor the pedestal to its actual support surface instead of using
padding estimates. World badges distinguish CHECKPOINT, current SAVED and
previously PASSED markers independently of colour. A 30-tick corner flash
observes advancement of checkpointState.current without modifying that state.

Yeast jars retain the original five-pixel sine bob and 30 × 34 artwork size.
Draw positions are rounded to whole pixels; a stationary YEAST badge and small
dark backing improve contrast. Two restrained fixed glints replace three
orbiting crosses. An 18-tick corner flash observes collection. Existing pickup
bursts, scores and sounds are unchanged.

WeakMaps hold presentation state by gem/checkpoint identity. Cold starts do
not replay old pickup/save flashes, fresh worlds cannot inherit old feedback,
and decreasing ticks reset the clocks. Simulation pauses naturally freeze the
feedback. No visual metadata is written into game objects.

Render snapshots intentionally change for revised jar composition, fixed flag
alignment, world badges and new save/pickup cases in all three worlds.
