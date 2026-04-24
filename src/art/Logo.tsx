import type { CSSProperties } from 'react';

// Chunky 8-bit ROOT CAUSE logo. Hand-drawn glyphs at 7 rows tall.
// Letter grids use '.' = filled, ' ' = empty. 2 cols of spacing between letters.

const GLYPHS: Record<string, string[]> = {
  R: [
    '. . . . .',
    '. . . . .',
    '. .     . .',
    '. . . . .',
    '. . . .',
    '. .   . .',
    '. .     . .',
  ],
  O: [
    '  . . . .  ',
    '. . . . . .',
    '. .     . .',
    '. .     . .',
    '. .     . .',
    '. . . . . .',
    '  . . . .  ',
  ],
  T: [
    '. . . . . . .',
    '. . . . . . .',
    '    . .    ',
    '    . .    ',
    '    . .    ',
    '    . .    ',
    '    . .    ',
  ],
  C: [
    '  . . . . . .',
    '. . . . . . .',
    '. .        ',
    '. .        ',
    '. .        ',
    '. . . . . . .',
    '  . . . . . .',
  ],
  A: [
    '  . . . .  ',
    '. . . . . .',
    '. .     . .',
    '. . . . . .',
    '. . . . . .',
    '. .     . .',
    '. .     . .',
  ],
  U: [
    '. .     . .',
    '. .     . .',
    '. .     . .',
    '. .     . .',
    '. .     . .',
    '. . . . . .',
    '  . . . .  ',
  ],
  S: [
    '  . . . . . .',
    '. . . . . . .',
    '. .        ',
    '  . . . .  ',
    '        . .',
    '. . . . . . .',
    '  . . . . .  ',
  ],
  E: [
    '. . . . . . .',
    '. . . . . . .',
    '. .        ',
    '. . . . .  ',
    '. .        ',
    '. . . . . . .',
    '. . . . . . .',
  ],
  ' ': ['       ', '       ', '       ', '       ', '       ', '       ', '       '],
};

function tokenize(row: string): boolean[] {
  // Each '.' and each ' ' is a cell. Handle " " as gap between pairs too.
  const cells: boolean[] = [];
  for (let i = 0; i < row.length; i++) {
    const ch = row[i];
    if (ch === '.') cells.push(true);
    else cells.push(false);
  }
  return cells;
}

function buildWord(word: string): boolean[][] {
  const glyphs = [...word].map((c) => GLYPHS[c] ?? GLYPHS[' ']);
  const rows: boolean[][] = [];
  for (let r = 0; r < 7; r++) {
    const merged: boolean[] = [];
    for (let g = 0; g < glyphs.length; g++) {
      const glyph = glyphs[g];
      const cells = tokenize(glyph[r]);
      merged.push(...cells);
      if (g < glyphs.length - 1) merged.push(false, false); // letter spacing
    }
    rows.push(merged);
  }
  return rows;
}

interface LogoProps {
  cell?: number;
  style?: CSSProperties;
}

/**
 * Chunky 8-bit ROOT CAUSE logo — cream "ROOT" over orange "CAUSE" with
 * inner highlight pixels and dark drop shadow for the 16-bit chiseled feel.
 */
export function Logo({ cell = 12, style }: LogoProps) {
  const rootGrid = buildWord('ROOT');
  const causeGrid = buildWord('CAUSE');

  const rootW = rootGrid[0].length;
  const causeW = causeGrid[0].length;
  const maxW = Math.max(rootW, causeW);

  // Combined: 7 rows ROOT + 2 rows gap + 7 rows CAUSE = 16 rows
  const rows = 7 + 2 + 7;
  const cols = maxW;

  const rootOffset = Math.floor((maxW - rootW) / 2);
  const causeOffset = Math.floor((maxW - causeW) / 2);

  return (
    <svg
      viewBox={`0 0 ${cols * cell} ${rows * cell}`}
      width={cols * cell}
      height={rows * cell}
      style={{ shapeRendering: 'crispEdges', imageRendering: 'pixelated', display: 'block', ...style }}
    >
      {/* Drop shadow (3px offset, repeated letters) */}
      <g transform={`translate(${cell * 0.3},${cell * 0.4})`} opacity="0.75">
        {rootGrid.map((row, y) =>
          row.map((on, x) =>
            on ? (
              <rect
                key={`rs-${y}-${x}`}
                x={(rootOffset + x) * cell}
                y={y * cell}
                width={cell}
                height={cell}
                fill="#000"
              />
            ) : null,
          ),
        )}
        {causeGrid.map((row, y) =>
          row.map((on, x) =>
            on ? (
              <rect
                key={`cs-${y}-${x}`}
                x={(causeOffset + x) * cell}
                y={(y + 9) * cell}
                width={cell}
                height={cell}
                fill="#000"
              />
            ) : null,
          ),
        )}
      </g>

      {/* ROOT — cream with inner highlight */}
      {rootGrid.map((row, y) =>
        row.map((on, x) => {
          if (!on) return null;
          // Top-row highlight, bottom-row shadow for chiseled feel
          let fill = '#f0d998';
          if (y === 0) fill = '#fde9c0';
          else if (y === 6) fill = '#b88a58';
          else if (y === 1 || y === 2) fill = '#f7deae';
          return (
            <rect
              key={`r-${y}-${x}`}
              x={(rootOffset + x) * cell}
              y={y * cell}
              width={cell}
              height={cell}
              fill={fill}
            />
          );
        }),
      )}

      {/* CAUSE — orange with inner highlight */}
      {causeGrid.map((row, y) =>
        row.map((on, x) => {
          if (!on) return null;
          let fill = '#ff7a28';
          if (y === 0) fill = '#ffb067';
          else if (y === 6) fill = '#b84a10';
          else if (y === 1 || y === 2) fill = '#ff8c42';
          else if (y === 5) fill = '#d85d10';
          return (
            <rect
              key={`c-${y}-${x}`}
              x={(causeOffset + x) * cell}
              y={(y + 9) * cell}
              width={cell}
              height={cell}
              fill={fill}
            />
          );
        }),
      )}

      {/* Decorative pixel speckles inside CAUSE */}
      {causeGrid.map((row, y) =>
        row.map((on, x) => {
          if (!on) return null;
          // Add speckle noise on every other cell of middle rows
          if (y === 2 && (x + y) % 3 === 0)
            return (
              <rect
                key={`cn-${y}-${x}`}
                x={(causeOffset + x) * cell + cell * 0.25}
                y={(y + 9) * cell + cell * 0.25}
                width={cell * 0.25}
                height={cell * 0.25}
                fill="#ffd08a"
              />
            );
          return null;
        }),
      )}
    </svg>
  );
}
