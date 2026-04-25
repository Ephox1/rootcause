import { useEffect, useState, type CSSProperties } from 'react';
import { Tree } from '../art/Tree';
import { Character } from '../art/Character';
import { Bug, Butterfly, Cabin, Cloud, Leaf, Moon, StarField, Sun } from '../art/decor';
import type { CharacterState, Theme, TreeVariant } from '../types';

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
  compact?: boolean;
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
  compact = false,
}: SceneProps) {
  const isDark = theme === 'dark';

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
          {
            id: `stuck-${flashKey}`,
            x: 42 + Math.random() * 14,
            y: 56 + Math.random() * 12,
          },
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
        {
          id: `stuck-${flashKey}`,
          x: 42 + Math.random() * 14,
          y: 56 + Math.random() * 12,
        },
      ]);
      const t = setTimeout(
        () => setLeaves((p) => p.filter((l) => !items.find((i) => i.id === l.id))),
        3600,
      );
      return () => clearTimeout(t);
    }
    if (flashType === 'correct') {
      // Sparkles around tree
      const sparks: Sparkle[] = Array.from({ length: 14 }, (_, i) => ({
        id: `${flashKey}-s-${i}`,
        x: 28 + Math.random() * 40,
        y: 30 + Math.random() * 38,
        delay: Math.random() * 0.25,
        color: i % 3 === 0 ? '#ffd26a' : '#ff8c42',
      }));
      setSparkles((prev) => [...prev, ...sparks]);
      // Bug scatter off the code panel
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
      // Clear stuck bug when answer is correct (bug got squashed)
      setStuckBugs([]);
      const t = setTimeout(() => {
        setSparkles((p) => p.filter((s) => !sparks.find((i) => i.id === s.id)));
        setBugs((p) => p.filter((b) => !bbugs.find((i) => i.id === b.id)));
      }, 1600);
      return () => clearTimeout(t);
    }
  }, [flashKey, flashType, reducedMotion, difficulty]);

  const sky = isDark
    ? { top: '#02040a', mid: '#0a0f1f', upper: '#121a30', lower: '#1d2638', horizon: '#2d3450' }
    : { top: '#7dc4e8', mid: '#a3d5ea', upper: '#c5e3ee', lower: '#d9ead0', horizon: '#f0e3c4' };

  const mountainFar = isDark ? '#070a14' : '#4a6b7a';
  const mountainDark = isDark ? '#0a0e18' : '#5a7988';
  const mountainMid = isDark ? '#13192c' : '#6a8a98';
  const hillsFar = isDark ? '#171d30' : '#9ab88a';
  const hillsMid = isDark ? '#1c2338' : '#7a9e6a';
  const groundGrass = isDark ? '#1a2f1a' : '#5a7a3a';
  const groundGrassHi = isDark ? '#2a4a24' : '#7aa04a';
  const groundSoil = isDark ? '#0c1408' : '#4a3820';
  const fogColor = isDark ? 'rgba(60, 74, 110, 0.18)' : 'rgba(255, 248, 240, 0.35)';

  const treeSize = compact ? 220 : focusTree ? 320 : 300;
  // Character sheet cells are 1:2 aspect (256x512), so actual render height
  // is charSize * 2. Keep charSize modest so the tower-tall sprite doesn't
  // dwarf the tree.
  const charSize = compact ? 130 : 180;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        background: `linear-gradient(180deg, ${sky.top} 0%, ${sky.mid} 25%, ${sky.upper} 48%, ${sky.lower} 72%, ${sky.horizon} 100%)`,
      }}
    >
      {/* Stars or clouds */}
      {isDark ? (
        <svg width="100%" height="70%" style={{ position: 'absolute', inset: 0 }}>
          <StarField count={90} />
        </svg>
      ) : (
        <>
          {[
            { x: 12, y: 14, w: 80, d: 0 },
            { x: 55, y: 8, w: 100, d: 2 },
            { x: 72, y: 22, w: 70, d: 4 },
            { x: 25, y: 26, w: 60, d: 3 },
          ].map((c, i) => (
            <div
              key={i}
              aria-hidden
              style={{
                position: 'absolute',
                left: `${c.x}%`,
                top: `${c.y}%`,
                animation: reducedMotion ? 'none' : `rc-bob ${6 + c.d}s ease-in-out infinite`,
              }}
            >
              <Cloud size={c.w} />
            </div>
          ))}
        </>
      )}

      {/* Sun / Moon */}
      <div
        style={{
          position: 'absolute',
          top: '6%',
          right: '8%',
          filter: isDark
            ? 'drop-shadow(0 0 24px rgba(251,197,101,.55))'
            : 'drop-shadow(0 0 28px rgba(255,200,80,.65))',
        }}
      >
        {isDark ? <Moon size={58} /> : <Sun size={64} />}
      </div>

      {/* Far mountains */}
      <svg
        viewBox="0 0 100 16"
        preserveAspectRatio="none"
        style={{ position: 'absolute', left: 0, right: 0, bottom: '38%', width: '100%', height: '15%', opacity: 0.85 }}
      >
        <polygon
          fill={mountainFar}
          points="0,16 0,11 4,9 9,6 14,10 20,5 26,9 33,4 40,8 48,3 56,7 64,4 72,8 80,6 88,10 94,7 100,9 100,16"
        />
      </svg>

      {/* Fog band */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: '30%',
          height: '14%',
          background: `linear-gradient(180deg, transparent 0%, ${fogColor} 55%, transparent 100%)`,
          filter: 'blur(1px)',
          pointerEvents: 'none',
        }}
      />

      {/* Mid mountains */}
      <svg
        viewBox="0 0 100 20"
        preserveAspectRatio="none"
        style={{ position: 'absolute', left: 0, right: 0, bottom: '32%', width: '100%', height: '18%' }}
      >
        <polygon
          fill={mountainDark}
          points="0,20 0,12 6,8 12,14 18,6 24,10 30,4 38,12 46,5 54,11 62,3 70,9 78,6 86,12 92,7 100,11 100,20"
        />
      </svg>

      {/* Near mountains */}
      <svg
        viewBox="0 0 100 20"
        preserveAspectRatio="none"
        style={{ position: 'absolute', left: 0, right: 0, bottom: '26%', width: '100%', height: '14%' }}
      >
        <polygon
          fill={mountainMid}
          points="0,20 0,14 10,10 20,15 32,9 44,13 58,8 72,14 84,10 100,13 100,20"
        />
      </svg>

      <div
        aria-hidden
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: '22%',
          height: '12%',
          background: `linear-gradient(180deg, transparent 0%, ${fogColor} 70%, transparent 100%)`,
          filter: 'blur(2px)',
          pointerEvents: 'none',
        }}
      />

      {/* Hills */}
      <svg
        viewBox="0 0 100 16"
        preserveAspectRatio="none"
        style={{ position: 'absolute', left: 0, right: 0, bottom: '22%', width: '100%', height: '12%' }}
      >
        <path
          fill={hillsFar}
          d="M0,16 L0,10 Q8,6 16,10 Q26,14 36,8 Q48,4 60,10 Q72,14 84,9 Q92,6 100,10 L100,16 Z"
        />
      </svg>

      {/* Cabin on right */}
      <div
        style={{
          position: 'absolute',
          right: '8%',
          bottom: '28%',
          filter: isDark ? 'drop-shadow(0 0 12px rgba(255,140,66,.25))' : 'none',
        }}
      >
        <Cabin size={54} theme={theme} />
      </div>

      {/* Ground */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: '22%',
          background: `linear-gradient(180deg, ${hillsMid} 0%, ${groundGrass} 40%, ${groundSoil} 100%)`,
        }}
      />

      {/* Grass blades */}
      <svg
        viewBox="0 0 100 4"
        preserveAspectRatio="none"
        aria-hidden
        style={{ position: 'absolute', left: 0, right: 0, bottom: '20%', width: '100%', height: '3%' }}
      >
        {Array.from({ length: 48 }).map((_, i) => (
          <rect
            key={i}
            x={i * 2.08 + (i % 2 ? 0.3 : 0.8)}
            y={1 + (i % 3) * 0.4}
            width={0.4}
            height={1.6 - (i % 3) * 0.3}
            fill={groundGrassHi}
          />
        ))}
      </svg>

      {/* Fireflies (dark) or butterflies (light) on streak ≥ 10 */}
      {streak >= 10 && !reducedMotion && (
        <>
          {Array.from({ length: 8 }).map((_, i) =>
            isDark ? (
              <div
                key={`ff-${i}`}
                style={{
                  position: 'absolute',
                  left: `${25 + ((i * 9) % 55)}%`,
                  top: `${42 + ((i * 13) % 38)}%`,
                  width: 3,
                  height: 3,
                  background: '#ffd26a',
                  borderRadius: '50%',
                  boxShadow: '0 0 8px #ffd26a',
                  animation: `rc-firefly ${3 + (i % 3)}s ${i * 0.3}s ease-in-out infinite`,
                }}
              />
            ) : (
              <div
                key={`bf-${i}`}
                style={{
                  position: 'absolute',
                  left: `${28 + ((i * 9) % 50)}%`,
                  top: `${42 + ((i * 13) % 30)}%`,
                  animation: `rc-firefly ${4 + (i % 3)}s ${i * 0.4}s ease-in-out infinite`,
                }}
              >
                <Butterfly size={14} />
              </div>
            ),
          )}
        </>
      )}

      {/* Tree */}
      <div
        style={{
          position: 'absolute',
          left: focusTree ? '50%' : compact ? '35%' : '38%',
          bottom: compact ? '6%' : '8%',
          marginLeft: -treeSize / 2,
          width: treeSize,
          height: treeSize,
          transition: 'left 400ms, margin-left 400ms, width 400ms, height 400ms',
          filter: isDark ? 'drop-shadow(0 8px 0 rgba(0,0,0,.4))' : 'drop-shadow(0 8px 0 rgba(0,0,0,.2))',
        }}
      >
        <Tree stage={stage} variant={variant} size={treeSize} />
      </div>

      {/* Stuck bugs (one per wrong answer, sit on trunk) */}
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

      {/* Streak fire */}
      {streak >= 5 && !reducedMotion && (
        <div
          style={{
            position: 'absolute',
            left: focusTree ? '50%' : compact ? '35%' : '38%',
            bottom: '58%',
            marginLeft: -16,
            animation: 'rc-flicker 0.28s ease-in-out infinite alternate',
            filter: streak >= 15 ? 'drop-shadow(0 0 14px #ff6b1a)' : 'drop-shadow(0 0 8px #ff8c42)',
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

      {/* Character — width-anchored; height flexes with sprite aspect. */}
      {showCharacter && !focusTree && (
        <div
          style={{
            position: 'absolute',
            right: compact ? '6%' : '10%',
            bottom: compact ? '4%' : '6%',
            width: charSize,
            filter: isDark ? 'drop-shadow(0 0 18px rgba(255,140,66,.2))' : 'none',
            transition: 'width 300ms',
          }}
        >
          <Character state={characterState} size={charSize} />
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
              0% {
                transform: translate(0, 0) rotate(0deg);
                opacity: 1;
              }
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

      {/* Vignette */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: isDark
            ? 'radial-gradient(ellipse at 50% 60%, transparent 40%, rgba(0,0,0,.55) 100%)'
            : 'radial-gradient(ellipse at 50% 60%, transparent 50%, rgba(0,0,0,.2) 100%)',
        }}
      />
    </div>
  );
}
