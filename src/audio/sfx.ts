import { engine } from './ChiptuneEngine';

/**
 * Short SFX synthesized on the fly. Each one is a burst of 1–3 notes with
 * quick envelopes and pitch slides. Styled after NES-era game feedback:
 * a rising arp for "correct", a descending buzz for "wrong", a click for
 * buttons, a soft tap for keypresses, a bright chime for tree growth, and
 * a triumphant fanfare for streak milestones.
 */

export function sfxCorrect(): void {
  const t = engine.now();
  engine.scheduleNote('pulse1', 'E5', t + 0.0, 0.08);
  engine.scheduleNote('pulse1', 'G5', t + 0.08, 0.08);
  engine.scheduleNote('pulse1', 'C6', t + 0.16, 0.14);
  engine.scheduleNote('pulse2', 'C5', t + 0.0, 0.22);
}

export function sfxWrong(): void {
  engine.playBlip({
    channel: 'pulse2',
    notes: [],
    pitchSlide: { from: 'B4', to: 'E3', duration: 0.35 },
  });
}

export function sfxClick(): void {
  const t = engine.now();
  engine.scheduleNote('pulse1', 'A4', t, 0.04);
}

export function sfxKeypress(): void {
  engine.playBlip({
    channel: 'noise',
    notes: [],
    pitchSlide: { from: 'A5', to: 'A4', duration: 0.03 },
    volume: 0.1,
  });
}

export function sfxTreeGrow(): void {
  const t = engine.now();
  engine.scheduleNote('pulse1', 'C5', t + 0.0, 0.12);
  engine.scheduleNote('pulse1', 'E5', t + 0.08, 0.12);
  engine.scheduleNote('pulse1', 'G5', t + 0.16, 0.12);
  engine.scheduleNote('pulse1', 'C6', t + 0.24, 0.2);
  engine.scheduleNote('pulse2', 'E5', t + 0.16, 0.28);
  engine.scheduleNote('triangle', 'C3', t + 0.0, 0.4);
}

export function sfxStreak5(): void {
  const t = engine.now();
  engine.scheduleNote('pulse1', 'G5', t + 0.0, 0.1);
  engine.scheduleNote('pulse1', 'C6', t + 0.08, 0.1);
  engine.scheduleNote('pulse1', 'E6', t + 0.16, 0.14);
  engine.scheduleNote('pulse2', 'C5', t + 0.0, 0.3);
  engine.scheduleNote('pulse2', 'E5', t + 0.1, 0.22);
}

export function sfxStreak15(): void {
  const t = engine.now();
  // Full fanfare — C major I-V-I with harmony
  const melody: [string, number][] = [
    ['C5', 0.0], ['E5', 0.08], ['G5', 0.16], ['C6', 0.24],
    ['G5', 0.4], ['C6', 0.48], ['E6', 0.56], ['G6', 0.64],
  ];
  melody.forEach(([note, offset]) => {
    engine.scheduleNote('pulse1', note, t + offset, 0.1);
  });
  engine.scheduleNote('pulse2', 'E5', t + 0.0, 0.4);
  engine.scheduleNote('pulse2', 'G5', t + 0.4, 0.4);
  engine.scheduleNote('triangle', 'C3', t + 0.0, 0.4);
  engine.scheduleNote('triangle', 'G3', t + 0.4, 0.4);
  engine.scheduleNote('noise', 'C5', t + 0.0, 0.06);
  engine.scheduleNote('noise', 'C5', t + 0.2, 0.06);
  engine.scheduleNote('noise', 'C5', t + 0.4, 0.06);
}

export function sfxTreeBreak(): void {
  const t = engine.now();
  engine.scheduleNote('noise', 'C4', t, 0.2);
  engine.scheduleNote('pulse2', 'A3', t, 0.25);
  engine.scheduleNote('triangle', 'A2', t, 0.3);
}

// ──────────────────────────────────────────────────────────────────────
// Ambient creature / foliage SFX — all noise-channel based, since filtered
// white noise is how NES-era games made wind, rustling, and insect sounds.
// ──────────────────────────────────────────────────────────────────────

function randPick<T>(xs: readonly T[]): T {
  return xs[Math.floor(Math.random() * xs.length)];
}

/**
 * Rustling leaves / bush shake. A burst of high-pitched filtered noise with
 * randomized pitch and timing to give it organic "shhhhh" texture. Fired
 * on wrong-answer leaf fall. Intensity param scales length + density.
 */
export function sfxRustle(intensity: 'light' | 'medium' | 'heavy' = 'medium'): void {
  const now = engine.now();
  const count = intensity === 'light' ? 8 : intensity === 'medium' ? 16 : 28;
  const pitches = ['D6', 'E6', 'F6', 'G6', 'A6', 'B6'];
  for (let i = 0; i < count; i++) {
    const t = now + i * 0.028 + Math.random() * 0.02;
    const note = randPick(pitches);
    const dur = 0.04 + Math.random() * 0.04;
    engine.scheduleNote('noise', note, t, dur);
  }
  // A low whoosh undertone — like wind through branches
  engine.playBlip({
    channel: 'noise',
    notes: [],
    pitchSlide: { from: 'G4', to: 'C3', duration: count * 0.03 },
    volume: 0.09,
  });
}

/**
 * Bugs scattering — 3–6 rapid chirps at scattered pitches, like insects
 * fleeing in different directions. Fires on correct answer to match the
 * visual bug-scatter particle effect.
 */
export function sfxBugScatter(): void {
  const now = engine.now();
  const count = 4 + Math.floor(Math.random() * 3);
  const pitches = ['F6', 'G6', 'A6', 'B6', 'C7', 'D7'];
  for (let i = 0; i < count; i++) {
    const t = now + i * 0.045 + Math.random() * 0.03;
    const note = randPick(pitches);
    // Each beetle: a tiny pulse chirp + noise click for the "skitter"
    engine.scheduleNote('pulse1', note, t, 0.035);
    engine.scheduleNote('noise', 'C6', t, 0.02);
  }
}

/**
 * A single bug skittering — tiny rhythmic noise clicks, like six tiny feet
 * tapping on bark. Fires when a bug lands on the tree after a wrong answer.
 */
export function sfxBugCrawl(): void {
  const now = engine.now();
  // 6 pairs of alternating ticks, slightly irregular for organic feel
  for (let i = 0; i < 6; i++) {
    const t = now + i * 0.09 + (Math.random() - 0.5) * 0.01;
    engine.scheduleNote('noise', 'E6', t, 0.018);
    engine.scheduleNote('noise', 'D6', t + 0.035, 0.018);
  }
}

/**
 * Bug squash — a short low crunch. Plays when the stuck bug on the tree is
 * cleared by the next correct answer. Subtle, low-volume.
 */
export function sfxBugSquash(): void {
  const t = engine.now();
  engine.scheduleNote('noise', 'C3', t, 0.09);
  engine.scheduleNote('pulse2', 'A3', t + 0.01, 0.07);
  engine.scheduleNote('triangle', 'A2', t, 0.12);
}

/**
 * A single falling leaf — very soft, short high-pitched rustle. Could be
 * used to accent individual leaves drifting in ambient moments.
 */
export function sfxLeafDrift(): void {
  engine.playBlip({
    channel: 'noise',
    notes: [],
    pitchSlide: { from: 'A6', to: 'D5', duration: 0.4 },
    volume: 0.06,
  });
}
