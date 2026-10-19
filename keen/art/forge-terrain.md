# Clockwork Ovens terrain

`forge-terrain.png` is an opaque 256 × 96 atlas used only in Bakery 3.
Each row contains eight contiguous 32px material samples: steel tread (y=0),
riveted iron catwalk fascia (y=32), and dense refractory masonry/foundation
plates (y=64). Treads render 7px high on the original tile top. Flush copper
end plates and rivet highlights remain inside each 32px cell. No railing,
raised end posts, grating holes, supports, or projecting gear teeth are added.
The earlier copper ledge overlay is now used only when the atlas is unavailable.

Built-in image generation used the approved October 18 iron-and-copper
concept as reference. Prompt: three full-width opaque orthographic pixel-art
texture bands; worn steel tread, dark blue-violet riveted iron with sparse
aged copper seams, and heat-darkened refractory foundation; crisp DOS-style
pixel art, no scenery, labels, perspective, rails, posts, holes or lava.
The 1536 × 1024 source sheet was sampled at y=0–320, 330–640 and 650–1024;
each band was reduced to 256 × 32 with nearest-neighbour sampling.
