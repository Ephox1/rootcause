import type { ReactNode } from 'react';
import { Scene } from '../scene/Scene';
import { Logo } from '../art/Logo';
import { SectionTag } from '../components/SectionTag';
import { PixelButton } from '../components/PixelButton';
import { BugIcon, ChartIcon, FlameIcon, GearIcon, KeyboardIcon, StarIcon, TargetIcon } from '../components/icons';
import { useGameStore } from '../store/useGameStore';

export function TitleScreen() {
  const theme = useGameStore((s) => s.theme);
  const streak = useGameStore((s) => s.streak);
  const bestStreak = useGameStore((s) => s.bestStreak);
  const score = useGameStore((s) => s.score);
  const level = useGameStore((s) => s.level);
  const xp = useGameStore((s) => s.xp);
  const treeVariant = useGameStore((s) => s.treeVariant);
  const reducedMotion = useGameStore((s) => s.reducedMotion);
  const startBugHunt = useGameStore((s) => s.startBugHunt);
  const startTypeRace = useGameStore((s) => s.startTypeRace);
  const setRoute = useGameStore((s) => s.setRoute);

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
      <Scene
        stage={5}
        variant={treeVariant}
        theme={theme}
        streak={Math.max(streak, bestStreak >= 10 ? 10 : 0)}
        reducedMotion={reducedMotion}
      />

      <div style={{ position: 'relative', padding: '20px 24px' }}>
        <SectionTag num="1" label="TITLE / HOME" />
      </div>

      <div
        style={{
          position: 'relative',
          flex: 1,
          display: 'grid',
          gridTemplateColumns: '1.1fr 1fr',
          padding: '0 24px 20px',
          minHeight: 0,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 28 }}>
          <div>
            <Logo cell={10} />
            <p
              style={{
                margin: '18px 0 0',
                fontFamily: '"Press Start 2P", monospace',
                fontSize: 12,
                color: 'var(--text-dim)',
                letterSpacing: '0.1em',
                textShadow: '2px 2px 0 rgba(0,0,0,.6)',
              }}
            >
              LEVEL UP YOUR DEBUGGING SKILLS
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 360 }}>
            <PixelButton variant="primary" onClick={startBugHunt} icon={<BugIcon size={16} color="#fff" />}>
              FIND THE BUG
            </PixelButton>
            <PixelButton onClick={startTypeRace} icon={<KeyboardIcon />}>
              TYPE MODE
            </PixelButton>
            <PixelButton onClick={() => setRoute('settings')} icon={<TargetIcon />}>
              PRACTICE MODES
            </PixelButton>
            <PixelButton onClick={() => setRoute('stats')} icon={<ChartIcon />}>
              STATS & PROGRESS
            </PixelButton>
            <PixelButton onClick={() => setRoute('settings')} icon={<GearIcon />}>
              SETTINGS
            </PixelButton>
          </div>
        </div>

        <div />
      </div>

      <div
        style={{
          position: 'relative',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 2fr',
          padding: '14px 24px',
          borderTop: '2px solid var(--border)',
          background: 'var(--bg-panel)',
          gap: 24,
        }}
      >
        <StatCell
          label="STREAK"
          value={
            <span>
              {streak}{' '}
              <span style={{ color: 'var(--accent)', display: 'inline-block', verticalAlign: '-3px' }}>
                <FlameIcon size={18} />
              </span>
            </span>
          }
          tint="var(--accent)"
        />
        <StatCell
          label="SCORE"
          value={
            <span style={{ fontVariantNumeric: 'tabular-nums' }}>
              {score.toLocaleString()}{' '}
              <span style={{ color: '#ffd26a', display: 'inline-block', verticalAlign: '-3px' }}>
                <StarIcon size={18} />
              </span>
            </span>
          }
        />
        <LevelCell level={level} xp={xp} />
      </div>
    </div>
  );
}

interface StatCellProps {
  label: string;
  value: ReactNode;
  tint?: string;
}

function StatCell({ label, value, tint }: StatCellProps) {
  return (
    <div>
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
          fontSize: 18,
          color: tint ?? 'var(--text)',
          letterSpacing: '0.05em',
        }}
      >
        {value}
      </div>
    </div>
  );
}

function LevelCell({ level, xp }: { level: number; xp: number }) {
  const pips = 10;
  const filled = Math.round((xp / 100) * pips);
  return (
    <div>
      <div
        style={{
          fontFamily: '"Press Start 2P", monospace',
          fontSize: 9,
          color: 'var(--text-dim)',
          letterSpacing: '0.12em',
          marginBottom: 6,
        }}
      >
        LEVEL
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 18, color: 'var(--text)' }}>
          {level}
        </span>
        <span style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 10, color: 'var(--text-dim)' }}>
          XP
        </span>
        <div style={{ display: 'flex', gap: 3 }}>
          {Array.from({ length: pips }).map((_, i) => (
            <div
              key={i}
              style={{
                width: 14,
                height: 14,
                background: i < filled ? 'var(--accent)' : 'var(--bg-elevated)',
                border: `1px solid ${i < filled ? 'var(--accent-bright)' : 'var(--border)'}`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
