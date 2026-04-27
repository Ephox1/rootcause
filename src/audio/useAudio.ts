import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/useGameStore';
import { engine } from './ChiptuneEngine';
import { musicPlayer, playSoundFile } from './musicPlayer';
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
import { sfxBugCrawl, sfxBugScatter, sfxBugSquash, sfxStreak5, sfxStreak15 } from './sfx';

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
  const visualStage = useGameStore((s) => s.visualStage);

  const unlockedRef = useRef(false);
  const lastFlashRef = useRef<number | null>(null);
  const lastFlashTypeRef = useRef<'correct' | 'wrong' | null>(null);
  const lastStreakRef = useRef(streak);
  const lastVisualStageRef = useRef(visualStage);
  const leafFallIdxRef = useRef(0);
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
      // Real-recording SFX as the primary "correct" sting
      playSoundFile('/audio/sfx-correct.mp3', sfxVolume);
      // Bugs scattering off the code panel, layered a beat after the sting
      window.setTimeout(() => sfxBugScatter(), 80);
      // If there was a stuck bug from the previous wrong answer, squash it
      if (previousFlash === 'wrong') {
        window.setTimeout(() => sfxBugSquash(), 180);
      }
    } else if (flashType === 'wrong') {
      // Real-recording SFX as the primary "wrong" sting
      playSoundFile('/audio/sfx-wrong.mp3', sfxVolume);
      // Real leaf-fall recording — alternate between the two variants
      // each wrong answer so it doesn't feel repetitive
      const leafSrc =
        leafFallIdxRef.current % 2 === 0
          ? '/audio/sfx-leaf-fall-1.mp3'
          : '/audio/sfx-leaf-fall-2.mp3';
      leafFallIdxRef.current += 1;
      playSoundFile(leafSrc, sfxVolume);
      // A bug skitters up onto the trunk ~500ms later as the leaves settle
      window.setTimeout(() => sfxBugCrawl(), 500);
    }
  }, [flashKey, flashType, sfx, sfxVolume]);

  // Streak milestone chimes — only one fires per correct answer.
  // Priority order (highest → lowest):
  //   15+ chiptune fanfare → 5+ chiptune fanfare → 4-streak MP3
  useEffect(() => {
    if (!sfx || !unlockedRef.current) return;
    const prev = lastStreakRef.current;
    lastStreakRef.current = streak;
    if (streak === prev) return;
    if (streak >= 15 && prev < 15) sfxStreak15();
    else if (streak >= 5 && prev < 5) sfxStreak5();
    else if (streak === 4 && prev < 4) playSoundFile('/audio/sfx-streak4.mp3', sfxVolume);
  }, [streak, sfx, sfxVolume]);

  // Tree growth — plays whenever visualStage advances. The chime now
  // tracks the actual visible tree-stage transition rather than a
  // heuristic "every 3 correct" rule, so the audio matches the art.
  useEffect(() => {
    if (!sfx || !unlockedRef.current) return;
    const prev = lastVisualStageRef.current;
    lastVisualStageRef.current = visualStage;
    if (visualStage > prev) {
      playSoundFile('/audio/sfx-tree-grow.mp3', sfxVolume);
    }
  }, [visualStage, sfx, sfxVolume]);
}
