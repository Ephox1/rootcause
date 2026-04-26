import { useEffect, useMemo } from 'react';
import { Scene } from '../scene/Scene';
import { GameHUD } from '../components/GameHUD';
import { SectionTag } from '../components/SectionTag';
import { PixelButton } from '../components/PixelButton';
import { BackIcon, BugIcon } from '../components/icons';
import { CodeBlock } from '../syntax/CodeBlock';
import { useGameStore } from '../store/useGameStore';
import type { ChoiceId } from '../types';

const DIFFICULTY_THRESHOLDS = { easy: 5, medium: 10, hard: 15 } as const;

export function BugHuntScreen() {
  const state = useGameStore();
  const question = state.bugHuntQuestions[state.bugHuntIndex];
  const threshold = DIFFICULTY_THRESHOLDS[state.difficulty];

  const progress = useMemo(() => {
    return `${state.bugHuntIndex + 1} / ${state.bugHuntQuestions.length}`;
  }, [state.bugHuntIndex, state.bugHuntQuestions.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (state.answerState === 'idle' && question) {
        const map: Record<string, ChoiceId> = { '1': 'a', '2': 'b', '3': 'c', '4': 'd' };
        const id = map[e.key];
        if (id) state.answerQuestion(id);
      } else if (e.key === 'Enter' && state.answerState !== 'idle') {
        state.advanceQuestion();
      } else if (e.key === 'Escape') {
        state.goHome();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [question, state]);

  if (!question) {
    return (
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <p style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 12, color: 'var(--text-dim)' }}>
          No questions available for this selection.
        </p>
        <PixelButton onClick={() => state.goHome()} icon={<BackIcon />} fullWidth={false}>
          BACK HOME
        </PixelButton>
      </div>
    );
  }

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
      <div style={{ position: 'absolute', inset: 0 }}>
        <Scene
          stage={state.visualStage}
          variant={state.treeVariant}
          theme={state.theme}
          characterState={state.characterState}
          streak={state.streak}
          difficulty={state.difficulty}
          reducedMotion={state.reducedMotion}
          flashKey={state.flashKey}
          flashType={state.flashType}
          showTree
          showCharacter={false}
        />
      </div>

      <div
        style={{
          position: 'relative',
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <button
          onClick={() => state.goHome()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 12px',
            background: 'var(--bg-panel)',
            border: '2px solid var(--border)',
            color: 'var(--text)',
            fontFamily: '"Press Start 2P", monospace',
            fontSize: 9,
            cursor: 'pointer',
            letterSpacing: '0.05em',
            boxShadow: '2px 2px 0 rgba(0,0,0,.4)',
          }}
        >
          <BackIcon size={10} />
          EXIT
        </button>
        <SectionTag num="2" label="FIND THE BUG" />
      </div>

      <div style={{ position: 'relative', flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, padding: '0 24px 20px', minHeight: 0 }}>
        {/* Left: code panel + HUD */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minHeight: 0 }}>
          <GameHUD
            score={state.score}
            streak={state.streak}
            subtitle={
              <span>
                {state.difficulty.toUpperCase()} · {state.language.toUpperCase()} · {progress}
              </span>
            }
            lastDelta={state.lastPointsDelta}
            flashKey={state.flashKey}
          />
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 14px',
              background: 'var(--bg-panel)',
              border: '2px solid var(--border)',
              boxShadow: '3px 3px 0 rgba(0,0,0,.4)',
            }}
          >
            <span style={{ color: 'var(--accent)' }}>
              <BugIcon size={14} color="currentColor" />
            </span>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: 'var(--text)', fontWeight: 600 }}>
              {question.prompt}
            </span>
          </div>
          <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
            <CodeBlock code={question.code} language={question.language} fontSize={14} />
          </div>
          <TreeProgressBar value={state.treeProgress} max={threshold} />
        </div>

        {/* Right: choices */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {question.choices.map((choice, i) => {
            const isSelected = state.selectedChoice === choice.id;
            const isCorrect = choice.id === question.correctChoiceId;
            const revealed = state.answerState !== 'idle';
            let variant: 'default' | 'primary' | 'success' | 'danger' = 'default';
            if (revealed && isCorrect) variant = 'success';
            else if (revealed && isSelected && !isCorrect) variant = 'danger';
            return (
              <ChoiceButton
                key={choice.id}
                label={`${i + 1}`}
                text={choice.text}
                variant={variant}
                disabled={revealed}
                onClick={() => state.answerQuestion(choice.id)}
                revealed={revealed}
              />
            );
          })}
        </div>
      </div>

      {state.answerState !== 'idle' && (
        <ExplanationModal
          correct={state.answerState === 'correct'}
          explanation={question.explanation}
          onContinue={() => state.advanceQuestion()}
        />
      )}

      {state.crt && <div aria-hidden className="crt-overlay" />}
    </div>
  );
}

interface ChoiceButtonProps {
  label: string;
  text: string;
  variant: 'default' | 'primary' | 'success' | 'danger';
  disabled: boolean;
  onClick: () => void;
  revealed: boolean;
}

function ChoiceButton({ label, text, variant, disabled, onClick, revealed }: ChoiceButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'flex',
        alignItems: 'stretch',
        gap: 0,
        width: '100%',
        padding: 0,
        background: 'transparent',
        border: 'none',
        cursor: disabled ? 'default' : 'pointer',
        opacity: revealed && variant === 'default' ? 0.55 : 1,
      }}
    >
      <span
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 44,
          background:
            variant === 'success'
              ? 'var(--success)'
              : variant === 'danger'
                ? 'var(--danger)'
                : 'var(--bg-elevated)',
          border: `2px solid ${
            variant === 'success'
              ? '#2d9638'
              : variant === 'danger'
                ? '#cf222e'
                : 'var(--border)'
          }`,
          borderRight: 'none',
          color: variant === 'default' ? 'var(--accent)' : '#fff',
          fontFamily: '"Press Start 2P", monospace',
          fontSize: 14,
        }}
      >
        {label}
      </span>
      <span
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          padding: '14px 16px',
          background:
            variant === 'success'
              ? 'rgba(63, 185, 80, 0.18)'
              : variant === 'danger'
                ? 'rgba(248, 81, 73, 0.18)'
                : 'var(--bg-panel)',
          border: `2px solid ${
            variant === 'success'
              ? '#2d9638'
              : variant === 'danger'
                ? '#cf222e'
                : 'var(--border)'
          }`,
          color: 'var(--text)',
          fontFamily: 'Inter, sans-serif',
          fontSize: 14,
          textAlign: 'left',
          boxShadow: '3px 3px 0 rgba(0,0,0,.4)',
          lineHeight: 1.4,
        }}
      >
        {text}
      </span>
    </button>
  );
}

interface TreeProgressBarProps {
  value: number;
  max: number;
}

function TreeProgressBar({ value, max }: TreeProgressBarProps) {
  const pct = Math.round((value / max) * 100);
  return (
    <div
      style={{
        padding: '10px 12px',
        background: 'var(--bg-panel)',
        border: '2px solid var(--border)',
        boxShadow: '3px 3px 0 rgba(0,0,0,.4)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontFamily: '"Press Start 2P", monospace',
          fontSize: 9,
          color: 'var(--text-dim)',
          letterSpacing: '0.12em',
          marginBottom: 6,
        }}
      >
        <span>TREE GROWTH</span>
        <span>
          {value} / {max}
        </span>
      </div>
      <div
        style={{
          height: 12,
          background: 'var(--bg)',
          border: '2px solid var(--border)',
          position: 'relative',
          boxShadow: 'inset 2px 2px 0 rgba(0,0,0,.35)',
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #2a6026, #6cb046, #9ed865)',
            transition: 'width 400ms ease-out',
          }}
        />
      </div>
    </div>
  );
}

interface ExplanationModalProps {
  correct: boolean;
  explanation: string;
  onContinue: () => void;
}

function ExplanationModal({ correct, explanation, onContinue }: ExplanationModalProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={correct ? 'Correct' : 'Incorrect'}
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        padding: 20,
        background: 'rgba(0, 0, 0, 0.55)',
        zIndex: 200,
        animation: 'rc-slideup 200ms ease-out',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 720,
          background: 'var(--bg-panel)',
          border: `3px solid ${correct ? 'var(--success)' : 'var(--danger)'}`,
          boxShadow: '6px 6px 0 rgba(0,0,0,.5)',
          padding: '18px 20px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 10,
          }}
        >
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 28,
              height: 28,
              background: correct ? 'var(--success)' : 'var(--danger)',
              color: '#fff',
              fontFamily: '"Press Start 2P", monospace',
              fontSize: 14,
              border: '2px solid #000',
            }}
          >
            {correct ? '✓' : '✕'}
          </span>
          <h3
            style={{
              margin: 0,
              fontFamily: '"Press Start 2P", monospace',
              fontSize: 12,
              color: correct ? 'var(--success)' : 'var(--danger)',
              letterSpacing: '0.1em',
            }}
          >
            {correct ? 'CORRECT' : 'NOT QUITE'}
          </h3>
        </div>
        <p
          style={{
            margin: '0 0 14px',
            fontFamily: 'Inter, sans-serif',
            fontSize: 14,
            color: 'var(--text)',
            lineHeight: 1.55,
          }}
        >
          {explanation}
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <PixelButton
            variant={correct ? 'success' : 'primary'}
            onClick={onContinue}
            fullWidth={false}
            align="center"
            style={{ minWidth: 160 }}
          >
            CONTINUE ⏎
          </PixelButton>
        </div>
      </div>
    </div>
  );
}
