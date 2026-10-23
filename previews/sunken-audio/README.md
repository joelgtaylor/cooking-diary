# Sunken Patisserie music audition 01

**Where the Starter Sleeps** — an original procedural composition, October 23, 2026. No samples, external recordings, or borrowed melodies. Uses the approved production FM instrument palette and transport without modifying them.

104 BPM, 4/4, 32 bars / 73.846 seconds. E-major/Lydian colour, with a warmer A-major/F-sharp-minor middle passage. Four eight-bar melodic phrases: entrance, exploration, open-water vista, return. Sparse syncopated bubbles, soft bell melody, rounded bass, sustained mist chords. Distinct from Fungal Caverns' 6/8 D-Dorian score. Bell attacks are kept quiet; the arrangement leaves space for gameplay warnings.

Open `index.html` through a static server. Tap Play; compare switches to the approved Bakery 2 music. Stop resets, master mute retires voices, and leaving the tab stops playback until the next gesture. No save keys or gameplay code are accessed. The new theme is registered only in this page's engine instance; production and the Flooded Entrance still use their existing audio.

Score lives in `theme.js`, presentation in `player.js`. Approval is required before integration; boss music and underwater effects remain separate future work. Stubbed audio tests validate event structure and transport but cannot establish listening quality. Human audition is the purpose of this page.

Run `node --test keen/tests/*.test.cjs previews/audio/audio.test.cjs previews/sunken-audio/*.test.cjs`.
