import type { CSSProperties } from 'react';
import type { TreeVariant } from '../types';
import { TreePalettes } from './palettes';

interface SizeProps {
  size?: number;
  style?: CSSProperties;
}

interface LeafProps extends SizeProps {
  variant?: TreeVariant;
}

/** Single falling leaf - used by Scene's wrong-answer particles. */
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

/** Pixel beetle - used by Scene for stuck-on-trunk and bug-scatter effects. */
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
