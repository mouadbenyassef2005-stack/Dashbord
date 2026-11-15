"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { IconX } from "../icons";
import { Button, ButtonLink, Card, PageHeader } from "../ui";
import { QuizRunner, type QuizResult } from "../quiz/QuizRunner";
import { MemoryGame } from "./MemoryGame";
import { awardPass, recordAttempt, toggleFlag } from "@/lib/progress";
import { makeQuestions, quizPool, type QuestionKind } from "@/lib/quiz";
import { useProgress } from "@/lib/store";

const GAMES: Record<string, { title: string; subtitle: string; kinds?: QuestionKind[]; n: number }> = {
  quiz: { title: "Misch-Quiz", subtitle: "Lesen, Schreibweise, Buchstaben finden und Wörter bauen – gemischt aus allem, was du gelernt hast.", n: 8 },
  detektiv: { title: "Buchstaben-Detektiv", subtitle: "Finde jeden gesuchten Buchstaben im Wort.", kinds: ["find-letter"], n: 6 },
  bauen: { title: "Wörter bauen", subtitle: "Setze Wörter aus ihren Teilen zusammen – von rechts nach links.", kinds: ["build-word"], n: 6 },
};

export function GameLoader({ kind }: { kind: string }) {
  const { hydrated } = useProgress();
  if (!hydrated) return <div className="grid min-h-dvh place-items-center text-muted">Lade …</div>;
  if (kind === "memory")
    return (
      <Shell title="Buchstaben-Memory" subtitle="Aufdecken, merken, Paare finden.">
        <MemoryGame />
      </Shell>
    );
  const g = GAMES[kind];
  if (!g) return <Shell title="Nicht gefunden" subtitle=""><ButtonLink href="/training">Zum Lesetraining</ButtonLink></Shell>;
  return <QuizGame kind={kind} />;
}

function Shell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col px-4 pb-8 pt-4 sm:px-6">
      <header className="mb-4 flex items-center gap-3"><Link href="/training" aria-label="Schließen" className="rounded-full p-2 text-ink/60 hover:bg-ink/5"><IconX /></Link></header>
      <PageHeader title={title} subtitle={subtitle} />
      {children}
    </div>
  );
}

function QuizGame({ kind }: { kind: string }) {
  const { progress, update } = useProgress();
  const g = GAMES[kind];
  const [round, setRound] = useState(0);
  const [res, setRes] = useState<QuizResult | null>(null);
  const pool = useMemo(() => quizPool(progress), []); // eslint-disable-line react-hooks/exhaustive-deps
  const questions = useMemo(() => makeQuestions(pool, g.n, Date.now() + round, g.kinds), [pool, g, round]);

  if (questions.length < Math.min(4, g.n))
    return (
      <Shell title={g.title} subtitle={g.subtitle}>
        <Card><p className="text-[15px]">Dafür fehlen noch passende Inhalte. Schließe zuerst ein paar Lektionen ab – bei „Wörter bauen“ und „Detektiv“ brauchst du Wörter oder Silben mit mindestens drei Zeichen.</p><ButtonLink href="/pfad" className="mt-4">Zum Lernpfad</ButtonLink></Card>
      </Shell>
    );

  return (
    <Shell title={g.title} subtitle={g.subtitle}>
      {res ? (
        <Card className="rise text-center" data-testid="game-result">
          <h2 className="text-xl font-semibold">{res.score} von {res.total} richtig</h2>
          <p className="mt-2 text-[15px] text-ink/80">{res.missed.length ? "Falsche Stellen sind für deine persönlichen Übungen vorgemerkt." : "Fehlerfrei – stark."}</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2"><Button onClick={() => { setRes(null); setRound((r) => r + 1); }} data-testid="game-again">Nochmal</Button><ButtonLink href="/training" variant="outline">Zum Lesetraining</ButtonLink></div>
        </Card>
      ) : (
        <QuizRunner
          key={round}
          questions={questions}
          onAnswer={(q, ok) => update((p) => { let n = recordAttempt(p, q.itemId, ok, [], Date.now(), "quiz"); if (ok) n = awardPass(n, true, false); else if (!n.flagged[q.itemId]) n = toggleFlag(n, q.itemId); return n; })}
          onFinish={setRes}
        />
      )}
    </Shell>
  );
}
