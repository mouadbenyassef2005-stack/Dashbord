"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Card, PageHeader, cx } from "@/components/ui";
import { QURAN_SOURCE_INFO } from "@/content/quran";
import { resetProgress, useProgress } from "@/lib/store";

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

export default function Einstellungen() {
  const { progress: p, update } = useProgress();
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <PageHeader title="Einstellungen" />
      <Card className="divide-y divide-line !py-2">
        <Toggle id="hint" on={p.settings.showHint} onChange={(v) => update((x) => ({ ...x, settings: { ...x.settings, showHint: v } }))} label="Lautschrift anzeigen" desc="Transliteration als optionale Lernhilfe unter dem arabischen Text." />
        <Toggle id="mic" on={p.micConsent} onChange={(v) => update((x) => ({ ...x, micConsent: v }))} label="Mikrofon-Einwilligung" desc="Aus: Vor der nächsten Aufnahme wirst du erneut gefragt." />
        <Toggle id="unlock" on={p.settings.unlockAll} onChange={(v) => update((x) => ({ ...x, settings: { ...x.settings, unlockAll: v } }))} label="Alle Lektionen freischalten" desc="Testmodus: springe frei durch den Lernpfad." />
        <div className="py-3">
          <p className="font-medium">Tagesziel</p>
          <div className="mt-2 flex gap-2">{[5, 10, 20].map((n) => <button key={n} type="button" onClick={() => update((x) => ({ ...x, dailyGoal: n }))} className={cx("rounded-full border px-4 py-1.5 text-sm", p.dailyGoal === n ? "border-primary bg-primary-soft text-primary-strong" : "border-line")}>{n} Übungen</button>)}</div>
        </div>
      </Card>

      <Card>
        <h2 className="font-semibold">Einstufung</h2>
        <p className="mt-1 text-sm text-muted">Neuer Test und neues Niveau – dein bisheriger Fortschritt bleibt erhalten.</p>
        <Button variant="outline" className="mt-3" onClick={() => { update((x) => ({ ...x, onboarded: false })); router.push("/onboarding"); }}>Einstufungstest wiederholen</Button>
      </Card>

      <Card>
        <h2 className="font-semibold">Über diese Demo</h2>
        <ul className="mt-2 space-y-2 text-sm text-ink/80">
          <li>• <strong>Sprachfeedback ist simuliert.</strong> Es findet keine echte Ausspracheanalyse statt. Geprüft wird nur, ob überhaupt gesprochen wurde.</li>
          <li>• <strong>Audio:</strong> Referenzaufnahmen fehlen noch. Der Ton beim „Anhören“ ist ein Platzhalter – es werden keine KI-Stimmen für Quran-Text verwendet.</li>
          <li>• Aufnahmen werden nur lokal im Browser verarbeitet und nicht gespeichert oder hochgeladen. Der Lernfortschritt liegt im lokalen Speicher dieses Browsers.</li>
          <li>• Quran-Text: {QURAN_SOURCE_INFO.arabic}; Lizenz {QURAN_SOURCE_INFO.license}. {QURAN_SOURCE_INFO.note}</li>
          <li>• Die Übungsinhalte sind eigene, an Qaidah Nuraniyyah angelehnte Lektionen – keine Buchseiten.</li>
        </ul>
      </Card>

      <Card>
        <h2 className="font-semibold">Fortschritt zurücksetzen</h2>
        {!confirm ? (
          <Button variant="danger" className="mt-3" onClick={() => setConfirm(true)}>Alles löschen …</Button>
        ) : (
          <div className="mt-3 flex gap-2">
            <Button variant="danger" onClick={() => { resetProgress(); router.replace("/onboarding"); }} data-testid="reset-confirm">Ja, endgültig löschen</Button>
            <Button variant="ghost" onClick={() => setConfirm(false)}>Abbrechen</Button>
          </div>
        )}
      </Card>
    </div>
  );
}
