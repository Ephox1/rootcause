export type Language = 'python' | 'javascript' | 'typescript' | 'dart';
export type Category = 'general' | 'vibe';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type Theme = 'dark' | 'light';
export type ChoiceId = 'a' | 'b' | 'c' | 'd';
export type AnswerState = 'idle' | 'correct' | 'wrong' | 'revealed';
export type CharacterState = 'idle' | 'thumbsup' | 'facepalm' | 'sunglasses' | 'fistpump';
export type TreeVariant = 'green' | 'blossom' | 'autumn' | 'winter';
export type Route =
  | 'title'
  | 'bughunt'
  | 'typerace'
  | 'endrun'
  | 'settings'
  | 'stats';

export interface Choice {
  id: ChoiceId;
  text: string;
}

export interface Question {
  id: string;
  language: Language;
  category: Category;
  difficulty: Difficulty;
  prompt: string;
  code: string;
  choices: Choice[];
  correctChoiceId: ChoiceId;
  explanation: string;
  tags?: string[];
}

export interface Snippet {
  id: string;
  language: Language;
  difficulty: Difficulty;
  code: string;
  description: string;
}

export interface LanguageStats {
  correct: number;
  wrong: number;
  bestWPM: number;
}

export interface LifetimeStats {
  gamesPlayed: number;
  bestStreak: number;
  totalCorrect: number;
  totalWrong: number;
  avgWPM: number;
  byLanguage: Record<Language, LanguageStats>;
}
