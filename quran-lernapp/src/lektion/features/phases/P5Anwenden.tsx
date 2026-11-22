"use client";
import { useMemo, useState } from "react";
import { PRACTICE_SPEC, buildSet } from "@/lektion/domain/lektion/tasks";
import { WriteTask } from "@/lektion/ui/WriteTask";
import { PhaseFrame } from "../PhaseFrame";
import { TaskRunner } from "../TaskRunner";
import { ResultBreakdown, share } from "../Summary";
import { useLesson } from "../LessonContext";

const FREE = ["ta", "tha"];

export function P5Anwenden({ onFinish }: { onFinish(): void }) {
  const { s, dispatch } = useLesson();
  const tasks = useMemo(() => buildSet(PRACTICE_SPEC), []);
  const [wi, setWi] = useState(0);
  const step = s.steps[5] ?? 0;
  const res = s.results[5];
  const wdone = wi >= FREE.length;

  const onWrite = () => setWi((n) => n + 1);
  const known = res?.filter((r) => !tasks.find((t) => t.id === r.taskId)?.novel) ?? [];
  const novel = res?.filter((r) => tasks.find((t) => t.id === r.taskId)?.novel) ?? [];

  return (
    <PhaseFrame
      phase={5} labels={["Auftrag", "Gemischte Übung", "Ohne Vorlage schreiben", "Auswertung"]}
      canNext={step === 1 ? !!res : step === 2 ? wdone || s.done.includes(5) : true} finishLabel="Weiter zu Phase 6: Abrufen" onFinish={onFinish}
      why={<><p className="muted"><b>Transfer:</b> Du wendest Regeln auf Neues an: Silben und Wörter, die du so noch nie gesehen hast.</p><p className="muted"><b>Interleaved Practice:</b> Buchstaben, Vokale, Silben und Wörter wechseln sich ab. Das fühlt sich schwerer an als Block-Üben, hält aber länger.</p></>}
    >
      {(st) => st === 0 ? (
        <>
          <div className="stack"><h1>Jetzt anwenden</h1><p className="muted">Vierzehn gemischte Aufgaben: Buchstabe, Vokalzeichen, Silbe, Wort und Regel wechseln sich ab, damit du die passende Regel jedes Mal neu wählen musst.</p></div>
          <section className="panel stack">
            <div className="fact"><b>1</b><p>Manche Aufgaben tragen das Etikett <span className="badge">Neu kombiniert</span>. Das sind Silben oder Wörter, die du noch nie gesehen hast, aber mit deinem Wissen lesen kannst.</p></div>
            <div className="fact"><b>2</b><p>Du bekommst sofort Rückmeldung mit Begründung. Ein <strong>Hinweis</strong> hilft, zählt aber als Hilfe.</p></div>
            <div className="fact"><b>3</b><p>Bei Tipp-Antworten zählt die Länge: <em>bāb</em> ist nicht <em>bab</em>.</p></div>
          </section>
        </>
      ) : st === 1 ? (
        res ? <p className="notice" role="status">Diese Übung ist abgeschlossen. Sieh dir die Auswertung im letzten Schritt an.</p>
          : <TaskRunner tasks={tasks} feedback="immediate" hints label="Aufgabe" onDone={(rs) => dispatch({ t: "results", phase: 5, results: rs, now: Date.now() })} />
      ) : st === 2 ? (
        <>
          <div className="stack"><h1>Schreiben ohne Vorlage</h1><p className="muted">Transfer in die Hand: Schreibe Tā und Thā frei. Die beiden unterscheiden nur die Punkte.</p></div>
          {wdone ? <p className="notice" role="status">Geschafft. Ergebnisse sind gespeichert.</p> : (
            <><p className="eyebrow">Schreibaufgabe {wi + 1} von {FREE.length}</p>
              <WriteTask key={wi} letterId={FREE[wi]} mode="free" onDone={onWrite} onSkip={() => setWi((n) => n + 1)} /></>
          )}
        </>
      ) : (
        <>
          <div className="stack"><h1>Auswertung</h1></div>
          {res ? (
            <>
              <div className="kpis">
                <div className="kpi"><b>{Math.round(share(res) * 100)} %</b><small>im ersten Versuch richtig</small></div>
                <div className="kpi"><b>{Math.round(share(known) * 100)} %</b><small>bekannter Stoff ({known.length})</small></div>
                <div className="kpi"><b>{Math.round(share(novel) * 100)} %</b><small>neu kombiniert ({novel.length})</small></div>
              </div>
              <p className="muted">Der Vergleich zeigt, ob du Regeln auf Neues übertragen kannst. Ein niedrigerer Wert bei „neu kombiniert“ ist normal und genau das, was Phase 6 und 7 weiter stärken.</p>
              <ResultBreakdown results={res} />
            </>
          ) : <p className="notice">Die gemischte Übung fehlt noch. Gehe einen Schritt zurück.</p>}
        </>
      )}
    </PhaseFrame>
  );
}
