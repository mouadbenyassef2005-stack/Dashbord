import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { LETTER_BY_ID } from "@/content/letters";
import type { Stroke } from "@/domain/handwriting/geometry";
import { analyze, analyzeFree, type FreeResult, type WritingResult } from "@/domain/handwriting/score";
import { TEMPLATES, TEMPLATE_BY_ID } from "@/domain/handwriting/templates";
import { useApp } from "./AppContext";
import { WritingPad, PAD } from "@/ui/WritingPad";
import { Ar } from "@/ui/parts";

type Mode = "trace" | "free";
interface Task { letterId: string; mode: Mode }

/** Nachzeichnen, bis ein freier Versuch gelang; danach freies Schreiben (Produktion zählt stärker als Nachzeichnen). */
export function planWriting(introduced: Set<string>, hasFreeSuccess: (id: string) => boolean, size = 6): Task[] {
  return TEMPLATES.filter((t) => introduced.has(t.letterId)).slice(0, size)
    .map((t) => ({ letterId: t.letterId, mode: hasFreeSuccess(t.letterId) ? "free" as const : "trace" as const }));
}

function Check({ level, children }: { level: "ok" | "mid" | "no"; children: string }) {
  return <li><span className={level} aria-hidden>{level === "ok" ? "✓" : level === "mid" ? "~" : "✗"}</span><span>{children}</span></li>;
}

export function Write() {
  const { introduced, progress, record } = useApp();
  const tasks = useMemo(
    () => planWriting(introduced, (id) => (progress.events.get(`${id}:writing`) ?? []).some((e) => e.activity === "free" && e.grade >= 2)),
    [], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const [i, setI] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [result, setResult] = useState<(WritingResult & Partial<FreeResult>) | null>(null);
  const [peeked, setPeeked] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [skipped, setSkipped] = useState(0);

  if (tasks.length === 0)
    return (
      <div className="stack fade">
        <h1>Noch nichts zu schreiben</h1>
        <p className="muted">Schreiben gibt es zunächst für Alif, Bā, Tā und Thā. Lerne mindestens einen davon kennen.</p>
        <Link className="btn btn-primary" to="/buchstaben/alif">Mit Alif beginnen</Link>
      </div>
    );

  const task = tasks[i];
  if (!task)
    return (
      <div className="stack-lg fade">
        <h1>Geschafft.</h1>
        <p className="notice">Schreiben wird mit der Zeit sicherer. Der Planer legt Wiederholungen für dich fest. Eine Bewertung ersetzt keine Lehrkraft: Die App erkennt Form, Punkte und Richtung, nicht die Schönheit der Schrift.</p>
        <div className="row"><Link className="btn btn-primary" to="/">Zurück zu Heute</Link>{skipped > 0 && <span className="muted">{skipped} übersprungen</span>}</div>
      </div>
    );

  const letter = LETTER_BY_ID.get(task.letterId)!;
  const template = TEMPLATE_BY_ID.get(task.letterId)!;
  const showGuide = task.mode === "trace" || peeked;
  const good = result && result.grade === 2;

  async function check() {
    const res = task.mode === "free" ? analyzeFree(strokes, task.letterId, PAD) : analyze(strokes, template, PAD);
    setResult(res);
    if (res.empty || res.tooSmall) return; // keine Wertung, kein Ereignis
    const evidence = task.mode === "free" && !peeked ? "production" : "recognition";
    const saved = await record({
      letterId: task.letterId, skill: "writing", activity: task.mode, grade: res.grade, evidence,
      confusedWith: (res as FreeResult).recognizedAs && (res as FreeResult).recognizedAs !== task.letterId ? (res as FreeResult).recognizedAs : undefined,
    });
    setSaveError(!saved);
  }
  const retry = () => { setResult(null); setStrokes([]); setAttempt((a) => a + 1); };
  const next = () => { setResult(null); setStrokes([]); setPeeked(false); setAttempt((a) => a + 1); setI((n) => n + 1); };

  return (
    <div className="stack-lg fade">
      <div className="stack">
        <div className="progress" role="progressbar" aria-valuenow={i} aria-valuemin={0} aria-valuemax={tasks.length} aria-label="Fortschritt"><span style={{ width: `${(i / tasks.length) * 100}%` }} /></div>
        <p className="eyebrow">{task.mode === "trace" ? "Nachzeichnen" : "Frei schreiben"}</p>
      </div>
      <section className="stack">
        <h1 style={{ fontSize: 26 }}>
          {task.mode === "trace" ? <>Zeichne <b>{letter.name}</b> nach.</> : <>Schreibe <b>{letter.name}</b> aus dem Gedächtnis.</>}
        </h1>
        <p className="muted">
          {task.mode === "trace" ? "Beginne am orangen Punkt. Arabisch schreibt man von rechts nach links." : `Laut „${letter.syllable}“. Denk an die Punkte.`}
          {" "}Größe und Position sind egal.
        </p>
        {task.mode === "free" && !peeked && !result && (
          <div className="row"><span aria-hidden><Ar size="body">؟</Ar></span><button className="btn btn-ghost" onClick={() => setPeeked(true)}>Vorlage zeigen (zählt dann als Nachzeichnen)</button></div>
        )}
      </section>

      <WritingPad guide={showGuide ? template : null} resetKey={`${i}-${attempt}`} disabled={!!result} onChange={setStrokes} />

      {result && (
        <div className={`feedback fade ${good ? "ok" : "no"}`} role="status" style={{ flexDirection: "column" }}>
          <strong>{result.empty ? "Noch nichts gezeichnet." : result.tooSmall ? "Zu klein." : good ? "Gut geschrieben." : result.grade === 1 ? "Fast." : "Noch nicht ganz."}</strong>
          {!result.empty && !result.tooSmall && (
            <ul className="checks">
              <Check level={result.shape.level === "good" ? "ok" : result.shape.level === "near" ? "mid" : "no"}>{`Form: ${result.shape.level === "good" ? "passt" : result.shape.level === "near" ? "ungefähr" : "weicht ab"}`}</Check>
              <Check level={result.dots.level === "ok" ? "ok" : "no"}>{result.dots.expected === 0 && result.dots.level === "ok" ? "Punkte: keine nötig" : result.dots.level === "ok" ? `Punkte: ${result.dots.expected}, richtig gesetzt` : result.dots.level === "wrongPlace" ? "Punkte: auf der falschen Seite (oben/unten)" : `Punkte: erwartet ${result.dots.expected}, erkannt ${result.dots.found}`}</Check>
              <Check level={result.direction === "ok" ? "ok" : result.direction === "reversed" ? "no" : "mid"}>{result.direction === "ok" ? "Richtung: richtig" : result.direction === "reversed" ? "Richtung: umgekehrt" : "Richtung: nicht beurteilbar (anderer Strichaufbau)"}</Check>
            </ul>
          )}
          {result.messages.map((m) => <p key={m} className="muted">{m}</p>)}
          {result.recognizedAs && <p className="muted">Erkannt eher als: <Ar size="body">{LETTER_BY_ID.get(result.recognizedAs)?.ch}</Ar> ({LETTER_BY_ID.get(result.recognizedAs)?.name}). Das ist eine Schätzung.</p>}
        </div>
      )}
      {saveError && <p className="notice err" role="alert">Das Ergebnis konnte nicht gespeichert werden.</p>}

      <div className="row">
        {!result && <button className="btn btn-primary" disabled={strokes.length === 0} onClick={() => void check()}>Prüfen</button>}
        {result && (result.empty || result.tooSmall || result.grade < 2) && <button className="btn btn-secondary" onClick={retry}>Nochmal versuchen</button>}
        {result && !result.empty && !result.tooSmall && <button className="btn btn-primary" onClick={next} autoFocus>Weiter</button>}
        {!result && <button className="btn btn-ghost" onClick={() => { setSkipped((n) => n + 1); next(); }}>Überspringen</button>}
      </div>
    </div>
  );
}
