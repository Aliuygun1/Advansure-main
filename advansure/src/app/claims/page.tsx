"use client";

// Schadenübersicht — Liste aller gemeldeten Schäden der aktuellen Persona
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { TopBar } from "@/components/top-bar";
import { Icon } from "@/components/icons";

interface ClaimListItem {
  id: string;
  damageType: string;
  cause: string;
  status: string;
  vorgangsnummer: string | null;
  totalAmount: number;
  createdAt: string | null;
}

const DAMAGE_LABELS: Record<string, string> = {
  wasser: "Wasserschaden",
  feuer: "Brandschaden",
  einbruch: "Einbruchschaden",
  sturm: "Sturmschaden",
};

const DAMAGE_ICONS: Record<string, string> = {
  wasser: "water",
  feuer: "fire",
  einbruch: "lock",
  sturm: "storm",
};

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  eingegangen: { label: "Eingegangen", color: "var(--accent-deep)", bg: "var(--accent-soft)" },
  bearbeitung: { label: "In Bearbeitung", color: "#E9A23B", bg: "rgba(233,162,59,0.14)" },
  geprueft: { label: "Geprüft", color: "var(--accent-deep)", bg: "var(--accent-soft)" },
  abgeschlossen: { label: "Abgeschlossen", color: "var(--grade-leicht)", bg: "rgba(47,197,143,0.14)" },
};

function formatEuro(n: number) {
  return "€ " + Math.round(n).toLocaleString("de-DE");
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function ClaimsPage() {
  const router = useRouter();
  const [claims, setClaims] = useState<ClaimListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadClaims = useCallback(async () => {
    setLoading(true);
    setError(null);
    const personaId =
      typeof window !== "undefined"
        ? sessionStorage.getItem("adv-persona") ?? "leon"
        : "leon";
    try {
      const res = await fetch(
        `/api/claims?personaId=${encodeURIComponent(personaId)}`,
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? "Fehler beim Laden");
      }
      const data = (await res.json()) as { claims: ClaimListItem[] };
      setClaims(data.claims ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unbekannter Fehler");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClaims();
  }, [loadClaims]);

  function openClaim(claim: ClaimListItem) {
    // Reuse the existing status screen, which reads from sessionStorage
    sessionStorage.setItem(
      "adv-claim",
      JSON.stringify({
        vorgangsnummer: claim.vorgangsnummer ?? "",
        totalAmount: claim.totalAmount,
        status: claim.status,
      }),
    );
    router.push("/status");
  }

  return (
    <div className="adv-screen">
      <TopBar title="Schadenübersicht" onBack={() => router.push("/start")} />

      <div className="adv-scroll" style={{ flex: 1, padding: "4px 20px 24px" }}>
        {/* Loading */}
        {loading && (
          <p
            style={{
              textAlign: "center",
              color: "var(--text-muted)",
              fontSize: 14,
              marginTop: 40,
            }}
          >
            Schäden werden geladen…
          </p>
        )}

        {/* Error */}
        {!loading && error && (
          <div
            className="adv-card"
            style={{
              display: "flex",
              gap: 11,
              alignItems: "flex-start",
              padding: "14px 16px",
              marginTop: 12,
            }}
          >
            <Icon name="warning" size={18} color="var(--danger)" style={{ flexShrink: 0, marginTop: 1 }} />
            <span style={{ fontSize: 13.5, color: "var(--text-muted)", lineHeight: 1.5 }}>
              {error}
            </span>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && claims.length === 0 && (
          <div
            className="rise"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              marginTop: 64,
              padding: "0 20px",
            }}
          >
            <span
              style={{
                width: 72,
                height: 72,
                borderRadius: 22,
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                display: "grid",
                placeItems: "center",
                marginBottom: 18,
              }}
            >
              <Icon name="doc" size={32} color="var(--text-faint)" />
            </span>
            <h2 style={{ fontSize: 19, fontWeight: 700, margin: "0 0 8px" }}>
              Noch keine Schäden gemeldet
            </h2>
            <p
              style={{
                fontSize: 14.5,
                color: "var(--text-muted)",
                margin: "0 0 22px",
                lineHeight: 1.55,
                maxWidth: 280,
              }}
            >
              Sobald du einen Schaden meldest, erscheint er hier in deiner Übersicht.
            </p>
            <button
              className="btn btn-primary"
              style={{ padding: "0 22px" }}
              onClick={() => router.push("/chat")}
            >
              <Icon name="sparkle" size={19} color="var(--accent-ink)" />
              Schaden melden
            </button>
          </div>
        )}

        {/* Claims list */}
        {!loading && !error && claims.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 8 }}>
            {claims.map((claim, i) => {
              const label = DAMAGE_LABELS[claim.damageType] ?? "Schaden";
              const iconName = DAMAGE_ICONS[claim.damageType] ?? "doc";
              const statusMeta =
                STATUS_META[claim.status] ?? {
                  label: claim.status,
                  color: "var(--text-muted)",
                  bg: "var(--surface-2)",
                };

              return (
                <button
                  key={claim.id}
                  onClick={() => openClaim(claim)}
                  className="adv-card rise"
                  style={{
                    textAlign: "left",
                    border: "1px solid var(--border)",
                    background: "var(--surface)",
                    padding: "15px 16px",
                    cursor: "pointer",
                    animationDelay: `${Math.min(i * 0.04, 0.2)}s`,
                    width: "100%",
                  }}
                >
                  {/* Header row: icon + title + status */}
                  <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 10 }}>
                    <span
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 12,
                        background: "var(--accent-soft)",
                        display: "grid",
                        placeItems: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Icon name={iconName} size={20} color="var(--accent-deep)" />
                    </span>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: 15.5, fontWeight: 700, color: "var(--text)" }}>
                        {label}
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          color: "var(--text-muted)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {claim.cause}
                      </div>
                    </div>
                    <span
                      style={{
                        flexShrink: 0,
                        fontSize: 12,
                        fontWeight: 600,
                        color: statusMeta.color,
                        background: statusMeta.bg,
                        padding: "4px 10px",
                        borderRadius: 999,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {statusMeta.label}
                    </span>
                  </div>

                  {/* Footer row: date + vorgangsnummer + amount */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      fontSize: 12.5,
                      color: "var(--text-faint)",
                    }}
                  >
                    <Icon name="clock" size={14} color="var(--text-faint)" />
                    <span>{formatDate(claim.createdAt)}</span>
                    {claim.vorgangsnummer && (
                      <>
                        <span>·</span>
                        <span className="mono">{claim.vorgangsnummer}</span>
                      </>
                    )}
                    {claim.totalAmount > 0 && (
                      <span
                        className="mono"
                        style={{ marginLeft: "auto", fontWeight: 700, color: "var(--text)" }}
                      >
                        {formatEuro(claim.totalAmount)}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
