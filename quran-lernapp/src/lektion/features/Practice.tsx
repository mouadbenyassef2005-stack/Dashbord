"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import { ITEMS, ITEM_BY_ID } from "@/lektion/content/lektion1";
import type { Slide } from "@/lektion/content/path";
import { COMPETENCE_LABEL, parseSrsKey } from "@/lektion/domain/lektion/competence";
import { dueEntries } from "@/lektion/domain/lektion/state";
import { interleaveTasks, makeTask, reviewTaskFor, variantCount, type Task } from "@/lektion/domain/lektion/tasks";
import { RichText } from "@/lektion/ui/parts";
import { ConfusionOffer } from "./Remedial";
import { useLesson } from "./LessonContext";
import { LessonPlayer } from "./play/LessonPlayer";

const CAP = 10;
/** Im ersten Lernpfad gibt es nur Buchstaben, Tashkeel und Silben. Alles andere bleibt für später. */
const IN_PATH = (id: string) => /^(letter|vowel):/.test(id) || /^syl:\w+-(fatha|kasra|damma)$/.test(id);

/** Üben: echte Wiederholungen nach Plan (echte Zeit), erkannte Verwechslungen und freie Übung. */
export function Practice() {
  const { s } = useLesson();
  const [run, setRun] = useState<{ tasks: Task[]; mode: "due" | "free"; n: number } | null>(null);
  const [now] = useState(() => Date.now());
  const seq = useRef(0);
  const due = dueEntries(s.srs, now).filter((d) => IN_PATH(parseSrsKey(d.key).itemId));
  const known = Object.keys(s.srs).filter((k) => IN_PATH(parseSrsKey(k).itemId));
  if (run) {
    const slides: Slide[] = run.tasks.map((task) => ({ k: "taskobj", task }));
    return <LessonPlayer key={run.n} id="ueben" title="Üben" slides={slides} src={run.mode === "due" ? "ueben" : "frei"} onClose={() => setRun(null)} finishLabel="Fertig" />;
  }
  if (known.length === 0)
    return (
      <div className="qd stack-lg fade"><header className="stack"><h1>Üben</h1></header>
        <p className="notice" role="status">Hier erscheinen Wiederholungen, sobald du eine Lektion geschafft hast.</p><Link className="btn btn-primary" href="/">Zum Lernpfad</Link></div>
    );
  const startDue = () => {
    const picked = due.slice(0, CAP).map((d) => { const { itemId, competence } = parseSrsKey(d.key); return reviewTaskFor(itemId, competence, s.srs[d.key].reps); }).filter((t): t is Task => !!t);
    setRun({ tasks: interleaveTasks(picked), mode: "due", n: ++seq.current });
  };
  const startFree = () => {
    const ids = new Set(known.map((k) => parseSrsKey(k).itemId));
    const pool = ITEMS.filter((i) => ids.has(i.id) && IN_PATH(i.id));
    const picked = [...pool].sort(() => Math.random() - 0.5).slice(0, 10);
    setRun({ tasks: interleaveTasks(picked.map((i) => makeTask(i.id, Math.floor(Math.random() * variantCount(i.id))))), mode: "free", n: ++seq.current });
  };
  return (
    <div className="qd stack-lg fade">
      <header className="stack"><h1>Üben</h1></header>
      <section className="panel stack" aria-labelledby="due"><h2 id="due">{due.length > 0 ? `${due.length} Wiederholungen fällig` : "Heute ist nichts fällig"}</h2>
        {due.length > 0 ? (<>
          <ul className="goals">{due.slice(0, 4).map((d) => { const { itemId, competence } = parseSrsKey(d.key); return <li key={d.key}><RichText text={ITEM_BY_ID.get(itemId)?.label ?? itemId} /> <span className="muted">· {COMPETENCE_LABEL[competence]}</span></li>; })}</ul>
          <button className="btn btn-primary" onClick={startDue}>Wiederholung starten</button></>) : <p className="muted">Eine Kompetenz wird erst kurz vor dem Vergessen wiederholt. Komm später wieder oder übe frei.</p>}
      </section>
      <ConfusionOffer />
      <section className="panel stack" aria-labelledby="free"><h2 id="free">Freie Übung</h2><p className="muted">10 gemischte Aufgaben. Verändert den Wiederholungsplan nicht.</p><div><button className="btn btn-secondary" onClick={startFree}>Freie Übung starten</button></div></section>
    </div>
  );
}
