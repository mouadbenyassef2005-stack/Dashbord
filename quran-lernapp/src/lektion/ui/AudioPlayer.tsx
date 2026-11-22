"use client";
import { useEffect, useState } from "react";
import { hasAudio } from "@/lektion/audio/manifest";
import { playAudio, playSequence, stopAudio, type PlayState } from "@/lektion/audio/player";
import { Icon } from "./parts";

/**
 * Audio-Steuerelement direkt am Lerngegenstand. Fehlt die Aufnahme, gibt es keinen Abspiel-Button,
 * sondern den ehrlichen Zustand „Audio noch nicht verfügbar“.
 */
export function AudioPlayer({ id, label = "Hören", slow = true, compact = false }: { id: string; label?: string; slow?: boolean; compact?: boolean }) {
  const [state, setState] = useState<PlayState>("idle");
  const [rate, setRate] = useState<"normal" | "slow">("normal");
  useEffect(() => () => stopAudio(), []);
  if (!hasAudio(id))
    return <span className="audio-missing" role="status"><span aria-hidden>○</span> Audio noch nicht verfügbar</span>;
  const run = async (slowMode: boolean) => {
    setRate(slowMode ? "slow" : "normal");
    setState("playing");
    const r = await playAudio(id, { slow: slowMode, onEnd: () => setState("idle") });
    if (r === "error") setState("error"); else if (r === "missing") setState("missing");
  };
  return (
    <div className={`audio ${compact ? "audio-compact" : ""}`}>
      <div className="row" style={{ gap: 8 }}>
        <button className="btn btn-secondary" onClick={() => void run(false)} aria-label={`${label}${rate === "normal" && state === "playing" ? ", läuft" : ""}`} aria-busy={state === "playing" && rate === "normal"}>
          {Icon.speaker} {compact ? "" : label}{compact ? <span className="sr-only">{label}</span> : null}
        </button>
        {slow && <button className="btn btn-ghost" onClick={() => void run(true)} aria-label={`${label}, langsam`} aria-busy={state === "playing" && rate === "slow"}>Langsam</button>}
      </div>
      <span className="sr-only" role="status" aria-live="polite">{state === "playing" ? "Wird abgespielt" : ""}</span>
      {state === "error" && <p className="muted" role="alert" style={{ fontSize: 13 }}>Wiedergabe fehlgeschlagen. Prüfe Lautstärke und Stummschaltung und versuche es erneut.</p>}
    </div>
  );
}

/** Hörvergleich: mehrere Aufnahmen nebeneinander, einzeln oder nacheinander abspielbar. */
export function ContrastPlayer({ items }: { items: { id: string; ar: string; tr: string }[] }) {
  const [active, setActive] = useState(-1);
  const [msg, setMsg] = useState<string | null>(null);
  const available = items.filter((i) => hasAudio(i.id));
  useEffect(() => () => stopAudio(), []);
  if (!available.length) return <p className="audio-missing" role="status">Audio noch nicht verfügbar</p>;
  return (
    <div className="stack" role="group" aria-label="Hörvergleich">
      <div className="cards" style={{ gridTemplateColumns: `repeat(${Math.min(items.length, 3)}, 1fr)` }}>
        {items.map((it, i) => (
          <div key={it.id} className="card" data-active={active === i}>
            <span className="ar ar-teach" lang="ar" dir="rtl">{it.ar}</span>
            <strong>{it.tr}</strong>
            <AudioPlayer id={it.id} label={`${it.tr} hören`} slow={false} compact />
          </div>
        ))}
      </div>
      {available.length === items.length && (
        <div><button className="btn btn-secondary" onClick={async () => { setMsg(null); const r = await playSequence(items.map((x) => x.id), setActive); if (r !== "played") setMsg("Wiedergabe fehlgeschlagen."); }}>
          Alle nacheinander hören</button></div>
      )}
      {msg && <p role="alert" className="muted">{msg}</p>}
    </div>
  );
}
