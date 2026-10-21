# Fungal Caverns environmental kit

October 21, 2026. Implements the approved five-section concept: rooted
foothills, Sporekeeper grotto, giant mushroom canopy, deep plunge and Bloomrot
approach. This is a rendering-only pass. The Bakery 2 layout, collision,
enemy spawns/AI/timing, relay logic, signs, checkpoints, collectibles, boss,
audio, camera follow and recipe progression are unchanged.

## Production assets and composition

`fungal-environment.png` is the transparent 1536 × 1024 source atlas created
with built-in image generation. `fungal-environment.js` owns reviewed crops,
proportioned rendering, section composition and explicit preview shortcuts.
The kit contains stone shelves, flat-rim mushroom caps, root walkways, a
mycelium/root arch, hanging rock and a rooted trunk. Interior texture samples
are used for long shafts, alternating vertical direction at joins so their
edges meet without gaps or abrupt silhouette cuts. Geometry and source
proportions are preserved; no new atlas is stretched to an arbitrary height.

Contiguous `=` runs are read from the applied production map. Foothill and
plunge shelves use stone; upper stairs and the relay floor use roots; the
upper canopy uses proportioned mushroom caps. A narrow pale line sits exactly
on each existing collision top. Gills, rootlets and supports extend down as
backing, behind actors. Short stone/root end bays crop the source at the same
scale as full bays. Solid cells retain opaque original terrain, with trim
clipped inside them. The generated cap's raised crown is excluded from its
source crop so it cannot suggest collision above the real flat landing.

Recessed vaults stay within the relay chamber; existing plinths, symbols,
gate, bloom animation and clue remain in front. Canopy stems terminate on
lower terraces, leaving open gaps through the plunge. A large dim root arch
frames the existing Bloomrot chamber plate without covering boss attacks,
sealing gates, checkpoint, oven or defeat sequence. The original far/mid/near
parallax and atmosphere remain, with a restrained section/depth tint behind
world objects. Luminance and silhouette distinguish landing surfaces without
relying on red/green color contrast.

All new rendering is gated on the fully loaded, correctly sized atlas,
Bakery 2, the existing world-art switch and `environment=off`. The previous
terrain/architecture are the complete loading, disabled and error fallback.
Bakery 1 and Bakery 3 render traces remain unchanged.

## Review

The regular game enables the kit when Bakery 2 is reached. For isolated
review, append one of these to the branch/commit `/keen/index.html` URL:

- `?scene=environment-foothills`
- `?scene=environment-grotto`
- `?scene=environment-canopy`
- `?scene=environment-plunge`
- `?scene=environment-bloomrot`

Shortcuts start paused. Press P or Pause / Resume to play. They grant no yeast,
relay solution or recipes and write no progress. Append `&environment=off`
to compare the original presentation against the same map and encounters.

## Generation specification

Reference: approved five-panel Fungal Caverns concept. Production prompt:
transparent orthographic detailed 16-bit pixel-art architectural atlas with
six separate components: a flat-topped stone shelf with pale cyan coping;
a flat-rim mushroom cap with violet gills and dark stem; a flat root walkway;
an organic root/mycelium arch with transparent opening; a hanging stratified
cavern formation; and a rooted trunk. Dark indigo stone, purple-brown roots,
restrained cyan/pink fungal nodes. No characters, labels, background scenery,
raised objects on landing edges or foreground clutter. Output was inspected
and source rectangles were chosen explicitly rather than assuming a grid.

## Verification

`node --test keen/tests/*.test.cjs previews/audio/audio.test.cjs` passes all
329 tests. New coverage checks crop bounds/RGBA, stage and loading/off/error
isolation, proportional source/destination rectangles, exact landing-line
alignment, rendering purity (including relay/boss/persistence state), identical
approved movement/combat with the kit enabled/disabled, and safe shortcuts.
All existing platforming, puzzle, enemy, boss and audio checks pass. Native
Canvas renders of all five sections were inspected with loaded actor/sign art.
