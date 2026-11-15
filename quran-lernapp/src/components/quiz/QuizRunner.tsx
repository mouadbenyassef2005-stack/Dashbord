"use client";
import { useState } from "react";
import type { BuildWord, FindLetter, Question } from "@/lib/quiz";
import { ArabicText, RichText } from "../ArabicText";
import { IconArrow, IconCheck } from "../icons";
import { Button, ProgressBar, cx } from "../ui";

export interface QuizResult {
  score: number;
  total: number;
  /** itemIds, bei denen die Antwort falsch war */
  missed: string[];
}

interface Props {
  questions: Question[];
  /** wird nach jeder Antwort aufgerufen (Fortschritt/Fehlerstatistik) */
  onAnswer: (q: Question, correct: boolean) => void;
  onFinish: (r: QuizResult) => void;
  finishLabel?: string;
}

const KIND_LABEL: Record<Question["kind"], string> = {
  "pick-translit": "Lesen",
  "pick-arabic": "Schreiben erkennen",
  "find-letter": "Buchstaben-Detektiv",
  "build-word": "Wort bauen",
};

export function QuizRunner({ questions, onAnswer, onFinish, finishLabel = "Ergebnis ansehen" }: Props) {
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState<string[]>([]);
  const q = questions[i];

  const answered = (correct: boolean) => {
    onAnswer(q, correct);
    if (correct) setScore((s) => s + 1);
    else setMissed((m) => (m.includes(q.itemId) ? m : [...m, q.itemId]));
  };
  const next = () => {
    if (i + 1 >= questions.length) onFinish({ score, total: questions.length, missed });
    else setI(i + 1);
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="mb-4 flex items-center gap-3">
        <ProgressBar value={i / questions.length} label="Fortschritt im Quiz" className="flex-1" />
        <span className="text-sm tabular-nums text-muted">{i + 1}/{questions.length}</span>
      </div>
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-primary">{KIND_LABEL[q.kind]}</p>
      <div key={q.id + i} className="flex flex-1 flex-col">
        {(q.kind === "pick-translit" || q.kind === "pick-arabic") && <PickQ q={q} onAnswered={answered} onNext={next} last={i + 1 >= questions.length} finishLabel={finishLabel} />}
        {q.kind === "find-letter" && <FindQ q={q} onAnswered={answered} onNext={next} last={i + 1 >= questions.length} finishLabel={finishLabel} />}
        {q.kind === "build-word" && <BuildQ q={q} onAnswered={answered} onNext={next} last={i + 1 >= questions.length} finishLabel={finishLabel} />}
      </div>
    </div>
  );
}

interface QProps<T> { q: T; onAnswered: (ok: boolean) => void; onNext: () => void; last: boolean; finishLabel: string }

function Feedback({ ok, text, onNext, last, finishLabel, extra }: { ok: boolean; text: string; onNext: () => void; last: boolean; finishLabel: string; extra?: React.ReactNode }) {
  return (
    <div className="rise mt-4" aria-live="polite" data-testid="q-feedback">
      <p className={cx("flex items-start gap-2 text-[15px]", ok ? "text-ok" : "text-warn")}>
        {ok && <IconCheck className="mt-0.5 size-5 shrink-0" />}
        <span><strong>{ok ? "Richtig. " : "Nicht ganz – das merken wir uns für später. "}</strong><span className="text-ink/75"><RichText text={text} /></span></span>
      </p>
      {extra}
      <Button className="mt-3 w-full" onClick={onNext} data-testid="q-next">{last ? finishLabel : "Weiter"} <IconArrow className="size-5" /></Button>
    </div>
  );
}

function PickQ({ q, onAnswered, onNext, last, finishLabel }: QProps<Extract<Question, { kind: "pick-translit" | "pick-arabic" }>>) {
  const [picked, setPicked] = useState<number | null>(null);
  const arabicOptions = q.kind === "pick-arabic";
  const pick = (idx: number) => {
    if (picked !== null) return;
    setPicked(idx);
    onAnswered(idx === q.answer);
  };
  return (
    <>
      <div className="grid flex-1 place-items-center rounded-3xl border border-line bg-surface px-4 py-8 text-center shadow-card">
        {q.kind === "pick-translit" ? (
          <div><p className="mb-2 text-[15px] text-muted">Wie liest man das?</p><ArabicText text={q.arabic} px={q.arabic.length > 4 ? 72 : 104} /></div>
        ) : (
          <div><p className="mb-2 text-[15px] text-muted">Welche Schreibweise passt zu</p><p className="text-3xl font-semibold">„{q.hint}“?</p></div>
        )}
      </div>
      <div className={cx("mt-4 grid gap-2", arabicOptions ? "grid-cols-3" : "grid-cols-1")} role="group" aria-label="Antworten">
        {q.options.map((o, idx) => {
          const state = picked === null ? "idle" : idx === q.answer ? "right" : picked === idx ? "wrong" : "idle";
          return (
            <button key={idx} type="button" onClick={() => pick(idx)} data-testid={`qopt-${idx}`} disabled={picked !== null} className={cx("rounded-2xl border px-4 py-3 font-medium transition", arabicOptions ? "text-center" : "text-left", state === "idle" && "border-line bg-surface hover:border-primary/50", state === "right" && "border-ok bg-ok-soft text-ok", state === "wrong" && "border-warn bg-warn-soft text-warn")}>
              {arabicOptions ? <ArabicText text={o} size="md" className="leading-[1.6]" /> : o}
            </button>
          );
        })}
      </div>
      {picked !== null && <Feedback ok={picked === q.answer} text={q.explain} onNext={onNext} last={last} finishLabel={finishLabel} />}
    </>
  );
}

function FindQ({ q, onAnswered, onNext, last, finishLabel }: QProps<FindLetter>) {
  const [sel, setSel] = useState<number[]>([]);
  const [done, setDone] = useState(false);
  const toggle = (idx: number) => !done && setSel((s) => (s.includes(idx) ? s.filter((x) => x !== idx) : [...s, idx]));
  const check = () => {
    setDone(true);
    const ok = sel.length === q.correct.length && q.correct.every((c) => sel.includes(c));
    setOk(ok);
    onAnswered(ok);
  };
  const [ok, setOk] = useState(false);
  return (
    <>
      <div className="grid flex-1 place-items-center rounded-3xl border border-line bg-surface px-4 py-8 text-center shadow-card">
        <div>
          <p className="mb-3 text-[17px]">Tippe jedes <strong>{q.targetName}</strong> <span className="arabic text-2xl align-middle">{q.targetCh}</span> an.</p>
          <p dir="rtl" lang="ar" className="arabic text-[64px] leading-[1.9]" role="group" aria-label="Wort">
            {q.clusters.map((c, idx) => {
              const on = sel.includes(idx);
              const right = done && q.correct.includes(idx);
              const wrong = done && on && !q.correct.includes(idx);
              return (
                <span key={idx} role="button" tabIndex={0} aria-pressed={on} data-testid={`cl-${idx}`} onClick={() => toggle(idx)} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), toggle(idx))}
                  className={cx("cursor-pointer rounded-lg", on && !done && "bg-primary-soft", right && "bg-ok-soft text-ok", wrong && "bg-warn-soft text-warn")}>{c}</span>
              );
            })}
          </p>
          <p className="mt-2 text-sm text-muted">{q.correct.length === 1 ? "Genau ein Treffer." : `${q.correct.length} Treffer.`}</p>
        </div>
      </div>
      {!done ? <Button className="mt-4 w-full" onClick={check} disabled={sel.length === 0} data-testid="q-check">Prüfen</Button> : <Feedback ok={ok} text={q.explain} onNext={onNext} last={last} finishLabel={finishLabel} />}
    </>
  );
}

function BuildQ({ q, onAnswered, onNext, last, finishLabel }: QProps<BuildWord>) {
  const [taken, setTaken] = useState<number[]>([]); // Indizes in q.pieces, in Tipp-Reihenfolge
  const [done, setDone] = useState(false);
  const [ok, setOk] = useState(false);
  const built = taken.map((t) => q.pieces[t]).join("");
  const tap = (idx: number) => { if (!done && !taken.includes(idx)) setTaken([...taken, idx]); };
  const check = () => {
    const good = built === q.target.join("");
    setOk(good); setDone(true); onAnswered(good);
  };
  return (
    <>
      <div className="grid flex-1 place-items-center rounded-3xl border border-line bg-surface px-4 py-8 text-center shadow-card">
        <div className="w-full">
          <p className="text-[15px] text-muted">Baue das Wort „{q.hint}“ – Tippe die Teile von rechts nach links.</p>
          <div className={cx("mx-auto mt-4 grid min-h-[110px] place-items-center rounded-2xl border-2 border-dashed px-3", done ? (ok ? "border-ok bg-ok-soft" : "border-warn bg-warn-soft") : "border-line")} data-testid="built">
            {built ? <ArabicText text={built} px={64} /> : <span className="text-sm text-muted">Hier entsteht dein Wort</span>}
          </div>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-2" dir="rtl">
        {q.pieces.map((pc, idx) => (
          <button key={idx} type="button" data-testid={`piece-${idx}`} onClick={() => tap(idx)} disabled={taken.includes(idx) || done} className={cx("arabic min-w-14 rounded-2xl border px-4 text-4xl leading-[1.7] transition", taken.includes(idx) ? "border-line bg-bg text-ink/20" : "border-line bg-surface hover:border-primary/50")}>{pc}</button>
        ))}
      </div>
      {!done ? (
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={() => setTaken([])} disabled={!taken.length}>Zurücksetzen</Button>
          <Button onClick={check} disabled={taken.length < q.pieces.length} data-testid="q-check">Prüfen</Button>
        </div>
      ) : <Feedback ok={ok} text={q.explain} onNext={onNext} last={last} finishLabel={finishLabel} />}
    </>
  );
}
