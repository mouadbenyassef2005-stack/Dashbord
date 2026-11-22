"use client";
import { useEffect, useRef, useState } from "react";
import { checkTyped, gradeFor, type ChoiceTask, type Correctness, type Task, type TaskResult, type TypeTask } from "@/lektion/domain/lektion/tasks";
import { AudioPlayer } from "@/lektion/ui/AudioPlayer";
import { Ar, Icon, RichText } from "@/lektion/ui/parts";

interface Props { task: Task; deferred?: boolean; last?: boolean; onResult(r: TaskResult): void; onNext(): void }

/** Hauptteil einer Aufgabe: Anweisung, Reiz (Ton oder Schrift), Antwortfläche. */
function Stimulus({ task }: { task: Task }) {
  return (
    <div className="lp-stim" data-audio={task.audioId}>
      {task.audioId && <AudioPlayer id={task.audioId} label="Anhören" />}
      {task.ar && <Ar size="hero">{task.ar}</Ar>}
    </div>
  );
}

function Foot({ state, correct, explain, answer, last, canCheck, deferred, onCheck, onNext }: {
  state: "open" | "right" | "wrong"; correct?: string; explain?: string; answer?: string; last?: boolean; canCheck: boolean; deferred?: boolean; onCheck(): void; onNext(): void;
}) {
  const next = useRef<HTMLButtonElement>(null);
  useEffect(() => { if (state !== "open") next.current?.focus(); }, [state]);
  if (state === "open")
    return (
      <div className="lp-foot" data-state="open">
        <button className="btn-big" disabled={!canCheck} onClick={onCheck}>{deferred ? "Weiter" : "Prüfen"}</button>
      </div>
    );
  return (
    <div className="lp-foot" data-state={state} role="status">
      <div className="lp-fb">
        <span className="lp-fb-ic" aria-hidden>{state === "right" ? Icon.ok : Icon.no}</span>
        <div>
          <strong>{state === "right" ? "Richtig!" : "Nicht ganz."}</strong>
          {state === "wrong" && <p>Richtig: <b><RichText text={correct ?? ""} /></b></p>}
          {state === "wrong" && explain && <p className="lp-why"><RichText text={explain} /></p>}
          {state === "wrong" && answer && <span className="sr-only">Deine Antwort: {answer}</span>}
        </div>
      </div>
      <button ref={next} className="btn-big" onClick={onNext}>{last ? "Fertig" : "Weiter"}</button>
    </div>
  );
}

function Choice({ task, deferred, last, onResult, onNext }: Props & { task: ChoiceTask }) {
  const [picked, setPicked] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const t0 = useRef(0);
  useEffect(() => { t0.current = performance.now(); }, []);
  const right = picked === task.answer;
  const check = () => {
    if (picked === null) return;
    const ms = Math.round(performance.now() - t0.current);
    const c: Correctness = right ? "right" : "wrong";
    setChecked(true);
    onResult({
      taskId: task.id, itemId: task.itemId, competence: task.competence, type: "choice", correctness: c,
      grade: gradeFor(c, "choice", false, ms, !task.audioId), hintUsed: false, answer: task.options[picked],
      chosen: right ? undefined : task.options[picked], confusedWith: !right ? task.optionItems[picked] ?? undefined : undefined, ms,
    });
    if (deferred) onNext();
  };
  const short = task.options.every((o) => o.length <= 4);
  const cols = task.optionsAr ? `lp-opts lp-opts-ar${task.options.length === 3 ? " lp-opts-n3" : ""}` : task.options.some((o) => o.length > 14) ? "lp-opts lp-opts-1" : short ? "lp-opts lp-opts-short" : "lp-opts";
  return (
    <>
      <div className="lp-main">
        <h2 id="lp-q" className="lp-q"><RichText text={task.prompt} /></h2>
        {task.novel && <span className="badge">Neu kombiniert</span>}
        <Stimulus task={task} />
        <div className={cols} role="radiogroup" aria-labelledby="lp-q">
          {task.options.map((o, i) => {
            const state = checked && !deferred ? (i === task.answer ? "right" : i === picked ? "wrong" : "") : picked === i ? "sel" : "";
            return (
              <button key={o} className={`lp-opt ${task.optionsAr ? "ar-opt" : ""} ${o.startsWith("\u0640") ? "ar-mark" : ""}`} role="radio" aria-checked={picked === i} data-state={state} disabled={checked}
                onClick={() => setPicked(i)} {...(task.optionsAr ? { lang: "ar", dir: "rtl" } : {})}
                aria-label={checked && !deferred ? `${o}${i === task.answer ? ", richtig" : i === picked ? ", deine Antwort, falsch" : ""}` : undefined}>
                {task.optionsAr ? o : <RichText text={o} />}
                {checked && !deferred && i === task.answer && <span className="lp-mark" aria-hidden>✓</span>}
                {checked && !deferred && i === picked && i !== task.answer && <span className="lp-mark" aria-hidden>✗</span>}
              </button>
            );
          })}
        </div>
      </div>
      {!deferred && <Foot state={!checked ? "open" : right ? "right" : "wrong"} canCheck={picked !== null} correct={task.options[task.answer]} explain={task.explain} answer={picked !== null ? task.options[picked] : undefined} last={last} onCheck={check} onNext={onNext} />}
      {deferred && <Foot state="open" canCheck={picked !== null} deferred onCheck={check} onNext={onNext} />}
    </>
  );
}

function Typed({ task, last, onResult, onNext }: Props & { task: TypeTask }) {
  const [text, setText] = useState("");
  const [res, setRes] = useState<Correctness | null>(null);
  const t0 = useRef(0);
  useEffect(() => { t0.current = performance.now(); }, []);
  const check = () => {
    if (res || !text.trim()) return;
    const ms = Math.round(performance.now() - t0.current);
    const c = checkTyped(task.accepted, text);
    setRes(c);
    onResult({ taskId: task.id, itemId: task.itemId, competence: task.competence, type: "type", correctness: c, grade: gradeFor(c, "type", false, ms, !task.audioId), hintUsed: false, answer: text.trim(), ms });
  };
  return (
    <>
      <form className="lp-main" onSubmit={(e) => { e.preventDefault(); check(); }}>
        <h2 id="lp-q" className="lp-q"><RichText text={task.prompt} /></h2>
        <Stimulus task={task} />
        <input className="lp-input" type="text" value={text} onChange={(e) => setText(e.target.value)} disabled={!!res} placeholder={task.placeholder} aria-labelledby="lp-q" autoComplete="off" autoCapitalize="none" spellCheck={false} />
      </form>
      <Foot state={res === null ? "open" : res === "right" ? "right" : "wrong"} canCheck={!!text.trim()} correct={task.accepted} explain={task.explain} answer={text} last={last} onCheck={check} onNext={onNext} />
    </>
  );
}

export function TaskView(p: Props) {
  return p.task.type === "choice" ? <Choice {...p} task={p.task} /> : <Typed {...p} task={p.task} />;
}
