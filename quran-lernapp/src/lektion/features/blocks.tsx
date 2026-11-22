"use client";
import { useState, type ReactNode } from "react";
import {
  ALIF, ARTICULATION, CONSONANT_IDS, FEATURE, MARK, ONSET, VOWEL_LATIN, letterCh, letterName, type ConsonantId, type VowelId,
} from "@/lektion/content/lektion1";
import { LETTER_BY_ID } from "@/lektion/content/letters";
import { mnemonicStage, MNEMONIC_STAGE_LABEL, type LogEntry } from "@/lektion/domain/lektion/competence";
import { TEMPLATE_BY_ID } from "@/lektion/domain/handwriting/templates";
import type { TaskResult } from "@/lektion/domain/lektion/tasks";
import { AudioPlayer } from "@/lektion/ui/AudioPlayer";
import { Ar, RichText } from "@/lektion/ui/parts";
import { WriteTask, type WriteOutcome } from "@/lektion/ui/WriteTask";
import { Colored, Skeleton } from "./visuals";
import { useLesson } from "./LessonContext";

/** Eine nummerierte Tatsache. */
export function Fact({ n, children }: { n: number; children: ReactNode }) {
  return <div className="fact"><b>{n}</b><p>{children}</p></div>;
}

/** Wandelt ein Schreibergebnis in ein Plan-Ergebnis der Kompetenz „Schreiben“ um. */
export function writeResult(o: WriteOutcome): TaskResult {
  return {
    taskId: `letter:${o.letterId}#write-${o.mode}`, itemId: `letter:${o.letterId}`, competence: "write", type: "write",
    correctness: o.grade >= 2 ? "right" : "wrong", grade: o.peeked && o.grade > 1 ? 1 : o.grade, hintUsed: o.peeked, answer: o.mode,
    confusedWith: o.recognizedAs && o.recognizedAs !== o.letterId ? `letter:${o.recognizedAs}` : undefined,
  };
}

/** Folge von Schreibaufgaben; jedes gewertete Ergebnis geht in den Wiederholungsplan. */
export function WriteSeq({ plan, unit, phase, onFinished }: { plan: { letterId: string; mode: "trace" | "free"; note?: string }[]; unit: number; phase: number; onFinished?: () => void }) {
  const { dispatch } = useLesson();
  const [i, setI] = useState(0);
  if (i >= plan.length) return <p className="notice" role="status">Alle {plan.length} Schreibaufgaben erledigt. Die Rückmeldung zeigt Form, Punkte und Richtung, nicht die Schönheit der Handschrift.</p>;
  const next = () => { const n = i + 1; setI(n); if (n >= plan.length) onFinished?.(); };
  return (
    <div className="stack">
      <p className="eyebrow">Schreibaufgabe {i + 1} von {plan.length}{plan[i].note ? ` · ${plan[i].note}` : ""}</p>
      <WriteTask key={i} letterId={plan[i].letterId} mode={plan[i].mode}
        onDone={(o) => { if (o.evaluated) dispatch({ t: "results", unit, phase, results: [writeResult(o)], now: Date.now(), keep: false }); next(); }} onSkip={next} />
    </div>
  );
}

const ABOVE = [{ x: 38, y: 26 }, { x: 62, y: 26 }, { x: 50, y: 10 }];
const BELOW = [{ x: 38, y: 86 }, { x: 62, y: 86 }];
const BOWL = TEMPLATE_BY_ID.get("ba")!.body[0];
const bowlPath = () => {
  let d = `M${BOWL[0].x} ${BOWL[0].y}`;
  for (let i = 1; i < BOWL.length - 1; i++) d += ` Q${BOWL[i].x} ${BOWL[i].y} ${(BOWL[i].x + BOWL[i + 1].x) / 2} ${(BOWL[i].y + BOWL[i + 1].y) / 2}`;
  return d + ` L${BOWL.at(-1)!.x} ${BOWL.at(-1)!.y}`;
};

/** Entdecken per Baukasten: gleiche Grundform, nur die Punkte entscheiden. */
export function DotsBuilder({ found, onFound }: { found: string[]; onFound(id: string): void }) {
  const [above, setAbove] = useState([false, false, false]);
  const [below, setBelow] = useState([false, false]);
  const a = above.filter(Boolean).length, b = below.filter(Boolean).length;
  const idOf = (x: number, y: number) => (x === 0 && y === 1 ? "ba" : x === 2 && y === 0 ? "ta" : x === 3 && y === 0 ? "tha" : x === 1 && y === 0 ? "nun" : x === 0 && y === 2 ? "ya" : null);
  const hit = idOf(a, b);
  const toggle = (kind: "a" | "b", i: number) => {
    const arr = kind === "a" ? [...above] : [...below];
    arr[i] = !arr[i];
    if (kind === "a") setAbove(arr); else setBelow(arr);
    const na = kind === "a" ? arr.filter(Boolean).length : a, nb = kind === "b" ? arr.filter(Boolean).length : b;
    const id = idOf(na, nb);
    if (id === "ba" || id === "ta" || id === "tha") onFound(id);
  };
  const msg = hit === "nun" || hit === "ya"
    ? `Das ist ${letterName(hit)} (${letterCh(hit)}). Gleiche Grundform, anderer Buchstabe, den du später lernst.`
    : hit ? `Das ist ${letterName(hit)}: Laut „${ONSET[hit as ConsonantId]}“.`
    : a + b === 0 ? "Die Grundform ohne Punkte ist hier noch kein Buchstabe. Setze Punkte."
    : "Diese Punkt-Kombination ergibt keinen Buchstaben. Probiere eine andere.";
  return (
    <div className="builder">
      <div className="svgbox" style={{ margin: "0 auto", maxWidth: 220 }}>
        <svg viewBox="0 0 100 100" role="img" aria-label={`Bogen mit ${a} Punkt(en) oben und ${b} unten`}>
          <line x1="4" y1="70" x2="96" y2="70" stroke="var(--line)" strokeDasharray="3 4" />
          <path d={bowlPath()} fill="none" stroke="var(--text-2)" strokeWidth="9" strokeLinecap="round" />
          {above.map((on, i) => on && <circle key={`a${i}`} cx={ABOVE[i].x} cy={ABOVE[i].y} r="6.5" fill="var(--accent)" />)}
          {below.map((on, i) => on && <circle key={`b${i}`} cx={BELOW[i].x} cy={BELOW[i].y} r="6.5" fill="var(--accent)" />)}
        </svg>
      </div>
      <div className="dotslots">
        <div className="stack" style={{ textAlign: "center" }}>
          <p className="eyebrow">Punkte oben</p>
          <div className="slotrow">{above.map((on, i) => <button key={i} className="slot" aria-pressed={on} aria-label={`Punkt oben ${i + 1}`} onClick={() => toggle("a", i)} />)}</div>
          <p className="eyebrow">Punkte unten</p>
          <div className="slotrow">{below.map((on, i) => <button key={i} className="slot" aria-pressed={on} aria-label={`Punkt unten ${i + 1}`} onClick={() => toggle("b", i)} />)}</div>
        </div>
        <div style={{ textAlign: "center" }} aria-live="polite">
          {hit && <div className="big-ar" style={{ fontSize: 72, lineHeight: 1.6 }} lang="ar" dir="rtl">{letterCh(hit)}</div>}
          <p className="muted"><RichText text={msg} /></p>
        </div>
        <div className="found" aria-label="Gefundene Buchstaben">
          {CONSONANT_IDS.map((id) => <span key={id} className="chip" data-on={found.includes(id)}>{found.includes(id) ? "✓ " : ""}{letterName(id)}</span>)}
        </div>
      </div>
    </div>
  );
}

/** Buchstabenkarte: Merkhilfe wird mit wachsendem Können ausgeblendet (Stufe 1 Bild und Satz, 2 Stichwort, 3 keine). */
export function LetterCard({ id, log, showSound = true }: { id: string; log: LogEntry[]; showSound?: boolean }) {
  const l = LETTER_BY_ID.get(id)!;
  const stage = mnemonicStage(log, id);
  const f = FEATURE[id as keyof typeof FEATURE];
  const audio = id === "alif" ? "name-alif" : `sound-${id}`;
  return (
    <div className="card">
      <Ar size="teach">{l.ch}</Ar>
      <strong>{l.name}{id !== "alif" ? ` · „${ONSET[id as ConsonantId]}“` : ""}</strong>
      {stage === 1 && <Skeleton letterId={id} label={`Zeichnung von ${l.name}: ${f.text}`} />}
      {stage === 1 && <small>{f.anchor}</small>}
      {stage === 2 && <small>Merkhilfe: {f.keyword}</small>}
      {stage >= 3 && <small className="muted">Ohne Merkhilfe</small>}
      <small className="stage-tag">Stufe {stage}: {MNEMONIC_STAGE_LABEL[stage]}</small>
      {showSound && <AudioPlayer id={audio} label={id === "alif" ? "Name hören" : "Laut hören"} />}
    </div>
  );
}

/** Aussprache-Anleitung mit Zungen-/Lippenposition. */
export function Articulation({ id }: { id: string }) {
  const a = ARTICULATION[id];
  if (!a) return null;
  return (
    <section className="panel stack" aria-label={`Aussprache ${a.title}`}>
      <h3>{a.title}</h3>
      <ol className="stack" style={{ margin: 0, paddingLeft: 20 }}>{a.steps.map((st) => <li key={st}>{st}</li>)}</ol>
      <p className="muted"><strong>Häufiger Fehler:</strong> {a.common}</p>
    </section>
  );
}

/** Silbenbaukasten: Konsonant + Vokalzeichen (+ Alif für ā). Spielt die Aufnahme der Silbe, wenn vorhanden. */
export function SyllableBuilder({ vowels, allowLong, onProgress }: { vowels: VowelId[]; allowLong: boolean; onProgress(seen: { letters: string[]; vowels: string[]; long: boolean }): void }) {
  const [c, setC] = useState<ConsonantId>("ba");
  const [v, setV] = useState<VowelId>(vowels[0]);
  const [long, setLong] = useState(false);
  const [seen, setSeen] = useState({ letters: ["ba"], vowels: [vowels[0]] as string[], long: false });
  const upd = (next: typeof seen) => { setSeen(next); onProgress(next); };
  const ar = letterCh(c) + MARK[v] + (long ? ALIF : "");
  const tr = ONSET[c] + (long ? "ā" : VOWEL_LATIN[v]);
  const audio = !long ? `syl-${c}-${v}` : "none";
  return (
    <div className="stack">
      <div className="seg" role="group" aria-label="Buchstabe wählen">
        {CONSONANT_IDS.map((id) => <button key={id} aria-pressed={c === id} aria-label={letterName(id)} onClick={() => { setC(id); upd({ ...seen, letters: [...new Set([...seen.letters, id])] }); }}><Ar size="body">{letterCh(id)}</Ar></button>)}
      </div>
      {vowels.length > 1 && (
        <div className="seg" role="group" aria-label="Vokalzeichen wählen">
          {vowels.map((x) => <button key={x} aria-pressed={v === x} aria-label={x} onClick={() => { setV(x); upd({ ...seen, vowels: [...new Set([...seen.vowels, x])] }); }}><Ar size="body">◌{MARK[x]}</Ar></button>)}
        </div>
      )}
      <div className="eq" role="group" aria-label={`${letterName(c)} plus ${v}${long ? " plus Alif" : ""} ergibt ${tr}`}>
        <div className="box"><Ar size="teach">{letterCh(c)}</Ar><small>Konsonant {ONSET[c]}</small></div>
        <span className="op" aria-hidden>+</span>
        <div className="box"><Ar size="teach" className="mk">◌{MARK[v]}</Ar><small>{v}: {VOWEL_LATIN[v]}</small></div>
        {long && <><span className="op" aria-hidden>+</span><div className="box"><Ar size="teach">{ALIF}</Ar><small>Alif: dehnt</small></div></>}
        <span className="op" aria-hidden>=</span>
        <div className="box res"><Colored text={ar} /><small>{tr}{long ? " (lang)" : ""}</small></div>
      </div>
      <div className="row" style={{ justifyContent: "center" }}>
        <AudioPlayer id={audio} label={`„${tr}“ hören`} />
        {allowLong && <button className="btn btn-secondary" aria-pressed={long} onClick={() => { const nl = !long; setLong(nl); upd({ ...seen, long: seen.long || nl }); }}>{long ? "Alif weglassen" : "Alif anhängen"}</button>}
      </div>
      <p className="muted" style={{ textAlign: "center" }}>{long ? "Mit Alif wird das a gedehnt: ā ist etwa doppelt so lang wie a." : "Konsonant plus Vokalzeichen ergibt eine Silbe."}</p>
    </div>
  );
}
