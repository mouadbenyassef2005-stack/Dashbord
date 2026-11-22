"use client";
import { ITEM_BY_ID } from "@/lektion/content/lektion1";
import { correctAnswerOf, taskFromId, type TaskResult } from "@/lektion/domain/lektion/tasks";
import { Ar } from "@/lektion/ui/parts";

export const share = (rs: TaskResult[]) => rs.length ? rs.filter((r) => r.correctness === "right").length / rs.length : 0;

/** Auswertung einer Ergebnisliste: Anteil nach Aufgabenfamilie und Fehlerliste mit Begründung. */
export function ResultBreakdown({ results }: { results: TaskResult[] }) {
  const families = ["letter", "vowel", "syllable", "word", "concept"] as const;
  const names = { letter: "Buchstaben", vowel: "Vokalzeichen", syllable: "Silben", word: "Wörter", concept: "Regeln" };
  const fam = (r: TaskResult) => ITEM_BY_ID.get(r.itemId)!.kind;
  const wrong = results.filter((r) => r.correctness !== "right");
  return (
    <div className="stack">
      <div className="kpis">
        {families.map((f) => {
          const rs = results.filter((r) => fam(r) === f);
          if (!rs.length) return null;
          const ok = rs.filter((r) => r.correctness === "right").length;
          return <div key={f} className="kpi"><b>{ok}/{rs.length}</b><small>{names[f]}</small></div>;
        })}
      </div>
      {wrong.length > 0 ? (
        <section className="stack" aria-labelledby="wr"><h2 id="wr">Das schauen wir uns an</h2>
          {wrong.map((r) => {
            const t = taskFromId(r.taskId);
            return (
              <article key={r.taskId} className="cmp" data-ok="false">
                {t.ar && <Ar size="body">{t.ar}</Ar>}
                <p><strong>{t.prompt}</strong></p>
                <p><span className="muted">Deine Antwort:</span> {r.answer || "–"} · <span className="muted">Richtig:</span> <strong>{correctAnswerOf(t)}</strong>{r.correctness === "lengthOnly" ? <span className="tag"> Länge fehlte</span> : null}</p>
                <p className="muted">{t.explain}</p>
              </article>
            );
          })}
        </section>
      ) : <p className="notice" role="status">Alles richtig. Die Wiederholungen in Phase 7 sichern das auf lange Sicht.</p>}
    </div>
  );
}
