import { useEffect, useState, type CSSProperties } from 'react';
import { Tree } from '../art/Tree';
import { CharacterAnim } from '../art/CharacterAnim';
import { Bug, Leaf } from '../art/decor';
import type { CharacterState, Theme, TreeVariant } from '../types';

// Painted backgrounds share a 16:9 aspect ratio. The stage is locked to this
// ratio so tree/character/particle positions stay pinned to the same painted
// spot regardless of viewport - and identical across themes.
const STAGE_RATIO = 16 / 9;

// Compute the smallest stage box (preserving aspect ratio) that fully covers
// the viewport. The stage overflows the viewport on the long axis and is
// clipped by the parent's overflow:hidden - same effect as object-fit:cover,
// but applied to the whole stage so tree/character stay anchored to the
// painted ground. Re-runs on window resize.
function useStageSize(ratio: number): { w: number; h: number } {
  const [size, setSize] = useState(() => computeStageSize(ratio));
  useEffect(() => {
    const onResize = () => setSize(computeStageSize(ratio));
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [ratio]);
  return size;
}

function computeStageSize(ratio: number): { w: number; h: number } {
  if (typeof window === 'undefined') return { w: 0, h: 0 };
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const vpRatio = vw / vh;
  if (vpRatio > ratio) {
    // Viewport wider than stage ratio: width fills, height overflows.
    return { w: vw, h: vw / ratio };
  }
  // Viewport taller than stage ratio: height fills, width overflows.
  return { w: vh * ratio, h: vh };
}

interface SceneProps {
  stage?: number;
  variant?: TreeVariant;
  theme?: Theme;
  characterState?: CharacterState;
  streak?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  reducedMotion?: boolean;
  flashKey?: number | null;
  flashType?: 'correct' | 'wrong' | null;
  focusTree?: boolean;
  showCharacter?: boolean;
  showTree?: boolean;
  compact?: boolean;
  /** Pass-through to CharacterAnim - intermittent coffee-sip animation. */
  drinkIntervalMs?: number;
}

interface LeafParticle {
  id: string;
  x: number;
  delay: number;
  dur: number;
  drift: number;
}

interface Sparkle {
  id: string;
  x: number;
  y: number;
  delay: number;
  color: string;
}

interface BugParticle {
  id: string;
  fromX: number;
  toX: number;
  fromY: number;
  toY: number;
  delay: number;
  dur: number;
  rotate: number;
}

interface StuckBug {
  id: string;
  x: number;
  y: number;
}

type DriftStyle = CSSProperties & { '--drift'?: string };

const LEAF_COUNTS = { easy: 4, medium: 10, hard: 32 } as const;

export function Scene({
  stage = 5,
  variant = 'green',
  theme = 'dark',
  characterState = 'idle',
  streak = 0,
  difficulty = 'medium',
  reducedMotion = false,
  flashKey = null,
  flashType = null,
  focusTree = false,
  showCharacter = true,
  showTree = false,
  compact = false,
  drinkIntervalMs,
}: SceneProps): JSX.Element {
  const [leaves, setLeaves] = useState<LeafParticle[]>([]);
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const [bugs, setBugs] = useState<BugParticle[]>([]);
  const [stuckBugs, setStuckBugs] = useState<StuckBug[]>([]);

  useEffect(() => {
    if (!flashKey) return;
    if (reducedMotion) {
      if (flashType === 'wrong') {
        setStuckBugs((prev) => [
          ...prev.slice(-4),
          { id: `stuck-${flashKey}`, x: 42 + Math.random() * 14, y: 56 + Math.random() * 12 },
        ]);
      }
      return;
    }
    if (flashType === 'wrong') {
      const count = LEAF_COUNTS[difficulty];
      const items: LeafParticle[] = Array.from({ length: count }, (_, i) => ({
        id: `${flashKey}-l-${i}`,
        x: 28 + Math.random() * 44,
        delay: Math.random() * 0.6,
        dur: 1.6 + Math.random() * 1.4,
        drift: (Math.random() - 0.5) * 80,
      }));
      setLeaves((prev) => [...prev, ...items]);
      setStuckBugs((prev) => [
        ...prev.slice(-4),
        { id: `stuck-${flashKey}`, x: 42 + Math.random() * 14, y: 56 + Math.random() * 12 },
      ]);
      const t = window.setTimeout(
        () => setLeaves((p) => p.filter((l) => !items.find((i) => i.id === l.id))),
        3600,
      );
      return () => window.clearTimeout(t);
    }
    if (flashType === 'correct') {
      const sparks: Sparkle[] = Array.from({ length: 14 }, (_, i) => ({
        id: `${flashKey}-s-${i}`,
        x: 28 + Math.random() * 40,
        y: 30 + Math.random() * 38,
        delay: Math.random() * 0.25,
        color: i % 3 === 0 ? '#ffd26a' : '#ff8c42',
      }));
      setSparkles((prev) => [...prev, ...sparks]);
      const beetleCount = 3 + Math.floor(Math.random() * 3);
      const bbugs: BugParticle[] = Array.from({ length: beetleCount }, (_, i) => {
        const dir = Math.random() < 0.5 ? -1 : 1;
        return {
          id: `${flashKey}-b-${i}`,
          fromX: 48 + (Math.random() - 0.5) * 10,
          fromY: 48 + Math.random() * 10,
          toX: 48 + dir * (20 + Math.random() * 30),
          toY: 70 + Math.random() * 20,
          delay: Math.random() * 0.2,
          dur: 0.9 + Math.random() * 0.5,
          rotate: (Math.random() - 0.5) * 360,
        };
      });
      setBugs((prev) => [...prev, ...bbugs]);
      setStuckBugs([]);
      const t = window.setTimeout(() => {
        setSparkles((p) => p.filter((s) => !sparks.find((i) => i.id === s.id)));
        setBugs((p) => p.filter((b) => !bbugs.find((i) => i.id === b.id)));
      }, 1600);
      return () => window.clearTimeout(t);
    }
  }, [flashKey, flashType, reducedMotion, difficulty]);

  const isDark = theme === 'dark';
  const bgSrc = isDark ? 'sprites/bg-night.png' : 'sprites/bg-day.png';
  const { w: stageW, h: stageH } = useStageSize(STAGE_RATIO);

  // Tree displays in front of background, slightly right of center.
  // Sized as a fraction of stageH so it stays proportional to the painted
  // scene at any viewport (so the same composition reads the same in both
  // an embedded iframe and a fullscreen browser tab).
  const treeSize = Math.round(
    stageH * (focusTree ? 0.50 : compact ? 0.33 : 0.35),
  );
  // Character anchored bottom-LEFT to match the painted desk position.
  // Same stageH-fraction approach as the tree so the desk + character keep
  // the same proportions across viewport sizes.
  const charSize = Math.round(stageH * (compact ? 0.39 : 0.46));

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        backgroundColor: isDark ? '#02040a' : '#7dc4e8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: stageW,
          height: stageH,
          flexShrink: 0,
        }}
      >
        {/* Painted background fills the stage exactly */}
        <img
          src={bgSrc}
          alt=""
          aria-hidden
          draggable={false}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            display: 'block',
            imageRendering: 'pixelated',
            userSelect: 'none',
            pointerEvents: 'none',
          }}
        />

      {/* Subtle vignette for foreground UI legibility */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: isDark
            ? 'radial-gradient(ellipse at 50% 55%, transparent 35%, rgba(0,0,0,0.55) 100%)'
            : 'radial-gradient(ellipse at 50% 55%, transparent 50%, rgba(0,0,0,0.18) 100%)',
        }}
      />

      {/* Fireflies (dark) on streak ≥ 10 */}
      {isDark && streak >= 10 && !reducedMotion && (
        <>
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={`ff-${i}`}
              style={{
                position: 'absolute',
                left: `${20 + ((i * 9) % 60)}%`,
                top: `${48 + ((i * 13) % 30)}%`,
                width: 3,
                height: 3,
                background: '#ffd26a',
                borderRadius: '50%',
                boxShadow: '0 0 8px #ffd26a',
                animation: `rc-firefly ${3 + (i % 3)}s ${i * 0.3}s ease-in-out infinite`,
                pointerEvents: 'none',
              }}
            />
          ))}
        </>
      )}

      {/* Tree - centered slightly right, only shown during gameplay */}
      {showTree && (
        <div
          style={{
            position: 'absolute',
            left: focusTree ? '50%' : compact ? '46%' : '48%',
            bottom: '18%',
            marginLeft: -treeSize / 2,
            width: treeSize,
            transition: 'left 400ms, margin-left 400ms, width 400ms',
            filter: isDark ? 'drop-shadow(0 8px 0 rgba(0,0,0,.4))' : 'drop-shadow(0 6px 0 rgba(0,0,0,.25))',
          }}
        >
          <Tree stage={stage} variant={variant} size={treeSize} />
        </div>
      )}

      {/* Stuck bugs sit on the trunk after wrong answers */}
      {stuckBugs.map((b) => (
        <div
          key={b.id}
          style={{
            position: 'absolute',
            left: `${b.x}%`,
            top: `${b.y}%`,
            filter: 'drop-shadow(0 0 3px rgba(255,107,26,.5))',
            pointerEvents: 'none',
          }}
        >
          <Bug size={16} />
        </div>
      ))}

      {/* Streak fire above tree */}
      {showTree && streak >= 5 && !reducedMotion && (
        <div
          style={{
            position: 'absolute',
            left: focusTree ? '50%' : compact ? '50%' : '54%',
            bottom: '54%',
            marginLeft: -16,
            animation: 'rc-flicker 0.28s ease-in-out infinite alternate',
            filter: streak >= 15 ? 'drop-shadow(0 0 14px #ff6b1a)' : 'drop-shadow(0 0 8px #ff8c42)',
            pointerEvents: 'none',
          }}
        >
          <svg
            viewBox="0 0 10 10"
            width={streak >= 15 ? 48 : 32}
            height={streak >= 15 ? 48 : 32}
            style={{ shapeRendering: 'crispEdges' }}
          >
            <rect x="4" y="0" width="2" height="1" fill="#ffd26a" />
            <rect x="3" y="1" width="4" height="1" fill="#ffd26a" />
            <rect x="2" y="2" width="6" height="1" fill="#ff8c42" />
            <rect x="2" y="3" width="6" height="2" fill="#ff6b1a" />
            <rect x="1" y="5" width="8" height="2" fill="#ff6b1a" />
            <rect x="2" y="7" width="6" height="1" fill="#ff8c42" />
            <rect x="3" y="8" width="4" height="1" fill="#ffd26a" />
          </svg>
        </div>
      )}

      {/* Character - desk right edge anchored to ~45% of stage (just left of
          the tree mound at 48%). translateX(-85%) shifts by the ratio of the
          desk's right edge inside the source PNG, so alignment stays fixed
          across viewports rather than drifting with stage size. */}
      {showCharacter && !focusTree && (
        <div
          style={{
            position: 'absolute',
            // Bug Hunt sits slightly further left so the plant mound stays
            // clearly visible to the right of the desk. Type Race shifts
            // even further left so the character isn't hidden behind the
            // pixel keyboard at non-fullscreen viewport sizes.
            left: compact ? '35%' : '42%',
            bottom: compact ? '-3%' : '-5%',
            width: charSize,
            transform: 'translateX(-85%)',
            filter: isDark ? 'drop-shadow(0 0 18px rgba(255,140,66,.18))' : 'none',
            transition: 'width 300ms',
            pointerEvents: 'none',
          }}
        >
          <CharacterAnim
            state={characterState}
            size={charSize}
            drinkIntervalMs={drinkIntervalMs}
          />
        </div>
      )}

      {/* Falling leaves on wrong answer */}
      {leaves.map((l) => {
        const style: DriftStyle = {
          position: 'absolute',
          left: `${l.x}%`,
          top: '28%',
          animation: `rc-leaffall ${l.dur}s ${l.delay}s ease-in forwards`,
          '--drift': `${l.drift}px`,
          pointerEvents: 'none',
        };
        return (
          <div key={l.id} style={style}>
            <Leaf size={14} variant={variant} />
          </div>
        );
      })}

      {/* Sparkles on correct */}
      {sparkles.map((s) => (
        <div
          key={s.id}
          style={{
            position: 'absolute',
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: 6,
            height: 6,
            background: s.color,
            boxShadow: `0 0 12px ${s.color}`,
            animation: `rc-sparkle 0.85s ${s.delay}s ease-out forwards`,
            pointerEvents: 'none',
          }}
        />
      ))}

      {/* Bug scatter on correct */}
      {bugs.map((b) => (
        <div
          key={b.id}
          style={{
            position: 'absolute',
            left: `${b.fromX}%`,
            top: `${b.fromY}%`,
            animation: `rc-bugscatter-${b.id} ${b.dur}s ${b.delay}s ease-out forwards`,
            pointerEvents: 'none',
          }}
        >
          <style>{`
            @keyframes rc-bugscatter-${b.id} {
              0% { transform: translate(0, 0) rotate(0deg); opacity: 1; }
              80% { opacity: 1; }
              100% {
                transform: translate(${(b.toX - b.fromX) * 10}px, ${(b.toY - b.fromY) * 5}px) rotate(${b.rotate}deg);
                opacity: 0;
              }
            }
          `}</style>
          <Bug size={14} />
        </div>
      ))}
      </div>
    </div>
  );
}
