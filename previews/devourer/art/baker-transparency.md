# Baker transparency repair

The original baker-ai-stable.png remains byte-for-byte unchanged. Some dark
body pixels in its binary alpha mask were transparent, allowing scenery to
show through the face and clothing. The build tool creates baker-ai-solid.png
by filling only small enclosed transparent components (up to 64 pixels), using
the nearest original opaque boundary colour. All original opaque RGBA values,
frame positions, dimensions, foot anchors and animation timing are preserved.
The atlas receives 1,533 repaired pixels with zero opaque pixels altered/removed.

The game loads the repaired PNG as a normal immutable Image. There is no runtime
canvas readback, flood fill or software-backed sprite surface. This avoids
repeated canvas-to-canvas transfer overhead on affected graphics systems.

Rebuild with sharp available to Node:

    node keen/tools/build-baker-solid.cjs

sprite-repair.js is build/test code only. Processing is per 96 × 112 active
frame. Exterior-connected gaps, unused cells, large enclosed openings, low
pogo spring loops and the lowest foot/particle edges remain transparent. Tests
cover source-buffer immutability and production loading without canvas repair.
