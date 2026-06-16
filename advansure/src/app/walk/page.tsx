'use client';

// FA-03–06: Foto-Walk Screen
// State machine: permission → viewfinder → recording → uploading → analyzing → result → (next room / done)

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AveryOrb } from '@/components/avery-orb';
import { GradeBadge } from '@/components/grade-badge';
import { TopBar } from '@/components/top-bar';
import { Icon } from '@/components/icons';
import type { DamageGrade } from '@/components/grade-badge';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type WalkPhase =
  | 'permission'
  | 'camera-denied'
  | 'viewfinder'
  | 'recording'
  | 'uploading'
  | 'analyzing'
  | 'result'
  | 'too-short';

interface DamageContext {
  type: string;
  cause: string;
}

interface RoomResult {
  id: string;
  room_type: string;
  damage_grade: DamageGrade;
  damage_kind: string;
  area_m2: number;
  rate_per_m2: number;
  amount: number;
  video_url: string | null;
  satisfied: boolean;
  ai_reasoning: string | null;
  created_at: Date | null;
  walk_id: string;
}

interface AnalyzeApiResponse {
  room: RoomResult;
  satisfied: boolean;
  nextRequest: string | null;
  userMessage: string;
}

// ---------------------------------------------------------------------------
// Inject walk-specific CSS keyframes once
// ---------------------------------------------------------------------------

const WALK_CSS = `
@keyframes walk-scan {
  0%   { top: 8%;  opacity: 0   }
  12%  { opacity: .9 }
  88%  { opacity: .9 }
  100% { top: 92%; opacity: 0   }
}
@keyframes walk-recdot {
  0%, 100% { opacity: 1   }
  50%       { opacity: .25 }
}
@keyframes walk-grain {
  0%   { transform: translate(0, 0)    }
  100% { transform: translate(-6%, 4%) }
}
@keyframes walk-slide-up {
  from { transform: translateY(32px); }
  to   { transform: translateY(0);    }
}
@media (prefers-reduced-motion: reduce) {
  .walk-scan-line, .walk-rec-dot { animation: none !important; }
}
`;

function useInjectWalkStyles() {
  useEffect(() => {
    const id = 'walk-screen-styles';
    if (document.getElementById(id)) return;
    const el = document.createElement('style');
    el.id = id;
    el.textContent = WALK_CSS;
    document.head.appendChild(el);
  }, []);
}

// ---------------------------------------------------------------------------
// Simulated Viewfinder Component (PoC — no live stream render needed)
// ---------------------------------------------------------------------------

interface ViewfinderProps {
  recording: boolean;
  timer: string;
  videoRef?: React.RefObject<HTMLVideoElement>;
}

function Viewfinder({ recording, timer, videoRef }: ViewfinderProps) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        background:
          'radial-gradient(120% 80% at 50% 35%, #20303a 0%, #131c24 45%, #0a0f14 100%)',
      }}
    >
      {/* Real camera feed */}
      {videoRef && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      )}

      {/* Faux room shapes — only shown when no live stream */}
      {!videoRef && (
        <>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              opacity: 0.5,
              background:
                'linear-gradient(105deg, transparent 38%, rgba(255,255,255,.05) 39%, transparent 41%), linear-gradient(255deg, transparent 60%, rgba(0,0,0,.4) 90%)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: '-10%',
              bottom: '-5%',
              width: '60%',
              height: '45%',
              background: 'linear-gradient(180deg, rgba(255,255,255,.04), rgba(0,0,0,.25))',
              transform: 'skewX(-12deg)',
              borderRadius: 8,
            }}
          />
          <div
            style={{
              position: 'absolute',
              right: '6%',
              top: '20%',
              width: '34%',
              height: '40%',
              border: '1px solid rgba(255,255,255,.08)',
              borderRadius: 6,
              background: 'rgba(255,255,255,.02)',
            }}
          />
          {/* Film grain */}
          <div
            style={{
              position: 'absolute',
              inset: '-10%',
              opacity: 0.05,
              animation: 'walk-grain 1.2s steps(2) infinite alternate',
              backgroundImage: 'radial-gradient(rgba(255,255,255,.7) .5px, transparent .5px)',
              backgroundSize: '4px 4px',
            }}
          />
        </>
      )}

      {/* Rule-of-thirds grid */}
      <div style={{ position: 'absolute', inset: 0, opacity: recording ? 0.35 : 0.18 }}>
        {[33.3, 66.6].map((p) => (
          <div
            key={'v' + p}
            style={{
              position: 'absolute',
              left: p + '%',
              top: 0,
              bottom: 0,
              width: 1,
              background: 'rgba(255,255,255,.4)',
            }}
          />
        ))}
        {[33.3, 66.6].map((p) => (
          <div
            key={'h' + p}
            style={{
              position: 'absolute',
              top: p + '%',
              left: 0,
              right: 0,
              height: 1,
              background: 'rgba(255,255,255,.4)',
            }}
          />
        ))}
      </div>

      {/* Scanning line while recording */}
      {recording && (
        <div
          className="walk-scan-line"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            height: 2,
            top: '8%',
            background: 'linear-gradient(90deg, transparent, var(--accent), transparent)',
            boxShadow: '0 0 16px var(--accent-glow)',
            animation: 'walk-scan 2.4s ease-in-out infinite',
          }}
        />
      )}

      {/* Focus reticle */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '46%',
          transform: 'translate(-50%, -50%)',
          width: 86,
          height: 86,
          border: '1.5px solid rgba(255,255,255,.7)',
          borderRadius: 12,
          opacity: recording ? 0.9 : 0.5,
        }}
      />

      {/* Corner brackets */}
      {(
        [
          ['t', 'l'],
          ['t', 'r'],
          ['b', 'l'],
          ['b', 'r'],
        ] as [string, string][]
      ).map(([v, h]) => (
        <div
          key={v + h}
          style={{
            position: 'absolute',
            width: 26,
            height: 26,
            ...(v === 't' ? { top: 22 } : { bottom: 22 }),
            ...(h === 'l' ? { left: 22 } : { right: 22 }),
            borderTop: v === 't' ? '2px solid rgba(255,255,255,.8)' : 'none',
            borderBottom: v === 'b' ? '2px solid rgba(255,255,255,.8)' : 'none',
            borderLeft: h === 'l' ? '2px solid rgba(255,255,255,.8)' : 'none',
            borderRight: h === 'r' ? '2px solid rgba(255,255,255,.8)' : 'none',
            borderRadius: 4,
          }}
        />
      ))}

      {/* Status bar */}
      <div
        style={{
          position: 'absolute',
          top: 18,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          gap: 10,
        }}
      >
        {recording ? (
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              background: 'rgba(0,0,0,.5)',
              backdropFilter: 'blur(8px)',
              padding: '6px 13px',
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 600,
              color: '#fff',
            }}
          >
            <span
              className="walk-rec-dot"
              style={{
                width: 9,
                height: 9,
                borderRadius: '50%',
                background: '#FF453A',
                animation: 'walk-recdot 1s infinite',
              }}
            />
            <span className="mono">{timer}</span>
          </span>
        ) : (
          <span
            style={{
              background: 'rgba(0,0,0,.45)',
              backdropFilter: 'blur(8px)',
              padding: '6px 13px',
              borderRadius: 999,
              fontSize: 12.5,
              fontWeight: 600,
              color: 'rgba(255,255,255,.85)',
            }}
          >
            Live-Kamera · Demo
          </span>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Cancel Dialog
// ---------------------------------------------------------------------------

interface CancelDialogProps {
  onConfirm: () => void;
  onDismiss: () => void;
}

function CancelDialog({ onConfirm, onDismiss }: CancelDialogProps) {
  return (
    <div
      className="fade"
      style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(0,0,0,.55)',
        display: 'grid',
        placeItems: 'center',
        zIndex: 60,
        padding: '0 28px',
      }}
    >
      <div
        style={{
          background: 'var(--surface)',
          borderRadius: 24,
          padding: '24px 22px',
          width: '100%',
          textAlign: 'center',
          boxShadow: 'var(--shadow-pop)',
        }}
      >
        <h3 style={{ margin: '0 0 8px', fontSize: 18.5, fontWeight: 700 }}>
          Foto-Walk wirklich abbrechen?
        </h3>
        <p
          style={{
            margin: '0 0 20px',
            fontSize: 14.5,
            color: 'var(--text-muted)',
            lineHeight: 1.5,
          }}
        >
          Bist du sicher, dass du abbrechen möchtest? Deine bisherigen Aufnahmen gehen verloren.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            className="btn btn-block"
            style={{ height: 52, background: 'var(--danger-soft)', color: 'var(--danger)' }}
            onClick={onConfirm}
          >
            Walk beenden
          </button>
          <button className="btn btn-ghost btn-block" style={{ height: 52 }} onClick={onDismiss}>
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Cancel Button (floating, on viewfinder screens)
// ---------------------------------------------------------------------------

const CANCEL_BTN_STYLE: React.CSSProperties = {
  position: 'absolute',
  top: 56,
  left: 18,
  width: 44,
  height: 44,
  borderRadius: '50%',
  background: 'rgba(0,0,0,.45)',
  backdropFilter: 'blur(8px)',
  border: 'none',
  cursor: 'pointer',
  display: 'grid',
  placeItems: 'center',
  zIndex: 30,
  WebkitTapHighlightColor: 'transparent',
};

// ---------------------------------------------------------------------------
// Helper: format seconds as MM:SS
// ---------------------------------------------------------------------------

function formatTimer(seconds: number): string {
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(Math.floor(seconds % 60)).padStart(2, '0');
  return `${mm}:${ss}`;
}

// ---------------------------------------------------------------------------
// Helper: create walk via DB API
// ---------------------------------------------------------------------------

async function createWalk(personaId: string): Promise<string> {
  const res = await fetch('/api/walk/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ personaId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? 'Walk konnte nicht erstellt werden');
  }
  const data = (await res.json()) as { walkId: string };
  return data.walkId;
}

// ---------------------------------------------------------------------------
// Main WalkPage Component
// ---------------------------------------------------------------------------

export default function WalkPage() {
  useInjectWalkStyles();
  const router = useRouter();

  // Session data (read from sessionStorage on mount)
  const [personaId, setPersonaId] = useState<string>('leon');
  const [damageContext, setDamageContext] = useState<DamageContext>({
    type: 'wasser',
    cause: 'unbekannte Ursache',
  });
  const [walkId, setWalkId] = useState<string | null>(null);

  // UI state
  const [phase, setPhase] = useState<WalkPhase>('permission');
  const [iteration, setIteration] = useState(1);
  const [completedRooms, setCompletedRooms] = useState<RoomResult[]>([]);
  const [currentResult, setCurrentResult] = useState<AnalyzeApiResponse | null>(null);
  const [instruction, setInstruction] = useState(
    'Filme zuerst den Raum mit dem größten Schaden von allen Seiten (mind. 2 Sek.).',
  );
  const [timer, setTimer] = useState('00:00');
  const [elapsedSec, setElapsedSec] = useState(0);
  const [showCancel, setShowCancel] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Refs
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recStartRef = useRef(0);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ---------------------------------------------------------------------------
  // Bootstrap: read sessionStorage
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const storedPersona = sessionStorage.getItem('adv-persona') ?? 'leon';
    const storedDamage = sessionStorage.getItem('adv-damage');
    const storedWalkId = sessionStorage.getItem('adv-walk-id');

    setPersonaId(storedPersona);

    if (storedDamage) {
      try {
        const d = JSON.parse(storedDamage) as DamageContext;
        setDamageContext(d);
      } catch {
        // keep defaults
      }
    }

    if (storedWalkId) {
      setWalkId(storedWalkId);
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Cleanup on unmount
  // ---------------------------------------------------------------------------
  useEffect(() => {
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // Connect camera stream to the <video> element whenever the viewfinder is active
  useEffect(() => {
    if (
      (phase === 'viewfinder' || phase === 'recording' || phase === 'too-short') &&
      videoRef.current &&
      mediaStreamRef.current
    ) {
      videoRef.current.srcObject = mediaStreamRef.current;
    }
  }, [phase]);

  // ---------------------------------------------------------------------------
  // Camera permission + stream
  // ---------------------------------------------------------------------------
  const requestCamera = useCallback(async () => {
    try {
      // Check MediaRecorder support
      if (typeof MediaRecorder === 'undefined') {
        setPhase('camera-denied');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 } },
        audio: false,
      });
      mediaStreamRef.current = stream;
      setPhase('viewfinder');
    } catch {
      setPhase('camera-denied');
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Recording logic
  // ---------------------------------------------------------------------------
  function startRecording() {
    if (!mediaStreamRef.current) return;

    chunksRef.current = [];

    // Determine supported mimeType
    const mimeTypes = [
      'video/webm;codecs=vp8,opus',
      'video/webm;codecs=vp8',
      'video/webm',
      '',
    ];
    const mimeType = mimeTypes.find((m) => {
      if (!m) return true;
      try {
        return MediaRecorder.isTypeSupported(m);
      } catch {
        return false;
      }
    }) ?? '';

    const options: MediaRecorderOptions = mimeType ? { mimeType } : {};

    let recorder: MediaRecorder;
    try {
      recorder = new MediaRecorder(mediaStreamRef.current, options);
    } catch {
      // MediaRecorder not supported
      setPhase('camera-denied');
      return;
    }

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };

    recorder.start(200); // collect chunks every 200ms
    mediaRecorderRef.current = recorder;

    recStartRef.current = Date.now();
    setElapsedSec(0);
    setTimer('00:00');
    setPhase('recording');

    tickRef.current = setInterval(() => {
      const sec = (Date.now() - recStartRef.current) / 1000;
      setElapsedSec(sec);
      setTimer(formatTimer(sec));
    }, 200);
  }

  function stopRecording() {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }

    const durationSec = (Date.now() - recStartRef.current) / 1000;

    if (durationSec < 2) {
      // Too short: reset but keep recorder state so user can try again
      setTimer('00:00');
      setElapsedSec(0);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      mediaRecorderRef.current = null;
      chunksRef.current = [];
      setPhase('too-short');
      return;
    }

    // Stop recorder and wait for final chunk via onstop
    const recorder = mediaRecorderRef.current;
    if (!recorder) return;

    recorder.onstop = () => {
      const mimeType =
        recorder.mimeType || 'video/webm';
      const blob = new Blob(chunksRef.current, { type: mimeType });
      handleVideoReady(blob);
    };

    if (recorder.state !== 'inactive') {
      recorder.stop();
    }
  }

  // ---------------------------------------------------------------------------
  // Upload + Analyze
  // ---------------------------------------------------------------------------
  async function handleVideoReady(blob: Blob) {
    setPhase('uploading');
    setErrorMessage(null);

    // Ensure walkId exists
    let currentWalkId = walkId;
    if (!currentWalkId) {
      try {
        currentWalkId = await createWalk(personaId);
        setWalkId(currentWalkId);
        sessionStorage.setItem('adv-walk-id', currentWalkId);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Walk-Erstellung fehlgeschlagen';
        setErrorMessage(msg);
        setPhase('viewfinder');
        return;
      }
    }

    // Upload video
    let videoUrl: string;
    try {
      const formData = new FormData();
      formData.append('walkId', currentWalkId);
      formData.append('iteration', String(iteration));
      formData.append('video', blob, `${iteration}.webm`);

      const uploadRes = await fetch('/api/walk/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) {
        const err = await uploadRes.json().catch(() => ({}));
        const errData = err as { error?: string; message?: string };
        const isToShort = uploadRes.status === 422;
        if (isToShort) {
          setPhase('too-short');
          return;
        }
        throw new Error(errData.error ?? errData.message ?? 'Upload fehlgeschlagen');
      }

      const uploadData = (await uploadRes.json()) as { url: string };
      videoUrl = uploadData.url;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upload fehlgeschlagen';
      setErrorMessage(msg);
      setPhase('viewfinder');
      return;
    }

    // Analyze
    setPhase('analyzing');
    try {
      const analyzeRes = await fetch('/api/walk/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walkId: currentWalkId,
          videoUrl,
          iteration,
          damageContext,
        }),
      });

      if (!analyzeRes.ok) {
        const err = await analyzeRes.json().catch(() => ({}));
        const errData = err as { error?: string };
        throw new Error(errData.error ?? 'Analyse fehlgeschlagen');
      }

      const analyzeData = (await analyzeRes.json()) as AnalyzeApiResponse;
      setCurrentResult(analyzeData);
      setPhase('result');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Analyse fehlgeschlagen';
      setErrorMessage(msg);
      setPhase('viewfinder');
    }
  }

  // ---------------------------------------------------------------------------
  // Result actions
  // ---------------------------------------------------------------------------
  function handleRecordAgain() {
    if (!currentResult) return;
    setIteration((i) => i + 1);
    setInstruction(
      currentResult.nextRequest ?? 'Bitte nimm den Raum noch einmal auf.',
    );
    setCurrentResult(null);
    setTimer('00:00');
    setElapsedSec(0);
    setPhase('viewfinder');
  }

  function handleAddMoreRoom() {
    if (!currentResult) return;
    // Save completed room
    setCompletedRooms((prev) => [...prev, currentResult.room]);
    setCurrentResult(null);
    setIteration(1);
    setInstruction(
      'Super. Gibt es noch einen weiteren betroffenen Raum? Dann filme jetzt den nächsten.',
    );
    setTimer('00:00');
    setElapsedSec(0);
    setPhase('viewfinder');
  }

  function handleFinish() {
    if (!currentResult) return;
    // Save final room + persist to sessionStorage for review
    const allRooms = [...completedRooms, currentResult.room];
    sessionStorage.setItem('adv-rooms', JSON.stringify(allRooms));
    if (walkId) {
      sessionStorage.setItem('adv-walk-id', walkId);
    }
    router.push('/review');
  }

  function handleCancelConfirm() {
    // Stop any active stream/recorder
    if (tickRef.current) clearInterval(tickRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
    }
    router.push('/start');
  }

  function handleGoTextFallback() {
    router.push('/review');
  }

  // ---------------------------------------------------------------------------
  // Upload an existing video file instead of a live recording.
  // Reuses the same upload + analyze pipeline via handleVideoReady.
  // ---------------------------------------------------------------------------
  function openFilePicker() {
    setErrorMessage(null);
    fileInputRef.current?.click();
  }

  function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    // Reset value so picking the same file again still fires onChange
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      setErrorMessage('Bitte wähle eine Videodatei aus.');
      return;
    }
    handleVideoReady(file);
  }

  /** Hidden file input — rendered inside each screen that offers an upload. */
  const fileInput = (
    <input
      ref={fileInputRef}
      type="file"
      accept="video/*"
      onChange={handleFileSelected}
      style={{ display: 'none' }}
    />
  );

  // ---------------------------------------------------------------------------
  // Derived values
  // ---------------------------------------------------------------------------
  const MAX_ITERATIONS = 3;
  const isAtMaxIterations = iteration >= MAX_ITERATIONS;
  const canStop = elapsedSec >= 2;

  // ---------------------------------------------------------------------------
  // Render: permission
  // ---------------------------------------------------------------------------
  if (phase === 'permission') {
    return (
      <div
        className="adv-screen"
        style={{ background: '#0a0f14', position: 'relative', overflow: 'hidden' }}
      >
        <Viewfinder recording={false} timer="00:00" />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.45)' }} />

        <div
          className="rise"
          style={{
            position: 'absolute',
            left: 24,
            right: 24,
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'var(--surface)',
            borderRadius: 24,
            padding: '24px 22px',
            textAlign: 'center',
            boxShadow: 'var(--shadow-pop)',
            zIndex: 10,
          }}
        >
          <span
            style={{
              width: 56,
              height: 56,
              borderRadius: 17,
              background: 'var(--accent-soft)',
              display: 'grid',
              placeItems: 'center',
              margin: '0 auto 14px',
            }}
          >
            <Icon name="camera" size={28} color="var(--accent-deep)" />
          </span>
          <h3 style={{ margin: '0 0 8px', fontSize: 19, fontWeight: 700 }}>
            Kamera-Zugriff erlauben?
          </h3>
          <p
            style={{
              margin: '0 0 20px',
              fontSize: 14.5,
              color: 'var(--text-muted)',
              lineHeight: 1.5,
            }}
          >
            Advansure braucht deine Kamera, damit Avery den Schaden per Video einschätzen kann.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button className="btn btn-primary btn-block" onClick={requestCamera}>
              <Icon name="camera" size={20} color="var(--accent-ink)" />
              Erlauben
            </button>
            <button
              className="btn btn-ghost btn-block"
              onClick={() => setPhase('camera-denied')}
            >
              Nicht erlauben
            </button>
            <button className="btn btn-ghost btn-block" onClick={openFilePicker}>
              <Icon name="arrowUp" size={19} />
              Video hochladen
            </button>
            {fileInput}
          </div>
        </div>

        <button
          aria-label="Abbrechen"
          onClick={() => setShowCancel(true)}
          style={CANCEL_BTN_STYLE}
        >
          <Icon name="close" size={20} color="#fff" />
        </button>
        {showCancel && (
          <CancelDialog
            onConfirm={handleCancelConfirm}
            onDismiss={() => setShowCancel(false)}
          />
        )}
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render: camera-denied
  // ---------------------------------------------------------------------------
  if (phase === 'camera-denied') {
    return (
      <div className="adv-screen">
        <TopBar title="Kamera nicht verfügbar" onBack={handleCancelConfirm} />
        <div
          className="adv-scroll"
          style={{ flex: 1, padding: '8px 22px 28px', display: 'flex', flexDirection: 'column' }}
        >
          <div
            className="rise"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              marginTop: 12,
              marginBottom: 26,
            }}
          >
            <span
              style={{
                width: 72,
                height: 72,
                borderRadius: 22,
                background: 'var(--danger-soft)',
                display: 'grid',
                placeItems: 'center',
                marginBottom: 18,
              }}
            >
              <Icon name="camera" size={34} color="var(--danger)" />
            </span>
            <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 8px' }}>
              Avery braucht deine Kamera
            </h2>
            <p
              style={{
                fontSize: 15,
                color: 'var(--text-muted)',
                margin: 0,
                lineHeight: 1.55,
                maxWidth: 290,
              }}
            >
              Kein Problem — du kannst den Zugriff erneut anfragen oder mir den Schaden einfach
              beschreiben. Beides funktioniert.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
            <button
              className="btn btn-primary btn-block"
              onClick={() => setPhase('permission')}
            >
              <Icon name="camera" size={20} color="var(--accent-ink)" />
              Neu anfragen
            </button>
            <button className="btn btn-ghost btn-block" onClick={openFilePicker}>
              <Icon name="arrowUp" size={19} />
              Video hochladen
            </button>
            <button className="btn btn-ghost btn-block" onClick={handleGoTextFallback}>
              <Icon name="edit" size={19} />
              Textbasiert beschreiben
            </button>
            {fileInput}
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render: uploading
  // ---------------------------------------------------------------------------
  if (phase === 'uploading') {
    return (
      <div
        className="adv-screen"
        style={{
          background: '#0a0f14',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          color: '#fff',
        }}
      >
        <AveryOrb size={92} state="thinking" />
        <p style={{ fontSize: 16.5, fontWeight: 600, margin: '8px 0 0', color: '#fff' }}>
          Video wird übertragen…
        </p>
        <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,.6)', margin: 0 }}>
          Bitte warte einen Moment
        </p>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render: analyzing
  // ---------------------------------------------------------------------------
  if (phase === 'analyzing') {
    return (
      <div
        className="adv-screen"
        style={{
          background: '#0a0f14',
          color: '#fff',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Viewfinder recording={false} timer="00:00" />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(6,10,14,.78)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 40px',
          }}
        >
          <AveryOrb size={92} state="thinking" />
          <p style={{ fontSize: 16.5, fontWeight: 600, margin: '24px 0 4px', color: '#fff' }}>
            Avery analysiert den Raum…
          </p>
          <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,.6)', margin: 0 }}>
            Räume &amp; Schadensgrad werden erkannt
          </p>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render: result
  // ---------------------------------------------------------------------------
  if (phase === 'result' && currentResult) {
    const { room, satisfied, nextRequest, userMessage } = currentResult;
    const showNextRoomOption = satisfied || isAtMaxIterations;
    const grade = room.damage_grade as DamageGrade;

    return (
      <div
        className="adv-screen"
        style={{ background: '#0a0f14', position: 'relative', overflow: 'hidden' }}
      >
        <Viewfinder recording={false} timer="00:00" />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(6,10,14,.2), rgba(6,10,14,.85))',
          }}
        />

        {/* Bottom sheet */}
        <div
          style={{
            position: 'absolute',
            left: 16,
            right: 16,
            bottom: 24,
            background: 'var(--surface)',
            borderRadius: 26,
            padding: '20px',
            boxShadow: 'var(--shadow-pop)',
            animation: 'walk-slide-up .35s cubic-bezier(0.22,1,0.36,1) both',
            zIndex: 10,
          }}
        >
          {/* Header row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <AveryOrb size={34} state="speaking" />
            <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>
              {showNextRoomOption ? 'Perfekt, das reicht mir.' : `Aufnahme ${iteration} analysiert`}
            </span>
            {showNextRoomOption && (
              <span style={{ marginLeft: 'auto' }}>
                <Icon name="checkCircle" size={24} color="var(--grade-leicht)" />
              </span>
            )}
          </div>

          {/* Max iteration notice */}
          {isAtMaxIterations && !satisfied && (
            <div
              style={{
                display: 'flex',
                gap: 8,
                alignItems: 'center',
                background: 'rgba(255,165,0,.1)',
                border: '1px solid rgba(255,165,0,.3)',
                borderRadius: 12,
                padding: '10px 14px',
                marginBottom: 12,
                fontSize: 13,
                color: '#E9A23B',
              }}
            >
              <Icon name="warning" size={16} color="#E9A23B" />
              <span>Maximale Anzahl an Aufnahmen erreicht.</span>
            </div>
          )}

          {/* Room card */}
          <div
            style={{
              background: 'var(--surface-2)',
              borderRadius: 18,
              padding: '15px 16px',
              marginBottom: showNextRoomOption ? 16 : 14,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <span style={{ fontSize: 17, fontWeight: 700 }}>{room.room_type}</span>
              <GradeBadge grade={grade} />
            </div>
            <p style={{ margin: '0 0 12px', fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.45 }}>
              {room.damage_kind}
            </p>
            <p style={{ margin: '0 0 10px', fontSize: 13.5, color: 'var(--text)', lineHeight: 1.45 }}>
              {userMessage}
            </p>
            {showNextRoomOption && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 13,
                  color: 'var(--text-faint)',
                }}
              >
                <Icon name="ruler" size={15} />
                {room.area_m2} m² × {room.rate_per_m2} €/m²
                <span
                  className="mono"
                  style={{ marginLeft: 'auto', fontWeight: 700, fontSize: 15, color: 'var(--text)' }}
                >
                  ≈ €{(room.amount).toLocaleString('de-DE')}
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          {!showNextRoomOption ? (
            <>
              {/* next_request from AI */}
              {nextRequest && (
                <div
                  style={{
                    display: 'flex',
                    gap: 9,
                    alignItems: 'flex-start',
                    marginBottom: 14,
                    padding: '0 2px',
                  }}
                >
                  <Icon name="sparkle" size={17} color="var(--accent-deep)" style={{ marginTop: 1 }} />
                  <span style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.45 }}>
                    {nextRequest}
                  </span>
                </div>
              )}
              <button className="btn btn-primary btn-block" onClick={handleRecordAgain}>
                <Icon name="video" size={19} color="var(--accent-ink)" />
                Nochmal aufnehmen
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button className="btn btn-primary btn-block" onClick={handleAddMoreRoom}>
                <Icon name="plus" size={19} color="var(--accent-ink)" />
                Weiteren Raum hinzufügen
              </button>
              <button className="btn btn-ghost btn-block" onClick={handleFinish}>
                <Icon name="check" size={19} />
                Fertig, Zusammenfassung erstellen
              </button>
            </div>
          )}
        </div>

        <button
          aria-label="Abbrechen"
          onClick={() => setShowCancel(true)}
          style={CANCEL_BTN_STYLE}
        >
          <Icon name="close" size={20} color="#fff" />
        </button>
        {showCancel && (
          <CancelDialog
            onConfirm={handleCancelConfirm}
            onDismiss={() => setShowCancel(false)}
          />
        )}
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render: viewfinder / recording / too-short (shared viewfinder layout)
  // ---------------------------------------------------------------------------
  const isRecording = phase === 'recording';
  const isTooShort = phase === 'too-short';

  return (
    <div
      className="adv-screen"
      style={{ background: '#0a0f14', position: 'relative', overflow: 'hidden' }}
    >
      <Viewfinder recording={isRecording} timer={timer} videoRef={videoRef} />

      {/* Completed rooms progress dots */}
      <div
        style={{
          position: 'absolute',
          top: 60,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          gap: 6,
          zIndex: 5,
        }}
      >
        {completedRooms.map((_, i) => (
          <span
            key={i}
            style={{ width: 22, height: 4, borderRadius: 4, background: 'var(--accent)' }}
          />
        ))}
        {/* current room dot */}
        <span
          style={{ width: 22, height: 4, borderRadius: 4, background: 'rgba(255,255,255,.3)' }}
        />
      </div>

      {/* Avery instruction bubble (shown in viewfinder state only) */}
      {!isRecording && !isTooShort && phase === 'viewfinder' && (
        <div
          className="rise"
          style={{
            position: 'absolute',
            left: 18,
            right: 18,
            top: 92,
            display: 'flex',
            gap: 11,
            alignItems: 'flex-start',
            background: 'rgba(0,0,0,.5)',
            backdropFilter: 'blur(10px)',
            padding: '13px 15px',
            borderRadius: 20,
            zIndex: 5,
          }}
        >
          <AveryOrb size={32} state="speaking" />
          <span style={{ fontSize: 14.5, color: '#fff', lineHeight: 1.45, paddingTop: 3 }}>
            {instruction}
          </span>
        </div>
      )}

      {/* Too-short warning */}
      {isTooShort && (
        <div
          className="rise"
          style={{
            position: 'absolute',
            left: 18,
            right: 18,
            top: 92,
            display: 'flex',
            gap: 11,
            alignItems: 'center',
            background: 'rgba(0,0,0,.6)',
            backdropFilter: 'blur(10px)',
            padding: '13px 15px',
            borderRadius: 20,
            zIndex: 5,
          }}
        >
          <Icon name="warning" size={22} color="#FFCC55" />
          <span style={{ fontSize: 14.5, color: '#fff', lineHeight: 1.4 }}>
            Das war zu kurz. Filme bitte mindestens 2–3 Sekunden.
          </span>
        </div>
      )}

      {/* Error message */}
      {errorMessage && !isRecording && (
        <div
          className="rise"
          style={{
            position: 'absolute',
            left: 18,
            right: 18,
            bottom: 140,
            display: 'flex',
            gap: 10,
            alignItems: 'center',
            background: 'rgba(255,90,99,.15)',
            border: '1px solid rgba(255,90,99,.4)',
            backdropFilter: 'blur(10px)',
            padding: '12px 15px',
            borderRadius: 16,
            zIndex: 5,
          }}
        >
          <Icon name="warning" size={18} color="var(--danger)" />
          <span style={{ fontSize: 13.5, color: 'var(--danger)', lineHeight: 1.4 }}>
            {errorMessage}
          </span>
        </div>
      )}

      {/* Record / Stop button */}
      <div
        style={{
          position: 'absolute',
          bottom: 40,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          zIndex: 10,
        }}
      >
        <button
          onClick={isRecording ? stopRecording : startRecording}
          aria-label={isRecording ? 'Aufnahme stoppen' : 'Aufnahme starten'}
          disabled={isRecording && !canStop}
          style={{
            width: 78,
            height: 78,
            borderRadius: '50%',
            border: `4px solid ${isRecording && !canStop ? 'rgba(255,255,255,.3)' : 'rgba(255,255,255,.85)'}`,
            background: 'transparent',
            cursor: isRecording && !canStop ? 'not-allowed' : 'pointer',
            display: 'grid',
            placeItems: 'center',
            transition: 'transform .12s',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          <span
            style={{
              width: isRecording ? 30 : 60,
              height: isRecording ? 30 : 60,
              borderRadius: isRecording ? 9 : '50%',
              background: isRecording
                ? canStop
                  ? '#FF453A'
                  : 'rgba(255,68,58,.4)'
                : '#fff',
              transition: 'all .25s cubic-bezier(.2,.8,.2,1)',
            }}
          />
        </button>
      </div>

      {/* Upload-from-file alternative (hidden while recording) */}
      {!isRecording && (
        <button
          onClick={openFilePicker}
          aria-label="Video hochladen"
          style={{
            position: 'absolute',
            bottom: 58,
            right: 22,
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            background: 'rgba(0,0,0,.45)',
            backdropFilter: 'blur(8px)',
            border: 'none',
            borderRadius: 999,
            padding: '9px 15px',
            color: '#fff',
            fontSize: 13.5,
            fontWeight: 600,
            cursor: 'pointer',
            zIndex: 10,
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          <Icon name="arrowUp" size={17} color="#fff" />
          Hochladen
        </button>
      )}
      {fileInput}

      {/* Cancel button */}
      <button
        aria-label="Abbrechen"
        onClick={() => setShowCancel(true)}
        style={CANCEL_BTN_STYLE}
      >
        <Icon name="close" size={20} color="#fff" />
      </button>

      {showCancel && (
        <CancelDialog
          onConfirm={handleCancelConfirm}
          onDismiss={() => setShowCancel(false)}
        />
      )}
    </div>
  );
}
