"use client";
import { useMemo, useState } from "react";
import { ALIF, CONFIDENCE_LABEL, MARK, type Confidence } from "@/lektion/content/lektion1";
import { hasAudio } from "@/lektion/audio/manifest";
import { UNITS, type UnitConfig } from "@/lektion/content/units";
import { PHASES, pk, type SelfLevel } from "@/lektion/domain/lektion/state";
import { buildSet, type Task } from "@/lektion/domain/lektion/tasks";
import { AudioPlayer } from "@/lektion/ui/AudioPlayer";
import { Ar, RichText } from "@/lektion/ui/parts";
import { Elaboration, ExplainBlock } from "./explain";
import { GUIDED } from "./guided";
import { useLesson } from "./LessonContext";
import { TaskRunner } from "./TaskRunner";
import { UnitFrame } from "./UnitFrame";
import { Colored, Explode } from "./visuals";
import { Fact } from "./blocks";

export interface PhaseProps { unit: UnitConfig; onFinish(): void; navigate(phase: number, step: number): void }

const LEVELS: { id: SelfLevel; label: string; sub: string }[] = [
  { id: "none", label: "Bei null", sub: "Ich kenne noch keine arabischen Buchstaben." },
  { id: "letters", label: "Einzelne Buchstaben", sub: "Ich erkenne ein paar Zeichen, lese aber nicht." },
  { id: "reading", label: "Ich kann etwas lesen", sub: "Ich lese langsam, brauche aber Sicherheit." },
];

/* ---------- Phase 1: Orientierung ---------- */
export function P1({ unit, onFinish }: PhaseProps) {
  const { s, dispatch } = useLesson();
  const first = unit.id === 1;
  const pretest = useMemo(() => buildSet([["letter:alif", 0], ["letter:ba", 0], ["letter:ta", 0], ["letter:tha", 0]], Math.random, false), []);
  const warm = useMemo(() => buildSet(unit.warm, Math.random, true), [unit]);
  const key = pk(unit.id, 1);
  const step = s.steps[key] ?? 0;
  const warmDone = !!s.results[key];
  const preDone = Object.keys(s.pretest).length >= 4;
  const labels = first ? ["Ziel", "Landkarte", "Vorwissen"] : ["Ziel", "Aufwärmen"];
  const lastStep = labels.length - 1;
  const gate = step < lastStep || (first ? !!s.selfLevel && preDone : warmDone || warm.length === 0);
  return (
    <UnitFrame unit={unit.id} phase={1} labels={labels} canNext={gate} finishLabel="Weiter: angeleitete Übung" onFinish={onFinish}
      why={<p className="muted"><b>Advanced Organizer</b> (Ausubel 1960): Ein Überblick vorab gibt neuen Inhalten einen Platz im Gedächtnis. Du siehst erst Ziel und Zusammenhang, dann die Details.</p>}>
      {(st) => st === 0 ? (
        <>
          <div className="stack"><p className="eyebrow">Einheit {unit.id} von 4 · ca. {unit.minutes} Minuten</p><h1>{unit.title}</h1></div>
          <section className="panel stack" aria-labelledby="goal"><h2 id="goal">Dein Lernziel</h2><p><RichText text={unit.goal} /></p></section>
          <section className="stack" aria-labelledby="new"><h2 id="new">Das ist neu</h2><ul className="goals">{unit.news.map((n) => <li key={n}><RichText text={n} /></li>)}</ul></section>
          <p className="muted"><strong>Voraussetzung:</strong> {unit.needs}</p>
          <section className="stack" aria-labelledby="path"><h2 id="path">Die vier Einheiten</h2>
            <ol className="stack" style={{ paddingLeft: 20, margin: 0 }}>{UNITS.map((u) => <li key={u.id} aria-current={u.id === unit.id ? "step" : undefined}><b>{u.short}</b> <span className="muted">· {u.minutes} Min.{u.id === unit.id ? " · jetzt" : ""}</span></li>)}</ol>
            <p className="muted">Jede Einheit durchläuft sieben kurze Phasen: {PHASES.map((p) => p.title).join(" · ")}.</p></section>
        </>
      ) : st === 1 && first ? (
        <>
          <div className="stack"><h1>Die Landkarte der Schrift</h1><p className="muted">So hängt alles zusammen, was du in den vier Einheiten lernst.</p></div>
          <div className="map" role="img" aria-label="Wörter bestehen aus Silben. Silben bestehen aus Konsonantenbuchstaben mit Vokalzeichen. Alif ist ein Dehnungsbuchstabe.">
            <div className="lvl"><div className="node" data-hot="true"><Ar size="body">بَاب</Ar><b>Wort</b><small>Einheit 4</small></div></div>
            <div className="arrow" aria-hidden>besteht aus ↓</div>
            <div className="lvl"><div className="node" data-hot="true"><Ar size="body">بَ · بِ · بُ</Ar><b>Silbe</b><small>Einheit 2 und 3</small></div></div>
            <div className="arrow" aria-hidden>besteht aus ↓</div>
            <div className="lvl">
              <div className="node" data-hot="true"><Ar size="body">ب ت ث</Ar><b>Konsonanten</b><small>Einheit 1</small></div>
              <div className="node" data-hot="true"><Ar size="body">◌{MARK.fatha} ◌{MARK.kasra} ◌{MARK.damma}</Ar><b>Vokalzeichen</b><small>Einheit 2 und 3</small></div>
              <div className="node" data-hot="true"><Ar size="body">{ALIF}</Ar><b>Alif</b><small>Einheit 1 und 4</small></div>
            </div>
          </div>
          <section className="stack" aria-labelledby="facts"><h2 id="facts">Zwei Dinge vorab</h2>
            <Fact n={1}><strong>Arabisch liest man von rechts nach links.</strong> Die Zahlen zeigen die Reihenfolge in <Ar size="body">بَاب</Ar>:</Fact>
            <Explode letters={["ب", ALIF, "ب"]} />
            <p className="muted" style={{ fontSize: 13, textAlign: "center" }}>Hier getrennt dargestellt. In der Schrift hängen die meisten Buchstaben zusammen.</p>
            <Fact n={2}><strong>Vor allem Konsonanten werden geschrieben.</strong> Kurze Vokale stehen als kleine Zeichen über oder unter dem Buchstaben, so wie in <Colored text="بَ" size="body" />.</Fact></section>
        </>
      ) : first ? (
        <>
          <div className="stack"><h1>Was bringst du mit?</h1><p className="muted">Beides dient nur dir: Am Ende vergleichst du „vorher“ und „nachher“. „Weiß ich nicht“ ist eine gute Antwort.</p></div>
          <fieldset className="stack" style={{ border: 0, padding: 0, margin: 0 }}>
            <legend className="eyebrow" style={{ marginBottom: 8 }}>Deine Erfahrung</legend>
            <div className="options opts3" role="radiogroup" aria-label="Deine Erfahrung mit arabischer Schrift">
              {LEVELS.map((l) => <button key={l.id} role="radio" aria-checked={s.selfLevel === l.id} className="opt" data-state={s.selfLevel === l.id ? "right" : undefined} onClick={() => dispatch({ t: "selfLevel", level: l.id })}><span><b>{l.label}</b><br /><small className="muted">{l.sub}</small></span></button>)}
            </div>
          </fieldset>
          <section className="stack" aria-labelledby="pt"><h2 id="pt">Vier Fragen vorab</h2>
            {preDone ? <p className="notice" role="status">Gespeichert. Gleich geht es los.</p>
              : <TaskRunner tasks={pretest} feedback="deferred" allowUnknown label="Vorab-Frage" onDone={(rs) => rs.forEach((r) => dispatch({ t: "pretest", itemId: r.itemId, value: r.chosen === "unknown" ? "unknown" : r.correctness === "right" ? "right" : "wrong" }))} />}
          </section>
        </>
      ) : (
        <>
          <div className="stack"><h1>Kurz aufwärmen</h1><p className="muted">Ein paar Fragen zu Einheit {unit.id - 1}. Sie holen das Vorwissen zurück und zeigen, ob du bereit bist.</p></div>
          {warmDone ? <p className="notice" role="status">Aufgewärmt. Das Ergebnis fließt in deinen Wiederholungsplan ein.</p>
            : warm.length === 0 ? <p className="notice">Keine Aufwärmfragen nötig.</p>
            : <TaskRunner tasks={warm} feedback="immediate" hints label="Aufwärmfrage" onDone={(rs) => dispatch({ t: "results", unit: unit.id, phase: 1, results: rs, now: Date.now() })} />}
        </>
      )}
    </UnitFrame>
  );
}

/* ---------- Phase 2: Entdecken ---------- */
export function P2({ unit, onFinish }: PhaseProps) {
  const { s } = useLesson();
  const [gates, setGates] = useState<Record<number, boolean>>({});
  const already = !!s.phaseDone[pk(unit.id, 2)];
  const step = Math.min(s.steps[pk(unit.id, 2)] ?? 0, unit.guided.length - 1);
  const G = GUIDED[unit.guided[step].kind];
  return (
    <UnitFrame unit={unit.id} phase={2} labels={unit.guided.map((g) => g.label)} canNext={already || !!gates[step]} finishLabel="Weiter: Vermutungen" onFinish={onFinish}
      why={<><p className="muted"><b>Scaffolding:</b> Hilfen werden schrittweise abgebaut: erst Vorlage und Merkhilfe, dann ohne.</p><p className="muted"><b>Dual Coding und Multisensorik:</b> Schrift, Bild, Ton und eigene Hand zusammen stützen das Gedächtnis (Mayer 2017).</p></>}>
      {() => <G unit={unit.id} setGate={(ok) => setGates((g) => (g[step] === ok ? g : { ...g, [step]: ok }))} />}
    </UnitFrame>
  );
}

/* ---------- Phase 3: Hypothesen ---------- */
function HypothesisCard({ unit, index }: { unit: UnitConfig; index: number }) {
  const { dispatch } = useLesson();
  const list = unit.hyps.filter((h) => !h.audioIds || h.audioIds.every(hasAudio));
  const h = list[index];
  const [choice, setChoice] = useState<number | null>(null);
  const [conf, setConf] = useState<Confidence | null>(null);
  const [why, setWhy] = useState("");
  return (
    <div className="stack-lg">
      <div className="stack"><p className="eyebrow">Hypothese {index + 1} von {list.length}</p><h2><RichText text={h.title} /></h2></div>
      {h.given && <div className="panel stack" role="group" aria-label="Was du schon weißt"><p className="eyebrow">Was du schon weißt</p><ul className="goals">{h.given.map((g) => <li key={g}><RichText text={g} /></li>)}</ul></div>}
      {h.audioIds?.map((id) => <AudioPlayer key={id} id={id} label="Anhören" />)}
      {h.stimulus && <div className="task"><div className="stim"><Colored text={h.stimulus} size="hero" /></div></div>}
      <p id={`q${index}`}><strong><RichText text={h.question} /></strong></p>
      <div className="options opts3" role="radiogroup" aria-labelledby={`q${index}`}>
        {h.options.map((o, i) => <button key={o} role="radio" aria-checked={choice === i} className={`opt ${h.optionsAr ? "ar-opt" : ""}`} data-state={choice === i ? "right" : undefined} onClick={() => setChoice(i)} {...(h.optionsAr ? { lang: "ar", dir: "rtl" } : {})}>{h.optionsAr ? o : <RichText text={o} />}</button>)}
      </div>
      <div className="stack"><p className="eyebrow" id={`c${index}`}>Wie sicher bist du?</p>
        <div className="conf" role="radiogroup" aria-labelledby={`c${index}`}>{(Object.keys(CONFIDENCE_LABEL) as Confidence[]).map((c) => <button key={c} role="radio" aria-checked={conf === c} onClick={() => setConf(c)}>{CONFIDENCE_LABEL[c]}</button>)}</div></div>
      <div className="stack"><label className="eyebrow" htmlFor={`w${index}`}>Deine Begründung (optional)</label><textarea id={`w${index}`} value={why} onChange={(e) => setWhy(e.target.value)} placeholder="Woraus leitest du das ab?" /></div>
      <button className="btn btn-primary" disabled={choice === null || conf === null} onClick={() => dispatch({ t: "hyp", id: h.id, answer: { choice: choice!, confidence: conf!, why: why.trim() || undefined } })}>Hypothese festhalten</button>
    </div>
  );
}

export function P3({ unit, onFinish }: PhaseProps) {
  const { s } = useLesson();
  const list = unit.hyps.filter((h) => !h.audioIds || h.audioIds.every(hasAudio));
  const answered = list.filter((h) => s.hyp[h.id]).length;
  const all = answered === list.length;
  const step = s.steps[pk(unit.id, 3)] ?? 0;
  return (
    <UnitFrame unit={unit.id} phase={3} labels={["So funktioniert es", "Deine Hypothesen", "Festgehalten"]} canNext={step === 0 || all} finishLabel="Weiter: Auflösung" onFinish={onFinish}
      why={<p className="muted"><b>Productive Failure</b> (Kapur 2008; Sinha & Kapur 2021): Erst selbst nach einer Regel suchen, dann die Erklärung, vertieft das Verständnis, wenn die Aufgabe aus Bekanntem lösbar ist. Darum gibt hier jede Aufgabe die nötigen Hinweise vor. Rückmeldung folgt bewusst erst in Phase 4.</p>}>
      {(st) => st === 0 ? (
        <>
          <div className="stack"><h1>Vermute und finde die Regel</h1><p className="muted">Die Aufgaben dieser Phase lassen sich aus dem ableiten, was du schon kennst. Nutze „Was du schon weißt“ und leite eine Regel ab.</p></div>
          <section className="panel stack">
            <Fact n={1}><strong>Kein blindes Raten.</strong> Frag dich: Welche Regel passt zu den Beispielen?</Fact>
            <Fact n={2}><strong>Falsch liegen ist hier Teil des Lernens.</strong> Du bekommst jetzt keine Wertung, nur die Auflösung in Phase 4.</Fact>
            <Fact n={3}><strong>Sag, wie sicher du bist.</strong> So siehst du später, wo du dich geirrt hast, obwohl du sicher warst.</Fact></section>
          <p className="muted">Zur Erinnerung: {unit.news.map((n, i) => <span key={n}>{i ? " · " : ""}<RichText text={n} /></span>)}</p>
        </>
      ) : st === 1 ? (
        list.length === 0 ? <p className="notice">Für diese Einheit gibt es keine Hypothesen.</p> : all ? <p className="notice" role="status">Alle Hypothesen sind festgehalten. Weiter geht es zur Übersicht.</p> : <HypothesisCard key={answered} unit={unit} index={answered} />
      ) : (
        <>
          <div className="stack"><h1>Deine Hypothesen</h1><p className="muted">Ohne Wertung. Die Auflösung kommt in der nächsten Phase.</p></div>
          <ul className="stack" style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {list.map((h) => { const a = s.hyp[h.id]; return <li key={h.id} className="panel row between"><div className="stack"><strong><RichText text={h.title} /></strong><span className="muted">{a ? <><RichText text={h.options[a.choice]} /> · {CONFIDENCE_LABEL[a.confidence]}</> : "noch offen"}</span></div>{h.stimulus && <Colored text={h.stimulus} size="body" />}</li>; })}
          </ul>
        </>
      )}
    </UnitFrame>
  );
}

/* ---------- Phase 4: Verstehen ---------- */
export function P4({ unit, onFinish, navigate }: PhaseProps) {
  const { s, dispatch } = useLesson();
  const check = useMemo(() => buildSet(unit.check, Math.random, false), [unit]);
  const key = pk(unit.id, 4);
  const labels = [...unit.explain.map((e) => e.label), "Eigene Worte", "Verständnis-Check"];
  const step = Math.min(s.steps[key] ?? 0, labels.length - 1);
  const rated = unit.elab.every((e) => s.elab[e.id]?.rating);
  const checked = !!s.results[key];
  const res = s.results[key] ?? [];
  const eIdx = unit.explain.length;
  const canNext = step === eIdx ? rated : step === eIdx + 1 ? checked : true;
  const jump = (t: Task) => { const j = unit.jump[t.competence]; navigate(2, j ?? 0); };
  return (
    <UnitFrame unit={unit.id} phase={4} labels={labels} canNext={canNext} finishLabel="Weiter: selbstständig üben" onFinish={onFinish}
      why={<><p className="muted"><b>Explizite Erklärung nach dem Versuchen</b> und <b>Elaboration</b> (Selbsterklärung) verknüpfen Regel und Vorwissen.</p><p className="muted"><b>Feedback</b> ist hier sofort und erklärend (Hattie & Timperley 2007), nicht nur „falsch“.</p></>}>
      {(st) => st < eIdx ? <ExplainBlock kind={unit.explain[st].kind} unit={unit} /> : st === eIdx ? <Elaboration unit={unit} /> : (
        <>
          <div className="stack"><h1>Verständnis-Check</h1><p className="muted">Kurze Fragen mit sofortiger Rückmeldung. Falsche Fragen kommen am Ende noch einmal. Bei Fehlern kannst du direkt zur passenden Erklärung zurückspringen.</p></div>
          {checked
            ? <div className="stack"><div className="kpis"><div className="kpi"><b>{res.filter((r) => r.correctness === "right").length} von {res.length}</b><small>im ersten Versuch richtig</small></div></div><p className="notice" role="status">Gespeichert. Fehler sind hier kein Problem, sie zeigen, was weiter geübt wird.</p></div>
            : <TaskRunner tasks={check} feedback="immediate" hints requeueWrong label="Frage" onJump={jump} onDone={(rs) => dispatch({ t: "results", unit: unit.id, phase: 4, results: rs, now: Date.now() })} />}
        </>
      )}
    </UnitFrame>
  );
}
