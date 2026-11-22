"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ITEM_BY_ID } from "@/lektion/content/lektion1";
import { DAY, retrievability } from "@/lektion/domain/scheduler";
import { daysToNextDue, dueEntries, simNow } from "@/lektion/domain/lektion/state";
import { interleaveTasks, reviewTask, type Task, type TaskResult } from "@/lektion/domain/lektion/tasks";
import { RichText } from "@/lektion/ui/parts";
import { PhaseFrame } from "../PhaseFrame";
import { TaskRunner } from "../TaskRunner";
import { ForgettingChart } from "../ForgettingChart";
import { share } from "../Summary";
import { useLesson } from "../LessonContext";

const fmtDay = (ts: number) => new Date(ts).toLocaleDateString("de-DE", { weekday: "short", day: "numeric", month: "short" });
const dueText = (days: number) => days <= 0 ? "fällig" : days < 1 ? "heute" : days < 1.5 ? "in 1 Tag" : days < 30 ? `in ${Math.round(days)} Tagen` : `in ${Math.round(days / 30)} Mon.`;
const SESSION_CAP = 8;

function Principle() {
  const { s } = useLesson();
  const n = Object.keys(s.srs).length;
  return (
    <>
      <div className="stack"><h1>Gegen das Vergessen</h1>
        <p className="muted">Heute fühlt sich alles sicher an. Ohne Wiederholung verblasst das aber binnen Tagen. Der Plan wiederholt jedes Item kurz bevor du es vergisst, und das Intervall wächst mit jedem Erfolg.</p></div>
      <section className="panel stack" aria-labelledby="how"><h2 id="how">So rechnet der Planer</h2>
        <div className="fact"><b>1</b><p>Für jedes Item schätzt er, wie <strong>stabil</strong> deine Erinnerung ist.</p></div>
        <div className="fact"><b>2</b><p>Sinkt die Abrufwahrscheinlichkeit auf etwa <strong>90 %</strong>, ist das Item fällig.</p></div>
        <div className="fact"><b>3</b><p><strong>Erfolg</strong> verlängert das nächste Intervall, besonders wenn es schwer war. <strong>Fehler</strong> verkürzen es deutlich.</p></div>
        <p className="muted">Die Werte sind Startannahmen, nicht an dich kalibriert. Sie werden mit echten Daten besser.</p></section>
      <section className="stack" aria-labelledby="sim"><h2 id="sim">Die Simulation</h2>
        <p className="muted">Im nächsten Schritt springst du durch die Zeit: Tage vergehen, Erinnerungen verblassen, Items werden fällig, und du wiederholst sie. So siehst du in Minuten, was sonst Wochen dauert. {n > 0 ? `Dein Plan enthält ${n} Items aus den Phasen 4 bis 6.` : "Dein Plan ist noch leer: Schließe zuerst die Phasen 5 und 6 ab."}</p>
        <p className="notice">Das ist eine Simulation. Echte Wiederholungen mit echter Zeit plant der Bereich „Heute“.</p></section>
    </>
  );
}

function Simulation() {
  const { s, dispatch } = useLesson();
  const [real] = useState(() => Date.now());
  useEffect(() => { dispatch({ t: "simStart", now: Date.now() }); }, [dispatch]);
  const now = simNow(s, real);
  const [selected, setSelected] = useState<string | null>(null);
  const [mode, setMode] = useState<"overview" | "session" | "result">("overview");
  const [last, setLast] = useState<{ rs: TaskResult[]; before: Record<string, number> } | null>(null);

  const due = useMemo(() => dueEntries(s.srs, now), [s.srs, now]);
  const [sessionTasks, setSessionTasks] = useState<Task[]>([]);
  const ids = Object.keys(s.srs).sort((a, b) => retrievability(s.srs[a], now) - retrievability(s.srs[b], now));
  const jump = daysToNextDue(s.srs, now);
  const focus = selected && s.srs[selected] ? selected : ids[0] ?? null;
  const label = (id: string) => ITEM_BY_ID.get(id)?.label ?? id;

  if (!ids.length) return <p className="notice">Dein Wiederholungsplan ist noch leer. Schließe die Phasen 5 und 6 ab.</p>;

  if (mode === "session")
    return (
      <div className="stack-lg">
        <h1>Wiederholung · Tag {s.offsetDays}</h1>
        <TaskRunner tasks={sessionTasks} feedback="immediate" label="Wiederholung"
          onDone={(rs) => {
            const before = Object.fromEntries(rs.map((r) => [r.itemId, s.srs[r.itemId]?.dueAt - now]));
            dispatch({ t: "results", phase: 7, results: rs, now, sim: true });
            dispatch({ t: "session", session: { day: s.offsetDays, total: rs.length, right: rs.filter((r) => r.correctness === "right").length } });
            setLast({ rs, before }); setMode("result");
          }} />
      </div>
    );

  if (mode === "result" && last)
    return (
      <div className="stack-lg fade">
        <h1>Geschafft · Tag {s.offsetDays}</h1>
        <div className="kpis"><div className="kpi"><b>{last.rs.filter((r) => r.correctness === "right").length}/{last.rs.length}</b><small>richtig</small></div></div>
        <section className="stack" aria-labelledby="ni"><h2 id="ni">Neue Intervalle</h2>
          <div className="deck">
            {last.rs.map((r) => {
              const m = s.srs[r.itemId];
              return <div className="it" key={r.itemId}><span className="nm"><RichText text={label(r.itemId)} /></span><span className="muted">{r.correctness === "right" ? "richtig → Intervall wächst" : "falsch → kommt bald wieder"}</span><span className="due">{dueText((m.dueAt - now) / DAY)}</span></div>;
            })}
          </div></section>
        <div className="row"><button className="btn btn-primary" onClick={() => setMode("overview")}>Zurück zur Zeitreise</button></div>
      </div>
    );

  const adv = (d: number) => { dispatch({ t: "advance", days: d }); };
  return (
    <div className="sim">
      <div className="stack"><h1>Zeitreise</h1><p className="muted">Spule die Zeit vor. Beobachte, wie Erinnerungen verblassen und welche Items fällig werden.</p></div>
      <section className="panel stack" aria-labelledby="clk">
        <div className="clock" id="clk"><span className="day" aria-live="polite">Tag {s.offsetDays}</span><span className="muted">{fmtDay(now)} · simuliert</span></div>
        <div className="jumps" role="group" aria-label="Zeit vorspulen">
          {([[1, "+1 Tag"], [3, "+3 Tage"], [7, "+1 Woche"], [14, "+2 Wochen"], [30, "+1 Monat"]] as const).map(([d, l]) => <button key={d} className="btn btn-secondary" onClick={() => adv(d)}>{l}</button>)}
          {jump !== null && due.length === 0 && <button className="btn btn-secondary" onClick={() => adv(jump)}>Zum nächsten fälligen Item</button>}
        </div>
        {s.offsetDays >= 14 && due.length > SESSION_CAP && <p className="notice">Nach längerer Pause staut sich vieles an. Der Planer deckelt die Sitzung auf {SESSION_CAP} Items, schwächste zuerst, den Rest holst du ohne Druck nach.</p>}
      </section>

      <section className="panel stack" aria-labelledby="duen"><h2 id="duen">{due.length > 0 ? `${due.length} Items fällig` : "Heute ist nichts fällig"}</h2>
        {due.length > 0
          ? <><p className="muted">Die schwächsten zuerst, gemischt. {due.length > SESSION_CAP ? `Diese Sitzung: ${SESSION_CAP} Items.` : ""}</p><button className="btn btn-primary" onClick={() => { setSessionTasks(interleaveTasks(due.slice(0, SESSION_CAP).map((d) => reviewTask(d.itemId, s.srs[d.itemId].reps)))); setMode("session"); }}>Wiederholung starten</button></>
          : <p className="muted">Das ist das Prinzip: Es wird nur wiederholt, was kurz vor dem Vergessen steht. Spule vor{jump ? `, das nächste Item wird in etwa ${jump} ${jump === 1 ? "Tag" : "Tagen"} fällig` : ""}.</p>}
      </section>

      <section className="stack" aria-labelledby="dk"><h2 id="dk">Dein Wiederholungsplan</h2>
        <div className="deck" role="list">
          {ids.map((id) => {
            const m = s.srs[id], r = retrievability(m, now), d = (m.dueAt - now) / DAY;
            return (
              <div key={id} className="it" role="listitem">
                <button onClick={() => setSelected(id)} aria-pressed={focus === id} aria-label={`${label(id)}, Abrufwahrscheinlichkeit ${Math.round(r * 100)} Prozent, ${dueText(d)}. Kurve anzeigen`}>
                  <span className="nm" style={{ fontWeight: focus === id ? 600 : 400 }}><RichText text={label(id)} /></span>
                </button>
                <div className="rbar" data-low={r < 0.9} data-due={d <= 0} role="img" aria-label={`${Math.round(r * 100)} Prozent`}><i style={{ width: `${Math.round(r * 100)}%` }} /></div>
                <span className="due" data-due={d <= 0}>{dueText(d)}</span>
              </div>
            );
          })}
        </div>
      </section>

      {focus && (
        <section className="stack" aria-labelledby="vk"><h2 id="vk">Vergessenskurve: <RichText text={label(focus)} /></h2>
          <p className="muted">Stabilität {s.srs[focus].stability.toFixed(1)} Tage · {s.srs[focus].reps} Wiederholungen · {s.srs[focus].lapses} Fehler</p>
          <ForgettingChart s={s} itemId={focus} now={now} label={label(focus)} /></section>
      )}
    </div>
  );
}

function Finish() {
  const { s, dispatch } = useLesson();
  const [confirm, setConfirm] = useState(false);
  const ids = Object.keys(s.srs);
  const meanS = ids.length ? ids.reduce((a, id) => a + s.srs[id].stability, 0) / ids.length : 0;
  const sim = s.sessions;
  const simShare = sim.length ? sim.reduce((a, x) => a + x.right, 0) / Math.max(1, sim.reduce((a, x) => a + x.total, 0)) : 0;
  const retr = s.results[6] ?? [];
  return (
    <>
      <div className="stack"><h1>Lektion 1 geschafft</h1><p className="muted">Du hast alle sieben Stationen durchlaufen. Das hast du jetzt in der Hand:</p></div>
      <div className="kpis">
        <div className="kpi"><b>{ids.length}</b><small>Items im Wiederholungsplan</small></div>
        <div className="kpi"><b>{Math.round(share(retr) * 100)} %</b><small>im Abruftest richtig</small></div>
        <div className="kpi"><b>{sim.length}</b><small>simulierte Wiederholungen ({Math.round(simShare * 100)} % richtig)</small></div>
        <div className="kpi"><b>{meanS.toFixed(1)} T.</b><small>mittlere Stabilität</small></div>
      </div>
      <section className="panel stack"><h2>Wie es weitergeht</h2>
        <p className="muted">Wiederhole in den nächsten Tagen mit kurzen Übungen: Genau dann wirkt es am stärksten. Unter „Üben“ findest du gemischte Aufgaben zu allem, was du gelernt hast.</p>
        <div className="row"><Link className="btn btn-primary" href="/ueben">Zu „Üben“</Link><Link className="btn btn-secondary" href="/">Zur Startseite</Link></div></section>
      <section className="stack"><p className="muted" style={{ fontSize: 13 }}>Hinweis: Inhalte und Ausspracheanleitungen sind noch nicht von einer Arabisch-Lehrkraft abgenommen, und es gibt noch keine Sprecher-Aufnahmen.</p>
        {!confirm ? <button className="btn btn-ghost" onClick={() => setConfirm(true)}>Lektion von vorn beginnen</button>
          : <div className="row"><span className="muted">Dein Fortschritt in dieser Lektion wird gelöscht (der allgemeine Lernstand bleibt).</span><button className="btn btn-secondary" onClick={() => { dispatch({ t: "reset", now: Date.now() }); setConfirm(false); }}>Ja, zurücksetzen</button><button className="btn btn-ghost" onClick={() => setConfirm(false)}>Abbrechen</button></div>}</section>
    </>
  );
}

export function P7Festigen({ onFinish }: { onFinish(): void }) {
  const { s } = useLesson();
  const step = s.steps[7] ?? 0;
  return (
    <PhaseFrame
      phase={7} labels={["Prinzip", "Zeitreise", "Abschluss"]} canNext={step === 1 ? s.sessions.length >= 1 : true}
      finishLabel="Lektion abschließen" onFinish={onFinish}
      why={<p className="muted"><b>Spaced Repetition:</b> Erinnerungen verblassen nach einer Kurve. Wiederholst du kurz vor dem Vergessen, wird jede Erinnerung stabiler und die Abstände wachsen.</p>}
    >
      {(st) => st === 0 ? <Principle /> : st === 1 ? <Simulation /> : <Finish />}
    </PhaseFrame>
  );
}
