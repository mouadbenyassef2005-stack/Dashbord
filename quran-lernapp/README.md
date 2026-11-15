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

## Bildschirme

| Route | Inhalt |
|---|---|
| `/onboarding` | Begrüßung, 5-Fragen-Einstufung (oder überspringen), Niveauwahl, Tagesziel |
| `/` | Dashboard: nächster Schritt, Stage-1-Fortschritt, Tagesziel, Wiederholung, gelernte Inhalte |
| `/pfad` | Visueller Lernpfad: 10 Einheiten, 29 Lektionen, Sperr-/Abschlussstatus, Stage-2/3-Vorschau |
| `/lektion/[id]` | **Interaktive Lektion**: Intro mit Lernziel → Anhören → Sprechen → Feedback → Wiederholen → Weiter |
| `/lektion/review` | Dynamische Wiederholung fälliger/schwieriger Übungen |
| `/fortschritt` | Lektionen je Einheit, Buchstaben-Raster, Wörter, Fehlerstellen, Wiederholungsbedarf, 7-Tage-Aktivität |
| `/woerter` | Wortdatenbank (Uthmani, Transliteration, Fundstelle, Buchstaben/Harakat, Schwierigkeit, Audio-Status, Lernstatus) |
| `/einstellungen` | Lautschrift, Mikrofon-Einwilligung, Testmodus „alle freischalten“, Tagesziel, Reset, Quellen |

## Architektur (Inhalt ↔ Logik ↔ UI getrennt)

```
src/content/        Lerninhalte (reine Daten + Builder)
  letters.ts          28 Buchstaben, Formen, Zeichen (Harakat), Ausspracheanleitungen
  lessons.ts          Curriculum: Einheiten + Lektionen + Übungen
  quran.ts            Wortdatenbank, aus generated/quran-source.json abgeleitet
  generated/          von scripts/build-quran-data.mjs erzeugt (nie von Hand editieren)
src/lib/            Lernlogik (UI-frei, getestet)
  engine.ts           Lektions-Session: Warteschlange, „später“, Genauigkeit
  progress.ts         Fortschrittsmodell, Freischaltung, Leitner-Wiederholung, Streak, Fehlerstatistik
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
- Nichts wurde von Hand getippt: `npm run data` erzeugt `quran-source.json` für Sure 1, 112, 108, 103 (Fundstelle Sure:Ayah:Wort).
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
