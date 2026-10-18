# Baker transparency repair

The production PNG remains byte-for-byte unchanged. Some dark body pixels in
its binary alpha mask were transparent, allowing scenery to show through the
face and clothing. On image load, sprite-repair.js creates a cached canvas and
fills only small enclosed transparent components (up to 64 source pixels).
Each repaired pixel copies the colour of its nearest original opaque boundary
pixel. All original opaque RGBA values, source positions, frame sizes, artwork,
foot anchors and animation timing are preserved.

Processing is per 96 × 112 active frame. Exterior-connected transparency,
unused cells, large enclosed openings, the low pogo spring loops and the lowest
foot/particle edges are retained. The existing source atlas receives 1,533
repaired pixels, with zero existing opaque pixels altered or removed. A failed
canvas read keeps the original image rather than preventing gameplay.

Processing occurs once after image load, never per animation frame. The canvas
retains the asset readiness dimensions and diagnostic source identity expected
by the renderer. Original and repaired surfaces remain available for review.
Render-command snapshots therefore remain unchanged; pixel-buffer tests cover
the mask repair and source immutability.
