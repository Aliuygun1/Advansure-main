# Handoff-Paket — Advansure 2.0 → Claude Code

Dieses Paket befähigt Claude Code (in VS Code), die Produktiv-App umzusetzen.

## Inhalt

| Datei / Ordner | Zweck |
|---|---|
| **`PROMPT.md`** | **Der eigentliche Auftrag.** Kompletten Inhalt in Claude Code als ersten Prompt einfügen. |
| `Konzept_MST02.md` | Vollständiges fachliches/technisches Konzept (MST02) — verbindliche Quelle der Wahrheit. |
| `prototyp/` | Klickbarer HTML/React-Prototyp = **pixel-genaue visuelle & UX-Referenz** (kein Produktionscode). |

## So gehst du vor

1. Lege ein neues, leeres Projektverzeichnis an und öffne es in VS Code.
2. Kopiere diesen `claude_code_handoff/`-Ordner mit hinein (oder lege die Dateien an einen Ort, auf den Claude Code zugreifen kann).
3. Öffne `prototyp/Advansure Prototyp.html` einmal im Browser, um Look & Flow zu sehen.
4. Starte Claude Code und füge den **kompletten Inhalt von `PROMPT.md`** als ersten Auftrag ein.
5. Claude Code bestätigt das Verständnis, stellt offene Fragen und arbeitet die Milestones (M0–M8) iterativ ab.

## Hinweis

Die Dateien im `prototyp/` sind **Design-Referenzen in HTML** — sie zeigen das angestrebte Aussehen und Verhalten, sind aber nicht zum direkten Kopieren gedacht. Aufgabe ist, diese Designs im definierten Produktiv-Stack (Next.js 14, TypeScript, Tailwind, shadcn/ui, Supabase, Gemini) originalgetreu nachzubauen.
