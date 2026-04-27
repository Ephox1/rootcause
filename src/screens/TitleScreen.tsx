import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { useGameStore } from '../store/useGameStore';
import type { Language } from '../types';

// The title screen is composed from individual layers (plain bg → character →
// ROOT CAUSE wordmark → button stack → live HUD → invisible sun/moon hit-zone)
// rather than one baked mockup. Each piece can be swapped without regenerating
// the whole screen.

const STAGE_RATIO = 16 / 9;

// Idle character on the title plays a coffee-sip sequence intermittently.
// Frames go forward to mug-at-lips and back, total ~2s. Idle gap is randomised
// so it doesn't feel mechanical.
const DRINK_FRAMES: readonly string[] = [
  'sprites/character/drink-1.png',
  'sprites/character/drink-2.png',
  'sprites/character/drink-3.png',
  'sprites/character/drink-4.png',
  'sprites/character/drink-5.png',
  'sprites/character/drink-4.png',
  'sprites/character/drink-3.png',
  'sprites/character/drink-2.png',
  'sprites/character/drink-1.png',
];
const IDLE_FRAME = 'sprites/character/idle.png';
const DRINK_FRAME_MS = 200;
const IDLE_GAP_MIN_MS = 22_000;
const IDLE_GAP_MAX_MS = 42_000;

function useTitleCharFrame(): string {
  const [src, setSrc] = useState(IDLE_FRAME);
  useEffect(() => {
    let cancelled = false;
    let timer: number | null = null;

    const playDrink = () => {
      let i = 0;
      const tick = () => {
        if (cancelled) return;
        setSrc(DRINK_FRAMES[i]);
        i += 1;
        if (i >= DRINK_FRAMES.length) {
          setSrc(IDLE_FRAME);
          schedule();
        } else {
          timer = window.setTimeout(tick, DRINK_FRAME_MS);
        }
      };
      tick();
    };

    const schedule = () => {
      const delay = IDLE_GAP_MIN_MS + Math.random() * (IDLE_GAP_MAX_MS - IDLE_GAP_MIN_MS);
      timer = window.setTimeout(playDrink, delay);
    };

    schedule();
    return () => {
      cancelled = true;
      if (timer !== null) window.clearTimeout(timer);
    };
  }, []);
  return src;
}

interface ButtonDef {
  key: 'bughunt' | 'typerace' | 'stats' | 'settings';
  label: string;
  asset: string;
}

const BUTTONS: readonly ButtonDef[] = [
  { key: 'bughunt',  label: 'Find the bug',     asset: 'bughunt'  },
  { key: 'typerace', label: 'Type mode',        asset: 'typerace' },
  { key: 'stats',    label: 'Stats and progress', asset: 'stats'    },
  { key: 'settings', label: 'Settings',         asset: 'settings' },
];

interface LanguageOption {
  value: Language;
  label: string;
}

// Order matches the Settings segmented picker.
const LANGUAGES: readonly LanguageOption[] = [
  { value: 'javascript', label: 'JS' },
  { value: 'typescript', label: 'TS' },
  { value: 'python',     label: 'PY' },
  { value: 'dart',       label: 'DART' },
];

function useStageSize(ratio: number): { w: number; h: number } {
  const [size, setSize] = useState(() => computeStageSize(ratio));
  useEffect(() => {
    const onResize = () => setSize(computeStageSize(ratio));
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [ratio]);
  return size;
}

function computeStageSize(ratio: number): { w: number; h: number } {
  if (typeof window === 'undefined') return { w: 0, h: 0 };
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const vpRatio = vw / vh;
  if (vpRatio > ratio) return { w: vw, h: vw / ratio };
  return { w: vh * ratio, h: vh };
}

export function TitleScreen(): JSX.Element {
  const theme = useGameStore((s) => s.theme);
  const streak = useGameStore((s) => s.streak);
  const score = useGameStore((s) => s.score);
  const level = useGameStore((s) => s.level);
  const xp = useGameStore((s) => s.xp);
  const startBugHunt = useGameStore((s) => s.startBugHunt);
  const startTypeRace = useGameStore((s) => s.startTypeRace);
  const setRoute = useGameStore((s) => s.setRoute);
  const updateSettings = useGameStore((s) => s.updateSettings);
  const language = useGameStore((s) => s.language);
  const { w: stageW, h: stageH } = useStageSize(STAGE_RATIO);
  const charSrc = useTitleCharFrame();

  const isDark = theme === 'dark';
  const bgSrc = isDark ? 'sprites/bg-night.png' : 'sprites/bg-day.png';
  const titleSrc = isDark ? 'sprites/title/title-dark.png' : 'sprites/title/title-light.png';
  const themeSuffix = isDark ? 'dark' : 'light';

  const handlers: Record<ButtonDef['key'], () => void> = {
    bughunt: startBugHunt,
    typerace: startTypeRace,
    stats: () => setRoute('stats'),
    settings: () => setRoute('settings'),
  };

  // Menu focus + keyboard nav. WASD and arrow keys both move the highlight;
  // Enter activates. Only WASD is advertised in the bottom HUD; arrows are a
  // courtesy alias.
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [focusedIndex, setFocusedIndex] = useState(0);

  useEffect(() => {
    const NAV_KEYS = new Set([
      'w', 'a', 's', 'd',
      'arrowup', 'arrowleft', 'arrowdown', 'arrowright',
      'enter',
    ]);
    const handler = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (!NAV_KEYS.has(key)) return;
      if (key === 'enter') {
        e.preventDefault();
        handlers[BUTTONS[focusedIndex].key]();
        return;
      }
      e.preventDefault();
      const dir = key === 'w' || key === 'a' || key === 'arrowup' || key === 'arrowleft' ? -1 : 1;
      setFocusedIndex((i) => (i + dir + BUTTONS.length) % BUTTONS.length);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusedIndex]);

  // Move actual DOM focus to the highlighted button so the existing
  // hover/focus visual swap kicks in.
  useEffect(() => {
    buttonRefs.current[focusedIndex]?.focus();
  }, [focusedIndex]);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        backgroundColor: isDark ? '#02040a' : '#7dc4e8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Stage layer — painted bg, character, sun/moon hit-zone. Cover-sized
          so the painted art fills the viewport; UI chrome lives outside the
          stage so it isn't cropped by the cover overflow. */}
      <div
        style={{
          position: 'relative',
          width: stageW,
          height: stageH,
          flexShrink: 0,
        }}
      >
        <img
          src={bgSrc}
          alt=""
          aria-hidden
          draggable={false}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            display: 'block',
            imageRendering: 'pixelated',
            userSelect: 'none',
            pointerEvents: 'none',
          }}
        />

        {/* Coder + desk in the lower-left, same anchor as in-game. Cycles
            into a coffee-sip animation every ~25-40 seconds. */}
        <img
          src={charSrc}
          alt=""
          aria-hidden
          draggable={false}
          style={{
            position: 'absolute',
            left: '45%',
            bottom: '-5%',
            width: '40%',
            transform: 'translateX(-85%)',
            imageRendering: 'pixelated',
            userSelect: 'none',
            pointerEvents: 'none',
          }}
        />

        {/* Invisible click zone over the painted sun/moon for theme toggle */}
        <button
          onClick={() => updateSettings({ theme: isDark ? 'light' : 'dark' })}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          style={{
            position: 'absolute',
            top: '3%',
            left: '87%',
            width: '11%',
            height: '15%',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
          }}
        />
      </div>

      {/* Chrome layer — viewport-anchored so title/buttons/HUD stay on screen
          at every aspect ratio. */}
      <div
        style={{
          position: 'absolute',
          top: '18%',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 5,
          width: 'min(50vw, 760px)',
          zIndex: 10,
        }}
      >
        <img
          src={titleSrc}
          alt="Root Cause"
          draggable={false}
          style={{
            width: '100%',
            display: 'block',
            imageRendering: 'pixelated',
            userSelect: 'none',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 5,
            width: '64%',
          }}
        >
          {/* Language picker — drives the question + snippet pools that
              Bug Hunt and Type Race pull from. */}
          <LanguagePicker
            value={language}
            isDark={isDark}
            onChange={(v) => updateSettings({ language: v })}
          />
          {BUTTONS.map((b, i) => (
            <TitleButton
              key={b.key}
              asset={b.asset}
              themeSuffix={themeSuffix}
              label={b.label}
              onClick={handlers[b.key]}
              buttonRef={(el) => { buttonRefs.current[i] = el; }}
            />
          ))}
        </div>
      </div>

      <HudOverlay
        isDark={isDark}
        streak={streak}
        score={score}
        level={level}
        xp={xp}
      />
    </div>
  );
}

interface LanguagePickerProps {
  value: Language;
  isDark: boolean;
  onChange: (lang: Language) => void;
}

function LanguagePicker({ value, isDark, onChange }: LanguagePickerProps): JSX.Element {
  const palette = isDark
    ? {
        chipBg: 'rgba(20, 16, 12, 0.78)',
        chipBorder: 'rgba(245, 220, 180, 0.32)',
        chipColor: 'rgba(245, 220, 180, 0.85)',
        activeBg: 'var(--accent)',
        activeBorder: 'var(--accent-bright)',
        activeColor: '#fff',
      }
    : {
        chipBg: 'rgba(255, 244, 218, 0.85)',
        chipBorder: 'rgba(176, 110, 60, 0.5)',
        chipColor: '#5a3b1a',
        activeBg: 'var(--accent)',
        activeBorder: 'var(--accent-bright)',
        activeColor: '#fff',
      };
  return (
    <div
      role="radiogroup"
      aria-label="Coding language"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 4,
      }}
    >
      {LANGUAGES.map((l) => {
        const active = l.value === value;
        return (
          <button
            key={l.value}
            role="radio"
            aria-checked={active}
            onClick={() => onChange(l.value)}
            style={{
              padding: '8px 4px',
              background: active ? palette.activeBg : palette.chipBg,
              border: `2px solid ${active ? palette.activeBorder : palette.chipBorder}`,
              color: active ? palette.activeColor : palette.chipColor,
              fontFamily: '"Press Start 2P", monospace',
              fontSize: 10,
              letterSpacing: '0.1em',
              cursor: 'pointer',
              boxShadow: active
                ? '0 0 0 2px rgba(255,140,66,0.25), 2px 2px 0 rgba(0,0,0,.4)'
                : '2px 2px 0 rgba(0,0,0,.35)',
              transition: 'background 80ms, transform 60ms',
            }}
          >
            {l.label}
          </button>
        );
      })}
    </div>
  );
}

interface TitleButtonProps {
  asset: string;
  themeSuffix: 'dark' | 'light';
  label: string;
  onClick: () => void;
  buttonRef?: (el: HTMLButtonElement | null) => void;
}

function TitleButton({ asset, themeSuffix, label, onClick, buttonRef }: TitleButtonProps): JSX.Element {
  const [hover, setHover] = useState(false);
  const variant = hover ? 'selected' : themeSuffix;
  const src = `sprites/title/btn-${asset}-${variant}.png`;
  return (
    <button
      ref={buttonRef}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      aria-label={label}
      style={{
        background: 'transparent',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        display: 'block',
        width: '100%',
      }}
    >
      <img
        src={src}
        alt={label}
        draggable={false}
        style={{
          display: 'block',
          width: '100%',
          height: 'auto',
          imageRendering: 'pixelated',
          userSelect: 'none',
        }}
      />
    </button>
  );
}

interface HudOverlayProps {
  isDark: boolean;
  streak: number;
  score: number;
  level: number;
  xp: number;
}

interface Palette {
  bg: string;
  border: string;
  labelColor: string;
  valueColor: string;
  flame: string;
  star: string;
  xpFilled: string;
  xpEmpty: string;
  chipBg: string;
  chipBorder: string;
}

function HudOverlay({ isDark, streak, score, level, xp }: HudOverlayProps): JSX.Element {
  const palette: Palette = isDark
    ? {
        bg: 'rgba(8, 12, 20, 0.96)',
        border: 'rgba(255, 140, 66, 0.45)',
        labelColor: 'rgba(245, 220, 180, 0.8)',
        valueColor: '#ffe1b8',
        flame: '#ff8c42',
        star: '#ffd26a',
        xpFilled: '#ff8c42',
        xpEmpty: 'rgba(120, 78, 40, 0.55)',
        chipBg: 'rgba(20, 16, 12, 0.9)',
        chipBorder: 'rgba(245, 220, 180, 0.35)',
      }
    : {
        bg: 'rgba(248, 232, 196, 0.97)',
        border: 'rgba(176, 110, 60, 0.6)',
        labelColor: 'rgba(80, 50, 24, 0.78)',
        valueColor: '#3a230f',
        flame: '#d94f04',
        star: '#d18a2a',
        xpFilled: '#d94f04',
        xpEmpty: 'rgba(176, 110, 60, 0.32)',
        chipBg: 'rgba(255, 244, 218, 0.88)',
        chipBorder: 'rgba(176, 110, 60, 0.45)',
      };

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '12%',
        background: palette.bg,
        borderTop: `2px solid ${palette.border}`,
        display: 'grid',
        gridTemplateColumns: 'auto 1fr auto',
        alignItems: 'center',
        gap: 24,
        padding: '0 24px',
      }}
    >
      <NavHint label="W A S D" caption="NAVIGATE" palette={palette} />
      <div style={{ display: 'flex', justifyContent: 'center', gap: 32, alignItems: 'center' }}>
        <StatCell label="STREAK" palette={palette}>
          <span style={{ fontVariantNumeric: 'tabular-nums' }}>{streak}</span>{' '}
          <FlameGlyph color={palette.flame} />
        </StatCell>
        <StatCell label="SCORE" palette={palette}>
          <span style={{ fontVariantNumeric: 'tabular-nums' }}>{score.toLocaleString()}</span>{' '}
          <StarGlyph color={palette.star} />
        </StatCell>
        <StatCell label="LEVEL" palette={palette}>
          <span style={{ fontVariantNumeric: 'tabular-nums' }}>{level}</span>
          <span style={{ marginLeft: 8, fontSize: 8, color: palette.labelColor, letterSpacing: '0.14em' }}>XP</span>
          <XpPips xp={xp} filled={palette.xpFilled} empty={palette.xpEmpty} />
        </StatCell>
      </div>
      <NavHint label="ENTER" caption="SELECT" palette={palette} />
    </div>
  );
}

interface StatCellProps {
  label: string;
  palette: Palette;
  children: ReactNode;
}

function StatCell({ label, palette, children }: StatCellProps): JSX.Element {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 8, color: palette.labelColor, letterSpacing: '0.14em' }}>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: '"Press Start 2P", monospace', fontSize: 14, color: palette.valueColor }}>
        {children}
      </div>
    </div>
  );
}

interface NavHintProps {
  label: string;
  caption: string;
  palette: Palette;
}

function NavHint({ label, caption, palette }: NavHintProps): JSX.Element {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ padding: '5px 9px', background: palette.chipBg, border: `2px solid ${palette.chipBorder}`, color: palette.valueColor, fontFamily: '"Press Start 2P", monospace', fontSize: 9, letterSpacing: '0.15em' }}>
        {label}
      </span>
      <span style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 8, color: palette.labelColor, letterSpacing: '0.15em' }}>
        {caption}
      </span>
    </div>
  );
}

interface XpPipsProps {
  xp: number;
  filled: string;
  empty: string;
}

function XpPips({ xp, filled, empty }: XpPipsProps): JSX.Element {
  const pips = 10;
  const filledCount = Math.round((xp / 100) * pips);
  return (
    <div style={{ display: 'flex', gap: 2, marginLeft: 10 }}>
      {Array.from({ length: pips }).map((_, i) => (
        <div
          key={i}
          style={{
            width: 10,
            height: 10,
            background: i < filledCount ? filled : empty,
            border: `1px solid ${i < filledCount ? filled : empty}`,
          }}
        />
      ))}
    </div>
  );
}

interface GlyphProps {
  color: string;
  style?: CSSProperties;
}

function FlameGlyph({ color, style }: GlyphProps): JSX.Element {
  return (
    <svg viewBox="0 0 10 10" width={14} height={14} style={{ shapeRendering: 'crispEdges', ...style }}>
      <rect x="4" y="0" width="2" height="1" fill={color} />
      <rect x="3" y="1" width="4" height="1" fill={color} />
      <rect x="2" y="2" width="6" height="3" fill={color} />
      <rect x="1" y="5" width="8" height="2" fill={color} />
      <rect x="2" y="7" width="6" height="1" fill={color} />
      <rect x="3" y="8" width="4" height="1" fill={color} />
    </svg>
  );
}

function StarGlyph({ color, style }: GlyphProps): JSX.Element {
  return (
    <svg viewBox="0 0 10 10" width={14} height={14} style={{ shapeRendering: 'crispEdges', ...style }}>
      <rect x="4" y="0" width="2" height="2" fill={color} />
      <rect x="3" y="2" width="4" height="1" fill={color} />
      <rect x="0" y="3" width="10" height="2" fill={color} />
      <rect x="1" y="5" width="8" height="1" fill={color} />
      <rect x="2" y="6" width="6" height="1" fill={color} />
      <rect x="1" y="7" width="3" height="2" fill={color} />
      <rect x="6" y="7" width="3" height="2" fill={color} />
      <rect x="0" y="9" width="3" height="1" fill={color} />
      <rect x="7" y="9" width="3" height="1" fill={color} />
    </svg>
  );
}
