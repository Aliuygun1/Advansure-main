'use client';

import { AveryOrb } from './avery-orb';

// ── AveryMessage ──────────────────────────────────────────────

interface AveryMessageProps {
  children: React.ReactNode;
  /** Set to false to skip the entrance animation */
  animate?: boolean;
}

export function AveryMessage({ children, animate = true }: AveryMessageProps) {
  return (
    <div
      className={animate ? 'rise' : undefined}
      style={{
        display: 'flex',
        gap: 11,
        alignItems: 'flex-end',
        maxWidth: '92%',
      }}
    >
      <AveryOrb size={32} style={{ marginBottom: 2, flexShrink: 0 }} />
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '6px 20px 20px 20px',
          padding: '13px 16px',
          fontSize: 15.5,
          lineHeight: 1.5,
          color: 'var(--text)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ── UserMessage ───────────────────────────────────────────────

interface UserMessageProps {
  children: React.ReactNode;
}

export function UserMessage({ children }: UserMessageProps) {
  return (
    <div
      className="rise"
      style={{ display: 'flex', justifyContent: 'flex-end' }}
    >
      <div
        style={{
          background: 'var(--accent)',
          color: 'var(--accent-ink)',
          fontWeight: 500,
          borderRadius: '20px 6px 20px 20px',
          padding: '13px 16px',
          fontSize: 15.5,
          lineHeight: 1.5,
          maxWidth: '82%',
          boxShadow: '0 6px 18px -8px var(--accent-glow)',
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ── TypingBubble ──────────────────────────────────────────────

const TYPING_KEYFRAMES = `
@keyframes adv-typing {
  0%, 60%, 100% { transform: translateY(0); opacity: .4; }
  30%            { transform: translateY(-4px); opacity: 1; }
}
.adv-typing-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--text-muted); display: inline-block;
  animation: adv-typing 1.3s ease-in-out infinite;
}
@media (prefers-reduced-motion: reduce) {
  .adv-typing-dot { animation: none !important; }
}
`;

let typingStyleInjected = false;

function injectTypingStyles() {
  if (typingStyleInjected) return;
  if (typeof document === 'undefined') return;
  const id = 'adv-typing-styles';
  if (document.getElementById(id)) { typingStyleInjected = true; return; }
  const el = document.createElement('style');
  el.id = id;
  el.textContent = TYPING_KEYFRAMES;
  document.head.appendChild(el);
  typingStyleInjected = true;
}

export function TypingBubble() {
  // Inject styles on first render (client-only component)
  if (typeof window !== 'undefined') injectTypingStyles();

  return (
    <div
      className="rise"
      style={{ display: 'flex', gap: 11, alignItems: 'flex-end' }}
    >
      <AveryOrb size={32} state="thinking" style={{ flexShrink: 0 }} />
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '6px 20px 20px 20px',
          padding: '15px 18px',
          display: 'flex',
          gap: 5,
        }}
      >
        <span className="adv-typing-dot" />
        <span className="adv-typing-dot" style={{ animationDelay: '.18s' }} />
        <span className="adv-typing-dot" style={{ animationDelay: '.36s' }} />
      </div>
    </div>
  );
}
