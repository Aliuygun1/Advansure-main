/* ADVANSURE — Avery: animated glowing orb (the brand element) */

(function injectAveryStyles() {
  if (document.getElementById('avery-orb-styles')) return;
  const css = `
  @keyframes avery-breathe { 0%,100%{ transform: scale(1); } 50%{ transform: scale(1.05);} }
  @keyframes avery-spin { to { transform: rotate(360deg); } }
  @keyframes avery-spin-rev { to { transform: rotate(-360deg); } }
  @keyframes avery-ring { 0%{ transform: scale(.7); opacity:.55;} 100%{ transform: scale(1.7); opacity:0;} }
  @keyframes avery-think { 0%,100%{ transform: scale(1);} 50%{ transform: scale(1.12);} }
  .avery-orb { position: relative; display: inline-grid; place-items: center; flex: none; }
  .avery-orb__core { position: relative; border-radius: 50%; overflow: hidden;
     box-shadow: inset 0 0 18px rgba(255,255,255,0.25); }
  .avery-orb__glow { position:absolute; inset:-30%; border-radius:50%; filter: blur(14px);
     background: radial-gradient(circle at 50% 50%, var(--accent-glow), transparent 70%); z-index:-1; }
  .avery-orb__shimmer { position:absolute; inset:-20%; border-radius:50%;
     background: conic-gradient(from 0deg, transparent, rgba(255,255,255,.55), transparent 35%, var(--accent), transparent 70%, rgba(255,255,255,.4), transparent);
     mix-blend-mode: screen; animation: avery-spin 6s linear infinite; }
  .avery-orb__shimmer2 { position:absolute; inset:5%; border-radius:50%;
     background: conic-gradient(from 180deg, transparent, var(--accent-deep), transparent 40%, rgba(255,255,255,.3), transparent 75%);
     mix-blend-mode: screen; animation: avery-spin-rev 9s linear infinite; opacity:.8; }
  .avery-orb__hi { position:absolute; width:34%; height:30%; left:22%; top:16%; border-radius:50%;
     background: radial-gradient(circle, rgba(255,255,255,.95), transparent 70%); filter: blur(2px); }
  .avery-orb__ring { position:absolute; inset:0; border-radius:50%; border:1.5px solid var(--accent); }
  `;
  const el = document.createElement('style');
  el.id = 'avery-orb-styles';
  el.textContent = css;
  document.head.appendChild(el);
})();

function AveryOrb({ size = 96, state = 'idle', style = {} }) {
  // state: idle | thinking | speaking | listening
  const breatheDur = state === 'thinking' ? '1.1s' : state === 'speaking' ? '1.6s' : '4s';
  const core = (
    <div
      className="avery-orb__core"
      style={{
        width: size, height: size,
        background: 'radial-gradient(circle at 35% 30%, #BFFBE9 0%, var(--accent) 34%, var(--accent-2) 62%, #064236 100%)',
        animation: `avery-breathe ${breatheDur} ease-in-out infinite`,
      }}
    >
      <div className="avery-orb__shimmer" />
      <div className="avery-orb__shimmer2" />
      <div className="avery-orb__hi" />
    </div>
  );
  return (
    <div className="avery-orb" style={{ width: size, height: size, ...style }}>
      <div className="avery-orb__glow" style={{ animation: state==='thinking' ? 'avery-think 1.1s ease-in-out infinite' : 'none' }} />
      {(state === 'thinking' || state === 'listening') && (
        <React.Fragment>
          <div className="avery-orb__ring" style={{ animation: 'avery-ring 1.8s ease-out infinite' }} />
          <div className="avery-orb__ring" style={{ animation: 'avery-ring 1.8s ease-out infinite', animationDelay: '.9s' }} />
        </React.Fragment>
      )}
      {core}
    </div>
  );
}

Object.assign(window, { AveryOrb });
