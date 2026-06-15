/* ADVANSURE — app root: state machine, navigation, theme, persona */
const { useState: useApp, useEffect: useAppEffect } = React;

const {
  StartScreen, ChatScreen, FotoWalkScreen, ReviewScreen, SuccessScreen, StatusScreen,
  AveryOrb, Icon, useTweaks, TweaksPanel, TweakSection, TweakColor, TweakToggle,
} = window;

const ACCENTS = {
  '#1FD4A4': { base: '#1FD4A4', d2: '#14B98E', deep: '#10B488', ink: '#03261C', soft: 'rgba(31,212,164,0.14)', glow: 'rgba(31,212,164,0.45)' }, // Mint
  '#2BC96B': { base: '#2BC96B', d2: '#1FA855', deep: '#159A4E', ink: '#04240F', soft: 'rgba(43,201,107,0.14)', glow: 'rgba(43,201,107,0.45)' }, // Emerald
  '#16C5CE': { base: '#16C5CE', d2: '#11A6AE', deep: '#0E929A', ink: '#032426', soft: 'rgba(22,197,206,0.14)', glow: 'rgba(22,197,206,0.45)' }, // Teal
  '#6E7BFF': { base: '#6E7BFF', d2: '#5562F0', deep: '#4F5BE0', ink: '#FFFFFF', soft: 'rgba(110,123,255,0.16)', glow: 'rgba(110,123,255,0.45)' }, // Indigo
};
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#1FD4A4",
  "motion": true
}/*EDITMODE-END*/;

function genVorgang() {
  return 'ADV-2026-' + String(Math.floor(Math.random() * 9000) + 1000);
}
const emptyClaim = () => ({ damageType: null, cause: null, rooms: [], vorgang: null });

// Demo claim used for deep-linked screens (#review / #success / #status)
function demoClaim() {
  const A = window.ADV;
  return {
    damageType: 'wasser', cause: 'defekte Waschmaschine',
    rooms: [
      { id: 1, type: 'Küche', gradeKey: 'mittel', ...A.calcRoom('Küche', 'mittel'), iterations: 2 },
      { id: 2, type: 'Flur', gradeKey: 'leicht', ...A.calcRoom('Flur', 'leicht'), iterations: 1 },
    ],
    vorgang: 'ADV-2026-0482',
  };
}
const VALID_SCREENS = ['start', 'chat', 'walk', 'review', 'success', 'status'];
function initialFromHash() {
  const h = (window.location.hash || '').replace('#', '');
  if (VALID_SCREENS.includes(h)) {
    const needsClaim = ['review', 'success', 'status'].includes(h);
    const needsType = h === 'walk';
    return {
      screen: h,
      claim: needsClaim ? demoClaim() : needsType ? { ...emptyClaim(), damageType: 'wasser', cause: 'defekte Waschmaschine' } : emptyClaim(),
    };
  }
  return { screen: 'start', claim: emptyClaim() };
}

function PersonaSheet({ current, onPick, onClose }) {
  const P = window.ADV.personas;
  return (
    <div className="fade" onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 70, display: 'flex', alignItems: 'flex-end' }}>
      <div className="rise" onClick={e => e.stopPropagation()} style={{ width: '100%', background: 'var(--surface)', borderRadius: '28px 28px 0 0', padding: '10px 18px 30px', boxShadow: 'var(--shadow-pop)' }}>
        <div style={{ width: 40, height: 5, borderRadius: 3, background: 'var(--border-strong)', margin: '0 auto 16px' }} />
        <h3 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 700 }}>Demo-Persona wählen</h3>
        <p style={{ margin: '0 0 16px', fontSize: 13.5, color: 'var(--text-muted)' }}>Im PoC arbeiten wir mit drei Personas.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {Object.values(P).map(p => {
            const sel = p.id === current;
            return (
              <button key={p.id} onClick={() => onPick(p.id)} style={{
                display: 'flex', alignItems: 'center', gap: 13, padding: '13px 14px', borderRadius: 16, cursor: 'pointer',
                background: sel ? 'var(--accent-soft)' : 'var(--surface-2)',
                border: '1px solid ' + (sel ? 'color-mix(in srgb, var(--accent) 40%, transparent)' : 'var(--border)'), textAlign: 'left' }}>
                <span style={{ width: 42, height: 42, borderRadius: '50%', background: 'var(--accent)', color: 'var(--accent-ink)', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 14, flex: 'none' }}>{p.initials}</span>
                <span style={{ flex: 1 }}>
                  <span style={{ display: 'block', fontSize: 15.5, fontWeight: 600, color: 'var(--text)' }}>{p.fullName}</span>
                  <span style={{ display: 'block', fontSize: 12.5, color: 'var(--text-muted)' }}>{p.area} m² · {window.ADV.euro(p.sumInsured)}</span>
                </span>
                {sel && <Icon name="checkCircle" size={22} color="var(--accent-deep)" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function App() {
  const [theme, setTheme] = useApp(() => localStorage.getItem('adv-theme') || 'dark');
  const [personaId, setPersonaId] = useApp(() => localStorage.getItem('adv-persona') || 'leon');
  const _init = initialFromHash();
  const [screen, setScreen] = useApp(_init.screen);
  const [claim, setClaim] = useApp(_init.claim);
  const [showPersona, setShowPersona] = useApp(false);
  const [anim, setAnim] = useApp('fade');

  const persona = window.ADV.personas[personaId];
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  useAppEffect(() => {
    const a = ACCENTS[t.accent] || ACCENTS['#1FD4A4'];
    const r = document.documentElement.style;
    r.setProperty('--accent', a.base);
    r.setProperty('--accent-2', a.d2);
    r.setProperty('--accent-deep', a.deep);
    r.setProperty('--accent-ink', a.ink);
    r.setProperty('--accent-soft', a.soft);
    r.setProperty('--accent-glow', a.glow);
  }, [t.accent]);
  useAppEffect(() => { document.documentElement.classList.toggle('no-motion', !t.motion); }, [t.motion]);

  useAppEffect(() => { document.documentElement.setAttribute('data-theme', theme); localStorage.setItem('adv-theme', theme); }, [theme]);
  useAppEffect(() => { localStorage.setItem('adv-persona', personaId); }, [personaId]);

  // live deep-linking via #hash (also useful for sharing specific screens)
  useAppEffect(() => {
    function onHash() {
      const h = (window.location.hash || '').replace('#', '');
      if (!VALID_SCREENS.includes(h)) return;
      if (['review', 'success', 'status'].includes(h)) setClaim(demoClaim());
      else if (h === 'walk') setClaim(c => c.damageType ? c : { ...emptyClaim(), damageType: 'wasser', cause: 'defekte Waschmaschine' });
      setAnim('fade'); setScreen(h);
    }
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  function go(next, animation = 'fade') { setAnim(animation); setScreen(next); }

  function pickPersona(id) {
    setPersonaId(id); setShowPersona(false); setClaim(emptyClaim()); go('start', 'fade');
  }

  // status bar: white text on dark theme or full-bleed camera screen
  const statusDark = theme === 'dark' || screen === 'walk';

  let content = null;
  if (screen === 'start') {
    content = <StartScreen persona={persona} theme={theme}
      onToggleTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
      onSwitchPersona={() => setShowPersona(true)}
      onStart={() => go('chat', 'rise')}
      lastClaim={claim.vorgang ? claim : null}
      onOpenStatus={() => go('status', 'rise')} />;
  } else if (screen === 'chat') {
    content = <ChatScreen persona={persona} claim={claim} setClaim={setClaim}
      onBack={() => go('start')} onStartWalk={() => go('walk', 'rise')} />;
  } else if (screen === 'walk') {
    content = <FotoWalkScreen persona={persona} claim={claim}
      onCancel={() => go('start')}
      onComplete={(rooms) => { setClaim(c => ({ ...c, rooms })); go('review', 'rise'); }} />;
  } else if (screen === 'review') {
    content = <ReviewScreen persona={persona} claim={claim}
      onBack={() => go('chat')} onAddRoom={() => go('walk')}
      onRemoveRoom={(id) => setClaim(c => ({ ...c, rooms: c.rooms.filter(r => r.id !== id) }))}
      onSubmit={() => { setClaim(c => ({ ...c, vorgang: genVorgang(), submittedAt: Date.now() })); go('success', 'fade'); }} />;
  } else if (screen === 'success') {
    content = <SuccessScreen claim={claim} onTrackStatus={() => go('status', 'rise')} onHome={() => go('start')} />;
  } else if (screen === 'status') {
    content = <StatusScreen claim={claim} onBack={() => go('start')} />;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '28px 16px', gap: 18 }}>
      <IOSDevice dark={statusDark}>
        <div key={screen} className={anim} style={{ position: 'absolute', inset: 0 }}>
          {content}
        </div>
        {showPersona && <PersonaSheet current={personaId} onPick={pickPersona} onClose={() => setShowPersona(false)} />}
      </IOSDevice>
      <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,.4)', fontFamily: 'Geist, system-ui', textAlign: 'center', letterSpacing: '.01em' }}>
        Advansure · Hausrat-Schadenmeldung · Klickbarer Prototyp
      </div>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Markenfarbe" />
        <TweakColor label="Akzent" value={t.accent}
          options={['#1FD4A4', '#2BC96B', '#16C5CE', '#6E7BFF']}
          onChange={(v) => setTweak('accent', v)} />
        <TweakSection label="Bewegung" />
        <TweakToggle label="Animationen" value={t.motion} onChange={(v) => setTweak('motion', v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
