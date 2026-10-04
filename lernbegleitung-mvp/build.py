import re, subprocess, pathlib
D = pathlib.Path(__file__).parent
ICONS = {
 'monitor':'<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>',
 'user':'<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
 'chart':'<path d="M12 20V10M18 20V4M6 20v-4"/>',
 'check':'<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/>',
 'home':'<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
 'clock':'<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
 'target':'<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
 'cal':'<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
 'book':'<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5z"/>',
 'search':'<circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>',
 'users':'<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
 'up':'<path d="M23 6l-9.5 9.5-5-5L1 18"/><path d="M17 6h6v6"/>',
 'x':'<path d="M18 6L6 18M6 6l12 12"/>',
 'shield':'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
 'file':'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8"/>',
 'flag':'<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><path d="M4 22v-7"/>',
 'edit':'<path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4z"/>',
 'msg':'<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
 'plus':'<path d="M12 5v14M5 12h14"/>',
 'eq':'<path d="M5 9h14M5 15h14"/>',
 'repeat':'<path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>',
}
def ico(m):
    p=m.group(1).split(':'); n=p[0]; s=p[1] if len(p)>1 else '16'; c=p[2] if len(p)>2 else 'currentColor'
    c={'w':'#fff','n':'#0B1F3A','a':'#FFB020'}.get(c,c)
    return f'<svg class="ic" width="{s}" height="{s}" viewBox="0 0 24 24" fill="none" stroke="{c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">{ICONS[n]}</svg>'
TOTAL=12
ZOOM={2:1.12,3:1.05,4:1.22,5:1.18,6:1.05,7:1.28,8:1.2,9:1.12,10:1.4,11:1.2,12:1.35}
def page(n,kick,title,lead,body):
    return f'''<section class="page"><div class="hd"><div><div class="kick">{kick}</div><h1>{title}</h1></div><div class="lead">{lead}</div></div><div class="body" style="zoom:{ZOOM.get(n,1)}">{body}</div><div class="foot"><span>Lernbegleitung 5–13 · MVP Blueprint · Arbeitstitel (Annahme)</span><span>{n} / {TOTAL}</span></div></section>'''
P=[]

# ---------- 1 EXEC SUMMARY ----------
steps=[('user','SCHÜLER','Kl. 5–13'),('search','LERN-DIAGNOSE','Status & Ziel'),('monitor','ONLINE-PROGRAMM','5–15 Min. Module'),('user','PERSÖNLICHER MENTOR','Student:in als Lernbegleiter'),
       ('home','WÖCHENTLICHER HAUSBESUCH','90 Min.'),('edit','ANWENDUNG','Methode am Schulstoff'),('chart','FORTSCHRITTS-MESSUNG','Start · Monat · Woche 12'),('up','MEHR SELBST-STÄNDIGKEIT','Ergebnis')]
def fl(items):
    out=''
    for i,(ic,t,s) in enumerate(items):
        a=' a' if i==len(items)-1 else ''
        out+=f'<div class="step{a}" style="padding:4mm 3.6mm 4mm 4.2mm;font-size:6.9pt">[[{ic}:20:{"n" if a else "w"}]]<span>{t}</span><small>{s}</small></div>'
    return f'<div class="flow">{out}</div>'
b=f'''
<div class="card n" style="padding:5mm 6mm;display:flex;justify-content:space-between;align-items:center"><div><div class="kick" style="color:var(--acc)">Product &amp; Business Concept · MVP Blueprint</div><div style="font-size:24pt;font-weight:700;line-height:1.05">Lernbegleitung für Klasse 5–13</div><div class="mut" style="margin-top:1.5mm;font-size:10pt">Digitale Lernplattform + persönlicher Mentor + messbarer Fortschritt</div></div><div style="text-align:right;font-size:8pt" class="mut">Stand: Oktober 2026<br>Version 1.0 · MVP-Konzept<br><span class="tag">Annahme</span> Arbeitstitel „Lernbegleitung“</div></div>
<div>
<div class="kick" style="margin-bottom:2mm">Das gesamte Modell in 8 Schritten</div>{fl(steps)}
</div>
<div class="row" style="flex:1">
 <div class="card f1"><div class="circ a" style="margin-bottom:2mm">[[book:18:n]]</div><h2>Was verkaufen wir?</h2><ul class="l"><li>Ein <b>12-Wochen-Programm</b> „Lernen lernen“</li><li>Online-Module + <b>wöchentlicher Hausbesuch</b> (90 Min.)</li><li>Sichtbarer <b>Fortschrittsbericht</b> für Eltern</li></ul></div>
 <div class="card f1"><div class="circ a" style="margin-bottom:2mm">[[users:18:n]]</div><h2>Für wen?</h2><ul class="l"><li><b>Schüler:innen</b> Kl. 5–13 (MVP-Fokus: Kl. 5–10)</li><li><b>Eltern</b> als Entscheider und Zahler</li><li><b>Studenten</b> als Mentoren mit flexiblem Nebenjob</li></ul></div>
 <div class="card f1"><div class="circ a" style="margin-bottom:2mm">[[target:18:n]]</div><h2>Welches Problem lösen wir?</h2><ul class="l"><li>Viele Schüler wissen nicht, <b>wie</b> man effektiv lernt</li><li>Nachhilfe behebt Fachlücken, aber selten die <b>Ursache</b></li><li>Eltern sehen kaum, ob sich etwas verbessert</li></ul></div>
 <div class="card n f1"><div class="circ a" style="margin-bottom:2mm">[[flag:18:n]]</div><h2>Was ist anders als Nachhilfe?</h2><ul class="l"><li>Erst <b>Methode</b>, dann Fachinhalt</li><li>Standardisierter Ablauf statt Zufall</li><li><b>Messbare Entwicklung</b> statt Bauchgefühl</li><li>Ziel: Schüler braucht uns <b>irgendwann weniger</b></li></ul></div>
</div>
<div class="card w" style="padding:2.5mm 4mm"><b>Versprechen (realistisch):</b> mehr Struktur, Routine und Selbstständigkeit – messbar in 12 Wochen. <b>Keine Notengarantie.</b></div>
'''
P.append(f'<section class="page" style="padding-top:10mm"><div class="body" style="zoom:1.12">{b}</div><div class="foot"><span>Lernbegleitung 5–13 · MVP Blueprint · Arbeitstitel (Annahme)</span><span>1 / {TOTAL}</span></div></section>')

# ---------- 2 ANGEBOT ----------
def pillar(letter,name,motto,ic,goal,items,benefit):
    li=''.join(f'<li>{i}</li>' for i in items)
    return f'''<div class="card w f1" style="padding:0;overflow:hidden;display:flex;flex-direction:column"><div style="background:var(--navy);color:#fff;padding:4mm 5mm;display:flex;gap:3mm;align-items:center"><div class="circ a" style="width:12mm;height:12mm">[[{ic}:22:n]]</div><div><div style="font-size:7pt;letter-spacing:.14em;color:var(--acc);font-weight:700">SÄULE {letter}</div><div style="font-size:15pt;font-weight:700;line-height:1">{name}</div><div style="font-size:8.6pt;color:#B8C5DC;margin-top:.5mm">„{motto}“</div></div></div>
<div style="padding:4mm 5mm;flex:1;display:flex;flex-direction:column;gap:3mm"><div><h3>Ziel</h3>{goal}</div><div><h3>Konkrete Leistungen</h3><ul class="l">{li}</ul></div><div class="card a" style="margin-top:auto"><h3 style="color:var(--navy)">Nutzen für den Schüler</h3>{benefit}</div></div></div>'''
b=f'''<div class="row" style="flex:1">
{pillar('A','ONLINE','Lernen lernen','monitor','Schüler kennt wirksame Lernmethoden und baut eine eigene Routine auf.',['12 Wochenmodule à 5–15 Min.','Kurze Praxisaufgaben je Modul','Lernplan &amp; Wochenziel im Schüler-Dashboard','Lernlog: „Was habe ich wie gelernt?“'],'Weiß, <b>wie</b> er lernt – und kann es selbst anwenden.')}
{pillar('B','MENTOR','Persönliche Begleitung','user','Methoden werden zu Hause im echten Schulstoff angewendet und gefestigt.',['Wöchentlicher Hausbesuch (90 Min.)','Standardisierter Ablauf nach Mentor-Handbuch','Hilfe bei Hausaufgaben &amp; konkreten Fachproblemen','Motivation, Feedback, Wochenziel-Check'],'Hat eine <b>feste Bezugsperson</b>, die dranbleibt.')}
{pillar('C','PROGRESS','Fortschritt sichtbar machen','chart','Entwicklung ist für Schüler, Eltern und uns transparent und messbar.',['Diagnose zum Start (Ausgangsprofil)','Ampel-Dashboard je Lernbereich','Monatlicher Elternbericht','12-Wochen-Review mit Empfehlung'],'Sieht <b>eigene Fortschritte</b> – das motiviert.')}
</div>
<div class="flow" style="height:11mm"><div class="step a" style="flex:1;font-size:9pt">1 PROGRAMM</div><div class="step" style="font-size:9pt">12 WOCHEN</div><div class="step" style="font-size:9pt">1 FESTER MENTOR</div><div class="step" style="font-size:9pt">1 WÖCHENTLICHER TERMIN</div><div class="step a" style="font-size:9pt">1 MESSBARES ZIEL</div></div>'''
P.append(page(2,'Kapitel 2 · Angebot','Drei Säulen. Ein System.','<b>Online</b> vermittelt die Methode, der <b>Mentor</b> bringt sie in den Alltag, <b>Progress</b> macht Wirkung sichtbar.',b))

# ---------- 3 ZIEL ----------
kpis=[('Lernorganisation','Material, Planer, Heftführung','Mentor-Checkliste, Skala 1–5'),
('Selbstständigkeit','Startet Aufgaben ohne Aufforderung','Mentor-Einschätzung + Schüler-Selbstbild'),
('Lernstrategien','Wendet Methoden aktiv an','Zähler im Lernlog (Methoden/Woche)'),
('Lernplanung','Wochenplan erstellt &amp; eingehalten','Plan vs. Umsetzung (% der Lerntage)'),
('Lernroutine','Feste Lernzeiten &amp; Hausaufgaben-Start','Routine-Tage pro Woche'),
('Fachl. Entwicklung','Sicherheit im Fokusthema','Mini-Check im Thema; Noten nur Zusatzinfo'),
('Motivation','Zutrauen &amp; Lernfreude','Kurzfragebogen Schüler, Skala 1–5')]
kt=''.join(f'<tr><td><b>{a}</b></td><td>{b_}</td><td class="mut">{c}</td></tr>' for a,b_,c in kpis)
prof=[('Lernorganisation',2,4),('Selbstständigkeit',2,3),('Lernstrategien',1,4),('Lernplanung',1,4),('Konzentration',2,3),('Fachl. Entwicklung',2,3),('Motivation',2,4)]
def bars(p):
    out=''
    for n,a,c in p:
        out+=f'<div style="display:flex;align-items:center;gap:2mm;margin-bottom:1.6mm"><div style="width:28mm;font-size:7.6pt">{n}</div><div style="flex:1"><div style="height:2.2mm;width:{a*20}%;background:#B8C5DC;border-radius:1mm;margin-bottom:.6mm"></div><div style="height:2.2mm;width:{c*20}%;background:var(--acc);border-radius:1mm"></div></div><div style="width:12mm;font-size:7.6pt;text-align:right"><span class="mut">{a}</span> → <b>{c}</b></div></div>'
    return out
steps3=[('flag','START','Diagnose + Zielblatt'),('chart','MESSUNG 1','Ausgangsprofil'),('repeat','12-WOCHEN-PROGRAMM','Online + Mentor'),('chart','MESSUNG 2','Endprofil'),('up','ENTWICKLUNG','Vergleich + Empfehlung')]
fl3=''.join(f'<div class="step{" a" if i==4 else ""}" style="padding:3mm 2mm">[[{ic}:16:{"n" if i==4 else "w"}]]<span>{t}</span><small>{s}</small></div>' for i,(ic,t,s) in enumerate(steps3))
b=f'''<div class="card n" style="display:flex;gap:5mm;align-items:center;padding:4mm 6mm"><div class="circ a" style="width:12mm;height:12mm">[[target:22:n]]</div><div><h3>Zentrales Produktversprechen</h3><div style="font-size:12.5pt;font-weight:700;line-height:1.2">„In 12 Wochen wird dein Kind <span style="color:var(--acc)">messbar strukturierter und selbstständiger</span> im Lernen – mit eigener Lernroutine.“</div></div><div class="mut" style="font-size:8pt;max-width:55mm;border-left:1px solid #38527E;padding-left:4mm">Wir versprechen <b style="color:#fff">Entwicklung des Lernverhaltens</b> – nicht automatisch bessere Noten.</div></div>
<div class="flow">{fl3}</div>
<div class="row f1" style="min-height:0">
<div class="f3 col"><h2 style="margin:0">Messbare KPIs <span class="tag">Annahme</span></h2><table><tr><th style="width:27%">Bereich</th><th style="width:35%">Woran erkennbar?</th><th>Messung (MVP)</th></tr>{kt}</table><div class="mut" style="font-size:7.4pt">Skala 1 (selten) bis 5 (selbstständig). Zielwerte werden im Pilot festgelegt – bewusst keine Vorab-Versprechen.</div></div>
<div class="f2 card" style="align-self:stretch"><h2>Beispiel: Schüler-Fortschrittsprofil</h2><div class="mut" style="margin-bottom:2.5mm;font-size:7.6pt">Fiktives Beispiel · Lea, Kl. 7 · <span style="display:inline-block;width:3mm;height:2mm;background:#B8C5DC;vertical-align:middle"></span> Start &nbsp;<span style="display:inline-block;width:3mm;height:2mm;background:var(--acc);vertical-align:middle"></span> Woche 12</div>{bars(prof)}<div style="border-top:1px solid var(--line);margin-top:2mm;padding-top:2mm;font-size:7.8pt"><b>Mentor-Fazit (Beispiel):</b> „Plant Woche jetzt allein, nutzt Active Recall; Konzentration bleibt Fokus im Folgeprogramm.“</div></div>
</div>'''
P.append(page(3,'Kapitel 3 · Ziel','Wir messen Entwicklung – wir garantieren keine Noten.','Vorher-nachher-Messung statt Versprechen: <b>Das Ergebnis ist belegbar</b>, nicht behauptet.',b))

# ---------- 4 PROGRAMM ----------
wk=[('Wie funktioniert Lernen?','Versteht, dass Lernen trainierbar ist','Lern-Selbstcheck (10 Min.)','Gemeinsam Ausgangslage besprechen'),
('Ziele setzen','Hat 1 Wochen- &amp; 1 Halbjahresziel','Zielkarte ausfüllen','Ziel mit aktuellem Fach verknüpfen'),
('Lernplanung','Plant eine Lernwoche selbst','Wochenplan anlegen','Plan an realer Woche testen'),
('Aktives Abrufen','Wendet Active Recall an','Brain-Dump + Lückencheck','Am aktuellen Fachthema üben'),
('Wiederholen','Wiederholt in Abständen','Wiederholkalender','Themen der letzten Wochen abfragen'),
('Konzentration','Gestaltet Lernumgebung &amp; Fokuszeit','Fokus-Sprints (Timer)','Arbeitsplatz &amp; Ablenker prüfen'),
('Aufschieben überwinden','Startet trotz Widerstand','„2-Minuten-Start“-Regel','Schwierigste Hausaufgabe starten'),
('Fehler nutzen','Analysiert Fehler statt sie zu meiden','Fehlertagebuch','Letzte Arbeit gemeinsam auswerten'),
('Klassenarbeit vorbereiten','Erstellt einen Lernplan bis zur Arbeit','Rückwärtsplan + Probetest','Probetest durchführen'),
('Schwierige Aufgaben lösen','Zerlegt Aufgaben in Schritte','Strategie-Karte „Ich komme nicht weiter“','Echte Aufgabe mit Hilfestufen'),
('Selbstständig lernen','Führt Lerneinheit ohne Hilfe durch','Eigene Lerneinheit planen','Mentor beobachtet nur'),
('Eigenes Lernsystem','Hat persönliches Lernsystem','„Mein Lernsystem“-Blatt','Review &amp; Abschlussgespräch')]
phase=[('PHASE 1 · FUNDAMENT','Woche 1–4','#17355F'),('PHASE 2 · STABILISIEREN','Woche 5–8','#2A5A9E'),('PHASE 3 · SELBSTSTÄNDIG WERDEN','Woche 9–12','#B97800')]
checks={3:'Check 1',7:'Check 2',11:'Review'}
rows=''
for p in range(3):
    cards=''
    for k in range(4):
        i=p*4+k; t,z,u,m=wk[i]
        ch=f'<span class="tag" style="float:right">{checks[i]}</span>' if i in checks else ''
        cards+=f'''<div class="card w f1" style="padding:2.4mm 3mm"><div style="display:flex;gap:2mm;align-items:center;margin-bottom:1.3mm"><div class="num">{i+1}</div><b style="color:var(--navy);font-size:8.6pt;line-height:1.1">{t}</b></div>{ch}<div style="font-size:7.5pt;line-height:1.28"><b style="color:var(--accd)">ZIEL</b> {z}<br><b style="color:var(--accd)">ÜBUNG</b> {u}<br><b style="color:var(--accd)">MENTOR</b> {m}</div></div>'''
    n,w,c=phase[p]
    rows+=f'<div style="display:flex;flex-direction:column;gap:1.4mm" class="f1"><div style="background:{c};color:#fff;font-size:7.4pt;letter-spacing:.1em;font-weight:700;padding:1.1mm 3mm;border-radius:1mm;display:flex;justify-content:space-between"><span>{n}</span><span>{w}</span></div><div class="row f1" style="gap:3mm">{cards}</div></div>'
b=f'<div class="col f1" style="gap:2.6mm;min-height:0">{rows}</div><div class="mut" style="font-size:7.4pt"><b>Didaktische Logik:</b> erst Verständnis &amp; Ziele → dann Routinen &amp; Methoden → dann Transfer in die Selbstständigkeit. Diagnose-Check in Woche 4 und 8, Abschluss-Review in Woche 12. Inhalte sind ein Startpunkt und werden mit dem pädagogischen Experten geprüft.</div>'
P.append(page(4,'Kapitel 4 · Lernprogramm','Das 12-Wochen-MVP-Programm','Jede Woche <b>ein Lernziel, eine Übung, eine Anwendung</b> mit dem Mentor – aufbauend in drei Phasen.',b))

# ---------- 5 PLATTFORM ----------
wf=[('user','LOGIN',''),('monitor','LERNMODUL','5–15 Min.'),('edit','PRAKTISCHE AUFGABE','im Alltag'),('flag','WOCHENZIEL','abhaken'),('home','MENTORTERMIN','Anwendung')]
fl5=''.join(f'<div class="step{" a" if i==4 else ""}" style="padding:3mm 3.4mm 3mm 4mm;font-size:6.8pt">[[{ic}:16:{"n" if i==4 else "w"}]]<span>{t}</span><small>{s}</small></div>' for i,(ic,t,s) in enumerate(wf))
days=''.join(f'<div style="flex:1;text-align:center"><div style="font-size:6.4pt" class="mut">{d}</div><div style="height:6mm;border-radius:1mm;margin-top:.6mm;background:{c}"></div></div>' for d,c in [('Mo','#2BB673'),('Di','#2BB673'),('Mi','#E1E7F0'),('Do','#2BB673'),('Fr','#FFB020'),('Sa','#E1E7F0'),('So','#E1E7F0')])
wire=f'''<div style="border:1.5px solid #C5CFDF;border-radius:2.5mm;overflow:hidden;box-shadow:0 1.5mm 4mm rgba(11,31,58,.15);background:#fff"><div style="background:#E9EEF6;padding:1.8mm 3mm;display:flex;gap:1.2mm;align-items:center"><span class="dot" style="width:2mm;height:2mm;background:#E5484D"></span><span class="dot" style="width:2mm;height:2mm;background:#F2B705"></span><span class="dot" style="width:2mm;height:2mm;background:#2BB673"></span><div style="margin-left:3mm;background:#fff;border-radius:2mm;padding:.4mm 3mm;font-size:6.6pt;color:var(--mut)">lernplattform.example/dashboard</div></div>
<div style="padding:3.5mm;display:flex;flex-direction:column;gap:2.5mm"><div style="display:flex;justify-content:space-between;align-items:center"><div><b style="font-size:10pt;color:var(--navy)">Hallo Lea!</b><div class="mut" style="font-size:7pt">Woche 4 von 12 · Aktives Abrufen</div></div><div class="circ a" style="width:7mm;height:7mm;font-weight:700;color:var(--navy);font-size:8pt">L</div></div>
<div style="height:2.4mm;background:#E1E7F0;border-radius:2mm"><div style="width:33%;height:100%;background:var(--acc);border-radius:2mm"></div></div>
<div style="background:var(--navy);color:#fff;border-radius:2mm;padding:3mm;display:flex;justify-content:space-between;align-items:center"><div><div style="font-size:6.4pt;color:var(--acc);letter-spacing:.1em;font-weight:700">HEUTIGES MODUL · 12 MIN.</div><div style="font-weight:700;font-size:9pt">Brain-Dump: Was weiß ich schon?</div></div><div style="background:var(--acc);color:var(--navy);font-weight:700;padding:1.5mm 3.5mm;border-radius:1.5mm;font-size:7.4pt">Starten</div></div>
<div class="row" style="gap:2.5mm"><div class="card f1" style="padding:2.5mm"><h3 style="margin:0 0 1mm">Wochenziel</h3><div style="font-size:7.6pt">Active Recall im Mathethema „Brüche“ anwenden</div><div style="margin-top:1.5mm;font-size:7.4pt">☑ Modul &nbsp;☑ Aufgabe &nbsp;☐ Mentor-Check</div></div><div class="card f1" style="padding:2.5mm"><h3 style="margin:0 0 1mm">Nächster Mentortermin</h3><div style="font-size:8.4pt;font-weight:700;color:var(--navy)">Do, 16:00 Uhr</div><div style="font-size:7pt" class="mut">mit Jonas (Mentor)</div></div></div>
<div class="card" style="padding:2.5mm"><div style="display:flex;justify-content:space-between"><h3 style="margin:0 0 1mm">Meine Lernwoche</h3><span style="font-size:6.8pt" class="mut">4 von 7 Tagen aktiv</span></div><div style="display:flex;gap:1.2mm">{days}</div></div></div></div>'''
b=f'''<div class="row f1" style="min-height:0"><div class="f3 col" style="gap:3.5mm">
<div class="card n"><h3>Welches Problem löst die Plattform?</h3><div style="font-size:10.5pt;font-weight:700;line-height:1.25">„Der Schüler lernt Methoden und entwickelt eine eigene Lernroutine.“</div><div class="mut" style="margin-top:1.5mm">Sie ersetzt keinen Mentor, sondern liefert Struktur, Inhalte und Dokumentation.</div></div>
<div><h2>Schüler-Workflow pro Woche</h2><div class="flow">{fl5}</div></div>
<div class="row"><div class="card w f1"><h3>MVP-Umfang <span class="tag">Annahme</span></h3><ul class="l c"><li>12 Wochenmodule (je 1–3 Mini-Lektionen)</li><li>Praxisaufgaben &amp; Arbeitsblätter</li><li>Wochenziel + Lernlog</li><li>Mentor-Sicht: Status &amp; Notizen</li></ul></div><div class="card w f1"><h3>Bewusst noch nicht</h3><ul class="l x"><li>Eigene App</li><li>KI-Tutor</li><li>Gamification-Systeme</li><li>Große Fach-Bibliothek</li></ul><div class="mut" style="font-size:7.4pt;margin-top:1mm">MVP-Idee: einfache Lernplattform bzw. vorhandenes Tool (Annahme).</div></div></div>
</div><div class="f2"><h2>Wireframe: Schüler-Dashboard</h2>{wire}</div></div>'''
P.append(page(5,'Kapitel 5 · Online-Plattform','Die Plattform liefert Methode und Routine','Kurze Module, klare Aufgaben, sichtbares Wochenziel – <b>jeden Tag in 5–15 Minuten</b>.',b))

# ---------- 6 MENTOR ----------
tasks=[('book','Onlineinhalte anwenden'),('search','Lernverhalten beobachten'),('edit','Bei Schulproblemen helfen'),('msg','Motivieren'),('flag','Wochenziele prüfen'),('up','Selbstständigkeit fördern'),('file','Fortschritt dokumentieren')]
tk=''.join(f'<div style="display:flex;gap:2.2mm;align-items:center;margin-bottom:1.6mm"><div class="circ" style="width:6.5mm;height:6.5mm">[[{i}:13:a]]</div><span style="font-size:8.4pt;font-weight:700;color:var(--navy)">{t}</span></div>' for i,t in tasks)
def vflow(items,hi):
    out=''
    for i,t in enumerate(items):
        col='var(--acc);color:var(--navy)' if hi and i==len(items)-1 else ('var(--navy);color:#fff' if hi else '#DDE3EE;color:var(--navy)')
        out+=f'<div style="display:flex;align-items:center;gap:2mm;background:{col};padding:1.7mm 3mm;border-radius:1.5mm;font-weight:700;font-size:8.2pt"><span style="opacity:.6">{i+1}</span>{t}</div>'
        if i<len(items)-1: out+='<div style="text-align:center;line-height:.6;color:var(--mut);font-size:8pt">▼</div>'
    return f'<div style="display:flex;flex-direction:column;gap:.4mm">{out}</div>'
old=vflow(['Problem im Fach','Aufgabe erklären','Üben','Fertig'],False)
new=vflow(['Lernproblem erkennen','Methode vermitteln','Fachinhalt anwenden','Reflektieren','Lernroutine entwickeln','Nächste Woche selbstständiger'],True)
pb=[('VOR DEM TERMIN','Schülerstatus ansehen',['Wochenziel &amp; Modulstatus','Notizen letzter Termin','Material vorbereiten (10 Min.)']),('WÄHREND DES TERMINS','Standardisierter Ablauf',['90-Min.-Struktur (nächste Seite)','Fragen vor Erklären','Schüler macht, Mentor begleitet']),('NACH DEM TERMIN','Dokumentieren &amp; planen',['Fortschrittsbogen ausfüllen','Nächstes Wochenziel setzen','Kurznotiz an Eltern (optional)'])]
pbh=''.join(f'<div class="card w f1" style="padding:2.8mm 3.5mm"><div style="display:flex;gap:2mm;align-items:center;margin-bottom:1mm"><div class="num">{i+1}</div><b style="color:var(--navy);font-size:8pt">{a}</b></div><div style="font-weight:700;font-size:8.2pt;margin-bottom:1mm">{b_}</div><ul class="l c" style="font-size:7.8pt">{"".join(f"<li>{x}</li>" for x in c)}</ul></div>' for i,(a,b_,c) in enumerate(pb))
b=f'''<div class="row" style="min-height:0"><div class="f1 col"><div class="card n"><h3>Welches Problem löst der Mentor?</h3><div style="font-size:9.6pt;font-weight:700;line-height:1.25">Wissen allein verändert kein Verhalten. Der Mentor übersetzt Methoden in <span style="color:var(--acc)">echte Lernroutinen</span> im echten Schulalltag.</div></div><div class="card"><h3>Der Mentor …</h3>{tk}</div><div class="card a" style="font-size:8pt"><b>Rolle:</b> Lernbegleiter – nicht Hausaufgaben-Erlediger und nicht „Erklärmaschine“.</div></div>
<div class="f2 col"><h2 style="margin:0">Der Unterschied zur klassischen Nachhilfe</h2><div class="row" style="gap:5mm"><div class="f1"><div class="mut" style="font-weight:700;letter-spacing:.1em;font-size:7.4pt;margin-bottom:1.5mm">KLASSISCHE NACHHILFE</div>{old}<div class="mut" style="font-size:7.6pt;margin-top:2mm">→ Fach wird besser – Lernverhalten bleibt oft gleich.</div></div><div class="f1" style="flex:1.25"><div style="color:var(--accd);font-weight:700;letter-spacing:.1em;font-size:7.4pt;margin-bottom:1.5mm">UNSER MODELL</div>{new}</div></div></div></div>
<div><div class="kick" style="margin-bottom:1.5mm">Mentor-Handbuch (Playbook) – Struktur</div><div class="row">{pbh}</div></div>'''
P.append(page(6,'Kapitel 6 + 8 · Mentor &amp; Handbuch','Der Mentor ist Lernbegleiter, nicht Nachhilfelehrer','Nicht „Aufgabe erklären“, sondern <b>„Lernen verbessern“</b> – mit einem klaren Playbook statt Improvisation.',b))

# ---------- 7 HAUSBESUCH ----------
seg=[('CHECK-IN','0–10',10,'#17355F','Fragt nach Woche, Stimmung, Wochenziel','Berichtet, zeigt Lernlog &amp; Aufgaben','Klarer Status, Fokus des Termins'),
('LERNMETHODE','10–25',15,'#2A5A9E','Zeigt/übt die Methode der Woche (Modell → gemeinsam → allein)','Probiert die Methode aktiv aus','Methode verstanden und einmal angewendet'),
('FACHLICHE ANWENDUNG','25–65',40,'#E39A00','Begleitet Hausaufgabe/Fachthema, stellt Fragen, gibt Hilfestufen','Bearbeitet echte Aufgaben mit der Methode','Fachproblem gelöst + Methode im Stoff genutzt'),
('REFLEXION','65–80',15,'#2A5A9E','Fragt: Was lief gut? Was war schwer? Was nehme ich mit?','Benennt eigene Strategie in eigenen Worten','Bewusstsein für eigenes Lernen'),
('WOCHENZIEL','80–87',7,'#17355F','Hilft, 1 kleines, konkretes Ziel zu formulieren','Formuliert Ziel &amp; plant Zeitpunkte','Konkretes Wochenziel im Planer'),
('DOKU','87–90',3,'#0B1F3A','Füllt Fortschrittsbogen aus','Prüft Zusammenfassung','Eintrag im System')]
bar=''.join(f'<div style="flex:{w};background:{c};color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:3mm 0;border-right:1.5px solid #fff;min-width:0"><div class="num" style="{"background:#fff" if i==2 else ""}">{i+1}</div><div style="font-size:{"8pt" if w>8 else "6.6pt"};font-weight:700;margin-top:1mm;text-align:center;line-height:1.1;{"color:var(--navy)" if i==2 else ""}">{"" if w<8 else n_}</div><div style="font-size:7pt;opacity:.85;{"color:var(--navy)" if i==2 else ""}">{"" if w<8 else m_+" Min."}</div></div>' for i,(n_,m_,w,c,_,__,___) in enumerate(seg))
axis='<div style="display:flex;font-size:6.8pt;color:var(--mut);margin-top:1mm;position:relative;height:3mm">'+''.join(f'<span style="position:absolute;left:{p/90*100}%;transform:translateX(-50%)">{p}</span>' for p in [0,10,25,65,80,87,90])+'</div>'
tc=''.join(f'''<div class="card w f1" style="padding:2.6mm 3mm;border-top:3px solid {c}"><div style="display:flex;gap:1.8mm;align-items:center;margin-bottom:1.5mm"><div class="num">{i+1}</div><b style="color:var(--navy);font-size:7.6pt;line-height:1.1">{n_}<br><span class="mut" style="font-weight:400">{m_} Min.</span></b></div><div style="font-size:7.4pt;line-height:1.3"><b style="color:var(--accd)">MENTOR</b><br>{a}<div style="height:1.5mm"></div><b style="color:var(--accd)">SCHÜLER</b><br>{b_}<div style="height:1.5mm"></div><b style="color:var(--accd)">ERGEBNIS</b><br>{c_}</div></div>''' for i,(n_,m_,w,c,a,b_,c_) in enumerate(seg))
b=f'''<div class="card"><div style="display:flex;justify-content:space-between;margin-bottom:2mm"><h2 style="margin:0">Ablauf eines Hausbesuchs – 90 Minuten</h2><span class="mut">Zeitstrahl, Breite proportional zur Dauer</span></div><div style="display:flex;border-radius:2mm;overflow:hidden">{bar}</div>{axis}</div>
<div class="row f1" style="gap:2.5mm;min-height:0">{tc}</div>
<div class="row"><div class="card n f1" style="padding:2.5mm 4mm"><b style="color:var(--acc)">Prinzip:</b> Der Schüler arbeitet – der Mentor fragt, begleitet und gibt nur so viel Hilfe wie nötig.</div><div class="card w f1" style="padding:2.5mm 4mm"><b>Fachliche Anwendung = 40 von 90 Minuten.</b> Schulische Probleme bleiben im Fokus – aber <b>mit Methode</b>.</div></div>'''
P.append(page(7,'Kapitel 7 · Hausbesuch','Der 90-Minuten-Hausbesuch – jedes Mal gleich aufgebaut','Standardisierter Ablauf: <b>Methode → Anwendung → Reflexion → Ziel</b>. Der Mentor muss nicht überlegen, was er tut.',b))

# ---------- 8 PLAYBOOK + MATCHING ----------
sheet=f'''<div class="paper"><div style="display:flex;justify-content:space-between;border-bottom:2px solid var(--acc);padding-bottom:2mm;margin-bottom:2.5mm"><div><div class="kick" style="margin-bottom:0">Mentor-Handbuch · Seite 4</div><b style="font-size:11pt;color:var(--navy)">Woche 4 – Aktives Abrufen</b></div><span class="tag" style="align-self:center">Beispiel</span></div>
<h3>Wochenziel</h3><div style="background:#FFF4DB;border-left:3px solid var(--acc);padding:2mm 3mm;font-weight:700;color:var(--navy);margin-bottom:2.5mm">„Schüler kann Active Recall auf sein aktuelles Mathethema anwenden.“</div>
<h3>Fragen (Check-in &amp; Reflexion)</h3><ul class="l" style="margin-bottom:2mm"><li>Was hast du diese Woche gelernt?</li><li>Wie hast du gelernt?</li><li>Was hat funktioniert?</li><li>Was war schwierig?</li></ul>
<h3>Übung (ca. 25 Min.)</h3><ol style="padding-left:4.5mm;margin-bottom:2mm"><li>Heft schließen, 3 Min. alles aufschreiben, was zum Thema bekannt ist (Brain-Dump)</li><li>Mit Heft vergleichen, Lücken markieren</li><li>3 Fragen zu den Lücken formulieren und ohne Heft beantworten</li></ol>
<h3>Mentor-Tipp</h3><div style="margin-bottom:2mm">Nicht vorsagen – erst fragen: „Was weißt du schon?“ Hilfestufen: Hinweis → Teilschritt → Beispiel.</div>
<h3>Abschluss &amp; Dokumentation</h3><ul class="l c"><li>Schüler erklärt Active Recall in eigenen Worten</li><li>2 Abruftermine im Planer eintragen</li><li>Fortschrittsbogen: Lernstrategien 1–5</li></ul></div>'''
crit=[('Fach','Fächer &amp; Klassenstufe laut Profil'),('Alter','Passende Nähe zum Schüler'),('Entfernung','Wohnorte, max. Anfahrt (Annahme)'),('Verfügbarkeit','Feste Wochentermine'),('Persönlichkeit','Kurzgespräch &amp; Eindruck'),('Lernstil','Diagnose-Fragebogen'),('Erfahrung','Nachhilfe, Jugendarbeit u. ä.'),('Interessen','Gemeinsamer Gesprächsanker')]
ct=''.join(f'<tr><td style="width:24%"><b>{a}</b></td><td>{b_}</td></tr>' for a,b_ in crit)
b=f'''<div class="row f1" style="min-height:0"><div class="f1" style="flex:1.05;padding-right:2mm"><h2>Beispielseite aus dem Mentor-Handbuch</h2>{sheet}</div>
<div class="f1 col" style="gap:3mm"><h2 style="margin:0">Mentor-Matching (MVP: manuell)</h2>
<div class="row" style="align-items:center;gap:2mm"><div class="card w f1" style="padding:2.5mm"><h3 style="margin:0 0 1mm">Schülerprofil</h3><div style="font-size:7.6pt">Lea · Kl. 7<br>Mathe/Englisch<br>Mo/Do nachmittags<br>ruhig, visuell, mag Musik</div></div><div style="font-size:16pt;font-weight:700;color:var(--accd)">+</div><div class="card w f1" style="padding:2.5mm"><h3 style="margin:0 0 1mm">Mentorprofil</h3><div style="font-size:7.6pt">Jonas · Lehramt<br>Mathe/Englisch<br>Do + Sa frei, 5 km<br>geduldig, Musiker</div></div><div style="font-size:16pt;font-weight:700;color:var(--accd)">=</div><div class="card a f1" style="padding:2.5mm;text-align:center;align-self:stretch;display:flex;flex-direction:column;justify-content:center"><b style="font-size:12pt">MATCH</b><div style="font-size:7pt">+ Kennenlern-<br>termin</div></div></div>
<div style="font-size:7pt" class="mut">Fiktives Beispiel</div>
<table><tr><th>Kriterium</th><th>So prüfen wir es im MVP</th></tr>{ct}</table>
<div class="card n" style="padding:2.5mm 4mm;font-size:8pt"><b style="color:var(--acc)">Ablauf:</b> Gründer prüft Profile per Checkliste → schlägt 1 Mentor vor → Kennenlernen → Eltern &amp; Schüler bestätigen (sonst Wechsel). <b>Kein Algorithmus nötig.</b></div></div></div>'''
P.append(page(8,'Kapitel 8 + 10 · Handbuch &amp; Matching','Ein Playbook für jede Woche – ein passender Mentor für jeden Schüler','Der Mentor bekommt <b>fertige Seiten</b>. Das Matching läuft im MVP <b>manuell</b> nach einer einfachen Checkliste.',b))

# ---------- 9 FULFILLMENT ----------
fu=[('Elternanfrage','Gründer','Anfrage über Website/Telefon aufnehmen','Kontaktdaten, Wunschthema'),
('Erstgespräch','Gründer','Bedarf, Erwartungen, Ablauf &amp; Rahmen klären','Entscheidung der Eltern, Vertrag &amp; Einwilligungen'),
('Schüler-Diagnose','Päd. Experte','Fragebogen + kurzes Gespräch mit Schüler','Ausgangsprofil'),
('Lernziel','Päd. Experte, Eltern, Schüler','12-Wochen-Ziel gemeinsam festlegen','Zielblatt'),
('Mentor-Matching','Gründer','Manuell nach Checkliste (Kap. 8)','Mentor zugewiesen'),
('Online-Start','Schüler / Plattform','Zugang einrichten, Einführungsmodul','Konto aktiv, Woche 1 frei'),
('Erster Hausbesuch','Mentor','Kennenlernen, Setup, Ziel besprechen','Startprotokoll'),
('Wöchentliche Begleitung','Mentor + Schüler','Modul + 90-Min.-Hausbesuch','Wochenprotokoll'),
('Monatlicher Check','Mentor + Päd. Experte','Fortschritt messen, Bericht erstellen','Elternbericht'),
('12-Wochen-Review','Päd. Experte + Gründer','Endmessung, Abschlussgespräch','Abschlussbericht'),
('Nächste Entwicklungsstufe','Gründer + Eltern','Verlängerung, Aufbauprogramm oder Abschluss','Entscheidung &amp; Empfehlung')]
phs={1:'#17355F',2:'#17355F',3:'#17355F',4:'#17355F',5:'#2A5A9E',6:'#2A5A9E',7:'#2A5A9E',8:'#E39A00',9:'#E39A00',10:'#E39A00',11:'#E39A00'}
fr=''.join(f'<tr><td style="width:7mm;padding:1.2mm 1mm 1.2mm 2mm"><div class="num" style="background:{phs[i+1]};color:{"#fff" if i<7 else "var(--navy)"}">{i+1}</div></td><td style="width:36mm"><b style="color:var(--navy)">{a}</b></td><td style="width:42mm">{b_}</td><td>{c}</td><td style="width:62mm" class="mut">{d}</td></tr>' for i,(a,b_,c,d) in enumerate(fu))
b=f'''<div class="flow" style="height:9mm"><div class="step" style="font-size:8pt;background:#17355F">GEWINNEN &amp; DIAGNOSTIZIEREN · 1–4</div><div class="step" style="font-size:8pt;background:#2A5A9E">STARTEN · 5–7</div><div class="step a" style="font-size:8pt">BEGLEITEN &amp; MESSEN · 8–11</div></div>
<table><tr><th></th><th>Schritt</th><th>Verantwortlich</th><th>Aufgabe</th><th>Output</th></tr>{fr}</table>
<div class="card w" style="padding:2.2mm 4mm;font-size:7.8pt"><b>Annahme:</b> Im Pilot übernimmt das Gründerteam Erstgespräch und Organisation selbst; der pädagogische Experte verantwortet Diagnose, Ziele und Qualitätskontrolle.</div>'''
P.append(page(9,'Kapitel 9 · Fulfillment','Vom ersten Kontakt bis zur nächsten Entwicklungsstufe','Elf Schritte, <b>für jeden klar: wer, was, Ergebnis</b>. So bleibt das Modell skalierbar und wiederholbar.',b))

# ---------- 10 FORTSCHRITT ----------
dims=[('Lernorganisation',0,2),('Selbstständigkeit',0,1),('Lernstrategien',0,2),('Konzentration',1,1),('Fachliche Entwicklung',0,1)]
def track(n,s,c):
    seg_=''
    for i,col in enumerate(['r','y','g']):
        mk=''
        if i==s: mk+='<span style="position:absolute;left:1.5mm;top:-1.6mm;font-size:6pt;background:#fff;border:1px solid var(--mut);border-radius:2mm;padding:0 1mm;color:var(--mut)">Start</span>'
        if i==c: mk+='<span style="position:absolute;right:1.5mm;bottom:-1.6mm;font-size:6pt;background:var(--navy);border-radius:2mm;padding:0 1.2mm;color:#fff">Jetzt</span>'
        seg_+=f'<div class="{col}" style="flex:1;height:5mm;position:relative;opacity:{1 if i<=c else .28};border-radius:{"2.5mm 0 0 2.5mm" if i==0 else ("0 2.5mm 2.5mm 0" if i==2 else "0")}">{mk}</div>'
    return f'<div style="display:flex;align-items:center;gap:3mm;margin-bottom:4.6mm"><div style="width:36mm;font-weight:700;color:var(--navy);font-size:8pt">{n.upper()}</div><div style="flex:1;display:flex;gap:1mm">{seg_}</div></div>'
dash=''.join(track(*d) for d in dims)
rep=f'''<div class="paper"><div style="display:flex;justify-content:space-between;border-bottom:2px solid var(--acc);padding-bottom:2mm;margin-bottom:2mm"><div><div class="kick" style="margin-bottom:0">Monatsbericht für Eltern</div><b style="font-size:10.5pt;color:var(--navy)">Lea M., Klasse 7 · Monat 2 von 3</b></div><span class="tag" style="align-self:center">Beispieldaten</span></div>
<table style="font-size:7.8pt;margin-bottom:2mm"><tr><td style="width:50%"><b>Hausbesuche:</b> 4 von 4 durchgeführt</td><td><b>Online-Module:</b> 7 von 8 erledigt</td></tr></table>
<div class="row" style="gap:3mm"><div class="f1"><h3>Das läuft gut</h3><ul class="l c" style="font-size:7.8pt"><li>Plant ihre Woche jetzt selbst</li><li>Nutzt Abfragen statt nur Lesen</li></ul></div><div class="f1"><h3>Nächster Fokus</h3><ul class="l" style="font-size:7.8pt"><li>Konzentration bei Hausaufgaben</li><li>Wiederholen in Abständen</li></ul></div></div>
<h3 style="margin-top:1mm">So können Sie unterstützen</h3><div style="font-size:7.8pt;margin-bottom:2mm">Feste Lernzeit am Do und Fr, Handy außer Reichweite – kein Nachfragen zu Noten, sondern zur Lernmethode.</div>
<div style="display:flex;gap:2mm;font-size:7.2pt;text-align:center">{"".join(f'<div class="f1" style="background:var(--bg);border-radius:1.5mm;padding:1.5mm"><span class="dot {c}"></span><br>{n}</div>' for n,c in [('Organisation','g'),('Selbstständigkeit','y'),('Strategien','g'),('Konzentration','y')])}</div></div>'''
b=f'''<div class="row f1" style="min-height:0"><div class="f1 col" style="gap:3mm"><h2 style="margin:0">Dashboard: Lernbereiche im Verlauf</h2><div class="card"><div style="display:flex;gap:4mm;font-size:7.4pt;margin-bottom:3mm"><span><span class="dot r"></span> Aufbau nötig</span><span><span class="dot y"></span> Entwicklung sichtbar</span><span><span class="dot g"></span> Sicher &amp; selbstständig</span></div>{dash}<div class="mut" style="font-size:7pt">Beispielprofil. Ampel = Zusammenfassung der Skala 1–5 je Bereich (Annahme: 1–2 rot, 3 gelb, 4–5 grün).</div></div>
<div class="card n"><h3>Messzeitpunkte</h3><div class="row" style="gap:2mm;text-align:center">{"".join(f'<div class="f1" style="background:#17355F;border-radius:1.5mm;padding:2mm"><b style="color:var(--acc)">{a}</b><br><span style="font-size:7pt">{b_}</span></div>' for a,b_ in [('Start','Diagnose'),('Woche 4','Check 1'),('Woche 8','Check 2'),('Woche 12','Review')])}</div></div></div>
<div class="f1"><h2>Beispiel: Monatsbericht für Eltern</h2>{rep}</div></div>'''
P.append(page(10,'Kapitel 11 · Fortschrittsmessung','Eltern sehen, was sich verändert – jeden Monat','Einfaches <b>Ampel-Dashboard</b> + Kurzbericht: Entwicklung wird <b>sichtbar statt gefühlt</b>.',b))

# ---------- 11 MVP + ROLLEN ----------
need=['12-Wochen-Lernprogramm','Mentor-Handbuch','Schüler-Diagnose','Fortschrittsbogen','2–3 geschulte Studenten','3–5 Testschüler','Einfache Website','Einfache digitale Lernplattform','Datenschutz-/Vertragsgrundlagen','Pädagogische Qualitätsprüfung']
later=['Eigene App','KI-Tutor','Automatisches Matching','Komplexe Gamification','100+ Lernmodule','Deutschlandweite Expansion','Komplexe Automatisierung']
roles=[('target','GRÜNDER',['Vertrieb','System &amp; Prozesse','Geschäftsentwicklung'],'Läuft das Modell – und wird es gebucht?'),('book','PÄDAGOGISCHER EXPERTE',['Lerncurriculum','Qualitätskontrolle','Pädagogischer Rahmen'],'Ist das Programm pädagogisch sinnvoll?'),('user','MENTOR',['Umsetzung mit dem Schüler','Dokumentation'],'Wird der Ablauf gelebt?'),('monitor','PLATTFORM',['Lerninhalte','Aufgaben','Dokumentation'],'Sind Inhalte und Status immer verfügbar?'),('users','ELTERN',['Feedback','Unterstützung zu Hause'],'Sehen sie Entwicklung und unterstützen sie?')]
rh=''.join(f'<div class="card w f1" style="padding:3mm;border-top:3px solid var(--acc);display:flex;flex-direction:column"><div style="display:flex;gap:2mm;align-items:center;margin-bottom:1.5mm"><div class="circ" style="width:7.5mm;height:7.5mm">[[{i}:15:a]]</div><b style="color:var(--navy);font-size:7.8pt;line-height:1.1">{n}</b></div><ul class="l" style="font-size:7.8pt">{"".join(f"<li>{x}</li>" for x in l)}</ul><div style="margin-top:auto;padding-top:2mm;border-top:1px dashed var(--line);font-size:7.4pt;font-style:italic" class="mut">„{q}“</div></div>' for i,n,l,q in roles)
b=f'''<div class="row" style="gap:5mm"><div class="card f3" style="background:#EAF7F0"><div style="display:flex;justify-content:space-between"><h2 style="color:#1B7F52">MVP – das brauchen wir jetzt</h2><span class="tag">Pilot</span></div><div style="columns:2;column-gap:5mm"><ul class="l c">{"".join(f"<li>{x}</li>" for x in need)}</ul></div></div><div class="card f2" style="background:#F1F3F7"><h2 class="mut">Später – noch nicht nötig</h2><ul class="l x">{"".join(f"<li>{x}</li>" for x in later)}</ul></div></div>
<div class="f1 col" style="min-height:0"><h2 style="margin:0">Rollen im Unternehmen</h2><div class="row f1">{rh}</div>
<div class="flow" style="height:11mm"><div class="step" style="font-size:7.8pt">GRÜNDER steuert das System</div><div class="step" style="font-size:7.8pt">EXPERTE sichert Qualität</div><div class="step" style="font-size:7.8pt">PLATTFORM liefert Inhalte</div><div class="step" style="font-size:7.8pt">MENTOR setzt um</div><div class="step a" style="font-size:7.8pt">SCHÜLER entwickelt sich</div></div></div>'''
P.append(page(11,'Kapitel 12 + 13 · MVP-Umfang &amp; Rollen','Klein starten: Pilot mit 2–3 Mentoren und 3–5 Schülern','Alles, was nicht für den Beweis des Konzepts nötig ist, <b>kommt später</b>. Jede Rolle hat klare Aufgaben.',b))

# ---------- 12 ROADMAP + RECHT ----------
rm=[('Pädagogischen Experten finden','Rolle klären'),('Zielgruppe finalisieren','Kl. 5–10 im MVP?'),('Lernziele definieren','KPIs festlegen'),('12-Wochen-Curriculum erstellen','Module &amp; Aufgaben'),('Mentor-Handbuch erstellen','Playbook-Seiten'),('Diagnose entwickeln','Fragebogen'),('Fortschrittsmessung definieren','Dashboard &amp; Bericht'),('2–3 Studenten rekrutieren','&amp; schulen'),('3–5 Testschüler gewinnen','Pilotfamilien'),('12-Wochen-Pilot durchführen','begleiten &amp; messen')]
rc=''.join(f'<div class="card w f1" style="padding:2.6mm 3mm;border-top:3px solid {"var(--acc)" if i==9 else "var(--navy)"}"><div class="num" style="{"background:var(--navy);color:#fff" if i==9 else ""}">{i+1}</div><div style="font-weight:700;color:var(--navy);margin-top:1.5mm;line-height:1.15">{t}</div><div class="mut" style="font-size:7.4pt;margin-top:.8mm">{s}</div></div>' for i,(t,s) in enumerate(rm))
legal=['Unternehmensform','Gewerbe / Steuer','Verträge','Datenschutz / DSGVO','Minderjährigenschutz','Führungszeugnisse','Beschäftigungsmodell der Studenten','Haftpflicht / Versicherung','Anforderungen an öffentliche Lernförderung / BuT']
b=f'''<div><div class="kick" style="margin-bottom:1.5mm">Roadmap bis zum Pilot</div><div class="row" style="gap:2.5mm;margin-bottom:2.5mm">{rc[:rc.index('<div class="card w f1"',10)] if False else ''.join(rc.split('<div class="card w f1"')[1:6]).join(['<div class="card w f1"','']) if False else ''}</div></div>'''
cards=rc.split('<div class="card w f1"')[1:]
r1=''.join('<div class="card w f1"'+c for c in cards[:5]); r2=''.join('<div class="card w f1"'+c for c in cards[5:])
b=f'''<div class="col" style="gap:2.5mm"><div class="row" style="gap:2.5mm">{r1}</div><div class="row" style="gap:2.5mm">{r2}</div></div>
<div class="flow" style="height:12mm"><div class="step a" style="font-size:8.6pt">DANACH ▸ ERGEBNISSE MESSEN</div><div class="step" style="font-size:8.6pt">PRODUKT VERBESSERN</div><div class="step" style="font-size:8.6pt">GESCHÄFTSMODELL &amp; FINANZIERUNG VALIDIEREN</div></div>
<div class="card n f1" style="display:flex;gap:6mm;align-items:center"><div style="flex:1"><div style="display:flex;gap:2mm;align-items:center;margin-bottom:2mm"><div class="circ a" style="width:8mm;height:8mm">[[shield:16:n]]</div><h2 style="margin:0">Noch zu prüfen</h2></div><div class="mut" style="font-size:7.8pt">Reine Themenliste – <b style="color:#fff">keine Rechtsberatung</b>. Alle Punkte sind vor dem Start mit Fachleuten (z. B. Steuerberatung, Rechtsberatung, Datenschutz) zu klären.</div></div><div style="flex:2.2">{"".join(f'<span class="chip" style="border-color:var(--acc);color:#fff">{x}</span>' for x in legal)}<div class="mut" style="font-size:7.4pt;margin-top:1mm">Insbesondere die langfristige Finanzierung über öffentliche Lernförderung ist ein Ziel, <b style="color:#fff">keine geprüfte Annahme</b>.</div></div></div>'''
P.append(page(12,'Kapitel 14 + Rechtlicher Hinweis','Die ersten 10 Schritte – dann messen, lernen, validieren','Konkrete Roadmap bis zum Pilot. <b>Erst Beweis des Konzepts</b>, dann Skalierung und Finanzierung.',b))

html='<!doctype html><html lang="de"><head><meta charset="utf-8"><title>Lernbegleitung 5–13 – MVP Blueprint</title><link rel="stylesheet" href="style.css"></head><body>'+''.join(P)+'</body></html>'
html=re.sub(r'\[\[([^\]]+)\]\]',ico,html)
(D/'mvp-konzept.html').write_text(html,encoding='utf-8')
subprocess.run(['/opt/pw-browsers/chromium-1194/chrome-linux/chrome','--headless','--no-sandbox','--disable-gpu','--no-pdf-header-footer','--print-to-pdf='+str(D/'Lernbegleitung_MVP_Konzept.pdf'),'file://'+str(D/'mvp-konzept.html')],check=True,capture_output=True)
