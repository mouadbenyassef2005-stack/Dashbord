"use client";
import { IconArrow, IconBook, IconTrain } from "@/components/icons";
import { ButtonLink, Card } from "@/components/ui";
import { UNITS } from "@/lektion/content/units";
import { activeConfusions, dueEntries, PHASE_COUNT, pk } from "@/lektion/domain/lektion/state";
import { Ar } from "@/lektion/ui/parts";
import { useState } from "react";
import { CompetenceBoard } from "./Board";
import { useLesson } from "./LessonContext";

export function Start() {
  const { s } = useLesson();
  const [now] = useState(() => Date.now());
  const started = Object.keys(s.phaseDone).length > 0 || Object.keys(s.srs).length > 0;
  const cur = UNITS.find((u) => u.id === s.unit)!;
  const phasesDone = Array.from({ length: PHASE_COUNT }, (_, i) => i + 1).filter((p) => s.phaseDone[pk(cur.id, p)]).length;
  const due = dueEntries(s.srs, now).length;
  const conf = activeConfusions(s).length;
  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">{started ? "Schön, dass du wieder da bist" : "Willkommen bei Qaidah"}</p>
        <h1 className="mt-2 text-[2rem] font-semibold leading-tight tracking-[-0.04em] sm:text-[2.6rem]">Arabisch lesen lernen<span className="text-primary">.</span></h1>
        <p className="mt-2 max-w-xl text-[15px] text-muted">In vier kurzen Einheiten von der ersten Form bis zum ersten Wort. Du kommst erst weiter, wenn es sitzt, und bekommst gezielte Hilfe, wenn nicht.</p>
      </div>
      <section className="rounded-[2rem] bg-gradient-to-br from-[#154b41] via-primary-strong to-[#24725d] p-6 text-white shadow-card sm:p-9" aria-labelledby="l1">
        <div className="grid gap-6 sm:grid-cols-[1fr_auto] sm:items-center">
          <div className="max-w-xl">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-white/75">Einheit {cur.id} von 4 · ca. {cur.minutes} Minuten</p>
            <h2 id="l1" className="mt-3 text-3xl font-semibold leading-tight tracking-[-0.03em] sm:text-4xl">{cur.short}</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-white/85">{cur.goal}</p>
            <p className="mt-3 text-sm text-white/75">{phasesDone} von {PHASE_COUNT} Phasen dieser Einheit bearbeitet</p>
            <ButtonLink href="/lektion" className="mt-6 min-h-12 !bg-white !text-primary-strong hover:!bg-[#eff7f0]">{started ? "Weiterlernen" : "Einheit 1 starten"} <IconArrow className="size-5" /></ButtonLink>
          </div>
          <div className="flex gap-3 text-5xl text-white/90" aria-hidden>{["ا", "ب", "ت", "ث"].map((c) => <Ar key={c} size="teach">{c}</Ar>)}</div>
        </div>
      </section>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <span className="grid size-11 place-items-center rounded-2xl bg-primary-soft text-primary"><IconBook className="size-5" /></span>
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-primary">Aufbau</p>
          <p className="mt-1 text-lg font-semibold tracking-tight">Vier Einheiten, jeweils sieben Phasen</p>
          <ol className="mt-2 list-decimal pl-5 text-sm leading-relaxed text-muted">{UNITS.map((u) => <li key={u.id}>{u.short}</li>)}</ol>
        </Card>
        <Card>
          <span className="grid size-11 place-items-center rounded-2xl bg-gold-soft text-gold"><IconTrain className="size-5" /></span>
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-gold">Üben</p>
          <p className="mt-1 text-lg font-semibold tracking-tight">{due > 0 ? `${due} Wiederholungen fällig` : "Wiederholen nach Plan"}</p>
          <p className="mt-1 text-sm leading-relaxed text-muted">{conf > 0 ? `${conf} Verwechslung${conf > 1 ? "en" : ""} erkannt: gezielte Vergleichsübung wartet.` : "Fällige Kompetenzen, Vergleichsübungen und freie Übung."}</p>
          <ButtonLink href="/ueben" variant="soft" className="mt-5">Zu „Üben“ <IconArrow className="size-4" /></ButtonLink>
        </Card>
      </div>
      {Object.keys(s.log).length > 0 && <div className="qd"><CompetenceBoard /></div>}
    </div>
  );
}
