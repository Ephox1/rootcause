interface IconProps {
  size?: number;
  color?: string;
}

// All icons render as pixel-block SVG at 16×16 base. Crisp, retro feel.

export function BugIcon({ size = 14, color = 'currentColor' }: IconProps) {
  return (
    <svg viewBox="0 0 10 10" width={size} height={size} style={{ shapeRendering: 'crispEdges' }}>
      <rect x="3" y="0" width="4" height="1" fill={color} />
      <rect x="2" y="1" width="6" height="1" fill={color} />
      <rect x="2" y="2" width="6" height="6" fill={color} />
      <rect x="3" y="8" width="4" height="1" fill={color} />
      <rect x="0" y="3" width="2" height="1" fill={color} />
      <rect x="0" y="5" width="2" height="1" fill={color} />
      <rect x="8" y="3" width="2" height="1" fill={color} />
      <rect x="8" y="5" width="2" height="1" fill={color} />
      <rect x="0" y="9" width="1" height="1" fill={color} />
      <rect x="9" y="9" width="1" height="1" fill={color} />
      <rect x="3" y="3" width="1" height="1" fill="transparent" />
      <rect x="6" y="3" width="1" height="1" fill="transparent" />
    </svg>
  );
}

export function KeyboardIcon({ size = 14, color = 'currentColor' }: IconProps) {
  return (
    <svg viewBox="0 0 12 8" width={size} height={(size / 3) * 2} style={{ shapeRendering: 'crispEdges' }}>
      <rect x="0" y="1" width="12" height="6" fill="none" stroke={color} strokeWidth="1" />
      <rect x="2" y="3" width="1" height="1" fill={color} />
      <rect x="4" y="3" width="1" height="1" fill={color} />
      <rect x="6" y="3" width="1" height="1" fill={color} />
      <rect x="8" y="3" width="1" height="1" fill={color} />
      <rect x="3" y="5" width="6" height="1" fill={color} />
    </svg>
  );
}

export function TargetIcon({ size = 14, color = 'currentColor' }: IconProps) {
  return (
    <svg viewBox="0 0 10 10" width={size} height={size} style={{ shapeRendering: 'crispEdges' }}>
      <rect x="4" y="0" width="2" height="2" fill={color} />
      <rect x="2" y="2" width="6" height="1" fill={color} />
      <rect x="1" y="3" width="2" height="4" fill={color} />
      <rect x="7" y="3" width="2" height="4" fill={color} />
      <rect x="2" y="7" width="6" height="1" fill={color} />
      <rect x="4" y="8" width="2" height="2" fill={color} />
      <rect x="4" y="4" width="2" height="2" fill={color} />
    </svg>
  );
}

export function ChartIcon({ size = 14, color = 'currentColor' }: IconProps) {
  return (
    <svg viewBox="0 0 10 10" width={size} height={size} style={{ shapeRendering: 'crispEdges' }}>
      <rect x="1" y="6" width="2" height="3" fill={color} />
      <rect x="4" y="3" width="2" height="6" fill={color} />
      <rect x="7" y="1" width="2" height="8" fill={color} />
      <rect x="0" y="9" width="10" height="1" fill={color} />
    </svg>
  );
}

export function GearIcon({ size = 14, color = 'currentColor' }: IconProps) {
  return (
    <svg viewBox="0 0 10 10" width={size} height={size} style={{ shapeRendering: 'crispEdges' }}>
      <rect x="4" y="0" width="2" height="2" fill={color} />
      <rect x="4" y="8" width="2" height="2" fill={color} />
      <rect x="0" y="4" width="2" height="2" fill={color} />
      <rect x="8" y="4" width="2" height="2" fill={color} />
      <rect x="1" y="1" width="2" height="2" fill={color} />
      <rect x="7" y="1" width="2" height="2" fill={color} />
      <rect x="1" y="7" width="2" height="2" fill={color} />
      <rect x="7" y="7" width="2" height="2" fill={color} />
      <rect x="3" y="3" width="4" height="4" fill={color} />
      <rect x="4" y="4" width="2" height="2" fill="transparent" />
    </svg>
  );
}

export function BackIcon({ size = 10, color = 'currentColor' }: IconProps) {
  return (
    <svg viewBox="0 0 8 8" width={size} height={size} style={{ shapeRendering: 'crispEdges' }}>
      <rect x="3" y="0" width="1" height="1" fill={color} />
      <rect x="2" y="1" width="1" height="1" fill={color} />
      <rect x="1" y="2" width="1" height="1" fill={color} />
      <rect x="0" y="3" width="1" height="2" fill={color} />
      <rect x="1" y="5" width="1" height="1" fill={color} />
      <rect x="2" y="6" width="1" height="1" fill={color} />
      <rect x="3" y="7" width="1" height="1" fill={color} />
      <rect x="1" y="3" width="7" height="2" fill={color} />
    </svg>
  );
}

export function FlameIcon({ size = 12, color = '#ff8c42' }: IconProps) {
  return (
    <svg viewBox="0 0 10 10" width={size} height={size} style={{ shapeRendering: 'crispEdges' }}>
      <rect x="4" y="0" width="2" height="1" fill="#ffd26a" />
      <rect x="3" y="1" width="4" height="1" fill="#ffd26a" />
      <rect x="2" y="2" width="6" height="1" fill={color} />
      <rect x="2" y="3" width="6" height="2" fill="#ff6b1a" />
      <rect x="1" y="5" width="8" height="2" fill="#ff6b1a" />
      <rect x="2" y="7" width="6" height="1" fill={color} />
      <rect x="3" y="8" width="4" height="1" fill="#ffd26a" />
    </svg>
  );
}

export function StarIcon({ size = 12, color = '#ffd26a' }: IconProps) {
  return (
    <svg viewBox="0 0 9 9" width={size} height={size} style={{ shapeRendering: 'crispEdges' }}>
      <rect x="4" y="0" width="1" height="1" fill={color} />
      <rect x="3" y="1" width="3" height="1" fill={color} />
      <rect x="0" y="2" width="9" height="1" fill={color} />
      <rect x="1" y="3" width="7" height="1" fill={color} />
      <rect x="2" y="4" width="5" height="1" fill={color} />
      <rect x="1" y="5" width="3" height="1" fill={color} />
      <rect x="5" y="5" width="3" height="1" fill={color} />
      <rect x="0" y="6" width="3" height="1" fill={color} />
      <rect x="6" y="6" width="3" height="1" fill={color} />
    </svg>
  );
}

export function SunIcon({ size = 12, color = 'currentColor' }: IconProps) {
  return (
    <svg viewBox="0 0 10 10" width={size} height={size} style={{ shapeRendering: 'crispEdges' }}>
      <rect x="4" y="0" width="2" height="1" fill={color} />
      <rect x="4" y="9" width="2" height="1" fill={color} />
      <rect x="0" y="4" width="1" height="2" fill={color} />
      <rect x="9" y="4" width="1" height="2" fill={color} />
      <rect x="1" y="1" width="1" height="1" fill={color} />
      <rect x="8" y="1" width="1" height="1" fill={color} />
      <rect x="1" y="8" width="1" height="1" fill={color} />
      <rect x="8" y="8" width="1" height="1" fill={color} />
      <rect x="3" y="3" width="4" height="4" fill={color} />
    </svg>
  );
}

export function MoonIcon({ size = 12, color = 'currentColor' }: IconProps) {
  return (
    <svg viewBox="0 0 10 10" width={size} height={size} style={{ shapeRendering: 'crispEdges' }}>
      <rect x="3" y="1" width="4" height="1" fill={color} />
      <rect x="2" y="2" width="3" height="1" fill={color} />
      <rect x="1" y="3" width="3" height="1" fill={color} />
      <rect x="1" y="4" width="3" height="2" fill={color} />
      <rect x="1" y="6" width="3" height="1" fill={color} />
      <rect x="2" y="7" width="3" height="1" fill={color} />
      <rect x="3" y="8" width="4" height="1" fill={color} />
    </svg>
  );
}

export function MusicIcon({ size = 14, color = 'currentColor' }: IconProps) {
  return (
    <svg viewBox="0 0 10 10" width={size} height={size} style={{ shapeRendering: 'crispEdges' }}>
      <rect x="4" y="0" width="5" height="1" fill={color} />
      <rect x="4" y="1" width="1" height="7" fill={color} />
      <rect x="8" y="1" width="1" height="5" fill={color} />
      <rect x="1" y="7" width="4" height="2" fill={color} />
      <rect x="6" y="5" width="4" height="2" fill={color} />
    </svg>
  );
}

export function SpeakerIcon({ size = 14, color = 'currentColor' }: IconProps) {
  return (
    <svg viewBox="0 0 10 10" width={size} height={size} style={{ shapeRendering: 'crispEdges' }}>
      <rect x="0" y="3" width="2" height="4" fill={color} />
      <rect x="2" y="2" width="1" height="6" fill={color} />
      <rect x="3" y="1" width="1" height="8" fill={color} />
      <rect x="4" y="0" width="2" height="10" fill={color} />
      <rect x="7" y="3" width="1" height="1" fill={color} />
      <rect x="8" y="2" width="1" height="1" fill={color} />
      <rect x="9" y="1" width="1" height="1" fill={color} />
      <rect x="7" y="6" width="1" height="1" fill={color} />
      <rect x="8" y="7" width="1" height="1" fill={color} />
      <rect x="9" y="8" width="1" height="1" fill={color} />
    </svg>
  );
}

export function InfoIcon({ size = 12, color = 'currentColor' }: IconProps) {
  return (
    <svg viewBox="0 0 8 8" width={size} height={size} style={{ shapeRendering: 'crispEdges' }}>
      <rect x="2" y="0" width="4" height="1" fill={color} />
      <rect x="1" y="1" width="6" height="1" fill={color} />
      <rect x="0" y="2" width="8" height="4" fill={color} />
      <rect x="1" y="6" width="6" height="1" fill={color} />
      <rect x="2" y="7" width="4" height="1" fill={color} />
      <rect x="3" y="2" width="2" height="1" fill="#0d1117" />
      <rect x="3" y="4" width="2" height="2" fill="#0d1117" />
    </svg>
  );
}
