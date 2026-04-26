import type { ReactNode } from 'react';
import { Scene } from '../scene/Scene';
import { Logo } from '../art/Logo';
import { PixelButton } from '../components/PixelButton';
import {
  BugIcon,
  ChartIcon,
  FlameIcon,
  GearIcon,
  KeyboardIcon,
  StarIcon,
  TargetIcon,
} from '../components/icons';
import { useGameStore } from '../store/useGameStore';

export function TitleScreen(): JSX.Element {
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
      {/* Painted background + character on lower-left */}
      <Scene
        stage={5}
        variant={treeVariant}
        theme={theme}
        streak={Math.max(streak, bestStreak >= 10 ? 10 : 0)}
        reducedMotion={reducedMotion}
        showCharacter
        showTree={false}
      />

      {/* Centered title + menu, foreground above the scene */}
      <div
        style={{
          position: 'relative',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 24px 20px',
          minHeight: 0,
          gap: 24,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          <Logo cell={9} />
          <p
            style={{
              margin: 0,
              fontFamily: '"Press Start 2P", monospace',
              fontSize: 11,
              color: '#f4e4c0',
              letterSpacing: '0.18em',
              textShadow: '2px 2px 0 rgba(0,0,0,.7)',
            }}
          >
            LEVEL UP YOUR DEBUGGING SKILLS
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: 320 }}>
          <PixelButton
            variant="primary"
            onClick={startBugHunt}
            icon={<BugIcon size={16} color="#fff" />}
            align="center"
          >
            FIND THE BUG
          </PixelButton>
          <PixelButton onClick={startTypeRace} icon={<KeyboardIcon />} align="center">
            TYPE MODE
          </PixelButton>
          <PixelButton onClick={() => setRoute('settings')} icon={<TargetIcon />} align="center">
            PRACTICE MODES
          </PixelButton>
          <PixelButton onClick={() => setRoute('stats')} icon={<ChartIcon />} align="center">
            STATS & PROGRESS
          </PixelButton>
          <PixelButton onClick={() => setRoute('settings')} icon={<GearIcon />} align="center">
            SETTINGS
          </PixelButton>
        </div>
      </div>

      {/* Bottom HUD: WASD navigate · stats · ENTER select */}
      <div
        style={{
          position: 'relative',
          display: 'grid',
          gridTemplateColumns: 'auto 1fr auto',
          alignItems: 'center',
          padding: '12px 20px',
          gap: 24,
          background: 'rgba(8, 12, 20, 0.78)',
          borderTop: '2px solid rgba(255, 140, 66, 0.35)',
          backdropFilter: 'blur(2px)',
        }}
      >
        <NavHint label="W A S D" caption="NAVIGATE" />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1.6fr',
            gap: 18,
            justifyItems: 'start',
          }}
        >
          <StatCell
            label="STREAK"
            value={
              <span>
                {streak}{' '}
                <span style={{ color: 'var(--accent)', display: 'inline-block', verticalAlign: '-3px' }}>
                  <FlameIcon size={16} />
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
                  <StarIcon size={16} />
                </span>
              </span>
            }
          />
          <LevelCell level={level} xp={xp} />
        </div>
        <NavHint label="ENTER" caption="SELECT" />
      </div>
    </div>
  );
}

interface NavHintProps {
  label: string;
  caption: string;
}

function NavHint({ label, caption }: NavHintProps): JSX.Element {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span
        style={{
          padding: '5px 9px',
          background: 'rgba(255, 140, 66, 0.12)',
          border: '2px solid rgba(255, 140, 66, 0.6)',
          color: '#fff',
          fontFamily: '"Press Start 2P", monospace',
          fontSize: 9,
          letterSpacing: '0.15em',
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: '"Press Start 2P", monospace',
          fontSize: 8,
          color: 'rgba(255,255,255,0.65)',
          letterSpacing: '0.15em',
        }}
      >
        {caption}
      </span>
    </div>
  );
}

interface StatCellProps {
  label: string;
  value: ReactNode;
  tint?: string;
}

function StatCell({ label, value, tint }: StatCellProps): JSX.Element {
  return (
    <div>
      <div
        style={{
          fontFamily: '"Press Start 2P", monospace',
          fontSize: 8,
          color: 'rgba(255,255,255,0.6)',
          letterSpacing: '0.14em',
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: '"Press Start 2P", monospace',
          fontSize: 14,
          color: tint ?? '#fff',
          letterSpacing: '0.05em',
        }}
      >
        {value}
      </div>
    </div>
  );
}

function LevelCell({ level, xp }: { level: number; xp: number }): JSX.Element {
  const pips = 10;
  const filled = Math.round((xp / 100) * pips);
  return (
    <div>
      <div
        style={{
          fontFamily: '"Press Start 2P", monospace',
          fontSize: 8,
          color: 'rgba(255,255,255,0.6)',
          letterSpacing: '0.14em',
          marginBottom: 4,
        }}
      >
        LEVEL
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 14, color: '#fff' }}>
          {level}
        </span>
        <span style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 8, color: 'rgba(255,255,255,0.6)' }}>
          XP
        </span>
        <div style={{ display: 'flex', gap: 2 }}>
          {Array.from({ length: pips }).map((_, i) => (
            <div
              key={i}
              style={{
                width: 11,
                height: 11,
                background: i < filled ? 'var(--accent)' : 'rgba(255,255,255,0.15)',
                border: `1px solid ${i < filled ? 'var(--accent-bright)' : 'rgba(255,255,255,0.25)'}`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
