"use client";
import Link from "next/link";
import { ArabicText } from "@/components/ArabicText";
import { IconArrow, IconTrain } from "@/components/icons";
import { ButtonLink, Card, Chip, PageHeader, ProgressBar } from "@/components/ui";
import { LESSONS } from "@/content/lessons";
import { LETTER_BY_CH } from "@/content/letters";
import { buildPersonalPlan, buildTransfer, flaggedItems } from "@/lib/adaptive";
import { dayKey, isCompleted, isUnlocked, weeklyNew } from "@/lib/progress";
import { READ_ITEM_BY_ID } from "@/lib/review";
import { useProgress } from "@/lib/store";

const SRC = { demo: "Demo-Bewertung", self: "Selbsteinschätzung", live: "Analyse", quiz: "Quiz" } as const;

export default function Lesetraining() {
  const { progress: p, update } = useProgress();
  const plan = buildPersonalPlan(p, 8);
  const flagged = flaggedItems(p);
  const transfer = buildTransfer(p);
  const week = weeklyNew(p);
  const passages = LESSONS.filter((l) => l.unitId === "passagen" && (isCompleted(p, l.id) || isUnlocked(p, l.id)));
  const fails = [...p.history].reverse().filter((h) => !h.ok).slice(0, 14);

  return (
    <div className="space-y-5">
      <PageHeader title="Lesetraining" subtitle="Übe gezielt – nach deinen eigenen Fehlerstellen und mit neuen Wörtern." />

      <Card data-testid="train-personal">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-semibold">Persönliche Übung</h2>
            <p className="mt-1 text-sm text-muted">Automatisch aus fälligen, schwierigen und markierten Stellen zusammengestellt.</p>
          </div>
          <ButtonLink href="/lektion/personal" aria-disabled={!plan.length} className={!plan.length ? "pointer-events-none opacity-45" : ""} data-testid="train-personal-go"><IconTrain className="size-5" /> Starten</ButtonLink>
        </div>
        {plan.length ? (
          <ul className="mt-4 space-y-2">
            {plan.slice(0, 5).map((x) => (
              <li key={x.item.id} className="flex items-center justify-between gap-3 rounded-2xl bg-bg px-4 py-2">
                <ArabicText text={x.item.arabic} size="xs" className="leading-[1.6]" />
                <span className="text-right text-sm text-muted">{x.reasons[0]}</span>
              </li>
            ))}
          </ul>
        ) : <p className="mt-3 text-sm text-muted">Noch nichts auszuwählen – nach deinen ersten Übungen erscheinen hier Vorschläge.</p>}
      </Card>

      <div className="grid gap-5 sm:grid-cols-2">
        <Card>
          <h2 className="font-semibold">Unbekannte Wörter lesen</h2>
          <p className="mt-1 text-sm text-muted">Neue Quran-Wörter aus anderen kurzen Suren – nur mit Buchstaben, die du kennst. So wirst du selbstständig.</p>
          {transfer.lesson ? (
            <>
              <p className="mt-3 text-sm"><Chip tone="primary">{transfer.available} Wörter verfügbar</Chip></p>
              <ButtonLink href="/lektion/transfer" className="mt-4 w-full" data-testid="train-transfer">Neue Wörter lesen <IconArrow className="size-5" /></ButtonLink>
            </>
          ) : <p className="mt-3 rounded-2xl bg-gold-soft p-3 text-sm">{transfer.blocked}</p>}
        </Card>
        <Card>
          <h2 className="font-semibold">Unsichere Stellen</h2>
          <p className="mt-1 text-sm text-muted">Markiere in jeder Übung oben rechts, was dir unsicher vorkommt. Hier übst du es gezielt.</p>
          {flagged.length ? (
            <>
              <div className="mt-3 flex flex-wrap gap-2" dir="rtl">{flagged.slice(0, 8).map((i) => <span key={i.id} className="arabic rounded-xl border border-gold/40 bg-gold-soft px-3 text-2xl leading-[1.8]">{i.arabic}</span>)}</div>
              <ButtonLink href="/lektion/flagged" variant="soft" className="mt-4 w-full">{flagged.length} markierte üben</ButtonLink>
            </>
          ) : <p className="mt-3 text-sm text-muted">Noch nichts markiert.</p>}
        </Card>
      </div>

      <Card data-testid="games">
        <h2 className="font-semibold">Spiele & Tests</h2>
        <p className="mt-1 text-sm text-muted">Andere Wege, dasselbe zu festigen – ohne Mikrofon. Fehlgriffe landen automatisch in deinen persönlichen Übungen.</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {[
            ["memory", "Buchstaben-Memory", "Paare aus Buchstabe und Name oder Form finden."],
            ["quiz", "Misch-Quiz", "Lesen, Schreibweise, Buchstaben, Wörter – gemischt."],
            ["detektiv", "Buchstaben-Detektiv", "Gesuchte Buchstaben im Wort antippen."],
            ["bauen", "Wörter bauen", "Wörter aus Teilen zusammensetzen."],
          ].map(([k, t, d]) => (
            <Link key={k} href={`/spiele/${k}`} data-testid={`game-${k}`} className="rounded-2xl border border-line p-4 transition hover:border-primary/50">
              <p className="font-medium">{t}</p>
              <p className="mt-0.5 text-sm text-muted">{d}</p>
            </Link>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="font-semibold">Mein Lesetrainingsziel</h2>
        <p className="mt-1 text-sm text-muted">Wie viele neue Lese-Einheiten (Buchstaben, Silben, Wörter, Ayat) möchtest du pro Woche erstmals lesen?</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {[10, 20, 40].map((n) => (
            <button key={n} type="button" onClick={() => update((x) => ({ ...x, weeklyGoal: n }))} aria-pressed={p.weeklyGoal === n} className={`rounded-full border px-4 py-1.5 text-sm ${p.weeklyGoal === n ? "border-primary bg-primary-soft text-primary-strong" : "border-line"}`}>{n} pro Woche</button>
          ))}
        </div>
        <div className="mt-4 flex justify-between text-sm"><span>{Math.min(week, p.weeklyGoal)} von {p.weeklyGoal}</span><span className="text-muted">letzte 7 Tage</span></div>
        <ProgressBar value={week / p.weeklyGoal} className="mt-1.5" label="Wochenziel" />
      </Card>

      {passages.length > 0 && (
        <Card>
          <h2 className="font-semibold">Passagen lesen</h2>
          <ul className="mt-3 divide-y divide-line">
            {passages.map((l) => (
              <li key={l.id}><Link href={`/lektion/${l.id}`} className="flex items-center justify-between py-3 text-[15px] hover:text-primary"><span>{l.title}</span><span className="text-sm text-muted">{isCompleted(p, l.id) ? "nochmal lesen" : "starten"}</span></Link></li>
            ))}
          </ul>
        </Card>
      )}

      <Card data-testid="history">
        <h2 className="font-semibold">Fehlerhistorie</h2>
        <p className="mt-1 text-sm text-muted">Die letzten Stellen, die nicht auf Anhieb geklappt haben. Hinweise stammen in dieser Version aus der <strong>Demo-Bewertung</strong> oder deiner Selbsteinschätzung – nicht aus einer echten Ausspracheanalyse.</p>
        {fails.length === 0 ? <p className="mt-3 text-sm text-muted">Noch keine Fehler erfasst. Fehler sind übrigens kein Rückschritt – sie zeigen, was als Nächstes dran ist.</p> : (
          <ul className="mt-3 divide-y divide-line">
            {fails.map((h, i) => {
              const it = READ_ITEM_BY_ID.get(h.id);
              if (!it) return null;
              const d = new Date(h.t);
              return (
                <li key={i} className="flex items-center gap-3 py-2.5">
                  <ArabicText text={it.arabic} size="sm" className="w-24 shrink-0 text-center leading-[1.5]" />
                  <div className="min-w-0 flex-1 text-sm">
                    <p>{h.weak ? `Achte auf ${LETTER_BY_CH.get(h.weak)?.name ?? h.weak}` : "Noch unsicher"}</p>
                    <p className="text-xs text-muted">{d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" })} · {SRC[h.src]}{p.flagged[h.id] ? " · markiert" : ""}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <p className="text-center text-sm"><Link href="/woerter" className="text-primary underline-offset-4 hover:underline">Zur Wortdatenbank →</Link></p>
    </div>
  );
}
void dayKey;
