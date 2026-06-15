/* ADVANSURE — Start screen + Avery chat */
const { useState, useRef, useEffect } = React;

/* ───────────────────────── Start ───────────────────────── */
function StartScreen({ persona, theme, onToggleTheme, onSwitchPersona, onStart, lastClaim, onOpenStatus }) {
  const A = window.ADV;
  return (
    <div className="adv-screen">
      <div className="adv-scroll" style={{ flex: 1, padding: '4px 20px 28px' }}>
        {/* top row: persona + theme */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 4, marginBottom: 30 }}>
          <button onClick={onSwitchPersona} style={{
            display: 'flex', alignItems: 'center', gap: 10, background: 'var(--surface-2)',
            border: '1px solid var(--border)', borderRadius: 999, padding: '6px 14px 6px 6px', cursor: 'pointer',
          }}>
            <span style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--accent)', color: 'var(--accent-ink)',
              display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 13 }}>{persona.initials}</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{persona.name}</span>
            <Icon name="chevron" size={15} color="var(--text-faint)" style={{ transform: 'rotate(90deg)' }} />
          </button>
          <IconButton name={theme === 'dark' ? 'sun' : 'moon'} onClick={onToggleTheme} ariaLabel="Theme wechseln" />
        </div>

        {/* hero greeting */}
        <div className="rise" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: 26 }}>
          <AveryOrb size={104} />
          <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--accent-deep)', marginTop: 22 }}>Advansure</div>
          <h1 style={{ fontSize: 30, fontWeight: 700, lineHeight: 1.15, margin: '8px 0 6px', letterSpacing: '-0.02em' }}>
            Hey {persona.name},<br />was liegt an?
          </h1>
          <p style={{ fontSize: 15.5, color: 'var(--text-muted)', margin: 0, maxWidth: 280, lineHeight: 1.5 }}>
            Beschreib mir kurz, was passiert ist – ich führe dich in wenigen Minuten durch die Schadenmeldung.
          </p>
        </div>

        {/* primary CTA */}
        <button className="btn btn-primary btn-block rise" style={{ marginBottom: 14, height: 60, fontSize: 17 }} onClick={onStart}>
          <Icon name="sparkle" size={20} color="var(--accent-ink)" /> Schaden melden
        </button>

        {/* last claim / status */}
        {lastClaim && (
          <button onClick={onOpenStatus} className="card rise" style={{
            width: '100%', textAlign: 'left', padding: '15px 17px', marginBottom: 14, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 13, background: 'var(--surface)',
          }}>
            <span style={{ width: 42, height: 42, borderRadius: 13, background: 'var(--accent-soft)', display: 'grid', placeItems: 'center' }}>
              <Icon name="clock" size={21} color="var(--accent-deep)" />
            </span>
            <span style={{ flex: 1 }}>
              <span style={{ display: 'block', fontSize: 14.5, fontWeight: 600 }}>Laufende Meldung</span>
              <span className="mono" style={{ display: 'block', fontSize: 12.5, color: 'var(--text-muted)' }}>{lastClaim.vorgang}</span>
            </span>
            <Icon name="chevron" size={18} color="var(--text-faint)" />
          </button>
        )}

        {/* policy card */}
        <div className="card rise" style={{ padding: '18px 18px 6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 14 }}>
            <Icon name="shield" size={19} color="var(--accent-deep)" />
            <span style={{ fontSize: 14, fontWeight: 600 }}>Deine Hausratpolice</span>
            <span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 600, color: 'var(--grade-leicht)',
              background: 'color-mix(in srgb, var(--grade-leicht) 15%, transparent)', padding: '3px 9px', borderRadius: 999 }}>Aktiv</span>
          </div>
          {[
            ['Wohnfläche', persona.area + ' m²', 'ruler'],
            ['Versicherungssumme', A.euro(persona.sumInsured), 'shield'],
            ['Adresse', persona.address, 'pin'],
            ['Police', persona.policy, 'doc'],
          ].map(([k, v, ic], i, arr) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0',
              borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <Icon name={ic} size={17} color="var(--text-faint)" />
              <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>{k}</span>
              <span className={k === 'Police' ? 'mono' : ''} style={{ marginLeft: 'auto', fontSize: 14, fontWeight: 600, textAlign: 'right' }}>{v}</span>
            </div>
          ))}
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-faint)', marginTop: 18 }}>{persona.tenure} · {persona.fullName}</p>
      </div>
    </div>
  );
}

/* ───────────────────────── Avery chat ───────────────────────── */
function recognizeDamage(text) {
  const t = text.toLowerCase();
  if (/(auto|kfz|fahrzeug|wagen|pkw|motorrad)/.test(t)) return { intent: 'notcovered', label: 'KFZ-Schaden' };
  if (/(wasser|waschmaschine|rohr|leitung|überschwemm|nass|feucht|leck|tropf)/.test(t)) {
    let cause = 'unklare Ursache';
    if (/waschmaschine/.test(t)) cause = 'defekte Waschmaschine';
    else if (/rohr|leitung/.test(t)) cause = 'Rohrbruch / Leitungswasser';
    else if (/regen|fenster|dach/.test(t)) cause = 'eindringendes Wasser';
    return { intent: 'ok', type: 'wasser', cause };
  }
  if (/(feuer|brand|kerze|rauch|verbrannt|angekohlt|flamme|geschmort)/.test(t)) {
    let cause = 'unklare Ursache';
    if (/kerze/.test(t)) cause = 'umgefallene Kerze';
    else if (/herd|küche|fett/.test(t)) cause = 'Küchenbrand';
    return { intent: 'ok', type: 'feuer', cause };
  }
  if (/(einbruch|gestohlen|dieb|aufgebrochen|aufgehebelt)/.test(t)) return { intent: 'ok', type: 'einbruch', cause: 'Einbruch' };
  if (/(sturm|hagel|orkan|unwetter)/.test(t)) return { intent: 'ok', type: 'sturm', cause: 'Unwetter' };
  if (t.trim().length < 14 || /(was passiert|irgendwas|keine ahnung|hilfe|schaden$)/.test(t.trim())) return { intent: 'vague' };
  return { intent: 'vague' };
}

const CHAT_SUGGESTIONS = [
  'Wasserschaden durch die Waschmaschine in der Küche',
  'Kerze umgefallen, Sofa angekohlt',
  'Mein Auto wurde zerkratzt',
];

function ChatScreen({ persona, onBack, onStartWalk, claim, setClaim }) {
  const A = window.ADV;
  const [messages, setMessages] = useState(() => ([
    { from: 'avery', text: 'Hi, ich bin Avery. Erzähl mir einfach in deinen eigenen Worten, was passiert ist – ganz ohne Formular.' },
  ]));
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState('');
  const [readyType, setReadyType] = useState(claim.damageType || null);
  const [showSugg, setShowSugg] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    const el = scrollRef.current; if (el) el.scrollTop = el.scrollHeight;
  }, [messages, typing]);

  function pushAvery(text, extra) {
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages(m => [...m, { from: 'avery', text, ...extra }]);
    }, 950);
  }

  function send(raw) {
    const text = (raw ?? input).trim();
    if (!text) return;
    setShowSugg(false);
    setMessages(m => [...m, { from: 'user', text }]);
    setInput('');
    const r = recognizeDamage(text);
    if (r.intent === 'notcovered') {
      pushAvery('Das klingt nach einem KFZ-Schaden – den kann ich über die Hausratversicherung leider nicht aufnehmen. Dafür ist deine Kfz-Versicherung zuständig. Ist sonst noch etwas in deiner Wohnung betroffen?');
    } else if (r.intent === 'vague') {
      pushAvery('Magst du das etwas genauer beschreiben? Zum Beispiel: Was ist passiert und in welchem Raum? Dann weiß ich, wie ich dir am besten helfe.');
    } else {
      const dt = A.damageTypes[r.type];
      setReadyType(r.type);
      setClaim(c => ({ ...c, damageType: r.type, cause: r.cause }));
      pushAvery(`${dt.empathy} Ich hab das so verstanden: ein **${dt.label}**, Ursache: ${r.cause}. Am besten zeigst du mir den Schaden direkt per Video – ich erkenne dann automatisch die betroffenen Räume.`, { cta: 'walk' });
    }
  }

  return (
    <div className="adv-screen">
      <TopBar onBack={onBack} title="Avery"
        trailing={<span style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--grade-leicht)' }} />} />
      <div ref={scrollRef} className="adv-scroll" style={{ flex: 1, padding: '8px 18px 8px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {messages.map((m, i) => (
          m.from === 'avery'
            ? <AveryMessage key={i}><FormattedText text={m.text} />
                {m.cta === 'walk' && (
                  <button className="btn btn-primary" style={{ marginTop: 13, height: 50, width: '100%' }} onClick={onStartWalk}>
                    <Icon name="video" size={20} color="var(--accent-ink)" /> Foto-Walk starten
                  </button>
                )}
              </AveryMessage>
            : <UserMessage key={i}>{m.text}</UserMessage>
        ))}
        {typing && <TypingBubble />}
        {showSugg && !typing && (
          <div className="fade" style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 12, color: 'var(--text-faint)', paddingLeft: 4 }}>Beispiele zum Antippen</span>
            {CHAT_SUGGESTIONS.map(s => (
              <button key={s} className="chip" style={{ textAlign: 'left' }} onClick={() => send(s)}>{s}</button>
            ))}
          </div>
        )}
      </div>
      {/* input bar */}
      <div style={{ flex: 'none', padding: '10px 16px 14px', borderTop: '1px solid var(--border)', background: 'var(--screen)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 26, padding: '6px 6px 6px 18px' }}>
          <input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') send(); }}
            placeholder="Schaden beschreiben…"
            style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontFamily: 'inherit', fontSize: 15.5, color: 'var(--text)' }} />
          <button onClick={() => send()} aria-label="Senden" style={{
            width: 42, height: 42, borderRadius: '50%', border: 'none', flex: 'none',
            background: input.trim() ? 'var(--accent)' : 'var(--surface-3)', color: input.trim() ? 'var(--accent-ink)' : 'var(--text-faint)',
            display: 'grid', placeItems: 'center', cursor: 'pointer', transition: 'background .2s' }}>
            <Icon name="arrowUp" size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* tiny **bold** formatter */
function FormattedText({ text }) {
  const parts = String(text).split(/(\*\*[^*]+\*\*)/g);
  return <span>{parts.map((p, i) => p.startsWith('**') && p.endsWith('**')
    ? <strong key={i} style={{ fontWeight: 700, color: 'var(--accent-deep)' }}>{p.slice(2, -2)}</strong>
    : <React.Fragment key={i}>{p}</React.Fragment>)}</span>;
}

Object.assign(window, { StartScreen, ChatScreen, FormattedText });
