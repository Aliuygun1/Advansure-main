"use client";

// FA-08: Status der Schadenmeldung verfolgen
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TopBar } from "@/components/top-bar";
import { Icon } from "@/components/icons";

const STATUS_STAGES = [
  {
    key: "eingegangen",
    label: "Eingegangen",
    desc: "Deine Meldung ist bei uns angekommen.",
  },
  {
    key: "bearbeitung",
    label: "In Bearbeitung",
    desc: "Ein Sachbearbeiter prüft deinen Fall.",
  },
  {
    key: "geprueft",
    label: "Geprüft",
    desc: "Die Schadenhöhe wurde bestätigt.",
  },
  {
    key: "abgeschlossen",
    label: "Abgeschlossen",
    desc: "Die Regulierung ist abgeschlossen.",
  },
];

interface ClaimData {
  vorgangsnummer: string;
  totalAmount: number;
  rooms?: { room_type: string }[];
  status?: string;
}

function formatEuro(n: number) {
  return "€ " + Math.round(n).toLocaleString("de-DE");
}

function formatTimestamp(baseMs: number, offsetMinutes: number): string {
  const d = new Date(baseMs + offsetMinutes * 60 * 1000);
  const date = d.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
  });
  const time = d.toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${date} · ${time}`;
}

export default function StatusPage() {
  const router = useRouter();
  const [claim, setClaim] = useState<ClaimData | null>(null);
  const [currentStage, setCurrentStage] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [baseTime] = useState(() => Date.now());

  useEffect(() => {
    const raw = sessionStorage.getItem("adv-claim");
    if (raw) {
      try {
        const data = JSON.parse(raw) as ClaimData;
        setClaim(data);
        // Map stored status to stage index
        const idx = STATUS_STAGES.findIndex((s) => s.key === data.status);
        setCurrentStage(idx >= 0 ? idx : 0);
      } catch {/* ignore */}
    }
  }, []);

  function refresh() {
    if (refreshing) return;
    setRefreshing(true);
    // PoC: simulate status progression in demo
    setTimeout(() => {
      setCurrentStage((prev) => Math.min(STATUS_STAGES.length - 1, prev + 1));
      setRefreshing(false);
    }, 900);
  }

  const vorgangsnummer = claim?.vorgangsnummer ?? "ADV-2026-0001";
  const totalAmount = claim?.totalAmount ?? 0;
  const roomCount = claim?.rooms?.length ?? 0;

  return (
    <div className="adv-screen">
      <TopBar
        title="Status verfolgen"
        onBack={() => router.push("/success")}
        trailing={
          <button
            onClick={refresh}
            aria-label="Status aktualisieren"
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              border: "none",
              background: "transparent",
              color: "var(--text-muted)",
              cursor: "pointer",
              display: "grid",
              placeItems: "center",
            }}
          >
            <Icon
              name="sparkle"
              size={19}
              color="var(--accent-deep)"
              style={{
                animation: refreshing ? "avery-spin 0.9s linear" : "none",
              }}
            />
          </button>
        }
      />

      <div
        className="adv-scroll"
        style={{ flex: 1, padding: "4px 20px 24px" }}
      >
        {/* Vorgang header */}
        <div
          className="adv-card rise"
          style={{ padding: "17px 18px", marginBottom: 22 }}
        >
          <div
            style={{
              fontSize: 12.5,
              color: "var(--text-faint)",
              fontWeight: 600,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            Vorgang
          </div>
          <div
            className="mono"
            style={{
              fontSize: 21,
              fontWeight: 700,
              margin: "3px 0 10px",
              color: "var(--text)",
            }}
          >
            {vorgangsnummer}
          </div>
          <div
            style={{
              display: "flex",
              gap: 16,
              fontSize: 13.5,
              color: "var(--text-muted)",
            }}
          >
            {roomCount > 0 && (
              <>
                <span>
                  {roomCount} {roomCount === 1 ? "Raum" : "Räume"}
                </span>
                <span>·</span>
              </>
            )}
            <span
              className="mono"
              style={{ color: "var(--text)", fontWeight: 600 }}
            >
              {formatEuro(totalAmount)}
            </span>
          </div>
        </div>

        {/* Status timeline */}
        <div style={{ position: "relative", paddingLeft: 4 }}>
          {STATUS_STAGES.map((stage, i) => {
            const done = i < currentStage;
            const active = i === currentStage;
            const future = i > currentStage;
            const showTimestamp = !future;
            const offsetMinutes = i * 47;

            return (
              <div
                key={stage.key}
                style={{
                  display: "flex",
                  gap: 16,
                  position: "relative",
                  paddingBottom: i < STATUS_STAGES.length - 1 ? 30 : 0,
                }}
              >
                {/* Vertical connector */}
                {i < STATUS_STAGES.length - 1 && (
                  <div
                    style={{
                      position: "absolute",
                      left: 15,
                      top: 30,
                      bottom: 0,
                      width: 2,
                      background: done ? "var(--accent)" : "var(--surface-3)",
                      transition: "background 0.4s",
                    }}
                  />
                )}

                {/* Stage node */}
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    flexShrink: 0,
                    display: "grid",
                    placeItems: "center",
                    background: done
                      ? "var(--accent)"
                      : active
                        ? "var(--accent-soft)"
                        : "var(--surface-2)",
                    border: active
                      ? "2px solid var(--accent)"
                      : done
                        ? "2px solid var(--accent)"
                        : "2px solid var(--border)",
                    transition: "all 0.4s",
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  {done ? (
                    <Icon name="check" size={17} color="var(--accent-ink)" />
                  ) : active ? (
                    <span
                      style={{
                        width: 11,
                        height: 11,
                        borderRadius: "50%",
                        background: "var(--accent)",
                      }}
                    />
                  ) : (
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: "var(--text-faint)",
                        opacity: 0.5,
                      }}
                    />
                  )}
                </div>

                {/* Stage text */}
                <div
                  style={{
                    flex: 1,
                    paddingTop: 2,
                    opacity: future ? 0.5 : 1,
                    transition: "opacity 0.4s",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 9,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 16,
                        fontWeight: active ? 700 : 600,
                        color: active ? "var(--accent-deep)" : "var(--text)",
                        transition: "color 0.3s",
                      }}
                    >
                      {stage.label}
                    </span>
                    {active && (
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: "var(--accent-deep)",
                          background: "var(--accent-soft)",
                          padding: "2px 8px",
                          borderRadius: 999,
                        }}
                      >
                        Aktuell
                      </span>
                    )}
                  </div>
                  <p
                    style={{
                      margin: "3px 0 0",
                      fontSize: 13.5,
                      color: "var(--text-muted)",
                      lineHeight: 1.45,
                    }}
                  >
                    {stage.desc}
                  </p>
                  {showTimestamp && (
                    <div
                      className="mono"
                      style={{
                        fontSize: 12,
                        color: "var(--text-faint)",
                        marginTop: 5,
                      }}
                    >
                      {formatTimestamp(baseTime, offsetMinutes)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Info box */}
        <div
          style={{
            marginTop: 24,
            padding: "14px 16px",
            borderRadius: 16,
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            display: "flex",
            gap: 11,
            alignItems: "flex-start",
          }}
        >
          <Icon
            name="sparkle"
            size={18}
            color="var(--accent-deep)"
            style={{ marginTop: 1, flexShrink: 0 }}
          />
          <span
            style={{
              fontSize: 13.5,
              color: "var(--text-muted)",
              lineHeight: 1.5,
            }}
          >
            Tippe oben rechts auf{" "}
            <strong style={{ color: "var(--text)" }}>Aktualisieren</strong>, um
            den Demo-Fortschritt zu simulieren. In der echten App werden
            Statusänderungen automatisch angezeigt.
          </span>
        </div>
      </div>
    </div>
  );
}
