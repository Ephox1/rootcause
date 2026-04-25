import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';

interface SheetCellProps {
  src: string;
  /** Column index of the cell within the sheet (0-based). */
  col: number;
  /** Row index of the cell within the sheet (0-based). */
  row: number;
  /** Total columns in the sheet. */
  cols: number;
  /** Total rows in the sheet. */
  rows: number;
  /** Display width in CSS pixels. Height is derived from cellAspect. */
  size: number;
  /** Source cell aspect ratio as height / width. Defaults to 1 (square). */
  cellAspect?: number;
  alt: string;
  /** Rendered when the sheet 404s or fails to load. */
  fallback: ReactNode;
  style?: CSSProperties;
}

/**
 * Crops a single cell out of a grid-layout sprite sheet using CSS
 * background-image + background-position. Falls back to the SVG/placeholder
 * children if the sheet isn't available.
 *
 * This is a stopgap for the animated-sheet tier until react-aseprite-sprite
 * (sibling repo) ships. That package will replace this with proper
 * Aseprite JSON-driven frame tags and animation playback.
 */
export function SheetCell({
  src,
  col,
  row,
  cols,
  rows,
  size,
  cellAspect = 1,
  alt,
  fallback,
  style,
}: SheetCellProps) {
  const [status, setStatus] = useState<'probing' | 'found' | 'missing'>('probing');

  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (!cancelled) setStatus('found');
    };
    img.onerror = () => {
      if (!cancelled) setStatus('missing');
    };
    img.src = src;
    return () => {
      cancelled = true;
    };
  }, [src]);

  if (status !== 'found') {
    return <>{fallback}</>;
  }

  const displayWidth = size;
  const displayHeight = size * cellAspect;

  return (
    <div
      role="img"
      aria-label={alt}
      style={{
        width: displayWidth,
        height: displayHeight,
        backgroundImage: `url(${src})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: `${cols * displayWidth}px ${rows * displayHeight}px`,
        backgroundPosition: `-${col * displayWidth}px -${row * displayHeight}px`,
        imageRendering: 'pixelated',
        ...style,
      }}
    />
  );
}
