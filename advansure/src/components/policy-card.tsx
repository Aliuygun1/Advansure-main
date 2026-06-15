import { Icon } from './icons';

interface PolicyCardProps {
  livingArea: number;
  sumInsured: number;
  address: string;
  policyNo: string;
}

function formatEuro(amount: number): string {
  return amount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
}

type Row = [string, string, string, boolean];

export function PolicyCard({ livingArea, sumInsured, address, policyNo }: PolicyCardProps) {
  const rows: Row[] = [
    ['Wohnfläche',          `${livingArea} m²`,    'ruler', false],
    ['Versicherungssumme',  formatEuro(sumInsured), 'shield', false],
    ['Adresse',             address,               'pin',   false],
    ['Police',              policyNo,              'doc',   true ],
  ];

  return (
    <div
      className="adv-card"
      style={{ padding: '18px 18px 6px' }}
    >
      {/* Header row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 9,
          marginBottom: 14,
        }}
      >
        <Icon name="shield" size={19} color="var(--accent-deep)" />
        <span style={{ fontSize: 14, fontWeight: 600 }}>Deine Hausratpolice</span>

        {/* Active badge */}
        <span
          style={{
            marginLeft: 'auto',
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--grade-leicht)',
            background:
              'color-mix(in srgb, var(--grade-leicht) 15%, transparent)',
            padding: '3px 9px',
            borderRadius: 999,
          }}
        >
          Aktiv
        </span>
      </div>

      {/* Data rows */}
      {rows.map(([label, value, iconName, mono], i) => (
        <div
          key={label}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 0',
            borderBottom:
              i < rows.length - 1 ? '1px solid var(--border)' : 'none',
          }}
        >
          <Icon name={iconName} size={17} color="var(--text-faint)" />
          <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>
            {label}
          </span>
          <span
            className={mono ? 'mono' : undefined}
            style={{
              marginLeft: 'auto',
              fontSize: 14,
              fontWeight: 600,
              textAlign: 'right',
            }}
          >
            {value}
          </span>
        </div>
      ))}
    </div>
  );
}
