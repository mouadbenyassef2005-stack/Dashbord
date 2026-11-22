"use client";
import { useState, type ReactNode } from "react";
import { ARTICULATION, DOTTED, FEATURE, MARK, ONSET, VOWEL_INFO, VOWEL_LATIN, VOWEL_NAME, letterCh, letterName, type ConsonantId, type VowelId } from "@/lektion/content/lektion1";
import { LETTER_BY_ID } from "@/lektion/content/letters";
import { HYPS, type HypCard, type Slide } from "@/lektion/content/path";
import { hasAudio } from "@/lektion/audio/manifest";
import { mnemonicStage } from "@/lektion/domain/lektion/competence";
import { AudioPlayer, ContrastPlayer } from "@/lektion/ui/AudioPlayer";
import { Ar, RichText } from "@/lektion/ui/parts";
import { DotsBuilder } from "../blocks";
import { useLesson } from "../LessonContext";
import { Colored, Skeleton } from "../visuals";

interface SP { onNext(): void; last?: boolean; label?: string }

/** Gemeinsamer Rahmen: Inhalt oben, eine gut erreichbare Hauptaktion unten. */
function Frame({ children, onNext, last, label = "Weiter", disabled }: { children: ReactNode; onNext(): void; last?: boolean; label?: string; disabled?: boolean }) {
  return (
    <>
      <div className="lp-main lp-center">{children}</div>
      <div className="lp-foot" data-state="open"><button className="btn-big" disabled={disabled} onClick={onNext}>{last ? "Fertig" : label}</button></div>
    </>
  );
}
const Title = ({ children }: { children: ReactNode }) => <h2 className="lp-q">{children}</h2>;
const Text = ({ children }: { children: ReactNode }) => <p className="lp-text">{children}</p>;

function Hero({ s, ...p }: SP & { s: Extract<Slide, { k: "hero" }> }) {
  return (
    <Frame {...p}>
      {s.ar && <div className="lp-hero"><Ar size="hero">{s.ar}</Ar></div>}
      <Title>{s.title}</Title>
      {s.text && <Text><RichText text={s.text} /></Text>}
      {s.audio && <AudioPlayer id={s.audio} label="Hören" />}
    </Frame>
  );
}

function Look({ letter, ...p }: SP & { letter: string }) {
  const { s } = useLesson();
  const stage = mnemonicStage(s.log, letter);
  const f = FEATURE[letter as keyof typeof FEATURE];
  const l = LETTER_BY_ID.get(letter)!;
  return (
    <Frame {...p}>
      <Title>So erkennst du {l.name}</Title>
      <div className="lp-hero"><Ar size="hero">{l.ch}</Ar></div>
      {stage <= 2 && <div className="lp-draw"><Skeleton letterId={letter} label={`Zeichnung von ${l.name}: ${f.text}`} /></div>}
      <Text><strong>{f.text[0].toUpperCase() + f.text.slice(1)}.</strong></Text>
      {stage === 1 && <p className="lp-hint">Merkhilfe: {f.anchor}</p>}
      {stage === 2 && <p className="lp-hint">Merkhilfe: {f.keyword}</p>}
      {stage >= 3 && <p className="lp-hint">Du erkennst es schon ohne Merkhilfe.</p>}
    </Frame>
  );
}

function Sound({ letter, ...p }: SP & { letter: string }) {
  const { dispatch } = useLesson();
  const l = LETTER_BY_ID.get(letter)!;
  const a = ARTICULATION[letter];
  const audio = letter === "alif" ? "name-alif" : `sound-${letter}`;
  const line = letter === "alif" ? "Name: Alif. Ein eigener Laut kommt später dazu." : `Name: ${l.name}. Laut: „${ONSET[letter as ConsonantId]}“.`;
  return (
    <Frame {...p}>
      <Title>Name und Laut</Title>
      <div className="lp-hero"><Ar size="teach">{l.ch}</Ar></div>
      <Text><strong>{line}</strong></Text>
      {letter !== "alif" && <p className="lp-hint">Ein Konsonant allein ist nicht sprechbar. Du hörst ihn mit einem kurzen a.</p>}
      <AudioPlayer id={audio} label={letter === "alif" ? "Name hören" : "Laut hören"} />
      {a && (
        <details className="lp-more" onToggle={(e) => { if ((e.target as HTMLDetailsElement).open) dispatch({ t: "spoken", itemId: `letter:${letter}` }); }}>
          <summary>So sprichst du es</summary>
          <ol>{a.steps.map((st) => <li key={st}>{st}</li>)}</ol>
          <p className="muted"><strong>Häufiger Fehler:</strong> {a.common}</p>
        </details>
      )}
    </Frame>
  );
}

function Dots({ s, ...p }: SP & { s: Extract<Slide, { k: "dots" }> }) {
  return (
    <Frame {...p}>
      <Title>{s.title}</Title>
      {s.text && <Text>{s.text}</Text>}
      <div className="lp-trio">
        {s.letters.map((id) => {
          const l = LETTER_BY_ID.get(id)!;
          return (
            <div key={id} className="lp-trio-item">
              <Ar size="teach">{l.ch}</Ar>
              <Skeleton letterId={id} label={`Zeichnung von ${l.name}`} />
              <strong>{l.dots.count} {l.dots.pos === "above" ? "oben" : "unten"}</strong>
            </div>
          );
        })}
      </div>
    </Frame>
  );
}

function Explore(p: SP) {
  const [found, setFound] = useState<string[]>([]);
  return (
    <Frame {...p}>
      <Title>Probiere es aus</Title>
      <Text>Setze Punkte auf den Bogen. Finde alle drei Buchstaben.</Text>
      <DotsBuilder found={found} onFound={(id) => setFound((f) => (f.includes(id) ? f : [...f, id]))} />
    </Frame>
  );
}

const mark = (v: VowelId) => DOTTED + MARK[v];
function MarkShow({ vowel, ...p }: SP & { vowel: VowelId }) {
  return (
    <Frame {...p}>
      <Title>Das ist die {VOWEL_NAME[vowel]}</Title>
      <div className="lp-hero"><Ar size="hero" className="mk">{mark(vowel)}</Ar></div>
      <Text>Ein kleines Zeichen. Es ist kein Buchstabe.</Text>
      <p className="lp-hint">Die Linie ersetzt hier den Buchstaben, damit du das Zeichen allein siehst.</p>
    </Frame>
  );
}
function MarkPlace({ vowel, ...p }: SP & { vowel: VowelId }) {
  const above = vowel !== "kasra";
  return (
    <Frame {...p}>
      <Title>Wo steht sie?</Title>
      <div className="lp-hero lp-place"><Ar size="hero" className="mk">{mark(vowel)}</Ar></div>
      <ul className="lp-legend">
        <li><span className="lp-sw" /><span>Die Linie steht für den Buchstaben.</span></li>
        <li><span className="lp-sw lp-sw-mk" /><span>Die {VOWEL_NAME[vowel]} steht <b>{above ? "über" : "unter"}</b> dem Buchstaben.</span></li>
      </ul>
    </Frame>
  );
}
function MarkMeaning({ vowel, ...p }: SP & { vowel: VowelId }) {
  const info = VOWEL_INFO[vowel];
  return (
    <Frame {...p}>
      <Title>Was zeigt sie an?</Title>
      <div className="lp-hero"><Ar size="hero" className="mk lp-midmark">{mark(vowel)}</Ar></div>
      <Text><strong>Einen kurzen „{VOWEL_LATIN[vowel]}“-Laut</strong> nach dem Konsonanten.</Text>
      <AudioPlayer id={`vowel-${vowel}`} label="Laut hören" />
      <p className="lp-hint">{info.tongue}</p>
      <details className="lp-more"><summary>Mehr zur Aussprache</summary><p>{info.mouth}</p><p className="muted">{info.caution}</p></details>
    </Frame>
  );
}
function MarkSet(p: SP) {
  return (
    <Frame {...p}>
      <Title>Die drei Zeichen</Title>
      <div className="lp-trio">
        {(["fatha", "kasra", "damma"] as VowelId[]).map((v) => (
          <div key={v} className="lp-trio-item"><Ar size="teach" className="mk">{mark(v)}</Ar><strong>{VOWEL_NAME[v]}</strong><span>{v === "kasra" ? "unten" : "oben"} · {VOWEL_LATIN[v]}</span></div>
        ))}
      </div>
    </Frame>
  );
}

function Compose({ letter, vowel, ...p }: SP & { letter: string; vowel: VowelId }) {
  const ch = letterCh(letter), tr = ONSET[letter as ConsonantId] + VOWEL_LATIN[vowel];
  return (
    <Frame {...p}>
      <Title>{ch} + {VOWEL_NAME[vowel]}</Title>
      <div className="lp-eq" role="group" aria-label={`${letterName(letter)} plus ${VOWEL_NAME[vowel]} ergibt ${tr}`}>
        <div><Ar size="teach">{ch}</Ar><small>{ONSET[letter as ConsonantId]}</small></div>
        <span aria-hidden>+</span>
        <div><Ar size="teach" className="mk">{mark(vowel)}</Ar><small>{VOWEL_LATIN[vowel]}</small></div>
        <span aria-hidden>=</span>
        <div className="res"><Colored text={ch + MARK[vowel]} /><small>{tr}</small></div>
      </div>
      <Text><b>{ch}</b> liefert „{ONSET[letter as ConsonantId]}“. Das Zeichen liefert „{VOWEL_LATIN[vowel]}“.</Text>
      <AudioPlayer id={`syl-${letter}-${vowel}`} label={`„${tr}“ hören`} />
    </Frame>
  );
}

function Rule({ s, ...p }: SP & { s: Extract<Slide, { k: "rule" }> }) {
  return (
    <Frame {...p}>
      <Title>{s.title}</Title>
      {s.visual === "compose-ta" && <div className="lp-eq"><div><Ar size="teach">ت</Ar><small>t</small></div><span>+</span><div><Ar size="teach" className="mk">{mark("kasra")}</Ar><small>i</small></div><span>=</span><div className="res"><Colored text={"ت" + MARK.kasra} /><small>ti</small></div></div>}
      {s.visual === "dotsvsmark" && <div className="lp-eq"><div><Colored text={"ب" + MARK.kasra} /><small>Punkt rund · Strich schräg</small></div></div>}
      <ul className="lp-rule">{s.lines.map((l) => <li key={l}>{l}</li>)}</ul>
    </Frame>
  );
}

function HearSet({ s, ...p }: SP & { s: Extract<Slide, { k: "hearSet" }> }) {
  return (
    <Frame {...p}>
      <Title>{s.title}</Title>
      <ContrastPlayer items={s.items} />
    </Frame>
  );
}

function Compare({ a, b, ...p }: SP & { a: string; b: string }) {
  const la = LETTER_BY_ID.get(a.split(":")[1]), lb = LETTER_BY_ID.get(b.split(":")[1]);
  return (
    <Frame {...p}>
      <Title>Das verwechselst du oft</Title>
      {la && lb ? (
        <div className="lp-trio">{[la, lb].map((l) => <div key={l.id} className="lp-trio-item"><Ar size="teach">{l.ch}</Ar><Skeleton letterId={l.id} label={`Zeichnung von ${l.name}`} /><strong>{l.dots.count} {l.dots.pos === "above" ? "oben" : "unten"}</strong></div>)}</div>
      ) : <Text><RichText text={`${a.split(":")[1]} und ${b.split(":")[1]}: schau genau hin.`} /></Text>}
    </Frame>
  );
}

/** Hypothese: Auswahl ohne Rückmeldung. Die Auflösung folgt in der Erklär-Lektion. */
function Hyp({ hyp, onNext }: { hyp: HypCard; onNext(): void }) {
  const { dispatch } = useLesson();
  const [choice, setChoice] = useState<number | null>(null);
  return (
    <>
      <div className="lp-main">
        <p className="lp-eyebrow">Vermute</p>
        <h2 id="lp-q" className="lp-q"><RichText text={hyp.title} /></h2>
        {hyp.given && <ul className="lp-given" aria-label="Was du schon weißt">{hyp.given.map((g) => <li key={g}><RichText text={g} /></li>)}</ul>}
        {hyp.audioIds?.filter(hasAudio).map((id) => <AudioPlayer key={id} id={id} label="Anhören" />)}
        {hyp.stimulus && <div className="lp-hero lp-hero-s"><Colored text={hyp.stimulus} size="teach" /></div>}
        <p className="lp-text"><strong><RichText text={hyp.question} /></strong></p>
        <div className={hyp.optionsAr ? "lp-opts lp-opts-ar" : "lp-opts lp-opts-1"} role="radiogroup" aria-labelledby="lp-q">
          {hyp.options.map((o, i) => <button key={o} className={`lp-opt ${hyp.optionsAr ? "ar-opt" : ""}`} role="radio" aria-checked={choice === i} data-state={choice === i ? "sel" : ""} onClick={() => setChoice(i)} {...(hyp.optionsAr ? { lang: "ar", dir: "rtl" } : {})}>{hyp.optionsAr ? o : <RichText text={o} />}</button>)}
        </div>
      </div>
      <div className="lp-foot" data-state="open"><p className="lp-hint" style={{ margin: 0 }}>Keine Wertung: Die Erklärung kommt gleich.</p>
        <button className="btn-big" disabled={choice === null} onClick={() => { dispatch({ t: "hyp", id: hyp.id, answer: { choice: choice! } }); onNext(); }}>Weiter</button></div>
    </>
  );
}

/** Eine Hypothese in der Erklär-Lektion: Vermutung, Auflösung, Begründung (kurz). */
function HypItem({ id, ...p }: SP & { id: string }) {
  const { s } = useLesson();
  const h = HYPS[id];
  const a = s.hyp[id];
  const ok = !!a && a.choice === h.answer;
  return (
    <Frame {...p}>
      <p className="lp-eyebrow">Deine Vermutung</p>
      <h2 className="lp-q"><RichText text={h.title} /></h2>
      {h.stimulus && <div className="lp-hero"><Colored text={h.stimulus} size="teach" /></div>}
      <div className={`lp-verdict ${a ? (ok ? "ok" : "no") : ""}`}>
        <span aria-hidden>{a ? (ok ? "✓" : "✗") : "–"}</span>
        <div>{a ? <>Du: <b><RichText text={h.options[a.choice]} /></b></> : "Nicht beantwortet"}{!ok && <p>Richtig: <b><RichText text={h.options[h.answer]} /></b></p>}</div>
      </div>
      <Text><RichText text={h.why} /></Text>
    </Frame>
  );
}

export function SlideView({ slide, ...p }: SP & { slide: Exclude<Slide, { k: "task" | "taskobj" | "hypReview" }> }) {
  switch (slide.k) {
    case "hero": return <Hero s={slide} {...p} />;
    case "look": return <Look letter={slide.letter} {...p} />;
    case "sound": return <Sound letter={slide.letter} {...p} />;
    case "dots": return <Dots s={slide} {...p} />;
    case "explore": return <Explore {...p} />;
    case "markShow": return <MarkShow vowel={slide.vowel} {...p} />;
    case "markPlace": return <MarkPlace vowel={slide.vowel} {...p} />;
    case "markMeaning": return <MarkMeaning vowel={slide.vowel} {...p} />;
    case "markSet": return <MarkSet {...p} />;
    case "compose": return <Compose letter={slide.letter} vowel={slide.vowel} {...p} />;
    case "rule": return <Rule s={slide} {...p} />;
    case "hearSet": return <HearSet s={slide} {...p} />;
    case "compare": return <Compare a={slide.a} b={slide.b} {...p} />;
    case "hyp": return <Hyp hyp={slide.hyp} onNext={p.onNext} />;
    case "hypItem": return <HypItem id={slide.id} {...p} />;
  }
}
