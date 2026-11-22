"use client";
import { AREAS, COMPETENCE_LABEL, LEVEL_HELP, LEVEL_LABEL, summarize, type Level } from "@/lektion/domain/lektion/competence";
import { useLesson } from "./LessonContext";

const ORDER: Level[] = ["consolidated", "understood", "unsure"];
const ICON: Record<Level, string> = { consolidated: "●●●", understood: "●●○", unsure: "●○○", none: "○○○" };

/**
 * Vier Kompetenzbereiche, bewusst NICHT zu einem Wert zusammengefasst. Gezeigt werden Anzahlen je Stufe aus echten Antworten,
 * keine Prozentwerte: Eine Seite zu öffnen oder eine Aufgabe zu beenden zählt nicht als Können.
 */
export function CompetenceBoard() {
  const { s } = useLesson();
  const sums = summarize(s.log, s.srs);
  return (
    <section className="stack" aria-labelledby="board">
      <h2 id="board">Deine Kompetenzen</h2>
      <p className="muted">Getrennt nach vier Bereichen. Gezählt werden geübte Inhalte nach deinen echten Antworten. Wer etwas erkennt, kann es noch nicht automatisch hören, sprechen oder schreiben.</p>
      <div className="areas">
        {AREAS.map((a) => {
          const sum = sums.find((x) => x.id === a.id)!;
          return (
            <article key={a.id} className="area" aria-labelledby={`a-${a.id}`}>
              <h3 id={`a-${a.id}`}>{a.title}</h3>
              <p className="muted" style={{ fontSize: 13 }}>{a.question}</p>
              {sum.total === 0 ? <p className="area-empty">{ICON.none} Noch nicht geübt</p> : (
                <>
                  <ul className="levels">
                    {ORDER.map((lv) => <li key={lv} data-level={lv} title={LEVEL_HELP[lv]}><span aria-hidden className="dots">{ICON[lv]}</span> <b>{sum.counts[lv]}</b> {LEVEL_LABEL[lv].toLowerCase()}</li>)}
                  </ul>
                  <p className="muted" style={{ fontSize: 12 }}>{a.comps.map((c) => `${COMPETENCE_LABEL[c]}: ${Object.values(sum.byComp[c]).reduce((x, y) => x + y, 0)} Inhalte`).join(" · ")}</p>
                </>
              )}
            </article>
          );
        })}
      </div>
      <details className="why"><summary>Was bedeuten die Stufen?</summary>
        <div className="stack">{(["unsure", "understood", "consolidated"] as Level[]).map((lv) => <p key={lv} className="muted"><b>{LEVEL_LABEL[lv]}:</b> {LEVEL_HELP[lv]}</p>)}
          <p className="muted">Die Schwellen sind didaktische Startwerte, nicht an Lernende kalibriert. „Gefestigt“ ist kein Nachweis dauerhaften Könnens, sondern bedeutet: über mehrere Tage richtig und laut Modell stabil.</p></div></details>
    </section>
  );
}
