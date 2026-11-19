# QAIDAH – Arabische Schrift lesen und schreiben (Erwachsene)

Stand: **M0–M3-Kern** (siehe Roadmap). Eigenständig neben `../quran-lernapp` (anderes Produkt, unverändert).

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
**Noch nicht vorhanden:** Handschrift (M4), echte Audioaufnahmen (keine Dateien; Buttons sagen das), Aufnahme/Vergleich, Kontextform-Übungen, Silben/Wörter, PWA, Gamification (XP).
Aussprache: keine automatische Bewertung, keine Scores (`platform/pronunciation.ts` ist nur die Schnittstelle).

## Lernstand
- Arabisch-Inhalte (Namen, Ausspracheanleitungen, Beispielwörter) sind **nicht fachlich abgenommen**.
- Nicht auf Kontextformen per `font-feature-settings: init/medi/fina` verlassen: das zerstört das Shaping (E2E-Regressionstest vorhanden).
