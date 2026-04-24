import type { CSSProperties, ReactNode } from 'react';

interface PixelPanelProps {
  children: ReactNode;
  style?: CSSProperties;
  elevated?: boolean;
}

export function PixelPanel({ children, style, elevated = false }: PixelPanelProps) {
  return (
    <div
      style={{
        background: elevated ? 'var(--bg-elevated)' : 'var(--bg-panel)',
        border: '2px solid var(--border)',
        boxShadow: '3px 3px 0 rgba(0, 0, 0, 0.4)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
