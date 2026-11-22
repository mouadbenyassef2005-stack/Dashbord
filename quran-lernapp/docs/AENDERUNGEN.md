# Änderungsdokumentation mit wissenschaftlicher und UX-Begründung

Struktur je Änderung: **1 Problem · 2 Änderung · 3 Grundlage · 4 Erwarteter Nutzen · 5 Überprüfung der Wirksamkeit**.

**Wichtige Einschränkung:** Die genannten Studien stützen die *Prinzipien*, nicht den Erfolg dieser App. Viele Befunde stammen aus anderen Fächern, Altersgruppen oder Laborsettings (z. B. Productive Failure meist Mathematik/Naturwissenschaften). Ob sie beim Lesenlernen arabischer Schrift für deutschsprachige Erwachsene tragen, ist eine **Hypothese**, die nur Lernstandsdaten prüfen können (jeweils unter 5).

---

## A. Lerninhalt und Didaktik

### A1. Stoff in vier Einheiten
1. **Problem:** Alles (Buchstaben, Vokale, ā, Verbindung, Wörter, Schreiben) in einem Durchlauf. Für Anfänger hohe kognitive Belastung.
2. **Änderung:** Vier Einheiten (`content/units.ts`): (1) Alif und Familie ب ت ث, Punkte-Regel; (2) Fatha und Silben ba/ta/tha; (3) Kasra und Damma, Vokalkontrast; (4) ā, Verbindung, erste Wörter. Jede Einheit: Ziel, Einführung, angeleitet, selbstständig, Verständnis-Check, Entscheidung weiter/nachüben. Tests (`units.test.ts`) erzwingen die Progression: Einheit 1 nur Buchstaben, 2 nur Fatha, 3 noch keine Länge/Wörter.
   *Prüfung des Vorschlags:* Reihenfolge fachlich bestätigt, mit einer Anpassung: Die Hörübung der Buchstabenlaute erscheint schon in Einheit 1, weil ein Konsonant nur mit Vokal sprechbar ist. Dafür wird er als „ba/ta/tha“ gespielt und erklärt, **ohne** Fatha als Schriftzeichen vorwegzunehmen. Die Lange-ā- und Verbindungsregel bleibt bewusst am Ende, weil sie Fatha, Alif und Silbenlesen voraussetzt.
3. **Grundlage:** Cognitive-Load-Theorie (Sweller 1988); Segmentierungsprinzip beim Multimedia-Lernen (Mayer 2017).
4. **Nutzen:** Weniger gleichzeitig Neues; Voraussetzungen sind geübt, bevor Neues darauf aufbaut.
5. **Prüfung:** Vergleich Abbruchrate und Einheiten-Testquote mit der Langform (A/B); Selbsteinschätzung der Belastung (z. B. NASA-TLX-Kurzform) nach jeder Einheit.

### A2. Productive Failure aus Bekanntem ableitbar
1. **Problem:** Aufgaben, unbekannte Vokalzeichen zu erraten (a/i/u), waren nicht aus Vorwissen lösbar: reines Raten.
2. **Änderung:** Jede Hypothese gibt „Was du schon weißt“ vor (Tests erzwingen das bei Vokalzeichen und Hörreizen) und ist ableitbar: Einheit 1: Punkte-Regel formulieren und auf neue Darstellungen (ي, ن, ا) anwenden; Einheit 2: ثَ aus بَ/تَ ableiten, Silbe hören und zuordnen; Einheit 3: تِ/ثُ aus ba/bi/bu übertragen, Punkt von Kasra unterscheiden, hören und zuordnen; Einheit 4: Länge aus بَ/بَا ableiten, Lücken in Beispielwörtern beobachten. Rückmeldung bewusst verzögert (Phase 4). Die Auflösung zeigt **Warum richtig**, **Woraus ableitbar** und **Typische Fehlannahme**. Sicherheitsangabe (sicher/eher/geraten) macht „sicher, aber falsch“ sichtbar.
3. **Grundlage:** Kapur (2008), Kapur & Bielaczyc (2012), Sinha & Kapur (2021): Problemlösen vor Instruktion hilft, wenn Lernende aus Vorwissen sinnvolle Lösungsversuche erzeugen können.
4. **Nutzen:** Aktivierung von Vorwissen, tieferes Verständnis der anschließenden Erklärung, Korrektur konkreter Fehlannahmen.
5. **Prüfung:** Vergleich Transferaufgaben (Phase 5, „neu kombiniert“) mit einer Gruppe, die Erklärung vor Aufgaben bekommt; Anteil „sicher, aber falsch“ vor/nach der Erklärung.

### A3. Merkhilfen schrittweise ausblenden
1. **Problem:** Boot/Anker-Bilder blieben dauerhaft und erschweren direkte Erkennung.
2. **Änderung:** Vier Stufen je Buchstabe nach richtigen visuellen Antworten (`mnemonicStage`): 1 Bild + Satz, 2 Stichwort, 3 ohne, 4 Erkennung im Kontext. Anzeige in den Buchstabenkarten und im Aufgabenreiz.
3. **Grundlage:** Expertise-Reversal-Effekt: Hilfen, die Novizen nützen, können bei wachsender Expertise hinderlich werden (Kalyuga, Ayres, Chandler & Sweller 2003).
4. **Nutzen:** Ziel ist direkte Erkennung, ohne Umweg über das Bild.
5. **Prüfung:** Erkennungsquote und Antwortzeit pro Stufe; Test ohne Merkhilfe nach einer Woche.

### A4. Wörter und Orthografie transparent
1. **Problem:** „Vollständig vokalisiert“ stimmte nicht: Am Wortende steht kein Zeichen (Pausalform). Das wurde nicht erklärt.
2. **Änderung:** Hinweis `WORD_VOCALIZATION_NOTE` bei Wörtern, im Erklärteil und im Test (Wortende ohne Zeichen). Zu تَاب Zusatzhinweis (Pausalform von تَابَ). Automatische Tests prüfen Buchstabenfolge, ā nur nach Fatha, kein Zeichen am Wortende, Alif ohne Vokalzeichen.
3. **Grundlage:** Beschreibungen der arabischen Schrift (Pausalform ohne Endvokal) in der Grammatikliteratur, z. B. Watson (2002). **Nicht muttersprachlich gegengeprüft**, siehe `PHONETIK-PRUEFLISTE.md`.
4. **Nutzen:** Keine stillschweigend eingeführten Regeln; weniger Fehlannahmen („bāba“).
5. **Prüfung:** Muttersprachliche Prüfung der vier Wörter; Fehlerrate beim Wortende in Phase 5/6.

## B. Audio und Aussprache

### B1. Echte Aufnahmen, ehrlicher Zustand
1. **Problem:** Audio-Schnittstelle ohne Aufnahmen.
2. **Änderung:** 13 gelieferte Aufnahmen integriert; `AudioPlayer` (Hören, Langsam), `ContrastPlayer` (Hörvergleich, „Alle nacheinander“), `SpeakCompare` (selbst aufnehmen, mit Vorbild vergleichen, **keine** automatische Bewertung, Aufnahme wird nicht gespeichert). Fehlt eine Aufnahme, gibt es **keinen** Button, sondern „Audio noch nicht verfügbar“. „Langsam“ ist technische Verlangsamung (0,65×, Tonhöhe erhalten), keine eigene Aufnahme, und so benannt. Asset-Liste: `AUDIO-ASSETS.md`.
3. **Grundlage:** Multimediales Lernen mit Wort und Bild/Ton (Mayer 2017); Übersichtsarbeit zu Gestaltungsprinzipien mit Effekten für Multimedia-Gestaltung (Noetel et al. 2022). Für Hörunterscheidung fremder Laute: Logan, Lively & Pisoni (1991). Sie berichten Vorteile bei mehreren Sprechern. Wir haben nur **einen**.
4. **Nutzen:** Laut und Schrift werden zusammen erlebt; Hören ist eine eigene geübte Kompetenz.
5. **Prüfung:** Hörunterscheidung vor/nach (ba/bi/bu, ta/tha), Nutzungsrate der Audio-Funktionen, Fehlerquote bei th/t.

### B2. Hörübungen mit didaktischem Zweck
1. **Problem:** Audio war dekorativ.
2. **Änderung:** Neue Aufgabenvarianten: Hören → Buchstabe/Vokal/Silbe wählen (Kompetenz „Laute hören und unterscheiden“ bzw. „Laut und Schrift zuordnen“), Hörhypothesen in den Einheiten 2 und 3. Hörvarianten gibt es **nur**, wenn eine Aufnahme existiert; Distraktoren nur aus Silben mit Aufnahme. Antwortzeit zählt bei Hörreizen nicht.
3. **Grundlage:** s. B1; Interleaving verschiedener Aufgabenarten (Rohrer & Taylor 2007).
4. **Nutzen:** Hören wird getrennt geübt, gemessen und wiederholt.
5. **Prüfung:** Getrennte Lernkurven der Kompetenz „listen“.

### B3. Phonetik korrigiert
1. **Problem:** Kasra über „Lippen breit“; Damma nur über Lippen; ث ohne Zungenposition.
2. **Änderung:** Kasra und Damma über **Zungenposition** (vorn/hoch bzw. hinten/hoch plus Lippenrundung); Fatha als kurzes a **ohne** universelle Gleichsetzung; ث als stimmloser dentaler Reibelaut /θ/ mit Zungen- und Luftstromanweisung, Übung über „sss“ und typischem Ersatzlaut (s/f); ت mit schwächerem Hauch. Tests sichern, dass „Lippen breit“ nicht mehr vorkommt und „Zungenrücken“ genannt wird.
3. **Grundlage:** Artikulatorische Phonetik, z. B. Ladefoged & Johnson (2015). **Muttersprachliche Prüfung steht aus.**
4. **Nutzen:** Genauere Selbstkorrektur, weniger Ersatzlaute.
5. **Prüfung:** Muttersprachliche Bewertung von Lernenden-Aufnahmen vor/nach; Prüfliste `PHONETIK-PRUEFLISTE.md`.

## C. Lernerfolg messen und wiederholen

### C1. Vier Kompetenzbereiche, getrennt
1. **Problem:** Ein Wert pro Item. Erkennen galt automatisch als Können.
2. **Änderung:** Sieben Kompetenzen (Erkennen, Laut↔Schrift, Hören, Vokalzeichen, Silben, Wörter, Schreiben) in vier **nicht verrechneten** Bereichen (visuell, phonologisch, motorisch, Dekodieren). Anzeige als Anzahl Inhalte je Stufe (noch nicht geübt, unsicher, verstanden, gefestigt) aus echten Antworten, **ohne Prozentwert**. Stufenregeln sind dokumentiert und getestet (z. B. „gefestigt“: ≥3 richtige an ≥2 Tagen, Modellstabilität ≥6 Tage, zuletzt richtig). Die Schwellen sind Startwerte.
3. **Grundlage:** Kompetenzen des Lesenlernens sind teilweise voneinander unabhängig; Rahmen zur Bewertung, welche Fertigkeiten eine Sprach-App tatsächlich fördert (Rosell-Aguilar 2017, als Prüfraster von uns angewandt).
4. **Nutzen:** Lernende und Lehrende sehen, was sicher ist und was nicht.
5. **Prüfung:** Korrelationen zwischen Kompetenzen (sind sie wirklich getrennt?), Vorhersagekraft der Stufe für spätere Richtigkeit.

### C2. Wiederholungsplan pro Item und Kompetenz
1. **Problem:** Erfolg im Erkennen erhöhte Stabilität des Gesamt-Items.
2. **Änderung:** Plan-Schlüssel `item|kompetenz`; Test: Erfolg bei `syllable` verändert `listen` nicht. Fehler verkürzen das Intervall, stehen bei gleicher Schätzung weiter vorn. Eingang: Korrektheit, Hilfe, **Antwortzeit nur bei Aufgaben ohne Hörreiz** (schnell → Note 3, sehr langsam → 1), Sicherheit (Phase 3 getrennt), Fehlerhäufigkeit (Lapses), Zeit seit letzter Wiederholung. Wiederholungen laufen in „Üben“ in **echter Zeit** und mit Aufgabenvarianten, die zur Kompetenz passen. Die Zeitreise-Simulation arbeitet auf einer **Kopie** und verändert den echten Plan nicht. Alle Prozentwerte sind als **Modellschätzung** beschriftet. Das Modell ist ein vereinfachter, nicht kalibrierter Algorithmus (kein validierter FSRS).
3. **Grundlage:** Verteiltes Wiederholen (Cepeda et al. 2006); Abrufen als Lernereignis (Roediger & Karpicke 2006).
4. **Nutzen:** Jede Kompetenz kommt kurz vor dem Vergessen zurück.
5. **Prüfung:** Behaltensleistung nach 1/7/30 Tagen; Kalibrierung der Konstanten mit echten Antwortdaten.

### C3. Adaptivität: Verwechslungen
1. **Problem:** Keine Reaktion auf Fehlermuster.
2. **Änderung:** Bei Auswahlaufgaben wird die gewählte falsche Option einem Lern-Item zugeordnet. Ab zwei Verwechslungen desselben Paares (ب↔ت) erscheint **ohne den Fluss zu unterbrechen** am Ende (Auswertung, Üben, Profil) die gezielte Vergleichsübung: Unterschiede zeigen (Punkte nebeneinander), sechs neue Beispiele, Nachtest ohne Hilfe. Erst ≥75 % im Nachtest markiert sie als behoben. Gilt für Buchstaben, Silben und Vokale. Rücksprung: Bei Fehlern im Check und in Phase 5 führt „Dazu nochmal ansehen“ zum passenden Schritt der angeleiteten Übung.
3. **Grundlage:** Erklärendes, aufgabenbezogenes Feedback (Hattie & Timperley 2007); Kontrastübungen in gemischter Folge (Kornell & Bjork 2008; Rohrer & Taylor 2007).
4. **Nutzen:** Hilfe dort, wo der Fehler tatsächlich liegt.
5. **Prüfung:** Rückfallquote derselben Verwechslung nach 1/7 Tagen.

### C4. Entscheidung statt erzwungener Linearität
1. **Problem:** Gesperrte Phasen, kein Weg bei Lücken.
2. **Änderung:** Alle Phasen einer Einheit sind jederzeit öffenbar; Schritte lassen sich überspringen. Einheit n+1 öffnet nach der Entscheidung in Phase 6: Empfehlung „weitergehen“ oder „gezielt nachüben“ nach Schwellen (Startwerte), dazu Zusatzübung und Kurztest. „Trotzdem weiter“ ist erlaubt, mit Hinweis.
3. **Grundlage:** Selbstbestimmung vs. Führung ist offen; wir kombinieren Empfehlung und Wahlfreiheit. Retrieval-Test als Entscheidungsgrundlage (Roediger & Karpicke 2006).
4. **Nutzen:** Keine Sackgasse, keine ungeprüfte Illusion von Können.
5. **Prüfung:** Wie oft wird gegen die Empfehlung weitergegangen, und wie schneiden diese Lernenden später ab?

### C5. Fortschritt ohne Täuschung
1. **Problem:** Phasenzähler wirkten wie Können.
2. **Änderung:** „✓“ heißt nur „Aktivität abgeschlossen, nicht gelernt“ und ist so beschriftet. Der Lernstand kommt aus den Kompetenzbereichen. Keine Gesamtprozente.
3. **Grundlage:** Lernende überschätzen Wiederlesen und unterschätzen Abrufen (Karpicke, Butler & Roediger 2009); Feedback soll Lernstand informieren (Hattie & Timperley 2007).
4. **Nutzen:** Realistischere Selbsteinschätzung.
5. **Prüfung:** Abweichung Selbsteinschätzung vs. Testleistung.

## D. UI und UX

### D1. Mobile-first, Hierarchie, eine Haupthandlung
1. **Problem:** Überladene Seiten mit mehreren Aufgabenarten.
2. **Änderung:** Einheit → Phase → Schritt; je Schritt Überschrift, kurzer Text, zentraler Lerngegenstand, eine Hauptaktion; Zusatzwissen aufklappbar („Warum so gelernt wird“); „Wo bin ich“ immer sichtbar (Einheiten-Leiste, Phasen-Leiste, Schrittzähler). Zeilenhöhe 2,1 und Innenabstand für Punkte/Vokalzeichen (nichts abgeschnitten); Touch-Ziele ≥48 px; im Test bei 390 px kein horizontales Scrollen.
3. **Grundlage:** Mayer (2017) (Kohärenz, Signalisierung, Segmentierung); Noetel et al. (2022); mobile Usability-Rahmen (Weichbroth 2024); Evaluationsrahmen für Sprach-Apps (Rosell-Aguilar 2017).
4. **Nutzen:** Weniger Suchaufwand, weniger Fehlbedienung.
5. **Prüfung:** Moderierte Tests nach `USABILITY-TESTPLAN.md`.

### D2. Feedback und Zustände
1. **Änderung:** Feedback mit Text **und** Symbol (✓/✗), erklärend; Productive-Failure- und Test-Phasen mit bewusst verzögertem Feedback, sonst sofort; Auswahlzustände sichtbar; Hinweise zählen als Hilfe; Lade- und Fehlerzustände; Rücksprung zur Erklärung.
2. **Grundlage:** Hattie & Timperley (2007); Kapur (2008) für Verzögerung.
3. **Prüfung:** Verständnis des Feedbacks (Interview), Fehlerwiederholung.

### D3. Design-System und Barrierefreiheit
1. **Problem:** Einzelne CSS-Regeln, Kontraste unter AA.
2. **Änderung:** Tokens (Farben, Abstände, Radien, Schrift), Komponenten (Buttons, Karten, Eingaben, Fortschritt, Feedback, Audio, arabische Zeichen, Aufgaben) in `lektion.css`. Kontrast: `muted` 3,8→5,3:1, `warn` 4,1→5,2:1, `gold` 3,8→5,5:1 (berechnet). Sichtbarer Fokus, Tastaturbedienung, Radiogruppen mit Beschriftung, `aria-live` für Audio-Zustände, reduzierte Bewegung, Rückmeldung nie nur über Farbe.
3. **Grundlage:** WCAG 2.2 (W3C 2023).
4. **Prüfung:** Screenreader-Test (NVDA/VoiceOver) und automatisierte Prüfung (z. B. axe) stehen **aus**.

---

## Quellen
- Cepeda, N. J., Pashler, H., Vul, E., Wixted, J. T., & Rohrer, D. (2006). Distributed practice in verbal recall tasks: A review and quantitative synthesis. *Psychological Bulletin, 132*(3), 354–380. https://doi.org/10.1037/0033-2909.132.3.354
- Hattie, J., & Timperley, H. (2007). The power of feedback. *Review of Educational Research, 77*(1), 81–112. https://doi.org/10.3102/003465430298487
- Kalyuga, S., Ayres, P., Chandler, P., & Sweller, J. (2003). The expertise reversal effect. *Educational Psychologist, 38*(1), 23–31. https://doi.org/10.1207/S15326985EP3801_4
- Kapur, M. (2008). Productive failure. *Cognition and Instruction, 26*(3), 379–424. https://doi.org/10.1080/07370000802212669
- Kapur, M., & Bielaczyc, K. (2012). Designing for productive failure. *Journal of the Learning Sciences, 21*(1), 45–83. https://doi.org/10.1080/10508406.2011.591717
- Karpicke, J. D., Butler, A. C., & Roediger, H. L. (2009). Metacognitive strategies in student learning: Do students practise retrieval when they study on their own? *Memory, 17*(4), 471–479. https://doi.org/10.1080/09658210802647009
- Kornell, N., & Bjork, R. A. (2008). Learning concepts and categories: Is spacing the “enemy of induction”? *Psychological Science, 19*(6), 585–592. https://doi.org/10.1111/j.1467-9280.2008.02127.x
- Ladefoged, P., & Johnson, K. (2015). *A Course in Phonetics* (7. Aufl.). Cengage Learning. (Buch, kein DOI)
- Logan, J. S., Lively, S. E., & Pisoni, D. B. (1991). Training Japanese listeners to identify English /r/ and /l/: A first report. *Journal of the Acoustical Society of America, 89*(2), 874–886. https://doi.org/10.1121/1.1894649
- Mayer, R. E. (2017). Using multimedia for e-learning. *Journal of Computer Assisted Learning, 33*(5), 403–423. https://doi.org/10.1111/jcal.12197
- Noetel, M., Griffith, S., Delaney, O., Harris, N. R., Sanders, T., Parker, P., del Pozo Cruz, B., & Lonsdale, C. (2022). Multimedia design for learning: An overview of reviews with meta-meta-analysis. *Review of Educational Research, 92*(3), 413–454 (online 2021). https://doi.org/10.3102/00346543211052329
- Roediger, H. L., & Karpicke, J. D. (2006). Test-enhanced learning: Taking memory tests improves long-term retention. *Psychological Science, 17*(3), 249–255. https://doi.org/10.1111/j.1467-9280.2006.01693.x
- Rohrer, D., & Taylor, K. (2007). The shuffling of mathematics problems improves learning. *Instructional Science, 35*(6), 481–498. https://doi.org/10.1007/s11251-007-9015-8
- Rosell-Aguilar, F. (2017). State of the app: A taxonomy and framework for evaluating language learning mobile applications. *CALICO Journal, 34*(2), 243–258. https://doi.org/10.1558/cj.27623
- Sinha, T., & Kapur, M. (2021). When problem solving followed by instruction works: Evidence for productive failure. *Review of Educational Research, 91*(5), 761–798. https://doi.org/10.3102/00346543211019105
- Sweller, J. (1988). Cognitive load during problem solving: Effects on learning. *Cognitive Science, 12*(2), 257–285. https://doi.org/10.1207/s15516709cog1202_4
- Vlachogianni, P., & Tselios, N. (2022). Perceived usability evaluation of educational technology using the System Usability Scale (SUS): A systematic review. *Journal of Research on Technology in Education, 54*(3), 392–409. https://doi.org/10.1080/15391523.2020.1867938
- Watson, J. C. E. (2002). *The Phonology and Morphology of Arabic*. Oxford University Press. (Buch, kein DOI)
- W3C (2023). *Web Content Accessibility Guidelines (WCAG) 2.2*. https://www.w3.org/TR/WCAG22/
- Weichbroth, P. (2024). Usability testing of mobile applications: A methodological framework. *Applied Sciences, 14*(5), 1792. https://doi.org/10.3390/app14051792

**Nicht verifizierte Quelle:** „Usability testing of mobile learning applications: a systematic mapping study (2024)“ wurde im Auftrag genannt. Autorenschaft, Zeitschrift und DOI konnten hier **nicht verifiziert** werden. Sie wird deshalb nicht zitiert und es werden ihr keine Ergebnisse zugeschrieben. Bitte bibliografische Angaben ergänzen.

Bibliografische Angaben stammen aus dem Gedächtnis des Autors dieser Dokumentation und sollten vor Veröffentlichung gegen die DOI-Landingpages geprüft werden. Wir hatten bei der Erstellung keinen Zugriff auf diese Seiten.
