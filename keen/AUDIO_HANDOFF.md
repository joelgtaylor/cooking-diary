# Crust Quest — Music and Sound Upgrade Handoff

Prepared October 20, 2026, after the user completed and approved a full playthrough.

## Project and shipped baseline

- Repository: https://github.com/joelgtaylor/cooking-diary
- Production game: https://joelgtaylor.github.io/cooking-diary/keen/
- Shipped gameplay baseline: `main`, merge commit `9c79cf0937226c0850b9ad17d0bb50f4d7b0efaa`.
- Bakery 3 merged through PR #28. All three worlds, bosses and endings are now integrated and approved.
- Latest validation: `node --test keen/tests/*.test.cjs` — **196 passing**.
- The user then played the entire game successfully. This is a finished, playable game undergoing an audio upgrade, not an unfinished platformer prototype.

Fetch the latest `main` before starting. This handoff is documentation added after the gameplay merge. Create a new branch, suggested name `audio/keen-soundtrack`.

Crust Quest began as a sourdough Easter egg in Cooking Diary and has grown into a substantial retro platformer. The visual target is a richly illustrated late-1990s DOS game. Graphics, atmospheric animation, interface, characters and level design have already received extensive collaborative polish. **Bring the audio up to that standard while preserving the approved game.**

## The three worlds

| World | Established identity and progression | Boss / ending |
| --- | --- | --- |
| 1 — Moonlit Bakery | Moonlit rooftops, stone/slate architecture, starter workshop, proofing hall, towers and a descending forecourt | The Foreman: warned peel sweeps and dough tosses; recovery openings; persistent slumped defeat pose |
| 2 — Fungal Caverns | Bioluminescent mushrooms, drifting spores, an NPC Sporekeeper clue mission, a two-stage relay puzzle, deep main descent and optional upper combat route | Bloomrot: fast dashes, projectile dodges and aimed spore volleys; generated defeat animation |
| 3 — Clockwork Ovens | Industrial machinery, vents/gears, sheltered maintenance halls, exposed catwalks, optional roof gauntlet and descending terraces | The Grand Devourer: a disguised finish oven that transforms on approach; leaps/slams, flaming boules, kefir spray, brief door openings and a precision pogo target |

Every bakery requires five yeast cultures and unlocks a real recipe. Bakery 3 finishes when the player reaches the **real oven spat out during the Devourer's defeat**, after it lands and the collapse settles. That ending is approved; do not replace it with an invisible trigger at the wreck.

## Preserve these decisions

- Level geometry, enemy placement/behavior, encounter difficulty and boss timings are approved.
- Preserve camera following, hitboxes, jumping, ledge grabs, pogo, checkpoints, progression, recipes, persistent saves, artwork and atmospheric animation.
- The player shoots 50% faster than the original baseline. Holding jump while shooting fires upward; releasing jump allows horizontal airborne fire.
- Kefir is stored on pickup, then activated with **V** or the contextual touch button. The boost lasts eight seconds at 8.1 px/tick; ordinary speed remains 3.6 px/tick.
- Devourer tuning is deliberately balanced: 12 health, high jumps, slower descent, locked landing targets, cooldowns, open door while airborne, a small vulnerable pogo cap, right-side shelter and ammo that refreshes every five seconds. Do not retime attacks to fit a soundtrack.
- Final checkpoint resupplies at least three hearts, 65 ammo and one stored kefir. Boss retry retains cultures; mission restart returns to the entrance.
- Gameplay advances on a fixed 60 Hz simulation, independently of rendering. A previous half-speed movement regression was fixed. **Never change the simulation clock, movement speed or animation cadence to synchronize music.**
- The normal interface was deliberately cleaned of development buttons. Keep auditions/debug controls in a separate preview.
- Joel is red–green colourblind; any new audio UI needs readable labels, contrast and shape rather than colour-only state.

## Current audio: source audit

`keen/audio.js` is a small procedural Web Audio engine, extracted intact during the earlier refactor. It has no external music or sample assets.

Public API:

```js
AudioKit.start();       // called from existing user interaction paths
AudioKit.effect(name);
AudioKit.toggle();
```

It currently has:

- One composition shared by every bakery and boss: 148 BPM, eighth-note scheduling, a 32-step melody and a 16-entry bass pattern. The melody pattern repeats in about 6.5 seconds; the bass spans a longer cycle.
- Square, triangle, sawtooth and sine oscillators with simple gain envelopes. The offbeat shaker is a pitched triangle tone.
- One AudioContext, master/music/FX gains, a 45 ms scheduler interval and a 180 ms lookahead.
- Effects named `jump`, `pogo`, `shoot`, `collect`, `hit`, `enemy`, `climb`, `win`, `relay1`, `relay2`, `relay3`, `relayReset`.
- No world-specific composition, boss music, explicit scene transitions, ambient soundscape, separate victory arrangement or dedicated death cue.
- No explicit voice budget or effect-priority system.
- A single mute switch: **M currently mutes both music and effects**, despite the button saying “Music.” Preserve master mute unless a different interaction is agreed.

This was a code review, not a claim that the existing mix was auditioned in this session.

### Important integration points

| Files | Audio relevance |
| --- | --- |
| `keen/input.js` | Gesture-driven `start()`, M mute, touch buttons, pause input, focus/visibility input clearing |
| `keen/index.html` | Script loading, shared state, codex page sound, fixed-step outer loop and page visibility handling |
| `keen/world.js` | World init/advance, checkpoint activation/retry, completion, recipe unlocks and restart |
| `keen/physics.js`, `combat.js`, `gameplay.js` | Movement, pogo, shots, damage, pickups and stored kefir activation |
| `keen/throwers.js` | Ordinary enemy projectiles |
| `keen/foreman.js`, `bloomrot.js`, `devourer.js` | Boss engagement, attacks, vulnerability, defeat and oven release |
| `keen/mycelium.js` | Sporekeeper dialogue, relay notes, reset/success and opening the route |
| `keen/hud.js` | Presentation; keep actual sound events out of drawing functions |

The current effects are heavily reused. `shoot` also signals boss projectiles and some attack starts; `climb` also represents dodging, armor clangs and boss takeoff; `collect` covers cultures, supplies, powerups and recovered-oven landing. Codex paging reuses `pogo`. Separate these meanings gradually so they gain identities without adding duplicate triggers.

The relay's notes currently ascend C5–E5–G5. Preserve their distinguishability and puzzle correspondence, or update sound and clue presentation together without changing the puzzle logic.

## Proposed artistic direction — audition before committing

These are starting suggestions, **not musical arrangements already approved by the user**.

Aim for an original DOS/FM-inspired soundtrack with fuller harmony, distinctive instruments and longer, varied phrases. A shared musical motif can unite three contrasting world themes. Avoid a continuous harsh square-wave lead, overly repetitive short loops, or generic cinematic ambience that loses the platformer's personality.

- **Moonlit Bakery:** warm nocturnal fantasy; a playful, slightly mysterious melody, bell/celesta-like accents, rounded bass and light percussion. Keep it buoyant enough for jumping and exploration.
- **Fungal Caverns:** spacious and curious; glassy/mallet timbres, soft pulses, modal colour and breathing room for the relay notes. Maintain a clear musical identity rather than only a drone.
- **Clockwork Ovens:** driving mechanical rhythm, metallic percussion, darker FM/brass-like voices and a strong bass pulse. Build momentum without masking enemy warnings.
- **Bosses:** related musical vocabulary with increasing weight and urgency. Distinguish the Foreman's deliberate rhythm, Bloomrot's quick pursuit, and the Devourer's heavy machinery. Do not reveal the mimic through boss music before he transforms.
- **Completion:** short, satisfying boss-defeat and bakery-clear cues, with a final-game resolution. Avoid stacking multiple full “win” arpeggios over each other.

Suggest 60–90 seconds of developed material before a clearly audible repeat, with seamless loops and variation within the arrangement. Establish an instrument palette before writing all three scores.

Keep the implementation choice open until the first audition: the existing procedural engine can be extended, or original rendered music can be loaded with Web Audio. Prefer a compact, reproducible solution. If using external audio, document its source and licence and verify that it may ship. Do not assume an audio-generation service is available, and do not copy recognizable commercial game melodies.

## Sound design priorities

1. Player feedback: distinct jump, springy pogo, compact shot, landing, player hurt and death. Held rapid fire and repeated pogo must remain comfortable to hear.
2. Interactive objects: separate culture, checkpoint, ammo, healing, shield, stored kefir pickup and dash activation. Give the relay clear musical feedback without masking its notes.
3. Enemy/boss readability: wind-ups, projectile families, armor clang versus successful damage, vulnerability changes, impacts and defeat. The Devourer's oven ejection/landing deserves its own small payoff.
4. Presentation: restrained menu/page sounds, dialogue feedback, bakery completion and final victory.
5. Ambient beds only after the foreground mix works: distant bakery air/chimneys, cavern spores/drips, clockwork hum/steam. Keep these quiet and spatially restrained.

Use a voice budget, priorities and short cooldowns where appropriate. Player hurt and an important warning should stay legible over gunfire. Audio must supplement the existing visual telegraphs; it must not become necessary for avoiding damage or solving the puzzle.

## Playback and lifecycle work

The current scheduler does not consume world/game state. Pause and hidden-tab behavior are not explicitly coordinated with music. A throttled scheduler risks catching up old notes after a long gap. Audit this rather than assuming the visual loop already handles audio.

Preserve gesture-based initialization and graceful failure when audio is unavailable. Establish a small audio scene/event interface without coupling oscillator scheduling to gameplay ticks. Important scenes include exploration per world, boss engagement, defeat, clear/win, pause, dialogue/codex, retry and restart.

Use the audio clock for musical timing; handle transitions cleanly, with bounded scheduling and no stale note burst after tab suspension. Test repeated starts, mute/unmute, browser suspension and rapid scene changes. Avoid duplicate timers, accumulating nodes, abrupt gain discontinuities and lingering voices.

If separate music/SFX volume controls are desirable, propose one compact settings treatment. Do not add a row of debug buttons or silently turn M into music-only mute.

## Tests and review cautions

Run from the repository root:

```sh
node --test keen/tests/*.test.cjs
```

**The existing game harness deliberately skips `audio.js` and stubs AudioKit. The 196 passing tests do not validate actual sound, scheduling or the mix.** Add targeted engine tests using a fake Web Audio graph/clock, then do real browser listening and user auditions.

Some gameplay tests count effect names to verify projectile cadence, one-time impacts, rewards and frame-rate consistency. `physics-cases.cjs` includes audio-effect names in its historical hashes. If sounds gain semantic names, inspect those differences intentionally. Preserve attack timing and gameplay state, and keep event tests meaningful; do not simply overwrite snapshots until everything passes.

Verify keyboard and touch starts, mute while playing, pause/resume, tab hide/return, retry/restart, all three world transitions, puzzle feedback, sustained fire/pogo, boss defeats and final oven release. Check headphones and ordinary speakers for balance, peaks, harshness and loop fatigue. Do not claim an audible mix is verified from a screenshot or stubbed test.

## Working and delivery approach

1. Inspect current `main`, this handoff and the live game. Briefly audit current audio and propose the musical palette.
2. Build **one focused Moonlit Bakery audition** and a small matching core-effects set. Make it easy to compare music alone, effects alone and their mix. Let Joel hear it before expanding the overhaul.
3. Once that direction is approved, implement world-aware playback and complete the other world themes.
4. Add boss/puzzle/completion transitions, then finish the effect identities and mix.
5. Run the regression suite, real listening checks and a complete playthrough before asking to merge.

Work in small commits, one audio system or composition at a time. Do not merge the audio branch without explicit approval.

**Deliver playable/listenable previews on GitHub Pages.** Downloaded ZIP/HTML links were unreliable; the user explicitly preferred GitHub serving the preview. Existing `previews/factory/`, `previews/ascent/`, `previews/finale/` and `previews/devourer/` are isolated historical playtest copies, not production. A separate `previews/audio/` page is a suitable proposed destination. Namespace preview save keys so auditions cannot affect production scores or recipe unlocks. Keep normal production gameplay untouched while the musical direction is being reviewed.

Beware older documents: `MAINTENANCE.md`, `LEVEL_DESIGN_PLAN.md` and the opening of `art/devourer-art.md` contain historical statements about prototype status. The current runtime and `art/bakery3-layout-plan.md` describe the integrated finale. Do not reimplement already shipped level work or treat the Devourer as still isolated.

## Immediate next action

Start the audio branch from latest `main`, inspect the current soundtrack in the browser, and prepare a focused **Bakery 1 music and core-effects audition** for collaborative review. Preserve the shipped game and establish the target sound before producing the complete soundtrack.
