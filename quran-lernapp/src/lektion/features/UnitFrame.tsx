"use client";
import type { ReactNode } from "react";
import { UNIT_BY_ID } from "@/lektion/content/units";
import { PHASES, pk } from "@/lektion/domain/lektion/state";
import { RichText } from "@/lektion/ui/parts";
import { useLesson } from "./LessonContext";

interface Props {
  unit: number;
  phase: number;
  labels: string[];
  /** Darf der Nutzer vom aktuellen Schritt weiter? Wenn nicht, gibt es „Schritt überspringen“. */
  canNext?: boolean;
  finishLabel: string;
  onFinish(): void;
  why?: ReactNode;
  children(step: number, go: (n: number) => void): ReactNode;
}

/** Rahmen einer Phase: Methode, Schritte (gespeichert), Navigation. Überspringen bleibt möglich, niemand wird eingesperrt. */
export function UnitFrame({ unit, phase, labels, canNext = true, finishLabel, onFinish, why, children }: Props) {
  const { s, dispatch } = useLesson();
  const meta = PHASES[phase - 1];
  const u = UNIT_BY_ID.get(unit as 1)!;
  const step = Math.min(s.steps[pk(unit, phase)] ?? 0, labels.length - 1);
  const go = (n: number) => { dispatch({ t: "step", unit, phase, step: n }); window.scrollTo?.({ top: 0 }); };
  const last = step === labels.length - 1;
  return (
    <div className="stack-lg fade">
      <header className="stack">
        <p className="eyebrow">Einheit <b>{unit}</b> · {meta.unitLabel} <span aria-hidden>· Phase {phase} von 7</span></p>
        <h2 className="phase-title">{meta.title}</h2>
        <div className="method"><i>{meta.method}</i></div>
        {why && <details className="why"><summary>Warum so gelernt wird</summary><div className="stack">{why}</div></details>}
      </header>
      <div className="stack" aria-label="Schritte dieser Phase">
        <div className="progress" role="progressbar" aria-valuenow={step + 1} aria-valuemin={1} aria-valuemax={labels.length} aria-valuetext={`Schritt ${step + 1} von ${labels.length}`} aria-label="Schritte dieser Phase"><span style={{ width: `${((step + 1) / labels.length) * 100}%` }} /></div>
        <p className="muted" style={{ fontSize: 13 }}>Schritt {step + 1} von {labels.length}: <RichText text={labels[step]} /></p>
      </div>
      <section key={`${unit}-${phase}-${step}`} className="stack-lg fade" aria-label={labels[step]}>{children(step, go)}</section>
      <div className="phase-nav">
        <button className="btn btn-secondary" disabled={step === 0} onClick={() => go(step - 1)}>Zurück</button>
        <div className="row" style={{ justifyContent: "flex-end" }}>
          {!canNext && <button className="btn btn-ghost" onClick={() => (last ? onFinish() : go(step + 1))}>Schritt überspringen</button>}
          {last
            ? <button className="btn btn-primary" disabled={!canNext} onClick={onFinish}>{finishLabel}</button>
            : <button className="btn btn-primary" disabled={!canNext} onClick={() => go(step + 1)}>Weiter</button>}
        </div>
      </div>
      <span hidden>{u.id}</span>
    </div>
  );
}
