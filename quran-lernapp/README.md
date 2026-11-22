# Qaidah: Arabisch lesen lernen (Next.js 16 · React 19 · Tailwind 4)

Geführter Lernpfad für Anfänger in vier Strecken: **1 Buchstaben** (Alif, Bā, Tā, Thā) → **2 Tashkeel** (Fatha, Kasra, Damma einzeln) → **3 Buchstabe + Tashkeel** (ب, dann ت und ث) → **4 Silben festigen**. 23 Mini-Lektionen à 2 bis 4 Minuten, eine Aufgabe pro Bildschirm. Wörter, lange Vokale und Verbindungen sind nicht Teil dieses Pfads (aufbewahrt für später).

```bash
npm install
npm run dev                 # http://localhost:3000
npm test                    # 80 Tests: Inhalt, Pfad-Grenzen, Aufgaben, Kompetenzen, Wiederholung, Speicherung
npm run typecheck && npm run lint && npm run build
node scripts/e2e-lektion.mjs http://localhost:3000 ./screenshots        # Browser-Durchlauf des gesamten Pfads (45 Prüfungen)
npm run build:html          # eine einzelne HTML-Datei (offline, Audio eingebettet): arabisch-lektion-1.html
```

## Seiten
`/` Lernpfad (Lektionen öffnen als Vollbild) · `/ueben` Wiederholung nach Plan, Vergleichsübungen, freie Übung · `/profil` Kompetenzen und Zurücksetzen

## Aufbau
- `src/lektion/content`: Lernpfad (`path.ts`), Buchstaben/Items/Phonetik (`lektion1.ts`), aufbewahrtes Material für später (`later/`)
- `src/lektion/domain`: Aufgaben (`tasks.ts`), Kompetenzen und Stufen (`competence.ts`), Zustand und Wiederholungsplan (`state.ts`), Scheduler-Modell, Handschrift
- `src/lektion/audio` und `public/audio`: Manifest und Aufnahmen
- `src/lektion/features` (`Start` = Lernpfad, `play/` = Lektions-Player), `ui`: Oberfläche; `lektion.css` ist das Design-System (nur unter `.qd`)
- Zustand: localStorage `qaidah.lektion.v3`, erst nach dem Mounten geladen

## Dokumentation (`docs/`)
`LERNPFAD-V3.md` (aktuell: Struktur, Entferntes/Aufbewahrtes, offene Probleme) · `ANALYSE-UND-PLAN.md` · `AENDERUNGEN.md` (Begründungen mit Quellen) · `AUDIO-ASSETS.md` · `PHONETIK-PRUEFLISTE.md` · `USABILITY-TESTPLAN.md` · `OFFENE-PUNKTE.md`

## Fachliche Regeln
- Alif ist hier Dehnungsbuchstabe und Nicht-Verbinder, kein Konsonant.
- Kontextformen nie per `font-feature-settings: init/medi/fina` erzwingen.
- Wörter, lange Vokale und Verbindungen gehören nicht in den ersten Pfad.
- Hörübungen gibt es nur für Items mit Aufnahme. Fehlt eine, zeigt die App „Audio noch nicht verfügbar“.

## Stand
Technisch getestet (Unit- und Browser-Tests). **Nicht** nutzergetestet, **nicht** muttersprachlich geprüft, Lernerfolg **nicht** nachgewiesen. Siehe `docs/OFFENE-PUNKTE.md`.
