# Qaidah: Arabisch lesen lernen (Next.js 16 · React 19 · Tailwind 4)

Eine Lektion, sieben Lernphasen: Lektion 1 vermittelt Alif (ا), Bā (ب), Tā (ت), Thā (ث) sowie Fatha, Kasra und Damma.

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # Lernlogik, Inhalte, Handschrift (Vitest)
npm run typecheck && npm run lint && npm run build
node scripts/e2e-lektion.mjs http://localhost:3000 ./screenshots   # Browser-Durchlauf aller Phasen
```

## Seiten
`/` Start · `/lektion` die sieben Phasen · `/ueben` gemischte Übung (ab Phase 4) · `/profil` Fortschritt und Zurücksetzen.

## Aufbau
- `src/app`: Routen, `globals.css` (Farben, Schrift)
- `src/components`: App-Rahmen, UI-Bausteine
- `src/lektion/content`: Buchstaben, Vokale, Inhalt von Lektion 1
- `src/lektion/domain`: reine Logik (Aufgaben, Zustand, Scheduler, Handschrift-Auswertung)
- `src/lektion/features`, `ui`: Oberfläche der Lektion; `lektion.css` gilt nur unter `.qd`
- Zustand: localStorage `qaidah.lektion1.v1`, erst nach dem Mounten geladen (kein Hydration-Fehler)

## Phasen
1 Orientierung · 2 Entdecken · 3 Hypothesen (Productive Failure) · 4 Verstehen · 5 Anwenden (Transfer, Interleaving) · 6 Abrufen · 7 Festigen (Spaced Repetition mit simulierter Zeit).

## Fachliche Regeln
- Alif ist hier Dehnungsbuchstabe und Nicht-Verbinder, kein Konsonant.
- Kontextformen nie per `font-feature-settings: init/medi/fina` erzwingen.
- Wörter in Pausalform; Sukun folgt später.
- Offen: Sprecher-Aufnahmen fehlen, Inhalte nicht fachlich abgenommen, Scheduler- und Schreib-Schwellen ungeeicht.
