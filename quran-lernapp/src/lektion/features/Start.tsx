"use client";
import { IconArrow, IconBook, IconTrain } from "@/components/icons";
import { ButtonLink, Card, ProgressBar } from "@/components/ui";
import { PHASES } from "@/lektion/domain/lektion/state";
import { Ar } from "@/lektion/ui/parts";
import { useLesson } from "./LessonContext";

export function Start() {
  const { s } = useLesson();
  const done = s.done.length;
  const next = PHASES[Math.min(s.unlocked, PHASES.length) - 1];
  const finished = done === PHASES.length;
  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">{done === 0 ? "Willkommen bei Qaidah" : "Schön, dass du wieder da bist"}</p>
        <h1 className="mt-2 text-[2rem] font-semibold leading-tight tracking-[-0.04em] sm:text-[2.6rem]">Arabisch lesen lernen<span className="text-primary">.</span></h1>
        <p className="mt-2 max-w-xl text-[15px] text-muted">Schritt für Schritt, in sieben Lernphasen: von der Orientierung bis zur Wiederholung, die das Gelernte festigt.</p>
      </div>
      <section className="rounded-[2rem] bg-gradient-to-br from-[#154b41] via-primary-strong to-[#24725d] p-6 text-white shadow-card sm:p-9" aria-labelledby="l1">
        <div className="grid gap-6 sm:grid-cols-[1fr_auto] sm:items-center">
          <div className="max-w-xl">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-white/70">Lektion 1 · ca. 45 Minuten</p>
            <h2 id="l1" className="mt-3 text-3xl font-semibold leading-tight tracking-[-0.03em] sm:text-4xl">Alif, Bā, Tā, Thā</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-white/80">Vier Buchstaben, drei Vokalzeichen, erste echte Wörter. {finished ? "Du hast alle Phasen abgeschlossen." : `Nächste Phase: ${next.title}.`}</p>
            <ProgressBar value={done / PHASES.length} className="mt-5 !bg-white/15 [&>div]:!bg-[#b2d8af]" label="Lektionsfortschritt" />
            <p className="mt-2 text-xs text-white/70">{done} von {PHASES.length} Phasen abgeschlossen</p>
            <ButtonLink href="/lektion" className="mt-6 min-h-12 !bg-white !text-primary-strong hover:!bg-[#eff7f0]">{done === 0 ? "Lektion starten" : finished ? "Lektion wiederholen" : "Weiterlernen"} <IconArrow className="size-5" /></ButtonLink>
          </div>
          <div className="flex gap-3 text-5xl text-white/90" aria-hidden>{["ا", "ب", "ت", "ث"].map((c) => <Ar key={c} size="teach">{c}</Ar>)}</div>
        </div>
      </section>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <span className="grid size-11 place-items-center rounded-2xl bg-primary-soft text-primary"><IconBook className="size-5" /></span>
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-primary">Aufbau</p>
          <p className="mt-1 text-lg font-semibold tracking-tight">Sieben Phasen</p>
          <p className="mt-1 text-sm leading-relaxed text-muted">{PHASES.map((p) => p.title).join(" · ")}</p>
        </Card>
        <Card>
          <span className="grid size-11 place-items-center rounded-2xl bg-gold-soft text-gold"><IconTrain className="size-5" /></span>
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-gold">Üben</p>
          <p className="mt-1 text-lg font-semibold tracking-tight">Gemischte Übung</p>
          <p className="mt-1 text-sm leading-relaxed text-muted">Nach Phase 4 gibt es eine freie Übung zu allem, was du gelernt hast.</p>
          <ButtonLink href="/ueben" variant="soft" className="mt-5">Zu „Üben“ <IconArrow className="size-4" /></ButtonLink>
        </Card>
      </div>
    </div>
  );
}
