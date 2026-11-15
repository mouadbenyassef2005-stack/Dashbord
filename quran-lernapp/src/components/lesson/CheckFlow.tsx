"use client";
import { useMemo, useState } from "react";
import type { Lesson } from "@/content/types";
import { awardPass, recordAttempt, toggleFlag } from "@/lib/progress";
import { CHECK_PASS_RATIO, lessonCheckQuestions, type Question } from "@/lib/quiz";
import { useProgress } from "@/lib/store";
import { IconArrow } from "../icons";
import { QuizRunner, type QuizResult } from "../quiz/QuizRunner";
import { Button, Ring } from "../ui";

export interface CheckOutcome { score: number; total: number; passed: boolean }

/** Verständnis-Check am Lektionsende: 5 abwechslungsreiche Fragen aus der Lektion. Bestanden ab 60 %. */
export function CheckFlow({ lesson, onFinish, laterLabel = "Später fortfahren" }: { lesson: Lesson; onFinish: (o: CheckOutcome) => void; laterLabel?: string }) {
  const { update } = useProgress();
  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState<"intro" | "quiz" | "result">("intro");
  const [res, setRes] = useState<QuizResult | null>(null);
  const questions = useMemo(() => lessonCheckQuestions(lesson, Date.now() + round), [lesson, round]);
  const total = questions.length;

  const answer = (q: Question, ok: boolean) => {
    update((p) => {
      let n = recordAttempt(p, q.itemId, ok, [], Date.now(), "quiz");
      if (ok) n = awardPass(n, true, false);
      else if (!n.flagged[q.itemId]) n = toggleFlag(n, q.itemId);
      return n;
    });
  };
  const finish = (r: QuizResult) => { setRes(r); setPhase("result"); };
  const passed = !!res && res.score / res.total >= CHECK_PASS_RATIO;

  if (total === 0) return <div className="flex flex-1 flex-col justify-end"><Button onClick={() => onFinish({ score: 0, total: 0, passed: true })}>Weiter</Button></div>;

  if (phase === "intro")
    return (
      <div className="rise flex flex-1 flex-col" data-testid="check-intro">
        <p className="text-sm font-medium text-primary">Verständnis-Check</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Hast du es verstanden?</h1>
        <p className="mt-4 text-[16px] leading-relaxed text-ink/85">{total} kurze Fragen zu „{lesson.title}“ – diesmal ohne Mikrofon: erkennen, zuordnen, Wörter bauen. Ab {Math.round(CHECK_PASS_RATIO * 100)} % richtig ist der Check bestanden. Falsches wird für deine persönlichen Übungen vorgemerkt, nicht bestraft.</p>
        <div className="mt-auto space-y-2 pt-8">
          <Button className="w-full" onClick={() => setPhase("quiz")} data-testid="check-start">Check starten <IconArrow className="size-5" /></Button>
          <Button variant="ghost" className="w-full" onClick={() => onFinish({ score: 0, total, passed: false })} data-testid="check-skip">{laterLabel}</Button>
        </div>
      </div>
    );

  if (phase === "quiz") return <QuizRunner key={round} questions={questions} onAnswer={answer} onFinish={finish} />;

  return (
    <div className="rise flex flex-1 flex-col items-center text-center" data-testid="check-result">
      <div className="mt-4"><Ring value={res!.score / res!.total} size={112}>{res!.score}/{res!.total}</Ring></div>
      <h1 className="mt-5 text-2xl font-semibold">{passed ? "Check bestanden" : "Noch nicht ganz sicher"}</h1>
      <p className="mt-2 max-w-sm text-[15px] text-ink/80">
        {passed
          ? res!.missed.length ? "Gut verstanden. Die falschen Stellen sind für deine persönlichen Übungen vorgemerkt." : "Alles richtig – du hast den Stoff verstanden."
          : "Das ist kein Rückschritt: Wir wissen jetzt, was noch fehlt. Die Stellen sind für deine persönlichen Übungen vorgemerkt. Mach den Check gern nochmal."}
      </p>
      <div className="mt-auto w-full space-y-2 pt-8">
        {passed ? (
          <Button className="w-full" onClick={() => onFinish({ score: res!.score, total: res!.total, passed: true })} data-testid="check-continue">Weiter <IconArrow className="size-5" /></Button>
        ) : (
          <>
            <Button className="w-full" onClick={() => { setRes(null); setRound((r) => r + 1); setPhase("quiz"); }} data-testid="check-retry">Check wiederholen</Button>
            <Button variant="outline" className="w-full" onClick={() => onFinish({ score: res!.score, total: res!.total, passed: false })} data-testid="check-later">{laterLabel}</Button>
          </>
        )}
      </div>
    </div>
  );
}
