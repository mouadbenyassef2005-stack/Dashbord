# Konzept: Die automatisierte Terminmaschine — M&F Sales Counsel

**Frage:** Wie bekommt M&F Sales Counsel für seine Kunden (Personalvermittler) automatisiert Termine, statt jeden Termin manuell per Kaltakquise zu erarbeiten?

**Geschäftsmodell zur Einordnung (A–B–C):**
- **A = M&F Sales Counsel** (du): verkauft "Sales as a Service", Leistung = Termine.
- **B = deine Kunden**: Personalvermittler. Aktuell: 1× Azubi-/Fachkräfte-Vermittlung aus Marokko, 2× deutsche Personaldienstleister mit Arbeitnehmerüberlassung (ANÜ).
- **C = die Endkunden von B**: Unternehmen mit Personalbedarf, die du für B terminierst.
- **Bezahlmodell:** 250 €/Termin (Testphase, 5 Termine), danach 350 €/Termin — bezahlt wird nur, wenn der Termin **stattfindet** (Show), nicht wenn B abschließt.

Daraus folgt die wichtigste Nebenbedingung für jede Automatisierung: **Kosten pro tatsächlich stattgefundenem Termin müssen deutlich unter 250–350 € bleiben**, sonst frisst die Automatisierung die Marge auf, bevor sie skaliert.

---

## 1. Warum reine Kaltakquise nicht automatisiert skaliert

Der Anruf selbst (Gesprächsführung, Einwandbehandlung, Terminvereinbarung) ist aktuell dein Kernprodukt und lässt sich nicht 1:1 durch Software ersetzen, ohne Conversion-Rate zu verlieren — B2B-Termine mit echtem Bedarf entstehen überwiegend noch am Telefon. Was sich aber sehr gut automatisieren lässt, ist **alles davor und danach**:

- **Davor:** Wen rufst du an? Woher weißt du, dass C gerade Bedarf hat? Wie kommst du an Telefonnummer/Ansprechpartner?
- **Danach:** Landet der Termin sicher im Kalender? Erscheint C wirklich (Show-Rate)?

Genau hier liegt der Hebel: nicht "Cold Calling ersetzen", sondern **Cold Calling mit einer automatisierten Vor- und Nachlaufkette umgeben**, damit du (oder zukünftig weitere Caller) nur noch die heißesten Kontakte anrufst und weniger Termine durch No-Shows verloren gehen.

---

## 2. Die Terminmaschine — Architektur

```
 1. SIGNAL-SOURCING (automatisiert)
    → Wer hat JETZT wahrscheinlich Personalbedarf?
        │
 2. ANREICHERUNG (automatisiert)
    → Telefonnummer, Ansprechpartner, Firmengröße
        │
 3. SCORING & PRIORISIERUNG (automatisiert)
    → Rangliste: heißester Lead zuerst
        │
 4. MULTI-CHANNEL-VORWÄRMUNG (teilautomatisiert)
    → E-Mail/LinkedIn vor dem Anruf, erhöht Erreichbarkeit
        │
 5. DER ANRUF (manuell, dein Kernprodukt)
    → Termin wird vereinbart
        │
 6. BUCHUNG (automatisiert)
    → Direkt in den Kalender von B, Bestätigung an C
        │
 7. SHOW-UP-SICHERUNG (automatisiert)
    → Erinnerungen per SMS/WhatsApp/E-Mail (24h + 1h vorher)
        │
 8. REPORTING AN B (automatisiert)
    → Live-Dashboard: Termine, Status, Show/No-Show
```

Jeder Block außer 5 lässt sich ganz oder teilweise ohne dich laufen lassen. Das ist der Weg von "ich mache jeden Termin persönlich" zu "ich betreibe eine Maschine, die Termine produziert, und konzentriere meine Zeit auf die wertvollste Stunde: den Anruf."

---

## 3. Segmentierung: Zwei völlig unterschiedliche Lead-Maschinen

Deine beiden Kundentypen brauchen **unterschiedliche Signal-Quellen**, weil ihre C-Zielgruppen unterschiedlich sind. Eine Maschine für beide zu bauen wäre ein Fehler — die Signale, an denen man "akuten Bedarf" erkennt, unterscheiden sich.

### Segment 1: Azubi-/Fachkräfte-Vermittlung aus Marokko

**C = deutsche Betriebe mit Fachkräftemangel** (Handwerk, Kfz, Pflege, Bau, Produktion), die seit Wochen erfolglos auf Indeed/Kleinanzeigen ausschreiben.

- **Signal:** Eine öffentlich seit Wochen laufende Stellenausschreibung ist der bestmögliche Kaltakquise-Trigger — bewiesener Schmerz, kein Rätselraten.
- **Bereits im Repo vorhanden:** `kfz-leads-scraper/` — ein Apify-Actor, der genau das automatisiert: Google-Jobs-Suche nach offenen Stellen (aktuell Kfz-Mechatroniker), Filterung auf deutsche Standorte, Anreicherung mit Telefonnummer/Website/Adresse über Google Maps. **Das ist Baustein 1+2 der Terminmaschine, bereits gebaut.**
- **Ausbaustufen:**
  1. Weitere Berufsbilder als eigene Actor-Konfigurationen ergänzen (Pflegefachkraft, Bauhelfer, Elektriker — je nachdem, welche Profile dein Kunde aus Marokko tatsächlich vermittelt).
  2. Scoring ergänzen: mehrfach ausgeschriebene Stellen / mehrere offene Positionen derselben Firma = höherer Score (Signal für strukturellen Mangel statt Einzelfall).
  3. Output nicht nur als Dataset, sondern direkt als tägliche Anruf-Liste (CSV/Sheet, sortiert nach Score) ausgeben — das ersetzt "Leads suchen" komplett durch "Liste abarbeiten".

### Segment 2: ANÜ-Personaldienstleister (2 Kunden, Deutschland)

**C = Unternehmen mit Bedarf an Zeitarbeitskräften**, typischerweise Lager/Logistik, Produktion, Fulfillment — hohe Fluktuation, ständiger Nachschubbedarf.

- **Signal:** Analog zu Segment 1 über Stellenausschreibungen (Lagerhelfer, Staplerfahrer, Kommissionierer, Produktionshelfer) — derselbe Scraper-Mechanismus wie bei `kfz-leads-scraper`, nur mit anderen Suchbegriffen/Branchenfokus.
- **Zusätzlicher, bereits im Repo skizzierter Baustein:** `whatsapp-kanal/` — das Konzept für einen WhatsApp-Kanal "Lager & Logistik Jobs" ist ursprünglich als eigenständiges Vermittlungs-Geschäft gedacht, lässt sich aber auch **als Inbound-Signalquelle für die Terminmaschine umnutzen**: Firmen, die dort selbst eine Stelle melden ("Stelle melden" CTA in §6 des Konzepts), sind hochqualifizierte Warm-Leads für einen ANÜ-Kunden von M&F — noch bevor du überhaupt anrufen musst, hat die Firma bereits aktiv Kontakt gesucht.
- **Praktisch heißt das:** Der Kanal muss nicht als eigenes Geschäftsmodell zu Ende gedacht werden, um nützlich zu sein — schon die Reichweite bei Arbeitgebern (Prozess 1 im Konzept: Direktansprache, Job-Radar) erzeugt Inbound-Anfragen, die du 1:1 an deine ANÜ-Kunden als Termin weiterreichst, ggf. sogar provisionsfrei für dich attraktiver, weil der Erstkontakt nicht mehr kalt ist.

---

## 4. Tech-Stack für die Automatisierung

Kein Overengineering nötig — die Maschine muss mit wenigen, gut verzahnten Werkzeugen laufen:

| Baustein | Werkzeug-Empfehlung | Zweck |
|---|---|---|
| Signal-Sourcing | Apify-Actors (wie `kfz-leads-scraper`), Google Jobs/Indeed-Scraper | Firmen mit akutem Bedarf finden |
| Anreicherung | Google Maps Scraper (bereits im Actor integriert), LinkedIn-Sales-Navigator für Ansprechpartner | Telefonnummer + richtiger Ansprechpartner statt Zentrale |
| Scoring/Priorisierung | Google Sheets/Airtable mit einfacher Formel (Anzahl offene Stellen × Dauer der Ausschreibung) | Tages-Anrufliste automatisch sortiert |
| Vorwärmung (optional) | Kurze automatisierte E-Mail/LinkedIn-Sequenz vor dem Anruf | Erreichbarkeit & Termin-Quote erhöhen (siehe Marktdaten unten) |
| CRM / Pipeline | Pipedrive oder HubSpot (kostenloser Einstieg reicht) | Anrufstatus, Wiedervorlage, Termin-Historie je Kunde B |
| Terminbuchung | Cal.com / Calendly, direkt im Kalender von B | Kein manuelles Eintragen mehr, C bucht/bestätigt selbst |
| Show-Up-Sicherung | Automatisierte Reminder per WhatsApp/SMS/E-Mail 24h + 1h vorher | **Direkter Umsatzhebel**, da nur Show bezahlt wird |
| Reporting an B | Automatisch generiertes Wochen-Dashboard (Termine, Status) | Vertrauen & Transparenz gegenüber deinen Kunden B |
| Automations-Kleber | Make.com oder Zapier | Verbindet Scraper → Sheet → CRM → Reminder ohne Custom-Code |

**Zur Marktlage (Stand 2026):** Mehrkanalige, KI-gestützte Sequenzen (E-Mail + LinkedIn + Telefon) erzielen laut aktuellen Branchenanalysen rund 2,3× höhere Conversion als Einzelkanal-Ansprache, und KI-optimiertes Timing/Messaging verbessert Terminquoten um 30–40 %. Reine "AI-SDR"-Plattformen (z. B. Artisan/Ava, 11x/Alice, Apollo) automatisieren komplette Outbound-Sequenzen inklusive Recherche und Erstansprache — für M&F aktuell v. a. als **Vorwärmung vor dem Anruf** relevant, nicht als Ersatz des Calls selbst, weil bei hochpreisigen B2B-Terminen der menschliche Anruf weiterhin die höchste Abschlussrate liefert. Sinnvoll einzusetzen, sobald das Lead-Volumen pro Segment größer wird, als du/dein Team allein anrufen können.

---

## 5. Show-Up-Sicherung: der unterschätzte Umsatzhebel

Weil deine Provision an **Show**, nicht an Abschluss hängt, ist die Reduktion von No-Shows die Automatisierung mit dem direktesten Effekt auf deinen Umsatz — noch vor mehr Leads:

- Automatische Bestätigung sofort nach Terminvereinbarung (E-Mail + WhatsApp).
- Reminder 24 Stunden vorher mit Option zum Verschieben statt Absagen.
- Reminder 1 Stunde vorher.
- Diese drei Nachrichten lassen sich vollständig über Cal.com/Calendly-Webhooks + Make.com ohne manuellen Aufwand pro Termin einrichten — einmal bauen, für alle Kunden B wiederverwenden.

---

## 6. Wirtschaftlichkeit im Blick behalten

Vor dem Ausbau jeder Automatisierungsstufe rechnen:

- **Kosten pro generiertem Lead** (Scraper-/Tool-Kosten ÷ nutzbare Leads)
- **Lead-zu-Termin-Quote** (wie viele Anrufe braucht es aktuell pro Termin?)
- **Show-Rate** (wie viel % der vereinbarten Termine finden statt?)
- **Effektive Kosten pro Show** = alles oben zusammen — muss klar unter 250 €/350 € bleiben, inklusive deiner eigenen Zeit für den Call.

Erst wenn diese Kennzahlen für ein Segment sauber stehen, lohnt sich der nächste Automatisierungsschritt (z. B. Vorwärmungs-Sequenzen zukaufen) für genau dieses Segment — nicht pauschal für beide gleichzeitig.

---

## 7. Rollout-Reihenfolge (pragmatisch)

1. **Sofort:** `kfz-leads-scraper` auf die tatsächlichen Zielberufe deines Marokko-Kunden erweitern/anpassen, Output als tägliche priorisierte Anrufliste statt Rohdaten.
2. **Sofort:** Reminder-Automatisierung (Schritt 7) für alle laufenden Termine beider Kundensegmente einrichten — kostet wenig, wirkt sofort auf die Show-Rate.
3. **Kurzfristig:** Analogen Scraper für Segment 2 (Lager/Logistik/Produktion-Stellenanzeigen) bauen, als zweite Quelle neben Direktansprache.
4. **Mittelfristig:** `whatsapp-kanal`-Konzept als Inbound-Ergänzung für die ANÜ-Kunden aktivieren, um warme statt kalte Erstkontakte zu erzeugen.
5. **Bei Volumen:** Vorwärmungs-Sequenzen (E-Mail/LinkedIn) vor dem Call ergänzen, sobald ein Segment mehr Leads liefert, als aktuell angerufen werden können.

---

## Quellen (Markttrends KI-SDR/Outbound, Stand 2026)

- [10 Best AI SDR Tools for B2B Sales Teams in 2026 — 11x.ai](https://www.11x.ai/guides/ai-sdr-tools-b2b-sales-teams)
- [Best AI SDR Tools 2026: We Tested 15 — Knock AI](https://www.knock-ai.com/blog/ai-sdr-tools)
- [AI SDR & Outbound Automation Statistics & Trends 2026 — Brilo AI](https://www.brilo.ai/resources/ai-sdr-tools-outbound-automation-trends)
