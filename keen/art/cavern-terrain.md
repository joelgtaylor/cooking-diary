# Fungal Caverns terrain

`cavern-terrain.png` is a fully opaque 256 × 96 atlas used only in Bakery 2.
Eight contiguous 32px samples per row provide weathered upper rock (y=0),
dark basalt ledge faces (y=32), and dense solid rock (y=64). The renderer
compresses the surface band to 7px at the original tile top. A stepped clip
path gives one-way ledges chipped undersides entirely inside their 32px cells;
solid ground is never clipped. Cyan mycelium is baked into the rock texture.
No new animation, collision, hazards, or layout changes are introduced.

Built-in image generation used the approved October 18 cavern concept as a
reference. Prompt: three edge-to-edge orthographic pixel-art material bands;
muted grey-blue weathered basalt upper surface, deep charcoal/violet ledge
faces with sparse pale cyan mycelium, and opaque layered basalt ground; no
scenery, labels, perspective, brickwork, or neon outline. Samples from the
1536 × 1024 generated sheet: y=0–85, 320–640, 650–1024. Each was reduced to
256 × 32 with nearest-neighbour sampling.
