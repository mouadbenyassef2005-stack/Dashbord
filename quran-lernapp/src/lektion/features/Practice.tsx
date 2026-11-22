"use client";
import Link from "next/link";
import { useState } from "react";
import { ITEMS } from "@/lektion/content/lektion1";
import { interleaveTasks, makeTask, variantCount, type TaskResult } from "@/lektion/domain/lektion/tasks";
import { useLesson } from "./LessonContext";
import { ResultBreakdown, share } from "./Summary";
import { TaskRunner } from "./TaskRunner";

const SIZE = 12;

/** Freie, gemischte Übung (Interleaving) über den gesamten Stoff der Lektion. Verändert den Wiederholungsplan nicht. */
function Session({ onAgain }: { onAgain(): void }) {
  const [tasks] = useState(() => {
    const picked = [...ITEMS].sort(() => Math.random() - 0.5).slice(0, SIZE);
    return interleaveTasks(picked.map((i) => makeTask(i.id, Math.floor(Math.random() * variantCount(i.id)))));
  });
  const [res, setRes] = useState<TaskResult[] | null>(null);
  if (res)
    return (
      <div className="stack-lg fade">
        <h1>Geschafft</h1>
        <div className="kpis"><div className="kpi"><b>{Math.round(share(res) * 100)} %</b><small>im ersten Versuch richtig</small></div></div>
        <ResultBreakdown results={res} />
        <div className="row"><button className="btn btn-primary" onClick={onAgain}>Nochmal üben</button><Link className="btn btn-secondary" href="/">Zur Startseite</Link></div>
      </div>
    );
  return <TaskRunner tasks={tasks} feedback="immediate" hints label="Aufgabe" onDone={setRes} />;
}

export function Practice() {
  const { s } = useLesson();
  const [run, setRun] = useState(0);
  const [started, setStarted] = useState(false);
  const ready = s.done.includes(4);
  if (!ready)
    return (
      <div className="stack-lg fade">
        <header className="stack"><p className="eyebrow">Üben</p><h1>Gemischte Übung</h1></header>
        <p className="notice" role="status">Die freie Übung schaltet sich nach Phase 4 der Lektion frei, wenn du alle drei Vokalzeichen kennengelernt hast.</p>
        <Link className="btn btn-primary" href="/lektion">Zur Lektion</Link>
      </div>
    );
  if (!started)
    return (
      <div className="stack-lg fade">
        <header className="stack"><p className="eyebrow">Üben</p><h1>Gemischte Übung</h1>
          <p className="muted">{SIZE} Aufgaben aus dem gesamten Stoff: Buchstaben, Vokalzeichen, Silben, Wörter und Regeln, bunt gemischt. Du bekommst sofort Rückmeldung. Das Üben hier verändert deinen Lernplan nicht.</p></header>
        <button className="btn btn-primary" onClick={() => setStarted(true)}>Übung starten</button>
      </div>
    );
  return <Session key={run} onAgain={() => setRun((n) => n + 1)} />;
}
