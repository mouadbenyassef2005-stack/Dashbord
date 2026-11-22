"use client";
import { useMemo, useState } from "react";
import { ITEM_BY_ID } from "@/lektion/content/lektion1";
import type { Slide } from "@/lektion/content/path";
import { activeConfusions } from "@/lektion/domain/lektion/state";
import { drillSets } from "@/lektion/domain/lektion/tasks";
import { useLesson } from "./LessonContext";
import { LessonPlayer } from "./play/LessonPlayer";

const label = (id: string) => ITEM_BY_ID.get(id)?.label ?? id;

/**
 * Gezielte Vergleichsübung für ein verwechseltes Paar: Unterschied zeigen, neue Beispiele üben, dann ohne Hilfe nachtesten.
 * Gelöst gilt die Verwechslung erst, wenn der Nachtest bestanden ist.
 */
function Drill({ a, b, onClose }: { a: string; b: string; onClose(): void }) {
  const { dispatch } = useLesson();
  const { slides, retestIds } = useMemo(() => {
    const { practice, retest } = drillSets(a, b);
    const sl: Slide[] = [{ k: "compare", a, b }, ...practice.map((task): Slide => ({ k: "taskobj", task })), ...retest.map((task): Slide => ({ k: "taskobj", task, deferred: true }))];
    return { slides: sl, retestIds: new Set(retest.map((t) => t.id)) };
  }, [a, b]);
  return (
    <LessonPlayer id={`drill-${a}-${b}`} title="Gezielt vergleichen" slides={slides} src="drill" onClose={onClose} finishLabel="Fertig"
      onFinish={({ results }) => {
        const re = results.filter((r) => retestIds.has(r.taskId));
        if (re.length && re.filter((r) => r.correctness === "right").length >= Math.ceil(re.length * 0.75)) dispatch({ t: "resolve", a, b });
      }} />
  );
}

/** Zeigt aktive Verwechslungen und startet die passende Vergleichsübung. */
export function ConfusionOffer() {
  const { s } = useLesson();
  const [open, setOpen] = useState<{ a: string; b: string } | null>(null);
  const list = activeConfusions(s);
  if (!list.length && !open) return null;
  return (
    <section className="stack" aria-labelledby="conf">
      {list.length > 0 && <h2 id="conf">Das verwechselst du oft</h2>}
      {list.map((c) => (
        <article key={c.a + c.b} className="cmp" data-ok="false">
          <p><b>{label(c.a)}</b> und <b>{label(c.b)}</b> hast du {c.count}-mal verwechselt.</p>
          <div><button className="btn btn-primary" onClick={() => setOpen({ a: c.a, b: c.b })}>Gezielt vergleichen</button></div>
        </article>
      ))}
      {open && <Drill a={open.a} b={open.b} onClose={() => setOpen(null)} />}
    </section>
  );
}
