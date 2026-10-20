# Grand ovens

`grand-ovens.png` is a transparent 288 × 176 atlas: three 96 × 176 cells,
one per bakery. The fixed dormant structures use limestone/slate, basalt and
mycelium, and riveted iron/copper respectively. The baked-in dark chambers
receive clipped pixel fire, a loaf and a golden emblem when `collected===5`.
Fire uses the existing simulation tick; the structure never switches frames.
No lights, smoke or particles obscure the surrounding gameplay.

The displayed footprint remains 65 × 115. Its left edge is still oven.x*T-8.
The base now rests at checkpointSupportRow(oven.x,oven.y)*T: Bakery 1's final
ledge (row 52), and the other two bakeries' floor (row 54). Source artwork and
rendered effects stay within this footprint. All progression, recipe unlocks
and oven proximity tests remain in world.js, unchanged. The earlier seven
rectangles remain the load-failure fallback.

Built-in image generation used the approved October 18 six-panel oven concept
as reference. Production prompt: exactly three isolated dormant front-elevation
ovens on transparent background; narrow complete chimney-to-base silhouettes;
limestone/slate, basalt/mycelium, iron/copper; engraved loaf emblems and empty
dark arched chambers; no scenery, floor strips, props, smoke, fire, labels or
ready-state duplicates; crisp DOS pixel art readable at 65 × 115.

The generated 1881 × 836 image was sampled at (65,74)-(610,788),
(661,72)-(1218,789), and (1266,86)-(1816,788). Each isolated crop was resized
to 96 × 176 with nearest-neighbour sampling and placed into its atlas cell.
Mouth and emblem coordinates are recorded in ovens.js. The source art is static;
no atlas grid or character artwork was regenerated.
