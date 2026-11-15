# Qaidah – Quran lesen lernen (MVP, Stage 1)

Interaktive, sprachbasierte Lern-App für Anfänger: vom ersten Buchstaben bis zu kurzen Suren.
Umgesetzt ist **Stage 1 (Lesen lernen, Qaidah-Nuraniyyah-inspiriert)**. Stage 2/3 (Tajweed) erscheinen nur als „In Planung“.

> **Ehrlichkeitsregel:** Das Sprachfeedback ist in diesem MVP **simuliert** und überall als *DEMO · simuliert* gekennzeichnet.
> Geprüft wird nur, ob überhaupt gesprochen wurde (Dauer/Pegel). Referenzaudio ist ein **Platzhalter-Ton** – es gibt keine KI-Stimme für Quran-Text.

## Starten

```bash
npm install
npm run dev            # http://localhost:3000
npm test               # Vitest: Inhalte, Lernlogik, Fortschritt, Demo-Analyse
npm run build && npm start -- -p 3100 &
node scripts/e2e.mjs http://localhost:3100 ./screenshots   # Playwright: spielt Onboarding + ALLE Lektionen mit Fake-Mikrofon durch
```

Mikrofon braucht `https://` oder `localhost`. Ohne Mikrofon gibt es die Selbsteinschätzung („Sicher gelesen / Noch unsicher“).

## Fünf Hauptbereiche

| Bereich | Route | Inhalt |
|---|---|---|
| **Home** | `/` | Nächster Schritt, Tagesziel + 3 tägliche Missionen, persönliche Übung, Wochenziel, Kompetenz, Streak/XP |
| **Lernpfad** | `/pfad` | 10 Einheiten, 29 Lektionen, Freischaltung der Reihe nach (mit „Trotzdem öffnen“), Sicherheit je Lektion, Stage-2/3-Vorschau |
| **Lesetraining** | `/training` | Persönliche Übung (adaptiv), unbekannte Wörter lesen (Transfer), unsichere Stellen, Wochenziel, Passagen, **Fehlerhistorie**; Unterseite `/woerter` (Wortdatenbank) |
| **Erfolge** | `/erfolge` | Lesestufe (aus sicherem Können), Streak/Rekord, XP, 12 Abzeichen mit Fortschritt, 7-Tage-Aktivität |
| **Profil** | `/profil` | Name, Ziele, Lernstand je Einheit, Buchstaben-Raster, Fehlerstellen, Einstellungen, „Was ist Demo?“, Reset |

Dazu: `/onboarding` (Einstufung) und `/lektion/[id]` – die **interaktive Lektion** (Intro mit Lernziel → Anhören → Sprechen → Feedback → Wiederholen → Weiter).
Dynamische Lektionen: `/lektion/personal`, `/lektion/transfer`, `/lektion/flagged`.

## Lern- und Interaktionssystem (Duolingo-/Tarteel-inspiriert, eigene Umsetzung)

- **Kurze Lektionen, sofortiges Feedback, Tagesziel, Streak, Missionen, XP** – dezent, ohne Herzen, ohne Sperren durch Fehler. Fehler → motivierender Hinweis + „Teil anhören“ + „Nochmal üben“.
- **Kompetenz statt Aktivität:** XP zählen Fleiß. Die *Lesestufe* und die Lektions-„Sicherheit“ basieren nur auf Items, die mehrfach richtig gelesen wurden (Leitner-Box ≥ 3). Ein bloßes Durchklicken hebt sie nicht an.
- **Adaptive Engine** (`src/lib/adaptive.ts`): bewertet jedes geübte Item nach Fälligkeit, Fehlerquote, Box, Markierung und Fehler-Buchstaben und zeigt je Übung die **Begründung** („Zur Wiederholung fällig“, „Enthält Fehlerstelle Thā“).
- **Transfer:** unbekannte Quran-Wörter aus Suren außerhalb des Lernpfads (106, 105, 113, 114, 110, 109), nur mit Buchstaben, die der Nutzer kennt – Ziel: selbstständiges Lesen.
- **Fehlerhistorie & Markierung:** jeder bewertete Versuch wird mit Quelle (`demo` / `self` / `live`) gespeichert; Items lassen sich als unsicher markieren, die Markierung fällt weg, sobald sie sicher sitzen.
- **Persönliche Ziele:** Tagesziel (Übungen) und Lesetrainingsziel (neue Lese-Einheiten pro Woche).
- **Ehrlichkeit:** Fehlererkennung ist weiterhin die **Demo-Simulation** (überall markiert). Sobald ein `LiveAnalyzer` (`simulated:false`) angebunden ist, fließen dessen Segmente unverändert in Fehlerhistorie, Fehlerstellen und adaptive Auswahl ein.
- Keine Kopie fremder Designs/Inhalte: Name, Optik, Texte und Mechaniken sind eigene Umsetzungen.

## Verständnis-Check & weitere Lernmethoden

- **Verständnis-Check nach jeder Lektion** (`CheckFlow`): 5 abwechslungsreiche Fragen aus dem Lektionsstoff, ohne Mikrofon. Bestanden ab 60 %; Wiederholen beliebig oft mit neuen Fragen. Falsche Stellen werden automatisch als unsicher vorgemerkt und landen in den persönlichen Übungen. „Später fortfahren“ blockiert nie – die Lektion bleibt dann mit „Check noch offen“ im Lernpfad markiert und lässt sich dort nachholen (`/lektion/check-<ID>`). XP-Bonus für die Lektion gibt es erst mit bestandenem Check.
- **Fragearten** (`src/lib/quiz.ts`): *Lesen* (Lautschrift wählen), *Schreibweise erkennen* (Arabisch wählen), *Buchstaben-Detektiv* (gesuchten Buchstaben im Wort antippen), *Wort bauen* (Teile von rechts nach links zusammensetzen).
- **Spiele & Tests** (`/spiele/…`, erreichbar im Lesetraining): **Buchstaben-Memory** (Buchstabe ↔ Name oder Form; schwächere Buchstaben kommen bevorzugt dran, keine Zeitwertung), Misch-Quiz, Buchstaben-Detektiv, Wörter bauen. Fehlgriffe fließen in Fehlerstatistik und adaptive Auswahl ein.
- Quiz-/Memory-Ergebnisse zählen als *Erkennen* (Quelle `quiz` in der Fehlerhistorie) und stärken die Wiederholungsplanung, zählen aber nicht als „neu gelesen“ im Wochenziel.

## Architektur (Inhalt ↔ Logik ↔ UI getrennt)

```
src/content/        Lerninhalte (reine Daten + Builder)
  letters.ts          28 Buchstaben, Formen, Zeichen (Harakat), Ausspracheanleitungen
  lessons.ts          Curriculum: Einheiten + Lektionen + Übungen
  quran.ts            Wortdatenbank, aus generated/quran-source.json abgeleitet
  generated/          von scripts/build-quran-data.mjs erzeugt (nie von Hand editieren)
src/lib/            Lernlogik (UI-frei, getestet)
  engine.ts           Lektions-Session: Warteschlange, „später“, Genauigkeit
  progress.ts         Fortschrittsmodell v2, Freischaltung, Leitner, Streak, XP, Historie, Markierungen, Wochenziel
  adaptive.ts         Persönliche Übung, Transfer-Wörter, unsichere Stellen
  missions.ts         Tägliche Missionen (datumsstabil)
  achievements.ts     Kompetenz-Level + Abzeichen (abgeleitet, nichts doppelt gespeichert)
  store.ts            Persistenz (localStorage, useSyncExternalStore, versioniert `v:1`)
  arabic.ts           Zerlegung in Buchstabe+Zeichen, Schwierigkeitsgrad
  recorder.ts         Mikrofon (getUserMedia, MediaRecorder, Pegel) – nur lokal
  audio.ts            Referenzaudio-Wiedergabe (Datei oder Platzhalter)
  analysis/           PronunciationAnalyzer-Schnittstelle + DemoAnalyzer
src/components/     UI (Lektions-Player, ReadStep/ChooseStep, Consent-Dialog, Primitives)
src/app/            Next.js App Router Seiten
```

### Echte Sprachanalyse später einbauen
`src/lib/analysis/types.ts` definiert `PronunciationAnalyzer.analyze({item, signal, attempt}) → AnalysisResult`.
`getAnalyzer()` in `analysis/index.ts` ist die einzige Stelle, die die Implementierung wählt. Ein `LiveAnalyzer` sendet
`signal.blob` an eine API-Route (ASR + Forced Alignment/GOP je Buchstabe+Zeichen) und liefert `segments[]` im gleichen Format.
UI, Fehlerstatistik und Wiederholungslogik bleiben unverändert. Ergebnisse mit `simulated:false` blenden das Demo-Label automatisch aus.

### Referenzaudio einbinden
Menschliche, geprüfte Aufnahmen (Qāriʾ/Lehrer) als Dateien unter `public/audio/…` ablegen und im Item `audioUrl` setzen
(`ReadItem.audioUrl`, `QuranWord.audioUrl`). Fehlt `audioUrl`, spielt die App den Platzhalter-Ton und sagt das offen dazu.
Empfehlung: ein Sprecher, einheitliches Studio-Setup, 1 Datei je Item (Buchstabe, Silbe, Wort, Ayah) + optional Segment-Marker für „Teil anhören“.

## Quran-Text & Quellen
- Arabisch (Uthmani): npm-Paket `quran-json@3.1.2` (Daten: The Noble Qur’an Encyclopedia), Transliteration: Tanzil.net – Lizenz **CC BY-SA 4.0**.
- Nichts wurde von Hand getippt: `npm run data` erzeugt `quran-source.json` für Sure 1, 112, 108, 103 (Lernpfad) sowie 106, 105, 113, 114, 110, 109 (Transfer) (Fundstelle Sure:Ayah:Wort).
- Wortweise Transliteration nur, wenn Wortzahl von Arabisch und Transliteration exakt übereinstimmen; Tanzils „AA“ wird zu „ʿ“.
- Die Zählung der Fatiha folgt der Quelle (Basmala = Ayah 1, insgesamt 7 Ayat).
- **Vor Produktivstart:** Text gegen eine zweite, kollationierte Mushaf-Quelle prüfen lassen (Fachperson).
- Übungsbuchstaben/-silben/-wörter in den frühen Einheiten (Einheiten 1–8) sind **eigene Übungsinhalte** und keine Quran-Zitate; echte Quran-Wörter stehen erst ab Einheit 9.

## Technische Annahmen
1. Next.js 16 (App Router) + TypeScript + Tailwind 4; Schrift Amiri Quran (self-hosted via Fontsource, kein Google-Fonts-Request).
2. Kein Backend im MVP; Fortschritt liegt im `localStorage` (Schlüssel `qaidah.progress.v1`). Später: Konto + Sync, Modell ist bereits versioniert.
3. Wiederholung: einfache Leitner-Boxen (0–4 mit 0/1/3/7/14 Tagen); „sicher“ ab Box 3.
4. Demo-Bewertung: deterministisch; ca. jedes vierte Item schlägt im 1. Versuch fehl (damit Fehlerhinweis & Wiederholen testbar sind), im 2. Versuch immer bestanden.
5. Lesegenauigkeit vor Tempo: keine Zeitwertung. Lautschrift ist optional (Einstellung / Tipp auf die Karte).
6. Hochgestelltes Sukoon nutzt die Mushaf-Form (U+06E1), identisch zu den Quran-Daten.
7. Buchstabennamen und Aussprachetipps sind deutschsprachige Lernhilfen und sollten von einer Lehrkraft gegengelesen werden.
