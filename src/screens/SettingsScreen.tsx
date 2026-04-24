import type { ReactNode } from 'react';
import { SectionTag } from '../components/SectionTag';
import { BackIcon, InfoIcon, MoonIcon, MusicIcon, SpeakerIcon, SunIcon } from '../components/icons';
import { useGameStore } from '../store/useGameStore';
import { Scene } from '../scene/Scene';
import type { Category, Language, Theme } from '../types';

export function SettingsScreen() {
  const state = useGameStore();
  const update = state.updateSettings;

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <div
        style={{
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          borderBottom: '2px solid var(--border)',
          background: 'var(--bg-panel)',
        }}
      >
        <button
          onClick={() => state.setRoute('title')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 14px',
            background: 'var(--bg-elevated)',
            border: '2px solid var(--border)',
            color: 'var(--text)',
            fontFamily: '"Press Start 2P", monospace',
            fontSize: 9,
            cursor: 'pointer',
            letterSpacing: '0.08em',
            boxShadow: '2px 2px 0 rgba(0,0,0,.4)',
          }}
        >
          <BackIcon size={10} />
          HOME
        </button>
        <SectionTag num="6" label="SETTINGS & THEMES" />
      </div>

      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: 24,
          display: 'grid',
          gridTemplateColumns: 'minmax(300px, 380px) 1fr',
          gap: 24,
          minHeight: 0,
        }}
      >
        {/* LEFT — controls column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <ControlPanel label="THEME">
            <div style={{ display: 'flex', gap: 10 }}>
              <ThemeRadio
                value="dark"
                active={state.theme === 'dark'}
                onClick={() => update({ theme: 'dark' })}
              />
              <ThemeRadio
                value="light"
                active={state.theme === 'light'}
                onClick={() => update({ theme: 'light' })}
              />
            </div>
          </ControlPanel>

          <ControlPanel label="MUSIC" icon={<MusicIcon size={14} color="var(--accent)" />}>
            <Slider
              value={state.musicVolume}
              onChange={(v) => update({ musicVolume: v })}
              disabled={!state.music}
            />
            <LabeledToggle
              label={state.music ? 'MUSIC ON' : 'MUSIC OFF'}
              value={state.music}
              onChange={(v) => update({ music: v })}
            />
          </ControlPanel>

          <ControlPanel label="SOUND EFFECTS" icon={<SpeakerIcon size={14} color="var(--accent)" />}>
            <Slider
              value={state.sfxVolume}
              onChange={(v) => update({ sfxVolume: v })}
              disabled={!state.sfx}
            />
            <LabeledToggle
              label={state.sfx ? 'SFX ON' : 'SFX OFF'}
              value={state.sfx}
              onChange={(v) => update({ sfx: v })}
            />
          </ControlPanel>

          <ControlPanel label="CRT FILTER">
            <LabeledToggle
              label="SCANLINES"
              value={state.crt}
              onChange={(v) => update({ crt: v })}
              activeColor="var(--success)"
            />
          </ControlPanel>

          <ControlPanel label="LANGUAGE">
            <Segmented<Language>
              value={state.language}
              options={[
                { value: 'javascript', label: 'JS' },
                { value: 'typescript', label: 'TS' },
                { value: 'python', label: 'PY' },
                { value: 'dart', label: 'DART' },
              ]}
              onChange={(v) => update({ language: v })}
            />
          </ControlPanel>

          <ControlPanel label="CATEGORY">
            <Segmented<Category>
              value={state.category}
              options={[
                { value: 'general', label: 'GENERAL' },
                { value: 'vibe', label: 'VIBE CODE' },
              ]}
              onChange={(v) => update({ category: v })}
            />
          </ControlPanel>

          <ControlPanel label="REDUCED MOTION">
            <LabeledToggle
              label={state.reducedMotion ? 'ON' : 'OFF'}
              value={state.reducedMotion}
              onChange={(v) => update({ reducedMotion: v })}
            />
          </ControlPanel>
        </div>

        {/* RIGHT — theme previews */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minHeight: 0 }}>
          <ThemePreviewCard
            label="DARK MODE"
            theme="dark"
            active={state.theme === 'dark'}
            onClick={() => update({ theme: 'dark' })}
          />
          <ThemePreviewCard
            label="LIGHT MODE"
            theme="light"
            active={state.theme === 'light'}
            onClick={() => update({ theme: 'light' })}
          />
        </div>
      </div>

      {/* BOTTOM — difficulty row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: '14px 24px',
          borderTop: '2px solid var(--border)',
          background: 'var(--bg-panel)',
        }}
      >
        <div
          style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: 11,
            color: 'var(--text)',
            letterSpacing: '0.12em',
            marginRight: 8,
          }}
        >
          DIFFICULTY
        </div>
        <DifficultyChip
          label="EASY"
          color="var(--success)"
          active={state.difficulty === 'easy'}
          onClick={() => update({ difficulty: 'easy' })}
        />
        <DifficultyChip
          label="MEDIUM"
          color="var(--accent)"
          active={state.difficulty === 'medium'}
          onClick={() => update({ difficulty: 'medium' })}
        />
        <DifficultyChip
          label="HARD"
          color="var(--danger)"
          active={state.difficulty === 'hard'}
          onClick={() => update({ difficulty: 'hard' })}
        />
        <div style={{ marginLeft: 'auto' }}>
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 18px',
              background: 'var(--bg-elevated)',
              border: '2px solid var(--border)',
              color: 'var(--text)',
              fontFamily: '"Press Start 2P", monospace',
              fontSize: 10,
              letterSpacing: '0.1em',
              boxShadow: '3px 3px 0 rgba(0,0,0,.4)',
              cursor: 'pointer',
            }}
            onClick={() => state.resetProgress()}
          >
            <InfoIcon size={12} />
            RESET
          </button>
        </div>
      </div>
    </div>
  );
}

interface ControlPanelProps {
  label: string;
  icon?: ReactNode;
  children: ReactNode;
}

function ControlPanel({ label, icon, children }: ControlPanelProps) {
  return (
    <div
      style={{
        background: 'var(--bg-panel)',
        border: '2px solid var(--border)',
        padding: '12px 14px',
        boxShadow: '3px 3px 0 rgba(0,0,0,.35)',
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
          marginBottom: 10,
        }}
      >
        {icon}
        {label}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{children}</div>
    </div>
  );
}

interface ThemeRadioProps {
  value: Theme;
  active: boolean;
  onClick: () => void;
}

function ThemeRadio({ value, active, onClick }: ThemeRadioProps) {
  const isDark = value === 'dark';
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 14px',
        background: active ? 'var(--accent)' : 'var(--bg-elevated)',
        border: `2px solid ${active ? 'var(--accent-bright)' : 'var(--border)'}`,
        color: active ? '#fff' : 'var(--text)',
        fontFamily: '"Press Start 2P", monospace',
        fontSize: 10,
        letterSpacing: '0.1em',
        cursor: 'pointer',
        flex: 1,
        justifyContent: 'center',
        boxShadow: active ? '0 0 0 2px var(--accent-dim), 2px 2px 0 rgba(0,0,0,.4)' : '2px 2px 0 rgba(0,0,0,.35)',
      }}
    >
      <span
        aria-hidden
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 14,
          height: 14,
          borderRadius: '50%',
          border: `2px solid ${active ? '#fff' : 'var(--text-dim)'}`,
          padding: 2,
        }}
      >
        {active && (
          <span
            style={{
              display: 'inline-block',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: '#fff',
            }}
          />
        )}
      </span>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        {isDark ? <MoonIcon size={10} color="currentColor" /> : <SunIcon size={10} color="currentColor" />}
        {value === 'dark' ? 'DARK' : 'LIGHT'}
      </span>
    </button>
  );
}

interface SliderProps {
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
}

function Slider({ value, onChange, disabled = false }: SliderProps) {
  const pct = Math.round(value * 100);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ color: 'var(--accent)', display: 'inline-flex', width: 20 }}>
        <SpeakerIcon size={14} color="currentColor" />
      </span>
      <div
        style={{
          position: 'relative',
          flex: 1,
          height: 12,
          background: 'var(--bg)',
          border: '2px solid var(--border)',
          boxShadow: 'inset 2px 2px 0 rgba(0,0,0,.35)',
          opacity: disabled ? 0.4 : 1,
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: `${pct}%`,
            background: 'linear-gradient(90deg, var(--accent-dim), var(--accent))',
            transition: 'width 80ms',
          }}
        />
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            opacity: 0,
            cursor: disabled ? 'not-allowed' : 'pointer',
            margin: 0,
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: `calc(${pct}% - 8px)`,
            top: -4,
            width: 16,
            height: 20,
            background: 'var(--accent-bright)',
            border: '2px solid #000',
            boxShadow: '1px 1px 0 rgba(0,0,0,.5)',
            pointerEvents: 'none',
          }}
        />
      </div>
      <span style={{ color: 'var(--accent)', display: 'inline-flex', width: 20 }}>
        <SpeakerIcon size={16} color="currentColor" />
      </span>
    </div>
  );
}

interface LabeledToggleProps {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  activeColor?: string;
}

function LabeledToggle({ label, value, onChange, activeColor = 'var(--accent)' }: LabeledToggleProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <button
        onClick={() => onChange(!value)}
        aria-pressed={value}
        style={{
          width: 44,
          height: 22,
          padding: 0,
          background: value ? activeColor : 'var(--bg)',
          border: `2px solid ${value ? activeColor : 'var(--border)'}`,
          position: 'relative',
          cursor: 'pointer',
          boxShadow: 'inset 1px 1px 0 rgba(0,0,0,.35)',
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: 2,
            left: value ? 24 : 2,
            width: 14,
            height: 14,
            background: '#fff',
            border: '1px solid #000',
            boxShadow: '1px 1px 0 rgba(0,0,0,.5)',
            transition: 'left 140ms',
          }}
        />
      </button>
      <span
        style={{
          fontFamily: '"Press Start 2P", monospace',
          fontSize: 9,
          color: 'var(--text-dim)',
          letterSpacing: '0.1em',
        }}
      >
        {label}
      </span>
    </div>
  );
}

interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedProps<T extends string> {
  value: T;
  options: SegmentedOption<T>[];
  onChange: (v: T) => void;
}

function Segmented<T extends string>({ value, options, onChange }: SegmentedProps<T>) {
  return (
    <div
      style={{
        display: 'flex',
        padding: 2,
        background: 'var(--bg)',
        border: '2px solid var(--border)',
      }}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            style={{
              flex: 1,
              padding: '8px 6px',
              background: active ? 'var(--accent)' : 'transparent',
              color: active ? '#fff' : 'var(--text-dim)',
              border: 'none',
              fontFamily: '"Press Start 2P", monospace',
              fontSize: 9,
              letterSpacing: '0.05em',
              cursor: 'pointer',
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

interface ThemePreviewCardProps {
  label: string;
  theme: Theme;
  active: boolean;
  onClick: () => void;
}

function ThemePreviewCard({ label, theme, active, onClick }: ThemePreviewCardProps) {
  return (
    <button
      onClick={onClick}
      style={{
        position: 'relative',
        width: '100%',
        minHeight: 210,
        padding: 0,
        border: `3px solid ${active ? 'var(--accent-bright)' : 'var(--border)'}`,
        boxShadow: active
          ? '0 0 0 2px var(--accent-dim), 4px 4px 0 rgba(0,0,0,.4)'
          : '3px 3px 0 rgba(0,0,0,.4)',
        cursor: 'pointer',
        overflow: 'hidden',
        background: 'var(--bg)',
      }}
    >
      <div style={{ position: 'absolute', inset: 0 }}>
        <Scene
          stage={4}
          variant="green"
          theme={theme}
          streak={0}
          reducedMotion
          showCharacter
          compact
        />
      </div>
      <span
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          padding: '5px 10px',
          background: active ? 'var(--accent)' : 'rgba(10, 14, 22, 0.78)',
          color: '#fff',
          fontFamily: '"Press Start 2P", monospace',
          fontSize: 10,
          letterSpacing: '0.1em',
          border: `2px solid ${active ? 'var(--accent-bright)' : 'rgba(255,255,255,0.2)'}`,
        }}
      >
        {label}
      </span>
    </button>
  );
}

interface DifficultyChipProps {
  label: string;
  color: string;
  active: boolean;
  onClick: () => void;
}

function DifficultyChip({ label, color, active, onClick }: DifficultyChipProps) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '12px 22px',
        background: active ? color : 'var(--bg-elevated)',
        border: `2px solid ${active ? color : 'var(--border)'}`,
        color: active ? '#fff' : 'var(--text)',
        fontFamily: '"Press Start 2P", monospace',
        fontSize: 10,
        letterSpacing: '0.12em',
        cursor: 'pointer',
        boxShadow: active ? `0 0 0 2px ${color}44, 3px 3px 0 rgba(0,0,0,.4)` : '3px 3px 0 rgba(0,0,0,.4)',
      }}
    >
      {label}
    </button>
  );
}
