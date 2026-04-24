import type { Channel, Step } from './ChiptuneEngine';

export interface Track {
  id: string;
  name: string;
  baseBPM: number;
  /**
   * Type Race tracks set this so the sequencer can ramp tempo.
   * Final BPM after `rampSeconds`. Linear interpolation.
   */
  tempoRamp?: { targetBPM: number; rampSeconds: number };
  /** 16th notes per bar (4/4 = 16). */
  stepsPerBar: number;
  channels: Record<Channel, Step[]>;
}

/**
 * Note-format helpers. Steps are [note | null, durationIn16ths].
 * A bar of 4/4 is 16 sixteenth-notes.
 */

// ──────────────────────────────────────────────────────────────────────
// Title theme — slow, atmospheric, melancholy-warm. Am → F → C → G loop.
// "coding at night in the cabin"
// ──────────────────────────────────────────────────────────────────────
const TITLE: Track = {
  id: 'title',
  name: 'Cabin Night',
  baseBPM: 82,
  stepsPerBar: 16,
  channels: {
    pulse1: [
      // Bar 1 — Am
      ['A4', 4], ['C5', 2], ['E5', 2], ['A5', 4], ['E5', 4],
      // Bar 2 — F
      ['F4', 4], ['A4', 2], ['C5', 2], ['F5', 4], ['C5', 4],
      // Bar 3 — C
      ['C5', 4], ['E5', 2], ['G5', 2], ['C6', 4], ['G5', 4],
      // Bar 4 — G
      ['G4', 4], ['B4', 2], ['D5', 2], ['G5', 4], ['D5', 4],
    ],
    pulse2: [
      // Harmonies a third below
      ['E4', 4], ['A4', 2], ['C5', 2], ['E5', 4], ['C5', 4],
      ['C4', 4], ['F4', 2], ['A4', 2], ['C5', 4], ['A4', 4],
      ['G4', 4], ['C5', 2], ['E5', 2], ['G5', 4], ['E5', 4],
      ['D4', 4], ['G4', 2], ['B4', 2], ['D5', 4], ['B4', 4],
    ],
    triangle: [
      // Bass root + fifth
      ['A2', 8], ['E3', 8],
      ['F2', 8], ['C3', 8],
      ['C3', 8], ['G3', 8],
      ['G2', 8], ['D3', 8],
    ],
    noise: [
      // Sparse, soft hi-hat on offbeats — null means rest
      [null, 4], ['C4', 2], [null, 2], [null, 4], ['C4', 2], [null, 2],
      [null, 4], ['C4', 2], [null, 2], [null, 4], ['C4', 2], [null, 2],
      [null, 4], ['C4', 2], [null, 2], [null, 4], ['C4', 2], [null, 2],
      [null, 4], ['C4', 2], [null, 2], [null, 4], ['C4', 2], [null, 2],
    ],
  },
};

// ──────────────────────────────────────────────────────────────────────
// Bug Hunt A — upbeat major-key hunt theme
// I – vi – IV – V in C major, bouncy rhythm
// ──────────────────────────────────────────────────────────────────────
const BUGHUNT_A: Track = {
  id: 'bughunt-a',
  name: 'On the Scent',
  baseBPM: 118,
  stepsPerBar: 16,
  channels: {
    pulse1: [
      // Bar 1 — C
      ['C5', 2], ['E5', 2], ['G5', 2], ['E5', 2], ['C5', 2], ['G5', 2], ['E5', 2], ['G5', 2],
      // Bar 2 — Am
      ['A4', 2], ['C5', 2], ['E5', 2], ['C5', 2], ['A4', 2], ['E5', 2], ['C5', 2], ['E5', 2],
      // Bar 3 — F
      ['F4', 2], ['A4', 2], ['C5', 2], ['A4', 2], ['F4', 2], ['C5', 2], ['A4', 2], ['C5', 2],
      // Bar 4 — G
      ['G4', 2], ['B4', 2], ['D5', 2], ['B4', 2], ['G4', 2], ['D5', 2], ['B4', 2], ['D5', 2],
    ],
    pulse2: [
      // Counter-melody, one step offset
      [null, 1], ['E5', 3], [null, 2], ['G5', 2], [null, 2], ['E5', 4], [null, 2],
      [null, 1], ['C5', 3], [null, 2], ['E5', 2], [null, 2], ['C5', 4], [null, 2],
      [null, 1], ['A4', 3], [null, 2], ['C5', 2], [null, 2], ['A4', 4], [null, 2],
      [null, 1], ['D5', 3], [null, 2], ['B4', 2], [null, 2], ['G4', 4], [null, 2],
    ],
    triangle: [
      ['C3', 2], [null, 2], ['G2', 2], [null, 2], ['C3', 2], [null, 2], ['G2', 2], [null, 2],
      ['A2', 2], [null, 2], ['E3', 2], [null, 2], ['A2', 2], [null, 2], ['E3', 2], [null, 2],
      ['F2', 2], [null, 2], ['C3', 2], [null, 2], ['F2', 2], [null, 2], ['C3', 2], [null, 2],
      ['G2', 2], [null, 2], ['D3', 2], [null, 2], ['G2', 2], [null, 2], ['D3', 2], [null, 2],
    ],
    noise: [
      // Simple 4-on-floor kick-ish + hat
      ['C3', 1], [null, 1], ['C5', 1], [null, 1], ['C3', 1], [null, 1], ['C5', 1], [null, 1],
      ['C3', 1], [null, 1], ['C5', 1], [null, 1], ['C3', 1], [null, 1], ['C5', 1], [null, 1],
      ['C3', 1], [null, 1], ['C5', 1], [null, 1], ['C3', 1], [null, 1], ['C5', 1], [null, 1],
      ['C3', 1], [null, 1], ['C5', 1], [null, 1], ['C3', 1], [null, 1], ['C5', 1], [null, 1],
    ],
  },
};

// ──────────────────────────────────────────────────────────────────────
// Bug Hunt B — darker, minor-key, slightly tense. For hard difficulty vibe.
// Am – Dm – G – C progression, more chromatic
// ──────────────────────────────────────────────────────────────────────
const BUGHUNT_B: Track = {
  id: 'bughunt-b',
  name: 'Deep Stack',
  baseBPM: 128,
  stepsPerBar: 16,
  channels: {
    pulse1: [
      ['A4', 2], ['C5', 2], ['E5', 4], ['D5', 2], ['C5', 2], ['B4', 4],
      ['D5', 2], ['F5', 2], ['A5', 4], ['G5', 2], ['F5', 2], ['E5', 4],
      ['G4', 2], ['B4', 2], ['D5', 4], ['C5', 2], ['B4', 2], ['A4', 4],
      ['C5', 2], ['E5', 2], ['G5', 4], ['F5', 2], ['E5', 2], ['D5', 4],
    ],
    pulse2: [
      ['E4', 4], ['A4', 4], ['G4', 4], ['E4', 4],
      ['A4', 4], ['D5', 4], ['C5', 4], ['A4', 4],
      ['D4', 4], ['G4', 4], ['F4', 4], ['D4', 4],
      ['G4', 4], ['C5', 4], ['B4', 4], ['G4', 4],
    ],
    triangle: [
      ['A2', 4], ['A2', 4], ['E3', 4], ['E3', 4],
      ['D2', 4], ['D2', 4], ['A2', 4], ['A2', 4],
      ['G2', 4], ['G2', 4], ['D3', 4], ['D3', 4],
      ['C2', 4], ['C2', 4], ['G2', 4], ['G2', 4],
    ],
    noise: [
      ['C3', 1], [null, 1], ['C5', 1], ['C5', 1], ['C3', 1], [null, 1], ['C5', 1], [null, 1],
      ['C3', 1], [null, 1], ['C5', 1], ['C5', 1], ['C3', 1], [null, 1], ['C5', 1], [null, 1],
      ['C3', 1], [null, 1], ['C5', 1], ['C5', 1], ['C3', 1], [null, 1], ['C5', 1], [null, 1],
      ['C3', 1], [null, 1], ['C5', 1], ['C5', 1], ['C3', 1], [null, 1], ['C5', 1], [null, 1],
    ],
  },
};

// ──────────────────────────────────────────────────────────────────────
// Type Race A — "Keystroke Rush"
// Driving, four-on-the-floor, starts moderate, ramps to frantic
// ──────────────────────────────────────────────────────────────────────
const TYPERACE_A: Track = {
  id: 'typerace-a',
  name: 'Keystroke Rush',
  baseBPM: 100,
  tempoRamp: { targetBPM: 180, rampSeconds: 60 },
  stepsPerBar: 16,
  channels: {
    pulse1: [
      // 4 bars of a bouncing melody in Dm
      ['D5', 1], ['F5', 1], ['A5', 1], ['F5', 1], ['D5', 1], ['F5', 1], ['A5', 1], ['F5', 1],
      ['D5', 1], ['F5', 1], ['A5', 1], ['F5', 1], ['D5', 1], ['F5', 1], ['A5', 1], ['F5', 1],
      ['C5', 1], ['E5', 1], ['G5', 1], ['E5', 1], ['C5', 1], ['E5', 1], ['G5', 1], ['E5', 1],
      ['C5', 1], ['E5', 1], ['G5', 1], ['E5', 1], ['C5', 1], ['E5', 1], ['G5', 1], ['E5', 1],
      ['A4', 1], ['C5', 1], ['E5', 1], ['C5', 1], ['A4', 1], ['C5', 1], ['E5', 1], ['C5', 1],
      ['A4', 1], ['C5', 1], ['E5', 1], ['C5', 1], ['A4', 1], ['C5', 1], ['E5', 1], ['C5', 1],
      ['D5', 1], ['F5', 1], ['A5', 1], ['F5', 1], ['E5', 1], ['G5', 1], ['B5', 1], ['G5', 1],
      ['A5', 1], ['F5', 1], ['E5', 1], ['D5', 1], ['C5', 1], ['B4', 1], ['A4', 1], ['D5', 1],
    ],
    pulse2: [
      [null, 2], ['A4', 2], [null, 2], ['A4', 2], [null, 2], ['A4', 2], [null, 2], ['A4', 2],
      [null, 2], ['A4', 2], [null, 2], ['A4', 2], [null, 2], ['A4', 2], [null, 2], ['A4', 2],
      [null, 2], ['G4', 2], [null, 2], ['G4', 2], [null, 2], ['G4', 2], [null, 2], ['G4', 2],
      [null, 2], ['G4', 2], [null, 2], ['G4', 2], [null, 2], ['G4', 2], [null, 2], ['G4', 2],
      [null, 2], ['E4', 2], [null, 2], ['E4', 2], [null, 2], ['E4', 2], [null, 2], ['E4', 2],
      [null, 2], ['E4', 2], [null, 2], ['E4', 2], [null, 2], ['E4', 2], [null, 2], ['E4', 2],
      [null, 2], ['F4', 2], [null, 2], ['F4', 2], [null, 2], ['A4', 2], [null, 2], ['A4', 2],
      [null, 2], ['A4', 2], [null, 2], ['A4', 2], [null, 2], ['D5', 2], [null, 2], ['D5', 2],
    ],
    triangle: [
      ['D2', 4], ['D2', 4], ['A2', 4], ['A2', 4],
      ['D2', 4], ['D2', 4], ['A2', 4], ['A2', 4],
      ['C2', 4], ['C2', 4], ['G2', 4], ['G2', 4],
      ['C2', 4], ['C2', 4], ['G2', 4], ['G2', 4],
      ['A1', 4], ['A1', 4], ['E2', 4], ['E2', 4],
      ['A1', 4], ['A1', 4], ['E2', 4], ['E2', 4],
      ['D2', 4], ['D2', 4], ['A2', 4], ['A2', 4],
      ['D2', 4], ['D2', 4], ['D2', 4], ['D2', 4],
    ],
    noise: Array.from({ length: 32 }, () => [
      ['C3', 1], [null, 1], ['C5', 1], [null, 1],
    ] as Step[]).flat(),
  },
};

// ──────────────────────────────────────────────────────────────────────
// Type Race B — "Terminal Pulse"
// Arpeggio-heavy, slightly swingy, starts medium, ramps high
// ──────────────────────────────────────────────────────────────────────
const TYPERACE_B: Track = {
  id: 'typerace-b',
  name: 'Terminal Pulse',
  baseBPM: 108,
  tempoRamp: { targetBPM: 190, rampSeconds: 55 },
  stepsPerBar: 16,
  channels: {
    pulse1: [
      // Arpeggios in Em → C → G → D
      ['E5', 1], ['G5', 1], ['B5', 1], ['G5', 1], ['E5', 1], ['G5', 1], ['B5', 1], ['G5', 1],
      ['E5', 1], ['G5', 1], ['B5', 1], ['E6', 1], ['B5', 1], ['G5', 1], ['E5', 1], ['G5', 1],
      ['C5', 1], ['E5', 1], ['G5', 1], ['E5', 1], ['C5', 1], ['E5', 1], ['G5', 1], ['E5', 1],
      ['C5', 1], ['E5', 1], ['G5', 1], ['C6', 1], ['G5', 1], ['E5', 1], ['C5', 1], ['E5', 1],
      ['G4', 1], ['B4', 1], ['D5', 1], ['B4', 1], ['G4', 1], ['B4', 1], ['D5', 1], ['B4', 1],
      ['G4', 1], ['B4', 1], ['D5', 1], ['G5', 1], ['D5', 1], ['B4', 1], ['G4', 1], ['B4', 1],
      ['D5', 1], ['F#5', 1], ['A5', 1], ['F#5', 1], ['D5', 1], ['F#5', 1], ['A5', 1], ['F#5', 1],
      ['D5', 1], ['F#5', 1], ['A5', 1], ['D6', 1], ['A5', 1], ['F#5', 1], ['D5', 1], ['A4', 1],
    ],
    pulse2: [
      ['E4', 4], [null, 4], ['E4', 4], [null, 4],
      ['C4', 4], [null, 4], ['C4', 4], [null, 4],
      ['G4', 4], [null, 4], ['G4', 4], [null, 4],
      ['D4', 4], [null, 4], ['F#4', 4], [null, 4],
    ],
    triangle: [
      ['E2', 2], [null, 2], ['B2', 2], [null, 2], ['E2', 2], [null, 2], ['B2', 2], [null, 2],
      ['E2', 2], [null, 2], ['B2', 2], [null, 2], ['E2', 2], [null, 2], ['B2', 2], [null, 2],
      ['C2', 2], [null, 2], ['G2', 2], [null, 2], ['C2', 2], [null, 2], ['G2', 2], [null, 2],
      ['C2', 2], [null, 2], ['G2', 2], [null, 2], ['C2', 2], [null, 2], ['G2', 2], [null, 2],
      ['G2', 2], [null, 2], ['D3', 2], [null, 2], ['G2', 2], [null, 2], ['D3', 2], [null, 2],
      ['G2', 2], [null, 2], ['D3', 2], [null, 2], ['G2', 2], [null, 2], ['D3', 2], [null, 2],
      ['D2', 2], [null, 2], ['A2', 2], [null, 2], ['D2', 2], [null, 2], ['A2', 2], [null, 2],
      ['D2', 2], [null, 2], ['A2', 2], [null, 2], ['D2', 2], [null, 2], ['A2', 2], [null, 2],
    ],
    noise: Array.from({ length: 32 }, () => [
      ['C3', 1], [null, 1], ['C5', 1], ['C5', 1],
    ] as Step[]).flat(),
  },
};

// ──────────────────────────────────────────────────────────────────────
// Type Race C — "Fingers Fly"
// Chromatic descending riff, slow build to frantic
// ──────────────────────────────────────────────────────────────────────
const TYPERACE_C: Track = {
  id: 'typerace-c',
  name: 'Fingers Fly',
  baseBPM: 95,
  tempoRamp: { targetBPM: 175, rampSeconds: 70 },
  stepsPerBar: 16,
  channels: {
    pulse1: [
      ['A5', 2], ['G5', 2], ['F5', 2], ['E5', 2], ['D5', 2], ['C5', 2], ['B4', 2], ['A4', 2],
      ['C5', 2], ['D5', 2], ['E5', 2], ['F5', 2], ['G5', 2], ['A5', 2], ['B5', 2], ['C6', 2],
      ['A5', 2], ['G5', 2], ['F5', 2], ['E5', 2], ['D5', 2], ['C5', 2], ['B4', 2], ['A4', 2],
      ['E5', 2], ['G5', 2], ['A5', 2], ['C6', 2], ['B5', 2], ['A5', 2], ['G5', 2], ['F5', 2],
      ['D5', 2], ['F5', 2], ['A5', 2], ['F5', 2], ['D5', 2], ['F5', 2], ['A5', 2], ['F5', 2],
      ['E5', 2], ['G5', 2], ['B5', 2], ['G5', 2], ['E5', 2], ['G5', 2], ['B5', 2], ['G5', 2],
      ['A4', 2], ['C5', 2], ['E5', 2], ['C5', 2], ['A4', 2], ['C5', 2], ['E5', 2], ['C5', 2],
      ['D5', 2], ['F5', 2], ['A5', 2], ['F5', 2], ['D5', 2], ['F5', 2], ['A5', 2], ['C6', 2],
    ],
    pulse2: [
      ['E4', 8], ['A4', 8],
      ['E4', 8], ['A4', 8],
      ['F4', 8], ['A4', 8],
      ['E4', 8], ['G4', 8],
    ],
    triangle: [
      ['A2', 4], ['E3', 4], ['A2', 4], ['E3', 4],
      ['A2', 4], ['E3', 4], ['A2', 4], ['E3', 4],
      ['D2', 4], ['A2', 4], ['D2', 4], ['A2', 4],
      ['A2', 4], ['E3', 4], ['A2', 4], ['C3', 4],
    ],
    noise: Array.from({ length: 32 }, (_, i) =>
      i % 2 === 0 ? (['C3', 1] as Step) : ([null, 1] as Step),
    ).flatMap((s) => [s, [null, 1] as Step, ['C5', 1] as Step, [null, 1] as Step]),
  },
};

export const TRACKS: Record<string, Track> = {
  title: TITLE,
  'bughunt-a': BUGHUNT_A,
  'bughunt-b': BUGHUNT_B,
  'typerace-a': TYPERACE_A,
  'typerace-b': TYPERACE_B,
  'typerace-c': TYPERACE_C,
};

export const TYPERACE_TRACK_IDS = ['typerace-a', 'typerace-b', 'typerace-c'] as const;
export const BUGHUNT_TRACK_IDS = ['bughunt-a', 'bughunt-b'] as const;

export function pickRandom<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}
