# Sprite Shopping List

Drop PNGs into `public/sprites/` with the exact filenames below. The app loads each one if it exists and falls back to the SVG pixel-grid version otherwise — so you can add them incrementally without breaking anything.

## Style guide (from the reference concept art)

- **Chunky 8-bit pixel art** — visible, crunchy pixels, no anti-aliasing
- **Transparent PNG** backgrounds (alpha channel, not a solid color)
- **Limited palette** per sprite (6–12 colors), strong silhouettes
- **Consistent lighting** — light source top-right (matches moon/sun position in scene)
- **Dark outline or 1-pixel shadow** for contrast against the parallax sky

## Dimensions

All square. Source at **256×256** is ideal (it renders crisply at the in-app sizes of 220–300px with `image-rendering: pixelated`). 512×512 also fine.

---

## 1. Tree — 6 stages × 4 seasonal variants

Grows from seed (stage 0) to full bloom (stage 5). Seasonal variant swaps leaf color at streak thresholds.

### Base green (streaks 1–9) — **required**

| File | Stage | Description |
|---|---|---|
| `tree-green-0.png` | Seed | Cracked seed half-buried in soil, a single sprout crack |
| `tree-green-1.png` | Sprout | Thin green sprout with two tiny leaves breaking ground |
| `tree-green-2.png` | Sapling | Young trunk, small round canopy of 5–8 leaves |
| `tree-green-3.png` | Young tree | Clear trunk + branches, medium canopy with visible leaf clumps |
| `tree-green-4.png` | Full tree | Thick trunk, layered canopy with 3–4 distinct leaf clumps |
| `tree-green-5.png` | Full bloom | Large lush tree, 5+ leaf clumps, maybe a bird or fireflies |

### Seasonal variants — only stage 5 needed for MVP

| File | Variant | Streak threshold |
|---|---|---|
| `tree-blossom-5.png` | Cherry-blossom pink canopy | 10+ |
| `tree-autumn-5.png` | Warm orange/red canopy | 25+ |
| `tree-winter-5.png` | Bare branches + snow, tiny warm lights | 50+ |

> Nice-to-have: full stages 0–5 for each seasonal variant (`tree-blossom-{0..5}`, etc.). Not required.

### Prompt template

```
8-bit pixel art, 256x256, transparent background, single centered {stage description}
{variant: lush green leaves / cherry blossom pink leaves / autumn orange and red leaves / bare winter branches with snow}.
Chunky pixels, no anti-aliasing, visible pixel grid, limited palette of greens/browns,
strong silhouette, 1-pixel dark outline, lighting from top-right. Retro arcade aesthetic.
No background, no ground tile — just the tree.
```

---

## 2. Character — 5 states

A coder at a wooden desk with a CRT-style monitor and coffee mug. The whole tableau (character + desk + monitor + mug) is one sprite — matches the reference concept art.

The character faces **left** (looking at the monitor on their left). Brown/black short hair, dark hoodie.

| File | State | Trigger | What's different |
|---|---|---|---|
| `character-idle.png` | Idle | Default | Hands on keyboard, neutral face, orange monitor glow |
| `character-thumbsup.png` | Thumbs up | Correct answer | Right hand raised giving a thumbs-up, slight smile |
| `character-facepalm.png` | Face-palm | Wrong answer | Hand covers face, closed eyes, no steam from mug |
| `character-sunglasses.png` | Sunglasses | Streak 5+ | Wearing black sunglasses, smug half-smile |
| `character-fistpump.png` | Fist pump | Streak 15+ | Both arms raised, wearing sunglasses, big grin |

### Prompt template

```
8-bit pixel art, 256x256, transparent background, young coder at a wooden desk
seen from 3/4 angle, facing left toward a chunky CRT monitor glowing orange with
code lines. Dark blue hoodie, short hair. Steam rising from coffee mug on desk
(except facepalm). {state-specific pose}.
Chunky pixels, no anti-aliasing, 1-pixel dark outline, warm side-lit palette,
limited colors. Retro arcade aesthetic. No floor, no background — just character + desk + monitor + mug.
```

---

## 3. Scene elements

| File | Size | What |
|---|---|---|
| `moon.png` | 128×128 | Pixel crescent moon, warm cream/gold, with soft glow edge |
| `sun.png` | 128×128 | Pixel sun with 4 or 8 radiating rays, warm yellow/orange, soft outer glow |
| `cabin-dark.png` | 256×256 | Small wooden cabin at night, windows glowing warm orange, dark wood, sloped pixel roof |
| `cabin-light.png` | 256×256 | Same cabin in daylight, warm wood, darker windows (no glow), blue sky peek behind roof |

### Prompt templates

```
8-bit pixel art, 128x128, transparent background, crescent moon with a gentle warm
glow halo, cream and gold palette, crisp pixel edges. Retro arcade aesthetic.
```

```
8-bit pixel art, 256x256, transparent background, small wooden cabin at night with
sloped roof, two windows glowing warm orange, log-cabin texture, chunky pixels,
1-pixel dark outline, limited palette of browns/oranges/black. No ground, no sky.
```

---

## Optional extras (nice-to-have, not required)

| File | Size | What |
|---|---|---|
| `keyboard-mech.png` | 512×256 | Mechanical keyboard top-down view for Type Race backdrop |
| `cloud.png` | 256×128 | Fluffy pixel cloud for light-mode parallax |
| `firefly.png` | 32×32 | Single glowing pixel firefly (we currently use a CSS dot) |
| `butterfly.png` | 64×48 | Orange pixel butterfly for light-mode streak reward |

---

## How the fallback works

`src/art/SpriteWithFallback.tsx` probes each filename with an `Image()` load. If the PNG exists, it renders. If it 404s, the SVG pixel-grid fallback renders instead. No build step, no manifest — just drop PNGs in `public/sprites/` and refresh.

Missing sprites = SVG fallback, which is already working art. You can ship ANY subset of this list.

## Recommended order

If you only have time for a few:

1. **`character-idle.png`, `character-thumbsup.png`, `character-facepalm.png`** — these are what players see most during Bug Hunt
2. **`tree-green-5.png`** — the fully-grown tree, shown on the Title and End-of-run screens
3. **`moon.png`, `sun.png`** — instant sky upgrade
4. **`cabin-dark.png`, `cabin-light.png`** — sets the atmospheric tone
5. Rest of tree stages (0–4) as you have time
6. Seasonal variants
