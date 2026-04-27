# Root Cause

**[▶ Play it live at ephox1.github.io/RootCause](https://ephox1.github.io/RootCause/)**

![Root Cause title screen](docs/screenshots/title-night.png)

A browser-based debugging and typing-practice game for developers.
Spot the bug, race through real code, grow your tree.

**Two modes.**

| Find the Bug | Type Race |
|:---:|:---:|
| ![Find the Bug screen with explanation modal](docs/screenshots/bughunt.png) | ![Type Race screen with full pixel keyboard](docs/screenshots/typerace.png) |
| Multi-choice "what's wrong with this code?" with explanations. | Type real code idioms with live WPM, accuracy, and an error counter. |

**Four languages.** JavaScript, TypeScript, Python, Dart - each with a "general bugs" pool and a "vibe code" pool of AI-generated pitfalls (hallucinated APIs, plausible-but-wrong logic, outdated syntax).

**One tree.** Fifteen hand-painted growth stages from seed to apple tree. A perfect run reaches full bloom at every difficulty - easy = 5 questions, medium = 10, hard = 15.

**Browser-only.** No backend, no accounts, no analytics. State persists to localStorage.

## Stack

| Layer | Choice |
|---|---|
| Build | Vite |
| Language | TypeScript (strict) |
| UI | React 18 |
| State | Zustand with `persist` |
| Audio | One `HTMLAudioElement` for music tracks + a tiny chiptune synth for ambient SFX |
| Art | Hand-painted PNGs (cropped via Pillow scripts) over a fixed 16:9 stage |
| Syntax | Bespoke ~200-line token highlighter |
| Styling | CSS variables + inline styles, plus a handful of `@keyframes` |

Deliberately zero runtime deps beyond React + Zustand - no Tailwind, no Pixi, no Howler, no router. Bundle weighs **~87 KB gzipped**.

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
  art/             Tree (PNG + transparent fallback), CharacterAnim (state-driven frame cycling), decor (SVG Bug + Leaf), palettes
  audio/           ChiptuneEngine (NES-style synth for SFX), musicPlayer (single-element MP3 player), sfx, useAudio (route → track + SFX router)
  components/      PixelButton, PixelPanel, GameHUD, FloatingThemeToggle, icons, SectionTag
  content/         questions/{lang}-{category}.json + typing/{lang}.json + index.ts (loader, shuffler)
  scene/           Scene.tsx - cover-sized 16:9 stage with bg, character, tree, particles
  screens/         TitleScreen, BugHuntScreen, TypeRaceScreen, EndOfRunScreen, SettingsScreen, StatsScreen
  store/           useGameStore.ts - single Zustand store with localStorage persistence
  syntax/          highlight.ts + CodeBlock.tsx
  types.ts
  App.tsx, main.tsx, index.css
public/
  sprites/         Painted backgrounds, character frames, button assets, tree stages
  audio/           Music and SFX MP3s
scripts/
  fix_transparency.py  Pillow flood-fill for stripping opaque white from AI-generated PNGs
```

## Authoring content

Each `src/content/questions/{lang}-{category}.json` is a plain array of `Question` objects - drop entries in to extend a bank, no code changes needed. Choice order is randomized at pick time, so you can author with the correct answer at any position. See [`src/content/README.md`](src/content/README.md) for the schema.

Per-run picks guarantee no question repeats unless the pool is smaller than the run length, in which case repeats are spread out (never adjacent).

Typing snippets live in `src/content/typing/{lang}.json`. Each is a short, realistic code idiom under 150 chars.

## Asset pipeline

Painted art is generated in batches and dropped under `public/sprites/`:

- **Tree stages** - `tree-green-{0..14}.png`, square 1024×1024, transparent bg.
- **Character frames** - `character/{idle,thumbsup-1..3,wrong-1..5,streak,drink-1..5}.png`, ~450×450.
- **Title buttons** - 4 modes × 3 states (`light`, `dark`, `selected`) at `title/btn-{mode}-{state}.png`.
- **Backgrounds** - `bg-day.png` and `bg-night.png` at 16:9.

When fresh button or title PNGs land at the source 720×120 size, run the auto-crop helper:

```bash
python -c "
from PIL import Image, glob, os
folder = 'public/sprites/title'
for f in sorted(glob.glob(os.path.join(folder, 'btn-*.png'))):
    im = Image.open(f).convert('RGBA')
    bbox = im.split()[3].getbbox()
    if bbox: im.crop(bbox).save(f)
"
```

This crops each PNG to its alpha bounds so the visible button content centers cleanly when rendered.

## Audio

- **Music tracks** are MP3s under `public/audio/music-*.mp3`. Always go through one shared `<audio>` element so two tracks can never play simultaneously.
- **SFX** are split: real-recording MP3s for the high-impact moments (correct, wrong, streak 4 / 5 / 15, leaf-fall, tree-grow, fail) plus four chiptune blips for ambient texture (bug crawl, bug scatter, bug squash, keypress click).
- Music defaults **off** and unlocks on first user interaction (browser autoplay rules). Toggle in Settings.
- The two systems are independent - SFX overlap with music and each other freely; only music has the single-element guard.

## Accessibility

- **Title menu**: WASD or arrow keys move focus, Enter activates.
- **Bug Hunt**: keys `1`–`4` answer, `Enter` continues from the explanation modal, `Esc` exits.
- **Type Race**: full-keyboard input with backspace correction; `Enter` advances after a snippet; `Esc` exits.
- `prefers-reduced-motion` is honored - disables falling-leaf particles, fireflies, and the streak fire above the tree.
- All buttons and toggles have ARIA labels; the language picker is a real `radiogroup`.
- Focus rings are visible by default and never trapped.

## Settings

Theme (dark/light), music + SFX volume + mute, CRT scanlines (off by default), language, difficulty, category, and a reduced-motion toggle. RESET wipes lifetime stats / score / streak / level / XP after a Yes-No confirmation; theme + audio + language preferences are preserved.

## License

MIT.
