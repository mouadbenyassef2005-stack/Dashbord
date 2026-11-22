"use client";
import type { ReactNode } from "react";
import { RichText } from "@/lektion/ui/parts";
import { PHASES } from "@/lektion/domain/lektion/state";
import { useLesson } from "./LessonContext";

interface Props {
  phase: number;
  labels: string[];
  /** Darf der Nutzer vom aktuellen Schritt weiter? */
  canNext?: boolean;
  /** Letzter Schritt: Text des Abschluss-Buttons */
  finishLabel: string;
  onFinish(): void;
  /** Optionale Erklärung der Methode */
  why?: ReactNode;
  children(step: number): ReactNode;
}

/** Gemeinsamer Rahmen: Kopf mit Methode, Schrittzähler (gespeichert), Navigation. */
export function PhaseFrame({ phase, labels, canNext = true, finishLabel, onFinish, why, children }: Props) {
  const { s, dispatch } = useLesson();
  const meta = PHASES[phase - 1];
  const step = Math.min(s.steps[phase] ?? 0, labels.length - 1);
  const set = (n: number) => { dispatch({ t: "step", phase, step: n }); window.scrollTo?.({ top: 0 }); };
  const last = step === labels.length - 1;
  return (
    <div className="stack-lg fade">
      <header className="stack">
        <p className="eyebrow">Phase <b>{phase}</b> von {PHASES.length} · {meta.title}</p>
        <div className="method"><i>{meta.method}</i></div>
        {why && <details className="why"><summary>Warum so gelernt wird</summary><div className="stack">{why}</div></details>}
      </header>
      <div className="stack">
        <div className="progress" role="progressbar" aria-valuenow={step + 1} aria-valuemin={1} aria-valuemax={labels.length} aria-label={`Schritt ${step + 1} von ${labels.length}`}><span style={{ width: `${((step + 1) / labels.length) * 100}%` }} /></div>
        <p className="muted" style={{ fontSize: 13 }}>Schritt {step + 1} von {labels.length} · <RichText text={labels[step]} /></p>
      </div>
      <section key={step} className="stack-lg fade" aria-label={labels[step]}>{children(step)}</section>
      <div className="phase-nav">
        <button className="btn btn-secondary" disabled={step === 0} onClick={() => set(step - 1)}>Zurück</button>
        {last
          ? <button className="btn btn-primary" disabled={!canNext} onClick={onFinish}>{finishLabel}</button>
          : <button className="btn btn-primary" disabled={!canNext} onClick={() => set(step + 1)}>Weiter</button>}
      </div>
    </div>
  );
}
