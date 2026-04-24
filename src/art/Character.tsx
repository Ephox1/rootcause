import { useMemo, type CSSProperties } from 'react';
import { PixelGrid } from './PixelGrid';
import { SpriteWithFallback } from './SpriteWithFallback';
import type { CharacterState } from '../types';

const CHAR_PALETTE: Record<string, string> = {
  K: '#080408',
  o: '#1a0f08',
  S: '#e8c79a',
  s: '#c89870',
  p: '#a07050',
  H: '#0f0804',
  h: '#2a1808',
  i: '#48261a',
  B: '#1a2540',
  b: '#2a3a5e',
  n: '#4a5a8e',
  N: '#0f1628',
  M: '#080810',
  m: '#1a1a24',
  y: '#2a2a36',
  G: '#ff8c42',
  g: '#3fb950',
  e: '#c9d1d9',
  E: '#ffd26a',
  F: '#ff6b1a',
  f: '#ffd26a',
  D: '#2a180e',
  d: '#4a2f1e',
  u: '#6b4528',
  U: '#8a5830',
  C: '#6a3a1e',
  c: '#8a5a30',
  a: '#d4a074',
  W: '#fff',
  X: '#000',
  Q: '#141a2a',
  q: '#242a3a',
  r: '#7a3a2a',
  R: '#b24e32',
};

function makeCharGrid(state: CharacterState): string[] {
  const rows: string[][] = Array.from({ length: 48 }, () => Array<string>(48).fill(' '));
  const setCell = (x: number, y: number, k: string) => {
    if (y >= 0 && y < 48 && x >= 0 && x < 48) rows[y][x] = k;
  };
  const rect = (x: number, y: number, w: number, h: number, k: string) => {
    for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) setCell(x + xx, y + yy, k);
  };

  // Desk surface (wood plank)
  rect(2, 33, 44, 1, 'D');
  rect(2, 34, 44, 1, 'u');
  rect(2, 35, 44, 5, 'd');
  rect(2, 40, 44, 1, 'D');
  // Wood grain
  for (let x = 4; x < 44; x += 6) {
    setCell(x, 36, 'U');
    setCell(x + 2, 38, 'U');
  }
  // Desk legs
  rect(3, 40, 2, 6, 'D');
  rect(43, 40, 2, 6, 'D');

  // Floor shadow
  rect(2, 46, 44, 1, 'K');
  rect(4, 47, 40, 1, 'o');

  // --- Monitor on the left side of desk ---
  const mx = 3;
  const my = 12;
  // Bezel
  rect(mx, my, 22, 1, 'K');
  rect(mx, my + 1, 1, 20, 'K');
  rect(mx + 21, my + 1, 1, 20, 'K');
  rect(mx, my + 21, 22, 1, 'K');
  // Inner bezel
  rect(mx + 1, my + 1, 20, 1, 'm');
  rect(mx + 1, my + 20, 20, 1, 'm');
  rect(mx + 1, my + 2, 1, 18, 'm');
  rect(mx + 20, my + 2, 1, 18, 'm');
  // Screen
  rect(mx + 2, my + 2, 18, 18, 'M');
  // Code lines (orange/green/white glow)
  rect(mx + 3, my + 3, 10, 1, 'G');
  rect(mx + 3, my + 5, 6, 1, 'g');
  rect(mx + 10, my + 5, 8, 1, 'g');
  rect(mx + 3, my + 7, 12, 1, 'e');
  rect(mx + 3, my + 9, 5, 1, 'G');
  rect(mx + 9, my + 9, 9, 1, 'G');
  rect(mx + 3, my + 11, 8, 1, 'e');
  rect(mx + 12, my + 11, 6, 1, 'e');
  rect(mx + 3, my + 13, 10, 1, 'g');
  rect(mx + 3, my + 15, 4, 1, 'G');
  rect(mx + 8, my + 15, 10, 1, 'G');
  rect(mx + 3, my + 17, 12, 1, 'e');
  rect(mx + 3, my + 19, 6, 1, 'g');
  // Monitor stand
  rect(mx + 9, my + 22, 4, 2, 'o');
  rect(mx + 6, my + 24, 10, 1, 'K');
  rect(mx + 7, my + 25, 8, 1, 'o');

  // --- Coffee mug ---
  rect(28, 30, 4, 1, 'c');
  rect(28, 31, 4, 2, 'C');
  rect(32, 31, 1, 2, 'a');
  rect(28, 33, 4, 1, 'K');
  // Steam (only when not facepalm)
  if (state !== 'facepalm') {
    setCell(29, 27, 'a');
    setCell(29, 25, 'a');
    setCell(30, 28, 'a');
    setCell(30, 26, 'a');
    setCell(30, 24, 'a');
    setCell(31, 27, 'a');
    setCell(31, 25, 'a');
  }

  // --- Character (right side, facing left at monitor) ---
  const hx = 34;
  const hy = 6;

  // Chair (back + seat)
  rect(hx - 4, hy + 14, 14, 18, 'Q');
  rect(hx - 3, hy + 15, 12, 16, 'q');
  // Chair cushion lines
  rect(hx - 2, hy + 16, 10, 1, 'Q');
  rect(hx - 2, hy + 19, 10, 1, 'Q');
  rect(hx - 2, hy + 22, 10, 1, 'Q');

  // Head hair back
  rect(hx - 2, hy, 10, 1, 'H');
  rect(hx - 3, hy + 1, 12, 1, 'H');
  rect(hx - 3, hy + 2, 1, 4, 'H');
  rect(hx + 8, hy + 2, 1, 4, 'H');
  // Hair highlight strands
  setCell(hx, hy + 1, 'h');
  setCell(hx + 3, hy, 'h');
  setCell(hx + 5, hy + 1, 'h');
  setCell(hx + 6, hy, 'i');

  // Face
  rect(hx - 1, hy + 2, 8, 6, 'S');
  rect(hx - 1, hy + 7, 8, 1, 's');
  // Cheek shadow
  setCell(hx, hy + 5, 's');
  setCell(hx + 5, hy + 5, 's');
  // Ear shading
  setCell(hx - 1, hy + 4, 'p');
  setCell(hx + 6, hy + 4, 'p');

  // Eyes / mouth by state
  if (state === 'facepalm') {
    // Closed eyes (>_<)
    rect(hx + 1, hy + 4, 2, 1, 'K');
    rect(hx + 4, hy + 4, 2, 1, 'K');
    setCell(hx + 2, hy + 6, 'K');
    setCell(hx + 3, hy + 6, 'K');
  } else if (state === 'sunglasses' || state === 'fistpump') {
    // Sunglasses
    rect(hx - 1, hy + 4, 8, 2, 'X');
    setCell(hx + 3, hy + 4, 'F');
    setCell(hx + 1, hy + 4, 'W');
    setCell(hx + 5, hy + 4, 'W');
    // Smirk
    rect(hx + 2, hy + 7, 3, 1, 'K');
    setCell(hx + 4, hy + 7, 'r');
  } else if (state === 'thumbsup') {
    // Open eyes + smile
    rect(hx + 1, hy + 4, 1, 2, 'K');
    rect(hx + 5, hy + 4, 1, 2, 'K');
    rect(hx + 2, hy + 7, 3, 1, 'K');
    setCell(hx + 3, hy + 7, 'W');
  } else {
    // Idle
    rect(hx + 1, hy + 4, 1, 2, 'K');
    rect(hx + 5, hy + 4, 1, 2, 'K');
    setCell(hx + 3, hy + 7, 'K');
  }

  // Hoodie/jacket body
  rect(hx - 3, hy + 8, 13, 2, 'N');
  rect(hx - 2, hy + 9, 11, 9, 'B');
  rect(hx - 1, hy + 10, 9, 7, 'b');
  rect(hx, hy + 12, 7, 4, 'n');
  // Hoodie neck/zipper
  rect(hx + 2, hy + 9, 3, 3, 'N');
  setCell(hx + 3, hy + 10, 'S');
  // Hoodie strings
  setCell(hx + 2, hy + 11, 'W');
  setCell(hx + 4, hy + 11, 'W');
  setCell(hx + 2, hy + 12, 'W');
  setCell(hx + 4, hy + 12, 'W');

  // Waist / belt line
  rect(hx - 2, hy + 17, 11, 1, 'N');
  rect(hx - 2, hy + 18, 11, 4, 'Q');

  // Arms per state
  if (state === 'idle' || state === 'sunglasses') {
    // Both arms down on desk reaching to keyboard
    rect(hx - 3, hy + 13, 2, 6, 'B');
    rect(hx + 9, hy + 13, 2, 6, 'B');
    rect(hx - 4, hy + 18, 2, 3, 'S');
    rect(hx + 11, hy + 18, 2, 3, 'S');
    setCell(hx - 3, hy + 20, 'N');
    setCell(hx + 10, hy + 20, 'N');
  } else if (state === 'thumbsup') {
    // Right arm raised thumbs up, left on desk
    rect(hx - 3, hy + 13, 2, 6, 'B');
    rect(hx - 4, hy + 18, 2, 3, 'S');
    rect(hx + 9, hy + 9, 2, 6, 'B');
    rect(hx + 9, hy + 7, 2, 2, 'S');
    setCell(hx + 11, hy + 7, 'S');
    setCell(hx + 10, hy + 6, 'S');
  } else if (state === 'facepalm') {
    // Hand over face
    rect(hx, hy + 2, 6, 5, 'S');
    rect(hx + 1, hy + 3, 4, 3, 'p');
    rect(hx - 2, hy + 9, 2, 5, 'B');
    rect(hx + 9, hy + 13, 2, 6, 'B');
    rect(hx + 11, hy + 18, 2, 3, 'S');
  } else if (state === 'fistpump') {
    // Both arms raised victory
    rect(hx - 3, hy + 5, 2, 8, 'B');
    rect(hx - 3, hy + 3, 2, 2, 'S');
    rect(hx - 4, hy + 3, 1, 2, 'S');
    rect(hx + 9, hy + 5, 2, 8, 'B');
    rect(hx + 9, hy + 3, 2, 2, 'S');
    rect(hx + 11, hy + 3, 1, 2, 'S');
  }

  // Keyboard on desk in front of character
  rect(hx - 6, hy + 26, 18, 1, 'K');
  rect(hx - 6, hy + 27, 18, 3, 'm');
  rect(hx - 6, hy + 30, 18, 1, 'K');
  // Keycaps
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 7; c++) {
      setCell(hx - 5 + c * 2 + r, hy + 28 + r, 'y');
      setCell(hx - 4 + c * 2 + r, hy + 28 + r, 'y');
    }
  }

  return rows.map((r) => r.join(''));
}

interface CharacterProps {
  state?: CharacterState;
  size?: number;
  style?: CSSProperties;
}

export function Character({ state = 'idle', size = 256, style }: CharacterProps) {
  const grid = useMemo(() => makeCharGrid(state), [state]);
  return (
    <SpriteWithFallback
      src={`/sprites/character-${state}.png`}
      size={size}
      alt={`coder ${state}`}
      style={style}
      fallback={
        <svg
          viewBox="0 0 48 48"
          width={size}
          height={size}
          style={{ shapeRendering: 'crispEdges', imageRendering: 'pixelated', display: 'block', ...style }}
        >
          <PixelGrid grid={grid} palette={CHAR_PALETTE} />
        </svg>
      }
    />
  );
}
