# Player animation review — October 22, 2026

Baseline: a341bae. Review branch: polish/player-animation-alignment.

## Confirmed shooting alignment defect

Both heroes spawned horizontal shots at player.y + 19, despite their artwork being roughly twice the 38-pixel collision-body height. Vance's rendered standing muzzle is about 49 pixels above his feet; the old projectile centre was only 16 pixels above them. This explains the knee-level firing Joel observed.

This preview uses Vance-specific barrel anchors for standing, running and airborne horizontal/upward firing frames. It mirrors anchors with facing, includes recoil, and checks terrain between body and barrel so an extended weapon cannot spawn through a wall. Loafy's established origin, fire interval, ammo use, projectile speed and dimensions are retained. Vance's relay-door shot identity and both doorway approaches remain covered by regressions.

**Gameplay tradeoff requiring playtest:** this is an actual projectile-origin correction, not a cosmetic offset from its collision box. Vance's elevated shots can pass over small grounded enemies. Do not silently enlarge hitboxes, lower his gun artwork, or add homing to compensate. Review this consequence with Joel before merging.

## Other animation findings

Source and atlas review confirms idle, run, rise/fall, ledge hang, mixer, horizontal fire, upward fire and running-fire states for both heroes. Feet are anchored to the actor's bottom; hanging hands use the ledge top. This pass preserves those transforms and shared timing.

- Horizontal airborne Vance shots intentionally reuse the running gun poses rather than the atlas's upward-tilted airborne gun poses. Preserve that useful mapping.
- Mixer poses take precedence over shooting poses. Firing during mixer mode therefore still lacks a dedicated matching weapon animation; retained for now rather than changing approved mixer presentation or combat rules.
- Firing animation is seven simulation ticks with a three-tick recoil window. Fire cadence is unchanged.
- Atlas-ready/fallback paths remain unchanged. Muzzle positions are gameplay metadata and do not depend on asynchronous asset loading.
- Existing release-version test still expected the prior mycelium cache tag after the merged polish changed it. Updated that stale assertion along with tags for the changed animation/combat scripts.

## Validation

Added firing-origin checks for both facings, standing/running and grounded/airborne states, horizontal/up aim; terrain obstruction tests; and equal cadence/ammo/speed/dimension checks. The old cross-character simulation-equality test now compares movement without firing: projectile positions are intentionally character-specific in this preview.

This is a source/atlas and automated animation-state review, not certification of every animation in live mobile play. No sprite artwork, movement physics, enemy AI, boss timing, level geometry or music was changed.
