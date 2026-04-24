import { SectionTag } from '../components/SectionTag';
import { BackIcon, BugIcon, FlameIcon, KeyboardIcon, StarIcon } from '../components/icons';
import { useGameStore } from '../store/useGameStore';
import type { Language } from '../types';

const LANG_LABELS: Record<Language, string> = {
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  python: 'Python',
  dart: 'Dart',
};

export function StatsScreen() {
  const state = useGameStore();
  const l = state.lifetime;
  const accuracyPct =
    l.totalCorrect + l.totalWrong > 0
      ? Math.round((l.totalCorrect / (l.totalCorrect + l.totalWrong)) * 100)
      : 0;

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
        <SectionTag num="5" label="STATS & PROGRESS" />
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 14,
            marginBottom: 22,
          }}
        >
          <StatCard icon={<StarIcon size={18} />} label="TOTAL SCORE" value={state.score.toLocaleString()} tint="#ffd26a" />
          <StatCard icon={<FlameIcon size={18} />} label="BEST STREAK" value={state.bestStreak} tint="var(--accent)" />
          <StatCard icon={<BugIcon size={18} color="currentColor" />} label="BUGS SQUASHED" value={l.totalCorrect} tint="var(--success)" />
          <StatCard label="ACCURACY" value={`${accuracyPct}%`} tint="var(--accent)" />
          <StatCard icon={<KeyboardIcon size={18} />} label="AVG WPM" value={l.avgWPM || 0} tint="var(--accent)" />
          <StatCard label="GAMES" value={l.gamesPlayed} />
        </div>

        <h3
          style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: 11,
            color: 'var(--accent)',
            letterSpacing: '0.12em',
            margin: '8px 0 14px',
          }}
        >
          BY LANGUAGE
        </h3>
        <div style={{ display: 'grid', gap: 10 }}>
          {(['javascript', 'typescript', 'python', 'dart'] as Language[]).map((lang) => {
            const stats = l.byLanguage[lang];
            const total = stats.correct + stats.wrong;
            const acc = total ? Math.round((stats.correct / total) * 100) : 0;
            return (
              <div
                key={lang}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '120px 1fr auto auto auto',
                  gap: 14,
                  alignItems: 'center',
                  padding: '12px 16px',
                  background: 'var(--bg-panel)',
                  border: '2px solid var(--border)',
                  boxShadow: '3px 3px 0 rgba(0,0,0,.4)',
                }}
              >
                <div
                  style={{
                    fontFamily: '"Press Start 2P", monospace',
                    fontSize: 10,
                    color: 'var(--text)',
                    letterSpacing: '0.08em',
                  }}
                >
                  {LANG_LABELS[lang].toUpperCase()}
                </div>
                <div
                  style={{
                    height: 14,
                    background: 'var(--bg)',
                    border: '2px solid var(--border)',
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${acc}%`,
                      background: acc >= 80 ? 'var(--success)' : acc >= 60 ? 'var(--accent)' : 'var(--danger)',
                      transition: 'width 300ms',
                    }}
                  />
                </div>
                <div style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 10, color: 'var(--text-dim)' }}>
                  {acc}%
                </div>
                <div style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 10, color: 'var(--text-dim)' }}>
                  {stats.correct}/{total}
                </div>
                <div style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 10, color: 'var(--accent)' }}>
                  {stats.bestWPM ? `${stats.bestWPM} WPM` : '—'}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  tint?: string;
}

function StatCard({ label, value, icon, tint }: StatCardProps) {
  return (
    <div
      style={{
        padding: '14px 16px',
        background: 'var(--bg-panel)',
        border: '2px solid var(--border)',
        boxShadow: '3px 3px 0 rgba(0,0,0,.4)',
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
        {icon && <span style={{ color: tint ?? 'var(--accent)' }}>{icon}</span>}
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
