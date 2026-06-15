'use client';

import { useEffect } from 'react';

export type AveryOrbState = 'idle' | 'thinking' | 'speaking' | 'listening';

interface AveryOrbProps {
  size?: number;
  state?: AveryOrbState;
  style?: React.CSSProperties;
}

const AVERY_ORB_KEYFRAMES = `
@keyframes avery-breathe { 0%,100%{ transform: scale(1); } 50%{ transform: scale(1.05);} }
@keyframes avery-breathe-think { 0%,100%{ transform: scale(1);} 50%{ transform: scale(1.12);} }
@keyframes avery-spin { to { transform: rotate(360deg); } }
@keyframes avery-spin-rev { to { transform: rotate(-360deg); } }
@keyframes avery-ring { 0%{ transform: scale(.7); opacity:.55;} 100%{ transform: scale(1.7); opacity:0;} }
@keyframes avery-think-glow { 0%,100%{ transform: scale(1);} 50%{ transform: scale(1.12);} }
@media (prefers-reduced-motion: reduce) {
  .avery-orb__core,
  .avery-orb__shimmer,
  .avery-orb__shimmer2,
  .avery-orb__glow,
  .avery-orb__ring {
    animation: none !important;
  }
}
`;

export function AveryOrb({ size = 96, state = 'idle', style }: AveryOrbProps) {
  useEffect(() => {
    const id = 'avery-orb-styles';
    if (document.getElementById(id)) return;
    const el = document.createElement('style');
    el.id = id;
    el.textContent = AVERY_ORB_KEYFRAMES;
    document.head.appendChild(el);
  }, []);

  const breatheDur =
    state === 'thinking' ? '1.1s' : state === 'speaking' ? '1.6s' : '4s';

  const breatheKeyframe =
    state === 'thinking' ? 'avery-breathe-think' : 'avery-breathe';

  const showRings = state === 'thinking' || state === 'listening';

  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-grid',
        placeItems: 'center',
        flexShrink: 0,
        width: size,
        height: size,
        ...style,
      }}
    >
      {/* Glow halo behind the orb */}
      <div
        style={{
          position: 'absolute',
          inset: '-30%',
          borderRadius: '50%',
          filter: 'blur(14px)',
          background:
            'radial-gradient(circle at 50% 50%, var(--accent-glow), transparent 70%)',
          zIndex: 0,
          animation:
            state === 'thinking'
              ? `avery-think-glow ${breatheDur} ease-in-out infinite`
              : 'none',
        }}
      />

      {/* Pulsing rings for thinking / listening */}
      {showRings && (
        <>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: '1.5px solid var(--accent)',
              animation: 'avery-ring 1.8s ease-out infinite',
              zIndex: 1,
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: '1.5px solid var(--accent)',
              animation: 'avery-ring 1.8s ease-out infinite',
              animationDelay: '0.9s',
              zIndex: 1,
            }}
          />
        </>
      )}

      {/* Core orb */}
      <div
        style={{
          position: 'relative',
          borderRadius: '50%',
          overflow: 'hidden',
          width: size,
          height: size,
          background:
            'radial-gradient(circle at 35% 30%, #BFFBE9 0%, var(--accent) 34%, var(--accent-2) 62%, #064236 100%)',
          boxShadow: 'inset 0 0 18px rgba(255,255,255,0.25)',
          animation: `${breatheKeyframe} ${breatheDur} ease-in-out infinite`,
          zIndex: 2,
        }}
      >
        {/* Shimmer layer 1 — forward spin */}
        <div
          style={{
            position: 'absolute',
            inset: '-20%',
            borderRadius: '50%',
            background:
              'conic-gradient(from 0deg, transparent, rgba(255,255,255,.55), transparent 35%, var(--accent), transparent 70%, rgba(255,255,255,.4), transparent)',
            mixBlendMode: 'screen',
            animation: 'avery-spin 6s linear infinite',
          }}
        />
        {/* Shimmer layer 2 — reverse spin */}
        <div
          style={{
            position: 'absolute',
            inset: '5%',
            borderRadius: '50%',
            background:
              'conic-gradient(from 180deg, transparent, var(--accent-deep), transparent 40%, rgba(255,255,255,.3), transparent 75%)',
            mixBlendMode: 'screen',
            animation: 'avery-spin-rev 9s linear infinite',
            opacity: 0.8,
          }}
        />
        {/* Specular highlight */}
        <div
          style={{
            position: 'absolute',
            width: '34%',
            height: '30%',
            left: '22%',
            top: '16%',
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(255,255,255,.95), transparent 70%)',
            filter: 'blur(2px)',
          }}
        />
      </div>
    </div>
  );
}
