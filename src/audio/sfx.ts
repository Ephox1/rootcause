import { engine } from './ChiptuneEngine';

/**
 * Short SFX synthesized on the fly. Layered with the real-recording MP3 SFX
 * (correct/wrong/streak/leaf-fall/tree-grow/fail) - these chiptune blips
 * cover the ambient creature/foliage textures and the typing keypress click.
 */

function randPick<T>(xs: readonly T[]): T {
  return xs[Math.floor(Math.random() * xs.length)];
}

export function sfxKeypress(): void {
  engine.playBlip({
    channel: 'noise',
    notes: [],
    pitchSlide: { from: 'A5', to: 'A4', duration: 0.03 },
    volume: 0.1,
  });
}

/**
 * Bugs scattering - 3-6 rapid chirps at scattered pitches. Layered after
 * the real correct-answer MP3 to match the visual bug-scatter particles.
 */
export function sfxBugScatter(): void {
  const now = engine.now();
  const count = 4 + Math.floor(Math.random() * 3);
  const pitches = ['F6', 'G6', 'A6', 'B6', 'C7', 'D7'];
  for (let i = 0; i < count; i++) {
    const t = now + i * 0.045 + Math.random() * 0.03;
    const note = randPick(pitches);
    engine.scheduleNote('pulse1', note, t, 0.035);
    engine.scheduleNote('noise', 'C6', t, 0.02);
  }
}

/**
 * A single bug skittering - tiny rhythmic noise clicks, like six tiny feet
 * tapping bark. Fires when a bug lands on the tree after a wrong answer.
 */
export function sfxBugCrawl(): void {
  const now = engine.now();
  for (let i = 0; i < 6; i++) {
    const t = now + i * 0.09 + (Math.random() - 0.5) * 0.01;
    engine.scheduleNote('noise', 'E6', t, 0.018);
    engine.scheduleNote('noise', 'D6', t + 0.035, 0.018);
  }
}

/**
 * Bug squash - short low crunch when the next correct answer clears a stuck
 * bug from the tree.
 */
export function sfxBugSquash(): void {
  const t = engine.now();
  engine.scheduleNote('noise', 'C3', t, 0.09);
  engine.scheduleNote('pulse2', 'A3', t + 0.01, 0.07);
  engine.scheduleNote('triangle', 'A2', t, 0.12);
}
