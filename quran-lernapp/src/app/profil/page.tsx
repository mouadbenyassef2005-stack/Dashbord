"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Card, Chip, PageHeader, ProgressBar, Ring, cx } from "@/components/ui";
import { LETTERS, LETTER_BY_CH } from "@/content/letters";
import { LESSON_BY_ID, LESSONS, UNITS, unitLessons } from "@/content/lessons";
import { QURAN_SOURCE_INFO } from "@/content/quran";
import { competence, competenceLevel, COMPETENCE_LEVELS } from "@/lib/achievements";
import { completedCount, errorRate, isCompleted, lessonMastery, stageFraction, statusOf, topErrors, totalXp } from "@/lib/progress";
import { resetProgress, useProgress } from "@/lib/store";

const tone = { new: "bg-bg text-muted border-line", learning: "bg-gold-soft text-gold border-gold/30", known: "bg-ok-soft text-ok border-ok/30" } as const;

function Toggle({ on, onChange, label, desc, id }: { on: boolean; onChange: (v: boolean) => void; label: string; desc?: string; id: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div><label htmlFor={id} className="font-medium">{label}</label>{desc && <p className="text-sm text-muted">{desc}</p>}</div>
      <button id={id} type="button" role="switch" aria-checked={on} onClick={() => onChange(!on)} className={cx("relative h-7 w-12 shrink-0 rounded-full transition", on ? "bg-primary" : "bg-ink/20")}>
        <span className={cx("absolute top-0.5 size-6 rounded-full bg-white shadow transition-all", on ? "left-[22px]" : "left-0.5")} />
      </button>
    </div>
  );
}

export default function Profil() {
  const { progress: p, update } = useProgress();
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  const comp = competence(p);
  const errs = topErrors(p);
  const maxErr = Math.max(1, ...errs.map((e) => e[1]));
  const start = LESSON_BY_ID.get(p.startLessonId);

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <PageHeader title="Profil" />

      <Card>
        <div className="flex items-center gap-5">
          <Ring value={stageFraction(p)} size={84}>{Math.round(stageFraction(p) * 100)}%</Ring>
          <div className="min-w-0 flex-1">
            <label htmlFor="name" className="text-xs uppercase tracking-wider text-muted">Dein Name (optional)</label>
            <input id="name" value={p.name} maxLength={24} onChange={(e) => update((x) => ({ ...x, name: e.target.value }))} placeholder="Name" className="mt-1 w-full rounded-xl border border-line bg-bg px-3 py-2 outline-none focus:border-primary" />
            <p className="mt-2 text-sm text-muted">{COMPETENCE_LEVELS[competenceLevel(comp)].title} · {totalXp(p)} XP · Start: {start?.title}</p>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="font-semibold">Meine Ziele</h2>
        <div className="mt-3 space-y-4">
          <div>
            <p className="text-sm font-medium">Tagesziel</p>
            <div className="mt-2 flex flex-wrap gap-2">{[5, 10, 20].map((n) => <button key={n} type="button" aria-pressed={p.dailyGoal === n} onClick={() => update((x) => ({ ...x, dailyGoal: n }))} className={cx("rounded-full border px-4 py-1.5 text-sm", p.dailyGoal === n ? "border-primary bg-primary-soft text-primary-strong" : "border-line")}>{n} Übungen</button>)}</div>
          </div>
          <div>
            <p className="text-sm font-medium">Lesetrainingsziel pro Woche</p>
            <div className="mt-2 flex flex-wrap gap-2">{[10, 20, 40].map((n) => <button key={n} type="button" aria-pressed={p.weeklyGoal === n} onClick={() => update((x) => ({ ...x, weeklyGoal: n }))} className={cx("rounded-full border px-4 py-1.5 text-sm", p.weeklyGoal === n ? "border-primary bg-primary-soft text-primary-strong" : "border-line")}>{n} neue Einheiten</button>)}</div>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="font-semibold">Lernstand</h2>
        <p className="mt-1 text-sm text-muted">{completedCount(p)} von {LESSONS.length} Lektionen abgeschlossen · Fehlerquote {Math.round(errorRate(p) * 100)} %</p>
        <div className="mt-4 space-y-4">
          {UNITS.map((u) => {
            const ls = unitLessons(u.id);
            const n = ls.filter((l) => isCompleted(p, l.id)).length;
            const sure = ls.length ? ls.reduce((s, l) => s + lessonMastery(p, l.id), 0) / ls.length : 0;
            return (
              <div key={u.id}>
                <div className="mb-1.5 flex justify-between text-sm"><span>{u.title}</span><span className="text-muted tabular-nums">{n}/{ls.length} · {Math.round(sure * 100)} % sicher</span></div>
                <ProgressBar value={n / ls.length} label={u.title} />
              </div>
            );
          })}
        </div>
        <h3 className="mb-2 mt-6 text-sm font-semibold">Buchstaben</h3>
        <div className="grid grid-cols-7 gap-2" dir="rtl">
          {LETTERS.map((l) => (
            <div key={l.ch} title={`${l.name}: ${statusOf(p, `l:${l.ch}`)}`} className={cx("arabic grid aspect-square place-items-center rounded-xl border text-3xl leading-none", tone[statusOf(p, `l:${l.ch}`)])}>{l.ch}</div>
          ))}
        </div>
        <div className="mt-3 flex gap-2 text-xs"><Chip tone="ok">sicher</Chip><Chip tone="gold">in Übung</Chip><Chip>neu</Chip></div>
        <h3 className="mb-2 mt-6 text-sm font-semibold">Häufigste Fehlerstellen</h3>
        {errs.length === 0 ? <p className="text-sm text-muted">Noch keine Fehler erfasst.</p> : (
          <ul className="space-y-3">
            {errs.map(([k, n]) => (
              <li key={k} className="flex items-center gap-3">
                <span className="arabic w-9 text-center text-3xl leading-none" dir="rtl">{k}</span>
                <div className="flex-1"><div className="mb-1 text-xs text-muted">{LETTER_BY_CH.get(k)?.name ?? "Zeichen"} · {n}×</div><div className="h-2 rounded-full bg-ink/8"><div className="h-full rounded-full bg-warn" style={{ width: `${(n / maxErr) * 100}%` }} /></div></div>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-4 text-sm"><Link href="/training" className="text-primary underline-offset-4 hover:underline">Fehlerhistorie & persönliche Übungen →</Link></p>
      </Card>

      <Card className="divide-y divide-line !py-2">
        <Toggle id="hint" on={p.settings.showHint} onChange={(v) => update((x) => ({ ...x, settings: { ...x.settings, showHint: v } }))} label="Lautschrift anzeigen" desc="Transliteration als optionale Lernhilfe unter dem arabischen Text." />
        <Toggle id="mic" on={p.micConsent} onChange={(v) => update((x) => ({ ...x, micConsent: v }))} label="Mikrofon-Einwilligung" desc="Aus: Vor der nächsten Aufnahme wirst du erneut gefragt." />
        <Toggle id="unlock" on={p.settings.unlockAll} onChange={(v) => update((x) => ({ ...x, settings: { ...x.settings, unlockAll: v } }))} label="Alle Lektionen freischalten" desc="Frei springen, ohne dass etwas gesperrt ist." />
      </Card>

      <Card>
        <h2 className="font-semibold">Was ist echt, was ist Demo?</h2>
        <ul className="mt-2 space-y-2 text-sm text-ink/80">
          <li>• <strong>Sprachfeedback: simuliert.</strong> Es findet keine echte Ausspracheanalyse statt. Geprüft wird nur, ob überhaupt gesprochen wurde. Alle Demo-Ergebnisse sind markiert.</li>
          <li>• <strong>Referenz-Audio:</strong> noch nicht aufgenommen. Der Ton beim „Anhören“ ist ein Platzhalter. Es gibt keine KI-Stimme für Quran-Text; geplant sind geprüfte menschliche Aufnahmen.</li>
          <li>• <strong>Fortschritt/Kompetenz:</strong> wird aus deinen tatsächlichen Versuchen berechnet (wiederholtes sicheres Lesen). Ab einer echten Analyse fließen deren Ergebnisse unverändert ein.</li>
          <li>• Aufnahmen bleiben im Browser. Dein Lernstand liegt im lokalen Speicher dieses Browsers.</li>
          <li>• Quran-Text: {QURAN_SOURCE_INFO.arabic}; Lizenz {QURAN_SOURCE_INFO.license}. {QURAN_SOURCE_INFO.note}</li>
        </ul>
      </Card>

      <Card>
        <h2 className="font-semibold">Einstufung & Daten</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => { update((x) => ({ ...x, onboarded: false })); router.push("/onboarding"); }}>Einstufungstest wiederholen</Button>
          {!confirm ? <Button variant="danger" onClick={() => setConfirm(true)}>Fortschritt löschen …</Button> : (
            <>
              <Button variant="danger" onClick={() => { resetProgress(); router.replace("/onboarding"); }} data-testid="reset-confirm">Ja, endgültig löschen</Button>
              <Button variant="ghost" onClick={() => setConfirm(false)}>Abbrechen</Button>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
