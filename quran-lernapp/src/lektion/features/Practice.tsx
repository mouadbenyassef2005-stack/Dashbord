"use client";
import Link from "next/link";
import { useState } from "react";
import { ITEMS, ITEM_BY_ID } from "@/lektion/content/lektion1";
import { COMPETENCE_LABEL, parseSrsKey, type Competence } from "@/lektion/domain/lektion/competence";
import { dueEntries } from "@/lektion/domain/lektion/state";
import { interleaveTasks, makeTask, reviewTaskFor, variantCount, type Task, type TaskResult } from "@/lektion/domain/lektion/tasks";
import { RichText } from "@/lektion/ui/parts";
import { ConfusionOffer } from "./Remedial";
import { useLesson } from "./LessonContext";
import { ResultBreakdown, pct, share } from "./Summary";
import { TaskRunner } from "./TaskRunner";

const CAP = 10;

function Session({ tasks, mode, onAgain }: { tasks: Task[]; mode: "due" | "free"; onAgain(): void }) {
  const { dispatch } = useLesson();
  const [res, setRes] = useState<TaskResult[] | null>(null);
  if (res)
    return (
      <div className="stack-lg fade">
        <h1>Geschafft</h1>
        <div className="kpis"><div className="kpi"><b>{res.filter((r) => r.correctness === "right").length} von {res.length}</b><small>im ersten Versuch richtig ({pct(share(res))})</small></div></div>
        <p className="muted">{mode === "due" ? "Die Ergebnisse sind in deinen Wiederholungsplan eingegangen: richtig verlängert das Intervall dieser Kompetenz, falsch verkürzt es." : "Freies Üben verändert deinen Wiederholungsplan nicht."}</p>
        <ResultBreakdown results={res} />
        <ConfusionOffer />
        <div className="row"><button className="btn btn-primary" onClick={onAgain}>Zurück</button><Link className="btn btn-secondary" href="/">Zur Startseite</Link></div>
      </div>
    );
  return <TaskRunner tasks={tasks} feedback="immediate" hints label="Aufgabe" onDone={(rs) => { if (mode === "due") dispatch({ t: "results", unit: 0, phase: 7, results: rs, now: Date.now(), keep: false }); setRes(rs); }} />;
}

/** Üben: echte Wiederholungen nach Plan (echte Zeit), erkannte Verwechslungen und freie gemischte Übung. */
export function Practice() {
  const { s } = useLesson();
  const [run, setRun] = useState<{ tasks: Task[]; mode: "due" | "free" } | null>(null);
  const [now] = useState(() => Date.now());
  const due = dueEntries(s.srs, now);
  const byComp = due.reduce<Record<string, number>>((a, d) => { const c = parseSrsKey(d.key).competence; a[c] = (a[c] ?? 0) + 1; return a; }, {});
  const known = Object.keys(s.srs).length;
  if (run) return <Session key={JSON.stringify(run.tasks.map((t) => t.id))} tasks={run.tasks} mode={run.mode} onAgain={() => setRun(null)} />;
  if (known === 0)
    return (
      <div className="stack-lg fade"><header className="stack"><p className="eyebrow">Üben</p><h1>Wiederholen und üben</h1></header>
        <p className="notice" role="status">Hier erscheinen Wiederholungen, sobald du in der Lektion Aufgaben beantwortet hast.</p><Link className="btn btn-primary" href="/lektion">Zur Lektion</Link></div>
    );
  const startDue = () => {
    const picked = due.slice(0, CAP).map((d) => { const { itemId, competence } = parseSrsKey(d.key); return reviewTaskFor(itemId, competence, s.srs[d.key].reps); }).filter((t): t is Task => !!t);
    setRun({ tasks: interleaveTasks(picked), mode: "due" });
  };
  const startFree = () => {
    const pool = ITEMS.filter((i) => Object.keys(s.srs).some((k) => parseSrsKey(k).itemId === i.id));
    const picked = [...pool].sort(() => Math.random() - 0.5).slice(0, 12);
    setRun({ tasks: interleaveTasks(picked.map((i) => makeTask(i.id, Math.floor(Math.random() * variantCount(i.id))))), mode: "free" });
  };
  return (
    <div className="stack-lg fade">
      <header className="stack"><p className="eyebrow">Üben</p><h1>Wiederholen und üben</h1></header>
      <section className="panel stack" aria-labelledby="due"><h2 id="due">{due.length > 0 ? `${due.length} Wiederholungen fällig` : "Heute ist nichts fällig"}</h2>
        {due.length > 0 ? (<>
          <p className="muted">Nach deinem Plan, schwächste zuerst. {Object.entries(byComp).map(([c, n]) => `${COMPETENCE_LABEL[c as Competence]}: ${n}`).join(" · ")}. Pro Sitzung höchstens {CAP}.</p>
          <ul className="goals">{due.slice(0, 5).map((d) => { const { itemId, competence } = parseSrsKey(d.key); return <li key={d.key}><RichText text={ITEM_BY_ID.get(itemId)?.label ?? itemId} /> <span className="muted">· {COMPETENCE_LABEL[competence]}</span></li>; })}</ul>
          <button className="btn btn-primary" onClick={startDue}>Wiederholung starten</button></>) : <p className="muted">Der Plan wiederholt eine Kompetenz erst kurz vor dem Vergessen. Komm später wieder, oder übe frei.</p>}
      </section>
      <ConfusionOffer />
      <section className="panel stack" aria-labelledby="free"><h2 id="free">Freie Übung</h2><p className="muted">12 gemischte Aufgaben aus allem, was du schon geübt hast. Verändert den Plan nicht.</p><div><button className="btn btn-secondary" onClick={startFree}>Freie Übung starten</button></div></section>
    </div>
  );
}
