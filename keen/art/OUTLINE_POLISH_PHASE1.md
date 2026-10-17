# Baker Outline Polish — Phase 1

The **original AI baker sprite atlas stays intact** at `baker-ai-stable.png`. This is a conservative, non-destructive outline treatment.

## Files

- `baker-outline-polish.js`: builds a polished Canvas atlas *once*, cached per source image. Used in the browser and by the Phase 1 preview.
- `tools/bake_baker_outline.py`: matching offline exporter for `baker-ai-outline-polished.png` (requires Pillow).
- Original atlas: `960 × 896`, rows of `96 × 112` tiles, no tile layout changes.

## What changes

- On each tile, the **outer one-pixel 8-connected ring** is gently darkened toward its own hue. The existing cream/lavender hat, face, coat, scarf, blue pants and brown boots retain their colors.
- All interior pixels and all 96×112 rectangles are **bit-for-bit unchanged**.
- Two disconnected artifacts (an isolated streak by run row 1/frame 1, a vertical seam in fall row 3/frame 3) are removed, without touching adjacent shoes or costume elements.
- No blurring, antialiasing, interpolation, additive alpha, frame timing changes or new palette/colors.
- The previously approved full-boot frame and eight-pixel foot-placement improvement are provided by the *parent branch* `fix/baker-foot-art-and-anchor`. They are not reimplemented here.
- The merged ground-contact physics fix is unaffected.

## Preview and rollback

Live test: https://joelgtaylor.github.io/cooking-diary/keen/outline-polish-phase1-preview.html

**K**: polished edges versus original edges. **J**: complete feet versus old incomplete pose. Keep **H** (ground physics) enabled to retain the ghosting fix.

The asset is inert on production until the branch's `keen/index.html` change is merged. Setting `window.CrustOutlinePolish` to `null` before rendering also restores the original atlas.

## Export a true PNG

From the repository:

```sh
python -m pip install pillow
python keen/art/tools/bake_baker_outline.py
```

This generates `keen/art/baker-ai-outline-polished.png` without overwriting the original. The production browser path deliberately uses the deterministic Canvas processor so the source and preview can be compared without replacing any binary atlas.
