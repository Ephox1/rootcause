import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  AnswerState,
  Category,
  CharacterState,
  ChoiceId,
  Difficulty,
  Language,
  LanguageStats,
  LifetimeStats,
  Question,
  Route,
  Snippet,
  Theme,
  TreeVariant,
} from '../types';
import { pickQuestions, pickSnippets } from '../content';

const BUG_HUNT_RUN_LENGTH = 5;
const TYPE_RACE_RUN_LENGTH = 5;

const DIFFICULTY_THRESHOLDS: Record<Difficulty, number> = { easy: 5, medium: 10, hard: 15 };
const DIFFICULTY_MISS_PENALTY: Record<Difficulty, number> = { easy: 1, medium: 3, hard: 15 };
const BASE_POINTS: Record<Difficulty, number> = { easy: 100, medium: 200, hard: 400 };

const EMPTY_LANG_STATS: LanguageStats = { correct: 0, wrong: 0, bestWPM: 0 };

const EMPTY_LIFETIME: LifetimeStats = {
  gamesPlayed: 0,
  bestStreak: 0,
  totalCorrect: 0,
  totalWrong: 0,
  avgWPM: 0,
  byLanguage: {
    python: { ...EMPTY_LANG_STATS },
    javascript: { ...EMPTY_LANG_STATS },
    typescript: { ...EMPTY_LANG_STATS },
    dart: { ...EMPTY_LANG_STATS },
  },
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function variantForStreak(streak: number): TreeVariant {
  if (streak >= 50) return 'winter';
  if (streak >= 25) return 'autumn';
  if (streak >= 10) return 'blossom';
  return 'green';
}

function characterForAnswer(correct: boolean, newStreak: number): CharacterState {
  if (!correct) return 'facepalm';
  if (newStreak >= 15) return 'fistpump';
  if (newStreak >= 5) return 'sunglasses';
  return 'thumbsup';
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export interface TypeRunResult {
  wpm: number;
  accuracy: number;
  snippetId: string;
}

interface Settings {
  theme: Theme;
  language: Language;
  category: Category;
  difficulty: Difficulty;
  crt: boolean;
  reducedMotion: boolean;
  music: boolean;
  sfx: boolean;
  musicVolume: number;
  sfxVolume: number;
}

interface Progress {
  score: number;
  bestStreak: number;
  level: number;
  xp: number;
  lifetime: LifetimeStats;
}

interface GameStore extends Settings, Progress {
  route: Route;

  streak: number;
  treeProgress: number;
  visualStage: number;
  treeVariant: TreeVariant;
  characterState: CharacterState;

  answerState: AnswerState;
  selectedChoice: ChoiceId | null;
  questionStartTime: number;
  flashKey: number;
  flashType: 'correct' | 'wrong' | null;
  lastPointsDelta: number | null;

  bugHuntQuestions: Question[];
  bugHuntIndex: number;
  bugHuntCorrect: number;
  bugHuntScoreStart: number;

  typeRaceSnippets: Snippet[];
  typeRaceIndex: number;
  typeRaceResults: TypeRunResult[];
  typingStartTime: number;
  typedChars: string[];

  endRunMode: 'bughunt' | 'typerace' | null;

  setRoute: (r: Route) => void;
  updateSettings: (patch: Partial<Settings>) => void;

  startBugHunt: () => void;
  answerQuestion: (choiceId: ChoiceId) => void;
  advanceQuestion: () => void;

  startTypeRace: () => void;
  setTypedChars: (chars: string[]) => void;
  completeSnippet: (result: TypeRunResult) => void;

  goHome: () => void;
  resetProgress: () => void;
}

function recordBugAnswer(
  lifetime: LifetimeStats,
  language: Language,
  correct: boolean,
): LifetimeStats {
  const lang = lifetime.byLanguage[language] ?? { ...EMPTY_LANG_STATS };
  return {
    ...lifetime,
    totalCorrect: lifetime.totalCorrect + (correct ? 1 : 0),
    totalWrong: lifetime.totalWrong + (correct ? 0 : 1),
    byLanguage: {
      ...lifetime.byLanguage,
      [language]: {
        ...lang,
        correct: lang.correct + (correct ? 1 : 0),
        wrong: lang.wrong + (correct ? 0 : 1),
      },
    },
  };
}

function recordRunComplete(
  lifetime: LifetimeStats,
  language: Language,
  wpm: number | null,
): LifetimeStats {
  const lang = lifetime.byLanguage[language] ?? { ...EMPTY_LANG_STATS };
  const nextBestWPM = wpm === null ? lang.bestWPM : Math.max(lang.bestWPM, wpm);
  const nextAvgWPM =
    wpm === null
      ? lifetime.avgWPM
      : lifetime.gamesPlayed === 0
        ? wpm
        : Math.round((lifetime.avgWPM * lifetime.gamesPlayed + wpm) / (lifetime.gamesPlayed + 1));
  return {
    ...lifetime,
    gamesPlayed: lifetime.gamesPlayed + 1,
    avgWPM: nextAvgWPM,
    byLanguage: {
      ...lifetime.byLanguage,
      [language]: { ...lang, bestWPM: nextBestWPM },
    },
  };
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      language: 'javascript',
      category: 'general',
      difficulty: 'medium',
      crt: false,
      reducedMotion: prefersReducedMotion(),
      music: true,
      sfx: true,
      musicVolume: 0.6,
      sfxVolume: 0.8,

      score: 0,
      bestStreak: 0,
      level: 1,
      xp: 0,
      lifetime: EMPTY_LIFETIME,

      route: 'title',
      streak: 0,
      treeProgress: 0,
      visualStage: 0,
      treeVariant: 'green',
      characterState: 'idle',

      answerState: 'idle',
      selectedChoice: null,
      questionStartTime: Date.now(),
      flashKey: 0,
      flashType: null,
      lastPointsDelta: null,

      bugHuntQuestions: [],
      bugHuntIndex: 0,
      bugHuntCorrect: 0,
      bugHuntScoreStart: 0,

      typeRaceSnippets: [],
      typeRaceIndex: 0,
      typeRaceResults: [],
      typingStartTime: Date.now(),
      typedChars: [],

      endRunMode: null,

      setRoute: (r) => set({ route: r }),
      updateSettings: (patch) => set(patch),

      startBugHunt: () => {
        const { language, category } = get();
        const questions = pickQuestions({ language, category }, BUG_HUNT_RUN_LENGTH);
        set({
          bugHuntQuestions: questions,
          bugHuntIndex: 0,
          bugHuntCorrect: 0,
          bugHuntScoreStart: get().score,
          streak: 0,
          treeProgress: 0,
          visualStage: 0,
          treeVariant: 'green',
          characterState: 'idle',
          answerState: 'idle',
          selectedChoice: null,
          questionStartTime: Date.now(),
          flashKey: 0,
          flashType: null,
          lastPointsDelta: null,
          route: 'bughunt',
          endRunMode: null,
        });
      },

      answerQuestion: (choiceId) => {
        const s = get();
        const question = s.bugHuntQuestions[s.bugHuntIndex];
        if (!question || s.answerState !== 'idle') return;

        const correct = choiceId === question.correctChoiceId;
        const elapsed = Date.now() - s.questionStartTime;
        const base = BASE_POINTS[question.difficulty];
        const speedBonus =
          elapsed <= 5000
            ? base
            : elapsed >= 20000
              ? 0
              : Math.round(base * (1 - (elapsed - 5000) / 15000));
        const delta = correct ? base + speedBonus : -Math.round(base * 0.25);

        const newStreak = correct ? s.streak + 1 : 0;
        const threshold = DIFFICULTY_THRESHOLDS[s.difficulty];
        const penalty = DIFFICULTY_MISS_PENALTY[s.difficulty];
        const treeProgress = correct
          ? clamp(s.treeProgress + 1, 0, threshold)
          : clamp(s.treeProgress - penalty, 0, threshold);
        const visualStage = Math.floor((treeProgress / threshold) * 5);

        set({
          answerState: correct ? 'correct' : 'wrong',
          selectedChoice: choiceId,
          score: Math.max(0, s.score + delta),
          streak: newStreak,
          bestStreak: Math.max(s.bestStreak, newStreak),
          treeProgress,
          visualStage,
          treeVariant: variantForStreak(newStreak),
          characterState: characterForAnswer(correct, newStreak),
          flashKey: s.flashKey + 1,
          flashType: correct ? 'correct' : 'wrong',
          lastPointsDelta: delta,
          bugHuntCorrect: s.bugHuntCorrect + (correct ? 1 : 0),
          xp: correct ? Math.min(100, s.xp + 10) : s.xp,
          lifetime: recordBugAnswer(s.lifetime, question.language, correct),
        });

        if (correct && s.xp + 10 >= 100) {
          set((prev) => ({ level: prev.level + 1, xp: 0 }));
        }
      },

      advanceQuestion: () => {
        const s = get();
        const next = s.bugHuntIndex + 1;
        if (next >= s.bugHuntQuestions.length) {
          set({
            route: 'endrun',
            endRunMode: 'bughunt',
            lifetime: recordRunComplete(
              {
                ...s.lifetime,
                bestStreak: Math.max(s.lifetime.bestStreak, s.bestStreak),
              },
              s.language,
              null,
            ),
          });
          return;
        }
        set({
          bugHuntIndex: next,
          answerState: 'idle',
          selectedChoice: null,
          questionStartTime: Date.now(),
          characterState: 'idle',
          flashType: null,
        });
      },

      startTypeRace: () => {
        const { language } = get();
        const snippets = pickSnippets(language, TYPE_RACE_RUN_LENGTH);
        set({
          typeRaceSnippets: snippets,
          typeRaceIndex: 0,
          typeRaceResults: [],
          typingStartTime: Date.now(),
          typedChars: [],
          route: 'typerace',
          endRunMode: null,
        });
      },

      setTypedChars: (chars) => set({ typedChars: chars }),

      completeSnippet: (result) => {
        const s = get();
        const results = [...s.typeRaceResults, result];
        const next = s.typeRaceIndex + 1;
        if (next >= s.typeRaceSnippets.length) {
          const avgWPM = Math.round(
            results.reduce((sum, r) => sum + r.wpm, 0) / Math.max(1, results.length),
          );
          set({
            typeRaceResults: results,
            route: 'endrun',
            endRunMode: 'typerace',
            lifetime: recordRunComplete(s.lifetime, s.language, avgWPM),
          });
          return;
        }
        set({
          typeRaceIndex: next,
          typeRaceResults: results,
          typingStartTime: Date.now(),
          typedChars: [],
        });
      },

      goHome: () => {
        set({
          route: 'title',
          bugHuntQuestions: [],
          bugHuntIndex: 0,
          bugHuntCorrect: 0,
          typeRaceSnippets: [],
          typeRaceIndex: 0,
          typeRaceResults: [],
          endRunMode: null,
          answerState: 'idle',
          selectedChoice: null,
          flashType: null,
          characterState: 'idle',
        });
      },

      resetProgress: () => {
        set({
          score: 0,
          bestStreak: 0,
          level: 1,
          xp: 0,
          lifetime: EMPTY_LIFETIME,
          streak: 0,
          treeProgress: 0,
          visualStage: 0,
          treeVariant: 'green',
        });
      },
    }),
    {
      name: 'rootcause:v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        theme: state.theme,
        language: state.language,
        category: state.category,
        difficulty: state.difficulty,
        crt: state.crt,
        reducedMotion: state.reducedMotion,
        music: state.music,
        sfx: state.sfx,
        musicVolume: state.musicVolume,
        sfxVolume: state.sfxVolume,
        score: state.score,
        bestStreak: state.bestStreak,
        level: state.level,
        xp: state.xp,
        lifetime: state.lifetime,
      }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<GameStore>;
        return {
          ...current,
          ...p,
          lifetime: p.lifetime ?? current.lifetime,
        };
      },
    },
  ),
);
