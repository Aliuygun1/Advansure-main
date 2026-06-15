# Claude-Code-Prompt — Advansure 2.0

> Diesen kompletten Text in Claude Code (VS Code) als ersten Auftrag einfügen.
> Die `prototyp/`-Dateien und `Konzept_MST02.md` liegen im selben Handoff-Ordner und sind die **verbindliche** fachliche bzw. visuelle Referenz.

---

## ROLLE & KONTEXT

Du bist Senior Full-Stack-Engineer und baust **Advansure** — eine mobile-first **Progressive Web App (PWA)** zur **digitalen Schadenmeldung in der Hausratversicherung**. Statt eines klassischen Formulars führt eine KI-Assistentin namens **Avery** den Versicherungsnehmer dialoggeführt durch die Meldung: Schaden in eigenen Worten beschreiben → per Video dokumentieren („Foto-Walk") → multimodale KI klassifiziert pro Raum den Schadensgrad → Pauschalmethode berechnet die voraussichtliche Schadenhöhe → einreichen → Vorgangsnummer + Statusverfolgung.

Es handelt sich um einen **Proof of Concept (PoC)** im Rahmen eines Hochschul-Projektsemesters (Convista Consulting, TH Mannheim). Das vollständige fachliche/technische Konzept liegt in **`Konzept_MST02.md`** — lies es einmal komplett, bevor du startest. Es ist die Quelle der Wahrheit für alle fachlichen Entscheidungen.

**Wichtig zur Referenz:** Im Ordner `prototyp/` liegt ein **HTML/React-Klickprototyp** (über Babel im Browser). Er ist **keine Produktions-Codebasis zum Kopieren**, sondern die **pixel-genaue visuelle & UX-Vorlage**: Farben, Typografie, Spacing, Komponenten, Screen-Flow, Micro-Interactions, Avery-Orb, Copywriting (deutsche Du-Form). Baue diese Designs in der unten definierten Produktions-Umgebung **originalgetreu** nach.

---

## ZIEL

Eine lauffähige, installierbare PWA, mit der drei Demo-Personas den kompletten Schadenmeldungs-Flow durchlaufen können — von der Begrüßung bis zur Statusverfolgung — inklusive echter Gemini-Anbindung (Dialog + Videoanalyse), Supabase-Persistenz und Pauschalberechnung.

---

## TECH-STACK (verbindlich, aus dem Konzept)

| Bereich | Technologie |
|---|---|
| Framework | **Next.js 14** (App Router), **TypeScript** (strict) |
| Styling | **Tailwind CSS** + **shadcn/ui** |
| Backend | **Next.js Route Handlers** (serverless), in 4 Services gegliedert (siehe unten) |
| DB | **Supabase Postgres** (managed, EU-Hosting) |
| ORM | **Drizzle ORM** + Drizzle Kit Migrations |
| Object Storage | **Supabase Storage** (Video-Buckets) |
| Auth | **Supabase Auth** — im PoC mit **Mock-User-IDs** (3 Personas), keine echten Konten |
| KI | **Google AI Studio / Gemini** (multimodal: Text + Video), Anbindung via offizielles SDK (`@google/generative-ai`) |
| Validierung | **zod** (alle API-Eingaben & KI-Antworten) |
| Hosting | **Vercel** |
| PWA | manifest + Service Worker (installierbar, Offline-Hinweis) |

Alle Verbindungen **synchron via HTTPS** (Request/Response). **Bewusst NICHT im Scope:** Webhooks, Background-Job-Queues, Push-Notifications, echtes Bestandssystem (ReSy), Sachbearbeiter-Cockpit, produktive Auth. Nicht bauen.

---

## DESIGN-SYSTEM (originalgetreu aus `prototyp/styles.css`)

**Charakter:** frische Consumer-Fintech-Sprache (Richtung N26/Revolut) — klar, ruhig, vertrauensbildend. **Light & Dark umschaltbar.**

**Fonts:** `Geist` (UI) + `Geist Mono` (Zahlen, Vorgangsnummer, Beträge). Tabellenziffern (`font-feature-settings: "tnum"`).

**Farb-Tokens** (als CSS-Variablen / Tailwind-Theme anlegen):

*Dark (Default):*
- `--screen: #0B0F1A` · `--surface: #141B2B` · `--surface-2: #1B2336` · `--surface-3: #232C42`
- `--border: rgba(255,255,255,.08)` · `--text: #F3F6FB` · `--text-muted: #9AA5B8` · `--text-faint: #67728A`
- Akzent (Mint): `--accent: #1FD4A4` · `--accent-2: #14B98E` · `--accent-deep: #2FE3B3` · `--accent-ink: #03261C` · `--accent-soft: rgba(31,212,164,.14)` · `--accent-glow: rgba(31,212,164,.45)`
- `--danger: #FF5A63`

*Light:*
- `--screen: #EEF2F5` · `--surface: #FFFFFF` · `--surface-2: #F4F7FA` · `--surface-3: #EAEFF4`
- `--border: rgba(11,22,44,.09)` · `--text: #0C1322` · `--text-muted: #5A6577` · `--text-faint: #8A93A3`
- Akzent: `--accent: #10C18F` · `--accent-2: #0DA87C` · `--accent-deep: #0A8F69` · `--accent-ink: #FFFFFF` · `--accent-soft: rgba(16,193,143,.12)` · `--accent-glow: rgba(16,193,143,.40)`
- `--danger: #E5484D`

*Schadensgrade (themenunabhängig):* leicht `#2FC58F` · mittel `#E9A23B` · schwer `#F2683C` · Totalschaden `#E5484D`

**Radien:** sm 12 · md 18 · lg 26 · xl 34. **Buttons:** primär 56px Höhe, Radius 16, Akzent-Fill mit weichem Glow-Shadow; `:active` scale(.97).

**Avery-Orb** (Marken-Element): animierte, leuchtende Kugel — radialer Mint→Teal-Verlauf, rotierende conic-gradient-Shimmer, weicher Glow, Breathing-Animation. Zustände: `idle | thinking | speaking | listening` (bei thinking/listening pulsierende Ringe). Implementierung 1:1 aus `prototyp/avery.jsx` übernehmen (als React-Komponente).

**Motion:** lebendige, dezente Micro-Interactions; Entrance-Animationen **transform-basiert** (nie aus `opacity:0` halten, das blockiert die Sichtbarkeit). `prefers-reduced-motion` respektieren.

**Mobile-first:** echte Smartphone-Breite (max ~430px), Touch-Targets ≥ 44px. Im Prototyp ist alles in einem iPhone-Rahmen dargestellt — die **App selbst füllt die Viewport-Breite** (kein Geräterahmen im Produkt).

---

## SCREENS & FLOW (Quelle: `prototyp/` + Konzept FA-01…FA-08)

State-Machine: `start → chat → walk → review → success → status` (+ Seitenpfade: camera-denied → text-fallback; cancel-dialog).

1. **Start** (FA-01) — personalisierte Begrüßung „Hey {Name}, was liegt an?", Avery-Orb groß, Persona-/Theme-Umschalter, Policen-Karte (Wohnfläche, Versicherungssumme, Adresse, Police-Nr.), CTA „Schaden melden", ggf. Karte „Laufende Meldung".
2. **Avery-Chat** (FA-02) — Dialog, Schaden in eigenen Worten. Avery erkennt **Schadenstyp + Ursache**, antwortet empathisch, bietet „Foto-Walk starten". Sonderfälle: vager Input → Rückfrage; nicht abgedeckter Schaden (z. B. KFZ) → höfliche Erklärung. Verlauf persistiert.
3. **Foto-Walk** (FA-03/04/05/06) — Kamera-Berechtigung → Live-Viewfinder → Videoaufnahme (Timer, min. 2 s) → Upload → KI-Analyse → Ergebnis pro Raum (Raumtyp, Schadensgrad, Begründung). **Iterations-Loop:** liefert die KI `satisfied=false`, zeigt Avery eine gezielte Folgeaufforderung (`next_request`), max. 5 Iterationen. „Weiterer Raum?" → Loop. „Abbrechen" → Bestätigungsdialog. **Kamera verweigert** → Erklärscreen mit „neu anfragen" / „textbasiert beschreiben" (geführtes Q&A ohne Kamera).
4. **Review & Pauschal** (FA-07) — Schadenstyp/Ursache, Liste betroffener Räume (Fläche × Satz/m² = Betrag, entfernbar), Pauschal-Erklärung, **voraussichtliche Gesamtsumme** (groß, mono), „Schaden absenden" (Loading-State).
5. **Erfolg** (FA-07) — Bestätigung, **Vorgangsnummer `ADV-JJJJ-XXXX`** (kopierbar), „Status verfolgen" / „Zur Übersicht".
6. **Status** (FA-08) — Timeline mit 4 Stufen (`Eingegangen → In Bearbeitung → Geprüft → Abgeschlossen`), Zeitstempel, „Aktualisieren".

Genaue Copywriting-Texte, Abstände und Komponenten-Details aus dem Prototyp übernehmen.

---

## DATENMODELL (Supabase / Drizzle)

Lege Tabellen an (Namen aus dem Konzept):

- **`personas`** — id, name, full_name, initials, tenure (Seed: Leon, Robert, Julia)
- **`policies`** — id, persona_id (FK), living_area_m2, sum_insured, address, policy_no, active
- **`conversations`** — id, claim_id (FK, nullable), role (`user|avery`), content, intent (jsonb: schadenstyp, ursache), created_at
- **`walks`** — id, claim_id (nullable), status (`active|cancelled|completed|error_external_api`), iteration_count, created_at
- **`rooms`** — id, walk_id (FK), room_type, damage_grade (`leicht|mittel|schwer|total`), damage_kind, video_url, satisfied (bool), area_m2, rate_per_m2, amount, created_at
- **`claims`** — id, persona_id, policy_id, damage_type, cause, status (`eingegangen|bearbeitung|geprueft|abgeschlossen`), vorgangsnummer (`ADV-JJJJ-XXXX`, via Postgres-Sequenz), total_amount, created_at
- **`audit_logs`** — id, endpoint, request_hash, response_hash, created_at

**Storage-Bucket:** `walks` mit Pfad `walks/{walk_id}/{iteration}.webm`.

**Seed-Skript** für die 3 Personas inkl. Policen (realistische Demo-Werte: z. B. Leon 72 m²/65.000 €, Robert 118 m²/95.000 €, Julia 54 m²/48.000 € — siehe `prototyp/data.js`).

---

## API / TECHNISCHE USE CASES (TU-01…TU-06)

Als Next.js Route Handler, gegliedert in **API Gateway** (Routing + Auth-Check via Supabase JWT), **Analyse-Service** (Foto-Walk-Loop), **Valuation-Service** (Pauschal-Logik, reine TS-Funktion), **Prompt-Builder** (Gemini-Request-Assembly). Jede Antwort/Anfrage in `audit_logs` loggen. Alle Inputs & KI-Antworten mit **zod** validieren.

- **TU-01 `POST /api/session`** — Mock-User-ID → Persona + Police laden, Session-Objekt. 404 wenn keine Police.
- **TU-02 `POST /api/avery/message`** — Nachricht → Verlauf laden → Gemini (System-Prompt DE/Du + History) → Intent (Schadenstyp, Ursache) parsen → in `conversations` speichern. Bis zu 2 Retries (exponential backoff); nicht-parsbare Antwort → generische Avery-Antwort, kein Crash.
- **TU-03 `POST /api/walk/upload`** — Video (`multipart/form-data`) → Supabase Storage → URL in `rooms`. Aufnahmen < 2 s verwerfen; Upload-Retry.
- **TU-04 `POST /api/walk/analyze`** — multimodaler Gemini-Aufruf (System-Prompt + History + Video-Referenz), Timeout 30 s, 2 Retries. Antwort gegen **JSON-Schema** (`zod`) validieren: `{ room_type, damage_grade, damage_kind, satisfied: boolean, user_message: string, next_request?: string }`. Persistieren in `rooms`. Bei Fehler `walks.status = error_external_api`.
- **TU-05 `calcValuation()`** — Pauschalmethode (reine Funktion, keine I/O):
  - Pro Raum: `area_m2 × rate_per_m2`, Summe über alle Räume.
  - Sätze: **leicht 200 €/m² · mittel 450 €/m² · schwer 800 €/m²** (Default-Raumgrößen pro Raumtyp aus Config, z. B. Küche 9, Bad 6, Wohnzimmer 24, Flur 6 m²). Unbekannter Grad → Raum als „manuelle Prüfung" markieren, aus Auto-Berechnung ausschließen.
  - *(Hinweis: Das Konzept nennt an einer Stelle zusätzlich 80 €/m². Mit dem Auftraggeber final klären — Default = obige 3 Stufen, da konsistent zum Rechenbeispiel Küche 9 m² × 450 = 4.050 €.)*
- **TU-06 `POST /api/claims`** — atomare Transaktion: Vollständigkeit prüfen (≥1 Raum, gültige Police) → Vorgangsnummer aus Postgres-Sequenz (`ADV-JJJJ-XXXX`) → `claims` mit Status „Eingegangen" anlegen, `rooms` verknüpfen → Commit. 422 bei Validierungsfehler, sauberes Rollback bei Commit-Fehler, Retry-fähig (keine Duplikate).

---

## GEMINI-INTEGRATION (Details)

- **Dialog-Prompt (TU-02):** deutscher System-Prompt, Du-Format, empathisch & knapp. Aufgabe: aus Freitext **Schadenstyp** (Wasser/Feuer/Einbruch/Sturm) + **Ursache** extrahieren; bei Unklarheit Rückfrage; nicht-Hausrat-Fälle (KFZ etc.) freundlich ablehnen. Strukturierte Ausgabe (JSON) für Intent.
- **Vision-Prompt (TU-04):** multimodal, Video + Kontext (bisherige Räume/Iterationen). Ausgabe strikt nach obigem JSON-Schema. `satisfied` steuert den Loop; `next_request` muss **spezifisch** sein („zeig mir den Boden näher"), nicht generisch.
- Iterationszähler pro Walk persistieren, Loop bei 5 hart begrenzen (Notausgang mit Hinweis „Einschätzung basiert auf unvollständigen Daten").
- API-Key über `.env` (`GOOGLE_AI_API_KEY`), niemals committen.

---

## VORGESCHLAGENE PROJEKTSTRUKTUR

```
src/
  app/
    (pwa)/            # Screens: start, chat, walk, review, success, status
    api/
      session/route.ts
      avery/message/route.ts
      walk/upload/route.ts
      walk/analyze/route.ts
      claims/route.ts
  components/         # shadcn/ui + AveryOrb, ChatBubble, GradeBadge, Viewfinder, Timeline, ...
  lib/
    db/               # Drizzle schema, client, migrations, seed
    ai/               # gemini client, prompt-builder, schemas (zod)
    valuation/        # calcValuation + config (Saetze, Raumgroessen)
    supabase/         # client (server/browser), storage helpers
  styles/             # tokens (CSS-Variablen / Tailwind theme)
public/               # manifest.json, icons, sw.js
```

---

## ARBEITSWEISE (bitte iterativ in Milestones)

Arbeite in kleinen, lauffähigen Schritten und committe sinnvoll. Frag bei fachlichen Lücken nach, statt zu raten.

- **M0 — Setup:** Next.js 14 + TS + Tailwind + shadcn/ui, Design-Tokens als Tailwind-Theme, Geist-Fonts, `.env.example`, PWA-Grundgerüst (manifest + SW), Light/Dark-Toggle.
- **M1 — Design-System & Avery:** AveryOrb + Basis-Komponenten (Button, Card, ChatBubble, GradeBadge) 1:1 zum Prototyp.
- **M2 — Daten:** Supabase-Projekt, Drizzle-Schema + Migrations + Seed (3 Personas), Storage-Bucket.
- **M3 — Start + Session (FA-01/TU-01):** personalisierter Startscreen mit echten Stammdaten.
- **M4 — Avery-Chat (FA-02/TU-02):** Gemini-Dialog, Intent-Erkennung, Sonderfälle, Persistenz.
- **M5 — Foto-Walk (FA-03–06/TU-03/04):** Kamera (MediaRecorder), Upload, Vision-Analyse, Iterations-Loop, Kamera-verweigert + Text-Fallback, Abbruch.
- **M6 — Pauschal + Review (TU-05/FA-07):** Berechnung, Review-Screen, Raum entfernen.
- **M7 — Submit + Status (TU-06/FA-07/08):** Vorgangsnummer, Erfolg, Status-Timeline.
- **M8 — Politur & Tests:** Akzeptanzszenarien (s. u.), Fehlerzustände, Offline-Hinweis, Vercel-Deploy.

Nach jedem Milestone: kurz testen, kurz dokumentieren, weiter.

---

## AKZEPTANZKRITERIEN (aus Konzept 2.7 — als Tests umsetzen)

Mindestens je 1 Happy Path + 1 Alternativfall pro Use Case, z. B.:
- Persona Leon öffnet App → „Hey Leon" + korrekte Stammdaten; Wechsel zu Robert/Julia → jeweils korrekt; unbekannte ID → Fehlermeldung; Offline → Hinweis statt Absturz.
- „Wasserschaden durch Waschmaschine" → Typ+Ursache erkannt; „Mein Auto wurde zerkratzt" → höfliche Ablehnung; vager Input → Rückfrage; Reload → Verlauf wiederherstellbar.
- 1-Raum-Video → Grad „mittel"; mehrere Räume → korrekt zugeordnet; unscharfes Video → `satisfied=false` mit konkretem `next_request`; 5 Iterationen → kontrollierter Abschluss.
- Küche 9 m² × 450 €/m² = **4.050 €**; gemischte Räume → Einzelbeträge + Summe korrekt.
- 100 Einreichungen → 100 eindeutige Vorgangsnummern; Submit ohne Raum → 422.
- Status „Eingegangen" direkt nach Absenden; Statuswechsel → Timeline aktualisiert; unbekannte Nr. → freundlicher Hinweis.

---

## KONVENTIONEN

- TypeScript strict, ESLint + Prettier. Keine `any` in Domänenlogik.
- Alle API-Inputs **und** KI-Antworten mit zod validieren; Fehler kontrolliert (nie 500-Crash).
- Secrets nur über `.env` (Beispiel in `.env.example` dokumentieren).
- Deutsche UI-Texte, Du-Form; Tonalität wie im Prototyp.
- Barrierearm: Fokus-States, `aria-label`s, Touch-Targets ≥ 44px, `prefers-reduced-motion`.
- Kommentiere fachlich nicht-offensichtliche Stellen mit Bezug zur Use-Case-ID (FA-/TU-).

---

## START

1. Lies `Konzept_MST02.md` und sieh dir den Prototyp in `prototyp/` an (im Browser öffnen: `Advansure Prototyp.html`).
2. Bestätige kurz dein Verständnis und liste offene fachliche Fragen.
3. Beginne mit **M0** und arbeite die Milestones iterativ ab.
