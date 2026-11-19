import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { buildExercise, type Exercise } from "@/domain/exercises";
import { planSession, type Planned } from "@/domain/session";
import { LETTER_BY_ID } from "@/content/letters";
import { useApp } from "./AppContext";
import { Ar, Icon, RichText } from "@/ui/parts";

/**
 * Eine Sitzung: Fehler werden am Ende der Warteschlange einmal erneut abgefragt (Abruf nach Fehler).
 * Jeder Versuch wird protokolliert; die Wertung kommt aus dem Ereignislog, nicht aus der Sitzung.
 */
export function Practice() {
  const { progress, introduced, record } = useApp();
  const plan = useMemo<Planned[]>(() => planSession(progress, introduced, Date.now()), []); // eslint-disable-line react-hooks/exhaustive-deps
  const [queue, setQueue] = useState<Planned[]>(plan);
  const [retried, setRetried] = useState<Set<string>>(new Set());
  const [picked, setPicked] = useState<number | null>(null);
  const [firstTry, setFirstTry] = useState(0);
  const [saveError, setSaveError] = useState(false);
  const [done, setDone] = useState(false);
  const [wrongLetters, setWrongLetters] = useState<string[]>([]);
  const total = useRef(plan.length);
  const pool = useMemo(() => [...introduced], [introduced]);

  const current = queue[0];
  const ex: Exercise | null = useMemo(
    () => (current ? buildExercise(current.type, current.letterId, pool, progress) : null),
    // Aufgabe bleibt stabil, bis die Warteschlange weiterrückt (nicht bei jedem Fortschritts-Update neu mischen)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [current, retried.size, queue.length],
  );

  if (plan.length === 0)
    return (
      <div className="stack fade">
        <h1>Noch nichts zu üben</h1>
        <p className="muted">Lerne zuerst einen Buchstaben kennen, dann erscheinen hier die Aufgaben.</p>
        <Link className="btn btn-primary" to="/buchstaben/alif">Mit Alif beginnen</Link>
      </div>
    );

  if (done || !ex)
    return (
      <div className="stack-lg fade">
        <h1>Geschafft.</h1>
        <p>{firstTry} von {total.current} Aufgaben beim ersten Versuch richtig.</p>
        {wrongLetters.length > 0 && (
          <p className="muted">Das wiederholen wir bald: {[...new Set(wrongLetters)].map((id) => LETTER_BY_ID.get(id)?.name).join(", ")}.</p>
        )}
        <p className="notice">Eine richtige Antwort macht einen Buchstaben noch nicht „gemeistert“. Dafür braucht es Wiederholungen an anderen Tagen, die der Planer für dich einteilt.</p>
        <div className="row"><Link className="btn btn-primary" to="/">Zurück zu Heute</Link><Link className="btn btn-secondary" to="/buchstaben">Mein Stand</Link></div>
      </div>
    );

  const answered = picked !== null;
  const correct = answered && picked === ex.answerIndex;
  const key = `${current.letterId}:${current.type}`;

  async function choose(i: number) {
    if (answered || !ex) return;
    setPicked(i);
    const ok = i === ex.answerIndex;
    const saved = await record({
      letterId: ex.letterId, skill: ex.skill, activity: ex.type, grade: ok ? 2 : 0, evidence: "recognition",
      confusedWith: ok ? undefined : ex.options[i].letterId,
    });
    setSaveError(!saved);
    if (ok && !retried.has(key)) setFirstTry((n) => n + 1);
    if (!ok) setWrongLetters((w) => [...w, ex.letterId]);
  }

  function next() {
    const wasWrong = picked !== ex!.answerIndex;
    let rest = queue.slice(1);
    if (wasWrong && !retried.has(key)) {
      rest = [...rest, current];
      setRetried((r) => new Set(r).add(key));
    }
    setPicked(null);
    if (rest.length === 0) setDone(true);
    setQueue(rest);
  }

  const progressPct = Math.round(((total.current - queue.length + (answered ? 1 : 0)) / (total.current + retried.size)) * 100);

  return (
    <div className="stack-lg fade" key={`${key}-${retried.size}-${queue.length}`}>
      <div className="stack">
        <div className="progress" role="progressbar" aria-valuenow={progressPct} aria-valuemin={0} aria-valuemax={100} aria-label="Fortschritt in dieser Übung"><span style={{ width: `${progressPct}%` }} /></div>
        <p className="eyebrow">{ex.skill === "contrast" ? "Unterscheiden" : ex.skill === "association" ? "Zuordnen" : "Erkennen"}</p>
      </div>
      <section className="stack" aria-live="polite">
        <h1 style={{ fontSize: 26 }}>{ex.prompt}</h1>
        {ex.promptArabic && <div className="hero"><Ar size="hero">{ex.promptArabic}</Ar></div>}
      </section>

      <div className="options" role="group" aria-label="Antworten">
        {ex.options.map((o, i) => {
          const state = !answered ? undefined : i === ex.answerIndex ? "right" : i === picked ? "wrong" : undefined;
          return (
            <button key={i} className={`opt ${o.arabic ? "ar-opt" : ""}`} data-state={state} disabled={answered}
              onClick={() => void choose(i)} {...(o.arabic ? { lang: "ar", dir: "rtl" } : {})}
              aria-label={o.arabic && o.letterId ? LETTER_BY_ID.get(o.letterId)?.name : undefined}>
              {o.label}
            </button>
          );
        })}
      </div>

      {answered && (
        <div className={`feedback fade ${correct ? "ok" : "no"}`} role="status">
          <span className={correct ? "ic-ok" : "ic-no"}>{correct ? Icon.ok : Icon.no}</span>
          <div><strong>{correct ? "Richtig." : "Nicht ganz."}</strong><span><RichText text={ex.explanation} /></span>
            {!correct && <span className="muted" style={{ display: "block", marginTop: 4 }}>Wir fragen das am Ende noch einmal.</span>}</div>
        </div>
      )}
      {saveError && (
        <p className="notice err" role="alert">Dieses Ergebnis konnte nicht gespeichert werden. Es zählt in dieser Sitzung, geht aber ggf. beim Schließen verloren.</p>
      )}
      {answered && <button className="btn btn-primary" onClick={next} autoFocus>Weiter</button>}
    </div>
  );
}
