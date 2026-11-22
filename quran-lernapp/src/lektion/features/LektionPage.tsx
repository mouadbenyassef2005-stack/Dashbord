"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { UNITS, unitOf } from "@/lektion/content/units";
import { PHASES, PHASE_COUNT, UNIT_COUNT, pk } from "@/lektion/domain/lektion/state";
import { CompetenceBoard } from "./Board";
import { useLesson } from "./LessonContext";
import { P1, P2, P3, P4 } from "./phases1";
import { P5, P6, P7 } from "./phases2";

function Abschluss({ onBack }: { onBack(): void }) {
  const { dispatch } = useLesson();
  const [confirm, setConfirm] = useState(false);
  return (
    <div className="stack-lg fade">
      <header className="stack"><h1>Lektion 1 durchlaufen</h1><p className="muted">Du hast alle vier Einheiten bearbeitet. Das ist ein Lernweg, kein Nachweis: Was du wirklich kannst, zeigen die Kompetenzen und der Wiederholungsplan.</p></header>
      <CompetenceBoard />
      <section className="panel stack"><h2>Wie es weitergeht</h2>
        <p className="muted">Wiederhole in den nächsten Tagen kurz unter „Üben“. Dort stehen fällige Kompetenzen und erkannte Verwechslungen. Lernerfolg ist erst belegt, wenn er in solchen Wiederholungen über Tage hält.</p>
        <div className="row"><Link className="btn btn-primary" href="/ueben">Zu „Üben“</Link><button className="btn btn-secondary" onClick={onBack}>Zurück zur Lektion</button></div></section>
      <section className="stack"><p className="muted" style={{ fontSize: 13 }}>Hinweis: Inhalte und Aussprachebeschreibungen sind noch nicht von einer arabischsprachigen Person abgenommen. Aufnahmen für Wörter und lange Vokale fehlen noch.</p>
        {!confirm ? <button className="btn btn-ghost" onClick={() => setConfirm(true)}>Lektion von vorn beginnen</button>
          : <div className="row"><span className="muted">Dein gesamter Fortschritt wird gelöscht.</span><button className="btn btn-secondary" onClick={() => { dispatch({ t: "reset", now: Date.now() }); setConfirm(false); }}>Ja, zurücksetzen</button><button className="btn btn-ghost" onClick={() => setConfirm(false)}>Abbrechen</button></div>}</section>
    </div>
  );
}

export function LektionPage() {
  const { s, dispatch } = useLesson();
  const firstOpen = () => { const u = s.unit; for (let p = 1; p <= PHASE_COUNT; p++) if (!s.phaseDone[pk(u, p)]) return { unit: u, phase: p }; return { unit: u, phase: PHASE_COUNT }; };
  const [view, setView] = useState<{ unit: number; phase: number }>(firstOpen);
  useEffect(() => { window.scrollTo?.({ top: 0 }); }, [view]);
  const unit = unitOf(Math.min(view.unit, UNIT_COUNT));
  const navigate = (phase: number, step: number) => { dispatch({ t: "step", unit: view.unit, phase, step }); setView({ unit: view.unit, phase }); };
  const finish = (phase: number) => () => {
    dispatch({ t: "phaseDone", unit: view.unit, phase });
    if (phase < PHASE_COUNT) return setView({ unit: view.unit, phase: phase + 1 });
    if (view.unit < UNIT_COUNT && s.unit > view.unit) return setView({ unit: view.unit + 1, phase: 1 });
    if (view.unit === UNIT_COUNT) return setView({ unit: UNIT_COUNT + 1, phase: 1 });
  };
  const props = { unit, navigate };
  const doneCount = Object.keys(s.phaseDone).length;
  return (
    <div className="l1 stack-lg">
      <div className="stack">
        <div className="row between"><p className="eyebrow">Lektion 1 · Alif, Bā, Tā, Thā</p>
          <span className="muted" style={{ fontSize: 13 }}>{doneCount} von {UNIT_COUNT * PHASE_COUNT} Aktivitäten abgeschlossen</span></div>
        <ol className="units" aria-label="Lerneinheiten">
          {UNITS.map((u) => {
            const open = u.id <= s.unit;
            return (
              <li key={u.id}><button aria-current={view.unit === u.id ? "step" : undefined} disabled={!open} onClick={() => setView({ unit: u.id, phase: view.unit === u.id ? view.phase : 1 })}
                aria-label={`Einheit ${u.id}: ${u.short}${s.decided[u.id] ? ", Entscheidung getroffen" : ""}${!open ? ", noch gesperrt" : ""}`}>
                <b>{u.id}</b><span>{u.short}</span>{s.decided[u.id] && <small>{s.decided[u.id].choice === "continue" ? "✓ weiter" : "übt weiter"}</small>}{!open && <small>gesperrt</small>}</button></li>
            );
          })}
        </ol>
        {view.unit <= UNIT_COUNT && (
          <>
            <ol className="stepper" aria-label="Phasen dieser Einheit">
              {PHASES.map((p) => (
                <li key={p.n}><button aria-current={view.phase === p.n ? "step" : undefined} data-done={!!s.phaseDone[pk(view.unit, p.n)]} onClick={() => setView({ unit: view.unit, phase: p.n })}
                  aria-label={`Phase ${p.n}: ${p.title}${s.phaseDone[pk(view.unit, p.n)] ? ", Aktivität abgeschlossen" : ""}`}>
                  <b>{s.phaseDone[pk(view.unit, p.n)] ? "✓" : p.n}</b><small>{p.title}</small></button></li>
              ))}
            </ol>
            <p className="muted" style={{ fontSize: 12 }}>✓ bedeutet: Aktivität abgeschlossen, nicht: gelernt. Du darfst jede Phase jederzeit öffnen.</p>
          </>
        )}
      </div>
      {view.unit > UNIT_COUNT ? <Abschluss onBack={() => setView({ unit: UNIT_COUNT, phase: PHASE_COUNT })} /> : (
        <>
          {view.phase === 1 && <P1 {...props} onFinish={finish(1)} />}
          {view.phase === 2 && <P2 {...props} onFinish={finish(2)} />}
          {view.phase === 3 && <P3 {...props} onFinish={finish(3)} />}
          {view.phase === 4 && <P4 {...props} onFinish={finish(4)} />}
          {view.phase === 5 && <P5 {...props} onFinish={finish(5)} />}
          {view.phase === 6 && <P6 {...props} onFinish={finish(6)} />}
          {view.phase === 7 && <P7 {...props} onFinish={finish(7)} />}
        </>
      )}
    </div>
  );
}
