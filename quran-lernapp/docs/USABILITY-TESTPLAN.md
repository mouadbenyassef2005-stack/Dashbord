# Usability-Testplan (ausführbar, **noch nicht durchgeführt**)

Es gibt **keine** Testergebnisse. Dieses Dokument beschreibt, wie die Evaluation durchgeführt wird. Bis dahin gilt die App als technisch getestet und von uns heuristisch bewertet, **nicht nutzergetestet**.

## 1. Abgrenzung der Evidenzarten
| Art | Was sie zeigt | Stand |
|---|---|---|
| Technische Tests | Logik und Abläufe funktionieren (Unit- und Browser-Tests) | durchgeführt (siehe `ANALYSE-UND-PLAN.md`) |
| Expertenbewertung | Heuristische Probleme (Hierarchie, Kontrast, Konsistenz) | durch uns, nicht unabhängig |
| Nutzertests | Wie reale Lernende die App bedienen | **offen** |
| Lernerfolg | Ob Lernende dauerhaft besser lesen können | **nicht nachgewiesen** |

## 2. Teilnehmende
- 8 bis 10 deutschsprachige Erwachsene ohne Arabischkenntnisse (Faustregel für qualitative Usability-Tests; für statistische Aussagen reicht das nicht), Smartphone-Nutzung (iOS und Android gemischt), mindestens 2 Personen mit Sehhilfe oder motorischer Einschränkung, soweit rekrutierbar.
- Ausschluss: Arabisch- oder Persisch/Urdu-Vorkenntnisse in Schrift.
- Einwilligung, Datenschutzhinweis (siehe Abschnitt 8).

## 3. Aufgaben (jeweils mit Zielzustand)
| # | Aufgabe | Erfolg, wenn … |
|---|---|---|
| T1 | Erste Lektion beginnen | Einheit 1 gestartet, Ziel genannt |
| T2 | Einen neuen Buchstaben lernen (Alif oder Bā) | Name, Aussehen und Laut korrekt wiedergegeben |
| T3 | Eine Aussprache anhören (normal, langsam) | Audio gestartet, beide Varianten gefunden |
| T4 | ب und ت unterscheiden (Baukasten oder Aufgabe) | Regel in eigenen Worten genannt |
| T5 | Ein Vokalzeichen erkennen (Kasra) | Zeichen, Lage und Laut korrekt |
| T6 | Eine Silbe lesen (z. B. تِ) | „ti“ ohne Hilfe |
| T7 | Einen Buchstaben schreiben | Strichauswertung abgeschlossen, Rückmeldung verstanden |
| T8 | Eine Wiederholungsaufgabe absolvieren (Üben) | Sitzung beendet |
| T9 | Nach einem Fehler gezielt weiterlernen | Vergleichsübung oder Rücksprung gefunden und genutzt |

## 4. Messgrößen
| Größe | Messung | Zielwert (Hypothese, nicht validiert) |
|---|---|---|
| Aufgabenerfolg | Anteil erfolgreicher Aufgaben ohne Hilfe | ≥ 80 % je Aufgabe |
| Fehlbedienungen | Falsche Klicks, Rückwege, Sackgassen je Aufgabe (Beobachtung, Videoanalyse) | ≤ 1 je Aufgabe |
| Zeit | Zeit bis Aufgabenende | Benchmark nach Pilot |
| Abbruchpunkte | Wo und warum brechen Teilnehmende ab? | Liste, Häufigkeit |
| Navigationsverständnis | Frage „Wo bist du, was kommt als Nächstes?“ nach T1 und T8 | ≥ 8 von 10 korrekt |
| Wahrgenommene Schwierigkeit | Single Ease Question (1 bis 7) je Aufgabe | Mittel ≥ 5,5 |
| Zufriedenheit | Fragebogen (1 bis 5) | Mittel ≥ 4 |
| Verständlichkeit des Feedbacks | Interview: „Warum war das falsch?“ | ≥ 80 % korrekt erklärt |
| Wahrgenommene Gesamtusability | System Usability Scale (SUS, 10 Items) | Orientierung: > 68 als Durchschnitt (Bangor et al. 2008 zur Einordnung) |

Die SUS ist **kein alleiniger Qualitätsnachweis**: Sie misst wahrgenommene Usability, nicht Lernerfolg und nicht einzelne Probleme (Vlachogianni & Tselios 2022 zur SUS bei Lerntechnologie). Deshalb immer zusammen mit Beobachtung und Interview auswerten.

## 5. Methoden
- Moderierte Einzeltests (30 bis 45 Minuten), Think-Aloud, Bildschirm- und Tonaufzeichnung (mit Einwilligung), Beobachtungsprotokoll.
- Kurze Interviews nach jeder Aufgabengruppe und am Ende.
- SUS am Ende, SEQ nach jeder Aufgabe.
- Geräte: eigenes Smartphone der Teilnehmenden (Chrome/Android, Safari/iOS), Kopfhörer und Lautsprecher variieren; ein Durchgang mit Screenreader (VoiceOver/TalkBack), falls möglich.
- Vorgehen nach dem methodischen Rahmen für mobile Usability-Tests (Weichbroth 2024): Ziele, Teilnehmende, Aufgaben, Umgebung, Kennzahlen und Auswertung vorab festlegen.

## 6. Ablauf je Sitzung
1. Begrüßung und Einwilligung (5 min), Vorwissen-Fragebogen
2. Übungsaufgabe Think-Aloud (2 min)
3. Aufgaben T1 bis T9 (25 min), jeweils SEQ
4. SUS, Abschlussinterview (8 min)

## 7. Auswertung
- Probleme nach Schwere ordnen (kritisch: Aufgabe nicht lösbar; hoch: erheblicher Umweg; mittel; niedrig).
- Pro Aufgabe: Erfolgsquote, Zeit (Median), Fehlbedienungen, Abbrüche.
- SUS-Mittelwert **mit** Streuung angeben, nicht als einzige Zahl.
- Änderungen ableiten, erneut testen (Iteration).

## 8. Datenschutz und Ethik
Aufzeichnungen nur mit Einwilligung, pseudonymisiert, getrennt von Namen gespeichert, Löschfrist festlegen. Die App selbst speichert Lernstand nur lokal im Browser und sendet nichts.

## 9. Lernwirksamkeit (getrennt von Usability)
Usability-Tests belegen keinen Lernerfolg. Dafür: Vor-/Nachtest (Buchstaben erkennen, hören, schreiben, Silben/Wörter lesen) nach der Lektion, Behaltenstest nach 7 und 30 Tagen, idealerweise Vergleichsgruppe. Datenbasis liefern die Kompetenz-Logs (`state.log`) nach Einwilligung.

## Quellen
- Bangor, A., Kortum, P. T., & Miller, J. T. (2008). An empirical evaluation of the System Usability Scale. *International Journal of Human–Computer Interaction, 24*(6), 574–594. https://doi.org/10.1080/10447310802205776
- Vlachogianni, P., & Tselios, N. (2022). *Journal of Research on Technology in Education, 54*(3), 392–409. https://doi.org/10.1080/15391523.2020.1867938
- Weichbroth, P. (2024). *Applied Sciences, 14*(5), 1792. https://doi.org/10.3390/app14051792
