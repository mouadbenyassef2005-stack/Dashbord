"use client";
import Link from "next/link";
import { Card, Chip, PageHeader, ProgressBar, Ring, ButtonLink, cx } from "@/components/ui";
import { LETTERS, LETTER_BY_CH } from "@/content/letters";
import { LESSONS, UNITS, unitLessons } from "@/content/lessons";
import { UNIQUE_WORDS } from "@/content/quran";
import { completedCount, dayKey, dueItemIds, errorRate, isCompleted, stageFraction, statusOf, streak, topErrors } from "@/lib/progress";
import { READ_ITEM_BY_ID } from "@/lib/review";
import { useProgress } from "@/lib/store";

const tone = { new: "bg-bg text-muted border-line", learning: "bg-gold-soft text-gold border-gold/30", known: "bg-ok-soft text-ok border-ok/30" } as const;

export default function Fortschritt() {
  const { progress: p } = useProgress();
  const due = dueItemIds(p).filter((id) => READ_ITEM_BY_ID.has(id));
  const wordStatus = { known: 0, learning: 0, new: 0 };
  UNIQUE_WORDS.forEach((w) => wordStatus[statusOf(p, `w:${w.id}`)]++);
  const errs = topErrors(p);
  const maxErr = Math.max(1, ...errs.map((e) => e[1]));
  const days = Array.from({ length: 7 }, (_, i) => {
    const t = Date.now() - (6 - i) * 86400000;
    return { label: new Date(t).toLocaleDateString("de-DE", { weekday: "short" }), n: p.activity[dayKey(t)] ?? 0 };
  });
  const maxDay = Math.max(p.dailyGoal, ...days.map((d) => d.n));
  const rate = errorRate(p);

  return (
    <div className="space-y-5">
      <PageHeader title="Fortschritt" subtitle="Was du kannst – und was noch Übung braucht." />

      <div className="grid gap-5 sm:grid-cols-3">
        <Card className="flex items-center gap-4"><Ring value={stageFraction(p)} size={80}>{Math.round(stageFraction(p) * 100)}%</Ring><div><p className="text-xs uppercase tracking-wider text-muted">Stage 1</p><p className="font-semibold">{completedCount(p)}/{LESSONS.length} Lektionen</p></div></Card>
        <Card><p className="text-xs uppercase tracking-wider text-muted">Fehlerquote</p><p className="mt-1 text-2xl font-semibold">{Math.round(rate * 100)} %</p><p className="text-sm text-muted">aller Versuche (Demo-Bewertung)</p></Card>
        <Card><p className="text-xs uppercase tracking-wider text-muted">Serie</p><p className="mt-1 text-2xl font-semibold">{streak(p)} {streak(p) === 1 ? "Tag" : "Tage"}</p><p className="text-sm text-muted">in Folge geübt</p></Card>
      </div>

      <Card>
        <h2 className="font-semibold">Letzte 7 Tage</h2>
        <div className="mt-4 flex h-28 items-end gap-2" role="img" aria-label="Übungen der letzten 7 Tage">
          {days.map((d, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-1">
              <div className="flex h-20 w-full items-end"><div className={cx("w-full rounded-t-lg", d.n >= p.dailyGoal ? "bg-ok" : "bg-primary/70")} style={{ height: `${(d.n / maxDay) * 100}%`, minHeight: d.n ? 4 : 2 }} title={`${d.n} Übungen`} /></div>
              <span className="text-xs text-muted">{d.label}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="font-semibold">Abgeschlossene Lektionen</h2>
        <div className="mt-4 space-y-4">
          {UNITS.map((u) => {
            const ls = unitLessons(u.id);
            const n = ls.filter((l) => isCompleted(p, l.id)).length;
            return (
              <div key={u.id}>
                <div className="mb-1.5 flex justify-between text-sm"><span>{u.title}</span><span className="text-muted tabular-nums">{n}/{ls.length}</span></div>
                <ProgressBar value={n / ls.length} label={u.title} />
              </div>
            );
          })}
        </div>
      </Card>

      <Card>
        <div className="flex items-baseline justify-between"><h2 className="font-semibold">Gelernte Buchstaben</h2><span className="text-sm text-muted">{LETTERS.filter((l) => statusOf(p, `l:${l.ch}`) === "known").length}/28 sicher</span></div>
        <div className="mt-4 grid grid-cols-7 gap-2" dir="rtl">
          {LETTERS.map((l) => (
            <div key={l.ch} title={`${l.name}: ${statusOf(p, `l:${l.ch}`)}`} className={cx("arabic grid aspect-square place-items-center rounded-xl border text-3xl leading-none", tone[statusOf(p, `l:${l.ch}`)])}>{l.ch}</div>
          ))}
        </div>
        <Legend />
      </Card>

      <Card>
        <div className="flex items-baseline justify-between"><h2 className="font-semibold">Gelernte Quran-Wörter</h2><Link href="/woerter" className="text-sm text-primary underline-offset-4 hover:underline">Wortdatenbank</Link></div>
        <div className="mt-3 grid grid-cols-3 gap-3 text-center">
          <div className="rounded-2xl bg-ok-soft p-3"><div className="text-xl font-semibold text-ok">{wordStatus.known}</div><div className="text-xs text-muted">sicher</div></div>
          <div className="rounded-2xl bg-gold-soft p-3"><div className="text-xl font-semibold text-gold">{wordStatus.learning}</div><div className="text-xs text-muted">in Übung</div></div>
          <div className="rounded-2xl bg-bg p-3"><div className="text-xl font-semibold">{wordStatus.new}</div><div className="text-xs text-muted">neu</div></div>
        </div>
      </Card>

      <div className="grid gap-5 sm:grid-cols-2">
        <Card>
          <h2 className="font-semibold">Häufigste Fehlerstellen</h2>
          {errs.length === 0 ? <p className="mt-3 text-sm text-muted">Noch keine Fehler erfasst.</p> : (
            <ul className="mt-3 space-y-3">
              {errs.map(([k, n]) => (
                <li key={k} className="flex items-center gap-3">
                  <span className="arabic w-9 text-center text-3xl leading-none" dir="rtl">{k}</span>
                  <div className="flex-1"><div className="mb-1 text-xs text-muted">{LETTER_BY_CH.get(k)?.name ?? "Zeichen"} · {n}×</div><div className="h-2 rounded-full bg-ink/8"><div className="h-full rounded-full bg-warn" style={{ width: `${(n / maxErr) * 100}%` }} /></div></div>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card>
          <h2 className="font-semibold">Wiederholungsbedarf</h2>
          {due.length === 0 ? <p className="mt-3 text-sm text-muted">Aktuell ist nichts fällig.</p> : (
            <>
              <p className="mt-1 text-sm text-muted">{due.length} Übungen sind fällig oder waren zuletzt schwierig.</p>
              <div className="mt-3 flex flex-wrap gap-2" dir="rtl">{due.slice(0, 10).map((id) => <span key={id} className="arabic rounded-xl border border-line px-3 text-2xl leading-[1.8]">{READ_ITEM_BY_ID.get(id)!.arabic}</span>)}</div>
              <ButtonLink href="/lektion/review" className="mt-4 w-full">Jetzt wiederholen</ButtonLink>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

function Legend() {
  return <div className="mt-3 flex gap-2 text-xs"><Chip tone="ok">sicher</Chip><Chip tone="gold">in Übung</Chip><Chip>neu</Chip></div>;
}
