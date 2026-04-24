import type { ReactNode } from 'react';
import { FlameIcon, StarIcon } from './icons';

interface GameHUDProps {
  score: number;
  streak: number;
  right?: ReactNode;
  subtitle?: ReactNode;
  lastDelta?: number | null;
  flashKey?: number | null;
}

export function GameHUD({ score, streak, right, subtitle, lastDelta, flashKey }: GameHUDProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'stretch',
        gap: 16,
        padding: '10px 16px',
        background: 'var(--bg-panel)',
        border: '2px solid var(--border)',
        boxShadow: '3px 3px 0 rgba(0,0,0,.4)',
      }}
    >
      <HUDStat label="SCORE" tint="#ffd26a" icon={<StarIcon size={14} />}>
        <span style={{ fontVariantNumeric: 'tabular-nums', position: 'relative' }}>
          {score.toLocaleString()}
          {lastDelta != null && flashKey != null && (
            <span
              key={flashKey}
              style={{
                position: 'absolute',
                left: '100%',
                top: '-8px',
                marginLeft: 8,
                color: lastDelta > 0 ? 'var(--success)' : 'var(--danger)',
                fontFamily: '"Press Start 2P", monospace',
                fontSize: 10,
                animation: 'rc-slideup 1s ease-out forwards',
                pointerEvents: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              {lastDelta > 0 ? '+' : ''}
              {lastDelta}
            </span>
          )}
        </span>
      </HUDStat>

      <HUDStat label="STREAK" tint="var(--accent)" icon={<FlameIcon size={14} />}>
        {streak}
      </HUDStat>

      {subtitle && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '0 14px',
            fontFamily: '"Press Start 2P", monospace',
            fontSize: 9,
            color: 'var(--text-dim)',
            letterSpacing: '0.1em',
            borderLeft: '1px dashed var(--border)',
          }}
        >
          {subtitle}
        </div>
      )}

      {right && <div style={{ marginLeft: 'auto' }}>{right}</div>}
    </div>
  );
}

interface HUDStatProps {
  label: string;
  tint?: string;
  icon?: ReactNode;
  children: ReactNode;
}

function HUDStat({ label, tint, icon, children }: HUDStatProps) {
  return (
    <div style={{ minWidth: 110 }}>
      <div
        style={{
          fontFamily: '"Press Start 2P", monospace',
          fontSize: 8,
          color: 'var(--text-dim)',
          letterSpacing: '0.12em',
          marginBottom: 5,
        }}
      >
        {label}
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontFamily: '"Press Start 2P", monospace',
          fontSize: 16,
          color: tint ?? 'var(--text)',
        }}
      >
        {icon}
        {children}
      </div>
    </div>
  );
}
