"use client";
import type { Hypothesis } from "./tracker";

/**
 * Echtzeit-Spracherkennung über die Web Speech API des Browsers (Chrome/Edge/Safari; Sprache ar-SA).
 * ACHTUNG Datenschutz: Der Browser sendet das Audio zur Erkennung an seinen Sprachdienst (z. B. Google bei Chrome).
 * Das muss dem Nutzer vor dem Start gesagt werden (siehe Einwilligung im Reader).
 *
 * Die Klasse liefert fortlaufend n-best-Hypothesen des gesamten Transkripts der laufenden Sitzung.
 * Bricht der Browser die Sitzung ab (Stille, Zeitlimit), wird sie automatisch neu gestartet (`onSession`).
 */
export type SpeechError = "not-allowed" | "network" | "no-device" | "unsupported" | "unknown";

export interface SpeechHandlers {
  onResult(hyps: Hypothesis[], isFinal: boolean): void;
  /** neue Erkennungssitzung gestartet (auch nach automatischem Neustart) */
  onSession(): void;
  onState(listening: boolean): void;
  onError(code: SpeechError, raw: string): void;
}

type SR = {
  lang: string; continuous: boolean; interimResults: boolean; maxAlternatives: number;
  start(): void; stop(): void; abort(): void;
  onresult: ((e: any) => void) | null; onend: (() => void) | null; onerror: ((e: any) => void) | null; onstart: (() => void) | null;
};

function ctor(): (new () => SR) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: new () => SR; webkitSpeechRecognition?: new () => SR };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export const speechSupported = () => ctor() !== null;

export class WebSpeechSource {
  private rec: SR | null = null;
  private wanted = false;
  private fatal = false;
  private restartTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private h: SpeechHandlers, private lang = "ar-SA") {}

  start() {
    const C = ctor();
    if (!C) return this.h.onError("unsupported", "no SpeechRecognition");
    this.wanted = true;
    this.fatal = false;
    this.spawn(C);
  }

  private spawn(C: new () => SR) {
    const rec = new C();
    rec.lang = this.lang;
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 5;
    rec.onstart = () => { this.h.onSession(); this.h.onState(true); };
    rec.onresult = (e: any) => {
      const results = e.results as ArrayLike<ArrayLike<{ transcript: string; confidence: number }> & { isFinal: boolean }>;
      const n = results.length;
      if (!n) return;
      const finals: string[] = [];
      const parts: { text: string; confidence: number }[] = [];
      for (let i = 0; i < n - 1; i++) { finals.push(results[i][0].transcript); parts.push({ text: results[i][0].transcript, confidence: results[i][0].confidence ?? 0 }); }
      const last = results[n - 1];
      const hyps: Hypothesis[] = [];
      for (let k = 0; k < last.length; k++) hyps.push({ text: [...finals, last[k].transcript].join(" "), confidence: last[k].confidence ?? 0, parts: [...parts, { text: last[k].transcript, confidence: last[k].confidence ?? 0 }] });
      this.h.onResult(hyps, !!last.isFinal);
    };
    rec.onerror = (e: any) => {
      const code = String(e?.error ?? "unknown");
      if (code === "no-speech" || code === "aborted") return; // normal bei Pausen → Neustart in onend
      this.fatal = true;
      if (code === "not-allowed" || code === "service-not-allowed") this.h.onError("not-allowed", code);
      else if (code === "network") this.h.onError("network", code);
      else if (code === "audio-capture") this.h.onError("no-device", code);
      else this.h.onError("unknown", code);
    };
    rec.onend = () => {
      this.h.onState(false);
      if (this.wanted && !this.fatal) this.restartTimer = setTimeout(() => this.wanted && this.spawn(C), 200);
    };
    this.rec = rec;
    try { rec.start(); } catch { /* läuft schon */ }
  }

  stop() {
    this.wanted = false;
    if (this.restartTimer) clearTimeout(this.restartTimer);
    try { this.rec?.stop(); } catch { /* egal */ }
  }
}
