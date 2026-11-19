import { Link } from "react-router-dom";
import { planSession, nextToIntroduce } from "@/domain/session";
import { LETTER_BY_ID } from "@/content/letters";
import { useApp } from "./AppContext";
import { Ar } from "@/ui/parts";

export function Today() {
  const { progress, introduced, persistent } = useApp();
  const plan = planSession(progress, introduced, Date.now());
  const due = plan.filter((p) => p.why === "due").length;
  const next = nextToIntroduce(introduced);
  const nextLetter = next ? LETTER_BY_ID.get(next) : undefined;

  return (
    <div className="stack-lg fade">
      <header className="stack">
        <p className="eyebrow">Heute</p>
        <h1>{introduced.size === 0 ? "Fang mit dem ersten Buchstaben an." : due > 0 ? "Zeit, Gelerntes abzurufen." : "Bereit für den nächsten Schritt."}</h1>
        <p className="muted">Kein Streak-Druck: Wenn du Tage pausierst, planen wir die Wiederholungen sanft neu.</p>
      </header>

      {!persistent && (
        <p className="notice" role="status">Dein Lernstand wird in diesem Browser gerade nicht dauerhaft gespeichert (z. B. privater Modus). Nutze unter „Ich“ die Sicherung.</p>
      )}

      {plan.length > 0 && (
        <section className="panel stack" aria-labelledby="rev">
          <h2 id="rev">{due > 0 ? `${due} Wiederholungen fällig` : "Übung zum Festigen"}</h2>
          <p className="muted">{plan.length} Aufgaben, gemischt aus deinen bisherigen Buchstaben. Es zählt Genauigkeit, nicht Tempo.</p>
          <Link className="btn btn-primary" to="/ueben">Jetzt üben</Link>
        </section>
      )}

      {nextLetter ? (
        <section className="panel row between" aria-labelledby="nxt">
          <div className="stack">
            <h2 id="nxt">Nächster Buchstabe</h2>
            <p className="muted">{nextLetter.name} · {nextLetter.sound}</p>
            <Link className="btn btn-secondary" to={`/buchstaben/${nextLetter.id}`}>Kennenlernen</Link>
          </div>
          <Ar size="teach">{nextLetter.ch}</Ar>
        </section>
      ) : (
        <p className="panel">Alle 28 Buchstaben sind eingeführt. Weiter geht es mit Wiederholung; Kontextformen und Silben folgen.</p>
      )}
    </div>
  );
}
