#!/usr/bin/env python3
"""Reproducibly export Crust Quest's Bakery 2 mushroom-polish as a PNG.

Reads the original image embedded in keen/art/phase3-bg.js, never overwrites
source art. Mirror of keen/art/background-polish.js. Requires Pillow, NumPy.
Run from repository root: python keen/art/tools/bake_mushroom_background.py
"""
import base64
import io
import re
from pathlib import Path
import numpy as np
from PIL import Image

ART = Path(__file__).resolve().parent.parent
SOURCE = ART / "phase3-bg.js"
DEST = ART / "phase3-stage-2-polished.png"

PURPLE = (166, 71, 186)
PINK = (210, 91, 191)
BLUE = (84, 143, 212)
RIM = (255, 171, 231)
STEM = (136, 213, 197)
TOWER = (77, 65, 102)

def shifted(mask, dy=0, dx=0):
    """out[y,x] = mask[y+dy,x+dx], outside = false."""
    h, w = mask.shape
    out = np.zeros_like(mask)
    y0, y1 = max(0, -dy), min(h, h-dy)
    x0, x1 = max(0, -dx), min(w, w-dx)
    if y0 < y1 and x0 < x1:
        out[y0:y1,x0:x1] = mask[y0+dy:y1+dy,x0+dx:x1+dx]
    return out

def original_image():
    content = SOURCE.read_text(encoding="utf-8")
    found = re.search(r"\b2:'data:image/png;base64,([^']+)'", content)
    if not found:
        raise ValueError("Bakery 2 PNG URI missing from phase3-bg.js")
    image = Image.open(io.BytesIO(base64.b64decode(found.group(1)))).convert("RGB")
    if image.size != (960, 540):
        raise ValueError(f"Unexpected background dimensions: {image.size}")
    return image

def bake():
    raw = np.array(original_image(), dtype=np.uint8)
    result = raw.copy()
    eq = lambda rgb: np.all(raw == rgb, axis=2)
    purple, pink, blue = eq(PURPLE), eq(PINK), eq(BLUE)
    rim, stem, tower = eq(RIM), eq(STEM), eq(TOWER)
    fill = purple | pink | blue

    near = np.zeros_like(fill)
    for dy in range(-2,3):
        for dx in range(-2,3):
            near |= shifted(fill,dy,dx)
    above = np.zeros_like(fill)
    below = np.zeros_like(fill)
    for d in range(1,4):
        above |= shifted(fill,-d)
        below |= shifted(fill,d)
    relevant = rim & near
    upper = relevant & below & ~above
    lower = relevant & above & ~below
    sides = relevant & ~upper & ~lower
    result[upper] = (255,191,236)
    result[lower] = (202,111,193)
    result[sides] = (239,151,225)

    inner_high = np.zeros_like(fill)
    inner_low = np.zeros_like(fill)
    for d in (1,2):
        inner_high |= shifted(upper,-d)
        inner_low |= shifted(lower,d)
    for part,top,shadow in (
        (purple,(191,86,202),(138,56,164)),
        (pink,(231,110,211),(180,70,163)),
        (blue,(109,163,224),(61,116,179)),
    ):
        result[part&inner_high]=top
        result[part&inner_low]=shadow

    # Mint stems: one-pixel left highlight and right shadow.
    result[stem&~shifted(stem,dx=-1)] = (158,229,212)
    result[stem&~shifted(stem,dx=1)] = (103,179,170)
    result[stem&~shifted(stem,dy=-1)] = STEM

    # Subtle inside-edge separation of the nearest purple towers.
    only_towers = np.arange(raw.shape[0])[:,None]>=136
    result[tower&~shifted(tower,dx=-1)&only_towers]=(61,58,87)
    result[tower&~shifted(tower,dx=1)&only_towers]=(91,78,117)
    Image.fromarray(result).save(DEST,optimize=True)
    n=int(np.count_nonzero(np.any(result!=raw,axis=2)))
    print(f"Exported {DEST}, {n} RGB pixels adjusted, zero geometry changes")

if __name__ == "__main__":
    bake()
