"use client";
import { useMemo, useRef, useState } from "react";
import { errorSlides, type Lesson, type Slide } from "@/lektion/content/path";
import { pathTask, type Task, type TaskResult } from "@/lektion/domain/lektion/tasks";
import { useLesson } from "../LessonContext";
import { Screen } from "./Screen";
import { SlideView } from "./Slides";
import { TaskView } from "./TaskView";

export interface PlayerSummary { results: TaskResult[]; first: number; total: number }
type Step = { kind: "slide"; slide: Exclude<Slide, { k: "task" | "taskobj" | "hypReview" }> } | { kind: "task"; task: Task; deferred: boolean; retry: boolean };

/** Hypothesen-Übersicht wird in einzelne Bildschirme aufgeteilt (eine Sache pro Bildschirm); Aufgaben-Spezifikationen werden zu Aufgaben. */
export function expand(slides: Slide[], rnd: () => number = Math.random): Step[] {
  const out: Step[] = [];
  for (const s of slides) {
    if (s.k === "hypReview") s.ids.forEach((id) => out.push({ kind: "slide", slide: { k: "hypItem", id } }));
    else if (s.k === "task") { const t = pathTask(s.spec, rnd); if (t) out.push({ kind: "task", task: t, deferred: !!s.deferred, retry: false }); }
    else if (s.k === "taskobj") out.push({ kind: "task", task: s.task, deferred: !!s.deferred, retry: false });
    else out.push({ kind: "slide", slide: s });
  }
  return out;
}

/**
 * Spielt eine Lektion oder Übung ab: ein Bildschirm pro Schritt. Falsch beantwortete Aufgaben kommen am Ende noch einmal
 * (die Wiederholung zählt nicht für die Wertung). Der Plan und das Log bekommen den ERSTEN Versuch jeder Aufgabe.
 */
export function LessonPlayer({ id, title, lesson, slides, src, onClose, onFinish, finishLabel = "Zurück zum Pfad" }: {
  id: string; title: string; lesson?: Lesson; slides?: Slide[]; src: string; onClose(): void; onFinish?(s: PlayerSummary): void; finishLabel?: string;
}) {
  const { s: state, dispatch } = useLesson();
  const base = useMemo<Step[]>(() => expand(lesson?.dynamic === "fehler" ? errorSlides(state.log) : (slides ?? lesson?.slides ?? [])), []); // eslint-disable-line react-hooks/exhaustive-deps
  const [queue, setQueue] = useState<Step[]>(base);
  const [i, setI] = useState(0);
  const [done, setDone] = useState(false);
  const first = useRef<Map<string, TaskResult>>(new Map());
  const requeued = useRef<Set<string>>(new Set());
  const [summary, setSummary] = useState<PlayerSummary | null>(null);
  const taskCount = base.filter((b) => b.kind === "task").length;
  const [confirm, setConfirm] = useState(false);

  const finish = () => {
    const results = [...first.current.values()];
    const right = results.filter((r) => r.correctness === "right").length;
    const sum = { results, first: right, total: results.length };
    setSummary(sum);
    if (results.length) dispatch({ t: "results", src, results, now: Date.now() });
    if (lesson) dispatch({ t: "lessonDone", id, first: right, total: results.length, now: Date.now() });
    onFinish?.(sum);
    setDone(true);
  };
  const next = () => { if (i + 1 >= queue.length) finish(); else setI(i + 1); };
  const onResult = (r: TaskResult) => {
    if (!first.current.has(r.taskId)) first.current.set(r.taskId, r);
    const step = queue[i];
    if (r.correctness !== "right" && step.kind === "task" && !step.deferred && !requeued.current.has(r.taskId) && !step.retry) {
      requeued.current.add(r.taskId);
      setQueue((q) => [...q, { ...step, retry: true }]);
    }
  };

  if (done && summary) {
    const { first: right, total } = summary;
    const good = total === 0 || right / total >= 0.7;
    return (
      <Screen progress={1} total={1} onClose={onClose} label={`${title}: geschafft`}>
        <div className="lp-main lp-end">
          <div className="lp-trophy" aria-hidden>{good ? "★" : "↻"}</div>
          <h2 className="lp-q">{good ? "Geschafft!" : "Geschafft. Das war noch wacklig."}</h2>
          {total > 0 && <p className="lp-text"><b>{right} von {total}</b> gleich beim ersten Mal richtig.</p>}
          {!good && <p className="lp-hint">Tipp: Mach die Lektion später noch einmal. Fehler kommen im Bereich „Üben“ wieder.</p>}
        </div>
        <div className="lp-foot" data-state="open"><button className="btn-big" onClick={onClose}>{finishLabel}</button></div>
      </Screen>
    );
  }

  const step = queue[i];
  const isLast = i + 1 >= queue.length;
  return (
    <Screen progress={i} total={queue.length} onClose={() => (i === 0 ? onClose() : setConfirm(true))} label={title}>
      {step.kind === "task"
        ? <TaskView key={`${step.task.id}-${i}`} task={step.task} deferred={step.deferred} last={isLast} onResult={onResult} onNext={next} />
        : <SlideView key={i} slide={step.slide} onNext={next} last={isLast} />}
      {confirm && (
        <div className="lp-sheet" role="alertdialog" aria-label="Lektion beenden?">
          <div className="lp-sheet-card"><h3>Lektion beenden?</h3><p className="muted">Dein Fortschritt in dieser Lektion geht verloren.</p>
            <button className="btn-big" onClick={() => setConfirm(false)}>Weiterlernen</button>
            <button className="btn-big btn-ghost" onClick={onClose}>Beenden</button></div>
        </div>
      )}
      <span hidden>{taskCount}</span>
    </Screen>
  );
}
