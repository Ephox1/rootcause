import type { Theme } from '../types';
import { MoonIcon, SunIcon } from './icons';

interface FloatingThemeToggleProps {
  theme: Theme;
  onToggle: () => void;
}

export function FloatingThemeToggle({ theme, onToggle }: FloatingThemeToggleProps) {
  const dark = theme === 'dark';
  return (
    <button
      onClick={onToggle}
      aria-label={`Switch to ${dark ? 'light' : 'dark'} mode`}
      style={{
        position: 'fixed',
        top: 20,
        right: 20,
        width: 44,
        height: 44,
        padding: 0,
        background: 'var(--bg-panel)',
        border: '2px solid var(--border)',
        boxShadow: '3px 3px 0 rgba(0,0,0,.4)',
        color: 'var(--accent)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
      }}
    >
      {dark ? <SunIcon size={18} color="currentColor" /> : <MoonIcon size={18} color="currentColor" />}
    </button>
  );
}
