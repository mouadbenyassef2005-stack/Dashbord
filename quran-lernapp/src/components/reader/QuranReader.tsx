"use client";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { needsAlt } from "../ArabicText";
import { arabicIndic, surahPage, type MWord } from "@/content/mushaf";
import { playReference } from "@/lib/audio";
import { firstDifference } from "@/lib/live/normalize";
import { loadQuranCom, type QuranComResult } from "@/lib/live/quranCom";
import { speechSupported, WebSpeechSource, type SpeechError } from "@/lib/live/speech";
import { ReadingTracker, type WordResult, type WordState } from "@/lib/live/tracker";
import { recordAttempt, toggleFlag } from "@/lib/progress";
import { useProgress } from "@/lib/store";
import { IconMic, IconStop, IconSpeaker, IconX, IconRepeat } from "../icons";
import { Button, ButtonLink, Card, Chip, cx } from "../ui";

type Phase = "idle" | "running" | "stopped";

const ERRORS: Record<SpeechError, string> = {
  "not-allowed": "Das Mikrofon bzw. die Spracherkennung ist blockiert. Erlaube den Zugriff in den Browser-Einstellungen (Schloss-Symbol in der Adresszeile) und versuche es erneut.",
  network: "Die Spracherkennung deines Browsers ist nicht erreichbar. Sie braucht eine Internetverbindung.",
  "no-device": "Es wurde kein Mikrofon gefunden.",
  unsupported: "Dein Browser unterstützt die Echtzeit-Spracherkennung nicht. Öffne die App in Chrome, Edge oder Safari (über https oder localhost).",
  unknown: "Die Spracherkennung konnte nicht gestartet werden.",
};

export function QuranReader({ surahId }: { surahId: number }) {
  const page = useMemo(() => surahPage(surahId), [surahId]);
  const { progress, update } = useProgress();
  const tracker = useMemo(() => (page ? new ReadingTracker(page.flat.map((w) => ({ skel: w.skel, optional: w.optional }))) : null), [page]);
  const [results, setResults] = useState<WordResult[]>(() => tracker?.results ?? []);
  const [cursor, setCursor] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<SpeechError | null>(null);
  const [consent, setConsent] = useState(false);
  const [sheet, setSheet] = useState<number | null>(null);
  const [qc, setQc] = useState<QuranComResult>({ status: "loading", audio: {} });
  const source = useRef<WebSpeechSource | null>(null);
  const recorded = useRef<Set<string>>(new Set());
  const supported = typeof window !== "undefined" ? speechSupported() : true;

  const sync = useCallback(() => {
    if (!tracker) return;
    setResults([...tracker.results]);
    setCursor(tracker.cursor);
  }, [tracker]);

  useEffect(() => {
    if (!page) return;
    let alive = true;
    void loadQuranCom(page.id, page.verses.map((v) => v.words.map((w) => ({ verse: w.verse, text: w.text })))).then((r) => alive && setQc(r));
    return () => { alive = false; };
  }, [page]);

  useEffect(() => () => source.current?.stop(), []);

  // Cursor im Blick halten, solange gelesen wird
  useEffect(() => {
    if (phase !== "running") return;
    document.querySelector(`[data-w="${cursor}"]`)?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [cursor, phase]);

  const persist = useCallback(() => {
    if (!page || !tracker) return;
    const now = Date.now();
    update((p) => {
      let n = p;
      tracker.results.forEach((r, j) => {
        const w = page.flat[j];
        if (w.optional || recorded.current.has(`${w.id}:${r.state}`)) return;
        if (r.state === "ok") { n = recordAttempt(n, `w:${w.id}`, true, [], now, "live"); recorded.current.add(`${w.id}:${r.state}`); }
        else if (r.state === "wrong") {
          n = recordAttempt(n, `w:${w.id}`, false, [], now, "live");
          if (!n.flagged[`w:${w.id}`]) n = toggleFlag(n, `w:${w.id}`, now);
          recorded.current.add(`${w.id}:${r.state}`);
        }
      });
      return n;
    });
  }, [page, tracker, update]);

  const start = useCallback(() => {
    if (!tracker) return;
    setError(null);
    setPhase("running");
    source.current?.stop();
    source.current = new WebSpeechSource({
      onSession: () => tracker.beginSession(),
      onResult: (hyps, isFinal) => { tracker.update(hyps, isFinal); sync(); },
      onState: setListening,
      onError: (code) => { setError(code); setPhase("stopped"); setListening(false); source.current?.stop(); },
    });
    source.current.start();
  }, [tracker, sync]);

  const stop = useCallback(() => {
    source.current?.stop();
    setPhase("stopped");
    setListening(false);
    persist();
  }, [persist]);

  const onMic = () => {
    if (phase === "running") return stop();
    if (!supported) return setError("unsupported");
    if (!progress.liveConsent) return setConsent(true);
    start();
  };

  const restart = () => {
    source.current?.stop();
    tracker?.reset();
    recorded.current = new Set();
    setPhase("idle");
    setListening(false);
    setError(null);
    sync();
  };

  if (!page || !tracker) return <div className="grid min-h-dvh place-items-center text-muted">Sure nicht verfügbar.</div>;

  const sum = tracker.summary();
  const wrongWords = page.flat.map((w, j) => ({ w, r: results[j] })).filter((x) => !x.w.optional && x.r?.state === "wrong");
  const touched = phase !== "idle" || sum.ok + sum.wrong + sum.skipped + sum.uncertain > 0;

  const wordClass = (j: number, s: WordState) =>
    cx(
      "cursor-pointer rounded-md px-[0.12em] transition-colors",
      s === "wrong" && "bg-wrong-soft text-wrong",
      s === "skipped" && "underline decoration-gold decoration-2 [text-decoration-style:dotted] underline-offset-[0.35em]",
      phase === "running" && j === cursor && s === "pending" && "bg-primary-soft",
    );

  const flatIndex = (w: MWord) => page.flat.findIndex((x) => x === w);
  const sheetWord = sheet !== null ? page.flat[sheet] : null;

  return (
    <div className="mx-auto flex min-h-dvh max-w-2xl flex-col px-4 pb-44 pt-4 sm:px-6">
      <header className="mb-3 flex items-center gap-3">
        <Link href="/lesen" aria-label="Zurück" onClick={() => source.current?.stop()} className="rounded-full p-2 text-ink/60 hover:bg-ink/5"><IconX /></Link>
        <div className="min-w-0 flex-1 text-center">
          <p className="arabic text-3xl leading-[1.7]" dir="rtl" lang="ar">{page.name === "البروج" ? "سورة البروج" : page.name}</p>
          <p className="-mt-1 text-xs text-muted">Sure {page.id} · {page.nameTranslit} · {page.verses.length} Ayat</p>
        </div>
        <span className="w-9" />
      </header>

      <details className="mb-3 rounded-2xl border border-line bg-surface px-4 py-2 text-sm text-ink/80">
        <summary className="cursor-pointer font-medium">So funktioniert die Live-Korrektur</summary>
        <ul className="mt-2 space-y-1.5 pb-1">
          <li>• Tippe auf das Mikrofon und lies laut. Rot markiert wird nur, was die Spracherkennung deutlich anders gehört hat – und erst, wenn du weitergelesen hast.</li>
          <li>• Geprüft wird auf <strong>Wortebene</strong> (Konsonantengerüst). Kurze Vokale und Tajweed werden <strong>noch nicht</strong> bewertet.</li>
          <li>• Bei Unsicherheit bleibt das Wort unmarkiert. Gepunktet unterstrichen = ausgelassen.</li>
          <li>• Das Audio wird zur Erkennung an den Sprachdienst deines Browsers gesendet (z. B. Google in Chrome).</li>
          <li>• Text: {qc.status === "verified" ? "mit Quran.com abgeglichen ✓" : qc.status === "mismatch" ? `weicht von Quran.com ab (${qc.note})` : qc.status === "loading" ? "Abgleich mit Quran.com läuft …" : "Quran.com nicht erreichbar – gebündelter Text (Uthmani, quran-json)"}.</li>
        </ul>
      </details>

      {error && <p role="alert" className="mb-3 rounded-2xl bg-warn-soft p-4 text-sm text-warn" data-testid="reader-error">{ERRORS[error]}</p>}

      {/* Quran-Seite */}
      <Card className="!p-5 sm:!p-8" data-testid="mushaf">
        <p className="arabic mb-5 text-center text-3xl text-ink/80" dir="rtl" lang="ar">
          {page.basmala.map((w, k) => {
            const j = k;
            return <span key={w.id} data-w={j} onClick={() => setSheet(j)} className={cx("mx-[0.15em] inline-block", wordClass(j, results[j]?.state ?? "pending"))}>{w.text}</span>;
          })}
        </p>
        <div dir="rtl" lang="ar" className="arabic text-justify text-[34px] leading-[2.55] sm:text-[42px]" style={{ textAlignLast: "center" }}>
          {page.verses.map((v) => (
            <span key={v.n}>
              {v.words.map((w) => {
                const j = flatIndex(w);
                const st = results[j]?.state ?? "pending";
                return (
                  <span key={w.id}>
                    <span data-w={j} data-state={st} role="button" tabIndex={0} onClick={() => setSheet(j)} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), setSheet(j))} className={cx(wordClass(j, st), needsAlt(w.text) && "arabic-alt")}>{w.text}</span>{" "}
                  </span>
                );
              })}
              <span className="mx-[0.1em] text-primary" aria-label={`Ayah ${v.n}`}>{"۝"}{arabicIndic(v.n)}</span>{" "}
            </span>
          ))}
        </div>
        <p className="mt-4 text-center text-xs text-muted">Tippe ein Wort an, um dort einzusteigen oder es anzuhören.</p>
      </Card>

      {touched && phase !== "running" && (
        <Card className="mt-4" data-testid="reader-summary">
          <h2 className="font-semibold">Dein Ergebnis</h2>
          <div className="mt-3 grid grid-cols-4 gap-2 text-center text-sm">
            {[["ok", "richtig", "text-ok"], ["wrong", "falsch", "text-wrong"], ["skipped", "ausgelassen", "text-gold"], ["uncertain", "unsicher", "text-muted"]].map(([k, label, c]) => (
              <div key={k} className="rounded-2xl bg-bg p-3"><div className={cx("text-xl font-semibold", c)} data-testid={`sum-${k}`}>{sum[k as "ok"]}</div><div className="text-xs text-muted">{label}</div></div>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted">„Unsicher“ = die Erkennung war nicht sicher genug für eine Bewertung. {sum.pending > 0 && `${sum.pending} Wörter noch nicht gelesen.`}</p>
          {wrongWords.length > 0 && (
            <>
              <div className="mt-3 flex flex-wrap gap-2" dir="rtl">
                {wrongWords.map(({ w }) => (
                  <button key={w.id} type="button" onClick={() => setSheet(flatIndex(w))} className="arabic rounded-xl border border-wrong/40 bg-wrong-soft px-3 text-2xl leading-[1.8] text-wrong">{w.text}</button>
                ))}
              </div>
              <ButtonLink href="/lektion/flagged" className="mt-4 w-full" data-testid="practice-wrong">Falsche Wörter üben</ButtonLink>
            </>
          )}
        </Card>
      )}

      {/* Steuerleiste */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-bg/95 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-4">
          <Button variant="ghost" onClick={restart} disabled={!touched} aria-label="Neu beginnen"><IconRepeat className="size-5" /> Neu</Button>
          <div className="flex flex-col items-center gap-1">
            <div className="relative grid size-20 place-items-center">
              {phase === "running" && listening && <span className="pulse-ring absolute inset-0 rounded-full" aria-hidden />}
              <button type="button" onClick={onMic} data-testid="reader-mic" aria-label={phase === "running" ? "Lesen beenden" : "Lesen starten"} className={cx("relative grid size-20 place-items-center rounded-full text-white shadow-lg transition active:scale-95", phase === "running" ? "bg-wrong" : "bg-primary hover:bg-primary-strong")}>
                {phase === "running" ? <IconStop className="size-8" /> : <IconMic className="size-8" />}
              </button>
            </div>
            <p className="text-xs text-muted" data-testid="reader-status" aria-live="polite">{phase === "running" ? (listening ? "Ich höre zu – lies laut" : "Starte …") : phase === "stopped" ? "Beendet" : "Tippe zum Starten"}</p>
          </div>
          <Chip tone="primary" className="min-w-16 justify-center" data-testid="reader-progress">{sum.total - sum.pending}/{sum.total}</Chip>
        </div>
      </div>

      {consent && (
        <div className="fixed inset-0 z-50 grid place-items-end bg-ink/40 p-3 sm:place-items-center" role="presentation" onClick={() => setConsent(false)}>
          <div role="dialog" aria-modal="true" aria-labelledby="live-consent" className="rise w-full max-w-md rounded-3xl bg-surface p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 id="live-consent" className="text-xl font-semibold">Live-Spracherkennung starten?</h2>
            <ul className="mt-3 space-y-2 text-[15px] text-ink/80">
              <li>• Dein Browser nutzt das Mikrofon und sendet das <strong>Audio zur Erkennung an seinen Sprachdienst</strong> (z. B. Google in Chrome). Diese App speichert keine Aufnahmen.</li>
              <li>• Die App vergleicht das Erkannte Wort für Wort mit dem Quran-Text. Das ist eine <strong>Wortebenen-Prüfung</strong> – keine Bewertung von Vokalen oder Tajweed.</li>
              <li>• Rot erscheint nur bei deutlicher Abweichung. Fehlalarme sind trotzdem möglich.</li>
            </ul>
            <div className="mt-6 grid gap-2">
              <Button data-testid="live-consent-ok" onClick={() => { setConsent(false); update((p) => ({ ...p, liveConsent: true, micConsent: true })); start(); }}>Verstanden – Mikrofon aktivieren</Button>
              <Button variant="ghost" onClick={() => setConsent(false)}>Abbrechen</Button>
            </div>
          </div>
        </div>
      )}

      {sheetWord && sheet !== null && (
        <WordSheet word={sheetWord} result={results[sheet]} audioUrl={qc.audio[sheetWord.id]} flagged={!!progress.flagged[`w:${sheetWord.id}`]}
          onClose={() => setSheet(null)}
          onHere={() => { tracker.setCursor(sheet); sync(); setSheet(null); }}
          onFlag={() => update((p) => toggleFlag(p, `w:${sheetWord.id}`))} />
      )}
    </div>
  );
}

function WordSheet({ word, result, audioUrl, flagged, onClose, onHere, onFlag }: { word: MWord; result?: WordResult; audioUrl?: string; flagged: boolean; onClose: () => void; onHere: () => void; onFlag: () => void }) {
  const diff = result && (result.state === "wrong") && result.heard ? firstDifference(word.skel, result.heard) : null;
  const label: Record<WordState, string> = { pending: "noch nicht gelesen", ok: "richtig erkannt", wrong: "anders gehört", skipped: "ausgelassen", uncertain: "nicht sicher bewertet" };
  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-ink/40 p-3 sm:place-items-center" role="presentation" onClick={onClose}>
      <div role="dialog" aria-modal="true" className="rise w-full max-w-md rounded-3xl bg-surface p-6 shadow-2xl" onClick={(e) => e.stopPropagation()} data-testid="word-sheet">
        <div className="text-center">
          <span dir="rtl" lang="ar" className={cx("arabic text-[64px] leading-[2]", needsAlt(word.text) && "arabic-alt")}>{word.text}</span>
          {word.tr && <p className="-mt-2 text-muted">{word.tr}</p>}
          <p className="mt-1 text-xs text-muted">Sure {word.id.split(":")[0]}, Ayah {word.verse}, Wort {word.pos}</p>
        </div>
        <p className="mt-3 text-center"><Chip tone={result?.state === "wrong" ? "warn" : result?.state === "ok" ? "ok" : result?.state === "skipped" ? "gold" : "neutral"}>{label[result?.state ?? "pending"]}</Chip></p>
        {result?.state === "wrong" && (
          <p className="mt-3 rounded-2xl bg-wrong-soft p-3 text-sm text-ink/85">
            Erkannt wurde: <span className="arabic text-xl" dir="rtl" lang="ar">{result.heard}</span>{" "}statt <span className="arabic text-xl" dir="rtl" lang="ar">{word.skel}</span>.
            {diff && diff.expected && <> Möglicher Unterschied: <span className="arabic text-xl" dir="rtl" lang="ar">{diff.expected}</span>{diff.heard ? <> klang wie <span className="arabic text-xl" dir="rtl" lang="ar">{diff.heard}</span></> : " fehlte"}.</>}
            <span className="mt-1 block text-xs text-muted">Hinweis der Spracherkennung – nicht immer sicher. Hör dir das Wort an und versuche es nochmal.</span>
          </p>
        )}
        <div className="mt-4 grid gap-2">
          <Button variant="soft" onClick={() => { const pb = playReference({ audioUrl, segments: 2 }); void pb.done; }} data-testid="word-audio"><IconSpeaker className="size-5" /> Wort anhören{audioUrl ? " (Quran.com)" : " (Platzhalter-Ton)"}</Button>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={onHere}>Hier weiterlesen</Button>
            <Button variant="outline" onClick={onFlag} aria-pressed={flagged}>{flagged ? "Markierung weg" : "Unsicher markieren"}</Button>
          </div>
          <Button variant="ghost" onClick={onClose}>Schließen</Button>
        </div>
      </div>
    </div>
  );
}
