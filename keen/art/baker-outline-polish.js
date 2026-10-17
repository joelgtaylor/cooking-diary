/* Crust Quest: conservative outer-contour polish, Phase 1.
 *
 * The original 960x896 RGBA atlas is kept untouched. For each existing 96x112
 * cell, darken ONLY the outer 1-pixel ring toward the source color's own hue.
 * No smoothing, alpha blending, resizing, palette replacement, or animation
 * edits. Two confirmed stray fragments are removed explicitly.
 *
 * No effect unless the game calls CrustOutlinePolish.get(image).
 */
(function () {
  'use strict';
  const CELL_W = 96, CELL_H = 112;
  const ROW_COUNTS = [5, 4, 4, 4, 4, 4, 3, 2];
  const STRENGTH = 0.8;
  const cache = new WeakMap();

  function originalOrCleaned(image) {
    if (!image || !image.complete || !image.naturalWidth) return image;
    const hit = cache.get(image);
    if (hit) return hit;
    try {
      const width = image.naturalWidth, height = image.naturalHeight;
      if (width !== 960 || height !== 896) {
        console.warn('Baker outline polish: unexpected atlas dimensions', width, height);
        return image;
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d', {willReadFrequently:true});
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(image, 0, 0);
      const img = ctx.getImageData(0, 0, width, height);
      const src = new Uint8ClampedArray(img.data);
      const out = img.data;

      // Work in *each sprite cell*; adjacent cells can never bleed together.
      for (let row = 0; row < ROW_COUNTS.length; row++) {
        for (let col = 0; col < ROW_COUNTS[row]; col++) {
          const cellX = col * CELL_W, cellY = row * CELL_H;
          for (let y = 0; y < CELL_H; y++) {
            for (let x = 0; x < CELL_W; x++) {
              const ax = cellX + x, ay = cellY + y;
              const index = (ay * width + ax) * 4;
              if (src[index + 3] !== 255) continue;

              // Two manually inspected artifacts, not costume pieces:
              // stray white foot-line beside run row1/frame1, and a vertical
              // seam to the left of fall row3/frame3.
              if ((row === 1 && col === 1 && x <= 20 && y >= 95) ||
                  (row === 3 && col === 3 && x <= 24 && y <= 35)) {
                out[index] = out[index + 1] = out[index + 2] = 0;
                out[index + 3] = 0;
                continue;
              }

              let contour = false;
              for (let dy = -1; dy <= 1 && !contour; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                  if (!dx && !dy) continue;
                  const xx = x + dx, yy = y + dy;
                  if (xx < 0 || yy < 0 || xx >= CELL_W || yy >= CELL_H ||
                      src[((cellY + yy) * width + cellX + xx) * 4 + 3] === 0) {
                    contour = true;
                    break;
                  }
                }
              }
              if (!contour) continue;

              const red = src[index], green = src[index + 1], blue = src[index + 2];
              const brightness = 0.299 * red + 0.587 * green + 0.114 * blue;
              const base = brightness > 185 ? 0.87
                         : brightness > 130 ? 0.89
                         : brightness > 85  ? 0.93 : 0.98;
              const factor = 1 - STRENGTH * (1 - base);
              // Keep the current hue and interior color: no artificial
              // black outlines on the pale chef hat or the skin.
              out[index] = Math.round(red * factor);
              out[index + 1] = Math.round(green * factor);
              out[index + 2] = Math.round(blue * factor);
            }
          }
        }
      }
      ctx.putImageData(img, 0, 0);
      // Match HTMLImageElement's dimensions/readiness properties so the
      // existing sprite renderer can draw this Canvas with no other changes.
      canvas.complete = true;
      canvas.naturalWidth = width;
      canvas.naturalHeight = height;
      cache.set(image, canvas);
      return canvas;
    } catch (error) {
      console.warn('Baker outline polish failed; falling back to original art', error);
      return image;
    }
  }
  window.CrustOutlinePolish = Object.freeze({
    get: originalOrCleaned,
    version: 'phase1',
    cellWidth: CELL_W,
    cellHeight: CELL_H
  });
})();
