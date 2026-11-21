import { useState } from "react";
import { LETTER_BY_ID } from "@/content/letters";
import type { Stroke } from "@/domain/handwriting/geometry";
import { analyze, analyzeFree, type FreeResult, type WritingResult } from "@/domain/handwriting/score";
import { TEMPLATE_BY_ID } from "@/domain/handwriting/templates";
import { WritingPad, PAD } from "./WritingPad";
import { Ar } from "./parts";

export interface WriteOutcome { letterId: string; mode: "trace" | "free"; grade: 0 | 1 | 2 | 3; evaluated: boolean; peeked: boolean; recognizedAs?: string }

function Check({ level, children }: { level: "ok" | "mid" | "no"; children: string }) {
  return <li><span className={level} aria-hidden>{level === "ok" ? "✓" : level === "mid" ? "~" : "✗"}</span><span>{children}</span></li>;
}

/** Eine Schreibaufgabe (Nachzeichnen oder frei) mit Strichauswertung. Zu kleine/leere Eingaben zählen nicht. */
export function WriteTask({ letterId, mode, onDone, onSkip }: { letterId: string; mode: "trace" | "free"; onDone(o: WriteOutcome): void; onSkip(): void }) {
  const letter = LETTER_BY_ID.get(letterId)!;
  const template = TEMPLATE_BY_ID.get(letterId)!;
  const [attempt, setAttempt] = useState(0);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [result, setResult] = useState<(WritingResult & Partial<FreeResult>) | null>(null);
  const [peeked, setPeeked] = useState(false);
  const showGuide = mode === "trace" || peeked;
  const good = !!result && result.grade === 2;
  const valid = !!result && !result.empty && !result.tooSmall;

  function check() {
    const res = mode === "free" ? analyzeFree(strokes, letterId, PAD) : analyze(strokes, template, PAD);
    setResult(res);
  }
  const retry = () => { setResult(null); setStrokes([]); setAttempt((a) => a + 1); };

  return (
    <div className="stack">
      <h3>{mode === "trace" ? <>Zeichne <b>{letter.name}</b> nach.</> : <>Schreibe <b>{letter.name}</b> aus dem Gedächtnis.</>}</h3>
      <p className="muted">
        {mode === "trace" ? "Beginne am orangen Punkt, Arabisch läuft von rechts nach links." : `Laut „${letter.syllable}“. Denk an die Punkte.`} Größe und Position sind egal.
      </p>
      {mode === "free" && !peeked && !result && (
        <div className="row"><span aria-hidden><Ar size="body">؟</Ar></span><button className="btn btn-ghost" onClick={() => setPeeked(true)}>Vorlage zeigen (zählt dann als Nachzeichnen)</button></div>
      )}
      <WritingPad guide={showGuide ? template : null} resetKey={`${letterId}-${attempt}`} disabled={!!result} onChange={setStrokes} />
      {result && (
        <div className={`feedback fade ${good ? "ok" : "no"}`} role="status" style={{ flexDirection: "column" }}>
          <strong>{result.empty ? "Noch nichts gezeichnet." : result.tooSmall ? "Zu klein." : good ? "Gut geschrieben." : result.grade === 1 ? "Fast." : "Noch nicht ganz."}</strong>
          {valid && (
            <ul className="checks">
              <Check level={result.shape.level === "good" ? "ok" : result.shape.level === "near" ? "mid" : "no"}>{`Form: ${result.shape.level === "good" ? "passt" : result.shape.level === "near" ? "ungefähr" : "weicht ab"}`}</Check>
              <Check level={result.dots.level === "ok" ? "ok" : "no"}>{result.dots.expected === 0 && result.dots.level === "ok" ? "Punkte: keine nötig" : result.dots.level === "ok" ? `Punkte: ${result.dots.expected}, richtig gesetzt` : result.dots.level === "wrongPlace" ? "Punkte: auf der falschen Seite (oben/unten)" : `Punkte: erwartet ${result.dots.expected}, erkannt ${result.dots.found}`}</Check>
              <Check level={result.direction === "ok" ? "ok" : result.direction === "reversed" ? "no" : "mid"}>{result.direction === "ok" ? "Richtung: richtig" : result.direction === "reversed" ? "Richtung: umgekehrt" : "Richtung: nicht beurteilbar (anderer Strichaufbau)"}</Check>
            </ul>
          )}
          {result.messages.map((m) => <p key={m} className="muted">{m}</p>)}
          {result.recognizedAs && result.recognizedAs !== letterId && <p className="muted">Erkannt eher als: <Ar size="body">{LETTER_BY_ID.get(result.recognizedAs)?.ch}</Ar> ({LETTER_BY_ID.get(result.recognizedAs)?.name}). Das ist eine Schätzung.</p>}
        </div>
      )}
      <div className="row">
        {!result && <button className="btn btn-primary" disabled={strokes.length === 0} onClick={check}>Prüfen</button>}
        {result && !valid && <button className="btn btn-secondary" onClick={retry}>Nochmal versuchen</button>}
        {result && valid && result.grade < 2 && <button className="btn btn-secondary" onClick={retry}>Nochmal versuchen</button>}
        {result && valid && (
          <button className="btn btn-primary" autoFocus onClick={() => onDone({ letterId, mode, grade: result.grade, evaluated: true, peeked, recognizedAs: result.recognizedAs })}>Weiter</button>
        )}
        {!result && <button className="btn btn-ghost" onClick={onSkip}>Überspringen</button>}
      </div>
    </div>
  );
}
