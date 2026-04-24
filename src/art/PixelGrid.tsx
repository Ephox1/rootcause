interface PixelGridProps {
  grid: readonly string[];
  palette: Record<string, string>;
  cell?: number;
}

export function PixelGrid({ grid, palette, cell = 1 }: PixelGridProps) {
  const rects: JSX.Element[] = [];
  for (let y = 0; y < grid.length; y++) {
    const row = grid[y];
    let x = 0;
    while (x < row.length) {
      const ch = row[x];
      if (ch === ' ' || !palette[ch]) {
        x++;
        continue;
      }
      let run = 1;
      while (x + run < row.length && row[x + run] === ch) run++;
      rects.push(
        <rect
          key={`${y}-${x}`}
          x={x * cell}
          y={y * cell}
          width={run * cell}
          height={cell}
          fill={palette[ch]}
        />,
      );
      x += run;
    }
  }
  return <>{rects}</>;
}
