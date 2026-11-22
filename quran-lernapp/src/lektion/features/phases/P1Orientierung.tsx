"use client";
import { useMemo } from "react";
import { ALIF, MARK } from "@/lektion/content/lektion1";
import { PHASES, type SelfLevel } from "@/lektion/domain/lektion/state";
import { PRETEST_SPEC, buildSet } from "@/lektion/domain/lektion/tasks";
import { Ar } from "@/lektion/ui/parts";
import { PhaseFrame } from "../PhaseFrame";
import { TaskRunner } from "../TaskRunner";
import { Colored, Explode } from "../visuals";
import { useLesson } from "../LessonContext";

const LEVELS: { id: SelfLevel; label: string; sub: string }[] = [
  { id: "none", label: "Bei null", sub: "Ich kenne noch keine arabischen Buchstaben." },
  { id: "letters", label: "Einzelne Buchstaben", sub: "Ich erkenne ein paar Zeichen, lese aber nicht." },
  { id: "reading", label: "Ich kann etwas lesen", sub: "Ich lese langsam, brauche aber Sicherheit." },
];

export function P1Orientierung({ onFinish }: { onFinish(): void }) {
  const { s, dispatch } = useLesson();
  const pretest = useMemo(() => buildSet(PRETEST_SPEC, Math.random, false), []);
  const pretestDone = Object.keys(s.pretest).length >= PRETEST_SPEC.length;
  return (
    <PhaseFrame
      phase={1} labels={["Dein Weg", "Die Landkarte", "Dein Vorwissen"]}
      canNext={(s.steps[1] ?? 0) < 2 || (!!s.selfLevel && pretestDone)} finishLabel="Weiter zu Phase 2: Entdecken" onFinish={onFinish}
      why={<p className="muted">Ein Überblick vorab (Advanced Organizer) gibt deinem Gedächtnis Fächer, in die es neue Inhalte einsortieren kann. Du siehst erst das große Bild, dann die Details.</p>}
    >
      {(step) => step === 0 ? (
        <>
          <div className="stack">
            <h1>Arabisch lesen: die ersten vier Buchstaben</h1>
            <p className="muted">In etwa 45 Minuten lernst du Alif, Bā, Tā und Thā, drei Vokalzeichen und liest damit erste echte Wörter. Es gibt keine Noten, nur Rückmeldung.</p>
          </div>
          <section className="panel stack" aria-labelledby="goals"><h2 id="goals">Am Ende kannst du …</h2>
            <ul className="goals">
              <li>die Buchstaben <Ar size="body">ا ب ت ث</Ar> erkennen, benennen und schreiben,</li>
              <li><Ar size="body">ا</Ar> fachlich korrekt von den Konsonanten <Ar size="body">ب ت ث</Ar> unterscheiden,</li>
              <li>die Vokalzeichen Fatha, Kasra und Damma lesen,</li>
              <li>zwölf Silben und vier Wörter lesen, zum Beispiel <Ar size="body">بَاب</Ar> (bāb, „Tür“).</li>
            </ul>
          </section>
          <section className="stack" aria-labelledby="route"><h2 id="route">Sieben Stationen</h2>
            <ol className="stack" style={{ paddingLeft: 20, margin: 0 }}>
              {PHASES.map((p) => <li key={p.n}><b>{p.title}</b> <span className="muted">· ca. {p.minutes} Min · {p.method}</span></li>)}
            </ol>
          </section>
        </>
      ) : step === 1 ? (
        <>
          <div className="stack"><h1>Die Landkarte der Schrift</h1><p className="muted">So hängt alles zusammen, was du gleich lernst. Orange markiert den Stoff dieser Lektion.</p></div>
          <div className="map" role="img" aria-label="Landkarte: Wörter bestehen aus Silben. Silben bestehen aus Konsonantenbuchstaben mit Vokalzeichen. Alif ist ein Dehnungsbuchstabe.">
            <div className="lvl"><div className="node" data-hot="true"><Ar size="body">بَاب</Ar><b>Wort</b><small>Tür · bāb</small></div></div>
            <div className="arrow" aria-hidden>besteht aus ↓</div>
            <div className="lvl"><div className="node" data-hot="true"><Ar size="body">بَ · بِ · بُ</Ar><b>Silbe</b><small>ba · bi · bu</small></div></div>
            <div className="arrow" aria-hidden>besteht aus ↓</div>
            <div className="lvl">
              <div className="node" data-hot="true"><Ar size="body">ب ت ث</Ar><b>Konsonanten</b><small>b · t · th</small></div>
              <div className="node" data-hot="true"><Ar size="body">◌{MARK.fatha} ◌{MARK.kasra} ◌{MARK.damma}</Ar><b>Vokalzeichen</b><small>a · i · u (kurz)</small></div>
              <div className="node" data-hot="true"><Ar size="body">{ALIF}</Ar><b>Dehnungsbuchstabe</b><small>macht a lang: ā</small></div>
            </div>
            <div className="arrow" aria-hidden>später: weitere 24 Buchstaben, Formen am Wortanfang/-ende, mehr Zeichen</div>
          </div>
          <section className="stack" aria-labelledby="facts"><h2 id="facts">Drei Dinge vorab</h2>
            <div className="fact"><b>1</b><p><strong>Arabisch liest man von rechts nach links.</strong> Die Zahlen zeigen die Reihenfolge in <Ar size="body">بَاب</Ar>:</p></div>
            <Explode letters={["ب", ALIF, "ب"]} />
            <p className="muted" style={{ fontSize: 13, textAlign: "center" }}>Hier getrennt dargestellt. In der Schrift hängen die meisten Buchstaben zusammen.</p>
            <div className="fact"><b>2</b><p><strong>Geschrieben werden vor allem Konsonanten.</strong> Kurze Vokale stehen als kleine Zeichen über oder unter dem Buchstaben, so wie in <Colored text="بَ" size="body" />. Im Alltag werden sie oft weggelassen, zum Lernen brauchst du sie.</p></div>
            <div className="fact"><b>3</b><p><strong>Buchstaben ändern ihre Form</strong> je nach Position im Wort. Die Grundform bleibt erkennbar. Das üben wir in späteren Lektionen.</p></div>
          </section>
        </>
      ) : (
        <>
          <div className="stack"><h1>Was bringst du mit?</h1><p className="muted">Beides dient nur dir: Am Ende vergleichst du „vorher“ und „nachher“. Raten ist nicht nötig, „Weiß ich nicht“ ist eine gute Antwort.</p></div>
          <fieldset className="stack" style={{ border: 0, padding: 0, margin: 0 }}>
            <legend className="eyebrow" style={{ marginBottom: 8 }}>Deine Erfahrung</legend>
            <div className="options opts3" role="radiogroup" aria-label="Deine Erfahrung mit arabischer Schrift">
              {LEVELS.map((l) => (
                <button key={l.id} role="radio" aria-checked={s.selfLevel === l.id} className="opt" data-state={s.selfLevel === l.id ? "right" : undefined} onClick={() => dispatch({ t: "selfLevel", level: l.id })}>
                  <span><b>{l.label}</b><br /><small className="muted">{l.sub}</small></span>
                </button>
              ))}
            </div>
          </fieldset>
          <section className="stack" aria-labelledby="pt"><h2 id="pt">Vier Fragen vorab</h2>
            {pretestDone
              ? <p className="notice" role="status">Gespeichert. Gleich geht es los. Ob du etwas wusstest oder nicht: Genau dafür ist diese Lektion da.</p>
              : <TaskRunner tasks={pretest} feedback="deferred" allowUnknown label="Vorab-Frage" onDone={(rs) => rs.forEach((r) => dispatch({ t: "pretest", itemId: r.itemId, value: r.chosen === "unknown" ? "unknown" : r.correctness === "right" ? "right" : "wrong" }))} />}
          </section>
        </>
      )}
    </PhaseFrame>
  );
}
