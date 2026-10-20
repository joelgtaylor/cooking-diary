# Approved world-audio integration

The three scores and instrument settings match the approved previews/audio/audition.js compositions. Bakery 1: 116 BPM, 66.21 seconds. Fungal Caverns: 6/8 at quarter-note 90, 64 seconds. Clockwork Ovens: 140 BPM, 68.57 seconds. Original procedural music; no external samples.

## Runtime
- audio-engine.js owns scores, FM synthesis and the independent audio-clock scheduler.
- audio.js preserves start(), effect(name), toggle(), and adds scene(bakery,state) and reset(bakery).
- index.html reports presentation state before each rendered frame. No simulation calculation or cadence changes.
- World init resets the music transport after the existing game initialization. Checkpoint retry resumes the existing theme.
- User gestures initialize audio. Scene reporting and visibility events never initialize a context.
- Pause, codex, dialogue, clear and final-win states pause exploration music. Effects remain available for existing UI/reward events.
- Hidden tabs suspend the context and retire scheduled voices. Returning resumes the selected scene if audio was already unlocked; browsers may require another gesture.
- M and the Sound button mute music and effects. No separate settings or audition controls are added.
- Existing effect trigger names remain unchanged, preserving gameplay-event assertions. Approved core sounds are used for jump/pogo/shoot/collect/hit. Relay C5/E5/G5 and remaining legacy effect names remain supported. No new landing/death triggers or unapproved boss themes are added.
- Music uses at most 48 of 64 carrier voices, reserving room for effects. Modulators retire with carriers; paused/superseded voices are released. Resume generation tokens prevent a pending browser resume from restarting stopped playback.

## Validation
Twelve targeted fake-Web-Audio/facade checks were executed in the available JavaScript runtime. These cover score equivalence, theme switching, timer uniqueness, pause/resume, master mute, hidden tabs, delayed resume cancellation, cooldown/voice limits, relay pitches, every existing effect name, gesture unlock and graceful failure.

The normal Node suite and real browser checks must also run before treating the integration as fully validated. The previous 196 gameplay + 5 audition passes predate this integration. The repository workflow runs those suites together with the new production audio tests. A complete audible playthrough remains a human review item; fake graph checks cannot validate mix or listening comfort.

No geometry, physics, camera, boss behavior, progression, saves, artwork or sound-event trigger locations were changed.
