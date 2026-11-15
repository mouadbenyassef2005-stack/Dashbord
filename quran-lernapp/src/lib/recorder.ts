"use client";
import type { RecordingSignal } from "./analysis/types";

export type MicError = "denied" | "unsupported" | "no-device" | "unknown";

export function micSupported(): boolean {
  return typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia;
}

export interface ActiveRecording {
  stop(): Promise<RecordingSignal>;
  cancel(): void;
}

/**
 * Nimmt lokal auf. Es verlässt nichts das Gerät. Der Aufruf von getUserMedia
 * darf erst nach der Einwilligung im UI erfolgen.
 */
export async function startRecording(onLevel: (level: number) => void): Promise<ActiveRecording> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ac = new AC();
  const src = ac.createMediaStreamSource(stream);
  const an = ac.createAnalyser();
  an.fftSize = 1024;
  src.connect(an);
  const buf = new Uint8Array(an.fftSize);

  let peak = 0;
  let sumSq = 0;
  let frames = 0;
  let raf = 0;
  const tick = () => {
    an.getByteTimeDomainData(buf);
    let p = 0;
    let s = 0;
    for (let i = 0; i < buf.length; i++) {
      const v = (buf[i] - 128) / 128;
      p = Math.max(p, Math.abs(v));
      s += v * v;
    }
    const rms = Math.sqrt(s / buf.length);
    peak = Math.max(peak, p);
    sumSq += rms * rms;
    frames++;
    onLevel(Math.min(1, rms * 4));
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);

  const chunks: Blob[] = [];
  let mr: MediaRecorder | null = null;
  try {
    mr = new MediaRecorder(stream);
    mr.ondataavailable = (e) => e.data.size && chunks.push(e.data);
    mr.start();
  } catch {
    mr = null; // Pegelmessung funktioniert auch ohne MediaRecorder
  }
  const t0 = performance.now();

  const cleanup = () => {
    cancelAnimationFrame(raf);
    stream.getTracks().forEach((t) => t.stop());
    void ac.close().catch(() => undefined);
    onLevel(0);
  };

  return {
    cancel: () => {
      try { mr?.state !== "inactive" && mr?.stop(); } catch { /* egal */ }
      cleanup();
    },
    stop: () =>
      new Promise<RecordingSignal>((resolve) => {
        const durationMs = performance.now() - t0;
        const finish = () => {
          const blob = chunks.length ? new Blob(chunks, { type: mr?.mimeType }) : undefined;
          const rms = frames ? Math.sqrt(sumSq / frames) : 0;
          cleanup();
          resolve({ durationMs, peak, rms, blob, mimeType: mr?.mimeType });
        };
        if (mr && mr.state !== "inactive") {
          mr.onstop = finish;
          mr.stop();
        } else finish();
      }),
  };
}

export function classifyMicError(e: unknown): MicError {
  const name = (e as { name?: string })?.name;
  if (name === "NotAllowedError" || name === "SecurityError") return "denied";
  if (name === "NotFoundError" || name === "OverconstrainedError") return "no-device";
  if (!micSupported()) return "unsupported";
  return "unknown";
}
