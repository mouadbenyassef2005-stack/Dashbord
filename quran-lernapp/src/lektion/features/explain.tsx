"use client";
import { useState } from "react";
import {
  ALIF, CONFIDENCE_LABEL, MARK, ONSET, VOWEL_INFO, VOWEL_LATIN, VOWEL_NAME, WORDS, WORD_VOCALIZATION_NOTE, type VowelId,
} from "@/lektion/content/lektion1";
import { LETTER_BY_ID } from "@/lektion/content/letters";
import type { ExplainKind, UnitConfig } from "@/lektion/content/units";
import { hasAudio } from "@/lektion/audio/manifest";
import { AudioPlayer } from "@/lektion/ui/AudioPlayer";
import { Ar, RichText } from "@/lektion/ui/parts";
import { SpeakCompare } from "@/lektion/ui/SpeakCompare";
import { Articulation, Fact } from "./blocks";
import { useLesson } from "./LessonContext";
import { Colored, Explode } from "./visuals";

export function Reveal({ unit }: { unit: UnitConfig }) {
  const { s } = useLesson();
  const rows = unit.hyps.map((h) => ({ h, a: s.hyp[h.id] }));
  const answered = rows.filter((r) => r.a);
  const right = answered.filter((r) => r.a!.choice === r.h.answer).length;
  const sureWrong = answered.filter((r) => r.a!.confidence === "sure" && r.a!.choice !== r.h.answer).length;
  return (
    <>
      <div className="stack"><h1>Die Auflösung</h1><p className="muted">Du vergleichst deine Vermutungen mit der Regel. Wichtig ist nicht nur, was stimmt, sondern <strong>warum</strong>, und woher typische Fehler kommen.</p></div>
      <div className="kpis">
        <div className="kpi"><b>{right} von {answered.length}</b><small>Hypothesen stimmten</small></div>
        <div className="kpi"><b>{sureWrong}</b><small>sicher gewesen, aber falsch</small></div>
      </div>
      {sureWrong > 0 && <p className="notice">Irrtümer, bei denen du sicher warst, merkt man sich nach der Korrektur besonders gut. Lies sie genau.</p>}
      {rows.map(({ h, a }) => {
        const ok = !!a && a.choice === h.answer;
        return (
          <article key={h.id} className="cmp" data-ok={a ? ok : undefined}>
            <div className="row between"><h2><RichText text={h.title} /></h2><span className={`tag ${ok ? "ok" : "no"}`}>{a ? (ok ? "✓ stimmt" : "✗ stimmt nicht") : "nicht beantwortet"}</span></div>
            {h.stimulus && <Colored text={h.stimulus} size="body" />}
            <p className="muted"><RichText text={h.question} /></p>
            {a && <p><span className="muted">Deine Vermutung:</span> <strong><RichText text={h.options[a.choice]} /></strong> <span className="tag">{CONFIDENCE_LABEL[a.confidence]}</span></p>}
            {a?.why && <p className="muted">Deine Begründung: „{a.why}“</p>}
            {!ok && <p><span className="muted">Richtig:</span> <strong><RichText text={h.options[h.answer]} /></strong></p>}
            <p><strong>Warum das stimmt:</strong> <RichText text={h.reveal} /></p>
            <p><strong>Das konntest du ableiten:</strong> <RichText text={h.derivation} /></p>
            {!ok && <p className="muted"><strong>Typische Fehlannahme:</strong> <RichText text={h.misconception} /></p>}
            {h.audioIds?.filter(hasAudio).map((id) => <AudioPlayer key={id} id={id} label="Aufnahme noch einmal hören" />)}
          </article>
        );
      })}
    </>
  );
}

function DotsRule() {
  const rows = (["ba", "ta", "tha"] as const).map((id) => ({ id, l: LETTER_BY_ID.get(id)! }));
  return (
    <>
      <div className="stack"><h1>Die Punkte-Regel</h1><p className="muted">Eine Grundform, drei Buchstaben. Zahl und Lage der Punkte entscheiden.</p></div>
      <div className="scroll-x"><table className="t" aria-label="Punkte der Buchstaben ب ت ث">
        <thead><tr><th scope="col">Buchstabe</th><th scope="col">Punkte</th><th scope="col">Lage</th><th scope="col">Laut</th></tr></thead>
        <tbody>{rows.map(({ id, l }) => <tr key={id}><td><Ar size="body">{l.ch}</Ar> {l.name}</td><td>{l.dots.count}</td><td>{l.dots.pos === "above" ? "oben" : "unten"}</td><td>{ONSET[id]}</td></tr>)}</tbody></table></div>
      <section className="panel stack"><h2>Regel</h2><p>Bei gleicher Grundform gilt: <strong>erst die Lage prüfen (oben oder unten), dann die Anzahl.</strong> Ein Punkt unten ist ب, zwei oben ت, drei oben ث. Dieselbe Regel gilt für weitere Buchstaben mit dieser Form, zum Beispiel ن (1 oben) und ي (2 unten), die du später lernst.</p></section>
    </>
  );
}

function AlifVsFamily({ full }: { full: boolean }) {
  const rows = [
    { f: "Form", a: "senkrechter Strich", o: "gemeinsame Bogen-Grundform" },
    { f: "Punkte", a: "keine", o: "ب 1 unten · ت 2 oben · ث 3 oben" },
    { f: "Eigener Konsonantenlaut", a: "nein (hier)", o: "ja: b, t, th" },
    ...(full ? [{ f: "Rolle", a: "Dehnungsbuchstabe: macht ein kurzes a lang (ā)", o: "Konsonanten" }, { f: "Verbindung nach links", a: "nie (Nicht-Verbinder)", o: "ja, beidseitig" }] : []),
  ];
  return (
    <>
      <div className="stack"><h1>Alif genau betrachtet</h1><p className="muted">Alif sieht aus wie ein Buchstabe unter vielen, ist aber kein Konsonant wie <Ar size="body">ب</Ar>, <Ar size="body">ت</Ar> oder <Ar size="body">ث</Ar>.</p></div>
      <div className="scroll-x"><table className="t" aria-label="Vergleich Alif und Konsonanten"><thead><tr><th scope="col">Merkmal</th><th scope="col">Alif <Ar size="body">ا</Ar></th><th scope="col"><Ar size="body">ب ت ث</Ar></th></tr></thead>
        <tbody>{rows.map((r) => <tr key={r.f}><th scope="row" className="rowh">{r.f}</th><td className="hl"><RichText text={r.a} /></td><td><RichText text={r.o} /></td></tr>)}</tbody></table></div>
      <section className="panel stack"><h2>Häufiger Irrtum</h2>
        <p>„Alif ist der Buchstabe für <em>a</em>.“ Das stimmt nur halb. Das <strong>kurze</strong> a schreibt die Fatha über einem Konsonanten. Alif <strong>dehnt</strong> es, wenn es danach steht. Im Namen „Alif“ hörst du am Anfang einen kleinen Stimmeinsatz, die Hamza. Sie hat eigene Zeichen und kommt in einer späteren Lektion.</p></section>
    </>
  );
}

function FathaRole() {
  return (
    <>
      <div className="stack"><h1>Buchstabe + Fatha</h1></div>
      <section className="panel stack"><h2>Wer liefert was?</h2>
        <div className="eq"><div className="box"><Ar size="teach">ت</Ar><small>liefert t</small></div><span className="op">+</span><div className="box"><Ar size="teach" className="mk">◌{MARK.fatha}</Ar><small>liefert a</small></div><span className="op">=</span><div className="box res"><Colored text="تَ" /><small>ta</small></div></div>
        <Fact n={1}>Ein Konsonant allein ist nicht sprechbar. Erst ein Vokal macht ihn zur Silbe. Deshalb hast du Buchstaben bisher mit a gehört.</Fact>
        <Fact n={2}>Die <strong>Punkte gehören zum Buchstaben</strong>, die <strong>Fatha ist ein kleines Zeichen darüber</strong>. Sie ändert nur den Vokal.</Fact></section>
      <section className="panel stack"><h2>Fatha: kurzes a</h2><p>{VOWEL_INFO.fatha.mouth}</p><p className="muted">{VOWEL_INFO.fatha.caution}</p><AudioPlayer id="vowel-fatha" label="Fatha hören" /></section>
    </>
  );
}

function VowelsExplain() {
  return (
    <>
      <div className="stack"><h1>Die drei Vokalzeichen</h1><p className="muted">Jedes Zeichen ändert nur den Vokal. Der Buchstabe liefert den Konsonanten, bei jedem Buchstaben gleich.</p></div>
      <div className="stack-lg">
        {(["fatha", "kasra", "damma"] as VowelId[]).map((v) => (
          <section key={v} className="panel stack" aria-label={VOWEL_NAME[v]}>
            <div className="row"><Ar size="teach" className="mk">◌{MARK[v]}</Ar><div><h2>{VOWEL_NAME[v]} · „{VOWEL_LATIN[v]}“</h2><p className="muted">steht {VOWEL_INFO[v].place} · {VOWEL_INFO[v].look}</p></div></div>
            <p><strong>Zungenposition:</strong> {VOWEL_INFO[v].tongue}</p>
            <p>{VOWEL_INFO[v].mouth}</p>
            <p className="muted">{VOWEL_INFO[v].caution}</p>
            <AudioPlayer id={`vowel-${v}`} label={`${VOWEL_NAME[v]} hören`} />
          </section>
        ))}
      </div>
      <p className="notice">Die deutschen Vergleichswörter sind Annäherungen. Die arabischen Vokale klingen je nach Umgebung etwas anders. Die Aufnahmen sind dein Maßstab.</p>
    </>
  );
}

function JoinExplain() {
  return (
    <>
      <div className="stack"><h1>Länge und Verbindung</h1></div>
      <section className="panel stack"><h2>Langes ā</h2><p>Fatha + Alif ergibt ein langes ā, etwa doppelt so lang wie das kurze a. Alif trägt dabei kein Vokalzeichen. Die Länge unterscheidet im Arabischen Wörter, darum zählt sie bei Tipp-Antworten.</p>
        <div className="eq"><div className="box"><Colored text="بَ" /><small>ba</small></div><span className="op">→</span><div className="box res"><Colored text="بَا" /><small>bā</small></div></div></section>
      <section className="panel stack"><h2>Verbindung</h2><p><strong>ب, ت, ث verbinden</strong> sich nach links. <strong>Alif nimmt eine Verbindung von rechts an, gibt aber keine weiter:</strong> Danach beginnt die Schrift neu. In <Ar size="body">بَاب</Ar> hängt deshalb das zweite ب nicht am Alif.</p>
        <Explode letters={["ب", ALIF, "ب"]} /></section>
    </>
  );
}

function WordsExplain() {
  return (
    <>
      <div className="stack"><h1>Deine ersten Wörter</h1></div>
      <p className="notice">{WORD_VOCALIZATION_NOTE}</p>
      <div className="scroll-x"><table className="t" aria-label="Beispielwörter">
        <thead><tr><th scope="col">Wort</th><th scope="col">Lesung</th><th scope="col">Bedeutung</th><th scope="col">Hinweis</th></tr></thead>
        <tbody>{WORDS.map((w) => <tr key={w.id}><td><Ar size="body">{w.ar}</Ar></td><td>{w.tr}</td><td>{w.de}</td><td>{w.note ?? "Pausalform"}</td></tr>)}</tbody></table></div>
      <p className="muted">Wörter und Lesungen sind noch nicht von einer arabischsprachigen Person abgenommen. Aufnahmen der Wörter fehlen.</p>
    </>
  );
}

function Pronunciation({ unit }: { unit: UnitConfig }) {
  const ids = unit.id === 1 ? ["alif", "ba", "ta", "tha"] : ["tha"];
  return (
    <>
      <div className="stack"><h1>Aussprache</h1><p className="muted">Kurze Hilfen zur Artikulation. Hör zuerst die Aufnahme, dann sprich nach.</p></div>
      {unit.id >= 2 && (["fatha", "kasra", "damma"] as VowelId[]).slice(0, unit.id === 2 ? 1 : 3).map((v) => (
        <section key={v} className="panel stack"><h3>{VOWEL_NAME[v]} (kurzes {VOWEL_LATIN[v]})</h3><p>{VOWEL_INFO[v].mouth}</p><p className="muted">{VOWEL_INFO[v].caution}</p><AudioPlayer id={`vowel-${v}`} label="Hören" /></section>
      ))}
      {ids.map((id) => <Articulation key={id} id={id} />)}
      <SpeakCompare audioId={unit.id === 1 || unit.id === 2 ? "sound-tha" : "vowel-damma"} />
      <p className="notice">Diese Beschreibungen sind noch nicht von einer arabischsprachigen Person gegengelesen (siehe Prüfliste in der Dokumentation).</p>
    </>
  );
}

export function Elaboration({ unit }: { unit: UnitConfig }) {
  const { s, dispatch } = useLesson();
  const [shown, setShown] = useState<Record<string, boolean>>({});
  return (
    <>
      <div className="stack"><h1>Erkläre es in eigenen Worten</h1><p className="muted">Wer etwas selbst erklärt, verknüpft es mit Vorwissen. Schreibe ein bis zwei Sätze, dann vergleiche.</p></div>
      {unit.elab.map((e) => {
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

export function ExplainBlock({ kind, unit }: { kind: ExplainKind; unit: UnitConfig }) {
  switch (kind) {
    case "reveal": return <Reveal unit={unit} />;
    case "dots": return <DotsRule />;
    case "alifVsFamily": return <AlifVsFamily full={unit.id === 4} />;
    case "fathaRole": return <FathaRole />;
    case "vowels": return <VowelsExplain />;
    case "join": return <JoinExplain />;
    case "words": return <WordsExplain />;
    case "pronunciation": return <Pronunciation unit={unit} />;
  }
}
