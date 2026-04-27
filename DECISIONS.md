# Decisions

Running log of engineering trade-offs and the reasoning behind them.

## No Pixi.js - scene is pure SVG + CSS

The build plan proposes Pixi.js for the scene. We shipped without it.

**Why:** The scene needs 6 tree stages × 4 seasonal variants, a character with 5 animation states, and light particle effects (leaves, sparkles, bugs, fireflies). That's well within SVG + CSS keyframes, and it avoids shipping a 400 KB runtime for effects that run at a handful of frames per second. Bundle stayed at ~85 KB gzipped instead of ~500 KB.

**When we'd reconsider:** If we add genuine real-time effects (live typing particles per keystroke, 60fps parallax with dozens of moving sprites, WebGL shaders), Pixi becomes the right tool. Until then, DOM wins on simplicity and observability.

## Bespoke syntax highlighter instead of shiki

The plan suggests shiki (with a prismjs fallback if the bundle exceeds 500 KB).

**Why:** shiki ships WASM and the full VS Code grammar set - too heavy for ~10 tokens-per-snippet highlighting of four languages. We wrote a ~200-line token-based highlighter (`src/syntax/highlight.ts`) that handles keywords, strings, numbers, comments, types, and function calls well enough for the questions we author. It's language-agnostic and adding a new language is ~10 lines.

**Trade-off:** Our highlighter doesn't nest (template-string-inside-string, regex literals, JSX). Acceptable for question snippets; we'd swap to shiki if the content ever needed full fidelity.

## Hand-drawn pixel grids for art (no sprite sheets)

Tree stages and the character are authored as character-grid strings (`src/art/treeStages.ts`) rendered through `PixelGrid.tsx`. No PNGs, no Piskel, no Aseprite.

**Why:** The reference aesthetic is chunky 8-bit pixel art at 48×48 resolution. At that size, hand-typing `2345432` for a leaf cluster is faster than drawing it in a sprite editor, and edits are version-controlled plain text. The grid approach also lets us swap palettes at runtime (seasonal variants cost zero additional art).

**Trade-off:** Adding more nuanced shading requires expanding the palette key. If we ever grow past ~10 palette entries per sprite it'll stop scaling.

## Zustand with a persist partialize

All settings and lifetime stats persist; run-in-progress state does not.

**Why:** Someone mid-run who closes the tab shouldn't return to a half-answered question - that's worse UX than starting fresh. But their language/category/difficulty/theme/volume settings should survive.

## Questions and snippets as plain JSON

`content/questions/{lang}-{category}.json` and `content/typing/{lang}.json` are imported directly by the bundler.

**Why:** The plan's "question bank extends by editing one JSON file" criterion. Anyone who doesn't know React can add questions. A future CI lint step can validate against the schema.

## Routing via a single `route` enum in the store

No `react-router-dom`.

**Why:** Six screens, all full-bleed, no back button, no deep-linking requirement. A `Route = 'title' | 'bughunt' | ...` field in Zustand beats pulling in a router. If/when we add shareable URLs, we revisit.
