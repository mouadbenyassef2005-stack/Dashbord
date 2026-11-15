"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ReadItem } from "@/content/types";
import { getAnalyzer, type AnalysisResult } from "@/lib/analysis";
import { toClusters } from "@/lib/arabic";
import { playReference, type Playback } from "@/lib/audio";
import { classifyMicError, micSupported, startRecording, type ActiveRecording, type MicError } from "@/lib/recorder";
import { ArabicText } from "../ArabicText";
import { IconArrow, IconCheck, IconMic, IconRepeat, IconSpeaker, IconStop } from "../icons";
import { Button, Chip, DemoBadge, cx } from "../ui";
import { ConsentDialog } from "./ConsentDialog";

type Phase = "idle" | "recording" | "analyzing" | "result" | "self";
const MAX_MS = 12000;

/** Schriftgröße nach Textlänge: kurze Einheiten sehr groß, ganze Ayat noch gut lesbar. */
function fontPx(clusters: number, chars: number, compact: boolean): number {
  const base = clusters <= 2 ? 128 : clusters <= 4 ? 104 : clusters <= 6 ? 84 : clusters <= 9 ? 66 : chars <= 28 ? 52 : chars <= 45 ? 42 : 36;
  return compact ? Math.round(base * 0.62) : base;
}

interface Props {
  item: ReadItem;
  showHint: boolean;
  micConsent: boolean;
  onConsent: () => void;
  onAttempt: (passed: boolean, weakKeys: string[]) => void;
  onPass: () => void;
  onDefer: () => void;
  canDefer: boolean;
}

export function ReadStep({ item, showHint, micConsent, onConsent, onAttempt, onPass, onDefer, canDefer }: Props) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [level, setLevel] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [selfResult, setSelfResult] = useState<boolean | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [consentOpen, setConsentOpen] = useState(false);
  const [micError, setMicError] = useState<MicError | null>(null);
  const [heard, setHeard] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [recUrl, setRecUrl] = useState<string | null>(null);
  const [hintOpen, setHintOpen] = useState(showHint);

  const rec = useRef<ActiveRecording | null>(null);
  const playback = useRef<Playback | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const recUrlRef = useRef<string | null>(null);
  const clusters = toClusters(item.arabic);

  useEffect(
    () => () => {
      rec.current?.cancel();
      playback.current?.stop();
      if (timer.current) clearInterval(timer.current);
      if (recUrlRef.current) URL.revokeObjectURL(recUrlRef.current);
    },
    [],
  );

  const play = useCallback((segments: number) => {
    playback.current?.stop();
    const pb = playReference({ audioUrl: item.audioUrl, segments });
    playback.current = pb;
    setPlaying(true);
    setHeard(true);
    void pb.done.then(() => setPlaying(false));
  }, [item.audioUrl]);

  const stop = useCallback(async () => {
    const r = rec.current;
    if (!r) return;
    rec.current = null;
    if (timer.current) clearInterval(timer.current);
    setPhase("analyzing");
    const signal = await r.stop();
    if (recUrlRef.current) URL.revokeObjectURL(recUrlRef.current);
    const url = signal.blob ? URL.createObjectURL(signal.blob) : null;
    recUrlRef.current = url;
    setRecUrl(url);
    const nextAttempt = attempt + 1;
    const res = await getAnalyzer().analyze({ item, signal, attempt: nextAttempt });
    setResult(res);
    if (res.status === "ok") {
      setAttempt(nextAttempt);
      onAttempt(res.passed, res.passed ? [] : res.focus ? [res.focus.key] : []);
    }
    setPhase("result");
  }, [attempt, item, onAttempt]);

  const begin = useCallback(async () => {
    setMicError(null);
    if (!micSupported()) {
      setMicError("unsupported");
      setPhase("self");
      return;
    }
    try {
      playback.current?.stop();
      rec.current = await startRecording(setLevel);
      setElapsed(0);
      setResult(null);
      setPhase("recording");
      const t0 = Date.now();
      timer.current = setInterval(() => {
        const e = Date.now() - t0;
        setElapsed(e);
        if (e >= MAX_MS) void stop();
      }, 200);
    } catch (e) {
      setMicError(classifyMicError(e));
      setPhase("self");
    }
  }, [stop]);

  const onMicClick = () => {
    if (phase === "recording") return void stop();
    if (!micConsent) return setConsentOpen(true);
    void begin();
  };

  const retry = () => {
    setResult(null);
    setSelfResult(null);
    setPhase("idle");
  };

  const selfAssess = (ok: boolean) => {
    setSelfResult(ok);
    onAttempt(ok, ok ? [] : []);
    setPhase("result");
  };

  const passed = result?.status === "ok" ? result.passed : selfResult === true;
  const failedResult = (result?.status === "ok" && !result.passed) || selfResult === false;
  const noSignal = result?.status === "no-signal";
  const busy = phase === "recording" || phase === "analyzing";

  return (
    <div className="flex flex-1 flex-col">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {item.prompt && <p className="text-[15px] text-muted">{item.prompt}</p>}
        {item.ref && <Chip tone="primary">Quran {item.ref}</Chip>}
      </div>

      {/* Arabischer Text */}
      <div className={cx("grid place-items-center rounded-3xl border border-line bg-surface px-4 shadow-card transition-all", phase === "result" ? "py-3" : "flex-1 py-8")} data-testid="arabic-card">
        <div className="text-center">
          <ArabicText text={item.arabic} px={fontPx(clusters.length, item.arabic.length, phase === "result")} />
          {item.hint && (
            <div className="mt-2 min-h-7">
              {hintOpen ? (
                <button type="button" onClick={() => setHintOpen(false)} className="text-lg text-muted hover:text-ink" aria-label="Lautschrift ausblenden">
                  {item.hint}
                </button>
              ) : (
                <button type="button" onClick={() => setHintOpen(true)} className="text-sm text-primary underline-offset-4 hover:underline">
                  Lautschrift zeigen
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Steuerung */}
      <div className={cx("mt-5", phase !== "result" && "min-h-[168px]")} aria-live="polite">
        {(phase === "idle" || phase === "recording" || phase === "analyzing") && (
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center justify-center gap-5">
              <button type="button" onClick={() => play(clusters.length)} disabled={busy} className={cx("flex h-16 items-center gap-2 rounded-full border border-line bg-surface px-6 font-medium transition hover:border-primary/40 disabled:opacity-40", playing && "border-primary text-primary")} aria-label="Referenzaufnahme anhören">
                <IconSpeaker /> Anhören
              </button>
              <div className="relative grid size-20 place-items-center">
                {phase === "recording" && <span className="pulse-ring absolute inset-0 rounded-full" style={{ transform: `scale(${1 + level * 0.5})` }} aria-hidden />}
                <button
                  type="button"
                  onClick={onMicClick}
                  disabled={phase === "analyzing"}
                  aria-label={phase === "recording" ? "Aufnahme beenden" : "Aufnahme starten"}
                  data-testid="mic"
                  className={cx("relative grid size-20 place-items-center rounded-full text-white shadow-lg transition active:scale-95 disabled:opacity-60", phase === "recording" ? "bg-warn" : "bg-primary hover:bg-primary-strong")}
                >
                  {phase === "recording" ? <IconStop className="size-8" /> : <IconMic className="size-8" />}
                </button>
              </div>
            </div>
            <p className="text-center text-sm text-muted">
              {phase === "idle" && (heard ? "Jetzt du: tippe auf das Mikrofon und lies laut." : "Hör zuerst zu, dann sprich nach.")}
              {phase === "recording" && `Aufnahme läuft … ${(elapsed / 1000).toFixed(0)} s – tippe zum Beenden`}
              {phase === "analyzing" && "Analysiere (Demo) …"}
            </p>
            {heard && !item.audioUrl && (
              <p className="max-w-sm text-center text-xs text-muted">Hinweis: Statt einer Rezitation hörst du einen <strong>Platzhalter-Ton</strong>. Die menschliche Referenzaufnahme wird professionell eingesprochen und hier eingebunden.</p>
            )}
            {phase === "idle" && (
              <button type="button" className="text-sm text-muted underline-offset-4 hover:text-ink hover:underline" onClick={() => setPhase("self")}>
                Ohne Mikrofon üben
              </button>
            )}
          </div>
        )}

        {phase === "self" && (
          <div className="rise rounded-3xl border border-line bg-surface p-5">
            {micError && (
              <p className="mb-3 rounded-xl bg-warn-soft p-3 text-sm text-warn">
                {micError === "denied" && "Das Mikrofon ist blockiert (in Online-Vorschauen oft gesperrt). Erlaube es in den Browser-Einstellungen – oder übe ohne Mikrofon."}
                {micError === "no-device" && "Es wurde kein Mikrofon gefunden. Du kannst ohne Mikrofon üben."}
                {micError === "unsupported" && "Dein Browser unterstützt keine Aufnahme (oder die Seite ist nicht über HTTPS geöffnet)."}
                {micError === "unknown" && "Die Aufnahme konnte nicht gestartet werden."}
              </p>
            )}
            <p className="font-medium">Lies den Text laut. Wie sicher war es?</p>
            <p className="mt-1 text-sm text-muted">Selbsteinschätzung – ohne Analyse.</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button onClick={() => selfAssess(true)}>Sicher gelesen</Button>
              <Button variant="outline" onClick={() => selfAssess(false)}>Noch unsicher</Button>
            </div>
            <div className="mt-3 flex justify-between text-sm">
              <button type="button" className="text-muted hover:text-ink" onClick={() => setPhase("idle")}>← Zurück</button>
              <button type="button" className="text-primary" onClick={() => play(clusters.length)}>Anhören</button>
            </div>
          </div>
        )}

        {phase === "result" && (
          <div className="rise space-y-3" data-testid="result">
            {noSignal && result && (
              <div className="rounded-3xl border border-line bg-surface p-5">
                <p className="font-semibold">{result.headline}</p>
                <p className="mt-1 text-[15px] text-muted">{result.detail}</p>
                <Button className="mt-4 w-full" onClick={retry}><IconMic className="size-5" /> Nochmal aufnehmen</Button>
              </div>
            )}
            {!noSignal && (
              <div className={cx("rounded-3xl border p-5", passed ? "border-ok/30 bg-ok-soft" : "border-warn/30 bg-warn-soft")}>
                <div className="mb-2 flex items-center gap-2">
                  {passed ? <IconCheck className="size-5 text-ok" /> : <span className="grid size-5 place-items-center rounded-full bg-warn text-xs font-bold text-white">!</span>}
                  <p className="font-semibold" data-testid="headline">
                    {result ? result.headline : passed ? "Gut – als sicher markiert" : "Wir üben es nochmal"}
                  </p>
                  {result?.simulated && <DemoBadge className="ml-auto" />}
                </div>
                {result && result.segments.length > 1 && (
                  <div className="my-3 flex flex-wrap justify-center gap-2" dir="rtl" aria-label="Bewertung je Buchstabe">
                    {result.segments.map((s, i) => (
                      <span key={i} className={cx("arabic rounded-xl border px-3 text-3xl leading-[1.7]", s.ok ? "border-ok/30 bg-white/70 text-ink" : "border-warn bg-white text-warn")}>{s.text}</span>
                    ))}
                  </div>
                )}
                {result && <p className="text-[15px] text-ink/80">{result.detail}</p>}
                {result?.simulated && <p className="mt-2 text-xs text-ink/60">Simuliertes Feedback: Es wurde keine echte Ausspracheanalyse durchgeführt.</p>}
                <div className="mt-4 flex flex-wrap gap-2">
                  {failedResult && result?.focus && (
                    <Button variant="soft" onClick={() => play(1)}><IconSpeaker className="size-5" /> Teil anhören</Button>
                  )}
                  {recUrl && <Button variant="outline" onClick={() => { const a = new Audio(recUrl); void a.play().catch(() => undefined); }}><IconSpeaker className="size-5" /> Meine Aufnahme</Button>}
                </div>
              </div>
            )}
            {!noSignal && (
              <div className="grid grid-cols-2 gap-2">
                {passed ? (
                  <>
                    <Button variant="outline" onClick={retry}><IconRepeat className="size-5" /> Nochmal</Button>
                    <Button onClick={onPass} data-testid="next">Weiter <IconArrow className="size-5" /></Button>
                  </>
                ) : (
                  <>
                    <Button onClick={retry} data-testid="retry"><IconRepeat className="size-5" /> Nochmal üben</Button>
                    <Button variant="outline" onClick={onDefer} disabled={!canDefer}>Später</Button>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {consentOpen && (
        <ConsentDialog
          onAllow={() => { setConsentOpen(false); onConsent(); void begin(); }}
          onDecline={() => { setConsentOpen(false); setPhase("self"); }}
          onCancel={() => setConsentOpen(false)}
        />
      )}
    </div>
  );
}
