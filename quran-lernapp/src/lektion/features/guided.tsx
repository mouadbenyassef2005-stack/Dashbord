"use client";
import { useState } from "react";
import {
  ALIF, MARK, ONSET, VOWEL_INFO, VOWEL_LATIN, VOWEL_NAME, WORDS, WORD_VOCALIZATION_NOTE, letterCh, letterName, type ConsonantId, type VowelId,
} from "@/lektion/content/lektion1";
import { LETTER_BY_ID } from "@/lektion/content/letters";
import type { GuidedKind } from "@/lektion/content/units";
import { AudioPlayer, ContrastPlayer } from "@/lektion/ui/AudioPlayer";
import { Ar } from "@/lektion/ui/parts";
import { SpeakCompare } from "@/lektion/ui/SpeakCompare";
import { Articulation, DotsBuilder, Fact, LetterCard, SyllableBuilder, WriteSeq } from "./blocks";
import { useLesson } from "./LessonContext";
import { Colored, Explode } from "./visuals";

export interface GuidedProps { unit: number; setGate(ok: boolean): void }

const cons: ConsonantId[] = ["ba", "ta", "tha"];
const syl = (c: string, v: string) => ({ id: `syl-${c}-${v}`, ar: letterCh(c) + MARK[v as VowelId], tr: ONSET[c as ConsonantId] + VOWEL_LATIN[v as VowelId] });

function Alif({ setGate, unit }: GuidedProps) {
  const { s } = useLesson();
  return (
    <>
      <div className="stack"><h1>Alif <Ar size="body">ا</Ar></h1><p className="muted">Der erste Buchstabe. Er sieht einfach aus, verhält sich aber anders als ب, ت und ث.</p></div>
      <LetterCard id="alif" log={s.log} />
      <section className="stack" aria-labelledby="af"><h2 id="af">Das fällt auf</h2>
        <Fact n={1}>Ein <strong>gerader senkrechter Strich</strong>, ohne Bogen und ohne Punkte.</Fact>
        <Fact n={2}>Alif hat hier <strong>keinen eigenen Konsonantenlaut</strong>. Du hörst es nur im Namen „Alif“.</Fact>
      </section>
      <Articulation id="alif" />
      <section className="stack" aria-labelledby="aw"><h2 id="aw">Nachzeichnen</h2>
        <WriteSeq plan={[{ letterId: "alif", mode: "trace", note: "mit Vorlage" }]} unit={unit} phase={2} onFinished={() => setGate(true)} /></section>
    </>
  );
}

function Family({ setGate }: GuidedProps) {
  const { s } = useLesson();
  const [found, setFound] = useState<string[]>([]);
  const ok = found.length === 3;
  return (
    <>
      <div className="stack"><h1>Drei Buchstaben, eine Form</h1><p className="muted">ب, ت und ث haben dieselbe Grundform, einen flachen Bogen. Entdecke selbst, was sie unterscheidet: Setze Punkte und finde alle drei.</p></div>
      <DotsBuilder found={found} onFound={(id) => setFound((f) => { const n = f.includes(id) ? f : [...f, id]; if (n.length === 3) setGate(true); return n; })} />
      {!ok && <p className="notice" role="status">Finde zuerst alle drei Buchstaben im Baukasten ({found.length} von 3).</p>}
      <section className="stack" aria-labelledby="fam"><h2 id="fam">Namen, Merkhilfe und Laut</h2>
        <p className="muted">Die Merkhilfen sind nur ein Start: Je öfter du einen Buchstaben richtig erkennst, desto weniger Hilfe siehst du.</p>
        <div className="cards">{cons.map((id) => <LetterCard key={id} id={id} log={s.log} />)}</div></section>
    </>
  );
}

function HearFamily({ setGate, unit }: GuidedProps) {
  const { dispatch } = useLesson();
  const [done, setDone] = useState(false);
  const mark = (id: string) => { dispatch({ t: "spoken", itemId: id }); if (!done) { setDone(true); setGate(true); } };
  return (
    <>
      <div className="stack"><h1>Hören und sprechen</h1><p className="muted">Ein Konsonant allein ist nicht sprechbar. Wir hören jeden darum mit einem kurzen a: „ba“, „ta“, „tha“. Das a gehört nicht zum Buchstaben, es macht ihn nur hörbar.</p></div>
      <ContrastPlayer items={cons.map((c) => ({ id: `sound-${c}`, ar: letterCh(c), tr: `${ONSET[c]}a` }))} />
      <Articulation id="tha" />
      <Articulation id="ta" />
      <section className="stack" aria-labelledby="sp"><h2 id="sp">Selbst sprechen (optional)</h2>
        <p className="muted">Sprich „tha“ und vergleiche mit dem Vorbild. Achte auf die Zunge zwischen den Zähnen.</p>
        <SpeakCompare audioId="sound-tha" onUsed={() => mark("letter:tha")} />
        <div><button className="btn btn-secondary" onClick={() => mark("letter:tha")}>Ich habe es laut gesprochen</button></div></section>
      <span hidden>{unit}</span>
    </>
  );
}

function WriteFamily({ unit, setGate }: GuidedProps) {
  return (
    <>
      <div className="stack"><h1>Mit der Hand schreiben</h1><p className="muted">Schreiben festigt das Erkennen. Mit Finger, Stift oder Maus. Die Hilfe wird abgebaut: Bā mit Vorlage, Tā und Thā frei.</p></div>
      <WriteSeq unit={unit} phase={2} onFinished={() => setGate(true)}
        plan={[{ letterId: "ba", mode: "trace", note: "mit Vorlage" }, { letterId: "ta", mode: "free", note: "Vorlage nur bei Bedarf" }, { letterId: "tha", mode: "free", note: "aus dem Gedächtnis" }]} />
    </>
  );
}

function Fatha({ setGate }: GuidedProps) {
  const [prog, setProg] = useState({ letters: [] as string[], long: false });
  const ok = prog.letters.length >= 3;
  return (
    <>
      <div className="stack"><h1>Konsonant + Fatha</h1><p className="muted">Ein Buchstabe liefert den Konsonanten, ein kleines Zeichen den Vokal. <Ar size="body" className="mk">◌{MARK.fatha}</Ar> heißt <strong>Fatha</strong> und steht für ein kurzes „a“, über dem Buchstaben.</p></div>
      <SyllableBuilder vowels={["fatha"]} allowLong={false} onProgress={(p) => { setProg({ letters: p.letters, long: p.long }); if (p.letters.length >= 3) setGate(true); }} />
      {!ok && <p className="notice" role="status">Probiere alle drei Buchstaben aus ({prog.letters.length} von 3).</p>}
    </>
  );
}

function HearSyllables({ setGate }: GuidedProps) {
  return (
    <>
      <div className="stack"><h1>Silben hören</h1><p className="muted">Höre die drei Silben nacheinander. Achte auf den Anfangslaut: b mit Lippenverschluss, t mit kurzem Zungenschlag, th mit Luftstrom.</p></div>
      <ContrastPlayer items={cons.map((c) => syl(c, "fatha"))} />
      <Articulation id="tha" />
      <section className="stack"><h2>Selbst sprechen (optional)</h2><SpeakCompare audioId="syl-tha-fatha" onUsed={() => setGate(true)} />
        <div><button className="btn btn-secondary" onClick={() => setGate(true)}>Ich habe es angehört</button></div></section>
    </>
  );
}

function Vowels({ setGate }: GuidedProps) {
  const [c, setC] = useState<ConsonantId>("ba");
  const [seen, setSeen] = useState<string[]>([]);
  const items = (["fatha", "kasra", "damma"] as const).map((v) => syl(c, v));
  return (
    <>
      <div className="stack"><h1>Drei Vokalzeichen im Vergleich</h1><p className="muted">Der Buchstabe bleibt gleich, nur das Zeichen wechselt, und damit der Vokal. Höre die drei Silben und schau auf die Zeichen.</p></div>
      <div className="seg" role="group" aria-label="Buchstabe wählen">
        {cons.map((id) => <button key={id} aria-pressed={c === id} aria-label={letterName(id)} onClick={() => { setC(id); const n = [...new Set([...seen, id])]; setSeen(n); if (n.length >= 2) setGate(true); }}><Ar size="body">{letterCh(id)}</Ar></button>)}
      </div>
      <ContrastPlayer items={items} />
      <div className="cards">
        {(["fatha", "kasra", "damma"] as VowelId[]).map((v) => (
          <div key={v} className="card"><Ar size="teach" className="mk">◌{MARK[v]}</Ar><strong>{VOWEL_NAME[v]} · „{VOWEL_LATIN[v]}“</strong>
            <small>steht {VOWEL_INFO[v].place}</small><small>Aussehen: {VOWEL_INFO[v].look}</small></div>
        ))}
      </div>
      <p className="muted">Probiere mindestens zwei verschiedene Buchstaben aus.</p>
    </>
  );
}

function HearVowels({ setGate }: GuidedProps) {
  const [done, setDone] = useState(false);
  return (
    <>
      <div className="stack"><h1>Vokale hören</h1><p className="muted">Zuerst die drei reinen Vokale, danach als Silbe. Der Unterschied liegt in der Zunge: vorn und hoch bei i, hinten und hoch mit runden Lippen bei u, flach bei a.</p></div>
      <ContrastPlayer items={(["fatha", "kasra", "damma"] as const).map((v) => ({ id: `vowel-${v}`, ar: `◌${MARK[v]}`, tr: VOWEL_LATIN[v] }))} />
      <ContrastPlayer items={(["fatha", "kasra", "damma"] as const).map((v) => syl("ta", v))} />
      <Articulation id="tha" />
      <section className="stack"><h2>Selbst sprechen (optional)</h2><SpeakCompare audioId="vowel-damma" onUsed={() => { setDone(true); setGate(true); }} />
        <div><button className="btn btn-secondary" onClick={() => { setDone(true); setGate(true); }}>Ich habe es angehört</button></div>{done && <span className="sr-only" role="status">Gespeichert</span>}</section>
    </>
  );
}

function VowelDot({ setGate }: GuidedProps) {
  const [shown, setShown] = useState(false);
  return (
    <>
      <div className="stack"><h1>Punkt oder Vokalzeichen?</h1><p className="muted">Bei ب steht ein Punkt unter dem Bogen. Kommt ein Kasra dazu, stehen zwei Dinge unten. So unterscheidest du sie.</p></div>
      <div className="eq"><div className="box"><Colored text="ب" /><small>Punkt unten</small></div><span className="op">+</span><div className="box"><Ar size="teach" className="mk">◌{MARK.kasra}</Ar><small>Kasra</small></div><span className="op">=</span><div className="box res"><Colored text="بِ" /><small>bi</small></div></div>
      <section className="panel stack"><h2>Merke dir die Form</h2>
        <Fact n={1}><strong>Punkte sind rund</strong> und gehören zum Buchstaben. Sie ändern den Konsonanten.</Fact>
        <Fact n={2}><strong>Vokalzeichen sind kurze schräge Striche</strong> (oder bei Damma ein winziges „و“). Sie ändern den Vokal.</Fact></section>
      <div className="stack"><button className="btn btn-secondary" onClick={() => { setShown(true); setGate(true); }}>Beispiel ثُ zeigen</button>
        {shown && <div className="eq"><div className="box"><Colored text="ثُ" /><small>thu: 3 runde Punkte + Damma</small></div></div>}</div>
    </>
  );
}

function LongAlif({ setGate }: GuidedProps) {
  const [ok, setOk] = useState(false);
  return (
    <>
      <div className="stack"><h1>Fatha + Alif = langes ā</h1><p className="muted">Das Alif nach einer Fatha dehnt das a. Alif ist hier kein Konsonant, es trägt kein Vokalzeichen und hat keinen eigenen Laut.</p></div>
      <SyllableBuilder vowels={["fatha"]} allowLong onProgress={(p) => { if (p.long && !ok) { setOk(true); setGate(true); } }} />
      {!ok && <p className="notice" role="status">Hänge einmal das Alif an, um den Unterschied zu sehen.</p>}
      <div className="eq"><div className="box"><Colored text="بَ" /><small>ba · kurz</small></div><span className="op">→</span><div className="box res"><Colored text="بَا" /><small>bā · lang</small></div></div>
    </>
  );
}

function JoinExample({ w }: { w: (typeof WORDS)[number] }) {
  return (
    <div className="card" style={{ alignItems: "stretch" }}>
      <div className="big-ar"><Colored text={w.ar} size="teach" /></div>
      <div className="join-row" dir="rtl" aria-label={`Buchstaben von ${w.tr}`}>
        {w.letters.map((id, i) => {
          const joins = LETTER_BY_ID.get(id)!.joinsNext && i < w.letters.length - 1;
          return <span key={i} className="join-cell"><Ar size="body">{letterCh(id)}</Ar><small>{i === w.letters.length - 1 ? "Ende" : joins ? "verbindet" : "Lücke"}</small></span>;
        })}
      </div>
    </div>
  );
}

function Join({ setGate }: GuidedProps) {
  return (
    <>
      <div className="stack"><h1>Wo hängen Buchstaben zusammen?</h1><p className="muted">ب, ت und ث verbinden sich nach links mit dem nächsten Buchstaben. Alif nicht. Schau dir an, wo bei jedem Wort Lücken entstehen. Gelesen wird von rechts nach links.</p></div>
      <div className="cards">{WORDS.map((w) => <JoinExample key={w.id} w={w} />)}</div>
      <Explode letters={["ب", ALIF, "ب"]} />
      <p className="muted" style={{ textAlign: "center" }}>Bei بَاب steht das zweite ب frei, weil davor ein Alif steht.</p>
      <div><button className="btn btn-secondary" onClick={() => setGate(true)}>Ich habe die Lücken gefunden</button></div>
    </>
  );
}

function Words({ setGate }: GuidedProps) {
  const [seen, setSeen] = useState<string[]>([]);
  return (
    <>
      <div className="stack"><h1>Erste Wörter</h1><p className="muted">Lies jedes Wort von rechts nach links, Buchstabe für Buchstabe. Tippe auf „Lesung zeigen“, wenn du es versucht hast.</p></div>
      <p className="notice">{WORD_VOCALIZATION_NOTE}</p>
      <div className="cards">
        {WORDS.map((w) => (
          <div key={w.id} className="card">
            <Colored text={w.ar} />
            {seen.includes(w.id) ? <><strong>{w.tr}</strong><small>{w.de}</small>{w.note && <small className="muted">{w.note}</small>}</> :
              <button className="btn btn-secondary" onClick={() => { const n = [...seen, w.id]; setSeen(n); if (n.length === WORDS.length) setGate(true); }}>Lesung zeigen</button>}
            <AudioPlayer id={`word-${w.id.split(":")[1]}`} label="Hören" />
          </div>
        ))}
      </div>
    </>
  );
}

export const GUIDED: Record<GuidedKind, (p: GuidedProps) => React.ReactElement> = {
  alif: Alif, family: Family, hearFamily: HearFamily, writeFamily: WriteFamily, fatha: Fatha, hearSyllables: HearSyllables,
  vowels: Vowels, hearVowels: HearVowels, vowelDot: VowelDot, longAlif: LongAlif, join: Join, words: Words,
};
