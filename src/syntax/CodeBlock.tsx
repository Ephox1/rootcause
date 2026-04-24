import { useMemo } from 'react';
import type { Language } from '../types';
import { TOKEN_COLORS, tokenize } from './highlight';

interface CodeBlockProps {
  code: string;
  language: Language;
  fontSize?: number;
  withLineNumbers?: boolean;
}

export function CodeBlock({ code, language, fontSize = 15, withLineNumbers = true }: CodeBlockProps) {
  const tokens = useMemo(() => tokenize(code, language), [code, language]);
  const lines = code.split('\n');
  const lineCount = lines.length;
  const gutterWidth = String(lineCount).length;

  // Rebuild as lines for line-number gutter while still coloring tokens.
  const lineNodes: React.ReactNode[] = [];
  let currentLine: React.ReactNode[] = [];
  let lineIdx = 0;

  tokens.forEach((tok, ti) => {
    if (tok.value.includes('\n')) {
      const parts = tok.value.split('\n');
      parts.forEach((part, pi) => {
        if (part.length) {
          currentLine.push(
            <span key={`${ti}-${pi}`} style={{ color: TOKEN_COLORS[tok.kind] }}>
              {part}
            </span>,
          );
        }
        if (pi < parts.length - 1) {
          lineNodes.push(
            <Line key={lineIdx} n={lineIdx + 1} width={gutterWidth} show={withLineNumbers}>
              {currentLine}
            </Line>,
          );
          currentLine = [];
          lineIdx++;
        }
      });
    } else {
      currentLine.push(
        <span key={ti} style={{ color: TOKEN_COLORS[tok.kind] }}>
          {tok.value}
        </span>,
      );
    }
  });
  lineNodes.push(
    <Line key={lineIdx} n={lineIdx + 1} width={gutterWidth} show={withLineNumbers}>
      {currentLine.length ? currentLine : ' '}
    </Line>,
  );

  return (
    <div
      style={{
        background: '#0a0e14',
        border: '2px solid var(--border)',
        boxShadow: '3px 3px 0 rgba(0,0,0,.4)',
        padding: '14px 16px',
        overflow: 'auto',
        fontFamily: '"JetBrains Mono", "Fira Code", monospace',
        fontSize,
        lineHeight: 1.55,
        color: '#e6edf3',
      }}
    >
      <div>{lineNodes}</div>
    </div>
  );
}

interface LineProps {
  n: number;
  width: number;
  show: boolean;
  children: React.ReactNode;
}

function Line({ n, width, show, children }: LineProps) {
  return (
    <div style={{ display: 'flex', whiteSpace: 'pre' }}>
      {show && (
        <span
          style={{
            display: 'inline-block',
            width: `${width + 1}ch`,
            paddingRight: 12,
            color: '#484f58',
            userSelect: 'none',
            textAlign: 'right',
          }}
        >
          {n}
        </span>
      )}
      <span style={{ flex: 1 }}>{children}</span>
    </div>
  );
}
