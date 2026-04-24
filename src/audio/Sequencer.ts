import { engine, type Channel } from './ChiptuneEngine';
import type { Track } from './tracks';

/**
 * Plays a Track on loop by scheduling notes a short window ahead of the
 * AudioContext clock. Supports a linear tempo ramp from baseBPM to targetBPM
 * over `rampSeconds`, which drives the Type Race speed-up effect.
 *
 * Timing strategy: each `tick()` schedules every note whose start falls
 * within the next SCHEDULE_AHEAD seconds, advances an internal step
 * pointer past the window end, and schedules the next tick.
 */

const SCHEDULE_AHEAD = 0.25;
const TICK_INTERVAL = 80; // ms

export class Sequencer {
  private track: Track | null = null;
  private startTime = 0; // AudioContext time when the track started
  private rampStartTime = 0; // AudioContext time of tempo-ramp start (== startTime for now)
  private timer: number | null = null;
  private channelCursors: Record<Channel, { index: number; remaining: number }> = {
    pulse1: { index: 0, remaining: 0 },
    pulse2: { index: 0, remaining: 0 },
    triangle: { index: 0, remaining: 0 },
    noise: { index: 0, remaining: 0 },
  };

  play(track: Track): void {
    if (this.track?.id === track.id) return; // already playing this track
    this.stop();
    this.track = track;
    this.startTime = engine.now() + 0.05;
    this.rampStartTime = this.startTime;
    (['pulse1', 'pulse2', 'triangle', 'noise'] as Channel[]).forEach((ch) => {
      this.channelCursors[ch] = { index: 0, remaining: 0 };
    });
    this.tick();
    this.timer = window.setInterval(() => this.tick(), TICK_INTERVAL);
  }

  stop(): void {
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.track = null;
  }

  isPlaying(): boolean {
    return this.track !== null;
  }

  currentTrackId(): string | null {
    return this.track?.id ?? null;
  }

  /**
   * Returns the current BPM at the given AudioContext time, accounting for
   * tempo ramp if this track has one.
   */
  private bpmAt(time: number): number {
    if (!this.track) return 120;
    const { baseBPM, tempoRamp } = this.track;
    if (!tempoRamp) return baseBPM;
    const elapsed = Math.max(0, time - this.rampStartTime);
    const t = Math.min(1, elapsed / tempoRamp.rampSeconds);
    return baseBPM + (tempoRamp.targetBPM - baseBPM) * t;
  }

  /**
   * Integrates over variable tempo to convert a number of 16th-note steps
   * starting from a given time into a real-time duration in seconds.
   * We step in small chunks so tempo changes mid-segment are handled.
   */
  private stepDuration(startTime: number, steps: number): number {
    let t = startTime;
    let remaining = steps;
    const CHUNK = 0.25;
    while (remaining > 0) {
      const bpm = this.bpmAt(t);
      const secPerStep = 60 / bpm / 4;
      const stepsThisChunk = Math.min(remaining, Math.max(1, CHUNK / secPerStep));
      t += stepsThisChunk * secPerStep;
      remaining -= stepsThisChunk;
    }
    return t - startTime;
  }

  private tick(): void {
    if (!this.track) return;
    const ctx = engine.audioContext;
    const targetEnd = ctx.currentTime + SCHEDULE_AHEAD;

    (['pulse1', 'pulse2', 'triangle', 'noise'] as Channel[]).forEach((ch) => {
      this.scheduleChannel(ch, targetEnd);
    });
  }

  private scheduleChannel(channel: Channel, targetEnd: number): void {
    if (!this.track) return;
    const seq = this.track.channels[channel];
    if (seq.length === 0) return;

    let cursor = this.channelCursors[channel];
    // "time" is the AudioContext time where the next note we schedule will
    // start. We track it per-channel so each channel independently walks
    // through its own step list.
    let time = cursor.remaining > 0
      ? cursor.remaining
      : this.scheduledUntilFor(channel);

    cursor.remaining = 0;

    while (time < targetEnd) {
      const step = seq[cursor.index % seq.length];
      const [note, steps] = step;
      const duration = this.stepDuration(time, steps);
      if (note !== null) {
        engine.scheduleNote(channel, note, time, duration * 0.92);
      }
      time += duration;
      cursor.index += 1;
      if (time >= targetEnd) {
        cursor.remaining = time; // stash so next tick resumes here
        break;
      }
    }
    this.channelCursors[channel] = cursor;
  }

  /**
   * Per-channel "scheduledUntil" — first tick uses startTime, subsequent ticks
   * use the cursor.remaining stashed on the previous tick.
   */
  private scheduledUntilFor(_channel: Channel): number {
    return this.startTime;
  }
}

export const sequencer = new Sequencer();
