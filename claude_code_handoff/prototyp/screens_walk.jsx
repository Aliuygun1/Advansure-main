/* ADVANSURE — Foto-Walk: camera UI, iteration loop, cancel, camera-denied + text fallback */
const { useState: useStateW, useRef: useRefW, useEffect: useEffectW } = React;

(function injectWalkStyles() {
  if (document.getElementById('walk-styles')) return;
  const css = `
  @keyframes walk-scan { 0%{ top:8%; opacity:0 } 12%{opacity:.9} 88%{opacity:.9} 100%{ top:92%; opacity:0 } }
  @keyframes walk-recdot { 0%,100%{ opacity:1 } 50%{ opacity:.25 } }
  @keyframes walk-grain { 0%{ transform: translate(0,0) } 100%{ transform: translate(-6%,4%) } }
  .vf-grid:before, .vf-grid:after { content:''; position:absolute; background: rgba(255,255,255,.12); }
  `;
  const el = document.createElement('style'); el.id = 'walk-styles'; el.textContent = css; document.head.appendChild(el);
})();

const ROOM_SCRIPT = {
  wasser:   [{ type: 'Küche', grade: 'mittel' }, { type: 'Flur', grade: 'leicht' }, { type: 'Wohnzimmer', grade: 'leicht' }],
  feuer:    [{ type: 'Wohnzimmer', grade: 'schwer' }, { type: 'Schlafzimmer', grade: 'leicht' }],
  einbruch: [{ type: 'Wohnzimmer', grade: 'leicht' }, { type: 'Schlafzimmer', grade: 'mittel' }],
  sturm:    [{ type: 'Wohnzimmer', grade: 'mittel' }, { type: 'Schlafzimmer', grade: 'leicht' }],
};
const AI_NOTES = {
  leicht: 'Oberflächliche Spuren erkennbar, Substanz weitgehend intakt.',
  mittel: 'Deutliche Schäden an Boden und Wänden, Substanz betroffen.',
  schwer: 'Massive Schäden, Sanierung des Raums erforderlich.',
  total:  'Raum vollständig zerstört.',
};

/* ── Faux live viewfinder ── */
function Viewfinder({ recording, timer, label }) {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background:
      'radial-gradient(120% 80% at 50% 35%, #20303a 0%, #131c24 45%, #0a0f14 100%)' }}>
      {/* faux room shapes */}
      <div style={{ position: 'absolute', inset: 0, opacity: .5, background:
        'linear-gradient(105deg, transparent 38%, rgba(255,255,255,.05) 39%, transparent 41%), \
         linear-gradient(255deg, transparent 60%, rgba(0,0,0,.4) 90%)' }} />
      <div style={{ position: 'absolute', left: '-10%', bottom: '-5%', width: '60%', height: '45%',
        background: 'linear-gradient(180deg, rgba(255,255,255,.04), rgba(0,0,0,.25))', transform: 'skewX(-12deg)', borderRadius: 8 }} />
      <div style={{ position: 'absolute', right: '6%', top: '20%', width: '34%', height: '40%',
        border: '1px solid rgba(255,255,255,.08)', borderRadius: 6, background: 'rgba(255,255,255,.02)' }} />
      {/* grain */}
      <div style={{ position: 'absolute', inset: '-10%', opacity: .05, animation: 'walk-grain 1.2s steps(2) infinite alternate',
        backgroundImage: 'radial-gradient(rgba(255,255,255,.7) .5px, transparent .5px)', backgroundSize: '4px 4px' }} />
      {/* rule-of-thirds grid */}
      <div style={{ position: 'absolute', inset: 0, opacity: recording ? .35 : .18 }}>
        {[33.3, 66.6].map(p => <div key={'v'+p} style={{ position: 'absolute', left: p+'%', top: 0, bottom: 0, width: 1, background: 'rgba(255,255,255,.4)' }} />)}
        {[33.3, 66.6].map(p => <div key={'h'+p} style={{ position: 'absolute', top: p+'%', left: 0, right: 0, height: 1, background: 'rgba(255,255,255,.4)' }} />)}
      </div>
      {/* scanning line while recording */}
      {recording && <div style={{ position: 'absolute', left: 0, right: 0, height: 2, top: '8%',
        background: 'linear-gradient(90deg, transparent, var(--accent), transparent)', boxShadow: '0 0 16px var(--accent-glow)',
        animation: 'walk-scan 2.4s ease-in-out infinite' }} />}
      {/* focus reticle */}
      <div style={{ position: 'absolute', left: '50%', top: '46%', transform: 'translate(-50%,-50%)', width: 86, height: 86,
        border: '1.5px solid rgba(255,255,255,.7)', borderRadius: 12, opacity: recording ? .9 : .5 }} />
      {/* corner brackets */}
      {[['8%','8%','tl'],['8%','8%','tr'],['8%','8%','bl'],['8%','8%','br']].map(([,,c]) => (
        <div key={c} style={{ position: 'absolute', width: 26, height: 26,
          ...(c[0]==='t' ? { top: 22 } : { bottom: 22 }), ...(c[1]==='l' ? { left: 22 } : { right: 22 }),
          borderTop: c[0]==='t' ? '2px solid rgba(255,255,255,.8)' : 'none',
          borderBottom: c[0]==='b' ? '2px solid rgba(255,255,255,.8)' : 'none',
          borderLeft: c[1]==='l' ? '2px solid rgba(255,255,255,.8)' : 'none',
          borderRight: c[1]==='r' ? '2px solid rgba(255,255,255,.8)' : 'none',
          borderRadius: 4 }} />
      ))}
      {/* top status */}
      <div style={{ position: 'absolute', top: 18, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 10 }}>
        {recording ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(8px)',
            padding: '6px 13px', borderRadius: 999, fontSize: 13, fontWeight: 600, color: '#fff' }}>
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FF453A', animation: 'walk-recdot 1s infinite' }} />
            <span className="mono">{timer}</span>
          </span>
        ) : (
          <span style={{ background: 'rgba(0,0,0,.45)', backdropFilter: 'blur(8px)', padding: '6px 13px', borderRadius: 999,
            fontSize: 12.5, fontWeight: 600, color: 'rgba(255,255,255,.85)' }}>Live-Kamera · Demo</span>
        )}
      </div>
      {label && <div style={{ position: 'absolute', bottom: 18, left: 0, right: 0, textAlign: 'center',
        fontSize: 12.5, color: 'rgba(255,255,255,.6)' }}>{label}</div>}
    </div>
  );
}

function FotoWalkScreen({ persona, claim, onCancel, onComplete }) {
  const A = window.ADV;
  const script = ROOM_SCRIPT[claim.damageType] || ROOM_SCRIPT.wasser;
  const [phase, setPhase] = useStateW('permission'); // permission|denied|textfallback|instruction|recording|tooShort|analyzing|result
  const [rooms, setRooms] = useStateW([]);
  const [roomIdx, setRoomIdx] = useStateW(0);
  const [iteration, setIteration] = useStateW(1);
  const [timer, setTimer] = useStateW('00:00');
  const [progress, setProgress] = useStateW(0);
  const [result, setResult] = useStateW(null);
  const [showCancel, setShowCancel] = useStateW(false);
  const [instruction, setInstruction] = useStateW('Filme zuerst den Raum mit dem größten Schaden.');
  const recStart = useRefW(0);
  const tickRef = useRefW(null);

  const planned = script[roomIdx] || script[script.length - 1];

  // ── recording timer ──
  function startRec() {
    setPhase('recording'); recStart.current = Date.now();
    tickRef.current = setInterval(() => {
      const s = (Date.now() - recStart.current) / 1000;
      const mm = String(Math.floor(s / 60)).padStart(2, '0');
      const ss = String(Math.floor(s % 60)).padStart(2, '0');
      setTimer(`${mm}:${ss}`);
    }, 200);
  }
  function stopRec() {
    clearInterval(tickRef.current);
    const dur = (Date.now() - recStart.current) / 1000;
    if (dur < 2) { setPhase('tooShort'); setTimer('00:00'); return; }
    setTimer('00:00'); analyze();
  }
  useEffectW(() => () => clearInterval(tickRef.current), []);

  // ── analysis (faux) ──
  function analyze() {
    setPhase('analyzing'); setProgress(0);
    const t0 = Date.now(); const total = 2200;
    const iv = setInterval(() => {
      const p = Math.min(100, ((Date.now() - t0) / total) * 100);
      setProgress(p);
      if (p >= 100) {
        clearInterval(iv);
        // first room, first iteration → ask for more (demonstrate FA-04 loop)
        const needMore = roomIdx === 0 && iteration === 1;
        if (needMore) {
          setResult({ roomType: planned.type, gradeKey: planned.grade, satisfied: false,
            next: 'Fast! Zeig mir bitte noch den Boden in der ' + planned.type + ' etwas näher.' });
        } else {
          setResult({ roomType: planned.type, gradeKey: planned.grade, satisfied: true });
        }
        setPhase('result');
      }
    }, 60);
  }

  function recordAgain() {
    setIteration(i => i + 1);
    setInstruction(result.next || 'Nimm den Raum bitte noch einmal auf.');
    setResult(null); setPhase('instruction');
  }
  function addRoomAndContinue(more) {
    const calc = A.calcRoom(result.roomType, result.gradeKey);
    const newRooms = [...rooms, { id: Date.now(), type: result.roomType, gradeKey: result.gradeKey, ...calc, iterations: iteration }];
    setRooms(newRooms);
    setResult(null);
    if (more) {
      const next = roomIdx + 1;
      setRoomIdx(next); setIteration(1);
      setInstruction(`Super. Gibt es noch einen betroffenen Raum? Dann filme jetzt den nächsten.`);
      setPhase('instruction');
    } else {
      onComplete(newRooms);
    }
  }

  // ── render per phase ──
  // permission sheet
  if (phase === 'permission') {
    return (
      <div className="adv-screen" style={{ background: '#0a0f14' }}>
        <Viewfinder recording={false} timer={timer} label="" />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.45)' }} />
        <div className="pop" style={{ position: 'absolute', left: 24, right: 24, top: '50%', transform: 'translateY(-50%)',
          background: 'var(--surface)', borderRadius: 24, padding: '24px 22px', textAlign: 'center', boxShadow: 'var(--shadow-pop)' }}>
          <span style={{ width: 56, height: 56, borderRadius: 17, background: 'var(--accent-soft)', display: 'grid', placeItems: 'center', margin: '0 auto 14px' }}>
            <Icon name="camera" size={28} color="var(--accent-deep)" />
          </span>
          <h3 style={{ margin: '0 0 8px', fontSize: 19, fontWeight: 700 }}>Kamera-Zugriff erlauben?</h3>
          <p style={{ margin: '0 0 20px', fontSize: 14.5, color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Advansure braucht deine Kamera, damit Avery den Schaden per Video einschätzen kann.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button className="btn btn-primary btn-block" onClick={() => setPhase('instruction')}>Erlauben</button>
            <button className="btn btn-ghost btn-block" onClick={() => setPhase('denied')}>Nicht erlauben</button>
          </div>
        </div>
        <button onClick={() => setShowCancel(true)} style={cancelBtnStyle}><Icon name="close" size={20} color="#fff" /></button>
        {showCancel && <CancelDialog onConfirm={onCancel} onDismiss={() => setShowCancel(false)} />}
      </div>
    );
  }

  // camera denied (FA-06)
  if (phase === 'denied') {
    return (
      <div className="adv-screen">
        <TopBar onBack={onCancel} title="Kamera nicht verfügbar" />
        <div className="adv-scroll" style={{ flex: 1, padding: '8px 22px 28px', display: 'flex', flexDirection: 'column' }}>
          <div className="rise" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginTop: 12, marginBottom: 26 }}>
            <span style={{ width: 72, height: 72, borderRadius: 22, background: 'var(--danger-soft)', display: 'grid', placeItems: 'center', marginBottom: 18 }}>
              <Icon name="camera" size={34} color="var(--danger)" />
            </span>
            <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 8px' }}>Ohne Kamera kein Foto-Walk</h2>
            <p style={{ fontSize: 15, color: 'var(--text-muted)', margin: 0, lineHeight: 1.55, maxWidth: 290 }}>
              Kein Problem – du kannst den Zugriff erneut erlauben oder mir den Schaden einfach beschreiben. Beides funktioniert.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
            <button className="btn btn-primary btn-block" onClick={() => setPhase('permission')}>
              <Icon name="camera" size={20} color="var(--accent-ink)" /> Berechtigung neu anfragen
            </button>
            <button className="btn btn-ghost btn-block" onClick={() => setPhase('textfallback')}>
              <Icon name="edit" size={19} /> Schaden textbasiert beschreiben
            </button>
          </div>
        </div>
      </div>
    );
  }

  // text fallback (FA-06 alt 2)
  if (phase === 'textfallback') {
    return <TextFallback persona={persona} claim={claim} onCancel={onCancel} onComplete={onComplete} script={script} />;
  }

  // analyzing
  if (phase === 'analyzing') {
    return (
      <div className="adv-screen" style={{ background: '#0a0f14', color: '#fff' }}>
        <Viewfinder recording={false} timer={timer} label="" />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(6,10,14,.78)', backdropFilter: 'blur(3px)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 40px' }}>
          <AveryOrb size={92} state="thinking" />
          <p style={{ fontSize: 16.5, fontWeight: 600, margin: '24px 0 4px', color: '#fff' }}>Avery analysiert dein Video…</p>
          <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,.6)', margin: '0 0 22px' }}>Räume & Schadensgrad werden erkannt</p>
          <div style={{ width: '100%', maxWidth: 240 }}>
            <div className="seg" style={{ height: 6, background: 'rgba(255,255,255,.14)' }}><i style={{ width: progress + '%' }} /></div>
          </div>
        </div>
      </div>
    );
  }

  // result
  if (phase === 'result' && result) {
    const g = A.grades[result.gradeKey];
    const calc = A.calcRoom(result.roomType, result.gradeKey);
    return (
      <div className="adv-screen" style={{ background: '#0a0f14' }}>
        <Viewfinder recording={false} timer="00:00" label="" />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(6,10,14,.2), rgba(6,10,14,.85))' }} />
        <div className="pop" style={{ position: 'absolute', left: 16, right: 16, bottom: 24,
          background: 'var(--surface)', borderRadius: 26, padding: '20px', boxShadow: 'var(--shadow-pop)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <AveryOrb size={34} state="speaking" />
            <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>
              {result.satisfied ? 'Perfekt, das reicht mir.' : 'Aufnahme ' + iteration + ' analysiert'}
            </span>
            {result.satisfied && <span style={{ marginLeft: 'auto' }}><Icon name="checkCircle" size={24} color="var(--grade-leicht)" /></span>}
          </div>

          <div style={{ background: 'var(--surface-2)', borderRadius: 18, padding: '15px 16px', marginBottom: result.satisfied ? 16 : 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <span style={{ fontSize: 17, fontWeight: 700 }}>{result.roomType}</span>
              <GradeBadge gradeKey={result.gradeKey} />
            </div>
            <p style={{ margin: '0 0 12px', fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.45 }}>{AI_NOTES[result.gradeKey]}</p>
            {result.satisfied && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-faint)' }}>
                <Icon name="ruler" size={15} /> {calc.area} m² × {A.euro(calc.rate)}/m²
                <span style={{ marginLeft: 'auto', fontWeight: 700, fontSize: 15, color: 'var(--text)' }} className="mono">≈ {A.euro(calc.amount)}</span>
              </div>
            )}
          </div>

          {!result.satisfied ? (
            <React.Fragment>
              <div style={{ display: 'flex', gap: 9, alignItems: 'flex-start', marginBottom: 14, padding: '0 2px' }}>
                <Icon name="sparkle" size={17} color="var(--accent-deep)" style={{ marginTop: 1 }} />
                <span style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.45 }}>{result.next}</span>
              </div>
              <button className="btn btn-primary btn-block" onClick={recordAgain}>
                <Icon name="video" size={19} color="var(--accent-ink)" /> Weiter aufnehmen
              </button>
            </React.Fragment>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button className="btn btn-primary btn-block" onClick={() => addRoomAndContinue(true)}>
                <Icon name="plus" size={19} color="var(--accent-ink)" /> Weiterer Raum betroffen
              </button>
              <button className="btn btn-ghost btn-block" onClick={() => addRoomAndContinue(false)}>
                <Icon name="check" size={19} /> Fertig – zusammenfassen
              </button>
            </div>
          )}
        </div>
        <button onClick={() => setShowCancel(true)} style={cancelBtnStyle}><Icon name="close" size={20} color="#fff" /></button>
        {showCancel && <CancelDialog onConfirm={onCancel} onDismiss={() => setShowCancel(false)} />}
      </div>
    );
  }

  // instruction + recording (default)
  const isRec = phase === 'recording';
  return (
    <div className="adv-screen" style={{ background: '#0a0f14' }}>
      <Viewfinder recording={isRec} timer={timer} label={isRec ? 'Tippe erneut zum Stoppen' : ''} />

      {/* progress dots of rooms */}
      <div style={{ position: 'absolute', top: 60, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 6 }}>
        {rooms.map((r, i) => <span key={i} style={{ width: 22, height: 4, borderRadius: 4, background: 'var(--accent)' }} />)}
        <span style={{ width: 22, height: 4, borderRadius: 4, background: 'rgba(255,255,255,.3)' }} />
      </div>

      {/* Avery instruction */}
      {!isRec && phase !== 'tooShort' && (
        <div className="rise" style={{ position: 'absolute', left: 18, right: 18, top: 92, display: 'flex', gap: 11, alignItems: 'flex-start',
          background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(10px)', padding: '13px 15px', borderRadius: 20 }}>
          <AveryOrb size={32} state="speaking" />
          <span style={{ fontSize: 14.5, color: '#fff', lineHeight: 1.45, paddingTop: 3 }}>{instruction}</span>
        </div>
      )}
      {phase === 'tooShort' && (
        <div className="pop" style={{ position: 'absolute', left: 18, right: 18, top: 92, display: 'flex', gap: 11, alignItems: 'center',
          background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(10px)', padding: '13px 15px', borderRadius: 20 }}>
          <Icon name="alert" size={22} color="#FFCC55" />
          <span style={{ fontSize: 14.5, color: '#fff', lineHeight: 1.4 }}>Das war zu kurz. Filme bitte mindestens 2–3 Sekunden.</span>
        </div>
      )}

      {/* record control */}
      <div style={{ position: 'absolute', bottom: 40, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
        <button onClick={isRec ? stopRec : startRec} aria-label={isRec ? 'Stop' : 'Aufnahme'} style={{
          width: 78, height: 78, borderRadius: '50%', border: '4px solid rgba(255,255,255,.85)',
          background: 'transparent', cursor: 'pointer', display: 'grid', placeItems: 'center', transition: 'transform .12s' }}>
          <span style={{ width: isRec ? 30 : 60, height: isRec ? 30 : 60, borderRadius: isRec ? 9 : '50%',
            background: isRec ? '#FF453A' : '#fff', transition: 'all .25s cubic-bezier(.2,.8,.2,1)' }} />
        </button>
      </div>

      <button onClick={() => setShowCancel(true)} style={cancelBtnStyle}><Icon name="close" size={20} color="#fff" /></button>
      {showCancel && <CancelDialog onConfirm={onCancel} onDismiss={() => setShowCancel(false)} />}
    </div>
  );
}

const cancelBtnStyle = {
  position: 'absolute', top: 56, left: 18, width: 40, height: 40, borderRadius: '50%',
  background: 'rgba(0,0,0,.45)', backdropFilter: 'blur(8px)', border: 'none', cursor: 'pointer',
  display: 'grid', placeItems: 'center', zIndex: 30,
};

function CancelDialog({ onConfirm, onDismiss }) {
  return (
    <div className="fade" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.55)', display: 'grid', placeItems: 'center', zIndex: 60, padding: '0 28px' }}>
      <div className="pop" style={{ background: 'var(--surface)', borderRadius: 24, padding: '24px 22px', width: '100%', textAlign: 'center', boxShadow: 'var(--shadow-pop)' }}>
        <h3 style={{ margin: '0 0 8px', fontSize: 18.5, fontWeight: 700 }}>Foto-Walk wirklich abbrechen?</h3>
        <p style={{ margin: '0 0 20px', fontSize: 14.5, color: 'var(--text-muted)', lineHeight: 1.5 }}>
          Deine bisherigen Aufnahmen bleiben gespeichert. Du kannst jederzeit neu starten.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button className="btn btn-block" style={{ height: 52, background: 'var(--danger-soft)', color: 'var(--danger)' }} onClick={onConfirm}>Ja, abbrechen</button>
          <button className="btn btn-ghost btn-block" style={{ height: 52 }} onClick={onDismiss}>Nein, weitermachen</button>
        </div>
      </div>
    </div>
  );
}

/* ── Text fallback: guided Q&A without camera ── */
function TextFallback({ persona, claim, onCancel, onComplete, script }) {
  const A = window.ADV;
  const roomOptions = ['Küche', 'Bad', 'Wohnzimmer', 'Schlafzimmer', 'Flur', 'Kinderzimmer'];
  const [step, setStep] = useStateW({ kind: 'room' }); // room | grade | more
  const [pendingRoom, setPendingRoom] = useStateW(null);
  const [rooms, setRooms] = useStateW([]);
  const [log, setLog] = useStateW([{ from: 'avery', text: 'Alles gut, dann machen wir es per Text. Welcher Raum ist betroffen?' }]);
  const scrollRef = useRefW(null);
  useEffectW(() => { const el = scrollRef.current; if (el) el.scrollTop = el.scrollHeight; }, [log]);

  function pick(label, value, kind) {
    setLog(l => [...l, { from: 'user', text: label }]);
    setTimeout(() => {
      if (kind === 'room') {
        setPendingRoom(value);
        setLog(l => [...l, { from: 'avery', text: `Und wie stark ist die ${value} betroffen?` }]);
        setStep({ kind: 'grade' });
      } else if (kind === 'grade') {
        const calc = A.calcRoom(pendingRoom, value);
        const nr = [...rooms, { id: Date.now(), type: pendingRoom, gradeKey: value, ...calc, iterations: 0 }];
        setRooms(nr);
        setLog(l => [...l, { from: 'avery', text: `Notiert: ${pendingRoom}, ${A.grades[value].label}. Ist noch ein weiterer Raum betroffen?` }]);
        setStep({ kind: 'more' });
      }
    }, 600);
  }
  function more(yes) {
    setLog(l => [...l, { from: 'user', text: yes ? 'Ja, noch einer' : 'Nein, das war’s' }]);
    if (yes) { setTimeout(() => { setLog(l => [...l, { from: 'avery', text: 'Welcher Raum noch?' }]); setStep({ kind: 'room' }); }, 500); }
    else { setTimeout(() => onComplete(rooms), 500); }
  }

  return (
    <div className="adv-screen">
      <TopBar onBack={onCancel} title="Schaden beschreiben" />
      <div ref={scrollRef} className="adv-scroll" style={{ flex: 1, padding: '8px 18px', display: 'flex', flexDirection: 'column', gap: 13 }}>
        {log.map((m, i) => m.from === 'avery'
          ? <AveryMessage key={i}>{m.text}</AveryMessage>
          : <UserMessage key={i}>{m.text}</UserMessage>)}
      </div>
      <div style={{ flex: 'none', padding: '12px 16px 16px', borderTop: '1px solid var(--border)', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {step.kind === 'room' && roomOptions.map(r => <button key={r} className="chip" onClick={() => pick(r, r, 'room')}>{r}</button>)}
        {step.kind === 'grade' && ['leicht', 'mittel', 'schwer'].map(g => (
          <button key={g} className="chip" onClick={() => pick(A.grades[g].label, g, 'grade')}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: A.grades[g].color, display: 'inline-block', marginRight: 6 }} />{A.grades[g].label}
          </button>
        ))}
        {step.kind === 'more' && (
          <React.Fragment>
            <button className="btn btn-ghost" style={{ flex: 1, height: 48 }} onClick={() => more(true)}>Ja, noch einer</button>
            <button className="btn btn-primary" style={{ flex: 1, height: 48 }} onClick={() => more(false)}>Fertig</button>
          </React.Fragment>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { FotoWalkScreen });
