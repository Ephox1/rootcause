import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/useGameStore';
import { engine } from './ChiptuneEngine';
import { sequencer } from './Sequencer';
import { BUGHUNT_TRACK_IDS, TRACKS, TYPERACE_TRACK_IDS, pickRandom } from './tracks';
import {
  sfxCorrect,
  sfxStreak5,
  sfxStreak15,
  sfxTreeGrow,
  sfxWrong,
} from './sfx';

/**
 * Mounts once at the app root. Handles:
 *   - First-user-interaction gate for Web Audio autoplay policy
 *   - Volume + mute tracking from the Zustand store
 *   - Picking tracks per route (title / bughunt / typerace)
 *   - Firing SFX on flashKey / streak milestone changes
 */
export function useAudio(): void {
  const route = useGameStore((s) => s.route);
  const music = useGameStore((s) => s.music);
  const sfx = useGameStore((s) => s.sfx);
  const musicVolume = useGameStore((s) => s.musicVolume);
  const sfxVolume = useGameStore((s) => s.sfxVolume);
  const flashKey = useGameStore((s) => s.flashKey);
  const flashType = useGameStore((s) => s.flashType);
  const streak = useGameStore((s) => s.streak);

  const unlockedRef = useRef(false);
  const lastFlashRef = useRef<number | null>(null);
  const lastStreakRef = useRef(streak);
  const currentTrackRef = useRef<string | null>(null);
  const typeRaceTrackRef = useRef<string | null>(null);

  // First-user-interaction unlock (required by all browsers for Web Audio).
  useEffect(() => {
    if (unlockedRef.current) return;
    const unlock = async () => {
      await engine.resume();
      unlockedRef.current = true;
      // After unlock, start whatever track the current route expects.
      updateTrack();
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Route → track mapping. Recomputed whenever route flips.
  const updateTrack = () => {
    if (!unlockedRef.current) return;
    if (!music) {
      sequencer.stop();
      currentTrackRef.current = null;
      return;
    }
    let trackId: string | null = null;
    if (route === 'title' || route === 'settings' || route === 'stats') {
      trackId = 'title';
    } else if (route === 'bughunt' || route === 'endrun') {
      trackId = pickRandom(BUGHUNT_TRACK_IDS);
    } else if (route === 'typerace') {
      if (!typeRaceTrackRef.current) {
        typeRaceTrackRef.current = pickRandom(TYPERACE_TRACK_IDS);
      }
      trackId = typeRaceTrackRef.current;
    }
    if (route !== 'typerace') typeRaceTrackRef.current = null;

    if (trackId && currentTrackRef.current !== trackId) {
      sequencer.play(TRACKS[trackId]);
      currentTrackRef.current = trackId;
    } else if (!trackId) {
      sequencer.stop();
      currentTrackRef.current = null;
    }
  };

  // Swap track on route / music toggle change
  useEffect(() => {
    updateTrack();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route, music]);

  // Track music volume and mute
  useEffect(() => {
    engine.setVolume(musicVolume);
    engine.setMuted(!music);
  }, [musicVolume, music]);

  // SFX triggers on flashKey change
  useEffect(() => {
    if (!sfx || !unlockedRef.current) return;
    if (flashKey === null || flashKey === lastFlashRef.current) return;
    lastFlashRef.current = flashKey;

    // Temporarily apply sfx volume scale
    const prev = engine.audioContext ? null : null;
    void prev;

    if (flashType === 'correct') {
      sfxCorrect();
    } else if (flashType === 'wrong') {
      sfxWrong();
    }
  }, [flashKey, flashType, sfx, sfxVolume]);

  // Streak milestone chimes
  useEffect(() => {
    if (!sfx || !unlockedRef.current) return;
    const prev = lastStreakRef.current;
    lastStreakRef.current = streak;
    if (streak === prev) return;
    if (streak >= 15 && prev < 15) sfxStreak15();
    else if (streak >= 5 && prev < 5) sfxStreak5();
    // Tree-grow chime every 3 correct in a row
    else if (streak > 0 && streak % 3 === 0 && streak > prev) sfxTreeGrow();
  }, [streak, sfx]);
}
