/// <reference types="vite/client" />

/**
 * Music player backed by a single HTMLAudioElement. Switching tracks just
 * changes the element's src - there is literally only one element so two
 * tracks can never play at once. Restarts each track from the beginning
 * (no resume from pause), which the project prefers for clean transitions.
 *
 * Sits alongside the synthesized ChiptuneEngine - engine still drives short
 * SFX, this just handles the looping pre-recorded music tracks.
 *
 * Browsers block autoplay until the user interacts with the page; the
 * .play() promise rejection is caught silently. useAudio.ts wires the
 * "first interaction" gate.
 */
class MusicPlayer {
  private audio: HTMLAudioElement | null = null;
  private currentSrc: string | null = null;
  private targetVolume = 0.6;
  private muted = false;

  private ensureAudio(): HTMLAudioElement {
    if (!this.audio) {
      const a = new Audio();
      a.loop = true;
      a.preload = 'auto';
      this.audio = a;
    }
    return this.audio;
  }

  play(src: string, volume: number = this.targetVolume): void {
    this.targetVolume = volume;
    const a = this.ensureAudio();

    if (this.currentSrc !== src) {
      a.pause();
      a.src = src;
      this.currentSrc = src;
      a.load();
    }

    a.volume = this.muted ? 0 : volume;
    if (a.paused) {
      void a.play().catch(() => {
        // Autoplay blocked - caller will retry after first interaction.
      });
    }
  }

  stop(): void {
    if (this.audio) {
      this.audio.pause();
    }
    this.currentSrc = null;
  }

  setVolume(v: number): void {
    this.targetVolume = v;
    if (this.audio && !this.muted) {
      this.audio.volume = v;
    }
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.audio) {
      this.audio.volume = muted ? 0 : this.targetVolume;
    }
  }

  isPlaying(src?: string): boolean {
    if (!this.audio) return false;
    if (src && this.currentSrc !== src) return false;
    return !this.audio.paused;
  }
}

export const musicPlayer = new MusicPlayer();

// Pause music when the module is hot-replaced so an orphaned instance from a
// previous Vite HMR doesn't keep looping in the background.
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    musicPlayer.stop();
  });
}

/**
 * Fire-and-forget one-shot sound (jingle, fail sting, streak chime).
 * Creates a fresh HTMLAudioElement each call so it can overlap with the
 * looping music and with itself if rapidly retriggered. The element is
 * eligible for GC once it ends.
 */
export function playSoundFile(src: string, volume = 1): void {
  const a = new Audio(src);
  a.volume = Math.max(0, Math.min(1, volume));
  a.preload = 'auto';
  void a.play().catch(() => {
    // Autoplay may be blocked until first interaction - silently ignore.
  });
}
