import type { CSSProperties } from 'react';
import type { Theme, TreeVariant } from '../types';
import { TreePalettes } from './palettes';
import { SpriteWithFallback } from './SpriteWithFallback';

interface SizeProps {
  size?: number;
  style?: CSSProperties;
}

export function Moon({ size = 40, style }: SizeProps) {
  return (
    <SpriteWithFallback
      src="/sprites/moon.png"
      size={size}
      alt="moon"
      style={style}
      fallback={
        <svg
          viewBox="0 0 12 12"
          width={size}
          height={size}
          style={{ shapeRendering: 'crispEdges', imageRendering: 'pixelated', display: 'block', ...style }}
        >
          <g fill="#fbc565">
            <rect x="5" y="1" width="4" height="1" />
            <rect x="4" y="2" width="5" height="1" />
            <rect x="3" y="3" width="5" height="1" />
            <rect x="3" y="4" width="4" height="1" />
            <rect x="2" y="5" width="4" height="1" />
            <rect x="2" y="6" width="4" height="1" />
            <rect x="3" y="7" width="4" height="1" />
            <rect x="3" y="8" width="5" height="1" />
            <rect x="4" y="9" width="5" height="1" />
            <rect x="5" y="10" width="4" height="1" />
          </g>
          <g fill="#fde29a">
            <rect x="5" y="2" width="1" height="1" />
            <rect x="4" y="3" width="1" height="1" />
            <rect x="3" y="5" width="1" height="1" />
            <rect x="4" y="10" width="1" height="1" />
          </g>
        </svg>
      }
    />
  );
}

export function Sun({ size = 44, style }: SizeProps) {
  return (
    <SpriteWithFallback
      src="/sprites/sun.png"
      size={size}
      alt="sun"
      style={style}
      fallback={
        <svg
          viewBox="0 0 14 14"
          width={size}
          height={size}
          style={{ shapeRendering: 'crispEdges', imageRendering: 'pixelated', display: 'block', ...style }}
        >
          <g fill="#ffd26a">
            <rect x="5" y="2" width="4" height="1" />
            <rect x="4" y="3" width="6" height="1" />
            <rect x="3" y="4" width="8" height="1" />
            <rect x="3" y="5" width="8" height="2" />
            <rect x="3" y="7" width="8" height="1" />
            <rect x="3" y="8" width="8" height="1" />
            <rect x="4" y="9" width="6" height="1" />
            <rect x="5" y="10" width="4" height="1" />
          </g>
          <g fill="#ffe9a0">
            <rect x="5" y="3" width="4" height="1" />
            <rect x="4" y="4" width="6" height="1" />
            <rect x="4" y="5" width="6" height="1" />
          </g>
          <g fill="#ffd26a">
            <rect x="6" y="0" width="2" height="1" />
            <rect x="6" y="13" width="2" height="1" />
            <rect x="0" y="6" width="1" height="2" />
            <rect x="13" y="6" width="1" height="2" />
            <rect x="2" y="2" width="1" height="1" />
            <rect x="11" y="2" width="1" height="1" />
            <rect x="2" y="11" width="1" height="1" />
            <rect x="11" y="11" width="1" height="1" />
          </g>
        </svg>
      }
    />
  );
}

interface LeafProps extends SizeProps {
  variant?: TreeVariant;
}

export function Leaf({ size = 10, variant = 'green', style }: LeafProps) {
  const p = TreePalettes[variant];
  return (
    <svg
      viewBox="0 0 6 6"
      width={size}
      height={size}
      style={{ shapeRendering: 'crispEdges', imageRendering: 'pixelated', display: 'block', ...style }}
    >
      <rect x="2" y="0" width="2" height="1" fill={p.leaf} />
      <rect x="1" y="1" width="4" height="1" fill={p.leafMid} />
      <rect x="0" y="2" width="6" height="1" fill={p.leafLt} />
      <rect x="1" y="3" width="4" height="1" fill={p.leafHi} />
      <rect x="2" y="4" width="2" height="1" fill={p.leaf} />
      <rect x="3" y="5" width="1" height="1" fill={p.leafDark} />
    </svg>
  );
}

export function Bug({ size = 12, style }: SizeProps) {
  return (
    <svg
      viewBox="0 0 8 8"
      width={size}
      height={size}
      style={{ shapeRendering: 'crispEdges', imageRendering: 'pixelated', display: 'block', ...style }}
    >
      <rect x="3" y="1" width="2" height="1" fill="#48261a" />
      <rect x="2" y="2" width="4" height="2" fill="#1a0a04" />
      <rect x="2" y="4" width="4" height="2" fill="#2a180c" />
      <rect x="3" y="6" width="2" height="1" fill="#48261a" />
      <rect x="3" y="2" width="2" height="1" fill="#ff6b1a" />
      <rect x="3" y="4" width="1" height="1" fill="#ff8c42" />
      <rect x="0" y="3" width="2" height="1" fill="#1a0a04" />
      <rect x="6" y="3" width="2" height="1" fill="#1a0a04" />
      <rect x="0" y="5" width="2" height="1" fill="#1a0a04" />
      <rect x="6" y="5" width="2" height="1" fill="#1a0a04" />
      <rect x="2" y="1" width="1" height="1" fill="#080408" />
      <rect x="5" y="1" width="1" height="1" fill="#080408" />
    </svg>
  );
}

export function Cabin({ size = 56, theme = 'dark', style }: SizeProps & { theme?: Theme }) {
  const dark = theme === 'dark';
  const svgFallback = (
    <svg
      viewBox="0 0 16 14"
      width={size}
      height={size}
      style={{ shapeRendering: 'crispEdges', imageRendering: 'pixelated', display: 'block', ...style }}
    >
      <polygon points="3,5 8,1 13,5 3,5" fill={dark ? '#2a1810' : '#5a3a20'} />
      <polygon points="3,5 8,2 13,5 3,5" fill={dark ? '#3a2412' : '#6b4a28'} />
      <rect x="3" y="5" width="10" height="7" fill={dark ? '#4a3020' : '#8a5830'} />
      <rect x="3" y="5" width="10" height="1" fill={dark ? '#2a1810' : '#5a3820'} />
      <rect x="3" y="7" width="10" height="1" fill={dark ? '#3a2418' : '#6a4530'} />
      <rect x="3" y="9" width="10" height="1" fill={dark ? '#3a2418' : '#6a4530'} />
      <rect x="3" y="11" width="10" height="1" fill={dark ? '#3a2418' : '#6a4530'} />
      <rect x="6" y="8" width="4" height="4" fill={dark ? '#0a0608' : '#5a3a20'} />
      {dark ? (
        <rect x="7" y="9" width="2" height="2" fill="#ff8c42" />
      ) : (
        <rect x="7" y="9" width="2" height="2" fill="#2a1810" />
      )}
      <rect x="11" y="6" width="1" height="2" fill={dark ? '#ff8c42' : '#8acfff'} />
      <rect x="4" y="6" width="1" height="1" fill={dark ? '#ff8c42' : '#8acfff'} />
      <rect x="3" y="12" width="10" height="1" fill={dark ? '#1a0e08' : '#3a2418'} />
    </svg>
  );
  return (
    <SpriteWithFallback
      src={`/sprites/cabin-${theme}.png`}
      size={size}
      alt={`cabin ${theme}`}
      style={style}
      fallback={svgFallback}
    />
  );
}

interface StarFieldProps {
  count?: number;
  seed?: number;
}

export function StarField({ count = 90, seed = 1 }: StarFieldProps) {
  const rng = (n: number) => {
    const x = Math.sin(n * 12.9898 + seed * 78.233) * 43758.5453;
    return x - Math.floor(x);
  };
  const stars = Array.from({ length: count }, (_, i) => {
    const x = rng(i * 3) * 100;
    const y = rng(i * 3 + 1) * 55;
    const s = Math.floor(rng(i * 3 + 2) * 3) + 1;
    const delay = rng(i * 3 + 5) * 4;
    return { x, y, s, delay };
  });
  return (
    <g>
      {stars.map((star, i) => (
        <rect
          key={i}
          x={`${star.x}%`}
          y={`${star.y}%`}
          width={star.s}
          height={star.s}
          fill="#e8edf5"
          opacity={0.3 + (star.s / 3) * 0.6}
          style={{
            animation: `rc-twinkle ${2.2 + (i % 4) * 0.5}s ${star.delay}s ease-in-out infinite`,
            transformBox: 'fill-box',
            transformOrigin: 'center',
          }}
        />
      ))}
    </g>
  );
}

export function Cloud({ size = 80, style }: SizeProps) {
  return (
    <svg
      viewBox="0 0 20 8"
      width={size}
      height={size / 2.5}
      style={{ shapeRendering: 'crispEdges', imageRendering: 'pixelated', display: 'block', ...style }}
    >
      <rect x="3" y="3" width="14" height="2" fill="#fff" />
      <rect x="2" y="4" width="16" height="2" fill="#fff" />
      <rect x="5" y="2" width="4" height="1" fill="#fff" />
      <rect x="9" y="1" width="5" height="1" fill="#fff" />
      <rect x="14" y="2" width="3" height="1" fill="#fff" />
      <rect x="5" y="5" width="10" height="1" fill="#e6ecf3" />
    </svg>
  );
}

export function Butterfly({ size = 14, style }: SizeProps) {
  return (
    <svg
      viewBox="0 0 8 6"
      width={size}
      height={(size / 4) * 3}
      style={{ shapeRendering: 'crispEdges', imageRendering: 'pixelated', display: 'block', ...style }}
    >
      <rect x="0" y="1" width="3" height="1" fill="#ff8c42" />
      <rect x="0" y="2" width="3" height="2" fill="#ff6b1a" />
      <rect x="5" y="1" width="3" height="1" fill="#ff8c42" />
      <rect x="5" y="2" width="3" height="2" fill="#ff6b1a" />
      <rect x="3" y="1" width="2" height="4" fill="#1a0a04" />
      <rect x="0" y="0" width="1" height="1" fill="#ffd26a" />
      <rect x="7" y="0" width="1" height="1" fill="#ffd26a" />
    </svg>
  );
}
