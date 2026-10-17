#!/usr/bin/env python3
"""Generate baker-ai-outline-polished.png matching baker-outline-polish.js.

Phase 1 revision 2: deliberate color-ramp contour in the original opaque
1-pixel edge and neighboring inner pixel. Does not add pixels, blur, resize,
alter hitboxes or rewrite the source atlas.
"""
from pathlib import Path
from PIL import Image

CELL_W, CELL_H = 96, 112
ROW_COUNTS = (5, 4, 4, 4, 4, 4, 3, 2)
COLORS = [
    (31, 30, 48),
    (52, 39, 58),
    (80, 49, 57),
    (113, 65, 63),
    (89, 84, 109),
    (119, 113, 144),
    (154, 148, 170),
    (181, 173, 191),
    (198, 184, 190),
    (227, 217, 212),
    (246, 237, 231),
    (124, 47, 62),
    (176, 48, 65),
    (210, 73, 79),
    (234, 108, 102),
    (109, 65, 66),
    (155, 83, 65),
    (200, 123, 84),
    (239, 175, 118),
    (253, 209, 155),
    (26, 48, 76),
    (30, 66, 101),
    (35, 89, 136),
    (57, 127, 166),
    (90, 162, 186),
    (77, 46, 52),
    (109, 62, 51),
    (164, 94, 60),
    (210, 145, 95),
    (115, 103, 111),
    (161, 152, 155),
    (211, 210, 211),
]
OUTLINE = [
    (34, 34, 53),
    (61, 46, 61),
    (80, 49, 57),
    (113, 65, 63),
    (103, 99, 131),
    (119, 113, 144),
    (154, 148, 170),
    (181, 173, 191),
    (181, 173, 191),
    (181, 173, 191),
    (181, 173, 191),
    (124, 47, 62),
    (135, 35, 51),
    (152, 46, 61),
    (162, 68, 75),
    (98, 60, 61),
    (113, 63, 53),
    (129, 77, 62),
    (153, 95, 78),
    (169, 113, 89),
    (26, 48, 76),
    (30, 66, 101),
    (32, 76, 115),
    (40, 83, 121),
    (48, 103, 145),
    (77, 46, 52),
    (94, 54, 50),
    (112, 68, 52),
    (138, 86, 60),
    (102, 88, 103),
    (126, 116, 133),
    (145, 136, 149),
]

HERE = Path(__file__).resolve().parent.parent
SOURCE = HERE / "baker-ai-stable.png"
DESTINATION = HERE / "baker-ai-outline-polished.png"

def nearest_palette(r, g, b):
    best_index, best_distance = 0, float("inf")
    for i, (rr, gg, bb) in enumerate(COLORS):
        dist = (rr-r)**2 + (gg-g)**2 + (bb-b)**2
        if dist < best_distance:
            best_index, best_distance = i, dist
    return best_index

def bake(source=SOURCE, destination=DESTINATION):
    source_img = Image.open(source).convert("RGBA")
    if source_img.size != (960, 896):
        raise ValueError("Expected a 960x896 source atlas")
    raw = source_img.load()
    result = source_img.copy()
    px = result.load()
    rings = 0
    removed = 0
    for row, count in enumerate(ROW_COUNTS):
        for col in range(count):
            left, top = col*CELL_W, row*CELL_H
            mask = [
                [raw[left+x, top+y][3] == 255 for x in range(CELL_W)]
                for y in range(CELL_H)
            ]
            outline = [[False] * CELL_W for _ in range(CELL_H)]
            for y in range(CELL_H):
                for x in range(CELL_W):
                    if not mask[y][x]:
                        continue
                    outline[y][x] = any(
                        xx < 0 or yy < 0 or xx >= CELL_W or yy >= CELL_H
                        or not mask[yy][xx]
                        for yy in range(y-1, y+2)
                        for xx in range(x-1, x+2)
                        if (xx, yy) != (x, y)
                    )
            for y in range(CELL_H):
                for x in range(CELL_W):
                    if not mask[y][x]:
                        continue
                    if ((row, col) == (1, 1) and x <= 20 and y >= 95) or (
                        (row, col) == (3, 3) and x <= 24 and y <= 35
                    ):
                        px[left+x, top+y] = (0, 0, 0, 0)
                        removed += 1
                        continue
                    near = outline[y][x] or any(
                        0 <= xx < CELL_W and 0 <= yy < CELL_H
                        and outline[yy][xx]
                        for yy in range(y-1, y+2)
                        for xx in range(x-1, x+2)
                        if (xx, yy) != (x, y)
                    )
                    if not near:
                        continue
                    r, g, b, a = raw[left+x, top+y]
                    color_index = nearest_palette(r, g, b)
                    nr, ng, nb = (OUTLINE if outline[y][x] else COLORS)[color_index]
                    px[left+x, top+y] = (nr, ng, nb, a)
                    rings += 1
    result.save(destination, optimize=True)
    print(f"Phase 1 v2: polished {rings} edge-band pixels, removed {removed} stray pixels.")
    print(f"Output: {destination}")

if __name__ == "__main__":
    bake()
