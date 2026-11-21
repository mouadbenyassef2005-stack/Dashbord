import { useMemo } from "react";
import { PRETEST_SPEC, RETRIEVAL_SPEC, buildSet } from "@/domain/lektion/tasks";
import { PhaseFrame } from "../PhaseFrame";
import { TaskRunner } from "../TaskRunner";
import { ResultBreakdown, share } from "../Summary";
import { useRecordLetters } from "../recordLetters";
import { useLesson } from "../LessonContext";

export function P6Abrufen({ onFinish }: { onFinish(): void }) {
  const { s, dispatch } = useLesson();
  const recordLetters = useRecordLetters();
  const tasks = useMemo(() => buildSet(RETRIEVAL_SPEC), []);
  const step = s.steps[6] ?? 0;
  const res = s.results[6];
  const pre = PRETEST_SPEC.map(([id]) => s.pretest[id]).filter(Boolean);
  const preRight = pre.filter((x) => x === "right").length;
  const postLetters = (res ?? []).filter((r) => r.itemId.startsWith("letter:"));
  return (
    <PhaseFrame
      phase={6} labels={["Spielregeln", "Abruftest", "Auswertung"]} canNext={step === 1 ? !!res : true}
      finishLabel="Weiter zu Phase 7: Festigen" onFinish={onFinish}
      why={<p className="muted"><b>Retrieval Practice:</b> Das Abrufen aus dem Gedächtnis ohne Vorlage stärkt Erinnerung mehr als erneutes Lesen. Darum gibt es im Test keine Hinweise und die Rückmeldung erst am Ende.</p>}
    >
      {(st) => st === 0 ? (
        <>
          <div className="stack"><h1>Abruftest</h1><p className="muted">Dreizehn Aufgaben, überwiegend mit freier Antwort. Es gibt andere Aufgabenformen als in Phase 5.</p></div>
          <section className="panel stack">
            <div className="fact"><b>1</b><p><strong>Keine Hinweise, kein Zurück.</strong> Dein Gedächtnis arbeitet, nicht die Oberfläche.</p></div>
            <div className="fact"><b>2</b><p><strong>Rückmeldung erst am Ende</strong>, gesammelt und mit Begründung.</p></div>
            <div className="fact"><b>3</b><p><strong>Anstrengung ist ein gutes Zeichen.</strong> Was sich schwer anfühlt, wird dadurch dauerhafter.</p></div>
          </section>
        </>
      ) : st === 1 ? (
        res ? <p className="notice" role="status">Der Test ist abgeschlossen. Die Auswertung steht im nächsten Schritt.</p>
          : <TaskRunner tasks={tasks} feedback="deferred" label="Frage" onDone={(rs) => { dispatch({ t: "results", phase: 6, results: rs, now: Date.now() }); void recordLetters(rs, "lektion1-abruf"); }} />
      ) : res ? (
        <>
          <div className="stack"><h1>Dein Ergebnis</h1></div>
          <div className="kpis"><div className="kpi"><b>{Math.round(share(res) * 100)} %</b><small>richtig ({res.filter((r) => r.correctness === "right").length} von {res.length})</small></div>
            <div className="kpi"><b>{res.filter((r) => r.type === "type" && r.correctness === "right").length}</b><small>freie Antworten richtig</small></div></div>
          {pre.length > 0 && postLetters.length > 0 && (
            <section className="stack" aria-labelledby="pp"><h2 id="pp">Vorher und nachher: die vier Buchstaben</h2>
              <div className="pre-post"><div className="kpi"><b>{preRight} von {pre.length}</b><small>Vorab-Fragen richtig</small></div>
                <div className="kpi"><b>{postLetters.filter((r) => r.correctness === "right").length} von {postLetters.length}</b><small>im Abruftest richtig</small></div></div></section>
          )}
          <ResultBreakdown results={res} />
        </>
      ) : <p className="notice">Der Test fehlt noch. Gehe einen Schritt zurück.</p>}
    </PhaseFrame>
  );
}
