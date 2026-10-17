# Baker Outline Polish — Phase 1, revision 2 (crisp)

The first Phase 1 pass only darkened edge colors by ~10%, which was too
subtle to distinguish at the game's 84×96-pixel display size. **Revision 2**
gives the chef a more deliberate classic DOS pixel-art outline, without a
redesign or any new silhouette pixels.

## Art treatment

- The existing **960×896 RGBA atlas** is the immutable source, split into
  **96×112** cells. Every existing run, idle, jump, fall and pogo pose keeps
  exactly its original frame and silhouette.
- Only the **outer one-pixel 8-connected edge** and its **immediately adjacent
  inside pixel** are changed. The inside layer is snapped to a curated
  32-color ramp derived from the baker's original hues; the outer pixel uses
  a corresponding deeper contour shade. **All deeper interior artwork stays
  byte-for-byte identical.**
- Keep all other alpha pixels unchanged. The sole exceptions are two
  previously identified stray artifacts: the detached white line in run
  row 1 / frame 1 and the fall row 3 / frame 3 vertical seam.
- The program uses neither interpolation nor blurring, and never expands
  the sprite. This avoids creating new jagged edges at the game's fractional
  sprite display scale.
- The face, chef hat, red scarf, sleeves, pants, boots and original
  proportions are preserved.

## Files

- `keen/art/baker-outline-polish.js`: browser-side cached, deterministic
  Canvas implementation used by both the preview and proposed main game.
- `keen/art/tools/bake_baker_outline.py`: reproduces the same processing
  as a physical PNG without overwriting the original atlas.
- `keen/art/baker-ai-stable.png`: unchanged original artwork.

To export a PNG from repo root (requires Pillow):

```sh
python -m pip install pillow
python keen/art/tools/bake_baker_outline.py
```

Result: `keen/art/baker-ai-outline-polished.png`.

## Browser preview

**https://joelgtaylor.github.io/cooking-diary/keen/crisp-outline-preview.html**

- **K**: crisp outline versus completely unmodified original colors.
- A **2× before/after** contact sheet immediately below the playable game
  lets you judge the contour on the same two poses.
- **J**: previously approved complete boots and visual foot alignment.
- **H**: merged ground-contact physics fix; leave enabled to avoid the
  previously diagnosed idle/fall oscillation.

## Invariants / merge strategy

- This is stacked onto `fix/baker-foot-art-and-anchor` (PR #7);
  merge the feet fix first, then the outline pass PR #8.
- The physically separate main game remains unchanged until merge.
- No physics, collisions, camera, game mechanics, recipe unlocks, progression,
  music, animation clocks or gameplay sprite coordinates are touched.
- Original atlas and the previous v1 treatment remain recoverable in Git
  history; the original can always be selected by disabling the processor.
