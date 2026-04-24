import type { Category, Language, Question, Snippet } from '../types';

import jsGeneral from './questions/javascript-general.json';
import jsVibe from './questions/javascript-vibe.json';
import tsGeneral from './questions/typescript-general.json';
import tsVibe from './questions/typescript-vibe.json';
import pyGeneral from './questions/python-general.json';
import pyVibe from './questions/python-vibe.json';
import dartGeneral from './questions/dart-general.json';
import dartVibe from './questions/dart-vibe.json';

import jsTyping from './typing/javascript.json';
import tsTyping from './typing/typescript.json';
import pyTyping from './typing/python.json';
import dartTyping from './typing/dart.json';

const questionBank: Record<Language, Record<Category, Question[]>> = {
  javascript: { general: jsGeneral as Question[], vibe: jsVibe as Question[] },
  typescript: { general: tsGeneral as Question[], vibe: tsVibe as Question[] },
  python: { general: pyGeneral as Question[], vibe: pyVibe as Question[] },
  dart: { general: dartGeneral as Question[], vibe: dartVibe as Question[] },
};

const snippetBank: Record<Language, Snippet[]> = {
  javascript: jsTyping as Snippet[],
  typescript: tsTyping as Snippet[],
  python: pyTyping as Snippet[],
  dart: dartTyping as Snippet[],
};

function shuffle<T>(items: readonly T[]): T[] {
  const copy = items.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export interface PickParams {
  language: Language;
  category: Category;
}

export function pickQuestions({ language, category }: PickParams, count: number): Question[] {
  const pool = questionBank[language]?.[category] ?? [];
  const shuffled = shuffle(pool);
  if (shuffled.length >= count) return shuffled.slice(0, count);
  const filler = shuffle(pool);
  const out: Question[] = [...shuffled];
  let i = 0;
  while (out.length < count && filler.length > 0) {
    out.push(filler[i % filler.length]);
    i++;
  }
  return out;
}

export function pickSnippets(language: Language, count: number): Snippet[] {
  const pool = snippetBank[language] ?? [];
  return shuffle(pool).slice(0, count);
}
