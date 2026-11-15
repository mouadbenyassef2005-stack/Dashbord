"use client";
import Link from "next/link";
import { ArabicText } from "@/components/ArabicText";
import { IconArrow, IconFlame, IconRepeat } from "@/components/icons";
import { ButtonLink, Card, Chip, ProgressBar, Ring } from "@/components/ui";
import { LESSONS, LESSON_BY_ID, UNITS } from "@/content/lessons";
import { UNIQUE_WORDS } from "@/content/quran";
import { LETTERS } from "@/content/letters";
import { completedCount, currentLessonId, dueItemIds, stageFraction, statusOf, streak, todayCount } from "@/lib/progress";
import { READ_ITEM_BY_ID } from "@/lib/review";
import { useProgress } from "@/lib/store";

export default function Dashboard() {
  const { progress: p } = useProgress();
  const cur = currentLessonId(p);
  const lesson = cur ? LESSON_BY_ID.get(cur) : null;
  const unit = lesson ? UNITS.find((u) => u.id === lesson.unitId) : null;
  const done = completedCount(p);
  const today = todayCount(p);
  const goal = p.dailyGoal;
  const due = dueItemIds(p).filter((id) => READ_ITEM_BY_ID.has(id)).length;
  const lettersKnown = LETTERS.filter((l) => statusOf(p, `l:${l.ch}`) === "known").length;
  const wordsKnown = UNIQUE_WORDS.filter((w) => statusOf(p, `w:${w.id}`) === "known").length;
  const started = Object.keys(p.items).length > 0;
  const sk = streak(p);

  const learned = Object.entries(p.items)
    .filter(([id, s]) => s.box >= 2 && READ_ITEM_BY_ID.has(id))
    .sort((a, b) => b[1].lastAt - a[1].lastAt)
    .slice(0, 8)
    .map(([id]) => READ_ITEM_BY_ID.get(id)!);

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-sm text-muted">{started ? "Willkommen zurück" : "Willkommen"}</p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Dein nächster Schritt</h1>
        </div>
        {sk > 0 && <Chip tone="gold"><IconFlame className="size-4" /> {sk} {sk === 1 ? "Tag" : "Tage"}</Chip>}
      </div>

      {lesson ? (
        <Card className="!bg-primary !text-white !border-primary-strong">
          <p className="text-xs font-medium uppercase tracking-wider text-white/70">{unit?.title} · {lesson.minutes} Min.</p>
          <h2 className="mt-2 text-2xl font-semibold leading-snug">{lesson.title}</h2>
          <p className="mt-2 text-[15px] text-white/80"><span className="font-medium text-white">Lernziel:</span> {lesson.goal}</p>
          <ButtonLink href={`/lektion/${lesson.id}`} variant="outline" className="mt-5 w-full !border-white !bg-white !text-primary-strong sm:w-auto" data-testid="continue">
            {started ? "Fortsetzen" : "Lektion starten"} <IconArrow className="size-5" />
          </ButtonLink>
        </Card>
      ) : (
        <Card className="text-center">
          <h2 className="text-xl font-semibold">Stage 1 abgeschlossen 🎉</h2>
          <p className="mt-2 text-muted">Du hast alle Lektionen durchgearbeitet. Wiederhole schwierige Stellen oder lies die Passagen erneut.</p>
          <ButtonLink href="/pfad" className="mt-4">Zum Lernpfad</ButtonLink>
        </Card>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Card>
          <div className="flex items-center gap-5">
            <Ring value={stageFraction(p)} size={96}>{Math.round(stageFraction(p) * 100)} %</Ring>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted">Stage 1 · Lesen lernen</p>
              <p className="mt-1 text-xl font-semibold">{done} von {LESSONS.length} Lektionen</p>
              <Link href="/pfad" className="mt-1 inline-block text-sm text-primary underline-offset-4 hover:underline">Lernpfad ansehen</Link>
            </div>
          </div>
        </Card>
        <Card>
          <p className="text-xs font-medium uppercase tracking-wider text-muted">Tagesziel</p>
          <p className="mt-1 text-xl font-semibold" data-testid="daily">{Math.min(today, goal)} von {goal} Übungen</p>
          <ProgressBar value={today / goal} className="mt-3" label="Tagesziel" />
          <p className="mt-2 text-sm text-muted">{today >= goal ? "Tagesziel erreicht – stark." : `Noch ${goal - today} bis zum Ziel.`}</p>
        </Card>
      </div>

      {due > 0 && (
        <Card className="flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold">{due} {due === 1 ? "Übung" : "Übungen"} zum Wiederholen</p>
            <p className="text-sm text-muted">Kurz auffrischen, was noch nicht sitzt.</p>
          </div>
          <ButtonLink href="/lektion/review" variant="soft" data-testid="review"><IconRepeat className="size-5" /> Wiederholen</ButtonLink>
        </Card>
      )}

      <Card>
        <div className="flex items-baseline justify-between">
          <h2 className="font-semibold">Gelernte Inhalte</h2>
          <Link href="/fortschritt" className="text-sm text-primary underline-offset-4 hover:underline">Details</Link>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-bg p-4"><div className="text-2xl font-semibold">{lettersKnown}<span className="text-base font-normal text-muted"> / 28</span></div><div className="text-sm text-muted">Buchstaben sicher</div></div>
          <div className="rounded-2xl bg-bg p-4"><div className="text-2xl font-semibold">{wordsKnown}<span className="text-base font-normal text-muted"> / {UNIQUE_WORDS.length}</span></div><div className="text-sm text-muted">Quran-Wörter sicher</div></div>
        </div>
        {learned.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2" dir="rtl" aria-label="Zuletzt gelernt">
            {learned.map((i) => <span key={i.id} className="arabic rounded-xl border border-line bg-surface px-3 text-2xl leading-[1.8]">{i.arabic}</span>)}
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted">Hier erscheinen deine gelernten Buchstaben und Wörter, sobald du die ersten Übungen sicher beherrschst.</p>
        )}
      </Card>
    </div>
  );
}
