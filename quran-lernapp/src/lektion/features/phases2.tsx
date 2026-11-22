"use client";
import { useEffect, useMemo, useState } from "react";
import { ITEM_BY_ID } from "@/lektion/content/lektion1";
import { COMPETENCE_LABEL, LEVEL_LABEL, levelOf, estimatedRecall, parseSrsKey, type Competence } from "@/lektion/domain/lektion/competence";
import { DAY } from "@/lektion/domain/scheduler";
import { daysToNextDue, dueEntries, pk, simNow, UNIT_COUNT } from "@/lektion/domain/lektion/state";
import { buildSet, extraTasks, interleaveTasks, reviewTaskFor, type Task, type TaskResult } from "@/lektion/domain/lektion/tasks";
import { WriteSeq } from "./blocks";
import { ConfusionOffer } from "./Remedial";
import { ForgettingChart } from "./ForgettingChart";
import { ResultBreakdown, pct, share } from "./Summary";
import { TaskRunner } from "./TaskRunner";
import { UnitFrame } from "./UnitFrame";
import { useLesson } from "./LessonContext";
import { Fact } from "./blocks";
import type { PhaseProps } from "./phases1";
import { RichText } from "@/lektion/ui/parts";

/* ---------- Phase 5: Anwenden ---------- */
export function P5({ unit, onFinish, navigate }: PhaseProps) {
  const { s, dispatch } = useLesson();
  const tasks = useMemo(() => buildSet(unit.practice), [unit]);
  const key = pk(unit.id, 5);
  const res = s.results[key];
  const hasWrite = unit.writes.length > 0;
  const labels = ["Auftrag", "Gemischte Übung", ...(hasWrite ? ["Ohne Vorlage schreiben"] : []), "Auswertung"];
  const step = Math.min(s.steps[key] ?? 0, labels.length - 1);
  const [wDone, setWDone] = useState(false);
  const canNext = step === 1 ? !!res : hasWrite && step === 2 ? wDone || !!s.phaseDone[pk(unit.id, 5)] : true;
  const known = res?.filter((r) => !tasks.find((t) => t.id === r.taskId)?.novel) ?? [];
  const novel = res?.filter((r) => tasks.find((t) => t.id === r.taskId)?.novel) ?? [];
  const jump = (t: Task) => navigate(2, unit.jump[t.competence] ?? 0);
  return (
    <UnitFrame unit={unit.id} phase={5} labels={labels} canNext={canNext} finishLabel="Weiter: Überprüfung" onFinish={onFinish}
      why={<><p className="muted"><b>Transfer:</b> Du wendest Regeln auf Neues an („Neu kombiniert“).</p><p className="muted"><b>Interleaved Practice:</b> Aufgabenarten wechseln sich ab. Das fühlt sich schwerer an als Block-Üben, hält aber oft länger (Rohrer & Taylor 2007; Kornell & Bjork 2008).</p></>}>
      {(st) => st === 0 ? (
        <>
          <div className="stack"><h1>Selbstständig üben</h1><p className="muted">{tasks.length} gemischte Aufgaben zu Einheit {unit.id}. Buchstabe, Laut, Silbe und Wort wechseln sich ab.</p></div>
          <section className="panel stack">
            <Fact n={1}>Aufgaben mit <span className="badge">Neu kombiniert</span> zeigen Stoff, den du so noch nicht gesehen hast.</Fact>
            <Fact n={2}>Du bekommst sofort Rückmeldung mit Begründung. Ein <strong>Hinweis</strong> hilft, zählt aber als Hilfe.</Fact>
            <Fact n={3}>Bei Hörfragen darfst du die Aufnahme beliebig oft und auch langsam hören.</Fact></section>
        </>
      ) : st === 1 ? (
        res ? <p className="notice" role="status">Diese Übung ist abgeschlossen. Die Auswertung steht im letzten Schritt.</p>
          : <TaskRunner tasks={tasks} feedback="immediate" hints label="Aufgabe" onJump={jump} onDone={(rs) => dispatch({ t: "results", unit: unit.id, phase: 5, results: rs, now: Date.now() })} />
      ) : hasWrite && st === 2 ? (
        <>
          <div className="stack"><h1>Schreiben ohne Vorlage</h1><p className="muted">Transfer in die Hand: Schreibe aus dem Gedächtnis.</p></div>
          <WriteSeq plan={unit.writes} unit={unit.id} phase={5} onFinished={() => { setWDone(true); dispatch({ t: "phaseDone", unit: unit.id, phase: 5 }); }} />
        </>
      ) : (
        <>
          <div className="stack"><h1>Auswertung</h1></div>
          {res ? (<>
            <div className="kpis">
              <div className="kpi"><b>{res.filter((r) => r.correctness === "right").length} von {res.length}</b><small>im ersten Versuch richtig</small></div>
              {known.length > 0 && <div className="kpi"><b>{known.filter((r) => r.correctness === "right").length} von {known.length}</b><small>bekannter Stoff</small></div>}
              {novel.length > 0 && <div className="kpi"><b>{novel.filter((r) => r.correctness === "right").length} von {novel.length}</b><small>neu kombiniert (Transfer)</small></div>}
            </div>
            <p className="muted">Ein niedrigerer Wert bei „neu kombiniert“ ist normal und genau das, was Phase 6 und 7 weiter stärken.</p>
            <ResultBreakdown results={res} />
            <ConfusionOffer />
          </>) : <p className="notice">Die gemischte Übung fehlt noch.</p>}
        </>
      )}
    </UnitFrame>
  );
}

/* ---------- Phase 6: Abrufen und Entscheidung ---------- */
interface GateRow { label: string; right: number; total: number; need: number; pass: boolean | null }

export function P6({ unit, onFinish }: PhaseProps) {
  const { s, dispatch } = useLesson();
  const tasks = useMemo(() => buildSet(unit.test), [unit]);
  const key = pk(unit.id, 6);
  const rkey = `${unit.id}.6r`;
  const res = s.results[key];
  const retest = s.results[rkey];
  const step = Math.min(s.steps[key] ?? 0, 2);
  const [mode, setMode] = useState<"decide" | "extra" | "retest">("decide");
  const decided = s.decided[unit.id];

  /** Pro Schwelle zählt der bessere von Test und Nachtest (der Nachtest wurde nach gezielter Zusatzübung geschrieben). */
  const gates: GateRow[] = unit.gates.map((g) => {
    const of = (rs?: TaskResult[]) => { const f = (rs ?? []).filter((r) => g.competences.includes(r.competence)); return { right: f.filter((r) => r.correctness === "right").length, total: f.length }; };
    const a = of(res), b = of(retest);
    const best = b.total > 0 && b.right / b.total > (a.total ? a.right / a.total : 0) ? b : a;
    return { label: g.label, ...best, need: g.min, pass: best.total === 0 ? null : best.right / best.total >= g.min };
  });
  const passAll = gates.every((g) => g.pass !== false);
  const wrong = (res ?? []).filter((r) => r.correctness !== "right");
  const extra = useMemo(() => extraTasks(wrong, 8), [res]); // eslint-disable-line react-hooks/exhaustive-deps
  const retestTasks = useMemo(() => extraTasks(wrong, 6), [res, mode]); // eslint-disable-line react-hooks/exhaustive-deps
  const pre = Object.values(s.pretest);

  return (
    <UnitFrame unit={unit.id} phase={6} labels={["Spielregeln", "Test", "Entscheidung"]} canNext={step === 1 ? !!res : step === 2 ? !!decided : true}
      finishLabel="Weiter: Wiederholungsplan" onFinish={onFinish}
      why={<p className="muted"><b>Retrieval Practice</b> (Roediger & Karpicke 2006): Abrufen aus dem Gedächtnis stärkt Erinnerung mehr als erneutes Lesen. Darum: keine Hinweise im Test, Rückmeldung erst am Ende.</p>}>
      {(st) => st === 0 ? (
        <>
          <div className="stack"><h1>Überprüfung</h1><p className="muted">{tasks.length} Aufgaben ohne Hilfen. Am Ende entscheidest du mit klarer Empfehlung: weitergehen oder gezielt nachüben.</p></div>
          <section className="panel stack">
            <Fact n={1}><strong>Keine Hinweise, kein Zurück.</strong> Dein Gedächtnis arbeitet, nicht die Oberfläche.</Fact>
            <Fact n={2}><strong>Rückmeldung erst am Ende</strong>, gesammelt und mit Begründung.</Fact>
            <Fact n={3}><strong>Das Ergebnis ist keine Note.</strong> Es entscheidet nur, was du als Nächstes brauchst.</Fact></section>
        </>
      ) : st === 1 ? (
        res ? <p className="notice" role="status">Der Test ist abgeschlossen. Die Entscheidung steht im nächsten Schritt.</p>
          : <TaskRunner tasks={tasks} feedback="deferred" label="Frage" onDone={(rs) => dispatch({ t: "results", unit: unit.id, phase: 6, results: rs, now: Date.now() })} />
      ) : !res ? <p className="notice">Der Test fehlt noch. Gehe einen Schritt zurück.</p> : mode === "extra" ? (
        <>
          <div className="stack"><h1>Gezielt nachüben</h1><p className="muted">Aufgaben zu dem, was im Test nicht saß, in anderer Form als im Test.</p></div>
          <TaskRunner tasks={extra} feedback="immediate" hints label="Nachübung" onDone={(rs) => { dispatch({ t: "results", unit: unit.id, phase: 5, results: rs, now: Date.now(), keep: false }); setMode("retest"); }} />
        </>
      ) : mode === "retest" ? (
        <>
          <div className="stack"><h1>Kurztest</h1><p className="muted">Ohne Hinweise: Sitzt es jetzt?</p></div>
          <TaskRunner tasks={retestTasks} feedback="deferred" label="Kurztest" onDone={(rs) => { dispatch({ t: "results", unit: unit.id, phase: 6, results: rs, now: Date.now(), slot: rkey }); setMode("decide"); }} />
        </>
      ) : (
        <>
          <div className="stack"><h1>Dein Stand und die Empfehlung</h1></div>
          <div className="kpis">
            <div className="kpi"><b>{res.filter((r) => r.correctness === "right").length} von {res.length}</b><small>im Test richtig</small></div>
            {unit.id === 1 && pre.length > 0 && <div className="kpi"><b>{pre.filter((x) => x === "right").length} von {pre.length}</b><small>Vorab-Fragen richtig (vorher)</small></div>}
          </div>
          <section className="stack" aria-labelledby="gt"><h2 id="gt">Schwellen für „weitergehen“</h2>
            <ul className="gates">{gates.map((g) => (
              <li key={g.label} data-pass={String(g.pass)}><span aria-hidden>{g.pass === null ? "–" : g.pass ? "✓" : "✗"}</span> <b>{g.label}</b>: {g.total ? `${g.right} von ${g.total} richtig (nötig: ${pct(g.need)})` : "keine passende Aufgabe im Test"} <span className="sr-only">{g.pass === null ? "nicht prüfbar" : g.pass ? "erreicht" : "nicht erreicht"}</span></li>
            ))}</ul>
            <p className="muted" style={{ fontSize: 13 }}>Die Schwellen sind didaktische Startwerte, keine validierten Grenzwerte. Bei einer Nachübung zählt der bessere Wert aus Test und Kurztest.</p></section>
          <ResultBreakdown results={res} />
          <ConfusionOffer />
          <section className="panel stack" aria-labelledby="rec">
            <h2 id="rec">{passAll ? "Empfehlung: weitergehen" : "Empfehlung: zuerst gezielt nachüben"}</h2>
            <p>{passAll ? "Die Schwellen sind erreicht. Du kannst zur nächsten Einheit, der Wiederholungsplan sichert das Gelernte." : "Mindestens eine Schwelle ist nicht erreicht. Eine kurze gezielte Nachübung mit anschließendem Kurztest lohnt sich, bevor Neues darauf aufbaut."}</p>
            {decided && <p className="notice" role="status">Entschieden: {decided.choice === "continue" ? "weitergehen" : "weiter üben"}.</p>}
            <div className="row">
              {passAll
                ? <><button className="btn btn-primary" onClick={() => dispatch({ t: "decide", unit: unit.id, choice: "continue", now: Date.now() })}>{unit.id < UNIT_COUNT ? `Weiter zu Einheit ${unit.id + 1}` : "Lektion abschließen"}</button>
                    {wrong.length > 0 && <button className="btn btn-secondary" onClick={() => setMode("extra")}>Trotzdem nachüben</button>}</>
                : <><button className="btn btn-primary" disabled={wrong.length === 0} onClick={() => setMode("extra")}>Gezielt nachüben</button>
                    <button className="btn btn-ghost" onClick={() => dispatch({ t: "decide", unit: unit.id, choice: "continue", now: Date.now() })}>Trotzdem weiter</button></>}
            </div>
            {!passAll && <p className="muted" style={{ fontSize: 13 }}>„Trotzdem weiter“ ist erlaubt. Dann bauen die nächsten Einheiten auf unsicherem Stoff auf, und der Wiederholungsplan holt ihn früher zurück.</p>}
          </section>
        </>
      )}
    </UnitFrame>
  );
}

/* ---------- Phase 7: Wiederholungsplan und Zeitreise ---------- */
const fmtDay = (ts: number) => new Date(ts).toLocaleDateString("de-DE", { weekday: "short", day: "numeric", month: "short" });
const dueText = (days: number) => days <= 0 ? "fällig" : days < 1 ? "heute" : days < 1.5 ? "in 1 Tag" : days < 30 ? `in ${Math.round(days)} Tagen` : `in ${Math.round(days / 30)} Mon.`;
const keyLabel = (key: string) => { const { itemId, competence } = parseSrsKey(key); return { item: ITEM_BY_ID.get(itemId)?.label ?? itemId, comp: COMPETENCE_LABEL[competence as Competence] }; };
const CAP = 8;

function Plan() {
  const { s } = useLesson();
  const [now] = useState(() => Date.now());
  const keys = Object.keys(s.srs).sort((a, b) => s.srs[a].dueAt - s.srs[b].dueAt);
  if (!keys.length) return <p className="notice">Dein Wiederholungsplan ist noch leer. Er füllt sich mit deinen Antworten.</p>;
  return (
    <>
      <div className="stack"><h1>Dein Wiederholungsplan</h1><p className="muted">Jede Kompetenz jedes Inhalts wird getrennt geplant: Erkennen, Hören, Lesen und Schreiben haben je eigene Termine. Fehler holen eine Kompetenz früher zurück.</p></div>
      <p className="notice">Die Prozentwerte sind <strong>Modellschätzungen</strong> aus deinen Antworten, keine gemessene Erinnerungswahrscheinlichkeit. Das Modell ist ein vereinfachter, nicht kalibrierter Algorithmus.</p>
      <div className="scroll-x"><table className="t" aria-label="Wiederholungsplan"><thead><tr><th scope="col">Inhalt</th><th scope="col">Kompetenz</th><th scope="col">Stand</th><th scope="col">Schätzung</th><th scope="col">Nächste Wiederholung</th></tr></thead>
        <tbody>{keys.map((k) => { const m = s.srs[k]; const { item, comp } = keyLabel(k); const lv = levelOf(s.log.filter((e) => e.key === k), m);
          return <tr key={k}><td><RichText text={item} /></td><td>{comp}</td><td>{LEVEL_LABEL[lv]}</td><td>≈ {Math.round(estimatedRecall(m, now) * 100)} %</td><td>{dueText((m.dueAt - now) / DAY)}</td></tr>; })}</tbody></table></div>
    </>
  );
}

function Simulation({ unitId }: { unitId: number }) {
  const { s, dispatch } = useLesson();
  const [mode, setMode] = useState<"overview" | "session" | "result">("overview");
  const [selected, setSelected] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [last, setLast] = useState<TaskResult[]>([]);
  useEffect(() => { dispatch({ t: "simStart", now: Date.now() }); }, [dispatch]);
  const sim = s.sim;
  if (!sim) return <p role="status" className="muted">Simulation wird vorbereitet …</p>;
  const now = simNow(sim);
  const due = dueEntries(sim.srs, now);
  const keys = Object.keys(sim.srs).sort((a, b) => estimatedRecall(sim.srs[a], now) - estimatedRecall(sim.srs[b], now));
  const jump = daysToNextDue(sim.srs, now);
  const focus = selected && sim.srs[selected] ? selected : keys[0] ?? null;
  if (!keys.length) return <p className="notice">Noch nichts im Plan. Schließe zuerst Übungen ab.</p>;

  if (mode === "session") return (
    <div className="stack-lg"><h1>Wiederholung · simulierter Tag {sim.offsetDays}</h1>
      <TaskRunner tasks={tasks} feedback="immediate" label="Wiederholung" onDone={(rs) => { dispatch({ t: "simResults", results: rs, unit: unitId }); setLast(rs); setMode("result"); }} /></div>);
  if (mode === "result") return (
    <div className="stack-lg fade"><h1>Geschafft · simulierter Tag {sim.offsetDays}</h1>
      <div className="kpis"><div className="kpi"><b>{last.filter((r) => r.correctness === "right").length}/{last.length}</b><small>richtig</small></div></div>
      <p className="muted">Richtige Antworten verlängern das Intervall dieser Kompetenz, Fehler verkürzen es. Das gilt nur für die Simulation und ändert deinen echten Plan nicht.</p>
      <div><button className="btn btn-primary" onClick={() => setMode("overview")}>Zurück zur Zeitreise</button></div></div>);

  const start = () => {
    const picked = due.slice(0, CAP).map((d) => { const { itemId, competence } = parseSrsKey(d.key); return reviewTaskFor(itemId, competence, sim.srs[d.key].reps); }).filter((t): t is Task => !!t);
    setTasks(interleaveTasks(picked)); setMode("session");
  };
  return (
    <div className="sim">
      <div className="stack"><h1>Zeitreise (Simulation)</h1><p className="muted">Spule die Zeit vor und sieh, wie Erinnerungen laut Modell verblassen und welche Kompetenzen fällig werden. Dein echter Plan bleibt unberührt.</p></div>
      <section className="panel stack" aria-labelledby="clk">
        <div className="clock" id="clk"><span className="day" aria-live="polite">Tag {sim.offsetDays}</span><span className="muted">{fmtDay(now)} · simuliert</span></div>
        <div className="jumps" role="group" aria-label="Zeit vorspulen">
          {([[1, "+1 Tag"], [3, "+3 Tage"], [7, "+1 Woche"], [14, "+2 Wochen"], [30, "+1 Monat"]] as const).map(([d, l]) => <button key={d} className="btn btn-secondary" onClick={() => dispatch({ t: "simAdvance", days: d })}>{l}</button>)}
          {jump !== null && due.length === 0 && <button className="btn btn-secondary" onClick={() => dispatch({ t: "simAdvance", days: jump })}>Zum nächsten Fälligen</button>}
          <button className="btn btn-ghost" onClick={() => dispatch({ t: "simReset", now: Date.now() })}>Simulation neu starten</button>
        </div>
        {due.length > CAP && <p className="notice">Nach längerer Pause staut sich vieles an. Eine Sitzung ist auf {CAP} Aufgaben gedeckelt, schwächste zuerst.</p>}
      </section>
      <section className="panel stack" aria-labelledby="duen"><h2 id="duen">{due.length > 0 ? `${due.length} Kompetenzen fällig` : "Heute ist nichts fällig"}</h2>
        {due.length > 0 ? <button className="btn btn-primary" onClick={start}>Wiederholung starten</button> : <p className="muted">Es wird nur wiederholt, was kurz vor dem Vergessen steht.{jump ? ` Das Nächste wird in etwa ${jump} ${jump === 1 ? "Tag" : "Tagen"} fällig.` : ""}</p>}</section>
      <section className="stack" aria-labelledby="dk"><h2 id="dk">Modellschätzung je Kompetenz</h2>
        <div className="deck" role="list">{keys.map((k) => { const m = sim.srs[k], r = estimatedRecall(m, now), d = (m.dueAt - now) / DAY; const { item, comp } = keyLabel(k);
          return <div key={k} className="it" role="listitem"><button onClick={() => setSelected(k)} aria-pressed={focus === k} aria-label={`${item}, ${comp}, geschätzt ${Math.round(r * 100)} Prozent, ${dueText(d)}. Kurve anzeigen`}><span className="nm" style={{ fontWeight: focus === k ? 600 : 400 }}><RichText text={item} /></span><small className="muted"> · {comp}</small></button>
            <div className="rbar" data-low={r < 0.9} data-due={d <= 0} role="img" aria-label={`geschätzt ${Math.round(r * 100)} Prozent`}><i style={{ width: `${Math.round(r * 100)}%` }} /></div><span className="due" data-due={d <= 0}>{dueText(d)}</span></div>; })}</div></section>
      {focus && <section className="stack" aria-labelledby="vk"><h2 id="vk">Vergessenskurve (Modell): <RichText text={keyLabel(focus).item} /></h2><p className="muted">{keyLabel(focus).comp} · Stabilität {sim.srs[focus].stability.toFixed(1)} Tage · {sim.srs[focus].reps} Wiederholungen</p>
        <ForgettingChart log={sim.log} keyId={focus} now={now} srs={sim.srs[focus]} label={keyLabel(focus).item} /></section>}
    </div>
  );
}

export function P7({ unit, onFinish }: PhaseProps) {
  const { s } = useLesson();
  const decided = s.decided[unit.id];
  const last = unit.id === UNIT_COUNT;
  return (
    <UnitFrame unit={unit.id} phase={7} labels={["Dein Plan", "Zeitreise"]} finishLabel={last ? "Lektion abschließen" : `Zu Einheit ${unit.id + 1}`} canNext={!!decided} onFinish={onFinish}
      why={<p className="muted"><b>Spaced Repetition</b> (Cepeda et al. 2006): Verteiltes Wiederholen behält länger als gehäuftes. Der Planer wiederholt jede Kompetenz getrennt, kurz bevor sie laut Modell verblasst.</p>}>
      {(st) => st === 0 ? <Plan /> : <Simulation unitId={unit.id} />}
    </UnitFrame>
  );
}

export { share };
