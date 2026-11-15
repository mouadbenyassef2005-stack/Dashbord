"use client";
import { IconCheck } from "@/components/icons";
import { Card, Chip, PageHeader, ProgressBar, cx } from "@/components/ui";
import { achievements, competence, competenceLevel, COMPETENCE_LEVELS } from "@/lib/achievements";
import { dayKey, longestStreak, streak, totalXp } from "@/lib/progress";
import { useProgress } from "@/lib/store";

export default function Erfolge() {
  const { progress: p } = useProgress();
  const comp = competence(p);
  const lvl = competenceLevel(comp);
  const list = achievements(p);
  const done = list.filter((a) => a.done).length;
  const days = Array.from({ length: 7 }, (_, i) => {
    const t = Date.now() - (6 - i) * 86400000;
    return { label: new Date(t).toLocaleDateString("de-DE", { weekday: "short" }), n: p.activity[dayKey(t)] ?? 0 };
  });
  const maxDay = Math.max(p.dailyGoal, ...days.map((d) => d.n));

  return (
    <div className="space-y-5">
      <PageHeader title="Erfolge" subtitle={`${done} von ${list.length} freigeschaltet`} />

      <div className="grid grid-cols-3 gap-3 sm:gap-5">
        <Card className="!p-4"><p className="text-xs uppercase tracking-wider text-muted">Serie</p><p className="mt-1 text-xl font-semibold">{streak(p)} {streak(p) === 1 ? "Tag" : "Tage"}</p><p className="text-sm text-muted">Rekord: {longestStreak(p)}</p></Card>
        <Card className="!p-4"><p className="text-xs uppercase tracking-wider text-muted">XP</p><p className="mt-1 text-xl font-semibold">{totalXp(p)}</p><p className="text-sm text-muted">Übungsfleiß, nicht Können</p></Card>
        <Card className="!p-4"><p className="text-xs uppercase tracking-wider text-muted">Lesestufe</p><p className="mt-1 text-xl font-semibold" data-testid="level">{COMPETENCE_LEVELS[lvl].title}</p><p className="text-sm text-muted">aus sicherem Können</p></Card>
      </div>

      <Card>
        <h2 className="font-semibold">Deine Kompetenz</h2>
        <p className="mt-1 text-sm text-muted">Die Lesestufe steigt nur, wenn Inhalte wirklich sicher sitzen (mehrfach richtig, auch nach Pausen) – nicht durch bloßes Durchklicken.</p>
        <ol className="mt-4 space-y-2">
          {COMPETENCE_LEVELS.map((l) => (
            <li key={l.id} className={cx("flex items-center gap-3 rounded-2xl border px-4 py-2.5", l.id === lvl ? "border-primary bg-primary-soft/50" : "border-line")}>
              <span className={cx("grid size-6 place-items-center rounded-full text-xs font-semibold", l.id <= lvl ? "bg-primary text-white" : "bg-ink/8 text-muted")}>{l.id <= lvl ? <IconCheck className="size-3.5" /> : l.id}</span>
              <div><p className="text-[15px] font-medium">{l.title}</p><p className="text-xs text-muted">{l.need}</p></div>
              {l.id === lvl && <Chip tone="primary" className="ml-auto">aktuell</Chip>}
            </li>
          ))}
        </ol>
        <div className="mt-4 grid grid-cols-4 gap-2 text-center text-sm">
          {[["Buchstaben", comp.letters], ["Silben", comp.syllables], ["Wörter", comp.words], ["Ayat", comp.ayat]].map(([k, v]) => (
            <div key={k as string} className="rounded-2xl bg-bg p-3"><div className="text-xl font-semibold">{v}</div><div className="text-xs text-muted">{k} sicher</div></div>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="font-semibold">Abzeichen</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2" data-testid="badges">
          {list.map((a) => (
            <li key={a.id} className={cx("rounded-2xl border p-4", a.done ? "border-gold/40 bg-gold-soft" : "border-line")}>
              <div className="flex items-center justify-between gap-2"><p className="font-medium">{a.title}</p>{a.done && <Chip tone="gold">erreicht</Chip>}</div>
              <p className="mt-0.5 text-sm text-muted">{a.desc}</p>
              <ProgressBar value={a.progress / a.target} className="mt-3" label={a.title} />
              <p className="mt-1 text-xs tabular-nums text-muted">{a.progress}/{a.target}</p>
            </li>
          ))}
        </ul>
      </Card>

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
        <p className="mt-2 text-xs text-muted">Grün = Tagesziel erreicht.</p>
      </Card>
    </div>
  );
}
