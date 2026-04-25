"""
Add real alpha transparency to sprite sheets that ChatGPT/DALL-E exported
with opaque white backgrounds. Uses flood-fill from each corner so that
white pixels INSIDE the sprite (eyes, teeth, monitor text, etc.) are
preserved — only the connected near-white background gets erased.

Run: python scripts/fix_transparency.py
"""
from PIL import Image, ImageDraw
import numpy as np
import os
import sys

SPRITES_DIR = os.path.join(os.path.dirname(__file__), '..', 'public', 'sprites')
SHEETS_TO_FIX = ['character-sheet.png', 'screen-sheet.png', 'bug-sheet.png']
TOLERANCE = 25  # how far each channel can be from the corner sample

def fix_one(filename: str) -> None:
    path = os.path.join(SPRITES_DIR, filename)
    img = Image.open(path).convert('RGBA')
    w, h = img.size

    # Sample the four corners as the "background colour" reference
    corners = [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)]
    refs = [img.getpixel(c)[:3] for c in corners]

    # Flood-fill each corner's background region with full transparency.
    # This preserves any white pixels that aren't connected to the border
    # (e.g. white text on a monitor inside the sprite).
    for corner, ref in zip(corners, refs):
        ImageDraw.floodfill(
            img,
            xy=corner,
            value=(0, 0, 0, 0),
            thresh=TOLERANCE,
        )

    # Belt-and-braces: any near-white pixel that's still opaque is almost
    # certainly background that the flood-fill couldn't reach (isolated
    # bright regions surrounded by anti-aliased edges). Threshold these
    # too, but only when the alpha is still 255.
    arr = np.array(img)
    r, g, b, a = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2], arr[:, :, 3]
    is_bright = (r > 235) & (g > 235) & (b > 235)
    is_neutral = (np.maximum.reduce([r, g, b]).astype(int)
                  - np.minimum.reduce([r, g, b]).astype(int)) < 18
    is_opaque = a == 255
    mask = is_bright & is_neutral & is_opaque
    arr[mask, 3] = 0
    img = Image.fromarray(arr, 'RGBA')

    img.save(path, 'PNG', optimize=True)
    transparent_pct = round(100 * np.sum(arr[:, :, 3] == 0) / (w * h), 1)
    print(f'  {filename}: {transparent_pct}% transparent')

def main() -> int:
    if not os.path.isdir(SPRITES_DIR):
        print(f'sprites dir not found: {SPRITES_DIR}', file=sys.stderr)
        return 1
    for name in SHEETS_TO_FIX:
        if not os.path.isfile(os.path.join(SPRITES_DIR, name)):
            print(f'  skipping {name} (not found)')
            continue
        fix_one(name)
    return 0

if __name__ == '__main__':
    sys.exit(main())
