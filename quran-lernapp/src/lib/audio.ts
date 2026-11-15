"use client";

/**
 * Referenzaudio. Es werden KEINE synthetischen Stimmen für Quran-Text verwendet.
 * - Gibt es `audioUrl` (menschliche, geprüfte Aufnahme), wird sie abgespielt.
 * - Sonst ertönt ein neutraler PLATZHALTER-Ton (Chime), damit der Ablauf testbar bleibt.
 */
export interface Playback {
  stop(): void;
  done: Promise<void>;
  placeholder: boolean;
}

let ctx: AudioContext | null = null;
function audioCtx(): AudioContext | null {
  try {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx ??= new AC();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

export function playReference(opts: { audioUrl?: string; segments?: number }): Playback {
  if (opts.audioUrl) {
    const el = new Audio(opts.audioUrl);
    const done = new Promise<void>((res) => {
      el.onended = () => res();
      el.onerror = () => res();
    });
    void el.play().catch(() => undefined);
    return { stop: () => el.pause(), done, placeholder: false };
  }
  const c = audioCtx();
  const n = Math.min(Math.max(opts.segments ?? 1, 1), 6);
  if (!c) return { stop: () => undefined, done: Promise.resolve(), placeholder: true };
  const t0 = c.currentTime + 0.02;
  const nodes: OscillatorNode[] = [];
  for (let i = 0; i < n; i++) {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = "sine";
    o.frequency.value = 392 + (i % 3) * 66;
    const s = t0 + i * 0.28;
    g.gain.setValueAtTime(0.0001, s);
    g.gain.exponentialRampToValueAtTime(0.12, s + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, s + 0.24);
    o.connect(g).connect(c.destination);
    o.start(s);
    o.stop(s + 0.26);
    nodes.push(o);
  }
  const done = new Promise<void>((res) => setTimeout(res, n * 280 + 120));
  return {
    placeholder: true,
    done,
    stop: () => nodes.forEach((o) => { try { o.stop(); } catch { /* bereits beendet */ } }),
  };
}
