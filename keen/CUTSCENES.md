# Cutscenes and campaign arrival

First implementation: **Into the Deep**, an 11-second transition when advancing from the Clockwork Ovens clear screen. A pressure hatch, the hero's descent and the Sunken Patisserie reveal connect the two locations. Loafy notices the pressure seal; Vance heads straight in. Existing hero action atlases, Clockwork art and a 152 KB WebP crop of the approved Sunken concept are reused. No combat, geometry, composition or boss changes.

## Review

Open the pause/start menu and choose **Replay · Into the Deep** to audition without completing World 3. Replay restores the exact previous menu and simulation state. Escape or the visible Skip button ends replay; on the real campaign handoff, either skipping or finishing navigates to World 4. Review both characters, portrait/landscape, fullscreen and reduced motion.

From the World 3 clear screen, Next bakery / Enter / canvas tap starts the cinematic. World 4 then starts at its normal entrance after all required artwork has decoded. A direct visit or reload retains character selection and the normal start menu. Hidden-tab interruptions during loading retain an explicit Resume boundary. The selected hero, touch display/size/opacity, recipe unlocks and best score use their existing storage keys. Mute now persists through `crustQuestMuted` in both audio facades. As before, health/score/checkpoints within a world are not a cross-world save system.

Navigation between HTML documents can exit native fullscreen. It cannot promise continuous audio: arrival deliberately does not initialize an audio engine. The next normal control gesture can start audio under browser policy. If session storage is unavailable the destination safely shows its normal menu.

## Architecture

- `cutscenes.js`: reusable explicit-duration timeline, ordered one-shot events, frame renderer, completion reason, replay via `play`, skip, and suspension without wall-clock catch-up. Rendering and cues are injected, so static frames, pans, sprite poses and audio cues do not depend on gameplay clocks.
- `campaign-scenes.js`: game integration, scene definition, canvas compositions, subtitle/Skip UI, input capture and navigation. The main loop resets its simulation accumulator and returns early for every cinematic frame. No gameplay, enemy, camera or damage step runs. Held keyboard and pointer inputs clear at both boundaries. Hidden pages suspend the timeline; reduced motion uses fixed compositions, without bubbles, bobbing, zoom or fades.
- A versioned `crustQuestCampaignArrival` session token targets only 3 → 4, accepts only the roster's two hero IDs and expires after two minutes. It is minted immediately before departure and removed before validation at World 4 initialization. The artwork gate resumes only that pending arrival once. Returning to the dry page clears abandoned tokens. No persistent URL bypass exists.
- The scene overlay sits inside `wrap` for fullscreen, uses viewport safe areas, isolates shortcuts in capture phase, traps Tab on Skip and supplies high-contrast live subtitles. Audio cues reuse the facade and never unlock audio themselves.

To add a scene, define a duration and timestamped cues, supply a renderer and completion destination through the controller. Keep gameplay state ownership in the adapter, and keep each terminal path idempotent. Future story scenes should be reviewed before broad campaign rollout.

## Validation

Full existing regression command from `.github/workflows/keen-tests.yml`, plus new timeline, token, production arrival/reload, hidden loading, input isolation, replay and mute persistence checks. All pass locally. Browser visual, physical multitouch, native fullscreen and audible review remain pending: this workspace had no browser executable and browser installation failed.
