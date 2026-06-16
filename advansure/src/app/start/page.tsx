"use client";

// FA-01: App-Start & Session-Initialisierung
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AveryOrb } from "@/components/avery-orb";
import { Icon } from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";

const PERSONAS = ["leon", "robert", "julia"] as const;
type PersonaId = (typeof PERSONAS)[number];

interface PersonaData {
  id: string;
  name: string;
  full_name: string;
  initials: string;
  tenure: string;
}

interface PolicyData {
  id: string;
  living_area_m2: number;
  sum_insured: number;
  address: string;
  policy_no: string;
  active: boolean;
}

function formatEuro(n: number) {
  return "€ " + Math.round(n).toLocaleString("de-DE");
}

export default function StartPage() {
  const router = useRouter();
  const [personaId, setPersonaId] = useState<PersonaId>("leon");
  const [persona, setPersona] = useState<PersonaData | null>(null);
  const [policy, setPolicy] = useState<PolicyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load persona + policy from API (TU-01)
  const loadSession = useCallback(async (id: PersonaId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personaId: id }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Fehler beim Laden");
      }
      const data = await res.json();
      setPersona(data.persona);
      setPolicy(data.policy);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unbekannter Fehler");
      // Fallback to offline-safe demo data
      setPersona(OFFLINE_FALLBACK[id]);
      setPolicy(OFFLINE_POLICIES[id]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSession(personaId);
  }, [personaId, loadSession]);

  function switchPersona() {
    const idx = PERSONAS.indexOf(personaId);
    const next = PERSONAS[(idx + 1) % PERSONAS.length];
    setPersonaId(next);
    // Persist selection
    sessionStorage.setItem("adv-persona", next);
  }

  function startClaim() {
    sessionStorage.setItem("adv-persona", personaId);
    sessionStorage.removeItem("adv-chat-messages");
    sessionStorage.removeItem("adv-chat-conv-id");
    sessionStorage.removeItem("adv-damage");
    sessionStorage.removeItem("adv-walk-id");
    sessionStorage.removeItem("adv-ai-fallback");
    router.push("/chat");
  }

  function openClaimsOverview() {
    sessionStorage.setItem("adv-persona", personaId);
    router.push("/claims");
  }

  // Derive display data (fallback while loading)
  const p = persona ?? OFFLINE_FALLBACK[personaId];
  const pol = policy ?? OFFLINE_POLICIES[personaId];

  return (
    <div className="adv-screen" style={{ paddingTop: 0 }}>
      {/* Scrollable content */}
      <div
        className="adv-scroll"
        style={{ flex: 1, padding: "54px 20px 28px" }}
      >
        {/* Top row: persona switcher + theme */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 30,
          }}
        >
          <button
            onClick={switchPersona}
            aria-label="Persona wechseln"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              borderRadius: 999,
              padding: "6px 14px 6px 6px",
              cursor: "pointer",
              transition: "background 0.15s",
            }}
          >
            <span
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                background: "var(--accent)",
                color: "var(--accent-ink)",
                display: "grid",
                placeItems: "center",
                fontWeight: 700,
                fontSize: 13,
                flexShrink: 0,
              }}
            >
              {p.initials}
            </span>
            <span
              style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}
            >
              {p.name}
            </span>
            <Icon
              name="chevron"
              size={15}
              color="var(--text-faint)"
              style={{ transform: "rotate(90deg)" }}
            />
          </button>
          <ThemeToggle />
        </div>

        {/* Hero greeting */}
        <div
          className="rise"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            marginBottom: 26,
            animationDelay: "0.05s",
          }}
        >
          <AveryOrb size={104} state="idle" />
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--accent-deep)",
              marginTop: 20,
            }}
          >
            Advansure
          </div>
          <h1
            style={{
              fontSize: 30,
              fontWeight: 700,
              lineHeight: 1.15,
              margin: "8px 0 6px",
              letterSpacing: "-0.02em",
              color: "var(--text)",
            }}
          >
            Hey {p.name},<br />was liegt an?
          </h1>
          <p
            style={{
              fontSize: 15.5,
              color: "var(--text-muted)",
              margin: 0,
              maxWidth: 280,
              lineHeight: 1.5,
            }}
          >
            Beschreib mir kurz, was passiert ist – ich führe dich in wenigen
            Minuten durch die Schadenmeldung.
          </p>
        </div>

        {/* Error banner (shown when API unavailable but not when using fallback) */}
        {error && !loading && (
          <div
            className="rise"
            style={{
              background: "var(--danger-soft)",
              border: "1px solid var(--danger)",
              borderRadius: 12,
              padding: "12px 16px",
              marginBottom: 14,
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: 13.5,
              color: "var(--danger)",
            }}
          >
            <Icon name="warning" size={16} color="var(--danger)" />
            <span>
              Offline-Modus: Demo-Daten werden verwendet.
            </span>
          </div>
        )}

        {/* Primary CTA */}
        <button
          className="btn btn-primary btn-block rise"
          style={{
            marginBottom: 14,
            height: 60,
            fontSize: 17,
            animationDelay: "0.12s",
          }}
          onClick={startClaim}
          disabled={loading}
        >
          <Icon name="sparkle" size={20} color="var(--accent-ink)" />
          {loading ? "Laden…" : "Schaden melden"}
        </button>

        {/* Secondary CTA — overview of reported claims */}
        <button
          className="btn btn-ghost btn-block rise"
          style={{ marginBottom: 14, animationDelay: "0.16s" }}
          onClick={openClaimsOverview}
        >
          <Icon name="doc" size={19} color="var(--text)" />
          Schadenübersicht
        </button>

        {/* Policy card */}
        <div
          className="adv-card rise"
          style={{ padding: "18px 18px 6px", animationDelay: "0.2s" }}
        >
          {/* Card header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              marginBottom: 14,
            }}
          >
            <Icon name="shield" size={19} color="var(--accent-deep)" />
            <span style={{ fontSize: 14, fontWeight: 600 }}>
              Deine Hausratpolice
            </span>
            <span
              style={{
                marginLeft: "auto",
                fontSize: 12,
                fontWeight: 600,
                color: "var(--grade-leicht)",
                background: "rgba(47,197,143,0.14)",
                padding: "3px 9px",
                borderRadius: 999,
              }}
            >
              Aktiv
            </span>
          </div>

          {/* Policy rows */}
          {(
            [
              ["Wohnfläche", pol.living_area_m2 + " m²", "ruler", false],
              [
                "Versicherungssumme",
                formatEuro(pol.sum_insured),
                "shield",
                true,
              ],
              ["Adresse", pol.address, "pin", false],
              ["Police", pol.policy_no, "doc", true],
            ] as [string, string, string, boolean][]
          ).map(([label, value, icon, mono], i, arr) => (
            <div
              key={label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 0",
                borderBottom:
                  i < arr.length - 1
                    ? "1px solid var(--border)"
                    : "none",
              }}
            >
              <Icon name={icon} size={17} color="var(--text-faint)" />
              <span style={{ fontSize: 14, color: "var(--text-muted)" }}>
                {label}
              </span>
              <span
                className={mono ? "mono" : ""}
                style={{
                  marginLeft: "auto",
                  fontSize: 14,
                  fontWeight: 600,
                  textAlign: "right",
                  color: "var(--text)",
                }}
              >
                {value}
              </span>
            </div>
          ))}
        </div>

        <p
          style={{
            textAlign: "center",
            fontSize: 12,
            color: "var(--text-faint)",
            marginTop: 18,
          }}
        >
          {p.tenure} · {p.full_name}
        </p>
      </div>
    </div>
  );
}

// Offline-safe fallback data (mirrors seed data, no DB needed for demo)
const OFFLINE_FALLBACK: Record<PersonaId, PersonaData> = {
  leon: { id: "leon", name: "Leon", full_name: "Leon Brandt", initials: "LB", tenure: "Kunde seit 2022" },
  robert: { id: "robert", name: "Robert", full_name: "Robert Hofmann", initials: "RH", tenure: "Kunde seit 2019" },
  julia: { id: "julia", name: "Julia", full_name: "Julia Sander", initials: "JS", tenure: "Kundin seit 2025" },
};

const OFFLINE_POLICIES: Record<PersonaId, PolicyData> = {
  leon: { id: "leon-policy", living_area_m2: 72, sum_insured: 65000, address: "Lindenstraße 14 · Mannheim", policy_no: "ADV-HR-2024-10293", active: true },
  robert: { id: "robert-policy", living_area_m2: 118, sum_insured: 95000, address: "Am Stadtpark 7 · Heidelberg", policy_no: "ADV-HR-2021-44817", active: true },
  julia: { id: "julia-policy", living_area_m2: 54, sum_insured: 48000, address: "Kerschensteinerweg 3 · Mannheim", policy_no: "ADV-HR-2025-50922", active: true },
};
