"use client";
import { COMPETENCE_LABEL, COMPETENCES, type Competence } from "@/lektion/domain/lektion/competence";
import { correctAnswerOf, taskFromId, type TaskResult } from "@/lektion/domain/lektion/tasks";
import { Ar, RichText } from "@/lektion/ui/parts";

export const share = (rs: TaskResult[]) => (rs.length ? rs.filter((r) => r.correctness === "right").length / rs.length : 0);
export const pct = (x: number) => `${Math.round(x * 100)} %`;

/** Auswertung nach Kompetenz (nie als ein Gesamtwert) plus Fehlerliste mit Begründung. */
export function ResultBreakdown({ results }: { results: TaskResult[] }) {
  const wrong = results.filter((r) => r.correctness !== "right");
  return (
    <div className="stack">
      <div className="kpis">
        {COMPETENCES.map((c: Competence) => {
          const rs = results.filter((r) => r.competence === c);
          if (!rs.length) return null;
          return <div key={c} className="kpi"><b>{rs.filter((r) => r.correctness === "right").length}/{rs.length}</b><small>{COMPETENCE_LABEL[c]}</small></div>;
        })}
      </div>
      {wrong.length > 0 ? (
        <section className="stack" aria-labelledby="wr"><h2 id="wr">Das schauen wir uns an</h2>
          {wrong.map((r) => {
            const t = taskFromId(r.taskId);
            return (
              <article key={r.taskId} className="cmp" data-ok="false">
                {t.ar && <Ar size="body">{t.ar}</Ar>}
                <p><strong><RichText text={t.prompt} /></strong></p>
                <p><span className="muted">Deine Antwort:</span> <RichText text={r.answer || "–"} /> · <span className="muted">Richtig:</span> <strong><RichText text={correctAnswerOf(t)} /></strong>{r.correctness === "lengthOnly" ? <span className="tag"> Länge fehlte</span> : null}</p>
                <p className="muted"><RichText text={t.explain} /></p>
              </article>
            );
          })}
        </section>
      ) : <p className="notice" role="status">Alles richtig in diesem Durchgang.</p>}
    </div>
  );
}
