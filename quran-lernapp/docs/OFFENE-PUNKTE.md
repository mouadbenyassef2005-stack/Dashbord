# Offene Punkte und benötigte externe Ressourcen

## Müssen vor einem echten Einsatz geklärt werden
| # | Punkt | Wer / was wird gebraucht |
|---|---|---|
| 1 | **Muttersprachliche Prüfung** der Aussprachebeschreibungen, Wörter, Transliteration und der 13 Aufnahmen (`PHONETIK-PRUEFLISTE.md`) | Arabischsprachige Lehrkraft oder Phonetiker:in |
| 2 | **Fehlende Aufnahmen**: Buchstabennamen Bā/Tā/Thā, ā-Silben, vier Wörter, Minimalpaare (`AUDIO-ASSETS.md`) | Sprecher:in, Studio |
| 3 | **Mehrere Sprecher** (Sprechervielfalt beim Hörtraining) | Zusätzliche Stimmen |
| 4 | **Usability-Tests** mit realen Lernenden (`USABILITY-TESTPLAN.md`) | 8 bis 10 Teilnehmende, Moderation, Auswertung |
| 5 | **Lernwirksamkeit** prüfen (Vor-/Nachtest, Behaltenstest, Vergleichsgruppe) | Studiendesign, Einwilligungen |
| 6 | **Kalibrierung** der Schwellen: Stufen (Verstanden/Gefestigt), Entscheidungsschwellen, Zeitgrenzen (schnell/langsam), Verwechslungsgrenze (2), Wiederholungsmodell, Schreibauswertung | Echte Antwortdaten |
| 7 | **Barrierefreiheit** mit Screenreader und automatisierter Prüfung testen (NVDA, VoiceOver, TalkBack, axe) | Testgeräte |
| 8 | Fachliche Quellenprüfung: DOIs gegen Landingpages abgleichen; die im Auftrag genannte Mapping-Studie 2024 bibliografisch klären | Bibliothekszugang |

## Bekannte technische Grenzen
- Lernstand nur im Browser (localStorage), kein Konto, kein Geräteabgleich. Eine alte Version des Lernstands (v1) wird nicht übernommen.
- „Langsam“ ist technische Verlangsamung derselben Aufnahme, nicht eine eigene Aufnahme.
- Eigene Aufnahme (SpeakCompare) braucht Mikrofonzugriff und einen Browser mit MediaRecorder. Es gibt keine automatische Aussprachebewertung.
- Die Handschrift-Auswertung (Form, Punkte, Richtung) ist ein Vergleich mit selbst entworfenen Skelettvorlagen, mit echter Handschrift nicht geeicht, und für ا ب ت ث beschränkt.
- Das Wiederholungsmodell ist ein vereinfachter, nicht kalibrierter Algorithmus. Prozentwerte sind Modellschätzungen.
- Browser-Tests liefen mit Chromium. Safari/Firefox und echte Geräte sind **nicht** getestet. AAC/m4a wird von aktuellen Browsern unterstützt, ist aber auf echten Geräten nicht geprüft.
- Inhalte: nur Lektion 1 (4 Buchstaben, 3 Kurzvokale, ā, 4 Wörter). Kontextformen schreiben, Sukun, Tanwin, weitere Buchstaben folgen.

## Entscheidungen, die wir bewusst getroffen haben (bitte bestätigen)
- Buchstabenlaut wird als „ba/ta/tha“ gespielt (Konsonant mit kurzem a), weil Konsonanten nicht isoliert sprechbar sind.
- Wörter in Pausalform, mit Hinweis. تَاب bleibt trotz Erklärungsbedarf, solange keine muttersprachliche Prüfung vorliegt.
- „Trotzdem weiter“ ist erlaubt, damit niemand eingesperrt wird.

## Zusätzlich seit dem mobilen Lernpfad (V3)
Siehe `LERNPFAD-V3.md`, Abschnitt 8 (u. a. Ablenker aus nicht gelehrten Buchstaben, Träger-Linie in anderen Browsern, Buchstabenlaut als Silbe, fehlende Schreib-Strecke).
