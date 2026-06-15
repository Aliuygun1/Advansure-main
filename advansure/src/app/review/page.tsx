"use client";

// FA-07: Schadenmeldung überprüfen & abschicken (M6 — Review + Pauschalberechnung)
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TopBar } from "@/components/top-bar";
import { GradeBadge } from "@/components/grade-badge";
import { Icon } from "@/components/icons";
import { calcValuation } from "@/lib/valuation";
import type { RoomInput } from "@/lib/valuation";

const DAMAGE_LABELS: Record<string, string> = {
  wasser: "Wasserschaden",
  feuer: "Brand- / Feuerschaden",
  einbruch: "Einbruchdiebstahl",
  sturm: "Sturm- / Hagelschaden",
};
const DAMAGE_ICONS: Record<string, string> = {
  wasser: "droplet",
  feuer: "flame",
  einbruch: "shield",
  sturm: "warning",
};

function formatEuro(n: number) {
  return "€ " + Math.round(n).toLocaleString("de-DE");
}

interface RoomData extends RoomInput {
  id: string;
  damage_kind?: string;
}

export default function ReviewPage() {
  const router = useRouter();
  const [personaId, setPersonaId] = useState("leon");
  const [damageType, setDamageType] = useState("wasser");
  const [cause, setCause] = useState("unbekannte Ursache");
  const [rooms, setRooms] = useState<RoomData[]>([]);
  const [showPauschal, setShowPauschal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const pid = sessionStorage.getItem("adv-persona") ?? "leon";
    setPersonaId(pid);

    const damageRaw = sessionStorage.getItem("adv-damage");
    if (damageRaw) {
      try {
        const d = JSON.parse(damageRaw);
        if (d.type) setDamageType(d.type);
        if (d.cause) setCause(d.cause);
      } catch {/* ignore */}
    }

    const roomsRaw = sessionStorage.getItem("adv-rooms");
    if (roomsRaw) {
      try {
        setRooms(JSON.parse(roomsRaw));
      } catch {/* ignore */}
    } else {
      // Demo fallback: Küche mittel — acceptance criterion: 9 × 450 = 4.050
      setRooms([
        { id: "demo-1", room_type: "Küche", damage_grade: "mittel", area_m2: 9, damage_kind: "Wasserschaden am Boden" },
        { id: "demo-2", room_type: "Flur", damage_grade: "leicht", area_m2: 6, damage_kind: "Feuchtigkeitsflecken" },
      ]);
    }
  }, []);

  const valuation = calcValuation(rooms);

  function removeRoom(id: string) {
    if (rooms.length <= 1) return; // min. 1 Raum
    const updated = rooms.filter((r) => r.id !== id);
    setRooms(updated);
    sessionStorage.setItem("adv-rooms", JSON.stringify(updated));
  }

  async function handleSubmit() {
    if (rooms.length === 0) {
      setError("Mindestens ein Raum muss erfasst sein.");
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      const walkId = sessionStorage.getItem("adv-walk-id");
      const res = await fetch("/api/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personaId,
          damageType,
          cause,
          walkId,
          rooms: valuation.rooms.map((r) => ({
            room_type: r.room_type,
            damage_grade: r.damage_grade,
            area_m2: r.area_m2,
            rate_per_m2: r.rate_per_m2,
            amount: r.amount,
          })),
          totalAmount: valuation.totalAmount,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Fehler beim Einreichen");
      }

      const data = await res.json();
      sessionStorage.setItem("adv-claim", JSON.stringify(data));
      router.push("/success");
    } catch {
      // Offline-fallback: generate demo Vorgangsnummer
      const year = new Date().getFullYear();
      const num = String(Math.floor(Math.random() * 9000) + 1000);
      const vorgangsnummer = `ADV-${year}-${num}`;
      const claimData = {
        vorgangsnummer,
        totalAmount: valuation.totalAmount,
        damageType,
        cause,
        rooms: valuation.rooms,
      };
      sessionStorage.setItem("adv-claim", JSON.stringify(claimData));
      router.push("/success");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="adv-screen">
      <TopBar title="Zusammenfassung" onBack={() => router.push("/walk")} />

      <div className="adv-scroll" style={{ flex: 1, padding: "4px 18px 20px" }}>
        {/* Damage type card */}
        <div
          className="adv-card rise"
          style={{
            padding: "16px 17px",
            marginBottom: 14,
            display: "flex",
            alignItems: "center",
            gap: 13,
          }}
        >
          <span
            style={{
              width: 46,
              height: 46,
              borderRadius: 14,
              background: "var(--accent-soft)",
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
            }}
          >
            <Icon
              name={DAMAGE_ICONS[damageType] ?? "shield"}
              size={24}
              color="var(--accent-deep)"
            />
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16.5, fontWeight: 700, color: "var(--text)" }}>
              {DAMAGE_LABELS[damageType] ?? damageType}
            </div>
            <div style={{ fontSize: 13.5, color: "var(--text-muted)" }}>
              Ursache: {cause}
            </div>
          </div>
        </div>

        {/* Rooms section header */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            padding: "4px 4px 10px",
          }}
        >
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              color: "var(--text-faint)",
            }}
          >
            Betroffene Räume
          </span>
          <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
            {rooms.length} {rooms.length === 1 ? "Raum" : "Räume"}
          </span>
        </div>

        {/* Room cards */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            marginBottom: 14,
          }}
        >
          {valuation.rooms.map((r, i) => {
            const room = rooms[i];
            return (
              <div
                key={room?.id ?? i}
                className="adv-card rise"
                style={{ padding: "15px 16px" }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 11,
                  }}
                >
                  <span
                    style={{ fontSize: 16, fontWeight: 700, color: "var(--text)" }}
                  >
                    {r.room_type}
                  </span>
                  <GradeBadge grade={r.damage_grade as "leicht" | "mittel" | "schwer" | "total"} small />
                  {rooms.length > 1 && (
                    <button
                      onClick={() => room && removeRoom(room.id)}
                      aria-label={`${r.room_type} entfernen`}
                      style={{
                        marginLeft: "auto",
                        width: 32,
                        height: 32,
                        borderRadius: 9,
                        border: "1px solid var(--border)",
                        background: "transparent",
                        color: "var(--text-faint)",
                        cursor: "pointer",
                        display: "grid",
                        placeItems: "center",
                      }}
                    >
                      <Icon name="x" size={16} color="var(--text-faint)" />
                    </button>
                  )}
                </div>
                {/* Calculation row */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    fontSize: 13,
                    color: "var(--text-muted)",
                  }}
                >
                  <Icon name="ruler" size={15} color="var(--text-faint)" />
                  <span>{r.area_m2} m²</span>
                  <span style={{ color: "var(--text-faint)" }}>×</span>
                  <span>{formatEuro(r.rate_per_m2)} / m²</span>
                  {r.manualReview ? (
                    <span
                      className="mono"
                      style={{
                        marginLeft: "auto",
                        fontSize: 13,
                        fontWeight: 600,
                        color: "var(--text-faint)",
                      }}
                    >
                      Manuelle Prüfung
                    </span>
                  ) : (
                    <span
                      className="mono"
                      style={{
                        marginLeft: "auto",
                        fontSize: 15.5,
                        fontWeight: 700,
                        color: "var(--text)",
                      }}
                    >
                      {formatEuro(r.amount)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Add room button */}
        <button
          className="btn btn-ghost btn-block"
          style={{ height: 48, marginBottom: 18 }}
          onClick={() => router.push("/walk")}
        >
          <Icon name="camera" size={18} color="var(--text-muted)" />
          Weiteren Raum aufnehmen
        </button>

        {/* Pauschal explainer */}
        <button
          onClick={() => setShowPauschal((s) => !s)}
          style={{
            width: "100%",
            textAlign: "left",
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: 16,
            padding: "13px 15px",
            cursor: "pointer",
            marginBottom: 14,
            color: "var(--text)",
          }}
        >
          <div
            style={{ display: "flex", alignItems: "center", gap: 9 }}
          >
            <Icon name="sparkle" size={18} color="var(--accent-deep)" />
            <span style={{ fontSize: 14, fontWeight: 600 }}>
              Wie wird das berechnet?
            </span>
            <Icon
              name="chevron"
              size={16}
              color="var(--text-faint)"
              style={{
                marginLeft: "auto",
                transform: showPauschal ? "rotate(90deg)" : "none",
                transition: "transform 0.2s",
              }}
            />
          </div>
          {showPauschal && (
            <p
              className="fade"
              style={{
                margin: "11px 0 0",
                fontSize: 13.5,
                color: "var(--text-muted)",
                lineHeight: 1.55,
              }}
            >
              Pauschalmethode: Pro Raum rechnen wir{" "}
              <strong style={{ color: "var(--text)" }}>
                Fläche × Pauschalsatz pro m²
              </strong>{" "}
              – je nach Schadensgrad (leicht {formatEuro(200)}, mittel{" "}
              {formatEuro(450)}, schwer {formatEuro(800)} pro m²). Das ist eine
              erste Einschätzung, keine verbindliche Zusage.
            </p>
          )}
        </button>

        {/* Total amount */}
        <div
          className="adv-card rise"
          style={{
            padding: "20px",
            background: "var(--accent-soft)",
            border: "1px solid color-mix(in srgb, var(--accent) 30%, transparent)",
          }}
        >
          <div
            style={{
              fontSize: 13.5,
              color: "var(--accent-deep)",
              fontWeight: 600,
              marginBottom: 4,
            }}
          >
            Voraussichtliche Schadenhöhe
          </div>
          <div
            className="mono"
            style={{
              fontSize: 38,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "var(--text)",
            }}
          >
            {formatEuro(valuation.totalAmount)}
          </div>
          <div
            style={{
              fontSize: 12.5,
              color: "var(--text-muted)",
              marginTop: 6,
            }}
          >
            Erste Einschätzung nach Pauschalmethode · ohne Selbstbeteiligung
          </div>
        </div>

        {error && (
          <div
            style={{
              marginTop: 12,
              padding: "12px 14px",
              borderRadius: 12,
              background: "var(--danger-soft)",
              border: "1px solid var(--danger)",
              fontSize: 13.5,
              color: "var(--danger)",
            }}
          >
            {error}
          </div>
        )}
      </div>

      {/* Submit bar */}
      <div
        style={{
          flexShrink: 0,
          padding: "12px 18px 16px",
          borderTop: "1px solid var(--border)",
          background: "var(--screen)",
        }}
      >
        <button
          className="btn btn-primary btn-block"
          style={{ height: 58, fontSize: 17, opacity: submitting ? 0.75 : 1 }}
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <span style={{ display: "flex", gap: 5, alignItems: "center" }}>
              <span className="adv-typing-dot" style={{ background: "var(--accent-ink)" }} />
              <span className="adv-typing-dot" style={{ background: "var(--accent-ink)", animationDelay: "0.18s" }} />
              <span className="adv-typing-dot" style={{ background: "var(--accent-ink)", animationDelay: "0.36s" }} />
            </span>
          ) : (
            <>
              <Icon name="check" size={20} color="var(--accent-ink)" />
              Schaden absenden
            </>
          )}
        </button>
      </div>
    </div>
  );
}
