"use client";
import { RichText } from "@/components/ArabicText";
import Link from "next/link";
import { MissionList } from "@/components/Missions";
import { IconArrow, IconFlame, IconTrain } from "@/components/icons";
import { ButtonLink, Card, Chip, ProgressBar, Ring } from "@/components/ui";
import { LESSONS, LESSON_BY_ID, UNITS } from "@/content/lessons";
import { buildPersonalPlan } from "@/lib/adaptive";
import { competence, competenceLevel, COMPETENCE_LEVELS } from "@/lib/achievements";
import { dailyMissions } from "@/lib/missions";
import { completedCount, currentLessonId, lessonMastery, streak, todayCount, totalXp, weeklyNew } from "@/lib/progress";
import { useProgress } from "@/lib/store";

export default function Home() {
  const { progress: p } = useProgress();
  const cur = currentLessonId(p);
  const lesson = cur ? LESSON_BY_ID.get(cur) : null;
  const unit = lesson ? UNITS.find((u) => u.id === lesson.unitId) : null;
  const today = todayCount(p);
  const goal = p.dailyGoal;
  const started = Object.keys(p.items).length > 0;
  const sk = streak(p);
  const plan = buildPersonalPlan(p, 8);
  const missions = dailyMissions(p);
  const comp = competence(p);
  const level = COMPETENCE_LEVELS[competenceLevel(comp)];
  const week = weeklyNew(p);

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-sm text-muted">{started ? "Willkommen zurück" : "Willkommen"}{p.name ? `, ${p.name}` : ""}</p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Dein nächster Schritt</h1>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <Chip tone={sk > 0 ? "gold" : "neutral"}><IconFlame className="size-4" /> {sk} {sk === 1 ? "Tag" : "Tage"}</Chip>
          <Chip tone="primary">{totalXp(p)} XP</Chip>
        </div>
      </div>

      {lesson ? (
        <Card className="!bg-primary !text-white !border-primary-strong">
          <p className="text-xs font-medium uppercase tracking-wider text-white/70">{unit?.title} · {lesson.minutes} Min.</p>
          <h2 className="mt-2 text-2xl font-semibold leading-snug">{lesson.title}</h2>
          <p className="mt-2 text-[15px] text-white/80"><span className="font-medium text-white">Lernziel:</span> <RichText text={lesson.goal} /></p>
          <ButtonLink href={`/lektion/${lesson.id}`} variant="outline" className="mt-5 w-full !border-white !bg-white !text-primary-strong sm:w-auto" data-testid="continue">
            {started ? "Fortsetzen" : "Lektion starten"} <IconArrow className="size-5" />
          </ButtonLink>
        </Card>
      ) : (
        <Card className="text-center">
          <h2 className="text-xl font-semibold">Stage 1 abgeschlossen</h2>
          <p className="mt-2 text-muted">Du hast alle Lektionen durchgearbeitet. Festige schwierige Stellen oder lies neue Wörter im Lesetraining.</p>
          <ButtonLink href="/training" className="mt-4">Zum Lesetraining</ButtonLink>
        </Card>
      )}

      <Card data-testid="personal-card">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted">Persönliche Übung</p>
            {plan.length ? (
              <>
                <p className="mt-1 text-lg font-semibold">{plan.length} {plan.length === 1 ? "Übung" : "Übungen"} für dich</p>
                <p className="mt-0.5 text-sm text-muted">{plan[0].reasons[0]}{plan.length > 1 ? ` · ${plan[1].reasons[0]}` : ""}</p>
              </>
            ) : (
              <p className="mt-1 text-[15px] text-muted">Nach deinen ersten Lektionen stellt die App hier Übungen für deine Fehlerstellen zusammen.</p>
            )}
          </div>
          {plan.length > 0 && <ButtonLink href="/lektion/personal" variant="soft" data-testid="personal"><IconTrain className="size-5" /> Üben</ButtonLink>}
        </div>
        {plan.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2" dir="rtl">
            {plan.slice(0, 6).map((x) => <span key={x.item.id} className="arabic rounded-xl border border-line px-3 text-2xl leading-[1.8]">{x.item.arabic}</span>)}
          </div>
        )}
      </Card>

      <div className="grid gap-5 sm:grid-cols-2">
        <Card>
          <div className="mb-4 flex items-center gap-4">
            <Ring value={today / goal} size={72}>{Math.min(today, goal)}/{goal}</Ring>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted">Heute</p>
              <p className="text-lg font-semibold" data-testid="daily">{today >= goal ? "Tagesziel erreicht" : `Noch ${goal - today} Übungen`}</p>
            </div>
          </div>
          <MissionList missions={missions} />
        </Card>
        <div className="space-y-5">
          <Card>
            <p className="text-xs font-medium uppercase tracking-wider text-muted">Dein Lesetrainingsziel</p>
            <p className="mt-1 text-lg font-semibold">{Math.min(week, p.weeklyGoal)} von {p.weeklyGoal} neuen Lese-Einheiten</p>
            <ProgressBar value={week / p.weeklyGoal} className="mt-3" label="Wochenziel" />
            <p className="mt-2 text-sm text-muted">in den letzten 7 Tagen erstmals gelesen</p>
          </Card>
          <Card>
            <p className="text-xs font-medium uppercase tracking-wider text-muted">Kompetenz</p>
            <p className="mt-1 text-lg font-semibold">{level.title}</p>
            <p className="mt-0.5 text-sm text-muted">{comp.letters}/28 Buchstaben · {comp.syllables} Silben · {comp.words} Wörter sicher</p>
            <div className="mt-3 flex items-center justify-between text-sm"><span className="text-muted">Stage 1: {completedCount(p)}/{LESSONS.length} Lektionen</span><Link href="/erfolge" className="text-primary underline-offset-4 hover:underline">Erfolge</Link></div>
            <ProgressBar value={completedCount(p) / LESSONS.length} className="mt-2" label="Stage 1" />
          </Card>
        </div>
      </div>
    </div>
  );
}
