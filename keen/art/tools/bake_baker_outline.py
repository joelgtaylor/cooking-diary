#!/usr/bin/env python3
"""Bake the conservative Crust Quest outline-polished atlas into a PNG.

This produces the exact same RGB/alpha treatment as baker-outline-polish.js.
It requires Pillow (`pip install pillow`) and keeps all original cells in place.
The 960x896 source is never overwritten.
"""
from pathlib import Path
from PIL import Image

DIR = Path(__file__).resolve().parent.parent
SOURCE = DIR / "baker-ai-stable.png"
DEST = DIR / "baker-ai-outline-polished.png"
W, H = 96, 112
COUNTS = (5, 4, 4, 4, 4, 4, 3, 2)
STRENGTH = 0.8


def bake(source=SOURCE, destination=DEST):
    original = Image.open(source).convert("RGBA")
    if original.size != (960, 896):
        raise ValueError(f"Unexpected atlas dimensions: {original.size}")
    result = original.copy()
    src = original.load()
    out = result.load()
    updated = 0
    removed = 0
    for row, count in enumerate(COUNTS):
        for col in range(count):
            left, top = col * W, row * H
            for y in range(H):
                for x in range(W):
                    ax, ay = left + x, top + y
                    red, green, blue, alpha = src[ax, ay]
                    if alpha != 255:
                        continue
                    # Manually confirmed detached artifacts, not shoe pixels.
                    if ((row, col) == (1, 1) and x <= 20 and y >= 95) or (
                        (row, col) == (3, 3) and x <= 24 and y <= 35
                    ):
                        out[ax, ay] = (0, 0, 0, 0)
                        removed += 1
                        continue
                    if not any(
                        x + dx < 0 or y + dy < 0 or x + dx >= W or y + dy >= H
                        or src[ax + dx, ay + dy][3] == 0
                        for dy in (-1, 0, 1)
                        for dx in (-1, 0, 1)
                        if dx or dy
                    ):
                        continue
                    brightness = 0.299 * red + 0.587 * green + 0.114 * blue
                    base = (
                        0.87 if brightness > 185 else
                        0.89 if brightness > 130 else
                        0.93 if brightness > 85 else 0.98
                    )
                    factor = 1 - STRENGTH * (1 - base)
                    out[ax, ay] = (
                        int(red * factor + 0.5),
                        int(green * factor + 0.5),
                        int(blue * factor + 0.5),
                        255,
                    )
                    updated += 1
    result.save(destination, optimize=True)
    print(f"Baked {destination} — outline pixels: {updated}; stray pixels: {removed}")


if __name__ == "__main__":
    bake()
