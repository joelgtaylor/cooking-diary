# Fungal Caverns discovery districts — production art

Asset: `cavern-discovery-atlas.webp`, 1536 × 1024 RGBA, lossless WebP.
Generated with the built-in image-generation tool using `fungal-environment.png`
as the approved style reference. No photos or character reference data used.
Source crops live in `../cavern-discovery-art.js`.

Twelve assets: cellar masonry bay, hollow mushroom cutaway, freight car, repair
winch, closed hatch, open frame, starter-jar shelf, porthole, rolling pin,
spore compass, freight token and riveted rail segment.

Prompt: Create a four-column by three-row transparent production atlas in the
existing detailed outlined pixel-art style, with purple-blue masonry, dark bark,
teal bioluminescence and aged brass/wood. Use front-on orthographic platformer
views, isolated cells and transparent gutters. Keep wall panels dark and free
of gameplay floors/platforms. Include the twelve objects above. Lift gears sit
below a horizontal upper plank; the open hatch has a transparent center. No
characters, text, labels, ground planes or cast shadows.

Runtime: lazy-load once in Bakery 2, require the correct dimensions, and retain
native graphics on loading/failure/off. Source proportions are preserved;
architecture is repeated or clipped to authored room bounds. The hollow extends
using separate upper, side and root crops, rather than stretching a doorway.
The car's visible top plank stays at its real support height. The open hatch
only draws jambs so no overhead bar implies a closed floor. Repaired winch state
uses a small shape-based indicator. Optional relic corner markers remain.
No collision, level, combat, reward or persistence changes. No runtime image
readback, processing or regenerated per-frame textures. Offscreen art is culled.

369 tests pass, including crop bounds, proportions, all loading/disabled fallbacks,
car alignment, render purity, offscreen culling and the existing discovery routes.
