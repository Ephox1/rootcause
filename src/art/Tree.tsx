import type { CSSProperties, ReactNode } from 'react';
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

interface CellPos {
  col: number;
  row: number;
}

// ───────────────────────────────────────────────────────────────────────
// Two sheets in play:
//
//   /sprites/tree-pine.png   → 4×4 = 16 cells, used for the GREEN variant.
//                              Hand-painted pine trees, each cell 384×256.
//                              We use 6 of the 16 cells to map our 6-stage
//                              progression to clear size jumps.
//
//   /sprites/tree-sheet.png  → 5×4 = 20 cells, used for non-green variants
//                              (blossom / autumn / winter). Each row is a
//                              season, each column is a growth stage.
// ───────────────────────────────────────────────────────────────────────

// Stage 0..5 → cell in tree-pine.png. Picked for clear size progression.
const PINE_STAGE_CELL: readonly CellPos[] = [
  { col: 0, row: 0 }, // 0 — seed in dirt
  { col: 1, row: 0 }, // 1 — sprout
  { col: 2, row: 0 }, // 2 — sapling
  { col: 0, row: 1 }, // 3 — young tree
  { col: 0, row: 2 }, // 4 — full tree
  { col: 0, row: 3 }, // 5 — full bloom
];

// Row index of each variant in tree-sheet.png (broadleaf seasonal sheet).
const BROADLEAF_VARIANT_ROW: Record<TreeVariant, number> = {
  green: 0,
  blossom: 1,
  autumn: 2,
  winter: 3,
};

// tree-sheet.png is 5 columns × 4 rows. Game has 6 stages (0=seed) but the
// sheet only depicts 5 distinct growth stages — we collapse stage 0 into
// column 0 (smallest sprout).
function broadleafStageToCol(stage: number): number {
  const clamped = Math.max(0, Math.min(5, stage));
  return Math.min(4, clamped === 0 ? 0 : clamped - 1);
}

export function Tree({ stage = 5, variant = 'green', size = 256, style }: TreeProps): JSX.Element {
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
  const clampedStage = Math.max(0, Math.min(TREE_STAGES.length - 1, stage));
  const grid = TREE_STAGES[clampedStage];
  const singlePngSrc = `/sprites/tree-${variant}-${clampedStage}.png`;

  const svgFallback: ReactNode = (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      style={{ shapeRendering: 'crispEdges', imageRendering: 'pixelated', display: 'block', ...style }}
    >
      <PixelGrid grid={grid} palette={palette} />
    </svg>
  );

  // ─── Tier 2: grid sheet ────────────────────────────────────────────
  // Green variant uses the new pine sheet. Other seasons stay on the
  // older broadleaf sheet so the seasonal swap (streak 10/25/50) keeps
  // working until pine variants are generated for those seasons.
  let sheetCell: ReactNode;
  if (variant === 'green') {
    const cell = PINE_STAGE_CELL[clampedStage] ?? PINE_STAGE_CELL[5];
    sheetCell = (
      <SheetCell
        src="/sprites/tree-pine.png"
        col={cell.col}
        row={cell.row}
        cols={4}
        rows={4}
        size={size}
        cellAspect={256 / 384}
        alt={`green pine tree stage ${clampedStage}`}
        fallback={svgFallback}
        style={style}
      />
    );
  } else {
    sheetCell = (
      <SheetCell
        src="/sprites/tree-sheet.png"
        col={broadleafStageToCol(stage)}
        row={BROADLEAF_VARIANT_ROW[variant]}
        cols={5}
        rows={4}
        size={size}
        cellAspect={256 / 307}
        alt={`${variant} tree stage ${clampedStage}`}
        fallback={svgFallback}
        style={style}
      />
    );
  }

  // ─── Tier 1: per-stage single PNG (future Aseprite export) ─────────
  return (
    <SpriteWithFallback
      src={singlePngSrc}
      size={size}
      alt={`${variant} tree stage ${clampedStage}`}
      style={style}
      fallback={sheetCell}
    />
  );
}
