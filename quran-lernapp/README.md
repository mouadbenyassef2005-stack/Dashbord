# Qaidah: Arabisch lesen lernen (Next.js 16 · React 19 · Tailwind 4)

Lektion 1 in vier kurzen Einheiten (Alif und ب ت ث · Fatha und Silben · Kasra und Damma · ā, Verbindung, erste Wörter). Jede Einheit durchläuft die sieben Lernphasen in kompakter Form und endet mit einer Entscheidung: weitergehen oder gezielt nachüben.

```bash
npm install
npm run dev                 # http://localhost:3000
npm test                    # 67 Tests: Inhalt, Aufgaben, Kompetenzen, Wiederholung, Speicherung
npm run typecheck && npm run lint && npm run build
node scripts/e2e-lektion.mjs http://localhost:3000 ./screenshots        # Browser-Durchlauf aller 4 Einheiten
npm run build:html          # eine einzelne HTML-Datei (offline, Audio eingebettet): arabisch-lektion-1.html
```

## Seiten
`/` Start · `/lektion` Einheiten und Phasen · `/ueben` Wiederholung nach Plan, Vergleichsübungen, freie Übung · `/profil` Kompetenzen und Zurücksetzen

## Aufbau
- `src/lektion/content`: Buchstaben, Items und Phonetik (`lektion1.ts`), die vier Einheiten (`units.ts`)
- `src/lektion/domain`: Aufgaben (`tasks.ts`), Kompetenzen und Stufen (`competence.ts`), Zustand und Wiederholungsplan (`state.ts`), Scheduler-Modell, Handschrift
- `src/lektion/audio` und `public/audio`: Manifest und Aufnahmen
- `src/lektion/features`, `ui`: Oberfläche; `lektion.css` ist das Design-System (nur unter `.qd`)
- Zustand: localStorage `qaidah.lektion.v2`, erst nach dem Mounten geladen

## Dokumentation (`docs/`)
`ANALYSE-UND-PLAN.md` · `AENDERUNGEN.md` (Begründungen mit Quellen) · `AUDIO-ASSETS.md` · `PHONETIK-PRUEFLISTE.md` · `USABILITY-TESTPLAN.md` · `OFFENE-PUNKTE.md`

## Fachliche Regeln
- Alif ist hier Dehnungsbuchstabe und Nicht-Verbinder, kein Konsonant.
- Kontextformen nie per `font-feature-settings: init/medi/fina` erzwingen.
- Wörter in Pausalform (Hinweis in der App); Sukun und Endvokale folgen später.
- Hörübungen gibt es nur für Items mit Aufnahme. Fehlt eine, zeigt die App „Audio noch nicht verfügbar“.

## Stand
Technisch getestet (Unit- und Browser-Tests). **Nicht** nutzergetestet, **nicht** muttersprachlich geprüft, Lernerfolg **nicht** nachgewiesen. Siehe `docs/OFFENE-PUNKTE.md`.
