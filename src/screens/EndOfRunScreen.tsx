import { Scene } from '../scene/Scene';
import { SectionTag } from '../components/SectionTag';
import { PixelButton } from '../components/PixelButton';
import { BugIcon, FlameIcon, KeyboardIcon, StarIcon } from '../components/icons';
import { useGameStore } from '../store/useGameStore';

export function EndOfRunScreen() {
  const state = useGameStore();
  const wasBugHunt = state.endRunMode === 'bughunt';

  const total = wasBugHunt ? state.bugHuntQuestions.length : state.typeRaceSnippets.length;
  const correct = wasBugHunt ? state.bugHuntCorrect : state.typeRaceResults.filter((r) => r.accuracy >= 95).length;

  const avgWPM = state.typeRaceResults.length > 0
    ? Math.round(state.typeRaceResults.reduce((s, r) => s + r.wpm, 0) / state.typeRaceResults.length)
    : 0;
  const avgAccuracy = state.typeRaceResults.length > 0
    ? Math.round(state.typeRaceResults.reduce((s, r) => s + r.accuracy, 0) / state.typeRaceResults.length)
    : 0;
  const runScore = state.score - state.bugHuntScoreStart;

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
      <div style={{ position: 'absolute', inset: 0 }}>
        <Scene
          stage={state.visualStage || 5}
          variant={state.treeVariant}
          theme={state.theme}
          streak={state.streak}
          reducedMotion={state.reducedMotion}
          characterState={state.streak >= 15 ? 'fistpump' : state.streak >= 5 ? 'sunglasses' : 'thumbsup'}
        />
        <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'rgba(5,8,16,0.55)' }} />
      </div>

      <div style={{ position: 'relative', padding: '20px 24px' }}>
        <SectionTag num="4" label="RUN COMPLETE" />
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
            border: '3px solid var(--accent-bright)',
            boxShadow: '6px 6px 0 rgba(0,0,0,.5)',
            padding: '24px 26px',
          }}
        >
          <h2
            style={{
              margin: 0,
              fontFamily: '"Press Start 2P", monospace',
              fontSize: 20,
              color: 'var(--accent)',
              letterSpacing: '0.08em',
              textShadow: '3px 3px 0 rgba(0,0,0,.5)',
            }}
          >
            {wasBugHunt ? 'BUGS HUNTED' : 'RACE COMPLETE'}
          </h2>
          <p
            style={{
              margin: '10px 0 22px',
              fontFamily: 'Inter, sans-serif',
              fontSize: 14,
              color: 'var(--text-dim)',
            }}
          >
            {wasBugHunt
              ? `${correct} of ${total} bugs squashed · streak ${state.streak}`
              : `${avgWPM} WPM · ${avgAccuracy}% accuracy`}
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: wasBugHunt ? 'repeat(3, 1fr)' : 'repeat(3, 1fr)',
              gap: 12,
              marginBottom: 22,
            }}
          >
            {wasBugHunt ? (
              <>
                <BigStat label="SCORE" value={`+${runScore.toLocaleString()}`} icon={<StarIcon size={14} />} tint="#ffd26a" />
                <BigStat label="STREAK" value={state.streak} icon={<FlameIcon size={14} />} tint="var(--accent)" />
                <BigStat label="CORRECT" value={`${correct}/${total}`} icon={<BugIcon size={14} color="currentColor" />} tint="var(--success)" />
              </>
            ) : (
              <>
                <BigStat label="AVG WPM" value={avgWPM} icon={<KeyboardIcon size={14} />} tint="var(--accent)" />
                <BigStat label="ACCURACY" value={`${avgAccuracy}%`} tint={avgAccuracy >= 95 ? 'var(--success)' : 'var(--accent)'} />
                <BigStat label="BEST" value={Math.max(...state.typeRaceResults.map((r) => r.wpm), 0)} tint="#ffd26a" icon={<StarIcon size={14} />} />
              </>
            )}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <PixelButton
              variant="primary"
              onClick={() => (wasBugHunt ? state.startBugHunt() : state.startTypeRace())}
              fullWidth
              align="center"
            >
              PLAY AGAIN
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

function BigStat({ label, value, icon, tint }: BigStatProps) {
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
