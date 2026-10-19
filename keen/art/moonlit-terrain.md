# Moonlit stone-and-slate terrain

`moonlit-terrain.png` is a fully opaque 256 × 96 atlas for Bakery 1 only.
Each row contains eight contiguous 32px texture samples:

- y=0: pale weathered limestone coping; rendered 9px high.
- y=32: blue-violet slate fascia for one-way ledges.
- y=64: staggered warm masonry for solid ground, rendered full-cell.

The renderer selects samples using world tile coordinates. Left/right ends
receive inset copper trim. All art remains inside the original cell bounds;
landing surfaces, collision maps and other worlds are unchanged. Until the
atlas loads, the previous terrain renderer remains active.

Created with built-in image generation from the approved October 18, 2026
stone-and-slate concept. Production prompt: edge-to-edge orthographic texture
sheet with pale weathered limestone, dark blue-violet slate with restrained
copper seam, and warm grey-violet staggered ashlar masonry; crisp DOS-style
pixel art, opaque materials, no scenery, labels, raised caps or perspective.
The generated 1536 × 1024 sheet was sampled at y=0–240, 250–489 and 490–1024;
each band was reduced to 256 × 32 with nearest-neighbour sampling.
