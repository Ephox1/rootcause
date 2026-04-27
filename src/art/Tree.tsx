import type { CSSProperties } from 'react';
import type { TreeVariant } from '../types';

interface TreeProps {
  stage?: number;
  variant?: TreeVariant;
  size?: number;
  style?: CSSProperties;
}

/**
 * Hand-painted tree sprite. The 15 green-stage PNGs at /sprites/tree-green-N
 * cover the full progression (seed → apple tree). Seasonal variants
 * (blossom/autumn/winter) are wired through the same path but the PNGs
 * don't exist yet — variantForStreak in the store currently returns 'green'
 * always, so this code path is forward-compatible without being exercised.
 */
export function Tree({ stage = 5, variant = 'green', size = 256, style }: TreeProps): JSX.Element {
  const stageForPng = Math.max(0, Math.min(14, stage));
  return (
    <img
      src={`/sprites/tree-${variant}-${stageForPng}.png`}
      alt={`${variant} tree stage ${stageForPng}`}
      width={size}
      height={size}
      draggable={false}
      style={{
        display: 'block',
        imageRendering: 'pixelated',
        userSelect: 'none',
        pointerEvents: 'none',
        ...style,
      }}
    />
  );
}
