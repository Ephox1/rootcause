import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/useGameStore';
import { engine } from './ChiptuneEngine';
import { musicPlayer } from './musicPlayer';
import { sequencer } from './Sequencer';
import { BUGHUNT_TRACK_IDS, TRACKS, TYPERACE_TRACK_IDS, pickRandom } from './tracks';

// External MP3 tracks (full-fidelity, looping) — keyed by ID. The route
// → external map below decides when to swap from the chiptune sequencer
// to the real audio file.
const EXTERNAL_TRACKS: Record<string, string> = {
  title: '/audio/music-title.mp3',
  bughunt: '/audio/music-bughunt.mp3',
  typerace: '/audio/music-typerace.mp3',
};
import {
  sfxBugCrawl,
  sfxBugScatter,
  sfxBugSquash,
  sfxCorrect,
  sfxRustle,
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
  const endRunMode = useGameStore((s) => s.endRunMode);
  const music = useGameStore((s) => s.music);
  const sfx = useGameStore((s) => s.sfx);
  const musicVolume = useGameStore((s) => s.musicVolume);
  const sfxVolume = useGameStore((s) => s.sfxVolume);
  const flashKey = useGameStore((s) => s.flashKey);
  const flashType = useGameStore((s) => s.flashType);
  const streak = useGameStore((s) => s.streak);
  const difficulty = useGameStore((s) => s.difficulty);

  const unlockedRef = useRef(false);
  const lastFlashRef = useRef<number | null>(null);
  const lastFlashTypeRef = useRef<'correct' | 'wrong' | null>(null);
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
      musicPlayer.stop();
      currentTrackRef.current = null;
      return;
    }

    // Title / settings / stats use the external title MP3.
    // Bug Hunt and the post-run summary share the bug-hunt MP3.
    // Type Race still uses the chiptune sequencer (until you drop in an MP3).
    let externalSrc: string | null = null;
    if (route === 'title' || route === 'settings' || route === 'stats') {
      externalSrc = EXTERNAL_TRACKS.title;
    } else if (route === 'bughunt') {
      externalSrc = EXTERNAL_TRACKS.bughunt ?? null;
    } else if (route === 'typerace') {
      externalSrc = EXTERNAL_TRACKS.typerace ?? null;
    } else if (route === 'endrun') {
      // Stay on the track that matches the mode the player just finished
      // so the music doesn't jarringly switch when they hit the summary.
      externalSrc =
        endRunMode === 'typerace'
          ? EXTERNAL_TRACKS.typerace ?? null
          : EXTERNAL_TRACKS.bughunt ?? null;
    }

    if (externalSrc) {
      sequencer.stop();
      if (currentTrackRef.current !== `mp3:${externalSrc}`) {
        musicPlayer.play(externalSrc, musicVolume);
        currentTrackRef.current = `mp3:${externalSrc}`;
      }
      return;
    }

    // Leaving the MP3 routes — kill it before the sequencer takes over.
    musicPlayer.stop();

    let trackId: string | null = null;
    if (route === 'bughunt' || route === 'endrun') {
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

  // Swap track on route / music toggle / endRunMode change.
  useEffect(() => {
    updateTrack();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route, music, endRunMode]);

  // Track music volume and mute (covers both the chiptune engine and
  // the external MP3 player so they stay in sync).
  useEffect(() => {
    engine.setVolume(musicVolume);
    engine.setMuted(!music);
    musicPlayer.setVolume(musicVolume);
    musicPlayer.setMuted(!music);
  }, [musicVolume, music]);

  // SFX triggers on flashKey change
  useEffect(() => {
    if (!sfx || !unlockedRef.current) return;
    if (flashKey === null || flashKey === lastFlashRef.current) return;
    lastFlashRef.current = flashKey;
    const previousFlash = lastFlashTypeRef.current;
    lastFlashTypeRef.current = flashType;

    if (flashType === 'correct') {
      sfxCorrect();
      // Bugs scattering off the code panel, layered a beat after the arp
      window.setTimeout(() => sfxBugScatter(), 80);
      // If there was a stuck bug from the previous wrong answer, squash it
      if (previousFlash === 'wrong') {
        window.setTimeout(() => sfxBugSquash(), 180);
      }
    } else if (flashType === 'wrong') {
      sfxWrong();
      // Rustling leaves — intensity matches the visual leaf-fall count
      sfxRustle(difficulty === 'easy' ? 'light' : difficulty === 'medium' ? 'medium' : 'heavy');
      // A bug skitters up onto the trunk ~500ms later as the leaves settle
      window.setTimeout(() => sfxBugCrawl(), 500);
    }
  }, [flashKey, flashType, sfx, sfxVolume, difficulty]);

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
