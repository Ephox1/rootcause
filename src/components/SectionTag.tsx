interface SectionTagProps {
  num: string;
  label: string;
}

export function SectionTag({ num, label }: SectionTagProps) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'stretch',
        border: '2px solid var(--accent-bright)',
        boxShadow: '3px 3px 0 rgba(0,0,0,.4)',
        overflow: 'hidden',
      }}
    >
      <span
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 34,
          background: 'var(--accent)',
          color: '#fff',
          fontFamily: '"Press Start 2P", monospace',
          fontSize: 13,
          letterSpacing: '0.05em',
        }}
      >
        {num}
      </span>
      <span
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '6px 14px',
          background: 'var(--bg-panel)',
          color: 'var(--text)',
          fontFamily: '"Press Start 2P", monospace',
          fontSize: 11,
          letterSpacing: '0.12em',
        }}
      >
        {label}
      </span>
    </div>
  );
}
