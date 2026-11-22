# Lernpfad V3: kurze Mobile-Lektionen (Stand dieser Überarbeitung)

Diese Version ersetzt die Phasen-Oberfläche der Version 2 („Einheit × 7 Phasen“) durch einen geführten Lernpfad aus kurzen Mini-Lektionen mit **einer Aufgabe pro Bildschirm**. Domänenlogik (Kompetenzen, Wiederholungsplan, Verwechslungs-Erkennung, Audio) bleibt erhalten.

## 1. Der erste Lernpfad (verbindliche Reihenfolge)
| Strecke | Mini-Lektionen (ca. 2 bis 4 Min.) | Inhalt |
|---|---|---|
| **1 Buchstaben** | Alif · Bā · Tā · Thā (je Einführung) · Entdecken · Erklären · Anwenden · Wiederholung (8) | Vier Zeichen erkennen, hören, unterscheiden. **Keine** Tashkeel, Silben, Wörter. Je Einführung ein Buchstabe; die Familie ب ت ث erscheint erst danach. |
| **2 Tashkeel** | Fatha · Kasra · Damma (je eigene Mini-Lektion) · Wiederholung (4) | Zeichen **ohne Buchstaben**: Aussehen → Lage → Bedeutung → Laut hören → wiedererkennen. |
| **3 Buchstabe + Tashkeel** | ب mit den drei Zeichen · Entdecken · Erklären · ت · ث · Wiederholung (6) | Zuerst nur ب (ba, bi, bu), danach ت und ث. Erst Wiedererkennen und Zuordnen, dann Hörübungen. |
| **4 Silben festigen** | Silben lesen · hören · Schrift und Laut · Neue Kombinationen · Fehler gezielt wiederholen (5) | Gemischte kurze Silben, Hören, Zuordnen, neue Kombinationen (mit freier Eingabe), Fehler nach Lernstand. |

Insgesamt 23 Lektionen. Die nächste Lektion ist hervorgehoben, gesperrte lassen sich mit Hinweis („Trotzdem öffnen“) bewusst öffnen.

## 2. Hypothesen, Erklären, Anwenden als eigene Lektionen
| Typ | Strecke 1 (Punkte-Regel) | Strecke 3 (Konsonant + Zeichen) |
|---|---|---|
| **Entdecken und Hypothesen** (kein Feedback) | „Probiere es aus“ (Punkte-Baukasten) und drei Vermutungen: Was unterscheidet ب ت ث? ي (2 unten)? ن (1 oben)? | Vier Vermutungen: تِ, ثُ, Punkt oder Kasra?, Silbe hören und Schrift wählen. Jede gibt „Was du schon weißt“ vor. |
| **Erklären und Verstehen** | Pro Vermutung ein Bildschirm: deine Antwort, die richtige, kurze Begründung. Dann die Regel mit Zeichnung der drei Buchstaben. | Deine Vermutungen aufgelöst, Regel „Buchstabe liefert Konsonant, Zeichen liefert Vokal“, „Punkt oder Zeichen?“ |
| **Anwenden und Überprüfen** | Neue Darstellungen: Wie viele Punkte, und wo? ي und ن als „keiner der drei“. Hör- und Erkennaufgaben. | ت und ث mit den drei Zeichen, neue Kombinationen. |

## 3. Wie die frühere Sieben-Phasen-Idee jetzt erscheint
Orientierung = Pfad und Lektionsziel · Entdecken = Einführungs-Lektionen · Hypothesen = „Entdecken“-Lektionen · Verstehen = „Erklären“-Lektionen · Anwenden = „Anwenden“-Lektionen · Abrufen = „Wiederholung“-Lektionen (Rückmeldung nach jeder Aufgabe, falsche Aufgaben kommen am Ende nochmal) · Festigen = Bereich „Üben“ (fällige Wiederholungen nach Plan, echte Zeit).

## 4. Mobile UX (umgesetzt)
- Vollbild-Lektion: Schließen, Fortschritt oben; Inhalt; **fester Fußbereich** mit der Hauptaktion (Daumen-Reichweite, feste Mindesthöhe, kein Springen).
- Auswahl antippen → „Prüfen“ → Feedback im Fußbereich: richtig kurz („Richtig!“), falsch freundlich mit richtiger Antwort und kurzer Begründung; falsche Aufgabe kommt am Ende nochmal.
- Hypothesen: „Weiter“ ohne Wertung („Keine Wertung: Die Erklärung kommt gleich.“).
- Große Zeichen (bis 180 px, an Bildschirmhöhe gekoppelt), Antwortflächen ≥ 72 px, Hauptbutton 56 px.
- Lernpfad: vier Strecken mit Zähler, Knoten (geschafft ✓, aktuell „Start“, gesperrt), ohne Dashboard und ohne Prozentwerte.
- Navigation: Lernpfad · Üben · Profil.
- Tashkeel einzeln werden auf einer neutralen Träger-Linie (Tatweel U+0640) gezeigt, weil der gepunktete Kreis in den Arabisch-Schriften fehlt.

## 5. Entfernt aus dem ersten Lernpfad
| Inhalt | Wo vorher | Verbleib |
|---|---|---|
| Wörter بَاب, ثَابِت, تَاب, ثَبَات | Einheit 4, Hypothesen, Tests, Üben | **aufbewahrt**: `content/lektion1.ts` (`WORDS`, Items `word:*`), Texte zu Pausalform (`WORD_VOCALIZATION_NOTE`) |
| Lange Vokale (بَا, تَا, ثَا), Alif als Dehnung | Einheit 4, Silbenbaukasten | **aufbewahrt**: `SYLLABLES` (Items `syl:*-long`), Konzept-Aufgaben `concept:alif-role` |
| Verbindungsregeln, Lücken-Beispiele | Einheit 4 | **aufbewahrt**: komplettes altes Material der vier Einheiten in `content/later/units-einheit-1-bis-4.ts` (Hypothesen, Erklärtexte, Gates) |
| Schreibübungen (Nachzeichnen, frei) | Einheit 1, 2 und Phase 5 | **aufbewahrt**: `ui/WriteTask.tsx`, `ui/WritingPad.tsx`, `domain/handwriting/*`, `features/blocks.tsx` (`WriteSeq`). Kein Eintrag im Pfad |
| Reflexionsaufgaben (Texteingabe „Erkläre in eigenen Worten“) und Sicherheitsangabe | Phase 3/4 | entfernt (Anfänger sollen nicht schreiben); Texte der Elaboration stehen im alten Einheiten-Material |
| Phasen-Oberfläche pro Einheit, Vorab-Test, Selbsteinschätzung, Zeitreise-Simulation | v2 | UI entfernt, Logik (Simulation) in `domain/lektion/state.ts` erhalten. Die alte Oberfläche liegt im Git-Verlauf (Commit `bf2ac92`) |
| Verständnis-Check und Einheiten-Entscheidung mit Schwellen | v2 Phase 4/6 | ersetzt durch „Wiederholung“-Lektionen und Bereich „Üben“ |

Ein Test (`tests/path.test.ts`) stellt sicher, dass **kein** Pfad-Inhalt (Texte, Aufgaben, Antwortoptionen) Wörter, lange Vokale oder Verbindungsregeln enthält, und dass Strecke 1 kein Tashkeel-Zeichen, Strecke 2 keine Buchstaben und Strecke 3 zuerst nur ب verwendet.

## 6. Technische Änderungen
- `content/path.ts` (neu): Strecken, 23 Lektionen als Folgen von Bildschirmen, Hypothesen mit Vorgabe, Fehler-Lektion aus dem Lernstand.
- `domain/lektion/tasks.ts`: `pathTask` baut Aufgaben mit kleinen Pools (nie nicht eingeführte Buchstaben oder Zeichen als Antwort, nur neutrale Ablenker), `drillSets` (Übung und Nachtest disjunkt), Silben-Aufgaben nie mit langen Silben gemischt.
- `domain/lektion/state.ts`: Zustand v3 (`lessons`, `hyp`, `srs`, `log`, `confusions`); alte Stände (v2) werden nicht übernommen.
- `features/play/*` (neu): `Screen`, `TaskView`, `Slides`, `LessonPlayer`. `features/Start.tsx` ist jetzt der Lernpfad.
- Design-System: `lektion.css`, Abschnitt „Mobile Lernoberfläche“.

## 7. Prüfstatus
80 Unit-Tests (Inhalt, Aufgaben, Kompetenzen, Wiederholung, Verwechslungen, Pfad-Grenzen, Speicherung). Browser-Durchlauf (Playwright/Chromium, 45 Prüfungen) gegen den Server **und** die Einzeldatei: Pfad, Sperrung, alle 23 Lektionen, Fehlerfeedback mit Wiederholung, Speicherung nach Neuladen, Audioaufruf, Verwechslungs-Übung, Inhaltsgrenzen, 360×640 und 430×932 ohne horizontales Scrollen und mit sichtbarem Hauptbutton, Tastaturfokus.
**Nicht** geprüft: echte Nutzer, Safari/Firefox, echte Geräte, Screenreader, muttersprachliche Richtigkeit.

## 8. Offene Probleme
1. **Ablenker aus nicht gelehrten Buchstaben:** In den Einführungen von Alif, Bā und Tā bestehen Antwortoptionen teils aus neutralen, nicht gelehrten Buchstaben (ل د ر و م ح ع س), damit nie ب/ت/ث vor ihrer Einführung auftauchen. Das ist eine bewusste Abwägung und muss mit Lernenden geprüft werden (wirkt das verwirrend?).
2. **Neutrale Tashkeel-Ablenker:** Sukun und Shadda erscheinen als Ablenker bei „Tippe auf die Fatha“ (ohne Erklärung, folgen später).
3. **Träger-Linie (Tatweel):** Darstellung in Chromium mit Scheherazade New geprüft. Andere Browser/Systemschriften nicht.
4. **Buchstabenlaut als Silbe:** In Strecke 1 wird der Laut als „ba/ta/tha“ gespielt (die vorhandenen Aufnahmen), die Fatha ist da noch nicht eingeführt. Das ist im Text erklärt („Ein Konsonant allein ist nicht sprechbar“), bleibt aber ein didaktischer Kompromiss, bis Aufnahmen der Namen Bā/Tā/Thā vorliegen.
5. **Aufnahmen und Aussprachetexte** sind nicht muttersprachlich geprüft; Liste fehlender Aufnahmen: `AUDIO-ASSETS.md`.
6. **Strenge Reihenfolge:** Lektionen sind nacheinander freigeschaltet, mit Ausweg „Trotzdem öffnen“. Ob das für Lernende passt, ist ungetestet. Ein Einstufungstest („Ich kenne das schon“) fehlt.
7. **Üben** zeigt am ersten Tag „nichts fällig“ (Intervalle beginnen bei etwa einem Tag); die freie Übung steht sofort bereit.
8. **Vergleichsübung** gibt es nur für Buchstaben, Silben und Vokale; Schwellen (2 Verwechslungen, 75 % im Nachtest) sind Startwerte.
9. **Fehler-Lektion:** Sortierung nach Fehlern ist eine einfache Heuristik ohne Nutzerdaten.
10. **Schreiben** ist aus dem Pfad entfernt; die Kompetenz „Schreiben“ im Profil bleibt dadurch leer, bis eine Schreib-Strecke ergänzt wird.
11. Die angegebene Datei „arabisch-lektion-1 (1).html“ kam nicht an. Gearbeitet wurde am Quellcode, aus dem die HTML-Datei gebaut wird.
