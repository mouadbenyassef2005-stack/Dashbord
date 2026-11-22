"use client";
import { useMemo, useState } from "react";
import {
  ALIF_CONTRAST, CONFIDENCE_LABEL, CONSONANT_IDS, ELAB, HYPOTHESES, MARK, ONSET, SYLLABLES, VOWEL_INFO, VOWEL_LATIN, VOWEL_NAME, letterCh, letterName, type ConsonantId, type VowelId,
} from "@/lektion/content/lektion1";
import { CHECK_SPEC, buildSet } from "@/lektion/domain/lektion/tasks";
import { Ar, RichText } from "@/lektion/ui/parts";
import { PhaseFrame } from "../PhaseFrame";
import { TaskRunner } from "../TaskRunner";
import { Colored, Explode } from "../visuals";
import { useLesson } from "../LessonContext";

function Reveal() {
  const { s } = useLesson();
  const rows = HYPOTHESES.map((h) => ({ h, a: s.hyp[h.id] }));
  const right = rows.filter((r) => r.a && r.a.choice === r.h.answer).length;
  const sureWrong = rows.filter((r) => r.a && r.a.confidence === "sure" && r.a.choice !== r.h.answer).length;
  return (
    <>
      <div className="stack"><h1>Die Auflösung</h1>
        <p className="muted">Hier vergleichst du deine Hypothesen mit der Regel. Fehler sind erwartet, denn du hattest keine Erklärung.</p></div>
      <div className="kpis">
        <div className="kpi"><b>{right} von {HYPOTHESES.length}</b><small>Hypothesen stimmten</small></div>
        <div className="kpi"><b>{sureWrong}</b><small>sicher gewesen, aber falsch</small></div>
      </div>
      {sureWrong > 0 && <p className="notice">Gerade Irrtümer, bei denen du sicher warst, merkt man sich nach der Korrektur besonders gut. Schau sie dir genau an.</p>}
      {rows.map(({ h, a }) => {
        const ok = !!a && a.choice === h.answer;
        return (
          <article key={h.id} className="cmp" data-ok={ok}>
            <div className="row between"><h2><RichText text={h.title} /></h2><span className={`tag ${ok ? "ok" : "no"}`}>{ok ? "stimmt" : "stimmt nicht"}</span></div>
            <div className="row"><Colored text={h.stimulus} size="body" /><span className="muted"><RichText text={h.question} /></span></div>
            {a && <p><span className="muted">Deine Vermutung:</span> <strong><RichText text={h.options[a.choice]} /></strong> <span className="tag">{CONFIDENCE_LABEL[a.confidence]}</span></p>}
            {a?.why && <p className="muted">Deine Begründung: „{a.why}“</p>}
            {!ok && <p><span className="muted">Richtig:</span> <strong><RichText text={h.options[h.answer]} /></strong></p>}
            <p><RichText text={h.reveal} /></p>
          </article>
        );
      })}
    </>
  );
}

function Vowels() {
  const [c, setC] = useState<ConsonantId>("ba");
  const row = SYLLABLES.filter((x) => x.letterId === c && x.vowel !== "long");
  return (
    <>
      <div className="stack"><h1>Drei Vokalzeichen</h1><p className="muted">Jedes Zeichen ändert nur den Vokal. Der Buchstabe liefert den Konsonanten, bei jedem Buchstaben gleich.</p></div>
      <div className="cards">
        {(["fatha", "kasra", "damma"] as VowelId[]).map((v) => (
          <div key={v} className="card"><Ar size="teach" className="mk">◌{MARK[v]}</Ar><strong>{VOWEL_NAME[v]} · „{VOWEL_LATIN[v]}“</strong>
            <small>steht {VOWEL_INFO[v].place}</small><small>Aussehen: {VOWEL_INFO[v].look}</small><small>Mund: {VOWEL_INFO[v].mouth}</small></div>
        ))}
      </div>
      <section className="stack" aria-labelledby="try"><h2 id="try">Wähle einen Buchstaben</h2>
        <div className="seg" role="group" aria-label="Buchstabe wählen">
          {CONSONANT_IDS.map((id) => <button key={id} aria-pressed={c === id} aria-label={letterName(id)} onClick={() => setC(id)}><Ar size="body">{letterCh(id)}</Ar></button>)}
        </div>
        <div className="cards" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
          {row.map((x) => <div key={x.id} className="card"><Colored text={x.ar} /><strong>{x.tr}</strong><small>{ONSET[c]} + {VOWEL_LATIN[x.vowel as VowelId]}</small></div>)}
        </div>
      </section>
      <section className="panel stack" aria-labelledby="len"><h2 id="len">Kurz und lang</h2>
        <div className="eq"><div className="box"><Colored text="بَ" /><small>ba · kurz</small></div><span className="op">→</span><div className="box"><Colored text="بَا" /><small>bā · lang</small></div></div>
        <p className="muted">Fatha plus Alif ergibt ein langes ā. Die Länge unterscheidet im Arabischen Wörter, deshalb zählt sie später bei Tipp-Antworten.</p>
        <p className="muted">Am Ende der Beispielwörter lassen wir den Endvokal weg (Pausalform). Das Zeichen für „kein Vokal“ lernst du später.</p>
      </section>
    </>
  );
}

function AlifExact() {
  return (
    <>
      <div className="stack"><h1>Alif genau betrachtet</h1><p className="muted">Alif sieht aus wie ein Buchstabe unter vielen, ist aber kein Konsonant wie <Ar size="body">ب</Ar>, <Ar size="body">ت</Ar> oder <Ar size="body">ث</Ar>.</p></div>
      <div className="scroll-x"><table className="t" aria-label="Vergleich Alif und Konsonanten">
        <thead><tr><th scope="col">Merkmal</th><th scope="col">Alif <Ar size="body">ا</Ar></th><th scope="col"><Ar size="body">ب ت ث</Ar></th></tr></thead>
        <tbody>{ALIF_CONTRAST.map((r) => <tr key={r.feature}><th scope="row" style={{ textTransform: "none", letterSpacing: 0, fontSize: 14, color: "var(--text)" }}>{r.feature}</th><td className="hl"><RichText text={r.alif} /></td><td><RichText text={r.others} /></td></tr>)}</tbody></table></div>
      <section className="panel stack" aria-labelledby="mis"><h2 id="mis">Häufiger Irrtum</h2>
        <p>„Alif ist der Buchstabe für <em>a</em>.“ Das stimmt nur halb. Das <strong>kurze</strong> a schreibt die Fatha über einem Konsonanten. Alif <strong>dehnt</strong> es, wenn es danach steht. Im Namen „Alif“ hörst du am Anfang einen kleinen Stimmeinsatz, die Hamza. Sie hat eigene Zeichen und kommt in einer späteren Lektion.</p></section>
      <section className="stack" aria-labelledby="bab"><h2 id="bab">Warum hängt das zweite <Ar size="body">ب</Ar> nicht an?</h2>
        <div className="big-ar"><Colored text="بَاب" size="hero" /></div>
        <Explode letters={["ب", "ا", "ب"]} />
        <p className="muted"><Ar size="body">ب</Ar> (1) verbindet sich nach links mit dem Alif (2). Alif nimmt die Verbindung von rechts an, gibt aber keine nach links weiter. Deshalb beginnt das zweite <Ar size="body">ب</Ar> (3) neu und steht frei. Wort: <strong>bāb</strong>, „Tür“.</p></section>
    </>
  );
}

function Elaboration() {
  const { s, dispatch } = useLesson();
  const [shown, setShown] = useState<Record<string, boolean>>({});
  return (
    <>
      <div className="stack"><h1>Erkläre es in eigenen Worten</h1><p className="muted">Wer etwas selbst erklärt, verknüpft es mit dem, was er schon weiß. Schreibe zwei Sätze, dann vergleiche mit der Musterantwort.</p></div>
      {ELAB.map((e) => {
        const a = s.elab[e.id] ?? { text: "" };
        return (
          <section key={e.id} className="stack panel">
            <label htmlFor={e.id}><strong><RichText text={e.question} /></strong></label>
            <textarea id={e.id} value={a.text} onChange={(ev) => dispatch({ t: "elab", id: e.id, answer: { ...a, text: ev.target.value } })} placeholder="Deine Erklärung …" />
            {!shown[e.id] ? <div><button className="btn btn-secondary" disabled={a.text.trim().length < 8} onClick={() => setShown({ ...shown, [e.id]: true })}>Musterantwort zeigen</button></div> : (
              <>
                <p className="notice" role="note"><strong>Musterantwort:</strong> <RichText text={e.model} /></p>
                <div className="stack"><p className="eyebrow" id={`r-${e.id}`}>Wie gut passt deine Antwort?</p>
                  <div className="conf" role="radiogroup" aria-labelledby={`r-${e.id}`}>
                    {([["match", "Passt"], ["partial", "Teilweise"], ["off", "Weicht ab"]] as const).map(([k, l]) => <button key={k} role="radio" aria-checked={a.rating === k} onClick={() => dispatch({ t: "elab", id: e.id, answer: { ...a, rating: k } })}>{l}</button>)}
                  </div></div>
              </>
            )}
          </section>
        );
      })}
    </>
  );
}

export function P4Verstehen({ onFinish }: { onFinish(): void }) {
  const { s, dispatch } = useLesson();
  const check = useMemo(() => buildSet(CHECK_SPEC, Math.random, false), []);
  const step = s.steps[4] ?? 0;
  const rated = ELAB.every((e) => s.elab[e.id]?.rating);
  const checked = !!s.results[4];
  const res = s.results[4] ?? [];
  const canNext = step === 3 ? rated : step === 4 ? checked : true;
  return (
    <PhaseFrame
      phase={4} labels={["Auflösung", "Vokalzeichen", "Alif genau", "Eigene Worte", "Verständnis-Check"]} canNext={canNext}
      finishLabel="Weiter zu Phase 5: Anwenden" onFinish={onFinish}
      why={<><p className="muted"><b>Explizite Erklärung nach dem Versuchen:</b> Jetzt passt die Regel in die Lücke, die du dir selbst geschaffen hast.</p><p className="muted"><b>Elaboration:</b> Selbst erklären verknüpft neuen Stoff mit Vorwissen. <b>Feedback:</b> sofort und mit Begründung, nicht nur „falsch“.</p></>}
    >
      {(st) => st === 0 ? <Reveal /> : st === 1 ? <Vowels /> : st === 2 ? <AlifExact /> : st === 3 ? <Elaboration /> : (
        <>
          <div className="stack"><h1>Verständnis-Check</h1><p className="muted">Vier kurze Fragen mit sofortiger Rückmeldung und Hinweis. Falsche Fragen kommen am Ende noch einmal.</p></div>
          {checked
            ? <div className="stack"><div className="kpis"><div className="kpi"><b>{res.filter((r) => r.correctness === "right").length} von {res.length}</b><small>im ersten Versuch richtig</small></div></div>
                <p className="notice" role="status">Gespeichert. Fehler sind hier kein Problem: Sie zeigen, was in Phase 5 und 6 nochmal auftauchen sollte.</p></div>
            : <TaskRunner tasks={check} feedback="immediate" hints requeueWrong label="Frage" onDone={(rs) => dispatch({ t: "results", phase: 4, results: rs, now: Date.now() })} />}
        </>
      )}
    </PhaseFrame>
  );
}
