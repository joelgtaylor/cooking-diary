# Moonlit Bakery audio audition 01

Original procedural composition and synthesis, authored for Crust Quest. No external samples or melodies. 116 BPM, 32 bars (66.21 seconds), four eight-bar phrases. Preview only; nothing under keen/ changes. No storage access.

Review: new/current comparison, individual effects, 12-second action sequence and independent new-theme/effect levels. The legacy track retains its original mix. Mute all applies to both contexts. Hidden tabs stop/reset the audition and require a gesture to restart. The new engine uses bounded lookahead, one timer, effect cooldowns, 64 carrier voices and a safety compressor. This is an instrument/composition study, not a production-ready world audio engine. Existing effect events have not been renamed or integrated.

Validation: `node --test previews/audio/audio.test.cjs` (3 tests); `node --test keen/tests/*.test.cjs` (196 tests). Tests verify graph/scheduling behavior, not perceived sound quality. Live browser playback requires a separate smoke check after publishing; listening approval remains Joel's. Headphone/speaker mix and loop fatigue remain review items.

Publishing these isolated preview files on main serves the audition through the existing Pages deployment. This does not merge or enable an audio upgrade in production. Continue development on audio/keen-soundtrack; do not merge production audio without approval.
