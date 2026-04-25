import type { CSSProperties } from 'react';
import { PixelGrid } from './PixelGrid';
import { TreePalettes } from './palettes';
import { TREE_STAGES } from './treeStages';
import { SheetCell } from './SheetCell';
import { SpriteWithFallback } from './SpriteWithFallback';
import type { TreeVariant } from '../types';

interface TreeProps {
  stage?: number;
  variant?: TreeVariant;
  size?: number;
  style?: CSSProperties;
}

// Row index of each variant in /sprites/tree-sheet.png
const VARIANT_ROW: Record<TreeVariant, number> = {
  green: 0,
  blossom: 1,
  autumn: 2,
  winter: 3,
};

// tree-sheet.png is 5 columns × 4 rows. The game uses a 6-stage model
// (0 = bare seed, 5 = full bloom) but the sheet has 5 stages (the seed
// state isn't drawn). We map code stage 0 to column 0 (smallest sprout)
// and clamp — the loss of a distinct "seed" frame is acceptable.
function stageToCol(stage: number): number {
  const clamped = Math.max(0, Math.min(5, stage));
  return Math.min(4, clamped === 0 ? 0 : clamped - 1);
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
  const singlePngSrc = `/sprites/tree-${variant}-${clamped}.png`;

  const svgFallback = (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      style={{ shapeRendering: 'crispEdges', imageRendering: 'pixelated', display: 'block', ...style }}
    >
      <PixelGrid grid={grid} palette={palette} />
    </svg>
  );

  // Tier 1: individual per-stage PNG (future Aseprite export).
  // Tier 2: grid sheet (current GPT art at /sprites/tree-sheet.png).
  // Tier 3: SVG pixel grid fallback.
  const pngFallback = (
    <SheetCell
      src="/sprites/tree-sheet.png"
      col={stageToCol(stage)}
      row={VARIANT_ROW[variant]}
      cols={5}
      rows={4}
      size={size}
      cellAspect={256 / 307}
      alt={`${variant} tree stage ${clamped}`}
      fallback={svgFallback}
      style={style}
    />
  );

  return (
    <SpriteWithFallback
      src={singlePngSrc}
      size={size}
      alt={`${variant} tree stage ${clamped}`}
      style={style}
      fallback={pngFallback}
    />
  );
}
