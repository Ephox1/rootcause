import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { engine } from './ChiptuneEngine';
import { musicPlayer, playSoundFile } from './musicPlayer';
import { sfxBugCrawl, sfxBugScatter, sfxBugSquash } from './sfx';

// Per-route looping music. Title/settings/stats share the title track;
// bughunt and typerace get their own; endrun mirrors whichever mode just
// finished so the music doesn't switch on the summary screen.
const EXTERNAL_TRACKS = {
  title: 'audio/music-title.mp3',
  bughunt: 'audio/music-bughunt.mp3',
  typerace: 'audio/music-typerace.mp3',
} as const;

/**
 * Mounts once at the app root. Handles:
 *   - First-user-interaction gate for Web Audio autoplay policy
 *   - Volume + mute tracking from the Zustand store
 *   - Picking tracks per route
 *   - Firing SFX on flashKey / streak milestone / visualStage transitions
 */
export function useAudio(): void {
  const route = useGameStore((s) => s.route);
  const endRunMode = useGameStore((s) => s.endRunMode);
  const music = useGameStore((s) => s.music);
  const sfx = useGameStore((s) => s.sfx);
  const musicVolume = useGameStore((s) => s.musicVolume);
  const sfxVolume = useGameStore((s) => s.sfxVolume);
  const flashKey = useGameStore((s) => s.flashKey);
  const flashType = useGameStore((s) => s.flashType);
  const streak = useGameStore((s) => s.streak);
  const visualStage = useGameStore((s) => s.visualStage);

  const unlockedRef = useRef(false);
  const [unlocked, setUnlocked] = useState(false);
  const lastFlashRef = useRef<number | null>(null);
  const lastFlashTypeRef = useRef<'correct' | 'wrong' | null>(null);
  const lastStreakRef = useRef(streak);
  const lastVisualStageRef = useRef(visualStage);
  const leafFallIdxRef = useRef(0);
  const currentTrackRef = useRef<string | null>(null);

  // First-user-interaction unlock (required by all browsers for Web Audio).
  // Flipping `unlocked` triggers the route effect below to start the right
  // track using fresh state instead of a stale closure.
  useEffect(() => {
    if (unlockedRef.current) return;
    const unlock = async () => {
      await engine.resume();
      unlockedRef.current = true;
      setUnlocked(true);
    };
    const events = ['pointerdown', 'keydown', 'touchstart'] as const;
    const handler = () => {
      unlock();
      events.forEach((ev) => window.removeEventListener(ev, handler));
    };
    events.forEach((ev) => window.addEventListener(ev, handler));
    return () => {
      events.forEach((ev) => window.removeEventListener(ev, handler));
    };
  }, []);

  // Pick the right MP3 per route and ask musicPlayer to play it. Music off
  // stops everything; the single-element musicPlayer guarantees only one
  // track is ever audible.
  useEffect(() => {
    if (!unlockedRef.current) return;

    if (!music) {
      musicPlayer.stop();
      currentTrackRef.current = null;
      return;
    }

    let src: string | null = null;
    if (route === 'title' || route === 'settings' || route === 'stats') {
      src = EXTERNAL_TRACKS.title;
    } else if (route === 'bughunt') {
      src = EXTERNAL_TRACKS.bughunt;
    } else if (route === 'typerace') {
      src = EXTERNAL_TRACKS.typerace;
    } else if (route === 'endrun') {
      src = endRunMode === 'typerace' ? EXTERNAL_TRACKS.typerace : EXTERNAL_TRACKS.bughunt;
    }

    if (src) {
      if (currentTrackRef.current !== `mp3:${src}`) {
        musicPlayer.play(src, musicVolume);
        currentTrackRef.current = `mp3:${src}`;
      }
    } else {
      musicPlayer.stop();
      currentTrackRef.current = null;
    }
  }, [route, music, endRunMode, unlocked, musicVolume]);

  // Volume + mute (one slider drives both music and synth-SFX channels).
  useEffect(() => {
    engine.setVolume(musicVolume);
    engine.setMuted(!music);
    musicPlayer.setVolume(musicVolume);
    musicPlayer.setMuted(!music);
  }, [musicVolume, music]);

  // SFX on flash transitions (correct/wrong answer).
  useEffect(() => {
    if (!sfx || !unlockedRef.current) return;
    if (flashKey === null || flashKey === lastFlashRef.current) return;
    lastFlashRef.current = flashKey;
    const previousFlash = lastFlashTypeRef.current;
    lastFlashTypeRef.current = flashType;

    if (flashType === 'correct') {
      playSoundFile('audio/sfx-correct.mp3', sfxVolume);
      window.setTimeout(() => sfxBugScatter(), 80);
      // Squash any stuck bug from the previous wrong answer.
      if (previousFlash === 'wrong') {
        window.setTimeout(() => sfxBugSquash(), 180);
      }
    } else if (flashType === 'wrong') {
      playSoundFile('audio/sfx-wrong.mp3', sfxVolume);
      // Alternate between two leaf-fall takes so it stays varied.
      const leafSrc =
        leafFallIdxRef.current % 2 === 0
          ? 'audio/sfx-leaf-fall-1.mp3'
          : 'audio/sfx-leaf-fall-2.mp3';
      leafFallIdxRef.current += 1;
      playSoundFile(leafSrc, sfxVolume);
      window.setTimeout(() => sfxBugCrawl(), 500);
    }
  }, [flashKey, flashType, sfx, sfxVolume]);

  // Streak milestone chimes - one per streak crossing.
  useEffect(() => {
    if (!sfx || !unlockedRef.current) return;
    const prev = lastStreakRef.current;
    lastStreakRef.current = streak;
    if (streak === prev) return;
    if (streak >= 15 && prev < 15) playSoundFile('audio/sfx-streak15.mp3', sfxVolume);
    else if (streak >= 5 && prev < 5) playSoundFile('audio/sfx-streak5.mp3', sfxVolume);
    else if (streak === 4 && prev < 4) playSoundFile('audio/sfx-streak4.mp3', sfxVolume);
  }, [streak, sfx, sfxVolume]);

  // Tree growth chime fires whenever visualStage advances, so audio tracks
  // the actual visible tree-stage transition.
  useEffect(() => {
    if (!sfx || !unlockedRef.current) return;
    const prev = lastVisualStageRef.current;
    lastVisualStageRef.current = visualStage;
    if (visualStage > prev) {
      playSoundFile('audio/sfx-tree-grow.mp3', sfxVolume);
    }
  }, [visualStage, sfx, sfxVolume]);
}
