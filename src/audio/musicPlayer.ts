/**
 * Plays external audio files (mp3 / m4a / etc.) for full-fidelity music
 * tracks. Sits alongside the synthesized ChiptuneEngine — the engine
 * still drives all SFX, this just handles pre-recorded music.
 *
 * Usage:
 *   musicPlayer.play('/audio/music-title.mp3', 0.6);
 *   musicPlayer.setVolume(0.4);
 *   musicPlayer.stop();
 *
 * Browsers block autoplay until the user interacts with the page; the
 * .play() promise rejection is caught silently so we don't error before
 * the first click. useAudio.ts wires the "first interaction" gate.
 */
class MusicPlayer {
  private audio: HTMLAudioElement | null = null;
  private currentSrc: string | null = null;
  private targetVolume = 0.6;
  private muted = false;

  play(src: string, volume: number = this.targetVolume): void {
    this.targetVolume = volume;
    // Already playing this exact track — just update volume.
    if (this.currentSrc === src && this.audio && !this.audio.paused) {
      this.audio.volume = this.muted ? 0 : volume;
      return;
    }
    this.stop();
    const a = new Audio(src);
    a.loop = true;
    a.volume = this.muted ? 0 : volume;
    a.preload = 'auto';
    void a.play().catch(() => {
      // Autoplay blocked — caller must call play() again after interaction
    });
    this.audio = a;
    this.currentSrc = src;
  }

  stop(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.src = '';
      this.audio.load();
      this.audio = null;
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

/**
 * Fire-and-forget one-shot sound (jingle, fail sting, etc.). Creates a
 * fresh HTMLAudioElement each call so it can overlap with the looping
 * music track and with itself if rapidly retriggered. The element is
 * eligible for GC once it ends.
 */
export function playSoundFile(src: string, volume = 1): void {
  const a = new Audio(src);
  a.volume = Math.max(0, Math.min(1, volume));
  a.preload = 'auto';
  void a.play().catch(() => {
    // Autoplay may be blocked until first interaction — silently ignore.
  });
}

