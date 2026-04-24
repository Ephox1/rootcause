import type { Language } from '../types';

export type TokenKind =
  | 'keyword'
  | 'string'
  | 'number'
  | 'comment'
  | 'function'
  | 'punct'
  | 'operator'
  | 'type'
  | 'plain';

export interface Token {
  value: string;
  kind: TokenKind;
}

const KEYWORDS: Record<Language, Set<string>> = {
  javascript: new Set([
    'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'do',
    'break', 'continue', 'switch', 'case', 'default', 'try', 'catch', 'finally', 'throw',
    'class', 'extends', 'new', 'this', 'super', 'typeof', 'instanceof', 'in', 'of',
    'async', 'await', 'yield', 'import', 'export', 'from', 'as', 'null', 'undefined',
    'true', 'false', 'void', 'delete',
  ]),
  typescript: new Set([
    'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'do',
    'break', 'continue', 'switch', 'case', 'default', 'try', 'catch', 'finally', 'throw',
    'class', 'extends', 'new', 'this', 'super', 'typeof', 'instanceof', 'in', 'of',
    'async', 'await', 'yield', 'import', 'export', 'from', 'as', 'null', 'undefined',
    'true', 'false', 'void', 'delete', 'interface', 'type', 'enum', 'readonly',
    'public', 'private', 'protected', 'implements', 'abstract', 'namespace', 'keyof',
    'infer', 'never', 'unknown', 'any',
  ]),
  python: new Set([
    'def', 'return', 'if', 'elif', 'else', 'for', 'while', 'break', 'continue',
    'class', 'import', 'from', 'as', 'with', 'try', 'except', 'finally', 'raise',
    'pass', 'lambda', 'yield', 'async', 'await', 'in', 'is', 'not', 'and', 'or',
    'True', 'False', 'None', 'global', 'nonlocal', 'print',
  ]),
  dart: new Set([
    'var', 'final', 'const', 'late', 'void', 'dynamic', 'function', 'return',
    'if', 'else', 'for', 'while', 'do', 'break', 'continue', 'switch', 'case',
    'default', 'try', 'catch', 'finally', 'throw', 'rethrow', 'class', 'extends',
    'implements', 'with', 'mixin', 'abstract', 'new', 'this', 'super', 'async',
    'await', 'yield', 'import', 'export', 'part', 'library', 'null', 'true', 'false',
    'required', 'static', 'factory', 'operator', 'typedef', 'in', 'is', 'as',
  ]),
};

const TYPES: Record<Language, Set<string>> = {
  javascript: new Set(['Array', 'Object', 'String', 'Number', 'Boolean', 'Promise', 'Date', 'Map', 'Set', 'Error']),
  typescript: new Set(['Array', 'Object', 'String', 'Number', 'Boolean', 'Promise', 'Record', 'Partial', 'Readonly', 'Pick', 'Omit', 'User', 'Config', 'Status', 'Date', 'Map', 'Set', 'Error']),
  python: new Set(['int', 'str', 'float', 'bool', 'list', 'dict', 'tuple', 'set', 'Optional', 'List', 'Dict']),
  dart: new Set(['int', 'String', 'double', 'bool', 'num', 'List', 'Map', 'Set', 'Future', 'Stream', 'Iterable', 'Object', 'Widget', 'StatelessWidget', 'StatefulWidget', 'BuildContext', 'Navigator', 'Counter', 'StreamController']),
};

function isIdStart(ch: string): boolean {
  return /[A-Za-z_$@]/.test(ch);
}

function isIdCont(ch: string): boolean {
  return /[A-Za-z0-9_$]/.test(ch);
}

export function tokenize(code: string, language: Language): Token[] {
  const tokens: Token[] = [];
  const kw = KEYWORDS[language];
  const types = TYPES[language];
  let i = 0;
  const push = (value: string, kind: TokenKind) => {
    if (!value) return;
    tokens.push({ value, kind });
  };

  while (i < code.length) {
    const ch = code[i];

    // Newline & whitespace run
    if (ch === '\n' || ch === ' ' || ch === '\t') {
      let j = i;
      while (j < code.length && (code[j] === ' ' || code[j] === '\t' || code[j] === '\n')) j++;
      push(code.slice(i, j), 'plain');
      i = j;
      continue;
    }

    // Line comment
    if (
      (language === 'javascript' || language === 'typescript' || language === 'dart') &&
      ch === '/' &&
      code[i + 1] === '/'
    ) {
      let j = i;
      while (j < code.length && code[j] !== '\n') j++;
      push(code.slice(i, j), 'comment');
      i = j;
      continue;
    }
    if (language === 'python' && ch === '#') {
      let j = i;
      while (j < code.length && code[j] !== '\n') j++;
      push(code.slice(i, j), 'comment');
      i = j;
      continue;
    }

    // Block comment
    if (
      (language === 'javascript' || language === 'typescript' || language === 'dart') &&
      ch === '/' &&
      code[i + 1] === '*'
    ) {
      let j = i + 2;
      while (j < code.length && !(code[j] === '*' && code[j + 1] === '/')) j++;
      j = Math.min(code.length, j + 2);
      push(code.slice(i, j), 'comment');
      i = j;
      continue;
    }

    // String
    if (ch === '"' || ch === "'" || ch === '`') {
      const quote = ch;
      let j = i + 1;
      while (j < code.length) {
        if (code[j] === '\\') {
          j += 2;
          continue;
        }
        if (code[j] === quote) {
          j++;
          break;
        }
        if (code[j] === '\n' && quote !== '`') break;
        j++;
      }
      push(code.slice(i, j), 'string');
      i = j;
      continue;
    }

    // f-string / r-string prefix in python
    if (
      language === 'python' &&
      (ch === 'f' || ch === 'r' || ch === 'b') &&
      (code[i + 1] === '"' || code[i + 1] === "'")
    ) {
      const quote = code[i + 1];
      let j = i + 2;
      while (j < code.length) {
        if (code[j] === '\\') {
          j += 2;
          continue;
        }
        if (code[j] === quote) {
          j++;
          break;
        }
        if (code[j] === '\n') break;
        j++;
      }
      push(code.slice(i, j), 'string');
      i = j;
      continue;
    }

    // Number
    if (/[0-9]/.test(ch)) {
      let j = i;
      while (j < code.length && /[0-9.eExXa-fA-F_]/.test(code[j])) j++;
      push(code.slice(i, j), 'number');
      i = j;
      continue;
    }

    // Identifier / keyword
    if (isIdStart(ch)) {
      let j = i + 1;
      while (j < code.length && isIdCont(code[j])) j++;
      const word = code.slice(i, j);
      let kind: TokenKind = 'plain';
      if (kw.has(word)) kind = 'keyword';
      else if (types.has(word)) kind = 'type';
      else if (code[j] === '(') kind = 'function';
      push(word, kind);
      i = j;
      continue;
    }

    // Operator / punctuation
    if (/[+\-*/%=!<>&|^~?]/.test(ch)) {
      let j = i;
      while (j < code.length && /[+\-*/%=!<>&|^~?]/.test(code[j])) j++;
      push(code.slice(i, j), 'operator');
      i = j;
      continue;
    }
    if (/[(){}[\];:.,@]/.test(ch)) {
      push(ch, 'punct');
      i++;
      continue;
    }

    push(ch, 'plain');
    i++;
  }

  return tokens;
}

export const TOKEN_COLORS: Record<TokenKind, string> = {
  keyword: '#ff8c42',
  string: '#a5d6a7',
  number: '#ffd26a',
  comment: '#6a737d',
  function: '#ffc58a',
  punct: '#c9d1d9',
  operator: '#ff6b9d',
  type: '#4fc3f7',
  plain: '#e6edf3',
};
