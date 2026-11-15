"use client";
import { useEffect, useRef } from "react";
import { IconMic } from "../icons";
import { Button } from "../ui";

export function ConsentDialog({ onAllow, onDecline, onCancel }: { onAllow: () => void; onDecline: () => void; onCancel: () => void }) {
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => ref.current?.focus(), []);
  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-ink/40 p-3 sm:place-items-center" role="presentation" onClick={onCancel}>
      <div role="dialog" aria-modal="true" aria-labelledby="consent-title" className="rise w-full max-w-md rounded-3xl bg-surface p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 grid size-12 place-items-center rounded-2xl bg-primary-soft text-primary"><IconMic /></div>
        <h2 id="consent-title" className="text-xl font-semibold">Mikrofon verwenden?</h2>
        <ul className="mt-3 space-y-2 text-[15px] text-ink/80">
          <li>• Deine Aufnahme wird <strong>nur in deinem Browser</strong> verarbeitet und nicht hochgeladen.</li>
          <li>• Sie dient nur zum Üben und zum erneuten Anhören.</li>
          <li>• <strong>Demo:</strong> Das Feedback ist in dieser Version <strong>simuliert</strong>. Es wird noch keine echte Ausspracheanalyse durchgeführt.</li>
        </ul>
        <div className="mt-6 grid gap-2">
          <Button ref={ref} onClick={onAllow}>Mikrofon erlauben</Button>
          <Button variant="outline" onClick={onDecline}>Ohne Mikrofon üben</Button>
          <Button variant="ghost" onClick={onCancel}>Abbrechen</Button>
        </div>
        <p className="mt-3 text-xs text-muted">Dein Browser fragt danach noch einmal nach der Berechtigung. Du kannst sie jederzeit in den Einstellungen widerrufen.</p>
      </div>
    </div>
  );
}
