"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { LESSON_BY_ID, nextLessonId, UNITS } from "@/content/lessons";
import type { Lesson } from "@/content/types";
import { accuracy, createSession, currentItemId, defer, fraction, markFailed, markPassed, startItems, type Session } from "@/lib/engine";
import { completeLesson, recordAttempt } from "@/lib/progress";
import { buildReview } from "@/lib/review";
import { useProgress } from "@/lib/store";
import { ArabicText } from "../ArabicText";
import { IconArrow, IconX } from "../icons";
import { Button, ButtonLink, Card, ProgressBar, Ring } from "../ui";
import { ChooseStep } from "./ChooseStep";
import { ReadStep } from "./ReadStep";

export function LessonPlayer({ lessonId }: { lessonId: string }) {
  const { progress, update } = useProgress();
  const [lesson] = useState<Lesson | null>(() => (lessonId === "review" ? buildReview(progress) : LESSON_BY_ID.get(lessonId) ?? null));
  if (!lesson) return <Empty review={lessonId === "review"} />;
  return <Player lesson={lesson} isReview={lessonId === "review"} showHint={progress.settings.showHint} micConsent={progress.micConsent} update={update} />;
}

function Empty({ review }: { review: boolean }) {
  return (
    <div className="mx-auto grid min-h-dvh max-w-md place-items-center px-6 text-center">
      <div>
        <h1 className="text-xl font-semibold">{review ? "Nichts zu wiederholen" : "Lektion nicht gefunden"}</h1>
        <p className="mt-2 text-muted">{review ? "Gerade ist nichts fällig. Mach mit dem Lernpfad weiter." : "Diese Lektion gibt es nicht."}</p>
        <ButtonLink href="/pfad" className="mt-6">Zum Lernpfad</ButtonLink>
      </div>
    </div>
  );
}

function Player({ lesson, isReview, showHint, micConsent, update }: { lesson: Lesson; isReview: boolean; showHint: boolean; micConsent: boolean; update: ReturnType<typeof useProgress>["update"] }) {
  const [s, setS] = useState<Session>(() => createSession(lesson));
  const saved = useRef(false);
  const itemId = currentItemId(s);
  const item = lesson.items.find((i) => i.id === itemId);

  useEffect(() => {
    if (s.phase === "done" && !saved.current) {
      saved.current = true;
      if (!isReview) update((p) => completeLesson(p, lesson.id, accuracy(s)));
    }
  }, [s, isReview, lesson.id, update]);

  const attempt = (id: string) => (passed: boolean, weak: string[] = []) => {
    update((p) => recordAttempt(p, id, passed, weak));
    if (!passed) setS((x) => markFailed(x, id));
  };

  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col px-4 pb-6 pt-4 sm:px-6">
      <header className="mb-5 flex items-center gap-3">
        <Link href="/pfad" aria-label="Lektion verlassen" className="rounded-full p-2 text-ink/60 hover:bg-ink/5"><IconX /></Link>
        <ProgressBar value={s.phase === "done" ? 1 : fraction(s)} label="Fortschritt in der Lektion" className="flex-1" />
        <span className="w-12 text-right text-sm tabular-nums text-muted">{s.passed.length}/{s.total}</span>
      </header>

      {s.phase === "intro" && <Intro lesson={lesson} onStart={() => setS(startItems)} />}

      {s.phase === "items" && item?.kind === "read" && (
        <ReadStep
          key={item.id}
          item={item}
          showHint={showHint}
          micConsent={micConsent}
          onConsent={() => update((p) => ({ ...p, micConsent: true }))}
          onAttempt={attempt(item.id)}
          onPass={() => setS((x) => markPassed(x, item.id))}
          onDefer={() => setS((x) => defer(x, item.id))}
          canDefer={s.queue.length > 1}
        />
      )}
      {s.phase === "items" && item?.kind === "choose" && (
        <ChooseStep
          key={item.id}
          item={item}
          onAttempt={(ok) => attempt(item.id)(ok)}
          onPass={() => setS((x) => markPassed(x, item.id))}
          onDefer={() => setS((x) => defer(x, item.id))}
          canDefer={s.queue.length > 1}
        />
      )}

      {s.phase === "done" && <Done lesson={lesson} s={s} isReview={isReview} />}
    </div>
  );
}

function Intro({ lesson, onStart }: { lesson: Lesson; onStart: () => void }) {
  const unit = UNITS.find((u) => u.id === lesson.unitId);
  return (
    <div className="rise flex flex-1 flex-col">
      <p className="text-sm font-medium text-primary">{unit?.title ?? "Wiederholung"} · ca. {lesson.minutes} Min.</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight">{lesson.title}</h1>
      <Card className="mt-5 bg-primary-soft/60 !border-primary/15 !shadow-none">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Lernziel</p>
        <p className="mt-1 text-[17px]">{lesson.goal}</p>
      </Card>
      <div className="mt-6 space-y-3 text-[16px] leading-relaxed text-ink/85">
        <h2 className="text-lg font-semibold text-ink">{lesson.intro.title}</h2>
        {lesson.intro.body.map((b, i) => <p key={i}>{b}</p>)}
      </div>
      {lesson.intro.examples && (
        <div className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {lesson.intro.examples.map((e, i) => (
            <div key={i} className="rounded-2xl border border-line bg-surface py-2 text-center">
              <ArabicText text={e.arabic} size="md" className="leading-[1.5]" />
              <div className="text-xs text-muted">{e.label}</div>
            </div>
          ))}
        </div>
      )}
      <div className="mt-auto pt-8">
        <Button className="w-full" onClick={onStart} data-testid="start">Los geht’s <IconArrow className="size-5" /></Button>
      </div>
    </div>
  );
}

function Done({ lesson, s, isReview }: { lesson: Lesson; s: Session; isReview: boolean }) {
  const acc = accuracy(s);
  const next = isReview ? undefined : nextLessonId(lesson.id);
  const retried = s.total - s.firstTry.length;
  return (
    <div className="rise flex flex-1 flex-col items-center text-center" data-testid="done">
      <div className="mt-6"><Ring value={acc} size={120}>{Math.round(acc * 100)} %</Ring></div>
      <h1 className="mt-6 text-2xl font-semibold">{isReview ? "Wiederholung geschafft" : "Lektion abgeschlossen"}</h1>
      <p className="mt-1 text-muted">{lesson.title}</p>
      <p className="mt-4 max-w-sm text-[15px] text-ink/80">
        {retried === 0 ? "Alles beim ersten Versuch – sauber gelesen." : `${retried} ${retried === 1 ? "Übung wurde" : "Übungen wurden"} wiederholt. Das ist normal: Genauigkeit zählt mehr als Tempo. Sie kommen in der Wiederholung wieder.`}
      </p>
      <div className="mt-auto w-full space-y-2 pt-10">
        {next ? (
          <ButtonLink href={`/lektion/${next}`} className="w-full" data-testid="next-lesson">Nächste Lektion <IconArrow className="size-5" /></ButtonLink>
        ) : (
          <ButtonLink href="/" className="w-full">{isReview ? "Zurück zum Start" : "Zum Start"}</ButtonLink>
        )}
        <ButtonLink href="/pfad" variant="outline" className="w-full">Zum Lernpfad</ButtonLink>
      </div>
    </div>
  );
}
