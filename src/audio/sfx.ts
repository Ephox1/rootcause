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
