> **Hinweis:** Dieses Dokument beschreibt die Version 2 (Einheiten × 7 Phasen). Die Oberfläche wurde durch den Lernpfad aus kurzen Mini-Lektionen ersetzt, siehe `LERNPFAD-V3.md`. Die Analyse der Befunde und die Domänenlogik gelten weiter.

# Analyse der bestehenden App und Umsetzungsplan

Stand der Analyse: Zustand der App vor dieser Überarbeitung (Lektion 1 als eine lange Folge von sieben Phasen).
Alles unter „Umsetzung“ ist im Code umgesetzt und durch Unit-Tests und einen Browser-Durchlauf geprüft (siehe Abschnitt „Prüfstatus“). Nichts davon ist mit echten Lernenden getestet.

## 1. Ist-Zustand (gefundene Probleme)

| # | Befund | Schwere |
|---|---|---|
| 1 | Alle Inhalte (4 Buchstaben, 3 Vokale, ā, Verbindung, Wörter, Schreiben) in **einer** Durchlaufstrecke, ohne Zwischenentscheidung | kritisch (Dosierung) |
| 2 | Hypothesenaufgaben verlangten, unbekannte Vokalzeichen zu **erraten** (a/i/u ohne ableitbare Information) | kritisch (Didaktik) |
| 3 | Audio-Schnittstelle vorhanden, aber **keine Aufnahmen**; Buttons führten ins Leere bzw. zeigten nur eine Meldung | kritisch |
| 4 | Aussprachehilfen unscharf: Kasra über „Lippen breit“, Damma nur über Lippen, ث ohne Zungenposition | kritisch (fachlich) |
| 5 | Wörter und „vollständig vokalisiert“: Pausalform wurde nicht transparent erklärt | hoch |
| 6 | Ein Fortschrittsmodell: Phasen-Abschluss und ein Wiederholungsplan pro Item, **nicht pro Kompetenz** | hoch |
| 7 | Keine Reaktion auf Fehlermuster (z. B. ب/ت-Verwechslung) | hoch |
| 8 | Lineare Phasenfolge, Phasen gesperrt | mittel |
| 9 | Fortschrittsbalken zählte abgeschlossene Phasen, nicht Können | hoch (irreführend) |
| 10 | Merkhilfen (Boot und Anker usw.) blieben dauerhaft | mittel |
| 11 | Kontrast von `muted`, `warn`, `gold` unter WCAG AA (3,8 bis 4,1:1) | mittel |
| 12 | Kein Usability-Testplan, keine Dokumentation der Begründungen | mittel |

## 2. Priorisierte Änderungsliste und Status

**Priorität 1: kritische Lernprobleme**
- [x] Echte Aufnahmen integriert (13 Dateien), Audio-Komponenten, ehrliche Zustände (`src/lektion/audio`, `ui/AudioPlayer.tsx`)
- [x] Phonetik überarbeitet (`content/lektion1.ts`: `VOWEL_INFO`, `ARTICULATION`), **nicht** muttersprachlich geprüft
- [x] Stoff in vier Einheiten geteilt (`content/units.ts`)
- [x] Hypothesenaufgaben aus Bekanntem ableitbar umgebaut, Auflösung mit Ableitung und Fehlannahme
- [x] Schreibweisen und Wörter geprüft und Pausalform transparent gemacht (**nicht** muttersprachlich geprüft)

**Priorität 2: Lernerfolg**
- [x] Sieben Kompetenzen in vier Bereichen, getrennt gemessen (`domain/lektion/competence.ts`)
- [x] Wiederholungsplan pro Item **und** Kompetenz (`state.ts`: `applyToPlan`)
- [x] Fehlermuster erkennen, gezielte Vergleichsübung mit Nachtest (`features/Remedial.tsx`)
- [x] Einheiten-Entscheidung statt erzwungener Linearität (`features/phases2.tsx`: `P6`)
- [x] Fortschritt als Kompetenzstand statt Phasenzähler (`features/Board.tsx`)

**Priorität 3: UI und UX**
- [x] Mobile-first, klare Hierarchie (Einheit → Phase → Schritt), eine Haupthandlung je Schritt
- [x] Feedback mit Text und Symbol statt nur Farbe, Hinweise, Rücksprung zur Erklärung
- [x] Merkhilfen werden abgebaut (4 Stufen)
- [x] Kontraste korrigiert, Fokus, Touch-Ziele 48 px, reduzierte Bewegung
- [x] Gescoptes Design-System in `src/lektion/lektion.css` (Tokens, Komponenten, Zustände)

**Priorität 4: Qualitätssicherung**
- [x] 67 Unit-Tests, Browser-Durchlauf aller vier Einheiten (Server und Einzeldatei)
- [x] Usability-Testplan (`USABILITY-TESTPLAN.md`), **nicht durchgeführt**
- [x] Änderungsdokumentation mit Quellen (`AENDERUNGEN.md`)
- [x] Offene Punkte (`OFFENE-PUNKTE.md`)

## 3. Architektur nach der Überarbeitung

```
src/lektion/
  audio/            Manifest, Player, URL-Auflösung (Einzeldatei ersetzt urls.ts)
  content/          letters, vowels, lektion1 (Items, Phonetik, Wörter), units (4 Einheiten × 7 Phasen)
  domain/           scheduler (Modell), handwriting, lektion/{tasks,competence,state}
  features/         LektionPage, UnitFrame, phases1/2, guided, explain, blocks, Board, Remedial, Practice, Profil, Start
  ui/               AudioPlayer, SpeakCompare, WritingPad, WriteTask, parts
  lektion.css       Design-System (gescoped auf .qd)
public/audio/       Aufnahmen
```

Die Sieben-Phasen-Architektur bleibt als Gerüst **pro Einheit** erhalten (kompakt statt einmal lang).

## 4. Prüfstatus (was wirklich geprüft wurde)

| Art | Status |
|---|---|
| Technische Tests (Vitest) | 67 Tests grün: Inhalt/Orthografie, Aufgabenlogik, Kompetenz-Trennung, Stufen, Verwechslungen, Entscheidung, Simulation, Speicherung, Einheiten-Progression |
| Browser-Durchlauf (Playwright, Chromium) | Alle 4 Einheiten durchgespielt; Audioaufruf, Navigation, Gating und Überspringen, Kompetenzbereiche, Verwechslungs-Drill, Merkhilfe-Stufen, Neuladen, Tastaturfokus, kein horizontales Scrollen (390 px), Einzeldatei per `file://` |
| Expertenbewertung | Durch uns, anhand von Heuristiken und Literatur (siehe `AENDERUNGEN.md`); **keine unabhängige Expertise** |
| Nutzertests mit Lernenden | **nicht durchgeführt** |
| Muttersprachliche Prüfung von Aussprache, Wörtern, Aufnahmen | **nicht durchgeführt** |
| Nachgewiesener Lernerfolg | **nicht nachgewiesen** |
