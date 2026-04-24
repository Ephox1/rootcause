import type { CSSProperties } from 'react';
import { PixelGrid } from './PixelGrid';
import { TreePalettes } from './palettes';
import { TREE_STAGES } from './treeStages';
import { SpriteWithFallback } from './SpriteWithFallback';
import type { TreeVariant } from '../types';

interface TreeProps {
  stage?: number;
  variant?: TreeVariant;
  size?: number;
  style?: CSSProperties;
}

export function Tree({ stage = 5, variant = 'green', size = 256, style }: TreeProps) {
  const p = TreePalettes[variant];
  const palette: Record<string, string> = {
    D: p.trunkDark,
    T: p.trunk,
    t: p.trunkLt,
    b: p.bark,
    s: p.trunkShadow,
    '1': p.leafDeep,
    '2': p.leafDark,
    '3': p.leaf,
    '4': p.leafMid,
    '5': p.leafLt,
    '6': p.leafHi,
    '7': p.leafSpec,
  };
  const clamped = Math.max(0, Math.min(TREE_STAGES.length - 1, stage));
  const grid = TREE_STAGES[clamped];
  const spriteSrc = `/sprites/tree-${variant}-${clamped}.png`;
  return (
    <SpriteWithFallback
      src={spriteSrc}
      size={size}
      alt={`${variant} tree stage ${clamped}`}
      style={style}
      fallback={
        <svg
          viewBox="0 0 48 48"
          width={size}
          height={size}
          style={{ shapeRendering: 'crispEdges', imageRendering: 'pixelated', display: 'block', ...style }}
        >
          <PixelGrid grid={grid} palette={palette} />
        </svg>
      }
    />
  );
}
