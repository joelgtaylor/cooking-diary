# Crust Quest world-theme auditions

Original procedural compositions and synthesis, authored for Crust Quest. No external samples or melodies. Preview only; nothing under keen/ changes. No storage access.

| Theme | Musical identity | Loop |
| --- | --- | --- |
| Moonlit Bakery (approved) | Warm reed, bells, rounded bass; C major colour; 4/4 at 116 BPM | 32 bars / 66.21 s |
| Fungal Caverns | Glass mallets, soft plucks, droplet accents and open D Dorian harmony; lilting 6/8 at dotted-quarter 60 (quarter 90) | 32 bars / 64 s |
| Clockwork Ovens | FM brass, clipped piston bass, metallic taps, E minor/harmonic-minor colour; 4/4 at 140 BPM | 40 bars / 68.57 s |

Caverns has four eight-bar phrases: descending curiosity, a brighter answer, a rising spacious bridge and a quiet return. Ovens has five: machinery starts, brass answer, high catwalks, stripped maintenance passage, full-machine return. These are exploration themes, not boss cues. They must not reveal the Devourer mimic.

World selector includes the existing game artwork for context. Switching worlds stops playback; Play starts the selected score from its entrance. Review with music alone, individual effects, or the 12-second action sequence. Independent music/effect levels apply to new themes; the legacy comparison retains its original mix. Mute all applies to both contexts. Hidden tabs stop/reset the audition and require a gesture to restart.

The new engine uses bounded lookahead, one timer, effect cooldowns, 64 carrier voices and a safety compressor. Themes share an engine but have separately authored notes, harmony, rhythm and instrument palettes. This is an audition, not a production world-audio integration. Existing gameplay sound events remain untouched.

Validation: `node --test previews/audio/audio.test.cjs` (5 tests); `node --test keen/tests/*.test.cjs` (196 tests). Bakery 1's 256 score steps were compared with the approved first audition and are identical. Tests verify graph/scheduling behavior, not perceived sound quality. Live browser controls need a separate check after deployment; headphone/speaker mix and loop fatigue remain listening-review items.

Only isolated preview files are published on main through the existing Pages deployment. Development branch: audio/keen-soundtrack. Do not merge or enable production audio without approval.
