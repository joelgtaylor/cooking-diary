# Sunken Patisserie music audition 04

**Where the Starter Sleeps** — an original procedural composition, October 23, 2026. No samples, external recordings, or borrowed melodies. Uses the approved production FM instrument palette and transport without modifying them.

104 BPM, 4/4, 32 bars / 73.846 seconds. Revision 03: E Dorian throughout (E F# G A B C# D). A recurring E–G–A–B–C#–B hook develops through call-and-answer, a slower bridge, an octave-up chorus and a tonic return. Em9 / A9 harmony foregrounds Dorian’s natural sixth; accompaniment is modal too. Four eight-bar melodic phrases: entrance, exploration, open-water vista, return. Revision 02 develops the arrangement: sparse entrance, emerging bass groove, denser exploration, a half-time deep chamber, rising bells, a full chorus with glass counter-melody, and a two-bar release. Added an audition-only low-pass filter (820–1350 Hz), a broad +2.3 dB lift at 280 Hz, and a quiet 190 ms echo with 0.16 feedback. Smooth clear/underwater switching; Bakery 2 bypasses the treatment. Stop, mute and tab hiding retire the echo path. Distinct from Fungal Caverns' 6/8 D-Dorian score through its recurring hook, straight meter, arrangement and underwater mix. Bell attacks are kept quiet; the arrangement leaves space for gameplay warnings.

Open `index.html` through a static server. Tap Play; compare switches to the approved Bakery 2 music. Stop resets, master mute retires voices, and leaving the tab stops playback until the next gesture. No save keys or gameplay code are accessed. The new theme is registered only in this page's engine instance; production and the Flooded Entrance still use their existing audio.

Score lives in `theme.js`, presentation in `player.js`, isolated output routing in `underwater-mix.js`. Approval is required before integration; boss music and underwater effects remain separate future work. Stubbed audio tests validate event structure and transport but cannot establish listening quality. Human audition is the purpose of this page.

Run `node --test keen/tests/*.test.cjs previews/audio/audio.test.cjs previews/sunken-audio/*.test.cjs`.

## Revision 04 — open-water theme as the home

The approved revision-03 open-water melody, harmony and full instrumental texture now open the piece. Eight bars of exploration develop the hook; eight bars over B minor / F-sharp minor / A9 / B suspended harmony gather mild tension with a rising line. The final eight bars reprise the opening melody and harmony, resolve to E minor, and leave a short breath before the loop. No sparse entrance or half-time breakdown remains. Underwater processing is retained, with the clearer open-water cutoff framing the slightly murkier middle.
