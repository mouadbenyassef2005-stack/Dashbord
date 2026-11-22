"use client";
import { useEffect, useRef, useState } from "react";
import { FEATURE, UNKNOWN_OPTION } from "@/lektion/content/lektion1";
import { mnemonicStage } from "@/lektion/domain/lektion/competence";
import { checkTyped, gradeFor, type ChoiceTask, type Correctness, type Task, type TaskResult, type TypeTask } from "@/lektion/domain/lektion/tasks";
import { AudioPlayer } from "@/lektion/ui/AudioPlayer";
import { Ar, Icon, RichText } from "@/lektion/ui/parts";
import { useLesson } from "./LessonContext";

export type FeedbackMode = "immediate" | "deferred";
interface Common { hints: boolean; allowUnknown?: boolean; feedback: FeedbackMode; onAnswer(r: TaskResult): void; onJump?(task: Task): void }

/** Der Reiz der Aufgabe: Ton (mit Wiederholen und Langsam) oder Schrift. Bei Buchstaben-Aufgaben blendet die Merkhilfe sich mit wachsendem Können aus. */
function Stimulus({ task }: { task: Task }) {
  const { s } = useLesson();
  const letter = task.itemId.startsWith("letter:") && !task.audioId ? task.itemId.split(":")[1] : null;
  const stage = letter ? mnemonicStage(s.log, letter) : 4;
  return (
    <div className="stim" data-audio={task.audioId}>
      {task.audioId && <AudioPlayer id={task.audioId} label="Anhören" />}
      {task.ar && <Ar size="hero">{task.ar}</Ar>}
      {letter && stage <= 2 && task.ar && letter in FEATURE && (
        <p className="muted mnemonic" style={{ fontSize: 13 }}>Merkhilfe: {stage === 1 ? FEATURE[letter as keyof typeof FEATURE].anchor : FEATURE[letter as keyof typeof FEATURE].keyword}</p>
      )}
    </div>
  );
}

function Feedback({ task, correctness, onJump }: { task: Task; correctness: Correctness; onJump?(t: Task): void }) {
  const ok = correctness === "right";
  return (
    <div className={`feedback fade ${ok ? "ok" : "no"}`} role="status">
      <span className={ok ? "ic-ok" : "ic-no"}>{ok ? Icon.ok : Icon.no}</span>
      <div className="stack" style={{ gap: 4 }}>
        <strong>{ok ? "Richtig." : correctness === "lengthOnly" ? "Fast: Die Länge fehlt." : "Noch nicht."}</strong>
        <span className="muted"><RichText text={task.explain} />{task.type === "type" && !ok ? ` Richtig: „${task.accepted}“.` : ""}</span>
        {!ok && onJump && <div><button className="btn btn-ghost" onClick={() => onJump(task)}>Dazu nochmal ansehen</button></div>}
      </div>
    </div>
  );
}

function ChoiceView({ task, hints, allowUnknown, feedback, onAnswer, onJump }: Common & { task: ChoiceTask }) {
  const [picked, setPicked] = useState<number | null>(null);
  const [hint, setHint] = useState(false);
  const t0 = useRef(0);
  useEffect(() => { t0.current = performance.now(); }, []);
  const answered = picked !== null;
  const showResult = answered && feedback === "immediate";
  const pick = (i: number) => {
    if (answered) return;
    setPicked(i);
    const ms = Math.round(performance.now() - t0.current); // eslint-disable-line react-hooks/purity -- Antwortzeit im Ereignis, nicht im Render
    const unknown = i === -1;
    const right = i === task.answer;
    const c: Correctness = right ? "right" : "wrong";
    onAnswer({
      taskId: task.id, itemId: task.itemId, competence: task.competence, type: "choice", correctness: c,
      grade: gradeFor(c, "choice", hint, ms, !task.audioId), hintUsed: hint, answer: unknown ? UNKNOWN_OPTION : task.options[i],
      chosen: unknown ? "unknown" : right ? undefined : task.options[i], confusedWith: !unknown && !right ? task.optionItems[i] ?? undefined : undefined, ms,
    });
  };
  return (
    <div className="stack task">
      <h2 id="q"><RichText text={task.prompt} /></h2>
      {task.novel && <span className="badge" style={{ alignSelf: "start" }}>Neu kombiniert</span>}
      <Stimulus task={task} />
      <div className="options" role="group" aria-labelledby="q">
        {task.options.map((o, i) => (
          <button key={o} className={`opt ${task.optionsAr ? "ar-opt" : ""}`}
            data-state={showResult ? (i === task.answer ? "right" : i === picked ? "wrong" : undefined) : picked === i ? "dim" : undefined}
            disabled={answered} onClick={() => pick(i)} {...(task.optionsAr ? { lang: "ar", dir: "rtl" } : {})}
            aria-label={showResult ? `${o}${i === task.answer ? ", richtig" : i === picked ? ", deine Antwort, falsch" : ""}` : undefined}>
            {task.optionsAr ? o : <RichText text={o} />}
            {showResult && i === task.answer && <span className="opt-mark" aria-hidden>✓</span>}
            {showResult && i === picked && i !== task.answer && <span className="opt-mark" aria-hidden>✗</span>}
          </button>
        ))}
        {allowUnknown && <button className="opt three" disabled={answered} onClick={() => pick(-1)}>{UNKNOWN_OPTION}</button>}
      </div>
      {!answered && hints && task.hint && (
        <div>{hint ? <p className="notice" role="note"><RichText text={task.hint} /></p> : <button className="btn btn-ghost" onClick={() => setHint(true)}>Hinweis (zählt als Hilfe)</button>}</div>
      )}
      {showResult && <Feedback task={task} correctness={picked === task.answer ? "right" : "wrong"} onJump={onJump} />}
    </div>
  );
}

function TypeView({ task, hints, feedback, onAnswer, onJump }: Common & { task: TypeTask }) {
  const [text, setText] = useState("");
  const [hint, setHint] = useState(false);
  const [res, setRes] = useState<Correctness | null>(null);
  const t0 = useRef(0);
  useEffect(() => { t0.current = performance.now(); }, []);
  const submit = () => {
    if (res || !text.trim()) return;
    const ms = Math.round(performance.now() - t0.current);
    const c = checkTyped(task.accepted, text);
    setRes(c);
    onAnswer({ taskId: task.id, itemId: task.itemId, competence: task.competence, type: "type", correctness: c, grade: gradeFor(c, "type", hint, ms, !task.audioId), hintUsed: hint, answer: text.trim(), ms });
  };
  return (
    <form className="stack task" onSubmit={(e) => { e.preventDefault(); submit(); }}>
      <h2 id="q"><RichText text={task.prompt} /></h2>
      {task.novel && <span className="badge" style={{ alignSelf: "start" }}>Neu kombiniert</span>}
      <Stimulus task={task} />
      <div className="typebox">
        <input type="text" value={text} onChange={(e) => setText(e.target.value)} disabled={!!res} placeholder={task.placeholder} aria-labelledby="q" autoComplete="off" autoCapitalize="none" spellCheck={false} />
        <button className="btn btn-primary" type="submit" disabled={!!res || !text.trim()}>Prüfen</button>
      </div>
      <p className="muted" style={{ fontSize: 13 }}>Langes ā darfst du als „ā“ oder „aa“ schreiben. Die Länge zählt.</p>
      {!res && hints && task.hint && (
        <div>{hint ? <p className="notice" role="note"><RichText text={task.hint} /></p> : <button className="btn btn-ghost" type="button" onClick={() => setHint(true)}>Hinweis (zählt als Hilfe)</button>}</div>
      )}
      {res && feedback === "immediate" && <Feedback task={task} correctness={res} onJump={onJump} />}
    </form>
  );
}

export interface RunnerProps {
  tasks: Task[];
  feedback: FeedbackMode;
  hints?: boolean;
  allowUnknown?: boolean;
  /** Falsch beantwortete Aufgaben einmal am Ende wiederholen (die Wiederholung zählt nicht für die Wertung). */
  requeueWrong?: boolean;
  label?: string;
  onJump?(task: Task): void;
  onDone(firstAttempts: TaskResult[]): void;
}

/** Führt eine Aufgabenliste aus. Gewertet wird je Aufgabe der erste Versuch. */
export function TaskRunner({ tasks, feedback, hints = false, allowUnknown, requeueWrong, label, onJump, onDone }: RunnerProps) {
  const [queue, setQueue] = useState<Task[]>(tasks);
  const [i, setI] = useState(0);
  const [cur, setCur] = useState<TaskResult | null>(null);
  const first = useRef<Map<string, TaskResult>>(new Map());
  const requeued = useRef<Set<string>>(new Set());
  const reported = useRef(false);
  const next = useRef<HTMLButtonElement>(null);
  const task = queue[i];
  const total = tasks.length;

  useEffect(() => { if (cur) next.current?.focus(); }, [cur]);
  const finished = i >= queue.length;
  useEffect(() => {
    if (finished && !reported.current) {
      reported.current = true;
      onDone(tasks.map((t) => first.current.get(t.id)).filter((r): r is TaskResult => !!r));
    }
  }, [finished]); // eslint-disable-line react-hooks/exhaustive-deps

  const answer = (r: TaskResult) => {
    setCur(r);
    if (!first.current.has(r.taskId)) first.current.set(r.taskId, r);
  };
  const advance = () => {
    if (cur && requeueWrong && cur.correctness !== "right" && !requeued.current.has(cur.taskId)) {
      requeued.current.add(cur.taskId);
      const again = tasks.find((t) => t.id === cur.taskId)!;
      setQueue((q) => [...q, again]);
    }
    setCur(null);
    setI((n) => n + 1);
  };
  if (finished) return <p role="status" className="muted">Wird ausgewertet …</p>;
  const pct = Math.min(100, (i / queue.length) * 100);
  const isRepeat = i >= total;
  return (
    <div className="stack-lg">
      <div className="stack">
        <div className="progress" role="progressbar" aria-valuenow={i} aria-valuemin={0} aria-valuemax={queue.length} aria-label="Fortschritt in dieser Übung"><span style={{ width: `${pct}%` }} /></div>
        <p className="eyebrow">{label ?? "Aufgabe"} {Math.min(i + 1, queue.length)} von {queue.length}{isRepeat ? " · Wiederholung" : ""}</p>
      </div>
      {task.type === "choice"
        ? <ChoiceView key={task.id + i} task={task} hints={hints} allowUnknown={allowUnknown} feedback={feedback} onAnswer={answer} onJump={onJump} />
        : <TypeView key={task.id + i} task={task} hints={hints} feedback={feedback} onAnswer={answer} onJump={onJump} />}
      {cur && (
        <div className="row">
          {feedback === "deferred" && <span className="muted">Antwort gespeichert. Die Auswertung kommt am Ende.</span>}
          <button ref={next} className="btn btn-primary" onClick={advance}>{i + 1 >= queue.length ? "Abschließen" : "Weiter"}</button>
        </div>
      )}
    </div>
  );
}
