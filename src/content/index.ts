import type { Category, ChoiceId, Language, Question, Snippet } from '../types';

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

const ID_ORDER: readonly ChoiceId[] = ['a', 'b', 'c', 'd'];

function shuffle<T>(items: readonly T[]): T[] {
  const copy = items.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Randomize the order of a question's choices and re-key the ids so position
// 0 = 'a', 1 = 'b', etc. correctChoiceId is updated to point at the new
// position of the originally-correct choice.
function shuffleChoices(q: Question): Question {
  const shuffled = shuffle(q.choices);
  const newCorrectIdx = shuffled.findIndex((c) => c.id === q.correctChoiceId);
  return {
    ...q,
    choices: shuffled.map((c, i) => ({ ...c, id: ID_ORDER[i] })),
    correctChoiceId: ID_ORDER[newCorrectIdx] ?? 'a',
  };
}

export interface PickParams {
  language: Language;
  category: Category;
}

/**
 * Pick `count` questions for a run.
 *
 * No repeats within a single shuffle pass - if the pool is large enough we
 * just take the first `count` from one shuffle. If the pool is smaller than
 * `count`, we keep reshuffling and concatenating, but ensure the last item
 * of the previous batch never lands first in the next batch (so a question
 * doesn't appear in two adjacent slots). Choice order is randomized per
 * question, so the correct answer's position varies.
 */
export function pickQuestions({ language, category }: PickParams, count: number): Question[] {
  const pool = questionBank[language]?.[category] ?? [];
  if (pool.length === 0) return [];

  const out: Question[] = [];
  let lastUsedId: string | null = null;

  while (out.length < count) {
    const batch = shuffle(pool);
    if (lastUsedId !== null && batch[0]?.id === lastUsedId && batch.length > 1) {
      [batch[0], batch[1]] = [batch[1], batch[0]];
    }
    for (const q of batch) {
      if (out.length >= count) break;
      out.push(q);
      lastUsedId = q.id;
    }
  }

  return out.map(shuffleChoices);
}

export function pickSnippets(language: Language, count: number): Snippet[] {
  const pool = snippetBank[language] ?? [];
  return shuffle(pool).slice(0, count);
}
