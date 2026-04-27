import { useEffect, useRef, useState, type CSSProperties } from 'react';
import type { CharacterState } from '../types';

// Painted character + desk frames live in /public/sprites/character/. Each
// sequence plays once on state-enter, then holds the final frame until the
// state changes. Idle and the streak states are single-frame.

const FRAME_MS = 140;
const DRINK_FRAME_MS = 200;

const SEQUENCES: Record<CharacterState, readonly string[]> = {
  idle: ['sprites/character/idle.png'],
  thumbsup: [
    'sprites/character/thumbsup-1.png',
    'sprites/character/thumbsup-2.png',
    'sprites/character/thumbsup-3.png',
  ],
  facepalm: [
    'sprites/character/wrong-1.png',
    'sprites/character/wrong-2.png',
    'sprites/character/wrong-3.png',
    'sprites/character/wrong-4.png',
    'sprites/character/wrong-5.png',
  ],
  sunglasses: ['sprites/character/streak.png'],
  fistpump: ['sprites/character/streak.png'],
};

// Full coffee-sip cycle - frames go forward to the mug-at-lips pose and back.
const DRINK_FRAMES: readonly string[] = [
  'sprites/character/drink-1.png',
  'sprites/character/drink-2.png',
  'sprites/character/drink-3.png',
  'sprites/character/drink-4.png',
  'sprites/character/drink-5.png',
  'sprites/character/drink-4.png',
  'sprites/character/drink-3.png',
  'sprites/character/drink-2.png',
  'sprites/character/drink-1.png',
];

interface CharacterAnimProps {
  state: CharacterState;
  size?: number;
  style?: CSSProperties;
  /**
   * When set, periodically plays the drink-coffee sequence over the idle
   * frame. The interval is the gap between sips. Smaller = more frequent
   * sipping. Only fires while `state` is 'idle'; reaction states
   * (thumbsup/facepalm/streak) take priority and abort any in-progress sip.
   */
  drinkIntervalMs?: number;
}

export function CharacterAnim({ state, size = 256, style, drinkIntervalMs }: CharacterAnimProps): JSX.Element {
  const [frameIndex, setFrameIndex] = useState(0);
  const [drinkSrc, setDrinkSrc] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);

  // State-driven animation - reset and step through whenever state changes.
  useEffect(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const frames = SEQUENCES[state];
    setFrameIndex(0);
    if (frames.length <= 1) return;

    let i = 0;
    timerRef.current = window.setInterval(() => {
      i += 1;
      if (i >= frames.length - 1) {
        setFrameIndex(frames.length - 1);
        if (timerRef.current !== null) {
          window.clearInterval(timerRef.current);
          timerRef.current = null;
        }
        return;
      }
      setFrameIndex(i);
    }, FRAME_MS);

    return () => {
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [state]);

  // Intermittent drink-coffee overlay. Only schedules sips while state is
  // 'idle'; any reaction state aborts and returns control to the state
  // animation above.
  useEffect(() => {
    if (!drinkIntervalMs || state !== 'idle') {
      setDrinkSrc(null);
      return;
    }

    let cancelled = false;
    let timer: number | null = null;

    const playSip = () => {
      let i = 0;
      const tick = () => {
        if (cancelled) return;
        if (i >= DRINK_FRAMES.length) {
          setDrinkSrc(null);
          schedule();
          return;
        }
        setDrinkSrc(DRINK_FRAMES[i]);
        i += 1;
        timer = window.setTimeout(tick, DRINK_FRAME_MS);
      };
      tick();
    };

    const schedule = () => {
      timer = window.setTimeout(playSip, drinkIntervalMs);
    };

    schedule();

    return () => {
      cancelled = true;
      if (timer !== null) window.clearTimeout(timer);
      setDrinkSrc(null);
    };
  }, [state, drinkIntervalMs]);

  const frames = SEQUENCES[state];
  const stateSrc = frames[Math.min(frameIndex, frames.length - 1)];
  const src = drinkSrc ?? stateSrc;

  return (
    <img
      src={src}
      alt={`coder ${state}`}
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
