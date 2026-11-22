"use client";
import { useEffect, useRef, useState } from "react";
import { hasAudio } from "@/lektion/audio/manifest";
import { playAudio } from "@/lektion/audio/player";

type S = "idle" | "recording" | "ready" | "denied" | "unsupported";

/**
 * Eigene Aussprache aufnehmen und mit der Vorbild-Aufnahme vergleichen. Es gibt KEINE automatische Bewertung:
 * Der Vergleich geschieht durch das eigene Gehör. Die Aufnahme bleibt im Browser und wird nicht gespeichert.
 */
export function SpeakCompare({ audioId, onUsed }: { audioId: string; onUsed?: () => void }) {
  const [state, setState] = useState<S>("idle");
  const rec = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const url = useRef<string | null>(null);
  const el = useRef<HTMLAudioElement | null>(null);
  useEffect(() => () => { if (url.current) URL.revokeObjectURL(url.current); }, []);
  if (!hasAudio(audioId)) return null;
  const supported = typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== "undefined";
  if (!supported) return <p className="muted" style={{ fontSize: 13 }}>Aufnehmen wird von diesem Browser nicht unterstützt. Sprich die Silbe laut nach.</p>;
  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunks.current = [];
      const r = new MediaRecorder(stream);
      r.ondataavailable = (e) => chunks.current.push(e.data);
      r.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        if (url.current) URL.revokeObjectURL(url.current);
        url.current = URL.createObjectURL(new Blob(chunks.current, { type: r.mimeType }));
        setState("ready");
        onUsed?.();
      };
      rec.current = r; r.start(); setState("recording");
      setTimeout(() => { if (r.state === "recording") r.stop(); }, 4000);
    } catch { setState("denied"); }
  };
  return (
    <div className="stack" role="group" aria-label="Aussprache vergleichen">
      <div className="row">
        {state !== "recording"
          ? <button className="btn btn-secondary" onClick={() => void start()}>● Selbst sprechen</button>
          : <button className="btn btn-primary" onClick={() => rec.current?.stop()}>■ Aufnahme beenden</button>}
        {state === "ready" && <>
          <button className="btn btn-ghost" onClick={() => { if (url.current) { el.current = new Audio(url.current); void el.current.play(); } }}>Meine Aufnahme</button>
          <button className="btn btn-ghost" onClick={() => void playAudio(audioId)}>Vorbild</button>
        </>}
      </div>
      <p className="muted" style={{ fontSize: 13 }} role="status">
        {state === "recording" ? "Aufnahme läuft (max. 4 Sekunden) …" : state === "denied" ? "Kein Zugriff auf das Mikrofon. Erlaube es im Browser oder sprich laut nach." : state === "ready" ? "Höre beides nacheinander. Es gibt keine automatische Bewertung. Du vergleichst mit deinem eigenen Gehör." : "Nimm dich kurz auf und vergleiche mit dem Vorbild. Die Aufnahme bleibt auf deinem Gerät und wird nicht gespeichert."}
      </p>
    </div>
  );
}
