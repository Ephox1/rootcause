import { useState, type CSSProperties, type ReactNode } from 'react';

export type PixelButtonVariant = 'default' | 'primary' | 'success' | 'danger' | 'ghost';

interface PixelButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: PixelButtonVariant;
  icon?: ReactNode;
  style?: CSSProperties;
  disabled?: boolean;
  active?: boolean;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  align?: 'left' | 'center';
}

export function PixelButton({
  children,
  onClick,
  variant = 'default',
  icon = null,
  style,
  disabled = false,
  active = false,
  size = 'md',
  fullWidth = true,
  align = 'left',
}: PixelButtonProps) {
  const [hover, setHover] = useState(false);
  const [pressed, setPressed] = useState(false);

  const colors = (() => {
    if (variant === 'primary' || (variant === 'default' && active)) {
      return {
        bg: hover ? 'var(--accent-bright)' : 'var(--accent)',
        color: '#fff',
        border: 'var(--accent-bright)',
        shadow: '0 0 0 2px var(--accent-dim), 3px 3px 0 rgba(0,0,0,.4)',
      };
    }
    if (variant === 'success') {
      return {
        bg: hover ? '#2d9638' : 'var(--success)',
        color: '#fff',
        border: '#2d9638',
        shadow: '3px 3px 0 rgba(0,0,0,.4)',
      };
    }
    if (variant === 'danger') {
      return {
        bg: hover ? '#cf222e' : 'var(--danger)',
        color: '#fff',
        border: '#cf222e',
        shadow: '3px 3px 0 rgba(0,0,0,.4)',
      };
    }
    if (variant === 'ghost') {
      return {
        bg: hover ? 'rgba(255, 140, 66, 0.1)' : 'transparent',
        color: 'var(--text)',
        border: 'var(--border)',
        shadow: '2px 2px 0 rgba(0,0,0,.3)',
      };
    }
    return {
      bg: hover ? 'var(--bg-elevated)' : 'var(--bg-panel)',
      color: disabled ? 'var(--text-dim)' : 'var(--text)',
      border: 'var(--border)',
      shadow: '3px 3px 0 rgba(0,0,0,.4)',
    };
  })();

  const padding = size === 'sm' ? '7px 12px' : size === 'lg' ? '16px 22px' : '12px 16px';
  const fontSize = size === 'sm' ? 9 : size === 'lg' ? 13 : 11;

  return (
    <button
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => {
        setHover(false);
        setPressed(false);
      }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      disabled={disabled}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: align === 'center' ? 'center' : 'flex-start',
        gap: 12,
        width: fullWidth ? '100%' : 'auto',
        padding,
        background: colors.bg,
        color: colors.color,
        border: `2px solid ${colors.border}`,
        boxShadow: pressed ? '1px 1px 0 rgba(0,0,0,.4)' : colors.shadow,
        transform: pressed ? 'translate(2px, 2px)' : 'none',
        fontFamily: '"Press Start 2P", monospace',
        fontSize,
        letterSpacing: '0.04em',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background 80ms, transform 60ms, box-shadow 60ms',
        textAlign: 'left',
        opacity: disabled ? 0.5 : 1,
        ...style,
      }}
    >
      {icon && <span style={{ display: 'inline-flex', alignItems: 'center', width: 20 }}>{icon}</span>}
      <span style={{ flex: 1 }}>{children}</span>
    </button>
  );
}
