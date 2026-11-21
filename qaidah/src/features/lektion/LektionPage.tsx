import { useEffect, useState } from "react";
import { PHASES, PHASE_COUNT } from "@/domain/lektion/state";
import { LessonProvider, useLesson } from "./LessonContext";
import { P1Orientierung } from "./phases/P1Orientierung";
import { P2Entdecken } from "./phases/P2Entdecken";
import { P3Hypothesen } from "./phases/P3Hypothesen";
import { P4Verstehen } from "./phases/P4Verstehen";
import { P5Anwenden } from "./phases/P5Anwenden";
import { P6Abrufen } from "./phases/P6Abrufen";
import { P7Festigen } from "./phases/P7Festigen";

function Lesson() {
  const { s, dispatch } = useLesson();
  const first = () => Math.min(PHASE_COUNT, s.unlocked);
  const [view, setView] = useState(first);
  useEffect(() => { window.scrollTo?.({ top: 0 }); }, [view]);
  const finish = (n: number) => () => { dispatch({ t: "complete", phase: n }); setView(Math.min(PHASE_COUNT, n + 1)); };
  const pct = Math.round((s.done.length / PHASE_COUNT) * 100);
  return (
    <div className="l1 stack-lg">
      <div className="stack">
        <div className="row between"><p className="eyebrow">Lektion 1 · Alif, Bā, Tā, Thā</p><span className="muted" style={{ fontSize: 13 }}>{s.done.length} von {PHASE_COUNT} Phasen</span></div>
        <div className="progress" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Gesamtfortschritt der Lektion"><span style={{ width: `${pct}%` }} /></div>
        <ol className="stepper" aria-label="Phasen der Lektion">
          {PHASES.map((p) => {
            const open = p.n <= s.unlocked;
            return (
              <li key={p.n}><button aria-current={view === p.n ? "step" : undefined} data-done={s.done.includes(p.n)} disabled={!open} onClick={() => setView(p.n)} aria-label={`Phase ${p.n}: ${p.title}${s.done.includes(p.n) ? ", abgeschlossen" : !open ? ", noch gesperrt" : ""}`}>
                <b>{s.done.includes(p.n) ? "✓" : p.n}</b><small>{p.title}</small></button></li>
            );
          })}
        </ol>
      </div>
      {view === 1 && <P1Orientierung onFinish={finish(1)} />}
      {view === 2 && <P2Entdecken onFinish={finish(2)} />}
      {view === 3 && <P3Hypothesen onFinish={finish(3)} />}
      {view === 4 && <P4Verstehen onFinish={finish(4)} />}
      {view === 5 && <P5Anwenden onFinish={finish(5)} />}
      {view === 6 && <P6Abrufen onFinish={finish(6)} />}
      {view === 7 && <P7Festigen onFinish={finish(7)} />}
    </div>
  );
}

export function LektionPage() {
  return <LessonProvider><Lesson /></LessonProvider>;
}
