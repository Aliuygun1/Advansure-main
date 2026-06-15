/* ADVANSURE — Review & Pauschal · Success · Status timeline */
const { useState: useStateR, useEffect: useEffectR } = React;

/* ───────────── Review & Pauschal ───────────── */
function ReviewScreen({ persona, claim, onBack, onAddRoom, onSubmit, onRemoveRoom }) {
  const A = window.ADV;
  const dt = A.damageTypes[claim.damageType] || A.damageTypes.wasser;
  const rooms = claim.rooms || [];
  const total = rooms.reduce((s, r) => s + r.amount, 0);
  const [submitting, setSubmitting] = useStateR(false);
  const [showPauschal, setShowPauschal] = useStateR(false);

  function submit() {
    setSubmitting(true);
    setTimeout(() => onSubmit(), 1400);
  }

  return (
    <div className="adv-screen">
      <TopBar onBack={onBack} title="Zusammenfassung" />
      <div className="adv-scroll" style={{ flex: 1, padding: '4px 18px 20px' }}>
        {/* damage type */}
        <div className="card rise" style={{ padding: '16px 17px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 13 }}>
          <span style={{ width: 46, height: 46, borderRadius: 14, background: 'var(--accent-soft)', display: 'grid', placeItems: 'center', flex: 'none' }}>
            <Icon name={window.DTYPE_ICON[claim.damageType] || 'water'} size={24} color="var(--accent-deep)" />
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16.5, fontWeight: 700 }}>{dt.label}</div>
            <div style={{ fontSize: 13.5, color: 'var(--text-muted)' }}>Ursache: {claim.cause}</div>
          </div>
        </div>

        {/* rooms */}
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '4px 4px 10px' }}>
          <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-faint)' }}>
            Betroffene Räume
          </span>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{rooms.length} {rooms.length === 1 ? 'Raum' : 'Räume'}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
          {rooms.map((r) => (
            <div key={r.id} className="card rise" style={{ padding: '15px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 11 }}>
                <span style={{ fontSize: 16, fontWeight: 700 }}>{r.type}</span>
                <GradeBadge gradeKey={r.gradeKey} small />
                {rooms.length > 1 && (
                  <button onClick={() => onRemoveRoom(r.id)} aria-label="Raum entfernen" style={{
                    marginLeft: 'auto', width: 32, height: 32, borderRadius: 9, border: '1px solid var(--border)',
                    background: 'transparent', color: 'var(--text-faint)', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
                    <Icon name="trash" size={16} />
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: 'var(--text-muted)' }}>
                <Icon name="ruler" size={15} color="var(--text-faint)" />
                <span>{r.area} m²</span>
                <span style={{ color: 'var(--text-faint)' }}>×</span>
                <span>{A.euro(r.rate)} / m²</span>
                <span className="mono" style={{ marginLeft: 'auto', fontSize: 15.5, fontWeight: 700, color: 'var(--text)' }}>{A.euro(r.amount)}</span>
              </div>
            </div>
          ))}
        </div>

        <button className="btn btn-ghost btn-block" style={{ height: 48, marginBottom: 18 }} onClick={onAddRoom}>
          <Icon name="plus" size={18} /> Weiteren Raum aufnehmen
        </button>

        {/* pauschal explainer */}
        <button onClick={() => setShowPauschal(s => !s)} style={{
          width: '100%', textAlign: 'left', background: 'var(--surface-2)', border: '1px solid var(--border)',
          borderRadius: 16, padding: '13px 15px', cursor: 'pointer', marginBottom: 14, color: 'var(--text)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <Icon name="wand" size={18} color="var(--accent-deep)" />
            <span style={{ fontSize: 14, fontWeight: 600 }}>Wie wird das berechnet?</span>
            <Icon name="chevron" size={16} color="var(--text-faint)" style={{ marginLeft: 'auto', transform: showPauschal ? 'rotate(90deg)' : 'none', transition: 'transform .2s' }} />
          </div>
          {showPauschal && (
            <p className="fade" style={{ margin: '11px 0 0', fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.55 }}>
              Pauschalmethode: Pro Raum rechnen wir <b style={{ color: 'var(--text)' }}>Fläche × Pauschalsatz pro m²</b> – je nach Schadensgrad
              (leicht {A.euro(200)}, mittel {A.euro(450)}, schwer {A.euro(800)} pro m²). Das ist eine erste Einschätzung, keine verbindliche Zusage.
            </p>
          )}
        </button>

        {/* total */}
        <div className="card rise" style={{ padding: '20px', background: 'var(--accent-soft)', border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)' }}>
          <div style={{ fontSize: 13.5, color: 'var(--accent-deep)', fontWeight: 600, marginBottom: 4 }}>Voraussichtliche Schadenhöhe</div>
          <div className="mono" style={{ fontSize: 38, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text)' }}>{A.euro(total)}</div>
          <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 6 }}>Erste Einschätzung nach Pauschalmethode · ohne Selbstbeteiligung</div>
        </div>
      </div>

      {/* submit */}
      <div style={{ flex: 'none', padding: '12px 18px 16px', borderTop: '1px solid var(--border)', background: 'var(--screen)' }}>
        <button className="btn btn-primary btn-block" style={{ height: 58, fontSize: 17, opacity: submitting ? .75 : 1 }} onClick={submit} disabled={submitting}>
          {submitting
            ? <React.Fragment><span className="typing-dot" style={{ background: 'var(--accent-ink)' }} /><span className="typing-dot" style={{ background: 'var(--accent-ink)', animationDelay: '.18s' }} /><span className="typing-dot" style={{ background: 'var(--accent-ink)', animationDelay: '.36s' }} /></React.Fragment>
            : <React.Fragment><Icon name="check" size={20} color="var(--accent-ink)" /> Schaden absenden</React.Fragment>}
        </button>
      </div>
    </div>
  );
}

/* ───────────── Success ───────────── */
function SuccessScreen({ claim, onTrackStatus, onHome }) {
  const A = window.ADV;
  const total = (claim.rooms || []).reduce((s, r) => s + r.amount, 0);
  const [copied, setCopied] = useStateR(false);
  function copy() { try { navigator.clipboard.writeText(claim.vorgang); } catch (e) {} setCopied(true); setTimeout(() => setCopied(false), 1600); }
  return (
    <div className="adv-screen">
      <div className="adv-scroll" style={{ flex: 1, padding: '20px 22px 24px', display: 'flex', flexDirection: 'column' }}>
        <div className="rise" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginTop: 20 }}>
          <div style={{ position: 'relative' }}>
            <AveryOrb size={110} state="speaking" />
            <span className="pop" style={{ position: 'absolute', right: -4, bottom: -4, width: 40, height: 40, borderRadius: '50%',
              background: 'var(--grade-leicht)', display: 'grid', placeItems: 'center', border: '3px solid var(--screen)' }}>
              <Icon name="check" size={22} color="#fff" strokeWidth={2.6} />
            </span>
          </div>
          <h1 style={{ fontSize: 27, fontWeight: 700, margin: '24px 0 8px', letterSpacing: '-0.02em' }}>Schaden gemeldet</h1>
          <p style={{ fontSize: 15.5, color: 'var(--text-muted)', margin: 0, lineHeight: 1.5, maxWidth: 280 }}>
            Danke! Deine Meldung ist bei uns eingegangen. Wir kümmern uns sofort darum.
          </p>
        </div>

        {/* vorgang */}
        <button onClick={copy} className="card rise" style={{ marginTop: 26, padding: '18px', cursor: 'pointer', textAlign: 'left', width: '100%' }}>
          <div style={{ fontSize: 12.5, color: 'var(--text-faint)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 6 }}>Deine Vorgangsnummer</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="mono" style={{ fontSize: 24, fontWeight: 700, letterSpacing: '0.01em' }}>{claim.vorgang}</span>
            <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: copied ? 'var(--grade-leicht)' : 'var(--text-faint)' }}>
              <Icon name={copied ? 'check' : 'copy'} size={17} /> {copied ? 'Kopiert' : 'Kopieren'}
            </span>
          </div>
        </button>

        {/* mini summary */}
        <div className="card rise" style={{ marginTop: 12, padding: '16px 18px', display: 'flex', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Voraussichtliche Schadenhöhe</div>
            <div className="mono" style={{ fontSize: 20, fontWeight: 700 }}>{A.euro(total)}</div>
          </div>
          <span style={{ marginLeft: 'auto', fontSize: 12.5, fontWeight: 600, color: 'var(--accent-deep)', background: 'var(--accent-soft)', padding: '6px 11px', borderRadius: 999 }}>Eingegangen</span>
        </div>
      </div>

      <div style={{ flex: 'none', padding: '12px 18px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button className="btn btn-primary btn-block" style={{ height: 56 }} onClick={onTrackStatus}>
          <Icon name="clock" size={19} color="var(--accent-ink)" /> Status verfolgen
        </button>
        <button className="btn btn-ghost btn-block" style={{ height: 52 }} onClick={onHome}>Zur Übersicht</button>
      </div>
    </div>
  );
}

/* ───────────── Status timeline ───────────── */
function StatusScreen({ claim, onBack }) {
  const A = window.ADV;
  const stages = A.statusStages;
  const [current, setCurrent] = useStateR(0);
  const [refreshing, setRefreshing] = useStateR(false);
  const total = (claim.rooms || []).reduce((s, r) => s + r.amount, 0);

  const baseTime = new Date('2026-06-09T10:24:00');
  function stamp(i) {
    const d = new Date(baseTime.getTime() + i * 47 * 60000);
    return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' }) + ' · ' +
           d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  }
  function refresh() {
    if (current >= stages.length - 1) { setRefreshing(true); setTimeout(() => setRefreshing(false), 700); return; }
    setRefreshing(true);
    setTimeout(() => { setCurrent(c => Math.min(stages.length - 1, c + 1)); setRefreshing(false); }, 900);
  }

  return (
    <div className="adv-screen">
      <TopBar onBack={onBack} title="Status verfolgen"
        trailing={<IconButton name="refresh" onClick={refresh} ariaLabel="Aktualisieren" iconSize={19} style={{ animation: refreshing ? 'avery-spin .9s linear' : 'none' }} />} />
      <div className="adv-scroll" style={{ flex: 1, padding: '4px 20px 24px' }}>
        {/* vorgang header */}
        <div className="card rise" style={{ padding: '17px 18px', marginBottom: 22 }}>
          <div style={{ fontSize: 12.5, color: 'var(--text-faint)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Vorgang</div>
          <div className="mono" style={{ fontSize: 21, fontWeight: 700, margin: '3px 0 10px' }}>{claim.vorgang}</div>
          <div style={{ display: 'flex', gap: 16, fontSize: 13.5, color: 'var(--text-muted)' }}>
            <span>{(claim.rooms || []).length} {(claim.rooms || []).length === 1 ? 'Raum' : 'Räume'}</span>
            <span>·</span>
            <span className="mono" style={{ color: 'var(--text)', fontWeight: 600 }}>{A.euro(total)}</span>
          </div>
        </div>

        {/* timeline */}
        <div style={{ position: 'relative', paddingLeft: 4 }}>
          {stages.map((s, i) => {
            const done = i < current, active = i === current, future = i > current;
            return (
              <div key={s.key} style={{ display: 'flex', gap: 16, position: 'relative', paddingBottom: i < stages.length - 1 ? 30 : 0 }}>
                {/* connector */}
                {i < stages.length - 1 && (
                  <div style={{ position: 'absolute', left: 15, top: 30, bottom: 0, width: 2,
                    background: done ? 'var(--accent)' : 'var(--surface-3)' }} />
                )}
                {/* node */}
                <div style={{ width: 32, height: 32, borderRadius: '50%', flex: 'none', display: 'grid', placeItems: 'center',
                  background: done ? 'var(--accent)' : active ? 'var(--accent-soft)' : 'var(--surface-2)',
                  border: active ? '2px solid var(--accent)' : '2px solid ' + (done ? 'var(--accent)' : 'var(--border)'),
                  transition: 'all .4s', position: 'relative', zIndex: 1 }}>
                  {done ? <Icon name="check" size={17} color="var(--accent-ink)" strokeWidth={2.6} />
                    : active ? <span className="pop" style={{ width: 11, height: 11, borderRadius: '50%', background: 'var(--accent)' }} />
                    : <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--text-faint)', opacity: .5 }} />}
                </div>
                {/* text */}
                <div style={{ flex: 1, paddingTop: 2, opacity: future ? .5 : 1, transition: 'opacity .4s' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <span style={{ fontSize: 16, fontWeight: active ? 700 : 600, color: active ? 'var(--accent-deep)' : 'var(--text)' }}>{s.label}</span>
                    {active && <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent-deep)', background: 'var(--accent-soft)', padding: '2px 8px', borderRadius: 999 }}>Aktuell</span>}
                  </div>
                  <p style={{ margin: '3px 0 0', fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.45 }}>{s.desc}</p>
                  {!future && <div className="mono" style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 5 }}>{stamp(i)}</div>}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 24, padding: '14px 16px', borderRadius: 16, background: 'var(--surface-2)', border: '1px solid var(--border)',
          display: 'flex', gap: 11, alignItems: 'flex-start' }}>
          <Icon name="bell" size={18} color="var(--accent-deep)" style={{ marginTop: 1 }} />
          <span style={{ fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Wir benachrichtigen dich, sobald sich am Status etwas ändert. Tippe oben rechts auf <b style={{ color: 'var(--text)' }}>Aktualisieren</b>, um den Demo-Fortschritt zu simulieren.
          </span>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ReviewScreen, SuccessScreen, StatusScreen });
