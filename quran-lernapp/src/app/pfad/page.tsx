"use client";
import Link from "next/link";
import { useState } from "react";
import { IconCheck, IconLock } from "@/components/icons";
import { Card, Chip, PageHeader, cx } from "@/components/ui";
import { FUTURE_STAGES, LESSONS, UNITS, unitLessons } from "@/content/lessons";
import { completedCount, currentLessonId, isCompleted, isUnlocked } from "@/lib/progress";
import { useProgress } from "@/lib/store";

export default function Pfad() {
  const { progress: p } = useProgress();
  const cur = currentLessonId(p);
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Lernpfad" subtitle={`Stage 1 · Lesen lernen — ${completedCount(p)} von ${LESSONS.length} Lektionen`} />
      {msg && <div role="status" className="mb-4 rounded-2xl bg-gold-soft p-3 text-sm">{msg}</div>}

      <ol className="space-y-9">
        {UNITS.map((u, ui) => {
          const ls = unitLessons(u.id);
          const doneInUnit = ls.filter((l) => isCompleted(p, l.id)).length;
          return (
            <li key={u.id}>
              <div className="mb-3 flex items-baseline justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary">Einheit {ui + 1}</p>
                  <h2 className="text-lg font-semibold">{u.title}</h2>
                  <p className="text-sm text-muted">{u.summary}</p>
                </div>
                <Chip tone={doneInUnit === ls.length ? "ok" : "neutral"}>{doneInUnit}/{ls.length}</Chip>
              </div>
              <ul className="relative ml-5 space-y-3 border-l-2 border-line pl-7">
                {ls.map((l) => {
                  const done = isCompleted(p, l.id);
                  const open = isUnlocked(p, l.id);
                  const isCur = l.id === cur;
                  const prev = LESSONS[LESSONS.findIndex((x) => x.id === l.id) - 1];
                  const inner = (
                    <>
                      <span className={cx("absolute -left-[46px] top-4 grid size-8 place-items-center rounded-full border-2 text-xs font-semibold", done ? "border-ok bg-ok text-white" : isCur ? "border-primary bg-primary text-white" : open ? "border-primary/40 bg-surface text-primary" : "border-line bg-bg text-muted")}>
                        {done ? <IconCheck className="size-4" /> : open ? l.id : <IconLock className="size-4" />}
                        {isCur && <span className="pulse-ring absolute inset-0 -z-10 rounded-full !bg-primary/40" aria-hidden />}
                      </span>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className={cx("font-medium", !open && "text-muted")}>{l.title}</p>
                          <p className="mt-0.5 text-sm text-muted">{l.goal}</p>
                        </div>
                        <span className="shrink-0 text-xs text-muted">{l.minutes} Min.</span>
                      </div>
                      {isCur && <Chip tone="primary" className="mt-2">Nächster Schritt</Chip>}
                      {done && <p className="mt-2 text-xs text-ok">Abgeschlossen · {Math.round((p.lessons[l.id]?.bestAccuracy ?? 0) * 100)} % beim ersten Versuch</p>}
                    </>
                  );
                  const cls = cx("relative block w-full rounded-2xl border p-4 text-left transition", isCur ? "border-primary bg-primary-soft/50 shadow-card" : "border-line bg-surface", open ? "hover:border-primary/50" : "opacity-70");
                  return (
                    <li key={l.id}>
                      {open ? (
                        <Link href={`/lektion/${l.id}`} className={cls} data-testid={`lesson-${l.id}`}>{inner}</Link>
                      ) : (
                        <button type="button" className={cls} onClick={() => setMsg(`Schließe zuerst „${prev.title}“ ab, um diese Lektion freizuschalten.`)} data-testid={`lesson-${l.id}`} aria-disabled>
                          {inner}
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            </li>
          );
        })}
      </ol>

      <h2 className="mb-3 mt-12 text-sm font-semibold uppercase tracking-wider text-muted">Geplante Stufen</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {FUTURE_STAGES.map((s) => (
          <Card key={s.stage} className="!bg-transparent !shadow-none border-dashed opacity-80">
            <div className="flex items-center justify-between"><p className="font-semibold">Stage {s.stage}: {s.title}</p><Chip>In Planung</Chip></div>
            <p className="mt-1 text-sm text-muted">{s.summary}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
