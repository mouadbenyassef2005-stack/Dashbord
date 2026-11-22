"use client";
import { useState } from "react";
import { UNITS } from "@/lektion/content/units";
import { PHASE_COUNT, pk } from "@/lektion/domain/lektion/state";
import { CompetenceBoard } from "./Board";
import { useLesson } from "./LessonContext";
import { ConfusionOffer } from "./Remedial";

export function Profil() {
  const { s, dispatch } = useLesson();
  const [confirm, setConfirm] = useState(false);
  return (
    <div className="stack-lg fade">
      <header className="stack"><p className="eyebrow">Profil</p><h1>Dein Lernstand</h1></header>
      <CompetenceBoard />
      <ConfusionOffer />
      <section className="stack" aria-labelledby="act"><h2 id="act">Abgeschlossene Aktivitäten</h2>
        <p className="muted">Das zeigt nur, welche Phasen du bearbeitet hast. Es sagt nichts darüber, ob du den Inhalt beherrschst. Dafür gibt es die Kompetenzen oben.</p>
        <ul className="stack" style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {UNITS.map((u) => (
            <li key={u.id} className="panel stack"><strong className="block">Einheit {u.id}: {u.short}</strong>
              <span className="muted block">{Array.from({ length: PHASE_COUNT }, (_, i) => i + 1).filter((p) => s.phaseDone[pk(u.id, p)]).length} von {PHASE_COUNT} Phasen bearbeitet · {u.id > s.unit ? "gesperrt" : s.decided[u.id] ? (s.decided[u.id].choice === "continue" ? "Entscheidung: weiter" : "Entscheidung: weiter üben") : "noch keine Entscheidung"}</span></li>
          ))}
        </ul></section>
      <section className="stack" aria-labelledby="rs"><h2 id="rs">Zurücksetzen</h2>
        <p className="muted">Der Fortschritt liegt nur in diesem Browser. Zurücksetzen löscht ihn.</p>
        {!confirm ? <div><button className="btn btn-secondary" onClick={() => setConfirm(true)}>Alles zurücksetzen</button></div>
          : <div className="row"><span className="muted">Wirklich alles löschen?</span><button className="btn btn-secondary" onClick={() => { dispatch({ t: "reset", now: Date.now() }); setConfirm(false); }}>Ja, löschen</button><button className="btn btn-ghost" onClick={() => setConfirm(false)}>Abbrechen</button></div>}</section>
    </div>
  );
}
