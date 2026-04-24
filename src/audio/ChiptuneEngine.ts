/**
 * Chiptune synth engine modelled after the NES PSG (Ricoh 2A03).
 *
 * Four channels:
 *   pulse1   — square wave with selectable duty cycle (12.5 / 25 / 50 / 75%)
 *   pulse2   — second pulse channel for harmonies
 *   triangle — triangle wave (bass)
 *   noise    — filtered white noise (drums / hi-hat)
 *
 * Volume is set via a per-note envelope (attack / hold / decay). A master gain
 * node sits in front of destination so the volume slider and mute work.
 *
 * No dependencies. Web Audio only.
 */

export type Note = string | null;
export type Step = [Note, number];

// Musical note → frequency in Hz (A4 = 440).
const NOTE_MIDI: Record<string, number> = {
  C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5,
  'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11,
};

export function freq(note: string): number {
  const m = note.match(/^([A-G](?:#|b)?)(-?\d+)$/);
  if (!m) return 440;
  const pc = NOTE_MIDI[m[1]];
  const oct = parseInt(m[2], 10);
  const midi = (oct + 1) * 12 + pc;
  return 440 * Math.pow(2, (midi - 69) / 12);
}

// Precomputed PeriodicWave tables for classic NES duty cycles.
const DUTY_CYCLES = [0.125, 0.25, 0.5, 0.75] as const;

function makePulseWave(ctx: AudioContext, duty: number): PeriodicWave {
  const harmonics = 64;
  const real = new Float32Array(harmonics);
  const imag = new Float32Array(harmonics);
  for (let n = 1; n < harmonics; n++) {
    const c = (2 / (n * Math.PI)) * Math.sin(n * Math.PI * duty);
    real[n] = 0;
    imag[n] = c;
  }
  return ctx.createPeriodicWave(real, imag, { disableNormalization: false });
}

export interface ScheduledNote {
  note: Note;
  time: number;
  duration: number;
}

export type Channel = 'pulse1' | 'pulse2' | 'triangle' | 'noise';

interface ChannelConfig {
  type: 'pulse' | 'triangle' | 'noise';
  duty?: 0 | 1 | 2 | 3;
  volume: number;
  attack: number;
  release: number;
}

const DEFAULT_CONFIG: Record<Channel, ChannelConfig> = {
  pulse1: { type: 'pulse', duty: 1, volume: 0.22, attack: 0.005, release: 0.08 },
  pulse2: { type: 'pulse', duty: 2, volume: 0.18, attack: 0.005, release: 0.12 },
  triangle: { type: 'triangle', volume: 0.32, attack: 0.004, release: 0.18 },
  noise: { type: 'noise', volume: 0.18, attack: 0.001, release: 0.07 },
};

export class ChiptuneEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private pulseWaves: PeriodicWave[] = [];
  private noiseBuffer: AudioBuffer | null = null;
  private configs: Record<Channel, ChannelConfig> = { ...DEFAULT_CONFIG };
  private channelGains: Partial<Record<Channel, GainNode>> = {};
  private masterVolume = 0.5;
  private muted = false;

  ensureContext(): AudioContext {
    if (this.ctx) return this.ctx;
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.muted ? 0 : this.masterVolume;
    this.master.connect(this.ctx.destination);

    this.pulseWaves = DUTY_CYCLES.map((d) => makePulseWave(this.ctx!, d));

    // White noise buffer, 1 second long
    const buf = this.ctx.createBuffer(1, this.ctx.sampleRate, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    this.noiseBuffer = buf;

    // Per-channel gain stage
    (['pulse1', 'pulse2', 'triangle', 'noise'] as Channel[]).forEach((ch) => {
      const g = this.ctx!.createGain();
      g.gain.value = this.configs[ch].volume;
      g.connect(this.master!);
      this.channelGains[ch] = g;
    });

    return this.ctx;
  }

  async resume(): Promise<void> {
    const ctx = this.ensureContext();
    if (ctx.state === 'suspended') await ctx.resume();
  }

  setVolume(v: number): void {
    this.masterVolume = Math.max(0, Math.min(1, v));
    if (this.master && !this.muted) this.master.gain.value = this.masterVolume;
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.master) this.master.gain.value = muted ? 0 : this.masterVolume;
  }

  now(): number {
    return this.ensureContext().currentTime;
  }

  /**
   * Schedule a single note on a channel at `time` for `duration` seconds.
   * A rest (note === null) just advances the clock.
   */
  scheduleNote(channel: Channel, note: Note, time: number, duration: number): void {
    const ctx = this.ensureContext();
    if (note === null) return;
    const cfg = this.configs[channel];
    const channelGain = this.channelGains[channel]!;

    // Per-note envelope
    const env = ctx.createGain();
    env.gain.setValueAtTime(0, time);
    env.gain.linearRampToValueAtTime(1, time + cfg.attack);
    env.gain.setTargetAtTime(0, time + duration - cfg.release, cfg.release / 3);
    env.connect(channelGain);

    if (cfg.type === 'noise') {
      const src = ctx.createBufferSource();
      src.buffer = this.noiseBuffer!;
      src.loop = true;
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = freq(note) * 2;
      bp.Q.value = 1.2;
      src.connect(bp);
      bp.connect(env);
      src.start(time);
      src.stop(time + duration + 0.05);
    } else if (cfg.type === 'triangle') {
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq(note), time);
      osc.connect(env);
      osc.start(time);
      osc.stop(time + duration + 0.05);
    } else {
      const osc = ctx.createOscillator();
      osc.setPeriodicWave(this.pulseWaves[cfg.duty ?? 1]);
      osc.frequency.setValueAtTime(freq(note), time);
      osc.connect(env);
      osc.start(time);
      osc.stop(time + duration + 0.05);
    }
  }

  /**
   * Fire-and-forget SFX with a custom envelope. Used by sfx.ts.
   */
  playBlip(params: {
    channel: Channel;
    notes: { note: Note; offset: number; duration: number }[];
    pitchSlide?: { from: string; to: string; duration: number };
    volume?: number;
  }): void {
    const ctx = this.ensureContext();
    const start = ctx.currentTime + 0.005;
    const oldVol = this.channelGains[params.channel]!.gain.value;
    if (params.volume !== undefined) this.channelGains[params.channel]!.gain.value = params.volume;

    if (params.pitchSlide) {
      const cfg = this.configs[params.channel];
      const channelGain = this.channelGains[params.channel]!;
      const env = ctx.createGain();
      env.gain.setValueAtTime(0, start);
      env.gain.linearRampToValueAtTime(1, start + cfg.attack);
      env.gain.setTargetAtTime(0, start + params.pitchSlide.duration - cfg.release, cfg.release / 3);
      env.connect(channelGain);

      if (cfg.type === 'noise') {
        const src = ctx.createBufferSource();
        src.buffer = this.noiseBuffer!;
        src.loop = true;
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.setValueAtTime(freq(params.pitchSlide.from) * 2, start);
        bp.frequency.exponentialRampToValueAtTime(
          freq(params.pitchSlide.to) * 2,
          start + params.pitchSlide.duration,
        );
        src.connect(bp);
        bp.connect(env);
        src.start(start);
        src.stop(start + params.pitchSlide.duration + 0.05);
      } else {
        const osc = ctx.createOscillator();
        if (cfg.type === 'triangle') osc.type = 'triangle';
        else osc.setPeriodicWave(this.pulseWaves[cfg.duty ?? 1]);
        osc.frequency.setValueAtTime(freq(params.pitchSlide.from), start);
        osc.frequency.exponentialRampToValueAtTime(
          freq(params.pitchSlide.to),
          start + params.pitchSlide.duration,
        );
        osc.connect(env);
        osc.start(start);
        osc.stop(start + params.pitchSlide.duration + 0.05);
      }
    } else {
      params.notes.forEach((n) => {
        this.scheduleNote(params.channel, n.note, start + n.offset, n.duration);
      });
    }

    if (params.volume !== undefined) {
      setTimeout(() => {
        this.channelGains[params.channel]!.gain.value = oldVol;
      }, 1000);
    }
  }

  get audioContext(): AudioContext {
    return this.ensureContext();
  }

  get channelGainNodes(): Partial<Record<Channel, GainNode>> {
    return this.channelGains;
  }
}

export const engine = new ChiptuneEngine();
