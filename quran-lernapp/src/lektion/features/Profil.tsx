"use client";
import { useState } from "react";
import { LESSONS } from "@/lektion/content/path";
import { CompetenceBoard } from "./Board";
import { useLesson } from "./LessonContext";
import { ConfusionOffer } from "./Remedial";

export function Profil() {
  const { s, dispatch } = useLesson();
  const [confirm, setConfirm] = useState(false);
  const nDone = LESSONS.filter((l) => s.lessons[l.id]?.done).length;
  return (
    <div className="qd stack-lg fade">
      <header className="stack"><h1>Dein Stand</h1></header>
      <CompetenceBoard />
      <ConfusionOffer />
      <section className="stack" aria-labelledby="act"><h2 id="act">Geschaffte Lektionen</h2>
        <p className="muted">{nDone} von {LESSONS.length} Lektionen abgeschlossen. Das zeigt nur, was du bearbeitet hast, nicht, was du sicher kannst. Das siehst du oben.</p></section>
      <section className="stack" aria-labelledby="rs"><h2 id="rs">Zurücksetzen</h2>
        <p className="muted">Dein Fortschritt liegt nur in diesem Browser.</p>
        {!confirm ? <div><button className="btn btn-secondary" onClick={() => setConfirm(true)}>Alles zurücksetzen</button></div>
          : <div className="row"><span className="muted">Wirklich alles löschen?</span><button className="btn btn-secondary" onClick={() => { dispatch({ t: "reset", now: Date.now() }); setConfirm(false); }}>Ja, löschen</button><button className="btn btn-ghost" onClick={() => setConfirm(false)}>Abbrechen</button></div>}</section>
    </div>
  );
}
