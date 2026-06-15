"use client";

// FA-07: Erfolgsscreen nach Submit
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AveryOrb } from "@/components/avery-orb";
import { Icon } from "@/components/icons";

interface ClaimData {
  vorgangsnummer: string;
  totalAmount: number;
  damageType?: string;
  rooms?: { room_type: string }[];
}

function formatEuro(n: number) {
  return "€ " + Math.round(n).toLocaleString("de-DE");
}

export default function SuccessPage() {
  const router = useRouter();
  const [claim, setClaim] = useState<ClaimData | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("adv-claim");
    if (raw) {
      try {
        setClaim(JSON.parse(raw));
      } catch {/* ignore */}
    }
  }, []);

  function copyVorgangsnummer() {
    if (!claim?.vorgangsnummer) return;
    try {
      navigator.clipboard.writeText(claim.vorgangsnummer);
    } catch {/* ignore */}
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  function goToStatus() {
    router.push("/status");
  }

  function goHome() {
    // Clear walk state, keep persona
    sessionStorage.removeItem("adv-walk-id");
    sessionStorage.removeItem("adv-damage");
    sessionStorage.removeItem("adv-rooms");
    router.push("/start");
  }

  const vorgangsnummer = claim?.vorgangsnummer ?? "ADV-2026-0001";
  const totalAmount = claim?.totalAmount ?? 0;
  const roomCount = claim?.rooms?.length ?? 0;

  return (
    <div className="adv-screen">
      <div
        className="adv-scroll"
        style={{
          flex: 1,
          padding: "20px 22px 24px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Hero */}
        <div
          className="rise"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            marginTop: 24,
          }}
        >
          <div style={{ position: "relative", display: "inline-block" }}>
            <AveryOrb size={110} state="speaking" />
            {/* Check badge */}
            <span
              style={{
                position: "absolute",
                right: -4,
                bottom: -4,
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "var(--grade-leicht)",
                display: "grid",
                placeItems: "center",
                border: "3px solid var(--screen)",
              }}
            >
              <Icon name="check" size={22} color="#fff" />
            </span>
          </div>
          <h1
            style={{
              fontSize: 27,
              fontWeight: 700,
              margin: "24px 0 8px",
              letterSpacing: "-0.02em",
              color: "var(--text)",
            }}
          >
            Schaden gemeldet
          </h1>
          <p
            style={{
              fontSize: 15.5,
              color: "var(--text-muted)",
              margin: 0,
              lineHeight: 1.5,
              maxWidth: 280,
            }}
          >
            Danke! Deine Meldung ist bei uns eingegangen. Wir kümmern uns sofort
            darum.
          </p>
        </div>

        {/* Vorgangsnummer (copyable) */}
        <button
          onClick={copyVorgangsnummer}
          className="adv-card rise"
          style={{
            marginTop: 26,
            padding: "18px",
            cursor: "pointer",
            textAlign: "left",
            width: "100%",
            display: "block",
            animationDelay: "0.1s",
          }}
          aria-label="Vorgangsnummer kopieren"
        >
          <div
            style={{
              fontSize: 12.5,
              color: "var(--text-faint)",
              fontWeight: 600,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            Deine Vorgangsnummer
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span
              className="mono"
              style={{
                fontSize: 24,
                fontWeight: 700,
                letterSpacing: "0.01em",
                color: "var(--text)",
              }}
            >
              {vorgangsnummer}
            </span>
            <span
              style={{
                marginLeft: "auto",
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 13,
                color: copied ? "var(--grade-leicht)" : "var(--text-faint)",
                transition: "color 0.2s",
              }}
            >
              <Icon
                name={copied ? "check" : "doc"}
                size={17}
                color={copied ? "var(--grade-leicht)" : "var(--text-faint)"}
              />
              {copied ? "Kopiert" : "Kopieren"}
            </span>
          </div>
        </button>

        {/* Mini summary */}
        <div
          className="adv-card rise"
          style={{
            marginTop: 12,
            padding: "16px 18px",
            display: "flex",
            alignItems: "center",
            animationDelay: "0.18s",
          }}
        >
          <div>
            {roomCount > 0 && (
              <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
                {roomCount} {roomCount === 1 ? "Raum" : "Räume"}
              </div>
            )}
            <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
              Voraussichtliche Schadenhöhe
            </div>
            <div
              className="mono"
              style={{ fontSize: 20, fontWeight: 700, color: "var(--text)" }}
            >
              {formatEuro(totalAmount)}
            </div>
          </div>
          <span
            style={{
              marginLeft: "auto",
              fontSize: 12.5,
              fontWeight: 600,
              color: "var(--accent-deep)",
              background: "var(--accent-soft)",
              padding: "6px 11px",
              borderRadius: 999,
            }}
          >
            Eingegangen
          </span>
        </div>
      </div>

      {/* CTA buttons */}
      <div
        style={{
          flexShrink: 0,
          padding: "12px 18px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <button
          className="btn btn-primary btn-block"
          style={{ height: 56 }}
          onClick={goToStatus}
        >
          <Icon name="clock" size={19} color="var(--accent-ink)" />
          Status verfolgen
        </button>
        <button
          className="btn btn-ghost btn-block"
          style={{ height: 52 }}
          onClick={goHome}
        >
          Zur Übersicht
        </button>
      </div>
    </div>
  );
}
