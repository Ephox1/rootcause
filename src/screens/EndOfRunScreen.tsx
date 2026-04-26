import { useEffect, useRef } from 'react';
import { Scene } from '../scene/Scene';
import { SectionTag } from '../components/SectionTag';
import { PixelButton } from '../components/PixelButton';
import { BugIcon, FlameIcon, KeyboardIcon, StarIcon } from '../components/icons';
import { useGameStore } from '../store/useGameStore';
import { playSoundFile } from '../audio/musicPlayer';

// Fail thresholds — playing below these triggers the "rough run" branch:
//   - Bug Hunt: fewer than half the questions answered correctly
//   - Type Race: average WPM below 25 (tweak as you see fit)
const FAIL_WPM_THRESHOLD = 25;

export function EndOfRunScreen(): JSX.Element {
  const state = useGameStore();
  const wasBugHunt = state.endRunMode === 'bughunt';

  const total = wasBugHunt ? state.bugHuntQuestions.length : state.typeRaceSnippets.length;
  const correct = wasBugHunt
    ? state.bugHuntCorrect
    : state.typeRaceResults.filter((r) => r.accuracy >= 95).length;

  const avgWPM =
    state.typeRaceResults.length > 0
      ? Math.round(state.typeRaceResults.reduce((s, r) => s + r.wpm, 0) / state.typeRaceResults.length)
      : 0;
  const avgAccuracy =
    state.typeRaceResults.length > 0
      ? Math.round(state.typeRaceResults.reduce((s, r) => s + r.accuracy, 0) / state.typeRaceResults.length)
      : 0;
  const runScore = state.score - state.bugHuntScoreStart;

  const failed = wasBugHunt
    ? total > 0 && state.bugHuntCorrect < total / 2
    : state.typeRaceResults.length > 0 && avgWPM < FAIL_WPM_THRESHOLD;

  // Play the fail sting on mount if applicable. Ref-guarded so React 18
  // strict-mode double-invoke doesn't fire it twice.
  const playedRef = useRef(false);
  useEffect(() => {
    if (playedRef.current) return;
    playedRef.current = true;
    if (failed && state.sfx) {
      playSoundFile('/audio/sfx-fail.mp3', state.sfxVolume);
    }
  }, [failed, state.sfx, state.sfxVolume]);

  const accent = failed ? 'var(--danger)' : 'var(--accent)';
  const accentBright = failed ? '#cf222e' : 'var(--accent-bright)';
  const characterState = failed
    ? 'facepalm'
    : state.streak >= 15
      ? 'fistpump'
      : state.streak >= 5
        ? 'sunglasses'
        : 'thumbsup';

  const headline = failed
    ? wasBugHunt
      ? 'BUGS WON THIS ROUND'
      : 'TIMING OUT'
    : wasBugHunt
      ? 'BUGS HUNTED'
      : 'RACE COMPLETE';

  const subline = wasBugHunt
    ? `${correct} of ${total} bugs squashed · streak ${state.streak}`
    : `${avgWPM} WPM · ${avgAccuracy}% accuracy`;

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
      <div style={{ position: 'absolute', inset: 0 }}>
        <Scene
          stage={state.visualStage || 5}
          variant={state.treeVariant}
          theme={state.theme}
          streak={failed ? 0 : state.streak}
          reducedMotion={state.reducedMotion}
          characterState={characterState}
          showCharacter
        />
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background: failed ? 'rgba(40, 8, 12, 0.6)' : 'rgba(5, 8, 16, 0.55)',
          }}
        />
      </div>

      <div style={{ position: 'relative', padding: '20px 24px' }}>
        <SectionTag num="4" label={failed ? 'GAME OVER' : 'RUN COMPLETE'} />
      </div>

      <div
        style={{
          position: 'relative',
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 24px',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 620,
            background: 'var(--bg-panel)',
            border: `3px solid ${accentBright}`,
            boxShadow: '6px 6px 0 rgba(0,0,0,.5)',
            padding: '24px 26px',
          }}
        >
          <h2
            style={{
              margin: 0,
              fontFamily: '"Press Start 2P", monospace',
              fontSize: 20,
              color: accent,
              letterSpacing: '0.08em',
              textShadow: '3px 3px 0 rgba(0,0,0,.5)',
            }}
          >
            {headline}
          </h2>
          <p
            style={{
              margin: '10px 0 22px',
              fontFamily: 'Inter, sans-serif',
              fontSize: 14,
              color: 'var(--text-dim)',
            }}
          >
            {subline}
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 12,
              marginBottom: 22,
            }}
          >
            {wasBugHunt ? (
              <>
                <BigStat label="SCORE" value={`+${runScore.toLocaleString()}`} icon={<StarIcon size={14} />} tint="#ffd26a" />
                <BigStat label="STREAK" value={state.streak} icon={<FlameIcon size={14} />} tint="var(--accent)" />
                <BigStat
                  label="CORRECT"
                  value={`${correct}/${total}`}
                  icon={<BugIcon size={14} color="currentColor" />}
                  tint={failed ? 'var(--danger)' : 'var(--success)'}
                />
              </>
            ) : (
              <>
                <BigStat
                  label="AVG WPM"
                  value={avgWPM}
                  icon={<KeyboardIcon size={14} />}
                  tint={failed ? 'var(--danger)' : 'var(--accent)'}
                />
                <BigStat
                  label="ACCURACY"
                  value={`${avgAccuracy}%`}
                  tint={avgAccuracy >= 95 ? 'var(--success)' : 'var(--accent)'}
                />
                <BigStat
                  label="BEST"
                  value={Math.max(...state.typeRaceResults.map((r) => r.wpm), 0)}
                  tint="#ffd26a"
                  icon={<StarIcon size={14} />}
                />
              </>
            )}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <PixelButton
              variant={failed ? 'danger' : 'primary'}
              onClick={() => (wasBugHunt ? state.startBugHunt() : state.startTypeRace())}
              fullWidth
              align="center"
            >
              {failed ? 'TRY AGAIN' : 'PLAY AGAIN'}
            </PixelButton>
            <PixelButton onClick={() => state.goHome()} fullWidth align="center">
              HOME
            </PixelButton>
          </div>
        </div>
      </div>

      {state.crt && <div aria-hidden className="crt-overlay" />}
    </div>
  );
}

interface BigStatProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  tint?: string;
}

function BigStat({ label, value, icon, tint }: BigStatProps): JSX.Element {
  return (
    <div
      style={{
        padding: '14px 12px',
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
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        {icon}
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
