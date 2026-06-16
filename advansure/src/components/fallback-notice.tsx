import { Icon } from './icons';

interface FallbackNoticeProps {
  title: string;
  message: string;
  style?: React.CSSProperties;
}

/**
 * Calm, trustworthy info banner shown when the AI analysis was unavailable and
 * the claim is handled via manual review instead. Uses the brand accent (not a
 * warning colour) so it reassures rather than alarms, in line with the existing
 * card/notice styling.
 */
export function FallbackNotice({ title, message, style }: FallbackNoticeProps) {
  return (
    <div
      role="status"
      style={{
        display: 'flex',
        gap: 12,
        alignItems: 'flex-start',
        padding: '14px 16px',
        borderRadius: 16,
        background: 'var(--accent-soft)',
        border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)',
        ...style,
      }}
    >
      <span
        style={{
          width: 34,
          height: 34,
          borderRadius: 10,
          background: 'var(--surface)',
          display: 'grid',
          placeItems: 'center',
          flexShrink: 0,
        }}
      >
        <Icon name="shield" size={18} color="var(--accent-deep)" />
      </span>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>
          {title}
        </div>
        <p style={{ margin: 0, fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.55 }}>
          {message}
        </p>
      </div>
    </div>
  );
}
