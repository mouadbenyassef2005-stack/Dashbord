"use client";
import { useState } from "react";
import { PHASES } from "@/lektion/domain/lektion/state";
import { useLesson } from "./LessonContext";

export function Profil() {
  const { s, dispatch } = useLesson();
  const [confirm, setConfirm] = useState(false);
  const items = Object.values(s.srs);
  const mean = items.length ? items.reduce((a, m) => a + m.stability, 0) / items.length : 0;
  return (
    <div className="stack-lg fade">
      <header className="stack"><p className="eyebrow">Profil</p><h1>Dein Fortschritt</h1></header>
      <div className="kpis">
        <div className="kpi"><b>{s.done.length} / {PHASES.length}</b><small>Phasen abgeschlossen</small></div>
        <div className="kpi"><b>{items.length}</b><small>Items im Wiederholungsplan</small></div>
        <div className="kpi"><b>{mean.toFixed(1)} T.</b><small>mittlere Stabilität</small></div>
      </div>
      <section className="stack" aria-labelledby="ph"><h2 id="ph">Phasen</h2>
        <ol className="stack" style={{ paddingLeft: 20, margin: 0 }}>
          {PHASES.map((p) => <li key={p.n}><b>{p.title}</b> <span className="muted">· {s.done.includes(p.n) ? "abgeschlossen" : p.n <= s.unlocked ? "offen" : "gesperrt"}</span></li>)}
        </ol></section>
      <section className="stack" aria-labelledby="rs"><h2 id="rs">Zurücksetzen</h2>
        <p className="muted">Der Fortschritt liegt nur in diesem Browser. Zurücksetzen löscht ihn.</p>
        {!confirm ? <div><button className="btn btn-secondary" onClick={() => setConfirm(true)}>Lektion von vorn beginnen</button></div>
          : <div className="row"><span className="muted">Wirklich alles löschen?</span><button className="btn btn-secondary" onClick={() => { dispatch({ t: "reset", now: Date.now() }); setConfirm(false); }}>Ja, löschen</button><button className="btn btn-ghost" onClick={() => setConfirm(false)}>Abbrechen</button></div>}
      </section>
    </div>
  );
}
