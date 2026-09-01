# Konzept: WhatsApp-Kanal „Lager & Logistik Jobs" — Standalone-Projekt

**Stand:** September 2026 · **Status:** Kanal ist frisch gestartet, Aufbau ab null
**Prämisse:** Eigenständiges Projekt ohne Grundlage eines bestehenden Geschäfts. Keine Partner, keine Bestandskunden, kein Netzwerk vorausgesetzt.

---

## 1. Die Idee & das Geschäftsmodell

**Ein Ort, an dem sich Arbeitgeber und Arbeitnehmer aus Lager & Logistik finden — direkt auf WhatsApp.**

Das Problem, das du löst:
- **Arbeitgeber** (Lagerbetriebe, Speditionen, Fulfillment, Produktion, Personaldienstleister) finden über Indeed & Co. zu wenige oder unpassende Bewerber, zahlen dort aber hohe Anzeigenpreise. Jede unbesetzte Stelle kostet täglich Geld.
- **Arbeitnehmer** (Staplerfahrer, Kommissionierer, Fachlageristen, Lagerhelfer) hassen klassische Bewerbungsprozesse: Portale, Logins, Anschreiben. Ihr Medium ist WhatsApp — Bewerbung in 2 Minuten per Chat ist das Killer-Feature.

**Dein Produkt:** Du betreibst den Marktplatz. Arbeitgeber liefern Stellen, Arbeitnehmer liefern Reichweite und Profile — du kontrollierst die Mitte und monetarisierst die Arbeitgeberseite (Details in §9). Das Projekt ist bewusst so gebaut, dass es **ohne Startkapital** funktioniert: WhatsApp-Kanal + WhatsApp Business App + ein Google Sheet. Mehr braucht der Start nicht.

**Der Wettbewerbsvorteil** ist nicht Technologie, sondern Fokus + Medium: eine spitze Nische (nur Lager/Logistik), das Medium der Zielgruppe (WhatsApp statt Jobportal) und Geschwindigkeit (Antwort in unter 1 Stunde statt Bewerbungsprozess in 3 Wochen).

---

## 2. Die wichtigste Grundsatzentscheidung: Kanal ≠ Gruppe

WhatsApp bietet drei Werkzeuge — die Wahl entscheidet über das ganze Konzept:

| | WhatsApp **Kanal** | WhatsApp **Gruppe** | WhatsApp **Business (1:1)** |
|---|---|---|---|
| Richtung | Nur du sendest (Broadcast) | Alle schreiben | Direktchat |
| Follower sichtbar? | Nein, anonym | Ja, Nummern sichtbar | — |
| Teilnehmerlimit | Unbegrenzt | 1.024 | — |
| Risiko | Gering | Spam, Streit, DSGVO (Nummern aller sichtbar!) | Gering |
| Rolle im Projekt | **Schaufenster & Reichweite** | ❌ Nicht als Hauptort | **Matching & Abschluss** |

**Entscheidung: Der Kanal bleibt Kanal (Broadcast), das Matching läuft über deine WhatsApp-Business-Nummer.**

Warum keine Gruppe als Hauptort:
- In einer Gruppe sehen alle Mitglieder gegenseitig ihre Handynummern → Datenschutzproblem und unprofessionell (Arbeitgeber wollen nicht, dass Wettbewerber mitlesen; Kandidaten wollen nicht öffentlich als suchend markiert sein).
- Gruppen verwildern: Spam, Off-Topic, Moderationsaufwand.
- Würden sich beide Seiten frei in einer Gruppe finden, wärst du überflüssig. Im Kanal-Modell läuft **jeder Kontakt über dich** — du bist der Flaschenhals, und genau dort entsteht dein Geschäftsmodell.

### Die Funnel-Architektur (Herzstück)

```
   ARBEITGEBER                            ARBEITNEHMER
        │                                      │
        │  Stelle melden                       │  Kanal abonnieren
        ▼                                      ▼
  ┌─────────────────────────────────────────────────┐
  │        WHATSAPP-KANAL (Broadcast)               │
  │  • Job-Posts (mit Job-Code)                     │
  │  • Kandidaten-Profile (anonymisiert)            │
  │  • Markt-Infos, Gehälter, Tipps                 │
  └─────────────────────────────────────────────────┘
        │                                      │
        │ „Interesse? Schreiben Sie uns:"      │ „Auf diese Stelle bewerben:"
        ▼                                      ▼
  ┌─────────────────────────────────────────────────┐
  │   DEINE WHATSAPP-BUSINESS-NUMMER (1:1)          │
  │  • Kandidaten-Profil aufnehmen & vorprüfen      │
  │  • Arbeitgeber-Bedarf qualifizieren             │
  └─────────────────────────────────────────────────┘
                        │
                        ▼
              MATCH: Du stellst den Kontakt her
              (Kandidat ↔ Arbeitgeber)
              → hier sitzt deine Monetarisierung
```

Jeder Post im Kanal endet mit **einem** Call-to-Action, der in den 1:1-Chat führt. Kontaktdaten beider Seiten bleiben bei dir, bis ein Match zustande kommt.

---

## 3. Zielgruppen im Detail

### Seite 1: Arbeitgeber (deine zahlende Seite)

| Segment | Ansprechpartner | Typischer Bedarf |
|---|---|---|
| Intralogistik / Lagerbetriebe | Lagerleiter, HR | Fachkräfte + Helfer, dauerhaft |
| Speditionen & Transport | Disponent, Inhaber | Lagerpersonal, Verlader |
| E-Commerce / Fulfillment | Standortleiter, HR | Saisonspitzen, hohe Fluktuation |
| Produktion mit eigenem Lager | Werksleiter, HR | Staplerfahrer, Kommissionierer |
| Großhandel / Cash & Carry | Marktleiter | Lagerhelfer, Nachschub |
| **Personaldienstleister / Zeitarbeit** | Disponent, Vertrieb | Konstant hoher Kandidatenhunger — **die dankbarsten Erstkunden**, weil sie permanent suchen und Reichweite sofort bezahlen |

### Seite 2: Arbeitnehmer (deine Reichweiten-Seite)

| Profil | Beispiele | Besonderheit |
|---|---|---|
| Fachkräfte | Fachkraft für Lagerlogistik, Fachlagerist, Lagermeister | Wechselbereit bei besserem Gehalt/Schicht |
| Angelernte | Staplerfahrer (mit Schein), Kommissionierer, Verpacker | Große Masse, schnell vermittelbar |
| Helfer | Lagerhelfer, Be-/Entlader | Schnellster Einstieg, hohes Volumen |
| Internationale Kandidaten | Zugewanderte Fachkräfte, Anerkennungs-Fälle | Unterversorgte Gruppe — Wissens-Content dazu bindet sie stark |

### Gewichtung: 70 % Kandidaten-Content, 30 % Arbeitgeber-Content

Kandidaten sind die knappe Ressource und das Fundament: Ohne Publikum kannst du Arbeitgebern nichts verkaufen. Deshalb wird zuerst die Kandidaten-Reichweite aufgebaut (Phase 1 in §7) — Arbeitgeber folgen, sobald du Zahlen vorweisen kannst.

---

## 4. Positionierung & Kanal-Identität

### Naming

Der Kanalname muss in der WhatsApp-Suche gefunden werden. Suchbegriffe der Zielgruppe: „Jobs", „Lager", „Logistik", „Arbeit".

**Empfohlenes Muster:** `Lager & Logistik Jobs Deutschland 🇩🇪📦`
- Keyword-stark (findbar), Region klar, Emoji als Blickfang in der Liste.
- Alternativen: `Logistik Jobs DE — Lager, Stapler & Co.` / `Jobbörse Lager & Logistik 📦`
- **Nicht:** Fantasienamen — danach sucht niemand.

### Kanalbeschreibung (Copy-Paste-Vorlage)

> 📦 **Jobs in Lager & Logistik — täglich neu.**
> Staplerfahrer, Kommissionierer, Fachlageristen, Lagerhelfer & mehr.
> ✅ Bewerben in 2 Minuten per WhatsApp — ohne Anschreiben
> ✅ Festanstellung & Zeitarbeit, deutschlandweit
> 🏢 Arbeitgeber: Stelle melden 👉 [deine Business-Nummer]
> Impressum: [Link]

### Profilbild

Einfach, hoher Kontrast, auch als Mini-Kreis erkennbar: Paketsymbol oder Stapler-Piktogramm auf einfarbigem Grund, kein Foto, kein kleinteiliges Logo.

### Tonalität

Direkt, einfach, per „du" gegenüber Kandidaten (branchenüblich), per „Sie" in Arbeitgeber-Posts. Kurze Sätze. Keine HR-Floskeln. Emojis gezielt als Struktur (📍💰⏰), nicht als Deko-Flut.

---

## 5. Content-Strategie

### Die 6 Formate (Content-Mix)

| Format | Anteil | Zweck | Frequenz |
|---|---|---|---|
| 🟢 **Job-Post** (gemeldete Stelle) | ~45 % | Kernprodukt, bringt Bewerber in den 1:1-Chat | 3–5×/Woche |
| 📡 **Job-Radar** (kuratierte öffentliche Stellen mit Quellenlink) | Start-Phase | Füllt den Kanal, solange noch wenige Arbeitgeber selbst melden — wird schrittweise durch 🟢 ersetzt | nach Bedarf |
| 🔵 **Kandidaten-Profil** (anonymisiert) | ~15 % | Zeigt Arbeitgebern: Hier gibt es Leute → erzeugt Arbeitgeber-Anfragen | 1–2×/Woche |
| 🟡 **Markt & Gehalt** („Was verdient ein Staplerfahrer in NRW?") | ~15 % | Teilen-Faktor! Wird weitergeleitet → organisches Wachstum | 1×/Woche |
| 🟠 **Tipps & Wissen** (Staplerschein, Schichtmodelle, Anerkennung) | ~15 % | Vertrauen, hält Abonnenten auch ohne akuten Jobwunsch | 1×/Woche |
| 🔴 **Umfrage/Interaktion** | ~10 % | Engagement-Signal, Marktforschung | 1×/Woche |

**Zum Job-Radar:** In den ersten Wochen hast du noch kaum direkt gemeldete Stellen. Kuratiere dann öffentlich ausgeschriebene Stellen als kurze Zusammenfassung **mit Quellenlink zur Original-Anzeige** (kein Kopieren fremder Anzeigentexte — Urheberrecht). Das hält den Kanal lebendig und zeigt Arbeitgebern nebenbei, wie ihre Stelle hier aussehen könnte.

> Die konkreten Post-Vorlagen stehen in `VORLAGEN.md`, der 30-Tage-Startplan in `30-TAGE-PLAN.md`.

### Posting-Regeln

- **Frequenz:** 1–2 Posts pro Tag, nie mehr als 3. Kanal-Posts erzeugen Push-Benachrichtigungen — zu viele = Stummschalten oder Deabonnieren.
- **Zeiten:** Zielgruppe arbeitet in Schichten. Beste Slots: **6:00–7:30** (vor Frühschicht), **13:30–14:30** (Schichtwechsel), **19:00–21:00** (Feierabend). 2 Wochen testen, Views je Slot vergleichen.
- **Jeder Post = 1 Botschaft + 1 CTA.** Nie zwei Jobs in einem Post.
- **AGG-Pflicht:** Jede Stellenanzeige geschlechtsneutral — immer **(m/w/d)**. Keine Altersgrenzen, keine Herkunftsbezüge außer objektiv nötigen Sprachkenntnissen.
- **Immer Lohnangabe:** Posts mit €-Spanne performen deutlich besser.

---

## 6. Prozesse & Betrieb

### Prozess 1: Arbeitgeber-Akquise (deine aktive Vertriebsarbeit)

Von null heißt: Die ersten Arbeitgeber holst du selbst. Kanäle dafür:

1. **Direktansprache** von Lagerbetrieben, Speditionen und Zeitarbeitsfirmen in deiner Region (Telefon, E-Mail, LinkedIn): „Wir erreichen [X] Lager-Kandidaten direkt auf WhatsApp — Ihre Stelle posten wir aktuell kostenlos."
2. **Reaktion auf öffentliche Ausschreibungen:** Firmen, die seit Wochen auf Indeed/Kleinanzeigen suchen, haben bewiesenen Schmerz — perfekte Erstansprache.
3. **Inbound über den Kanal selbst:** Der wöchentliche Arbeitgeber-Post (V9) + Kandidaten-Profile erzeugen Anfragen, sobald Reichweite da ist.

Aufnahme per 1:1-Chat/Anruf: Rolle, Ort, Schicht, Lohnspanne, Start, Festanstellung oder Zeitarbeit, Firma nennen ja/nein. → Post nach Vorlage in den Kanal.

### Prozess 2: Kandidat bewirbt sich

1. Kandidat schreibt auf den Job-Post an deine Business-Nummer, mit Job-Code (z. B. „LOG-014").
2. **Schnellantwort** (WhatsApp Business Funktion) fragt das Mini-Profil ab:
   > Super, danke für dein Interesse! 🙌 Schick uns kurz:
   > 1️⃣ Name + Wohnort (PLZ)
   > 2️⃣ Welche Erfahrung hast du im Lager? (Jahre + Aufgaben)
   > 3️⃣ Staplerschein? (ja/nein)
   > 4️⃣ Ab wann kannst du starten?
   > 5️⃣ Schicht: Früh/Spät/Nacht — was geht?
3. Mit **Labels** sortieren: `Neu` → `Qualifiziert` → `Vorgestellt` → `Vermittelt` / `Pool`.
4. **Match:** Du prüfst grob (Profil vollständig? Anforderungen erfüllt?) und stellst den Kontakt zum Arbeitgeber her — mit dokumentierter Einwilligung des Kandidaten (§8).
5. Kein passender Job? → Pool + ggf. anonymisiertes Kandidaten-Profil in den Kanal.

### Prozess 3: Der Kandidaten-Pool als wachsendes Asset

Simple Tabelle (Google Sheets reicht): Datum, Name, PLZ, Qualifikation, Staplerschein, Verfügbarkeit, Schichtbereitschaft, Wunschlohn, Status, Einwilligung erteilt am. Der Pool ist dein eigentliches Kapital: Ab ~50 Profilen kannst du Arbeitgebern aktiv Kandidaten anbieten statt nur Posts zu verkaufen.

### Aufwand realistisch halten

Start: **1–2 Stunden/Tag** (Posts, Chats, Akquise). Posts sonntags vorproduzieren, Schnellantworten nutzen. Die Akquise-Stunde ist die wichtigste — Content ohne Arbeitgeber ist ein Hobby, kein Business.

---

## 7. Wachstumsstrategie (0 → 1.000 Abonnenten, ohne Budget)

### Phase 1: Kandidaten-Reichweite (Woche 1–4, Ziel: 100–150 Abos)

- **Erst füllen, dann teilen:** 5–8 Posts müssen im Kanal stehen, bevor du den Link streust — niemand abonniert einen leeren Kanal (siehe OPTIMIERUNG.md).
- **Facebook-Gruppen sind die Goldmine:** „Lagerjobs [Stadt]", „Jobs in Deutschland", Zeitarbeits- und Community-Gruppen. Echte Job-Posts regelkonform teilen, Kanal-Link als Quelle.
- **Kleinanzeigen (Jobs-Rubrik):** kostenlose Inserate mit „Alle aktuellen Stellen: [Kanal-Link]".
- Persönliches Umfeld + WhatsApp-Status als Startpublikum.

### Phase 2: Organische Hebel + erste Arbeitgeber (Monat 2–3, Ziel: 300–500)

- **Weiterleitungs-Mechanik:** Gehalts- und Wissens-Posts explizit zum Teilen bauen: „📤 Leite das an jemanden weiter, der im Lager arbeitet." Das ist der stärkste kostenlose Wachstumskanal.
- **TikTok/Instagram Reels** (wenn Kapazität): 20-Sekunden-Videos „Job der Woche: Staplerfahrer, 17 €/h, Dortmund" → Link in Bio. Die Zielgruppe scrollt TikTok.
- **Parallel: Arbeitgeber-Akquise starten** (Prozess 1) — mit ersten Reichweiten-Zahlen als Verkaufsargument.
- **QR-Code** überall: Aushänge (Supermarkt, Kiosk, Berufsschule — mit Erlaubnis), E-Mail-Signatur, Flyer.

### Phase 3: Skalierung (ab Monat 4)

- Empfehlungsanreiz: „Bring einen Kollegen — wenn er vermittelt wird, gibt's [Prämie]."
- Kooperationen: Staplerschein-Schulen, Berufssprachkurse, Bildungsträger (deren Absolventen suchen Jobs, deine Arbeitgeber suchen Leute).
- Regionale Ableger erst ab ~2.000 Abonnenten (z. B. „Lager & Logistik Jobs NRW") — vorher zersplittert das die Reichweite.

---

## 8. Recht & Datenschutz (Pflichtteil, kurz & praktisch)

1. **Impressumspflicht:** Der Kanal ist geschäftlich → Impressum-Link in die Kanalbeschreibung (kostenlose One-Pager-Seite reicht). Dazu Gewerbeanmeldung nicht vergessen, sobald Einnahmen fließen.
2. **AGG:** Alle Stellen (m/w/d), keine Alters-/Herkunfts-/Geschlechtsbezüge. Verstöße können Entschädigungsklagen auslösen — das Risiko trifft auch den Veröffentlichenden.
3. **DSGVO bei Kandidatendaten:**
   - Kandidaten-Profile im Kanal **immer anonymisiert** (kein Name, kein Foto, PLZ-Region statt Adresse).
   - Vor Weitergabe an einen Arbeitgeber: **dokumentierte Einwilligung**. Ein Chat-Baustein reicht: „Ich gebe dein Profil an [Firma] weiter, die dich direkt kontaktiert. Bist du einverstanden? (Ja/Nein)" — Antwort archivieren.
   - Datenschutzhinweis-Link neben dem Impressum.
   - WhatsApp Business App ist für den Start okay; bei wachsendem Volumen auf die WhatsApp Business Platform (API) mit AV-Vertrag wechseln.
4. **Vermittlungsrecht:** Private Arbeitsvermittlung ist in Deutschland **erlaubnisfrei** — du darfst als Einzelunternehmer vermitteln und dafür vom Arbeitgeber Provision nehmen. Wichtig: **Niemals vom Arbeitnehmer** Vermittlungshonorar verlangen (§ 296 SGB III begrenzt das stark — sauberste Regel: Kandidaten zahlen nie). **Arbeitnehmerüberlassung** (selbst Leute anstellen und verleihen) bräuchte eine AÜG-Erlaubnis — das machst du nicht, du vermittelst nur Kontakte.
5. **Urheberrecht beim Job-Radar:** Fremde Anzeigentexte nicht kopieren — eigene Kurzfassung + Quellenlink.
6. **Kein Nummern-Scraping:** Kaltakquise per WhatsApp-Direktnachricht an Privatpersonen ohne Einwilligung ist UWG-riskant. Der Kanal ist genau deshalb das richtige Modell: **Die Leute kommen zu dir.** (B2B-Telefonakquise bei Firmen mit mutmaßlichem Interesse ist der übliche Weg für die Arbeitgeberseite.)

---

## 9. Monetarisierung — Stufenplan (die Arbeitgeberseite zahlt)

| Stufe | Wann | Modell | Preisidee |
|---|---|---|---|
| **0. Aufbau** | Monat 1–2 | Alles kostenlos. Ziel: Reichweite + erste Arbeitgeber + erste erfolgreiche Matches als Referenz. | 0 € |
| **1. Erfolgsprovision** | ab dem 1. Match | **Vermittlungsprämie pro Einstellung** — das natürlichste Modell, null Risiko für den Arbeitgeber: „Sie zahlen nur, wenn Sie einstellen." | Helfer 300–500 €, Fachkraft 750–1.500 € pro Einstellung (mit 30-Tage-Bestandsgarantie) |
| **2. Featured Posts** | ab ~500 Abos | Hervorgehobener Job-Post mit Firmenname + Logo + Pin-Wiederholung für Arbeitgeber, die Reichweite statt Vermittlung wollen (v. a. Zeitarbeitsfirmen). | 49–99 € pro Post, Pakete (5er/10er) mit Rabatt |
| **3. Abo für Vielposter** | ab ~1.000 Abos | Monatspaket für Personaldienstleister und Großarbeitgeber: X Posts/Monat + bevorzugter Pool-Zugriff. | 199–399 €/Monat |
| **4. Erweiterung** | bei Skalierung | Regionale Ableger, aktive Kandidatensuche als Premium-Service („Wir liefern Ihnen 3 vorgeprüfte Profile in 7 Tagen"). | individuell |

**Grundsätze:**
- **Kandidaten zahlen nichts, niemals** — rechtlich geboten und strategisch richtig: Sie sind dein Inventar und deine Reichweite.
- Starte mit Stufe 1 (Erfolgsprovision), nicht mit Post-Gebühren: Ohne Reichweiten-Beweis kauft niemand Posts, aber „zahlen nur bei Einstellung" kauft jeder mit echtem Bedarf.
- Schriftliche Vereinbarung pro Arbeitgeber (eine A4-Seite reicht): Provisionshöhe, Fälligkeit (z. B. nach bestandener Probezeit-Woche 4), Bestandsgarantie, Definition „Vermittlung" (von dir vorgestellter Kandidat wird innerhalb 6 Monaten eingestellt).

---

## 10. KPIs & Erfolgsmessung

Wöchentlich messen (Sonntag, 10 Minuten, in ein Sheet):

| KPI | Ziel Monat 1 | Ziel Monat 3 | Ziel Monat 6 |
|---|---|---|---|
| Abonnenten | 100–150 | 500 | 1.500 |
| Ø Views pro Post | > 40 % der Abos | > 35 % | > 30 % |
| Bewerber-Chats pro Woche | 3–5 | 15–20 | 40+ |
| Aktive Arbeitgeber (mind. 1 Stelle live) | 2–3 | 8–10 | 20+ |
| **Vermittlungen (Matches)** | 0–1 | 3–5/Monat | 10+/Monat |
| **Umsatz** | 0 € | 1.500–2.500 €/Monat | 5.000 €+/Monat |

**Die entscheidenden Zahlen sind Vermittlungen und Umsatz.** Views und Abos sind Frühindikatoren — das Business ist erfolgreich, wenn Matches zustande kommen und bezahlt werden.

Beispielrechnung Monat 6: 10 Vermittlungen × Ø 500 € = 5.000 € + 4 Featured Posts × 79 € ≈ **5.300 €/Monat** — als Ein-Personen-Projekt ohne Startkapital.

**Abbruch-/Pivot-Kriterium:** Nach 3 Monaten konsequenter Umsetzung < 200 Abos **und** 0 Vermittlungen → Region oder Format wechseln (mehr Video, engere Stadt-Fokussierung) statt einfach weitermachen.

---

## 11. Roadmap auf einen Blick

- **Woche 1:** Kanal-Setup nach `OPTIMIERUNG.md` (Name, Beschreibung, Bild, Impressum), 5–8 Basis-Posts (Job-Radar + Wissen + Gehalt), Schnellantworten + Labels in WhatsApp Business.
- **Woche 2–4:** 30-Tage-Plan fahren (`30-TAGE-PLAN.md`): Kandidaten-Seeding über Facebook-Gruppen, Kleinanzeigen, Status. Parallel erste 10 Arbeitgeber direkt ansprechen („aktuell kostenlos posten").
- **Monat 2–3:** Posting-Rhythmus stabil, Gehalts-Posts als Wachstumshebel, Pool füllen, **erste Erfolgsprovisions-Vereinbarungen abschließen**, erstes Match als Referenz dokumentieren.
- **Monat 4+:** Featured Posts einführen, Zeitarbeitsfirmen als Abo-Kunden gewinnen, Empfehlungsprogramm, ggf. regionaler Ableger.
