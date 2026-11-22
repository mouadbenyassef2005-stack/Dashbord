"use client";
import { useEffect, type ReactNode } from "react";

/**
 * Vollbild-Rahmen für Lektionen und Übungen (wie bei Lern-Apps üblich): Kopf mit Schließen und Fortschritt,
 * scrollbarer Inhalt, fester Fußbereich mit der Hauptaktion in Daumen-Reichweite. Der Fußbereich hat eine feste Mindesthöhe,
 * damit das Layout beim Wechsel der Aufgabe nicht springt.
 */
export function Screen({ progress, total, onClose, label, children }: { progress: number; total: number; onClose(): void; label: string; children: ReactNode }) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);
  const pct = total > 0 ? Math.min(100, Math.round((progress / total) * 100)) : 0;
  return (
    <div className="qd lp" role="dialog" aria-modal="true" aria-label={label}>
      <header className="lp-top">
        <button className="lp-close" onClick={onClose} aria-label="Lektion beenden"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden><path d="M6 6l12 12M18 6 6 18" /></svg></button>
        <div className="lp-bar" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={progress} aria-label={`Schritt ${Math.min(progress + 1, total)} von ${total}`}><span style={{ width: `${pct}%` }} /></div>
      </header>
      {children}
    </div>
  );
}
