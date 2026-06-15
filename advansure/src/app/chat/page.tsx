'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

import { TopBar } from '@/components/top-bar';
import { AveryMessage, UserMessage, TypingBubble } from '@/components/chat-bubble';
import { Icon } from '@/components/icons';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type MessageRole = 'avery' | 'user';

interface ChatMessage {
  id: string;
  role: MessageRole;
  text: string;
  /** Present on avery messages when a damage type has been recognized */
  cta?: 'walk';
  damageType?: string;
  cause?: string;
}

interface ApiIntent {
  damage_type?: string;
  cause?: string;
  confidence: number;
}

interface ApiResponse {
  message: string;
  intent: ApiIntent | null;
  conversationId: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SESSION_MESSAGES_KEY = 'adv-chat-messages';
const SESSION_CONV_KEY = 'adv-chat-conv-id';
const SESSION_PERSONA_KEY = 'adv-persona';
const SESSION_DAMAGE_KEY = 'adv-damage';

const INITIAL_MESSAGE: ChatMessage = {
  id: 'avery-init',
  role: 'avery',
  text: 'Hi, ich bin Avery. Erzähl mir einfach in deinen eigenen Worten, was passiert ist – ganz ohne Formular.',
};

const CHAT_SUGGESTIONS = [
  'Wasserschaden durch die Waschmaschine in der Küche',
  'Kerze umgefallen, Sofa angekohlt',
  'Mein Auto wurde zerkratzt',
];

// Damage type label map for the CTA message
const DAMAGE_LABELS: Record<string, string> = {
  wasser: 'Wasserschaden',
  feuer: 'Brandschaden',
  einbruch: 'Einbruchsschaden',
  sturm: 'Sturmschaden',
};

// ---------------------------------------------------------------------------
// Client-side fallback damage recognition (used if API is unavailable)
// ---------------------------------------------------------------------------

type FallbackResult =
  | { intent: 'ok'; type: string; cause: string }
  | { intent: 'notcovered' }
  | { intent: 'vague' };

function recognizeDamageLocally(text: string): FallbackResult {
  const t = text.toLowerCase();

  if (/(auto|kfz|fahrzeug|wagen|pkw|motorrad)/.test(t)) {
    return { intent: 'notcovered' };
  }
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
  if (/(einbruch|gestohlen|dieb|aufgebrochen|aufgehebelt)/.test(t)) {
    return { intent: 'ok', type: 'einbruch', cause: 'Einbruch' };
  }
  if (/(sturm|hagel|orkan|unwetter)/.test(t)) {
    return { intent: 'ok', type: 'sturm', cause: 'Unwetter' };
  }
  if (t.trim().length < 14 || /(was passiert|irgendwas|keine ahnung|hilfe|schaden$)/.test(t.trim())) {
    return { intent: 'vague' };
  }
  return { intent: 'vague' };
}

// ---------------------------------------------------------------------------
// Unique ID helper
// ---------------------------------------------------------------------------

function uid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// ---------------------------------------------------------------------------
// Formatted text — renders **bold** markers
// ---------------------------------------------------------------------------

function FormattedText({ text }: { text: string }) {
  const parts = String(text).split(/(\*\*[^*]+\*\*)/g);
  return (
    <span>
      {parts.map((part, i) =>
        part.startsWith('**') && part.endsWith('**') ? (
          <strong
            key={i}
            style={{ fontWeight: 700, color: 'var(--accent-deep)' }}
          >
            {part.slice(2, -2)}
          </strong>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function ChatPage() {
  const router = useRouter();

  // Restore messages from sessionStorage on mount; fall back to initial greeting
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (typeof window === 'undefined') return [INITIAL_MESSAGE];
    try {
      const stored = sessionStorage.getItem(SESSION_MESSAGES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as ChatMessage[];
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return [INITIAL_MESSAGE];
  });

  const [conversationId, setConversationId] = useState<string | undefined>(
    () => {
      if (typeof window === 'undefined') return undefined;
      return sessionStorage.getItem(SESSION_CONV_KEY) ?? undefined;
    }
  );

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSugg, setShowSugg] = useState(() => {
    // Show suggestions only when we only have the initial greeting
    if (typeof window === 'undefined') return true;
    try {
      const stored = sessionStorage.getItem(SESSION_MESSAGES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as ChatMessage[];
        return !Array.isArray(parsed) || parsed.length <= 1;
      }
    } catch {
      // ignore
    }
    return true;
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get personaId from sessionStorage
  const personaId =
    typeof window !== 'undefined'
      ? (sessionStorage.getItem(SESSION_PERSONA_KEY) ?? 'leon')
      : 'leon';

  // Persist messages to sessionStorage whenever they change
  useEffect(() => {
    try {
      sessionStorage.setItem(SESSION_MESSAGES_KEY, JSON.stringify(messages));
    } catch {
      // ignore quota errors
    }
  }, [messages]);

  // Persist conversationId
  useEffect(() => {
    if (conversationId) {
      try {
        sessionStorage.setItem(SESSION_CONV_KEY, conversationId);
      } catch {
        // ignore
      }
    }
  }, [conversationId]);

  // Scroll to bottom whenever messages or loading state changes
  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, loading]);

  // ---------------------------------------------------------------------------
  // Build a CTA-carrying avery message from an API intent
  // ---------------------------------------------------------------------------

  function buildAveryMessageFromIntent(
    apiMessage: string,
    intent: ApiIntent | null
  ): ChatMessage {
    const base: ChatMessage = {
      id: uid(),
      role: 'avery',
      text: apiMessage,
    };

    if (intent && intent.damage_type && intent.confidence >= 0.6) {
      return {
        ...base,
        cta: 'walk',
        damageType: intent.damage_type,
        cause: intent.cause,
      };
    }
    return base;
  }

  // ---------------------------------------------------------------------------
  // Client-side fallback: build avery message without API
  // ---------------------------------------------------------------------------

  function buildFallbackAveryMessage(userText: string): ChatMessage {
    const r = recognizeDamageLocally(userText);

    if (r.intent === 'notcovered') {
      return {
        id: uid(),
        role: 'avery',
        text: 'Das klingt nach einem KFZ-Schaden – den kann ich über die Hausratversicherung leider nicht aufnehmen. Dafür ist deine Kfz-Versicherung zuständig. Ist in deiner Wohnung sonst noch etwas betroffen?',
      };
    }

    if (r.intent === 'vague') {
      return {
        id: uid(),
        role: 'avery',
        text: 'Magst du das etwas genauer beschreiben? Zum Beispiel: Was ist passiert und in welchem Raum? Dann weiß ich, wie ich dir am besten helfen kann.',
      };
    }

    // r.intent === 'ok'
    const label = DAMAGE_LABELS[r.type] ?? r.type;
    return {
      id: uid(),
      role: 'avery',
      text: `Oh, das tut mir leid! Ich hab das als **${label}** eingetragen, Ursache: ${r.cause}. Am besten zeigst du mir den Schaden direkt per Video – ich erkenne dann automatisch die betroffenen Räume.`,
      cta: 'walk',
      damageType: r.type,
      cause: r.cause,
    };
  }

  // ---------------------------------------------------------------------------
  // Navigate to walk — store damage in sessionStorage first
  // ---------------------------------------------------------------------------

  const startWalk = useCallback(
    (damageType: string | undefined, cause: string | undefined) => {
      try {
        sessionStorage.setItem(
          SESSION_DAMAGE_KEY,
          JSON.stringify({ type: damageType ?? '', cause: cause ?? '' })
        );
      } catch {
        // ignore
      }
      router.push('/walk');
    },
    [router]
  );

  // ---------------------------------------------------------------------------
  // Send message
  // ---------------------------------------------------------------------------

  const send = useCallback(
    async (rawText?: string) => {
      const text = (rawText ?? input).trim();
      if (!text || loading) return;

      setShowSugg(false);
      setInput('');

      // Append user message immediately
      const userMsg: ChatMessage = { id: uid(), role: 'user', text };
      setMessages((prev) => [...prev, userMsg]);

      setLoading(true);

      try {
        const res = await fetch('/api/avery/message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            personaId,
            message: text,
            conversationId,
          }),
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data: ApiResponse = await res.json();

        if (data.conversationId) {
          setConversationId(data.conversationId);
        }

        let averyMsg = buildAveryMessageFromIntent(data.message, data.intent);
        // If Gemini didn't produce a confident intent, try local keyword matching
        // so the demo CTA always shows up even without a working API key
        if (!averyMsg.cta) {
          const local = recognizeDamageLocally(text);
          if (local.intent === 'ok') {
            averyMsg = { ...averyMsg, cta: 'walk', damageType: local.type, cause: local.cause };
          }
        }
        setMessages((prev) => [...prev, averyMsg]);
      } catch {
        // API unavailable — use client-side fallback
        const fallback = buildFallbackAveryMessage(text);
        setMessages((prev) => [...prev, fallback]);
      } finally {
        setLoading(false);
        // Re-focus input after response
        inputRef.current?.focus();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [input, loading, personaId, conversationId]
  );

  // ---------------------------------------------------------------------------
  // Avery status dot (green = online)
  // ---------------------------------------------------------------------------

  const statusDot = (
    <span
      aria-label="Online"
      style={{
        width: 9,
        height: 9,
        borderRadius: '50%',
        background: 'var(--grade-leicht)',
        display: 'inline-block',
      }}
    />
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="adv-screen">
      {/* Top bar */}
      <TopBar
        title="Avery"
        onBack={() => router.push('/start')}
        trailing={statusDot}
      />

      {/* Message list */}
      <div
        ref={scrollRef}
        className="adv-scroll"
        style={{
          flex: 1,
          padding: '12px 18px',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          // Extra bottom padding so input bar doesn't overlap last message
          paddingBottom: 100,
        }}
      >
        {messages.map((msg) =>
          msg.role === 'avery' ? (
            <AveryMessage key={msg.id}>
              <FormattedText text={msg.text} />
              {msg.cta === 'walk' && (
                <button
                  className="btn btn-primary"
                  style={{ marginTop: 13, height: 50, width: '100%' }}
                  onClick={() => startWalk(msg.damageType, msg.cause)}
                >
                  <Icon name="video" size={20} color="var(--accent-ink)" />
                  Foto-Walk starten
                </button>
              )}
            </AveryMessage>
          ) : (
            <UserMessage key={msg.id}>{msg.text}</UserMessage>
          )
        )}

        {/* Typing indicator while API is in flight */}
        {loading && <TypingBubble />}

        {/* Suggestions — only shown before first user message */}
        {showSugg && !loading && (
          <div
            className="fade"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              marginTop: 4,
              alignItems: 'flex-start',
            }}
          >
            <span
              style={{
                fontSize: 12,
                color: 'var(--text-faint)',
                paddingLeft: 4,
              }}
            >
              Beispiele zum Antippen
            </span>
            {CHAT_SUGGESTIONS.map((s) => (
              <button
                key={s}
                className="chip"
                style={{ textAlign: 'left' }}
                onClick={() => send(s)}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Input bar — fixed at bottom */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: 430,
          padding: '10px 16px 24px',
          borderTop: '1px solid var(--border)',
          background: 'var(--screen)',
          // Safe area inset for iOS home indicator
          paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
          zIndex: 40,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 9,
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
            borderRadius: 26,
            padding: '6px 6px 6px 18px',
          }}
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                void send();
              }
            }}
            placeholder="Schaden beschreiben…"
            disabled={loading}
            aria-label="Schadensbeschreibung eingeben"
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              outline: 'none',
              fontFamily: 'inherit',
              fontSize: 15.5,
              color: 'var(--text)',
              opacity: loading ? 0.6 : 1,
            }}
          />
          <button
            onClick={() => void send()}
            disabled={!input.trim() || loading}
            aria-label="Senden"
            style={{
              width: 42,
              height: 42,
              borderRadius: '50%',
              border: 'none',
              flexShrink: 0,
              background:
                input.trim() && !loading
                  ? 'var(--accent)'
                  : 'var(--surface-3)',
              color:
                input.trim() && !loading
                  ? 'var(--accent-ink)'
                  : 'var(--text-faint)',
              display: 'grid',
              placeItems: 'center',
              cursor: input.trim() && !loading ? 'pointer' : 'default',
              transition: 'background 0.2s, color 0.2s',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <Icon name="arrowUp" size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
