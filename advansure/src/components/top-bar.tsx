import { Icon } from './icons';

interface TopBarProps {
  title?: string;
  onBack?: () => void;
  trailing?: React.ReactNode;
  /** Render the title in accent colour */
  accent?: boolean;
}

export function TopBar({ title, onBack, trailing, accent = false }: TopBarProps) {
  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '6px 18px 10px',
        minHeight: 56,
        background: 'var(--screen)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
      }}
    >
      {/* Left slot — always 44 px wide to keep title centred */}
      <div style={{ width: 44, flexShrink: 0 }}>
        {onBack && (
          <button
            aria-label="Zurück"
            onClick={onBack}
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              border: '1px solid var(--border)',
              background: 'var(--surface-2)',
              color: 'var(--text)',
              cursor: 'pointer',
              display: 'grid',
              placeItems: 'center',
              transition: 'background .15s, transform .12s',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <Icon name="back" size={20} />
          </button>
        )}
      </div>

      {/* Centred title */}
      <div
        style={{
          flex: 1,
          textAlign: 'center',
          fontWeight: 600,
          fontSize: 16,
          letterSpacing: '-0.01em',
          color: accent ? 'var(--accent-deep)' : 'var(--text)',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
        }}
      >
        {title}
      </div>

      {/* Right slot — always 44 px wide */}
      <div
        style={{
          width: 44,
          flexShrink: 0,
          display: 'flex',
          justifyContent: 'flex-end',
        }}
      >
        {trailing}
      </div>
    </header>
  );
}
