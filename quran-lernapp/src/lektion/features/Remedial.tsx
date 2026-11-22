"use client";
import { useMemo, useState } from "react";
import { ITEM_BY_ID, FEATURE, SYLLABLES, VOWEL_INFO, type VowelId } from "@/lektion/content/lektion1";
import { LETTER_BY_ID } from "@/lektion/content/letters";
import { activeConfusions } from "@/lektion/domain/lektion/state";
import { drillTasks, type TaskResult } from "@/lektion/domain/lektion/tasks";
import { Ar } from "@/lektion/ui/parts";
import { useLesson } from "./LessonContext";
import { TaskRunner } from "./TaskRunner";
import { Colored, Skeleton } from "./visuals";

const label = (id: string) => ITEM_BY_ID.get(id)?.label ?? id;

function Compare({ a, b }: { a: string; b: string }) {
  const [ka, ia] = a.split(":"), [kb, ib] = b.split(":");
  if (ka === "letter" && kb === "letter") {
    const [la, lb] = [LETTER_BY_ID.get(ia)!, LETTER_BY_ID.get(ib)!];
    const d = (l: typeof la) => (l.dots.count === 0 ? "keine Punkte" : `${l.dots.count} ${l.dots.count === 1 ? "Punkt" : "Punkte"} ${l.dots.pos === "above" ? "oben" : "unten"}`);
    return (
      <div className="cards" role="group" aria-label="Vergleich der beiden Buchstaben">
        {[la, lb].map((l) => <div key={l.id} className="card"><Ar size="teach">{l.ch}</Ar><strong>{l.name}</strong><Skeleton letterId={l.id} label={`Zeichnung ${l.name}`} /><small><b>{d(l)}</b></small><small className="muted">{FEATURE[l.id as keyof typeof FEATURE]?.text}</small></div>)}
      </div>
    );
  }
  if (ka === "syl" && kb === "syl") {
    const [sa, sb] = [SYLLABLES.find((x) => x.id === a)!, SYLLABLES.find((x) => x.id === b)!];
    const why = sa.letterId === sb.letterId ? "Gleicher Buchstabe, anderes Vokalzeichen: Der Vokal ändert sich." : sa.vowel === sb.vowel ? "Gleiches Vokalzeichen, anderer Buchstabe: Zähle die Punkte." : "Buchstabe und Vokal unterscheiden sich.";
    return <div className="stack"><div className="cards">{[sa, sb].map((x) => <div key={x.id} className="card"><Colored text={x.ar} /><strong>{x.tr}</strong></div>)}</div><p>{why}</p></div>;
  }
  if (ka === "vowel" && kb === "vowel") {
    return <div className="cards">{[ia, ib].map((v) => <div key={v} className="card"><strong>{v}</strong><small>steht {VOWEL_INFO[v as VowelId].place}</small><small>{VOWEL_INFO[v as VowelId].look}</small><small>{VOWEL_INFO[v as VowelId].tongue}</small></div>)}</div>;
  }
  return <p className="muted">Vergleiche {label(a)} und {label(b)} genau.</p>;
}

/**
 * Gezielte Vergleichsübung für ein verwechseltes Paar: Unterschiede zeigen, neue Beispiele üben, dann erneut prüfen.
 * Gelöst gilt die Verwechslung erst, wenn der Nachtest bestanden ist.
 */
export function ConfusionDrill({ a, b, onClose }: { a: string; b: string; onClose(): void }) {
  const { dispatch } = useLesson();
  const [stage, setStage] = useState<"compare" | "practice" | "retest" | "done">("compare");
  const [outcome, setOutcome] = useState<{ ok: boolean; right: number; total: number } | null>(null);
  const practice = useMemo(() => drillTasks(a, b, 6), [a, b]);
  const retest = useMemo(() => drillTasks(a, b, 4), [a, b]);
  const record = (rs: TaskResult[]) => dispatch({ t: "results", unit: 0, phase: 5, results: rs, now: Date.now(), keep: false });
  return (
    <section className="panel stack" aria-label="Gezielte Vergleichsübung">
      <p className="eyebrow">Gezielte Vergleichsübung</p>
      <h2>{label(a)} und {label(b)}</h2>
      {stage === "compare" && <>
        <p className="muted">Du hast diese beiden mehrfach verwechselt. Schau dir den Unterschied genau an.</p>
        <Compare a={a} b={b} />
        <div className="row"><button className="btn btn-primary" onClick={() => setStage("practice")}>Neue Beispiele üben</button><button className="btn btn-ghost" onClick={onClose}>Später</button></div></>}
      {stage === "practice" && <TaskRunner tasks={practice} feedback="immediate" hints label="Vergleich" onDone={(rs) => { record(rs); setStage("retest"); }} />}
      {stage === "retest" && <>
        <p className="muted">Kurz prüfen, ob die Verwechslung behoben ist. Ohne Hinweise, Rückmeldung am Ende.</p>
        <TaskRunner tasks={retest} feedback="deferred" label="Nachtest" onDone={(rs) => {
          record(rs);
          const right = rs.filter((r) => r.correctness === "right").length;
          const ok = right >= Math.ceil(rs.length * 0.75);
          if (ok) dispatch({ t: "resolve", a, b });
          setOutcome({ ok, right, total: rs.length }); setStage("done");
        }} /></>}
      {stage === "done" && outcome && <>
        <div className={`feedback ${outcome.ok ? "ok" : "no"}`} role="status"><div className="stack" style={{ gap: 4 }}>
          <strong>{outcome.ok ? "✓ Verwechslung behoben" : "✗ Noch nicht sicher"}</strong>
          <span className="muted">{outcome.right} von {outcome.total} im Nachtest richtig. {outcome.ok ? "Die Verwechslung ist als gelöst markiert. Sie taucht wieder auf, falls sie erneut vorkommt." : "Schau dir den Unterschied noch einmal an und übe erneut."}</span></div></div>
        <div className="row">{!outcome.ok && <button className="btn btn-primary" onClick={() => setStage("compare")}>Nochmal vergleichen</button>}<button className="btn btn-secondary" onClick={onClose}>Fertig</button></div></>}
    </section>
  );
}

/** Zeigt aktive Verwechslungen und startet die passende Vergleichsübung. */
export function ConfusionOffer() {
  const { s } = useLesson();
  const [open, setOpen] = useState<{ a: string; b: string } | null>(null);
  const list = activeConfusions(s);
  if (open) return <ConfusionDrill a={open.a} b={open.b} onClose={() => setOpen(null)} />;
  if (!list.length) return null;
  return (
    <section className="stack" aria-labelledby="conf"><h2 id="conf">Verwechslungen erkannt</h2>
      {list.map((c) => (
        <article key={c.a + c.b} className="cmp" data-ok="false">
          <p><strong>{label(c.a)}</strong> und <strong>{label(c.b)}</strong> hast du {c.count}-mal verwechselt.</p>
          <div><button className="btn btn-primary" onClick={() => setOpen({ a: c.a, b: c.b })}>Gezielt vergleichen und üben</button></div>
        </article>
      ))}
    </section>
  );
}
