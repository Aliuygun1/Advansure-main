"use client";

export default function OfflinePage() {
  return (
    <div className="adv-screen" style={{ alignItems: "center", justifyContent: "center", gap: 16, padding: "0 24px", textAlign: "center" }}>
      <div style={{ fontSize: 48 }}>📡</div>
      <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: "var(--text)" }}>
        Keine Verbindung
      </h1>
      <p style={{ fontSize: 15, color: "var(--text-muted)", margin: 0, maxWidth: 280, lineHeight: 1.5 }}>
        Advansure benötigt eine Internetverbindung. Bitte überprüfe deine Verbindung und versuche es erneut.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="btn btn-primary"
        style={{ marginTop: 8 }}
      >
        Erneut versuchen
      </button>
    </div>
  );
}
