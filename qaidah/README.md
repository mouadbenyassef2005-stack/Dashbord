# QAIDAH – Arabische Schrift lesen und schreiben (Erwachsene)

Stand: **M0–M3-Kern + M4-Start (Schreiben für ا ب ت ث)**. Eigenständig neben `../quran-lernapp` (anderes Produkt, unverändert).

```bash
npm install
npm run dev          # http://localhost:5173
npm test             # Lernlogik, Inhalte, Persistenz (Vitest)
npm run build && npx vite preview --port 4173 &
npm run e2e -- http://localhost:4173 ./screenshots   # Playwright, echter Browser
```

## Architektur
`src/domain` (reine Logik, ohne React) · `src/content` (Daten) · `src/persistence` (IndexedDB-Ereignislog) · `src/platform` (Audio, Aussprache-Schnittstelle) · `src/features`, `src/ui`.

- **Mastery** (`domain/mastery.ts`): gemeistert erst bei ≥3 richtigen Abrufen, ≥2 Aufgabenarten, ≥2 Tagen, Stabilität ≥6 Tage, letzter Versuch richtig, bei Schreiben/Formen/Lesen mit freiem Abruf. Aussprache (Selbsteinschätzung) erreicht nie „gemeistert“. Schwellen sind **Startwerte, nicht kalibriert**. Reine Erkennung braucht bei perfekten Antworten rund 100+ Tage bis „gemeistert“ (bewusst streng).
- **Scheduler** (`domain/scheduler.ts`): FSRS-ähnlich, eigene Implementierung, Konstanten ungetuned.
- **Zustand** entsteht aus dem Ereignislog (`persistence/eventStore.ts`), JSON-Export/-Import.

## Was ist echt, was fehlt
Umgesetzt und getestet: 28 Buchstaben, Einführung, 3 Aufgabenarten (Erkennen, Laut zuordnen, Ähnliche unterscheiden) mit Wiederholung nach Fehler, Planer, Persistenz, Export/Import/Reset, Hell/Dunkel, Prüfseite `#/specimen`.
## Schreiben (M4-Start)
`domain/handwriting/`: Strichaufnahme per Pointer Events (`ui/WritingPad.tsx`), Trennung Körper/Punkte, Formvergleich (größen-/positionsunabhängige Chamfer-Distanz), Punktanzahl und -lage (oben/unten), Schreibrichtung, Rangfolge fürs freie Schreiben (Zielbuchstabe muss klar bester Treffer sein).
- Templates (`templates.ts`) gibt es erst für **ا ب ت ث**; sie sind **selbst entworfene, vereinfachte Skelette** ohne fachliche Abnahme.
- Tests (`tests/handwriting.test.ts`) nutzen **synthetisch verrauschte Eingaben aus denselben Templates**: sie belegen die Mechanik, **nicht** die Praxistauglichkeit mit echter Handschrift. Schwellen (`TH`) sind ungeeicht.
- Kalibrierung: `#/labor` sammelt echte Striche (gut/schlecht) lokal und exportiert JSON.
- Nachzeichnen zählt als Nachweis „Erkennen“, freies Schreiben ohne Vorlage als „Produktion“. Zu kleine/leere Eingaben erzeugen kein Ereignis. Überspringen ist jederzeit möglich.
- E2E: `node scripts/e2e-write.mjs` (echte Mausereignisse).

**Noch nicht vorhanden:** Schreiben für ب-Familie hinaus (24 weitere Buchstaben), Kontextformen schreiben, echte Audioaufnahmen (keine Dateien; Buttons sagen das), Aufnahme/Vergleich, Kontextform-Übungen, Silben/Wörter, PWA, Gamification (XP).
Aussprache: keine automatische Bewertung, keine Scores (`platform/pronunciation.ts` ist nur die Schnittstelle).

## Lernstand
- Arabisch-Inhalte (Namen, Ausspracheanleitungen, Beispielwörter) sind **nicht fachlich abgenommen**.
- Nicht auf Kontextformen per `font-feature-settings: init/medi/fina` verlassen: das zerstört das Shaping (E2E-Regressionstest vorhanden).
