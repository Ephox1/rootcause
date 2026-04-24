# Root Cause

A browser-based debugging and typing-practice game for developers. Find bugs, grow trees, level up.

**Two modes.** _Find the Bug_ — multi-choice "what's wrong with this code?" with explanations.
_Type Mode_ — type real code idioms fast and accurately.

**Four languages.** JavaScript, TypeScript, Python, Dart — with dedicated "Vibe Coding" categories for AI-generated code pitfalls.

**One tree.** It grows as you nail correct answers. Leaves fall when you miss. Seasons change at streak 10/25/50.

Built per [`RootCause-Build-Plan.md`](../RootCause-Build-Plan.md). Dark-by-default with warm orange accents. 8-bit pixel-art scene (tree, character, parallax mountains, cabin, fireflies). Browser-only, no backend.

## Stack

| Layer | Choice |
|---|---|
| Build | Vite |
| Language | TypeScript (strict) |
| UI | React 18 |
| State | Zustand (with localStorage persistence) |
| Art | Hand-authored SVG pixel grids |
| Syntax | Bespoke token-based highlighter |
| Styling | CSS variables + inline styles |

Deliberately zero runtime deps beyond React + Zustand — no Tailwind, no Pixi, no Framer Motion, no Howler. All effects are CSS keyframes + SVG. Keeps the bundle at **~85 KB gzipped** and the surface area small.

## Running

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
npm run preview
```

## Project layout

```
src/
  art/            hand-drawn pixel-grid SVG art (Tree, Character, Logo, decor)
  components/     PixelButton, PixelPanel, SectionTag, GameHUD, icons
  content/        questions/*.json + typing/*.json (+ index.ts loader)
  scene/          Scene.tsx — parallax sky/mountains/hills + particles
  screens/        TitleScreen, BugHuntScreen, TypeRaceScreen, EndOfRunScreen, SettingsScreen, StatsScreen
  store/          useGameStore.ts — single Zustand store
  syntax/         highlight.ts + CodeBlock.tsx
  types.ts
  App.tsx, main.tsx, index.css
```

## Content

Each `content/questions/{lang}-{category}.json` is a plain JSON array of `Question` objects. Add questions by dropping entries in — no code changes.

See `content/README.md` for the schema and authoring guidelines.

## Accessibility

- Keyboard: `1–4` answers a Bug Hunt question, `Enter` continues, `Esc` exits.
- `prefers-reduced-motion` is honored (disables particle effects).
- Focus rings visible, no keyboard traps.
- All interactive elements have aria labels where non-textual.

## License

MIT.
