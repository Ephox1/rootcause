import { useEffect, useState } from 'react';
import { Scene } from '../scene/Scene';
import { SectionTag } from '../components/SectionTag';
import { PixelButton } from '../components/PixelButton';
import { BackIcon, KeyboardIcon } from '../components/icons';
import { useGameStore } from '../store/useGameStore';
import { sfxKeypress } from '../audio/sfx';

interface WrongChar {
  char: string;
  key: number;
}

export function TypeRaceScreen() {
  const state = useGameStore();
  const snippet = state.typeRaceSnippets[state.typeRaceIndex];

  const [input, setInput] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [pressedKey, setPressedKey] = useState<string | null>(null);
  const [wrongKey, setWrongKey] = useState<boolean>(false);
  const [errors, setErrors] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [finalWPM, setFinalWPM] = useState(0);
  const [wrongChar, setWrongChar] = useState<WrongChar | null>(null);

  useEffect(() => {
    setInput('');
    setStartTime(null);
    setWrongKey(false);
    setErrors(0);
    setCompleted(false);
    setFinalWPM(0);
    setWrongChar(null);
  }, [state.typeRaceIndex, snippet]);

  if (!snippet) {
    return (
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <p style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 12, color: 'var(--text-dim)' }}>
          No snippets available for this language.
        </p>
        <PixelButton onClick={() => state.goHome()} icon={<BackIcon />} fullWidth={false}>
          BACK HOME
        </PixelButton>
      </div>
    );
  }

  // Intermittent coffee-sip animation gets faster each snippet - slow chill
  // on snippet 1 (~22s between sips) ramping to comically fast on the last
  // snippet (~3s). Recomputes whenever the index advances.
  const drinkProgress =
    state.typeRaceSnippets.length > 0
      ? (state.typeRaceIndex + 1) / state.typeRaceSnippets.length
      : 0;
  const drinkIntervalMs = Math.round(22000 - drinkProgress * 19000);

  const target = snippet.code;
  const correctChars = input.split('').reduce((n, ch, i) => (ch === target[i] ? n + 1 : n), 0);
  const accuracy = input.length === 0 ? 100 : Math.round((correctChars / input.length) * 100);
  const elapsedMinutes =
    startTime === null ? 0 : Math.max(0.016, (Date.now() - startTime) / 1000 / 60);
  // Raw WPM - counts every typed char regardless of correctness. Speed and
  // accuracy are independent: fast-with-errors gets a high WPM and low
  // accuracy. Errors counter carries the mistake count separately.
  const wpm =
    elapsedMinutes === 0 ? 0 : Math.round(input.length / 5 / elapsedMinutes);

  // Snippet is "done" once the input fills the target length, regardless of
  // whether every char matches. Accuracy and error count carry the quality
  // signal, and the user can backspace to fix mistakes before the last char
  // lands. Once it lands, the complete-modal locks in the result.
  const done = input.length >= target.length;

  // Capture the final WPM at the moment of completion (so the displayed
  // value freezes instead of ticking down while the modal is open). Same
  // raw-WPM math as the live readout.
  useEffect(() => {
    if (done && startTime !== null && !completed) {
      const wpmFinal = Math.round(
        input.length / 5 / Math.max(0.016, (Date.now() - startTime) / 60000),
      );
      setFinalWPM(wpmFinal);
      setCompleted(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done, startTime, completed]);

  // Single global keydown handler - eliminates focus-loss bugs from the old
  // hidden-input approach. Backspace deletes, Enter advances on completion,
  // Esc exits, printable keys append (when not at the end of the snippet).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        state.goHome();
        return;
      }
      if (completed) {
        if (e.key === 'Enter') {
          e.preventDefault();
          state.completeSnippet({ wpm: finalWPM, accuracy, snippetId: snippet.id });
        }
        return;
      }

      if (e.key === 'Backspace') {
        e.preventDefault();
        setInput((curr) => curr.slice(0, -1));
        return;
      }

      // Ignore modifier-only and non-printable keys.
      if (e.key.length !== 1) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      const ch = e.key;
      if (input.length >= target.length) return;
      e.preventDefault();

      const expected = target[input.length];
      if (ch !== expected) {
        setWrongKey(true);
        setTimeout(() => setWrongKey(false), 160);
        setErrors((n) => n + 1);
        setWrongChar({ char: ch, key: Date.now() });
        window.setTimeout(() => {
          setWrongChar((prev) => (prev && prev.char === ch ? null : prev));
        }, 700);
      }

      setPressedKey(ch);
      setTimeout(() => setPressedKey(null), 140);
      if (state.sfx) sfxKeypress();

      if (startTime === null) setStartTime(Date.now());
      setInput(input + ch);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [state, completed, finalWPM, accuracy, snippet, target, input, startTime]);

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
      <div style={{ position: 'absolute', inset: 0 }}>
        <Scene
          stage={state.visualStage || 3}
          variant={state.treeVariant}
          theme={state.theme}
          streak={state.streak}
          difficulty={state.difficulty}
          reducedMotion={state.reducedMotion}
          showCharacter
          compact
          drinkIntervalMs={drinkIntervalMs}
        />
      </div>

      <div style={{ position: 'relative', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <button
          onClick={() => state.goHome()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 12px',
            background: 'var(--bg-panel)',
            border: '2px solid var(--border)',
            color: 'var(--text)',
            fontFamily: '"Press Start 2P", monospace',
            fontSize: 9,
            cursor: 'pointer',
            letterSpacing: '0.05em',
            boxShadow: '2px 2px 0 rgba(0,0,0,.4)',
          }}
        >
          <BackIcon size={10} />
          EXIT
        </button>
        <SectionTag num="3" label="TYPE MODE" />
      </div>

      <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', gap: 14, padding: '0 16px 20px', justifyContent: 'center', alignItems: 'center' }}>
        {/* Stats row - grid auto-fits so 4 tiles fit on a normal screen but
            collapse to 2 columns on narrow viewports. */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: 10,
            width: '100%',
            maxWidth: 900,
          }}
        >
          <StatTile label="WPM" value={wpm} tint="var(--accent)" />
          <StatTile label="ACCURACY" value={`${accuracy}%`} tint={accuracy >= 95 ? 'var(--success)' : accuracy >= 80 ? 'var(--accent)' : 'var(--danger)'} />
          <StatTile label="ERRORS" value={errors} tint={errors === 0 ? 'var(--success)' : 'var(--danger)'} />
          <StatTile label="PROGRESS" value={`${state.typeRaceIndex + 1} / ${state.typeRaceSnippets.length}`} />
        </div>

        {/* Target panel - what to type. Characters colour as user types. */}
        <TypingPanel label={snippet.description}>
          {target.split('').map((ch, i) => {
            const typed = input[i];
            let color = 'var(--text-dim)';
            let bg = 'transparent';
            if (typed != null) {
              if (typed === ch) color = 'var(--success)';
              else {
                color = 'var(--danger)';
                bg = 'rgba(248, 81, 73, 0.25)';
              }
            }
            const isCursor = i === input.length;
            return (
              <span
                key={i}
                style={{
                  color,
                  background: bg,
                  position: 'relative',
                }}
              >
                {isCursor && (
                  <span
                    aria-hidden
                    style={{
                      position: 'absolute',
                      left: -1,
                      top: 0,
                      bottom: 0,
                      width: 2,
                      background: 'var(--accent)',
                      animation: 'rc-cursor 1s steps(2) infinite',
                      pointerEvents: 'none',
                    }}
                  />
                )}
                {ch === ' ' && typed !== undefined && typed !== ' ' ? '·' : ch}
              </span>
            );
          })}
        </TypingPanel>

        {/* Input mirror - same size box, shows user's typed chars only. */}
        <TypingPanel label="YOUR INPUT" tone="input">
          {input.length === 0 && (
            <span style={{ color: 'var(--text-dim)', opacity: 0.6 }}>
              Start typing…
            </span>
          )}
          {input.split('').map((ch, i) => {
            const expected = target[i];
            const correct = ch === expected;
            return (
              <span
                key={i}
                style={{
                  color: correct ? 'var(--success)' : 'var(--danger)',
                  background: correct ? 'transparent' : 'rgba(248, 81, 73, 0.25)',
                }}
              >
                {ch === ' ' ? (correct ? ' ' : '·') : ch}
              </span>
            );
          })}
          {!completed && (
            <span
              style={{
                borderLeft: '2px solid var(--accent)',
                animation: 'rc-cursor 1s steps(2) infinite',
                paddingLeft: 1,
              }}
            >&nbsp;</span>
          )}
        </TypingPanel>


        {/* Pixel keyboard */}
        <PixelKeyboard pressed={pressedKey} wrong={wrongKey} />

        {/* Floating "✗ {char}" indicator above the typing area on each
            wrong key press. Re-mounts (via key) so the animation replays. */}
        {wrongChar && (
          <div
            key={wrongChar.key}
            aria-hidden
            style={{
              position: 'absolute',
              top: '32%',
              left: '50%',
              transform: 'translateX(-50%)',
              fontFamily: '"Press Start 2P", monospace',
              fontSize: 28,
              color: 'var(--danger)',
              textShadow: '3px 3px 0 rgba(0,0,0,.6)',
              animation: 'rc-wrongchar 700ms ease-out forwards',
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            ✗ {wrongChar.char === ' ' ? '␣' : wrongChar.char}
          </div>
        )}
      </div>

      {completed && (
        <SnippetCompleteModal
          wpm={finalWPM}
          accuracy={accuracy}
          errors={errors}
          onContinue={() =>
            state.completeSnippet({ wpm: finalWPM, accuracy, snippetId: snippet.id })
          }
        />
      )}

      {state.crt && <div aria-hidden className="crt-overlay" />}
    </div>
  );
}

interface SnippetCompleteModalProps {
  wpm: number;
  accuracy: number;
  errors: number;
  onContinue: () => void;
}

function SnippetCompleteModal({ wpm, accuracy, errors, onContinue }: SnippetCompleteModalProps) {
  const clean = errors === 0 && accuracy === 100;
  const accent = clean ? 'var(--success)' : 'var(--accent)';
  const accentBright = clean ? '#2d9638' : 'var(--accent-bright)';
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Snippet complete"
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '8% 20px 20px',
        background: 'rgba(0, 0, 0, 0.55)',
        zIndex: 200,
        animation: 'rc-fadein 200ms ease-out',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 540,
          background: 'var(--bg-panel)',
          border: `3px solid ${accentBright}`,
          boxShadow: '6px 6px 0 rgba(0,0,0,.5)',
          padding: '20px 22px',
        }}
      >
        <h3
          style={{
            margin: 0,
            fontFamily: '"Press Start 2P", monospace',
            fontSize: 14,
            color: accent,
            letterSpacing: '0.1em',
            marginBottom: 14,
          }}
        >
          {clean ? 'CLEAN RUN' : 'SNIPPET COMPLETE'}
        </h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 10,
            marginBottom: 16,
          }}
        >
          <ModalStat label="WPM" value={wpm} tint="var(--accent)" />
          <ModalStat
            label="ACCURACY"
            value={`${accuracy}%`}
            tint={accuracy >= 95 ? 'var(--success)' : 'var(--accent)'}
          />
          <ModalStat
            label="ERRORS"
            value={errors}
            tint={errors === 0 ? 'var(--success)' : 'var(--danger)'}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <PixelButton
            variant={clean ? 'success' : 'primary'}
            onClick={onContinue}
            fullWidth={false}
            align="center"
            style={{ minWidth: 180 }}
          >
            CONTINUE ⏎
          </PixelButton>
        </div>
      </div>
    </div>
  );
}

interface ModalStatProps {
  label: string;
  value: string | number;
  tint?: string;
}

function ModalStat({ label, value, tint }: ModalStatProps) {
  return (
    <div
      style={{
        padding: '12px 10px',
        background: 'var(--bg-elevated)',
        border: '2px solid var(--border)',
        boxShadow: '3px 3px 0 rgba(0,0,0,.4)',
      }}
    >
      <div
        style={{
          fontFamily: '"Press Start 2P", monospace',
          fontSize: 8,
          color: 'var(--text-dim)',
          letterSpacing: '0.12em',
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: '"Press Start 2P", monospace',
          fontSize: 18,
          color: tint ?? 'var(--text)',
        }}
      >
        {value}
      </div>
    </div>
  );
}

interface TypingPanelProps {
  label: string;
  tone?: 'target' | 'input';
  children: React.ReactNode;
}

function TypingPanel({ label, tone = 'target', children }: TypingPanelProps) {
  const accent = tone === 'input' ? 'var(--success)' : 'var(--accent)';
  return (
    <div
      style={{
        width: '100%',
        maxWidth: 900,
        background: 'var(--bg-panel)',
        border: '3px solid var(--border)',
        boxShadow: '5px 5px 0 rgba(0,0,0,.5)',
        padding: '14px 22px',
        minHeight: 110,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontFamily: '"Press Start 2P", monospace',
          fontSize: 9,
          color: 'var(--text-dim)',
          letterSpacing: '0.12em',
          marginBottom: 8,
        }}
      >
        <KeyboardIcon size={10} color={accent} />
        {label.toUpperCase()}
      </div>
      <div
        style={{
          fontFamily: '"VT323", "JetBrains Mono", monospace',
          fontSize: 26,
          lineHeight: 1.35,
          wordBreak: 'break-word',
          whiteSpace: 'pre-wrap',
          color: 'var(--text-dim)',
          padding: '4px 0',
          minHeight: 60,
        }}
      >
        {children}
      </div>
    </div>
  );
}

interface StatTileProps {
  label: string;
  value: string | number;
  tint?: string;
}

function StatTile({ label, value, tint }: StatTileProps) {
  return (
    <div
      style={{
        flex: 1,
        padding: '12px 18px',
        background: 'var(--bg-panel)',
        border: '2px solid var(--border)',
        boxShadow: '3px 3px 0 rgba(0,0,0,.4)',
      }}
    >
      <div
        style={{
          fontFamily: '"Press Start 2P", monospace',
          fontSize: 9,
          color: 'var(--text-dim)',
          letterSpacing: '0.12em',
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: '"Press Start 2P", monospace',
          fontSize: 20,
          color: tint ?? 'var(--text)',
        }}
      >
        {value}
      </div>
    </div>
  );
}

// Full QWERTY layout. Each entry has a `key` (canonical lowercase form used
// to match keypresses), a `label` shown on the cap, an optional `shifted`
// label for the shift-layer character, and a `width` multiplier (1 = standard
// 32px cap; modifiers and space use larger widths). `system: true` means the
// cap doesn't correspond to a typeable character (Shift, Ctrl, etc.) and
// won't light up from the input stream.
interface KeyDef {
  key: string;
  label: string;
  shifted?: string;
  width?: number;
  system?: boolean;
}

const KB_LAYOUT: readonly (readonly KeyDef[])[] = [
  [
    { key: '`', label: '`', shifted: '~' },
    { key: '1', label: '1', shifted: '!' },
    { key: '2', label: '2', shifted: '@' },
    { key: '3', label: '3', shifted: '#' },
    { key: '4', label: '4', shifted: '$' },
    { key: '5', label: '5', shifted: '%' },
    { key: '6', label: '6', shifted: '^' },
    { key: '7', label: '7', shifted: '&' },
    { key: '8', label: '8', shifted: '*' },
    { key: '9', label: '9', shifted: '(' },
    { key: '0', label: '0', shifted: ')' },
    { key: '-', label: '-', shifted: '_' },
    { key: '=', label: '=', shifted: '+' },
    { key: 'Backspace', label: '⌫', width: 1.8, system: true },
  ],
  [
    { key: 'Tab', label: 'Tab', width: 1.5, system: true },
    { key: 'q', label: 'Q' },
    { key: 'w', label: 'W' },
    { key: 'e', label: 'E' },
    { key: 'r', label: 'R' },
    { key: 't', label: 'T' },
    { key: 'y', label: 'Y' },
    { key: 'u', label: 'U' },
    { key: 'i', label: 'I' },
    { key: 'o', label: 'O' },
    { key: 'p', label: 'P' },
    { key: '[', label: '[', shifted: '{' },
    { key: ']', label: ']', shifted: '}' },
    { key: '\\', label: '\\', shifted: '|', width: 1.3 },
  ],
  [
    { key: 'CapsLock', label: 'Caps', width: 1.8, system: true },
    { key: 'a', label: 'A' },
    { key: 's', label: 'S' },
    { key: 'd', label: 'D' },
    { key: 'f', label: 'F' },
    { key: 'g', label: 'G' },
    { key: 'h', label: 'H' },
    { key: 'j', label: 'J' },
    { key: 'k', label: 'K' },
    { key: 'l', label: 'L' },
    { key: ';', label: ';', shifted: ':' },
    { key: "'", label: "'", shifted: '"' },
    { key: 'Enter', label: '⏎', width: 2.0, system: true },
  ],
  [
    { key: 'Shift', label: 'Shift', width: 2.3, system: true },
    { key: 'z', label: 'Z' },
    { key: 'x', label: 'X' },
    { key: 'c', label: 'C' },
    { key: 'v', label: 'V' },
    { key: 'b', label: 'B' },
    { key: 'n', label: 'N' },
    { key: 'm', label: 'M' },
    { key: ',', label: ',', shifted: '<' },
    { key: '.', label: '.', shifted: '>' },
    { key: '/', label: '/', shifted: '?' },
    { key: 'ShiftR', label: 'Shift', width: 2.3, system: true },
  ],
  [
    { key: 'Ctrl', label: 'Ctrl', width: 1.5, system: true },
    { key: 'Alt', label: 'Alt', width: 1.3, system: true },
    { key: ' ', label: '', width: 7.5 },
    { key: 'AltR', label: 'Alt', width: 1.3, system: true },
    { key: 'CtrlR', label: 'Ctrl', width: 1.5, system: true },
  ],
];

// Reverse-lookup: typed char (whether shifted or base) → key + isShifted
const SHIFTED_TO_BASE: Record<string, string> = (() => {
  const out: Record<string, string> = {};
  for (const row of KB_LAYOUT) {
    for (const k of row) {
      if (k.shifted) out[k.shifted] = k.key;
    }
  }
  return out;
})();

interface KbProps {
  pressed: string | null;
  wrong: boolean;
}

function PixelKeyboard({ pressed, wrong }: KbProps) {
  // Determine which key(s) light up based on the latest typed char.
  let activeKey: string | null = null;
  let shiftActive = false;
  if (pressed) {
    const lower = pressed.toLowerCase();
    if (pressed >= 'A' && pressed <= 'Z') {
      // Uppercase letter - light up the letter cap and Shift.
      activeKey = lower;
      shiftActive = true;
    } else if (SHIFTED_TO_BASE[pressed]) {
      activeKey = SHIFTED_TO_BASE[pressed];
      shiftActive = true;
    } else {
      activeKey = pressed;
    }
  }

  // Cap size and gap are CSS clamp()s tied to viewport width: 30px on
  // desktop, scaling down to 14px on very narrow screens so the full keyboard
  // never overflows. All width/font-size math goes through calc(var(--cap)).
  return (
    <div
      style={
        {
          ['--kb-cap' as string]: 'clamp(14px, 3.6vw, 30px)',
          ['--kb-gap' as string]: 'clamp(2px, 0.5vw, 5px)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--kb-gap)',
          padding: '10px 12px',
          background: '#0a0e14',
          border: '3px solid #1a1f28',
          boxShadow: '5px 5px 0 rgba(0,0,0,.5), inset 2px 2px 0 rgba(255,255,255,.04)',
          borderRadius: 4,
          maxWidth: '100%',
        } as React.CSSProperties
      }
    >
      {KB_LAYOUT.map((row, ri) => (
        <div key={ri} style={{ display: 'flex', gap: 'var(--kb-gap)', justifyContent: 'center' }}>
          {row.map((k, ki) => {
            const isShiftKey = k.key === 'Shift' || k.key === 'ShiftR';
            const isActive =
              (k.key === activeKey) || (isShiftKey && shiftActive);
            const w = k.width ?? 1;
            return (
              <div
                key={`${ri}-${ki}-${k.key}`}
                style={{
                  width: `calc(var(--kb-cap) * ${w} + var(--kb-gap) * ${w - 1})`,
                  height: 'var(--kb-cap)',
                  background: isActive
                    ? wrong
                      ? 'var(--danger)'
                      : 'var(--accent)'
                    : k.system
                      ? '#1a1f28'
                      : '#2a303a',
                  border: `2px solid ${
                    isActive ? (wrong ? '#cf222e' : 'var(--accent-bright)') : '#454a55'
                  }`,
                  color: isActive ? '#fff' : k.system ? '#7a8290' : '#c9d1d9',
                  fontFamily: '"Press Start 2P", monospace',
                  fontSize: `calc(var(--kb-cap) * ${k.system ? 0.27 : 0.34})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: isActive
                    ? 'inset 2px 2px 0 rgba(0,0,0,.3)'
                    : '1px 1px 0 rgba(0,0,0,.5)',
                  transform: isActive ? 'translate(1px, 1px)' : 'none',
                  transition: 'background 40ms, transform 40ms',
                }}
              >
                {k.label}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
