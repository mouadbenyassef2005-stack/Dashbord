import { Link, useNavigate, useParams } from "react-router-dom";
import { LETTERS, LETTER_BY_ID, formsOf, dotsText, type FormPos } from "@/content/letters";
import { confusionsOf, masteryFor } from "@/domain/progress";
import { SKILLS, type Skill } from "@/domain/types";
import { SKILL_TO_TYPE } from "@/domain/session";
import { useApp } from "./AppContext";
import { Ar, Mastery, LEVEL_LABEL } from "@/ui/parts";
import { AudioButton } from "@/ui/AudioButton";
import { TEMPLATE_BY_ID } from "@/domain/handwriting/templates";

const SKILL_LABEL: Record<Skill, string> = {
  visual: "Buchstaben erkennen", sound: "Laut hören → Buchstabe", association: "Buchstabe ↔ Laut", pronunciation: "Aussprache",
  writing: "Schreiben", contextForm: "Kontextformen", contrast: "Ähnliche unterscheiden", reading: "Lesen",
};
const FORM_LABEL: Record<FormPos, string> = { isolated: "Einzeln", initial: "Anfang", medial: "Mitte", final: "Ende" };

export function LettersPage() {
  const { introduced, progress } = useApp();
  return (
    <div className="stack-lg fade">
      <header className="stack"><p className="eyebrow">Buchstaben</p><h1>Dein Stand je Buchstabe</h1>
        <p className="muted">Die Segmente zeigen „Erkennen“. Details je Fähigkeit findest du beim Buchstaben. Gemeistert heißt: mehrfach, an verschiedenen Tagen, mit verschiedenen Aufgaben richtig.</p></header>
      <div className="grid">
        {LETTERS.map((l) => (
          <Link key={l.id} to={`/buchstaben/${l.id}`} className="tile" aria-label={`${l.name}, ${LEVEL_LABEL[introduced.has(l.id) ? masteryFor(progress, l.id, "visual").level : "new"]}`}>
            <Ar size="body">{l.ch}</Ar><small>{l.name}</small>
            <Mastery level={introduced.has(l.id) ? masteryFor(progress, l.id, "visual").level : "new"} />
          </Link>
        ))}
      </div>
    </div>
  );
}

export function LetterDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { introduced, introduce, progress } = useApp();
  const l = id ? LETTER_BY_ID.get(id) : undefined;
  if (!l) return <div className="stack"><p>Diesen Buchstaben gibt es nicht.</p><Link className="btn btn-secondary" to="/buchstaben">Zurück</Link></div>;
  const forms = formsOf(l);
  const known = introduced.has(l.id);
  const confusions = confusionsOf(progress, l.id);

  return (
    <article className="stack-lg fade">
      <header className="hero stack">
        <Ar size="hero" label={l.name}>{l.ch}</Ar>
        <div>
          <h1>{l.name} <Ar size="body" className="ar-ui">{l.nameAr}</Ar></h1>
          <p className="muted">Laut: {l.sound} · {dotsText(l.dots)}</p>
        </div>
        <div className="row" style={{ justifyContent: "center" }}>
          <AudioButton letterId={l.id} kind="name" label="Name hören" />
          <AudioButton letterId={l.id} kind="sound" label={`Laut „${l.syllable}“ hören`} />
        </div>
      </header>

      <section className="stack" aria-labelledby="how">
        <h2 id="how">Aussprache</h2>
        <p>{l.tip}</p>
        <p className="notice">Name und Laut sind getrennt: Der Name ist „{l.name}“, den Laut übst du als Silbe „{l.syllable}“, weil ein Konsonant allein nicht sprechbar ist. Ob du ihn richtig triffst, kann die App nicht automatisch bewerten.</p>
      </section>

      <section className="stack" aria-labelledby="forms">
        <h2 id="forms">Formen</h2>
        <div className="forms">
          {(Object.keys(forms) as FormPos[]).map((k) => (
            <div key={k}><Ar size="teach" label={`${FORM_LABEL[k]}form von ${l.name}`}>{forms[k]}</Ar><small>{FORM_LABEL[k]}</small></div>
          ))}
        </div>
        <p className="muted">
          {l.joinsNext ? `${l.name} verbindet sich mit dem folgenden Buchstaben.` : `${l.name} verbindet sich nicht mit dem folgenden Buchstaben. Nach ihm beginnt die Verbindung neu.`}
          {" "}Das gezielte Üben der Formen folgt in einem späteren Schritt.
        </p>
      </section>

      {l.similar.length > 0 && (
        <section className="stack" aria-labelledby="sim">
          <h2 id="sim">Leicht zu verwechseln</h2>
          <div className="row">
            {l.similar.map((s) => { const o = LETTER_BY_ID.get(s)!; return (
              <Link key={s} to={`/buchstaben/${s}`} className="tile" style={{ minHeight: 0, minWidth: 96 }}>
                <Ar size="teach">{o.ch}</Ar><small>{o.name}: {dotsText(o.dots)}</small>
              </Link>); })}
          </div>
        </section>
      )}

      <section className="stack" aria-labelledby="skills">
        <h2 id="skills">Dein Stand</h2>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {SKILLS.map((s) => {
            const available = !!SKILL_TO_TYPE[s] || (s === "writing" && TEMPLATE_BY_ID.has(l.id));
            const m = masteryFor(progress, l.id, s);
            return (
              <li key={s} className="row between" style={{ padding: "10px 0", borderBottom: "1px solid var(--line)" }}>
                <span>{SKILL_LABEL[s]}</span>
                {available ? <span className="row"><span className="muted" style={{ fontSize: 13 }}>{LEVEL_LABEL[m.level]}</span><Mastery level={m.level} /></span>
                  : <span className="chip">folgt</span>}
              </li>
            );
          })}
        </ul>
        {confusions.length > 0 && <p className="muted">Bisher verwechselt mit: {confusions.map(([c, n]) => `${LETTER_BY_ID.get(c)?.name} (${n}×)`).join(", ")}.</p>}
      </section>

      <div className="row">
        {known && TEMPLATE_BY_ID.has(l.id) && <Link className="btn btn-secondary" to="/schreiben">Schreiben üben</Link>}
        {!known ? (
          <button className="btn btn-primary" onClick={() => { introduce(l.id); nav("/ueben"); }}>Kennengelernt – jetzt üben</button>
        ) : (
          <Link className="btn btn-primary" to="/ueben">Üben</Link>
        )}
        <Link className="btn btn-ghost" to="/buchstaben">Alle Buchstaben</Link>
      </div>
    </article>
  );
}
