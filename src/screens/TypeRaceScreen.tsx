import { useEffect, useRef, useState } from 'react';
import { Scene } from '../scene/Scene';
import { SectionTag } from '../components/SectionTag';
import { PixelButton } from '../components/PixelButton';
import { BackIcon, KeyboardIcon } from '../components/icons';
import { useGameStore } from '../store/useGameStore';
import { sfxKeypress } from '../audio/sfx';

export function TypeRaceScreen() {
  const state = useGameStore();
  const snippet = state.typeRaceSnippets[state.typeRaceIndex];

  const [input, setInput] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [pressedKey, setPressedKey] = useState<string | null>(null);
  const [wrongKey, setWrongKey] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInput('');
    setStartTime(null);
    setWrongKey(false);
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, [state.typeRaceIndex, snippet]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') state.goHome();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [state]);

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

  const target = snippet.code;
  const correctChars = input.split('').reduce((n, ch, i) => (ch === target[i] ? n + 1 : n), 0);
  const accuracy = input.length === 0 ? 100 : Math.round((correctChars / input.length) * 100);
  const elapsedMinutes =
    startTime === null ? 0 : Math.max(0.016, (Date.now() - startTime) / 1000 / 60);
  const wpm =
    elapsedMinutes === 0 ? 0 : Math.round(correctChars / 5 / elapsedMinutes);

  const done = input === target;

  useEffect(() => {
    if (done && startTime !== null) {
      const finalWPM = Math.round(correctChars / 5 / Math.max(0.016, (Date.now() - startTime) / 60000));
      state.completeSnippet({
        wpm: finalWPM,
        accuracy,
        snippetId: snippet.id,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    if (v.length > target.length) return;
    if (startTime === null && v.length > 0) setStartTime(Date.now());

    const lastCh = v[v.length - 1];
    const expected = target[v.length - 1];
    if (v.length > input.length && lastCh !== expected) {
      setWrongKey(true);
      setTimeout(() => setWrongKey(false), 160);
    }
    if (lastCh && v.length > input.length) {
      setPressedKey(lastCh);
      setTimeout(() => setPressedKey(null), 140);
      if (state.sfx) sfxKeypress();
    }
    setInput(v);
  };

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
        />
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background: state.theme === 'dark' ? 'rgba(5, 8, 16, 0.55)' : 'rgba(254, 248, 240, 0.45)',
          }}
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

      <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', gap: 18, padding: '0 24px 20px', justifyContent: 'center', alignItems: 'center' }}>
        {/* Stats row */}
        <div style={{ display: 'flex', gap: 14, width: '100%', maxWidth: 900, justifyContent: 'center' }}>
          <StatTile label="WPM" value={wpm} tint="var(--accent)" />
          <StatTile label="ACCURACY" value={`${accuracy}%`} tint={accuracy >= 95 ? 'var(--success)' : accuracy >= 80 ? 'var(--accent)' : 'var(--danger)'} />
          <StatTile label="PROGRESS" value={`${state.typeRaceIndex + 1} / ${state.typeRaceSnippets.length}`} />
        </div>

        {/* Typing panel */}
        <div
          style={{
            width: '100%',
            maxWidth: 900,
            background: 'var(--bg-panel)',
            border: '3px solid var(--border)',
            boxShadow: '5px 5px 0 rgba(0,0,0,.5)',
            padding: '18px 22px',
          }}
        >
          <div
            style={{
              fontFamily: '"Press Start 2P", monospace',
              fontSize: 10,
              color: 'var(--text-dim)',
              letterSpacing: '0.12em',
              marginBottom: 10,
            }}
          >
            <KeyboardIcon size={10} color="var(--accent)" /> {snippet.description.toUpperCase()}
          </div>
          <div
            style={{
              fontFamily: '"VT323", "JetBrains Mono", monospace',
              fontSize: 28,
              lineHeight: 1.35,
              wordBreak: 'break-word',
              whiteSpace: 'pre-wrap',
              color: 'var(--text-dim)',
              padding: '8px 0',
            }}
          >
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
                    borderLeft: isCursor ? '2px solid var(--accent)' : '2px solid transparent',
                    animation: isCursor ? 'rc-cursor 1s steps(2) infinite' : 'none',
                    paddingLeft: isCursor ? 1 : 0,
                  }}
                >
                  {ch === ' ' && typed !== undefined && typed !== ' ' ? '·' : ch}
                </span>
              );
            })}
          </div>
          <input
            ref={inputRef}
            value={input}
            onChange={handleInput}
            autoFocus
            autoComplete="off"
            spellCheck={false}
            aria-label="Type the snippet"
            style={{
              position: 'absolute',
              opacity: 0,
              pointerEvents: 'none',
              width: 1,
              height: 1,
            }}
          />
        </div>

        {/* Pixel keyboard */}
        <PixelKeyboard pressed={pressedKey} wrong={wrongKey} />
      </div>

      {state.crt && <div aria-hidden className="crt-overlay" />}
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

const KB_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
];

interface KbProps {
  pressed: string | null;
  wrong: boolean;
}

function PixelKeyboard({ pressed, wrong }: KbProps) {
  const activeKey = pressed?.toUpperCase();
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        padding: '14px 20px',
        background: '#0a0e14',
        border: '3px solid #1a1f28',
        boxShadow: '5px 5px 0 rgba(0,0,0,.5), inset 2px 2px 0 rgba(255,255,255,.04)',
        borderRadius: 4,
      }}
    >
      {KB_ROWS.map((row, ri) => (
        <div key={ri} style={{ display: 'flex', gap: 6, marginLeft: ri * 12 }}>
          {row.map((k) => {
            const isActive = activeKey === k;
            return (
              <div
                key={k}
                style={{
                  width: 32,
                  height: 32,
                  background: isActive
                    ? wrong
                      ? 'var(--danger)'
                      : 'var(--accent)'
                    : '#2a303a',
                  border: `2px solid ${isActive ? (wrong ? '#cf222e' : 'var(--accent-bright)') : '#454a55'}`,
                  color: isActive ? '#fff' : '#c9d1d9',
                  fontFamily: '"Press Start 2P", monospace',
                  fontSize: 11,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: isActive ? 'inset 2px 2px 0 rgba(0,0,0,.3)' : '1px 1px 0 rgba(0,0,0,.5)',
                  transform: isActive ? 'translate(1px, 1px)' : 'none',
                  transition: 'background 40ms, transform 40ms',
                }}
              >
                {k}
              </div>
            );
          })}
        </div>
      ))}
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 2 }}>
        <div
          style={{
            width: 220,
            height: 26,
            background: pressed === ' ' ? 'var(--accent)' : '#2a303a',
            border: `2px solid ${pressed === ' ' ? 'var(--accent-bright)' : '#454a55'}`,
            boxShadow: pressed === ' ' ? 'inset 2px 2px 0 rgba(0,0,0,.3)' : '1px 1px 0 rgba(0,0,0,.5)',
          }}
        />
      </div>
    </div>
  );
}
