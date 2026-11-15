"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LESSON_BY_ID, nextLessonId, UNITS } from "@/content/lessons";
import type { Lesson } from "@/content/types";
import { buildDynamic, DYNAMIC_IDS } from "@/lib/adaptive";
import { accuracy, createSession, currentItemId, defer, fraction, markFailed, markPassed, startItems, type Session } from "@/lib/engine";
import { dailyMissions } from "@/lib/missions";
import { awardPass, completeLesson, recordAttempt, recordCheck, toggleFlag, XP_FIRST_TRY, XP_LESSON, XP_RETRY } from "@/lib/progress";
import { useProgress } from "@/lib/store";
import { ArabicText, RichText } from "../ArabicText";
import { IconArrow, IconCheck, IconX } from "../icons";
import { Button, ButtonLink, Card, ProgressBar, Ring } from "../ui";
import { CheckFlow, type CheckOutcome } from "./CheckFlow";
import { ChooseStep } from "./ChooseStep";
import { ReadStep } from "./ReadStep";

const EMPTY: Record<string, string> = {
  personal: "Noch nichts Persönliches zu üben. Mach zuerst ein paar Lektionen – dann stellt die App Übungen für dich zusammen.",
  review: "Gerade ist nichts fällig. Mach mit dem Lernpfad weiter.",
  flagged: "Du hast noch nichts als unsicher markiert. Das geht in jeder Übung oben rechts.",
  transfer: "Für unbekannte Wörter fehlen noch Voraussetzungen – schau im Lesetraining nach.",
};

export function LessonPlayer({ lessonId }: { lessonId: string }) {
  const { progress, update } = useProgress();
  const checkOnly = lessonId.startsWith("check-");
  const baseId = checkOnly ? lessonId.slice(6) : lessonId;
  const dynamic = !checkOnly && DYNAMIC_IDS.includes(lessonId);
  const [lesson] = useState<Lesson | null>(() => (dynamic ? buildDynamic(lessonId, progress) : LESSON_BY_ID.get(baseId) ?? null));
  if (!lesson)
    return (
      <div className="mx-auto grid min-h-dvh max-w-md place-items-center px-6 text-center">
        <div>
          <h1 className="text-xl font-semibold">{dynamic ? "Gerade nichts zu üben" : "Lektion nicht gefunden"}</h1>
          <p className="mt-2 text-muted">{dynamic ? EMPTY[lessonId] : "Diese Lektion gibt es nicht."}</p>
          <ButtonLink href={dynamic ? "/training" : "/pfad"} className="mt-6">{dynamic ? "Zum Lesetraining" : "Zum Lernpfad"}</ButtonLink>
        </div>
      </div>
    );
  if (checkOnly) return <CheckOnly lesson={lesson} update={update} />;
  return <Player lesson={lesson} dynamic={dynamic} showHint={progress.settings.showHint} micConsent={progress.micConsent} flagged={progress.flagged} update={update} />;
}

function CheckOnly({ lesson, update }: { lesson: Lesson; update: ReturnType<typeof useProgress>["update"] }) {
  const router = useRouter();
  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col px-4 pb-6 pt-4 sm:px-6">
      <header className="mb-5 flex items-center gap-3">
        <Link href="/pfad" aria-label="Check verlassen" className="rounded-full p-2 text-ink/60 hover:bg-ink/5"><IconX /></Link>
        <p className="text-sm text-muted">{lesson.title}</p>
      </header>
      <CheckFlow lesson={lesson} laterLabel="Zurück zum Lernpfad" onFinish={(o) => { update((p) => recordCheck(p, lesson.id, o)); router.push("/pfad"); }} />
    </div>
  );
}

function Player({ lesson, dynamic, showHint, micConsent, flagged, update }: { lesson: Lesson; dynamic: boolean; showHint: boolean; micConsent: boolean; flagged: Record<string, number>; update: ReturnType<typeof useProgress>["update"] }) {
  const [s, setS] = useState<Session>(() => createSession(lesson));
  const saved = useRef(false);
  const itemId = currentItemId(s);
  const item = lesson.items.find((i) => i.id === itemId);
  const [outcome, setOutcome] = useState<CheckOutcome | null>(null);

  const finishCheck = (o: CheckOutcome) => {
    if (saved.current) return;
    saved.current = true;
    update((p) => completeLesson(p, lesson.id, accuracy(s), Date.now(), o.total ? o : undefined));
    setOutcome(o);
  };

  const attempt = (id: string) => (passed: boolean, weak: string[] = [], src: "demo" | "self" | "live" = "demo") => {
    update((p) => recordAttempt(p, id, passed, weak, Date.now(), src));
    if (!passed) setS((x) => markFailed(x, id));
  };
  const pass = (id: string) => {
    const firstTry = !s.failedOnce.includes(id);
    update((p) => awardPass(p, firstTry, dynamic));
    setS((x) => markPassed(x, id));
  };

  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col px-4 pb-6 pt-4 sm:px-6">
      <header className="mb-5 flex items-center gap-3">
        <Link href={dynamic ? "/training" : "/pfad"} aria-label="Lektion verlassen" className="rounded-full p-2 text-ink/60 hover:bg-ink/5"><IconX /></Link>
        <ProgressBar value={s.phase === "done" ? 1 : fraction(s)} label="Fortschritt in der Lektion" className="flex-1" />
        <span className="w-12 text-right text-sm tabular-nums text-muted">{s.passed.length}/{s.total}</span>
      </header>

      {s.phase === "intro" && <Intro lesson={lesson} dynamic={dynamic} onStart={() => setS(startItems)} />}

      {s.phase === "items" && item?.kind === "read" && (
        <ReadStep
          key={item.id}
          item={item}
          showHint={showHint}
          micConsent={micConsent}
          onConsent={() => update((p) => ({ ...p, micConsent: true }))}
          onAttempt={attempt(item.id)}
          onPass={() => pass(item.id)}
          onDefer={() => setS((x) => defer(x, item.id))}
          canDefer={s.queue.length > 1}
          flagged={!!flagged[item.id]}
          onToggleFlag={() => update((p) => toggleFlag(p, item.id))}
        />
      )}
      {s.phase === "items" && item?.kind === "choose" && (
        <ChooseStep
          key={item.id}
          item={item}
          onAttempt={(ok) => attempt(item.id)(ok, [], "self")}
          onPass={() => pass(item.id)}
          onDefer={() => setS((x) => defer(x, item.id))}
          canDefer={s.queue.length > 1}
        />
      )}

      {s.phase === "done" && !dynamic && !outcome && <CheckFlow lesson={lesson} onFinish={finishCheck} />}
      {s.phase === "done" && (dynamic || outcome) && <Done lesson={lesson} s={s} dynamic={dynamic} outcome={outcome} />}
    </div>
  );
}

function Intro({ lesson, dynamic, onStart }: { lesson: Lesson; dynamic: boolean; onStart: () => void }) {
  const unit = UNITS.find((u) => u.id === lesson.unitId);
  return (
    <div className="rise flex flex-1 flex-col">
      <p className="text-sm font-medium text-primary">{unit?.title ?? "Lesetraining"} · ca. {lesson.minutes} Min.</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight">{lesson.title}</h1>
      <Card className="mt-5 bg-primary-soft/60 !border-primary/15 !shadow-none">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Lernziel</p>
        <p className="mt-1 text-[17px]"><RichText text={lesson.goal} /></p>
      </Card>
      <div className="mt-6 space-y-3 text-[16px] leading-relaxed text-ink/85">
        <h2 className="text-lg font-semibold text-ink">{lesson.intro.title}</h2>
        {dynamic && lesson.id === "personal" ? (
          <>
            <p>{lesson.intro.body[0]}</p>
            <ul className="space-y-2">
              {lesson.items.map((i) => (
                <li key={i.id} className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-surface px-4 py-2">
                  {i.kind === "read" && <ArabicText text={i.arabic} size="xs" className="leading-[1.6]" />}
                  <span className="text-right text-sm text-muted">{i.kind === "read" ? i.prompt : ""}</span>
                </li>
              ))}
            </ul>
          </>
        ) : lesson.intro.body.map((b, i) => <p key={i}><RichText text={b} /></p>)}
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

function Done({ lesson, s, dynamic, outcome }: { lesson: Lesson; s: Session; dynamic: boolean; outcome: CheckOutcome | null }) {
  const bonus = !!outcome?.passed;
  const { progress } = useProgress();
  const acc = accuracy(s);
  const next = dynamic ? undefined : nextLessonId(lesson.id);
  const retried = s.total - s.firstTry.length;
  const xp = s.firstTry.length * XP_FIRST_TRY + retried * XP_RETRY + (bonus ? XP_LESSON : 0);
  const missions = dailyMissions(progress);
  return (
    <div className="rise flex flex-1 flex-col items-center text-center" data-testid="done">
      <div className="mt-4"><Ring value={acc} size={112}>{Math.round(acc * 100)} %</Ring></div>
      <p className="mt-1 text-xs text-muted">auf Anhieb richtig</p>
      <h1 className="mt-4 text-2xl font-semibold">{dynamic ? "Übung geschafft" : "Lektion abgeschlossen"}</h1>
      <p className="mt-1 text-muted">{lesson.title}</p>
      <p className="mt-3 max-w-sm text-[15px] text-ink/80">
        {retried === 0 ? "Alles beim ersten Versuch – sauber gelesen." : `${retried} ${retried === 1 ? "Übung brauchte" : "Übungen brauchten"} einen zweiten Anlauf. Das gehört zum Lernen – genau diese Stellen kommen in deinen persönlichen Übungen wieder.`}
      </p>
      {outcome && outcome.total > 0 && <p className="mt-2 text-sm text-muted" data-testid="check-line">Verständnis-Check: {outcome.score}/{outcome.total} {outcome.passed ? "bestanden" : "noch offen – du kannst ihn jederzeit im Lernpfad nachholen"}</p>}
      <p className="mt-3 rounded-full bg-gold-soft px-3 py-1 text-sm font-medium text-gold" data-testid="xp">+{xp} XP{bonus ? " (inkl. Check-Bonus)" : ""}</p>

      <div className="mt-6 w-full rounded-3xl border border-line bg-surface p-4 text-left">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">Tägliche Missionen</p>
        <ul className="mt-2 space-y-2">
          {missions.map((m) => (
            <li key={m.id} className="flex items-center gap-3 text-sm">
              <span className={`grid size-5 place-items-center rounded-full ${m.done ? "bg-ok text-white" : "border border-line"}`}>{m.done && <IconCheck className="size-3.5" />}</span>
              <span className={m.done ? "text-muted line-through" : ""}>{m.title}</span>
              <span className="ml-auto tabular-nums text-muted">{m.progress}/{m.target}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-auto w-full space-y-2 pt-8">
        {next ? (
          <ButtonLink href={`/lektion/${next}`} className="w-full" data-testid="next-lesson">Nächste Lektion <IconArrow className="size-5" /></ButtonLink>
        ) : (
          <ButtonLink href={dynamic ? "/training" : "/"} className="w-full">{dynamic ? "Zurück zum Lesetraining" : "Zum Start"}</ButtonLink>
        )}
        <ButtonLink href="/pfad" variant="outline" className="w-full">Zum Lernpfad</ButtonLink>
      </div>
    </div>
  );
}
