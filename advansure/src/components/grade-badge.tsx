export type DamageGrade = 'leicht' | 'mittel' | 'schwer' | 'total' | 'nicht einschätzbar';

interface GradeBadgeProps {
  grade: DamageGrade;
  small?: boolean;
}

const GRADE_CONFIG: Record<DamageGrade, { label: string; color: string }> = {
  leicht:              { label: 'Leicht',           color: '#2FC58F' },
  mittel:              { label: 'Mittel',            color: '#E9A23B' },
  schwer:              { label: 'Schwer',            color: '#F2683C' },
  total:               { label: 'Totalschaden',      color: '#E5484D' },
  'nicht einschätzbar': { label: 'Nicht einschätzbar', color: '#8B8D98' },
};

export function GradeBadge({ grade, small = false }: GradeBadgeProps) {
  const { label, color } = GRADE_CONFIG[grade];

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontSize: small ? 12 : 13,
        fontWeight: 600,
        padding: small ? '4px 9px' : '5px 11px',
        borderRadius: 999,
        color,
        background: `color-mix(in srgb, ${color} 16%, transparent)`,
        border: `1px solid color-mix(in srgb, ${color} 35%, transparent)`,
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          background: color,
          flexShrink: 0,
        }}
      />
      {label}
    </span>
  );
}
