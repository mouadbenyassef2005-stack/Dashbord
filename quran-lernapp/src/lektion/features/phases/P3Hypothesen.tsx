"use client";
import { useState } from "react";
import { CONFIDENCE_LABEL, HYPOTHESES, type Confidence } from "@/lektion/content/lektion1";
import { Ar, RichText } from "@/lektion/ui/parts";
import { PhaseFrame } from "../PhaseFrame";
import { Colored } from "../visuals";
import { useLesson } from "../LessonContext";

function HypothesisCard({ index }: { index: number }) {
  const { dispatch } = useLesson();
  const h = HYPOTHESES[index];
  const [choice, setChoice] = useState<number | null>(null);
  const [conf, setConf] = useState<Confidence | null>(null);
  const [why, setWhy] = useState("");
  return (
    <div className="stack-lg">
      <div className="stack">
        <p className="eyebrow">Hypothese {index + 1} von {HYPOTHESES.length}</p>
        <h2><RichText text={h.title} /></h2>
      </div>
      {h.given && (
        <div className="panel stack" aria-label="Was du schon weißt"><p className="eyebrow">Was du schon weißt</p>
          <ul className="goals">{h.given.map((g) => <li key={g}><RichText text={g} /></li>)}</ul></div>
      )}
      <div className="task"><div className="stim"><Colored text={h.stimulus} size="hero" /></div></div>
      <p id={`q${index}`}><strong><RichText text={h.question} /></strong></p>
      <div className="options opts3" role="radiogroup" aria-labelledby={`q${index}`}>
        {h.options.map((o, i) => (
          <button key={o} role="radio" aria-checked={choice === i} className="opt" data-state={choice === i ? "right" : undefined} onClick={() => setChoice(i)}><RichText text={o} /></button>
        ))}
      </div>
      <div className="stack"><p className="eyebrow" id={`c${index}`}>Wie sicher bist du?</p>
        <div className="conf" role="radiogroup" aria-labelledby={`c${index}`}>
          {(Object.keys(CONFIDENCE_LABEL) as Confidence[]).map((c) => <button key={c} role="radio" aria-checked={conf === c} onClick={() => setConf(c)}>{CONFIDENCE_LABEL[c]}</button>)}
        </div>
      </div>
      <div className="stack"><label className="eyebrow" htmlFor={`w${index}`}>Deine Begründung (optional)</label>
        <textarea id={`w${index}`} value={why} onChange={(e) => setWhy(e.target.value)} placeholder="Woran machst du deine Vermutung fest?" /></div>
      <button className="btn btn-primary" disabled={choice === null || conf === null} onClick={() => dispatch({ t: "hyp", id: h.id, answer: { choice: choice!, confidence: conf!, why: why.trim() || undefined } })}>Hypothese festhalten</button>
    </div>
  );
}

export function P3Hypothesen({ onFinish }: { onFinish(): void }) {
  const { s } = useLesson();
  const answered = HYPOTHESES.filter((h) => s.hyp[h.id]).length;
  const all = answered === HYPOTHESES.length;
  return (
    <PhaseFrame
      phase={3} labels={["So funktioniert es", "Deine Hypothesen", "Festgehalten"]}
      canNext={(s.steps[3] ?? 0) === 0 || all} finishLabel="Weiter zu Phase 4: Auflösung" onFinish={onFinish}
      why={<p className="muted"><b>Productive Failure:</b> Wer erst selbst nach Regeln sucht, auch mit Fehlern, versteht die anschließende Erklärung tiefer als bei sofortiger Anleitung. Die Fehler sind der Zweck. Es gibt hier bewusst kein Feedback, es folgt in Phase 4.</p>}
    >
      {(step) => step === 0 ? (
        <>
          <div className="stack"><h1>Jetzt bist du dran, ohne Erklärung</h1>
            <p className="muted">Du bekommst sechs Aufgaben zu Dingen, die du noch nicht erklärt bekommen hast. Nutze das, was du schon gesehen hast, und suche das Muster.</p></div>
          <section className="panel stack">
            <div className="fact"><b>1</b><p><strong>Raten ist ausdrücklich erlaubt.</strong> Eine begründete Vermutung ist besser als keine.</p></div>
            <div className="fact"><b>2</b><p><strong>Falsch liegen ist hier Teil des Lernens.</strong> Du bekommst keine Wertung, nur die Auflösung in der nächsten Phase.</p></div>
            <div className="fact"><b>3</b><p><strong>Sag, wie sicher du bist.</strong> Das hilft dir, später zu sehen, wo du dich geirrt hast, obwohl du sicher warst.</p></div>
          </section>
          <p className="muted">Zur Erinnerung, das kennst du: <Colored text="بَ" size="body" /> = ba · <Colored text="تَ" size="body" /> = ta · <Colored text="ثَ" size="body" /> = tha · <Colored text="بَا" size="body" /> = bā</p>
        </>
      ) : step === 1 ? (
        all ? <p className="notice" role="status">Alle sechs Hypothesen sind festgehalten. Weiter geht es zur Übersicht.</p> : <HypothesisCard key={answered} index={answered} />
      ) : (
        <>
          <div className="stack"><h1>Deine sechs Hypothesen</h1><p className="muted">Ohne Wertung. Gleich siehst du, was davon stimmt.</p></div>
          <ul className="stack" style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {HYPOTHESES.map((h) => {
              const a = s.hyp[h.id];
              return (
                <li key={h.id} className="panel row between"><div className="stack"><strong><RichText text={h.title} /></strong><span className="muted">{a ? <><RichText text={h.options[a.choice]} /> · {CONFIDENCE_LABEL[a.confidence]}</> : "noch offen"}</span></div><Ar size="body">{h.stimulus}</Ar></li>
              );
            })}
          </ul>
        </>
      )}
    </PhaseFrame>
  );
}
