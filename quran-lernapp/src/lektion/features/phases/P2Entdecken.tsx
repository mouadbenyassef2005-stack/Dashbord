"use client";
import { useState } from "react";
import { ALIF, CONSONANT_IDS, FEATURE, MARK, ONSET, letterCh, letterName, type ConsonantId } from "@/lektion/content/lektion1";
import { LETTER_BY_ID } from "@/lektion/content/letters";
import { TEMPLATE_BY_ID } from "@/lektion/domain/handwriting/templates";
import { AudioButton } from "@/lektion/ui/AudioButton";
import { Ar, RichText } from "@/lektion/ui/parts";
import { WriteTask } from "@/lektion/ui/WriteTask";
import { PhaseFrame } from "../PhaseFrame";
import { Colored, Skeleton } from "../visuals";
import { useLesson } from "../LessonContext";

const ABOVE = [{ x: 38, y: 26 }, { x: 62, y: 26 }, { x: 50, y: 10 }];
const BELOW = [{ x: 38, y: 86 }, { x: 62, y: 86 }];
const BOWL = TEMPLATE_BY_ID.get("ba")!.body[0];
const bowlPath = () => {
  let d = `M${BOWL[0].x} ${BOWL[0].y}`;
  for (let i = 1; i < BOWL.length - 1; i++) d += ` Q${BOWL[i].x} ${BOWL[i].y} ${(BOWL[i].x + BOWL[i + 1].x) / 2} ${(BOWL[i].y + BOWL[i + 1].y) / 2}`;
  return d + ` L${BOWL.at(-1)!.x} ${BOWL.at(-1)!.y}`;
};

/** Entdecken per Baukasten: gleiche Grundform, nur die Punkte entscheiden. */
function DotsBuilder({ found, onFound }: { found: string[]; onFound(id: string): void }) {
  const [above, setAbove] = useState([false, false, false]);
  const [below, setBelow] = useState([false, false]);
  const a = above.filter(Boolean).length, b = below.filter(Boolean).length;
  const hit = a === 0 && b === 1 ? "ba" : a === 2 && b === 0 ? "ta" : a === 3 && b === 0 ? "tha" : a === 1 && b === 0 ? "nun" : a === 0 && b === 2 ? "ya" : null;
  const apply = (nextA: number, nextB: number) => {
    const id = nextA === 0 && nextB === 1 ? "ba" : nextA === 2 && nextB === 0 ? "ta" : nextA === 3 && nextB === 0 ? "tha" : null;
    if (id) onFound(id);
  };
  const msg = hit === "nun" || hit === "ya"
    ? `Das ist ${letterName(hit)} (${letterCh(hit)}). Die gleiche Grundform, aber ein anderer Buchstabe, den du in einer späteren Lektion lernst.`
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
          <div className="slotrow">{above.map((on, i) => <button key={i} className="slot" aria-pressed={on} aria-label={`Punkt oben ${i + 1}`} onClick={() => { const n = [...above]; n[i] = !n[i]; setAbove(n); apply(n.filter(Boolean).length, b); }} />)}</div>
          <p className="eyebrow">Punkte unten</p>
          <div className="slotrow">{below.map((on, i) => <button key={i} className="slot" aria-pressed={on} aria-label={`Punkt unten ${i + 1}`} onClick={() => { const n = [...below]; n[i] = !n[i]; setBelow(n); apply(a, n.filter(Boolean).length); }} />)}</div>
        </div>
        <div style={{ textAlign: "center" }} aria-live="polite">
          {hit && <div className="big-ar" style={{ fontSize: 72, lineHeight: 1.4 }} lang="ar" dir="rtl">{letterCh(hit)}</div>}
          <p className="muted"><RichText text={msg} /></p>
        </div>
        <div className="found" aria-label="Gefundene Buchstaben">
          {CONSONANT_IDS.map((id) => <span key={id} className="chip" data-on={found.includes(id)}>{found.includes(id) ? "✓ " : ""}{letterName(id)}</span>)}
        </div>
      </div>
    </div>
  );
}

/** Silbenbaukasten: Konsonant + Fatha (+ Alif). */
function SyllableBuilder({ onProgress }: { onProgress(seen: string[], longSeen: boolean): void }) {
  const [c, setC] = useState<ConsonantId>("ba");
  const [long, setLong] = useState(false);
  const [seen, setSeen] = useState<string[]>(["ba"]);
  const [longSeen, setLongSeen] = useState(false);
  const ar = letterCh(c) + MARK.fatha + (long ? ALIF : "");
  const tr = ONSET[c] + (long ? "ā" : "a");
  return (
    <div className="stack">
      <div className="seg" role="group" aria-label="Buchstabe wählen">
        {CONSONANT_IDS.map((id) => (
          <button key={id} aria-pressed={c === id} aria-label={letterName(id)} onClick={() => { setC(id); const n = seen.includes(id) ? seen : [...seen, id]; setSeen(n); onProgress(n, longSeen); }}><Ar size="body">{letterCh(id)}</Ar></button>
        ))}
      </div>
      <div className="eq" role="group" aria-label={`${letterName(c)} plus Fatha${long ? " plus Alif" : ""} ergibt ${tr}`}>
        <div className="box"><Ar size="teach">{letterCh(c)}</Ar><small>Konsonant {ONSET[c]}</small></div>
        <span className="op" aria-hidden>+</span>
        <div className="box"><Ar size="teach" className="mk">◌{MARK.fatha}</Ar><small>Fatha: a</small></div>
        {long && <><span className="op" aria-hidden>+</span><div className="box"><Ar size="teach">{ALIF}</Ar><small>Alif: dehnt</small></div></>}
        <span className="op" aria-hidden>=</span>
        <div className="box res"><Colored text={ar} /><small>{tr}{long ? " (lang)" : ""}</small></div>
      </div>
      <div className="row" style={{ justifyContent: "center" }}>
        <button className="btn btn-secondary" aria-pressed={long} onClick={() => { const nl = !long; setLong(nl); const ls = longSeen || nl; setLongSeen(ls); onProgress(seen, ls); }}>{long ? "Alif wieder weglassen" : "Alif anhängen"}</button>
      </div>
      <p className="muted" style={{ textAlign: "center" }}>{long ? "Mit Alif wird das a gedehnt: ā ist etwa doppelt so lang wie a." : "Konsonant plus Fatha ergibt eine Silbe mit kurzem a."}</p>
    </div>
  );
}

const WRITE_PLAN: { letterId: string; mode: "trace" | "free"; note: string }[] = [
  { letterId: "alif", mode: "trace", note: "Mit voller Vorlage." },
  { letterId: "ba", mode: "trace", note: "Wieder mit Vorlage, jetzt mit Bogen und Punkt." },
  { letterId: "ta", mode: "free", note: "Die Vorlage wird ausgeblendet, du kannst sie bei Bedarf zeigen." },
  { letterId: "tha", mode: "free", note: "Jetzt ganz ohne Hilfe, aus dem Gedächtnis." },
];

export function P2Entdecken({ onFinish }: { onFinish(): void }) {
  const { s } = useLesson();
  const [found, setFound] = useState<string[]>([]);
  const [fatha, setFatha] = useState<{ seen: string[]; longSeen: boolean }>({ seen: [], longSeen: false });
  const [wi, setWi] = useState(0);
  const [spoken, setSpoken] = useState<Record<string, boolean>>({});
  const wdone = wi >= WRITE_PLAN.length;
  const step = s.steps[2] ?? 0;
  const already = s.done.includes(2);

  const canNext = step === 1 ? found.length === 3 || already : step === 2 ? (fatha.seen.length >= 3 && fatha.longSeen) || already : step === 3 ? wdone || already : true;

  const onWrite = () => setWi((n) => n + 1);

  return (
    <PhaseFrame
      phase={2} labels={["Alif", "ب ت ث: eine Familie", "Silben mit Fatha", "Schreiben"]} canNext={canNext}
      finishLabel="Weiter zu Phase 3: Hypothesen" onFinish={onFinish}
      why={<><p className="muted"><b>Scaffolding:</b> Hilfen werden schrittweise abgebaut: erst volle Vorlage, dann ohne.</p><p className="muted"><b>Dual Coding und Multisensorik:</b> Du bekommst jeden Buchstaben als Schrift, als Bild, als Laut und über die eigene Hand. Mehrere Kanäle stützen das Gedächtnis.</p></>}
    >
      {(st) => st === 0 ? (
        <>
          <div className="stack"><h1>Alif <Ar size="body">ا</Ar></h1><p className="muted">Der erste Buchstabe der Schrift. Er sieht einfach aus, verhält sich aber anders als die meisten.</p></div>
          <div className="cards">
            <div className="card"><Ar size="hero" label="Alif">{ALIF}</Ar><strong>{LETTER_BY_ID.get("alif")!.name}</strong></div>
            <div className="card"><Skeleton letterId="alif" label="Zeichnung von Alif: ein senkrechter Strich" /><small>{FEATURE.alif.anchor}</small></div>
          </div>
          <section className="stack" aria-labelledby="af">
            <h2 id="af">Das fällt auf</h2>
            <div className="fact"><b>1</b><p>Ein <strong>gerader senkrechter Strich</strong>, ohne Bogen, ohne Punkte.</p></div>
            <div className="fact"><b>2</b><p>Alif hat hier <strong>keinen eigenen Konsonantenlaut</strong>. Du hörst es nur im Namen „Alif“.</p></div>
            <div className="fact"><b>3</b><p>Es hängt sich <strong>nicht an den nächsten Buchstaben</strong> an. Warum das so ist, klärst du später.</p></div>
          </section>
          <div className="row"><AudioButton letterId="alif" kind="name" label="Name hören" />
            <label className="row" style={{ gap: 8 }}><input type="checkbox" checked={!!spoken.alif} onChange={(e) => setSpoken({ ...spoken, alif: e.target.checked })} /> Ich habe „Alif“ laut gesprochen</label></div>
        </>
      ) : st === 1 ? (
        <>
          <div className="stack"><h1>Drei Buchstaben, eine Form</h1><p className="muted"><Ar size="body">ب</Ar>, <Ar size="body">ت</Ar> und <Ar size="body">ث</Ar> haben dieselbe Grundform, einen flachen Bogen. Entdecke selbst, was sie unterscheidet: Setze Punkte und finde alle drei.</p></div>
          <DotsBuilder found={found} onFound={(id) => setFound((f) => (f.includes(id) ? f : [...f, id]))} />
          <section className="stack" aria-labelledby="fam"><h2 id="fam">Bild, Laut, Mund</h2>
            <div className="cards">
              {CONSONANT_IDS.map((id) => {
                const l = LETTER_BY_ID.get(id)!;
                return (
                  <div className="card" key={id}>
                    <Ar size="teach">{l.ch}</Ar><strong>{l.name} · „{ONSET[id]}“</strong>
                    <Skeleton letterId={id} label={`Zeichnung von ${l.name}: ${FEATURE[id].text}`} />
                    <small>{FEATURE[id].anchor}</small>
                    <small>{l.tip}</small>
                    <AudioButton letterId={id} kind="sound" label="Laut hören" />
                    <label className="row" style={{ gap: 8, fontSize: 13 }}><input type="checkbox" checked={!!spoken[id]} onChange={(e) => setSpoken({ ...spoken, [id]: e.target.checked })} /> laut gesprochen</label>
                  </div>
                );
              })}
            </div>
          </section>
          {!(found.length === 3 || already) && <p className="notice" role="status">Finde zuerst alle drei Buchstaben im Baukasten ({found.length} von 3).</p>}
        </>
      ) : st === 2 ? (
        <>
          <div className="stack"><h1>Silben mit Fatha</h1><p className="muted">Ein Buchstabe liefert den Konsonanten, ein kleines Zeichen den Vokal. Das Zeichen <Ar size="body" className="mk">◌{MARK.fatha}</Ar> heißt <strong>Fatha</strong> und steht für ein kurzes „a“. Es sitzt über dem Buchstaben.</p></div>
          <SyllableBuilder onProgress={(seen, longSeen) => setFatha({ seen, longSeen })} />
          {!(canNext) && <p className="notice" role="status">Probiere alle drei Buchstaben aus und hänge einmal das Alif an ({fatha.seen.length} von 3 Buchstaben{fatha.longSeen ? ", Alif ausprobiert" : ""}).</p>}
          <p className="muted">Es gibt noch zwei weitere Vokalzeichen. Die entdeckst du gleich selbst.</p>
        </>
      ) : (
        <>
          <div className="stack"><h1>Mit der Hand schreiben</h1><p className="muted">Schreiben festigt das Erkennen. Mit dem Finger, Stift oder der Maus. Die Hilfe wird ausgeblendet: Alif und Bā mit Vorlage, Tā und Thā frei.</p></div>
          {wdone ? <p className="notice" role="status">Alle vier geschrieben. Das Ergebnis ist in „Ich“ gespeichert. Die Rückmeldung ist ein Hinweis zu Form, Punkten und Richtung, keine Benotung der Handschrift.</p> : (
            <>
              <p className="eyebrow">Schreibaufgabe {wi + 1} von {WRITE_PLAN.length} · {WRITE_PLAN[wi].note}</p>
              <WriteTask key={wi} letterId={WRITE_PLAN[wi].letterId} mode={WRITE_PLAN[wi].mode} onDone={onWrite} onSkip={() => setWi((n) => n + 1)} />
            </>
          )}
        </>
      )}
    </PhaseFrame>
  );
}
